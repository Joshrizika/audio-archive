"use client";

import { api } from "~/trpc/react";
import { useCookies } from "react-cookie";
import { z } from "zod";
import { useEffect, useState } from "react";

interface FileData {
  createdAt: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  id: number;
  userId: number;
}

export default function AudioForm() {
  const audioMutation = api.main.audio.useMutation();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cookies, setCookie, removeCookie] = useCookies(["authToken"]);
  const authToken = z.string().parse(cookies.authToken);

  const [files, setFiles] = useState<FileData[]>([]);

  useEffect(() => {
    // Perform the mutation inside useEffect
    audioMutation
      .mutateAsync({
        authToken: authToken,
      })
      .then((res) => {
        if (!res.success) {
          // Handle error
          console.error("Mutation was not successful");
        } else {
          const formattedFiles = res.files.map((file) => ({
            ...file,
            createdAt: file.createdAt.toString(), // Convert Date to string
          }));
          setFiles(formattedFiles);
          console.log(res.files);
          // Handle successful response
        }
      })
      .catch((error) => {
        // Handle error
        console.error("Error during mutation:", error);
      });
  }, [authToken]);

  return (
    <div className="container mx-auto p-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="mb-4 rounded-lg border border-white/10 bg-white/10 p-4 shadow-lg backdrop-blur-md"
        >
          <div className="mb-2 text-lg font-semibold text-white">
            {file.fileName}
          </div>
          <div className="mb-1 text-sm text-gray-300">
            <strong>Size:</strong> {file.fileSize} bytes
          </div>
          <div className="text-sm text-gray-300">
            <strong>Created At:</strong> {file.createdAt}
          </div>
        </div>
      ))}
    </div>
  );
}
