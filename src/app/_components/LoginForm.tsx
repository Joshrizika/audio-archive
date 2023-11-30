"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { z } from "zod";
import { api } from "~/trpc/react";
import { useCookies } from "react-cookie";

export default function LoginForm() {
  const loginMutation = api.main.login.useMutation();
  const router = useRouter();

  console.log("inside LoginForm");

  // cookies set up based on https://www.npmjs.com/package/react-cookie
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cookies, setCookie, removeCookie] = useCookies(["authToken"]);

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
      const authToken = res.authToken;

      // use react-cookie to store the new auth token
      setCookie("authToken", authToken, {
        path: "/",
        // cookie should last 1 day
        maxAge: 60 * 60 * 24,
      });

      toast.success("Logged in successfully, taking you to the home page");

      // wait 1 second before redirecting to the login page
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // then do the redirect
      console.log("hello");
      router.push("/");
    }
  };

  // let the user log in by entering their username and password, in a simple form, using tail for styling

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
      <h1 className="mb-4 text-3xl font-bold">Log In</h1>
      <form
        // onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        //   alert("hello");
        //   e.preventDefault();
        // }}
        onSubmit={handleLoginSubmit}
        className="flex w-full flex-col"
        action="#"
      >
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
          // onclick alert "from submit button"
          // onClick={() => {
          //   alert("from submit button");
          // }}
          className="rounded bg-purple-600 p-2 text-white transition-all hover:bg-purple-700"
        >
          Log In
        </button>
      </form>
    </div>
  );
}
