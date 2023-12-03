"use client";

import { api } from "~/trpc/react";
import { useCookies } from "react-cookie";
import { z } from "zod";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface FileData {
  createdAt: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  id: number;
  userId: number;
  fileData?: string;
}

export default function AudioForm() {
  const audioMutation = api.main.audio.useMutation();
  const deleteAudioMutation = api.main.deleteAudio.useMutation();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cookies, setCookie, removeCookie] = useCookies(["authToken"]);
  const authToken = z.string().parse(cookies.authToken);

  const [files, setFiles] = useState<FileData[]>([]);

  function base64ToBlobUrl(
    base64: string | undefined,
    mimeType: string,
  ): string {
    if (!base64) {
      // Handle the case where base64 string is undefined
      return "";
    }

    // Check if the base64 string is a data URL and extract the actual Base64 part
    const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;

    if (!base64Data) {
      // Handle the case where the actual Base64 data part is not found
      return "";
    }

    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    //set blob file name to fileName
    console.log("blob", blob);
    return URL.createObjectURL(blob);
  }

  function handleDelete(id: number, filePath: string) {
    deleteAudioMutation.mutate(
      {
        fileId: id,
        filePath: filePath,
      },
      {
        onSuccess: () => {
          // Handle success
          setFiles((currentFiles) =>
            currentFiles.filter((file) => file.id !== id),
          );
          toast.success("File deleted successfully");
        },
        onError: (error) => {
          // Handle error
          console.error("Delete failed:", error);
          toast.error("Delete failed. Please try again.");
        },
      },
    );
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1000) return bytes + " bytes";
    else if (bytes < 1000000) return (bytes / 1000).toFixed(1) + " KB";
    else if (bytes < 1000000000) return (bytes / 1000000).toFixed(1) + " MB";
    else return (bytes / 1000000000).toFixed(1) + " GB";
  }

  function handleDownload(fileData: string | undefined, fileName: string) {
    if (!fileData) {
      console.error("File data is undefined");
      toast.error("Error downloading file");
      return;
    }

    //download the file
    const link = document.createElement("a");
    link.href = fileData;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    toast.success("File downloaded successfully");
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

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
            createdAt: formatDate(file.createdAt.toString()), // Convert Date to string
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
          className="mb-4 flex flex-col items-center justify-between rounded-lg border border-white/10 bg-white/10 p-4 shadow-lg backdrop-blur-md md:flex-row md:items-center"
        >
          <div className="text-center md:text-left">
            <div className="mb-2 text-lg font-semibold text-white">
              {file.fileName}
            </div>
            <div className="mb-1 text-sm text-gray-300">
              <strong>Size:</strong> {formatFileSize(file.fileSize)}
            </div>
            <div className="text-sm text-gray-300">
              <strong>Uploaded:</strong> {file.createdAt}
            </div>
          </div>

          <div className="mt-2 flex flex-col items-center md:mt-0 md:flex-row md:space-x-2">
            <audio
              controls
              title={file.fileName}
              controlsList="nodownload"
              className="mb-2 rounded-lg bg-white/50 p-2 md:mb-0"
            >
              <source src={file.fileData} type="audio/mpeg" />
            </audio>

            <div className="flex flex-col items-center space-y-2 md:items-start">
              <button
                onClick={() => handleDownload(file.fileData, file.fileName)}
                className="rounded bg-blue-500 px-3 py-1 text-center text-xs text-white hover:bg-blue-700 md:min-w-[100px]"
              >
                Download
              </button>
              <button
                onClick={() => handleDelete(file.id, file.filePath)}
                className="rounded bg-red-500 px-3 py-1 text-center text-xs text-white hover:bg-red-700 md:min-w-[100px]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
