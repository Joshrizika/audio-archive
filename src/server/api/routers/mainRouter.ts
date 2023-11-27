import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

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
      // do the account creation stuff
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
});
