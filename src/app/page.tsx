"use client";

import { useCookies } from "react-cookie";
import { api } from "~/trpc/react";

export default function Home() {
  const [cookies, setCookie, removeCookie] = useCookies(["authToken"]);

  const checkLoginQuery = api.main.checkLogin.useQuery({
    authToken: typeof cookies.authToken === "string" ? cookies.authToken : "",
  });

  if (!checkLoginQuery.data) {
    return <p>Loading...</p>;
  }

  const isLoggedIn = checkLoginQuery.data.isValid;

  return (
    <>
      <nav className="flex items-center justify-between bg-gradient-to-r from-[#2e026d] to-[#15162c] px-8 py-4 text-white">
        {isLoggedIn && (
          <>
            <div className="text-xl font-bold">Audio Archive</div>
            <div>
              <a
                href="/"
                className="mx-2 rounded bg-purple-500 px-4 py-2 font-bold text-white hover:bg-purple-700"
              >
                Home
              </a>
              <a
                href="/upload"
                className="mx-2 rounded bg-purple-500 px-4 py-2 font-bold text-white hover:bg-purple-700"
              >
                Upload Audio
              </a>
              <a
                href="/account"
                className="mx-2 rounded bg-purple-500 px-4 py-2 font-bold text-white hover:bg-purple-700"
              >
                Account
              </a>
            </div>{" "}
          </>
        )}
        {/* show login options if user is not logged in */}
        {!isLoggedIn && (
          <div>
            <a
              href="/login"
              className="mx-2 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
            >
              Log In
            </a>
            <a
              href="/signup"
              className="mx-2 rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700"
            >
              Create Account
            </a>
          </div>
        )}
      </nav>

      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        isLoggedIn: {isLoggedIn ? "true" : "false"}
        // Existing content
        <h1 className="mb-4 text-3xl font-bold">Home</h1>
        <p className="mb-4">
          This is the home page. You can view audio files you have uploaded.
        </p>
      </main>
    </>
  );
}
