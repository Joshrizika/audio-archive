"use client";

export default function Home() {
  return (
    <>
      <nav className="flex items-center justify-between bg-gradient-to-r from-[#2e026d] to-[#15162c] py-4 px-8 text-white">
        <div className="font-bold text-xl">
          Audio Archive
        </div>
        <div>
          <a href="/" className="mx-2 px-4 py-2 rounded bg-purple-500 hover:bg-purple-700 text-white font-bold">
            Home
          </a>
          <a href="/upload" className="mx-2 px-4 py-2 rounded bg-purple-500 hover:bg-purple-700 text-white font-bold">
            Upload Audio
          </a>
          <a href="/account" className="mx-2 px-4 py-2 rounded bg-purple-500 hover:bg-purple-700 text-white font-bold">
            Account
          </a>
        </div>
        <div>
          <a href="/login" className="mx-2 px-4 py-2 rounded bg-blue-500 hover:bg-blue-700 text-white font-bold">
            Log In
          </a>
          <a href="/signup" className="mx-2 px-4 py-2 rounded bg-green-500 hover:bg-green-700 text-white font-bold">
            Create Account
          </a>
        </div>
      </nav>
      
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        // Existing content
        <h1 className="mb-4 text-3xl font-bold">Home</h1>
        <p className="mb-4">
          This is the home page. You can view audio files you have uploaded.
        </p>
      </main>
    </>
  );
}



