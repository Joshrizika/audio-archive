import { db } from "~/server/db";

export default async function getUserByAuthToken(authToken: string) {
  if (authToken.length < 8) {
    return null;
  }

  const user = await db.user.findFirst({
    where: {
      authToken,
    },
  });

  if (!user) {
    return null;
  }

  return user;
}
