import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { env } from '~/env';

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
    .mutation(async ({ ctx, input }) => {
      // Attempt to find a user with the provided username and password
      const user = await db.user.findFirst({
        where: {
          username: input.username,
          password: input.password,
        },
      });

      // Check if a user was found with the provided credentials
      if (user) {
        // Create a JWT token that expires in 1 day
        const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
          expiresIn: "1d",
        });

        // Serialize the cookie
        const cookie = serialize("authToken", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24, // 1 day
          sameSite: "lax", // or 'strict'
          path: "/",
        });

        ctx.res.setHeader("Set-Cookie", cookie);

        // A user with the provided credentials exists
        return {
          success: true,
        };
      } else {
        // No user found, or password does not match
        return {
          success: false,
        };
      }
    }),
});
