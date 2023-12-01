"use client";

import React, { useState } from "react";
import generateRandomString from "~/lib/generateRandomString";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { z } from "zod";
import { api } from "~/trpc/react";
import { useCookies } from "react-cookie";

const UploadForm = () => {
  const uploadMutation = api.main.upload.useMutation();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const [base64String, setBase64String] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cookies, setCookie, removeCookie] = useCookies(["authToken"]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const STORE_PATH = "src/server/api/opt/audio-archive-store";

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      const randomString = generateRandomString();
      const filepath = `${STORE_PATH}/${randomString}.mp3`;

      const authToken = z.string().parse(cookies.authToken);

      const base64file = await convertFileToBase64(selectedFile);

      console.log("Uploading file:", selectedFile);

      const res = await uploadMutation.mutateAsync({
        authToken: authToken,
        filePath: filepath,
        base64file: base64file,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
      });
      if (res.success) {
        toast.success("File uploaded successfully");
        router.push("/");
      } else {
        toast.error("Upload failed");
      }
    }
  };

  //

  return (
    <div className="my-4">
      {" "}
      {/* Adjust margin as needed */}
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <label className="mb-2 text-white">Choose an audio file (MP3)</label>
        <input
          type="file"
          accept="audio/mp3"
          onChange={handleFileChange}
          className="mb-2 rounded-md border border-gray-300 p-2"
        />
        <button
          type="submit"
          className="rounded-md bg-purple-500 p-2 text-white hover:bg-purple-700"
        >
          Upload
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
