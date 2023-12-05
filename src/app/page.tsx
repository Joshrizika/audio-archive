"use client";

import { useCookies } from "react-cookie";
import { api } from "~/trpc/react";
import { z } from "zod";
import AudioForm from "~/app/_components/AudioForm";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cookies, setCookie, removeCookie] = useCookies(["authToken"]);

  const checkLoginQuery = api.main.checkLogin.useQuery({
    authToken: typeof cookies.authToken === "string" ? cookies.authToken : "",
  });

  const logoutMutation = api.main.logout.useMutation();

  const handleLogout = () => {
    // Call the logout mutation
    const authToken = z.string().parse(cookies.authToken);

    logoutMutation.mutate(
      { authToken: authToken },
      {
        onSuccess: () => {
          // Remove the cookie
          removeCookie("authToken");

          // Display success message
          toast.success("Logged out successfully");

          // Redirect to the login page
          router.push("/"); // Assuming you have the router from `useRouter`
        },
        onError: (error) => {
          // Handle error
          console.error("Logout failed:", error);
          toast.error("Logout failed. Please try again.");
        },
      },
    );
  };

  if (checkLoginQuery.isLoading) {
    console.log("checkLoginQuery from isLoading", checkLoginQuery);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-purple-500"></div>
      </div>
    );
  }

  if (checkLoginQuery.isError) {
    console.log("checkLoginQuery from isError", checkLoginQuery);

    alert(`Error: ${JSON.stringify(checkLoginQuery.error)}`);
    return <p>Error!</p>;
  }

  if (!checkLoginQuery.isFetched) {
    console.log("checkLoginQuery from isFetched", checkLoginQuery);
    return <p>Not fetched yet</p>;
  }

  const isLoggedIn = checkLoginQuery.data.isValid;
  const user = checkLoginQuery.data.user;

  return (
    <>
      <nav className="flex items-center justify-between bg-gradient-to-r from-[#2e026d] to-[#15162c] px-8 py-4 text-white">
        <div className="text-xl font-bold">Audio Archive</div>
        {isLoggedIn && (
          <>
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
                onClick={handleLogout}
                className="mx-2 rounded bg-purple-500 px-4 py-2 font-bold text-white hover:bg-purple-700"
              >
                Log Out
              </a>
            </div>{" "}
          </>
        )}
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

      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] pt-10 text-white">
        <h1 className="mb-4 text-3xl font-bold">Audio Files</h1>
        {isLoggedIn && user && (
          <>
            <h1>Welcome {user.username}! Here are your saved audio files.</h1>
            <AudioForm />
          </>
        )}
        {!isLoggedIn && (
          <>
            <h1>Log in to view your audio files.</h1>{" "}
          </>
        )}
      </main>
    </>
  );
}
