import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import generateRandomString from "~/lib/generateRandomString";
import getUserByAuthToken from "~/lib/getUserByAuthToken";

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
      try {
        await db.user.create({
          data: {
            username: input.username,
            password: input.password,
          },
        });
      } catch (error) {
        return {
          success: false,
        };
      }

      // return the fact that the account was created
      return {
        success: true,
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
});
