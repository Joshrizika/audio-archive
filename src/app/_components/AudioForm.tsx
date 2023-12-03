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
  isEditing?: boolean;
}

export default function AudioForm() {
  const audioMutation = api.main.audio.useMutation();
  const deleteAudioMutation = api.main.deleteAudio.useMutation();
  const editAudioMutation = api.main.editAudio.useMutation();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cookies, setCookie, removeCookie] = useCookies(["authToken"]);
  const authToken = z.string().parse(cookies.authToken);

  const [files, setFiles] = useState<FileData[]>([]);
  const [updatedName, setUpdatedName] = useState<string>(""); // State to store the updated file name

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

  const toggleEditing = (fileId: number, currentName: string) => {
    const nameWithoutExtension = currentName.replace(/\.mp3$/, "");

    // Exit edit mode for any file that is currently being edited
    // and enter edit mode for the clicked file
    setFiles((currentFiles) =>
      currentFiles.map((file) => {
        if (file.id === fileId) {
          // Toggle the isEditing state for the clicked file
          return { ...file, isEditing: !file.isEditing };
        } else {
          // Make sure no other file is in editing mode
          return { ...file, isEditing: false };
        }
      }),
    );

    // If the clicked file is not currently being edited, set its name to the state
    if (!files.find((file) => file.id === fileId)?.isEditing) {
      setUpdatedName(nameWithoutExtension);
    }
  };

  const handleNameChange = async (fileId: number) => {
    const newNameWithExtension = `${updatedName}.mp3`;
    try {
      // Await the API call
      const response = await editAudioMutation.mutateAsync({
        fileId: fileId,
        fileName: newNameWithExtension,
      });
      if (response.success) {
        setFiles((prevFiles) =>
          prevFiles.map((file) =>
            file.id === fileId
              ? { ...file, fileName: updatedName, isEditing: false }
              : file,
          ),
        );
      } else {
        toast.error("Failed to update the file name.");
      }
    } catch (error) {
      console.error("Error editing file name:", error);
      toast.error("Failed to update the file name.");
    }

    // Update the isEditing state regardless of success or failure
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === fileId
          ? { ...file, isEditing: false, fileName: newNameWithExtension }
          : file,
      ),
    );
  };

  useEffect(() => {
    // Perform the mutation inside useEffect
    audioMutation
      .mutateAsync({ authToken: authToken })
      .then((res) => {
        if (res.success) {
          const formattedFiles = res.files.map((file) => ({
            ...file,
            createdAt: formatDate(file.createdAt.toString()),
            fileData: file.fileData
              ? base64ToBlobUrl(file.fileData, "audio/wav")
              : undefined,
            isEditing: false, // Set isEditing to false initially
          }));
          setFiles(formattedFiles);
        } else {
          console.error("Mutation was not successful");
        }
      })
      .catch((error) => {
        console.error("Error during mutation:", error);
      });
  }, [authToken]);

  return (
    <div className="container mx-auto p-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="mb-4 flex flex-col justify-between rounded-lg border border-white/10 bg-white/10 p-4 shadow-lg md:flex-row md:items-center"
        >
          <div className="flex flex-col items-center md:items-start">
            <div className="mb-2">
              {file.isEditing ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleNameChange(file.id)
                      .then(() => {
                        toast.success("File name updated successfully");
                      })
                      .catch((error) => {
                        console.error("Error updating file name:", error);
                      });
                  }}
                >
                  <input
                    type="text"
                    value={updatedName}
                    onChange={(e) => setUpdatedName(e.target.value)}
                    className="mr-2 text-lg font-semibold text-black"
                  />
                  <button
                    type="submit"
                    className="ml-2 rounded bg-yellow-500 px-3 py-1 text-center text-xs text-white hover:bg-yellow-700"
                  >
                    Save
                  </button>
                </form>
              ) : (
                <div className="flex items-center">
                  <div className="text-lg font-semibold text-white">
                    {file.fileName}
                  </div>
                  <button
                    onClick={() => {
                      setUpdatedName(file.fileName.replace(/\.mp3$/, "")); // Initialize the temporary state with the current file name
                      toggleEditing(file.id, file.fileName); // Enter edit mode
                    }}
                    className="ml-2 rounded bg-yellow-500 px-3 py-1 text-center text-xs text-white hover:bg-yellow-700"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-300">
              <strong>Size:</strong> {formatFileSize(file.fileSize)}
            </div>
            <div className="text-sm text-gray-300">
              <strong>Uploaded:</strong> {file.createdAt}
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center md:mt-0 md:flex-row md:space-x-2">
            <audio
              controls
              title={file.fileName}
              controlsList="nodownload"
              className="rounded-lg bg-white/50 p-2"
            >
              <source src={file.fileData} type="audio/mpeg" />
            </audio>

            <div className="mt-2 flex flex-col items-center space-y-2 md:mt-0">
              <button
                onClick={() => handleDownload(file.fileData, file.fileName)}
                className="rounded bg-blue-500 px-3 py-1 text-center text-xs text-white hover:bg-blue-700"
              >
                Download
              </button>
              <button
                onClick={() => handleDelete(file.id, file.filePath)}
                className="rounded bg-red-500 px-3 py-1 text-center text-xs text-white hover:bg-red-700"
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
