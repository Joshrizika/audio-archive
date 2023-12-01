"use client";

import LoginForm from "../_components/LoginForm";

export default function LoginPage() {
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
        <LoginForm />
      </main>      
    </>
  );
}
