"use client";

import UploadForm from "../_components/UploadForm";
import { useCookies } from "react-cookie";
import { api } from "~/trpc/react";

export default function UploadPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cookies, setCookie, removeCookie] = useCookies(["authToken"]);

  const checkLoginQuery = api.main.checkLogin.useQuery({
    authToken: typeof cookies.authToken === "string" ? cookies.authToken : "",
  });

  if (checkLoginQuery.isError) {
    alert(`Error: ${JSON.stringify(checkLoginQuery.error)}`);
    return <p>Error!</p>;
  }

  if (checkLoginQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-purple-500"></div>
      </div>
    );
  }

  if (!checkLoginQuery.isFetched) {
    return <p>Not fetched yet</p>;
  }

  const user = checkLoginQuery.data.user;
  console.log(user);
  return (
    <>
      <nav className="flex items-center justify-between bg-gradient-to-r from-[#2e026d] to-[#15162c] px-8 py-4 text-white">
        <div className="text-xl font-bold">Audio Archive</div>
        <div>
          <a
            href="/"
            className="mx-2 rounded bg-purple-500 px-4 py-2 font-bold text-white hover:bg-purple-700"
          >
            Home
          </a>
        </div>{" "}
      </nav>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <UploadForm /> 
      </main>
    </>
  );
}
