"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { z } from "zod";
import { api } from "~/trpc/react";

export default function SignUpForm() {
  const createNewAccountMutation = api.main.createNewAccount.useMutation();
  const router = useRouter();

  // submit handler
  const handleSignUpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const rawUsername = e.currentTarget.username.value;
    const username = z.string().parse(rawUsername);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const rawPassword = e.currentTarget.password.value;
    const password = z.string().parse(rawPassword);

    // make a request to the RPC endpoint to actually create the user
    const res = await createNewAccountMutation.mutateAsync({
      username: username,
      password: password,
    });

    if (!res.success) {
      // error creating new account, let's show a toast saying to use a unique username
      toast.error("Username already taken, please try another one");
    } else {
      // username was created successfully, let's show a toast saying to log in
      toast.success(
        "Account created successfully, taking you to the login page",
      );

      // wait 1 second before redirecting to the login page
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // then do the redirect
      router.push("/login");
    }
  };

  // let the user sign up by entering their username and desired password, in a simple form, using tailwind for styling

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
      <h1 className="mb-4 text-3xl font-bold">Sign Up</h1>
      <form onSubmit={handleSignUpSubmit} className="flex w-full flex-col">
        <label htmlFor="username" className="mb-2">
          Username
        </label>
        <input
          type="text"
          name="username"
          id="username"
          className="mb-4 rounded border border-gray-300 p-2 text-black"
        />
        <label htmlFor="password" className="mb-2">
          Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          className="mb-4 rounded border border-gray-300 p-2 text-black"
        />
        <button
          type="submit"
          className="rounded bg-purple-600 py-2 font-bold text-white shadow-lg transition duration-200 hover:bg-purple-700 hover:shadow-xl"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
