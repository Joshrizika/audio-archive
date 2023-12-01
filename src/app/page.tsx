"use client";

import { useCookies } from "react-cookie";
import { api } from "~/trpc/react";
import { z } from "zod";


export default function Home() {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cookies, setCookie, removeCookie] = useCookies(["authToken"]);

  const checkLoginQuery = api.main.checkLogin.useQuery({
    authToken: typeof cookies.authToken === "string" ? cookies.authToken : "",
  });

  const logoutMutation = api.main.logout.useMutation();

  const handleLogout = async () => {
    try {
      // Call the logout mutation
      const authToken = z.string().parse(cookies.authToken);
      logoutMutation.mutate({ authToken: authToken });

      // Remove the cookie
      removeCookie('authToken');

      // Redirect to the login page or refresh the page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  if (checkLoginQuery.isError) {
    alert(`Error: ${JSON.stringify(checkLoginQuery.error)}`);
    return <p>Error!</p>;
  }

  if (checkLoginQuery.isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500"></div>
  </div>;
  }

  if (!checkLoginQuery.isFetched) {
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
        {isLoggedIn && user && (
          <h1>Welcome {user.username}!</h1>
         )}
        
        <h1 className="mb-4 text-3xl font-bold">Home</h1>
        <p className="mb-4">
          This is the home page. You can view audio files you have uploaded.
        </p>
      </main>
    </>
  );
}
