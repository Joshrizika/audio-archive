import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import generateRandomString from "~/lib/generateRandomString";
import getUserByAuthToken from "~/lib/getUserByAuthToken";
import * as fs from "fs";

// user `query` for read-only requests, and `mutation` for write requests

export const mainRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  createNewAccount: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const newAuthToken = generateRandomString();
      try {
        await db.user.create({
          data: {
            username: input.username,
            password: input.password,
            authToken: newAuthToken,
          },
        });
      } catch (error) {
        return {
          success: false as const,
        };
      }

      // return the fact that the account was created
      return {
        success: true as const,
        authToken: newAuthToken,
      };
    }),

  login: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      // Attempt to find a user with the provided username and password
      const user = await db.user.findFirst({
        where: {
          username: input.username,
          password: input.password,
        },
      });

      // Check if a user was found with the provided credentials
      if (user) {
        // generate new auth token from 256 random bytes
        const newAuthToken = generateRandomString();

        // save the auth token in the database
        await db.user.update({
          where: {
            id: user.id,
          },
          data: {
            authToken: newAuthToken,
          },
        });

        return {
          success: true as const,
          authToken: newAuthToken,
        };
      } else {
        // No user found, or password does not match
        return {
          success: false as const,
        };
      }
    }),
  // take the authToken and return boolean to indicate whether it's currently valid
  checkLogin: publicProcedure
    .input(z.object({ authToken: z.string() }))
    .query(async function ({ input }) {
      const user = await getUserByAuthToken(input.authToken);
      if (user) {
        return {
          isValid: true,
          user: user,
        };
      } else {
        return {
          isValid: false,
        };
      }
    }),
  // logout mutation that removes the auth token (and sets it back to null)
  logout: publicProcedure
    .input(z.object({ authToken: z.string() }))
    .mutation(async function ({ input }) {
      const user = await getUserByAuthToken(input.authToken);
      if (user) {
        await db.user.update({
          where: {
            id: user.id,
          },
          data: {
            authToken: null,
          },
        });
      }
      return {
        success: true,
      };
    }),

  //upload mutation that that takes in a file and saves it to the database
  upload: publicProcedure
    .input(
      z.object({
        authToken: z.string(),
        filePath: z.string(),
        base64file: z.string(),
        fileName: z.string(),
        fileSize: z.number(),
      }),
    )
    .mutation(async function ({ input }) {
      console.log("authToken", input.authToken);
      console.log("filePath", input.filePath);
      console.log("fileName", input.fileName);
      console.log("fileSize", input.fileSize);

      const file: Buffer = Buffer.from(input.base64file, "base64");
      fs.writeFile(
        input.filePath,
        file,
        (err: NodeJS.ErrnoException | null) => {
          if (err) {
            console.error("Error writing file:", err);
          } else {
            console.log("File saved successfully");
          }
        },
      );

      const user = await getUserByAuthToken(input.authToken);
      if (user) {
        await db.audioFile.create({
          data: {
            fileName: input.fileName,
            fileSize: input.fileSize,
            filePath: input.filePath,
            userId: user.id,
          },
        });
      }
      return {
        success: true,
      };
    }),
  audio: publicProcedure
    .input(
      z.object({
        authToken: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      // Attempt to find a user with the provided username and password
      const user = await getUserByAuthToken(input.authToken);

      // Check if a user was found with the provided credentials
      if (user) {
        const files = await db.audioFile.findMany({
          where: {
            userId: user.id,
          },
        });
        const filePaths = files.map((file) => file.filePath);

        const fileDataPromises = filePaths.map((filePath) => {
          return new Promise<string>((resolve, reject) => {
            fs.readFile(filePath, (err, data) => {
              if (err) {
                reject(err);
              } else {
                const base64String = data.toString("base64");
                resolve(base64String);
              }
            });
          });
        });

        const fileData = await Promise.all(fileDataPromises);
        console.log("fileData", files);

        // Add fileData to files
        const filesWithData = files.map((file, index) => ({
          ...file,
          fileData: fileData[index],
        }));

        return {
          success: true as const,
          files: filesWithData,
        };
      } else {
        // No user found
        return {
          success: false as const,
        };
      }
    }),
  deleteAudio: publicProcedure
    .input(
      z.object({
        fileId: z.number(),
        filePath: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      fs.unlink(input.filePath, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });

      await db.audioFile.delete({
        where: {
          id: input.fileId,
        },
      });

      return {
        success: true as const,
      };
    }),
});
