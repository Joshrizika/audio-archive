"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { z } from "zod";
import { api } from "~/trpc/react";

export default function LoginPage() {
  const loginMutation = api.main.login.useMutation();
  const router = useRouter();

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const rawUsername = e.currentTarget.username.value;
    const username = z.string().parse(rawUsername);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const rawPassword = e.currentTarget.password.value;
    const password = z.string().parse(rawPassword);

    const res = await loginMutation.mutateAsync({
      username: username,
      password: password,
    });

    if (!res.success) {
      toast.error("Invalid login credentials, please try again");
    } else {
      toast.success("Logged in successfully, taking you to the home page");

      // wait 1 second before redirecting to the login page
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // then do the redirect
      router.push("/");
    }
  };

  // let the user log in by entering their username and password, in a simple form, using tailwind for styling

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
      <h1 className="mb-4 text-3xl font-bold">Log In</h1>
      <form onSubmit={handleLoginSubmit} className="flex w-full flex-col">
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
          className="rounded bg-purple-600 p-2 text-white transition-all hover:bg-purple-700"
        >
          Log In
        </button>
      </form>
    </div>
  );
}
