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
  fileData?: string;
}

function base64ToBlobUrl(base64: string | undefined, mimeType: string): string {
    if (!base64) {
      // Handle the case where base64 string is undefined
      return '';
    }
  
    // Check if the base64 string is a data URL and extract the actual Base64 part
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
  
    if (!base64Data) {
      // Handle the case where the actual Base64 data part is not found
      return '';
    }
  
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return URL.createObjectURL(blob);
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
            fileData: file.fileData
              ? base64ToBlobUrl(file.fileData, "audio/wav")
              : undefined,
          }));
          setFiles(formattedFiles);
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
          className="mb-4 flex items-center justify-between rounded-lg border border-white/10 bg-white/10 p-4 shadow-lg backdrop-blur-md"
        >
          <div className="flex-grow">
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
  
          <div className="ml-4">
            <audio controls className="rounded-lg bg-white/50 p-2">
              <source src={file.fileData} type="audio/wav" />
            </audio>
          </div>
        </div>
      ))}
    </div>
  );
  
}
