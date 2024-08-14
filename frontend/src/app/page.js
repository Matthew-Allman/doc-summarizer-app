"use client";

import { useEffect, useState, useRef } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";

import { useGlobalContext } from "./authContext";
import backendAPI from "@/api/backendInstance";
import RenderSummary from "./RenderSummary";

import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import mammoth from "mammoth";

import ClockLoader from "react-spinners/ClockLoader";

GlobalWorkerOptions.workerSrc =
  "https://unpkg.com/pdfjs-dist@2.10.377/build/pdf.worker.min.js";

export default function Home() {
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [activeTab, setActiveTab] = useState(false);
  const [activeFile, setActiveFile] = useState({});

  const fileInputRef = useRef(null);

  const { userInfo, files, setFiles } = useGlobalContext();
  const { userID } = userInfo;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDate = (date) => {
    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(date).toLocaleDateString("en-US", options);
  };

  const handleFileChange = async (event) => {
    const selectedFiles = Array.from(event.target.files);

    if (Array.isArray(selectedFiles)) {
      const newFiles = [];

      for (const file of selectedFiles) {
        if (
          file.size <= 10000000 &&
          files.every((item) => item.name != file.name)
        ) {
          file.thumbnail = await generateThumbnail(file);

          newFiles.push(file);
        } else {
          if (file.size > 10000000) {
            alert("File too large: " + file.name);
          } else {
            alert(file.name + " is already added.");
          }
        }
      }

      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();

    const droppedFile = Array.from(event.dataTransfer.files);

    const allowedExtensions = /(\.pdf|\.docx|\.txt)$/i;

    if (Array.isArray(droppedFile)) {
      const newFiles = [];

      for (const file of droppedFile) {
        if (
          file.size <= 10000000 &&
          files.every((item) => item.name != file.name) &&
          allowedExtensions.test(file.name)
        ) {
          file.thumbnail = await generateThumbnail(file);

          newFiles.push(file);
        } else {
          if (file.size > 10000000) {
            alert("File too large: " + file.name);
          } else if (!allowedExtensions.test(file.name)) {
            alert("Allowed file extensions are PDF, DOCX, TXT");
          } else {
            alert(file.name + " is already added.");
          }
        }
      }

      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const generateThumbnail = async (file) => {
    try {
      const defaultStyles = `
        display: flex;
        align-items: center;
        justify-content: center;
        width: 150px;
        height: 200px;
        background-color: #f0f0f0;
        border: 1px solid #ddd;
        overflow: hidden;
        padding: 10px;
        text-align: center;
      `;

      if (file?.type === "application/pdf") {
        const pdf = await getDocument(URL.createObjectURL(file)).promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 0.2 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        return canvas.toDataURL();
      } else if (file?.name?.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = `<div style="${defaultStyles}">${result.value}</div>`;

        return { html };
      } else if (file?.type === "text/plain" || file?.name?.endsWith(".txt")) {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result;
          const html = `<div style="${defaultStyles}"><p>${text}</p></div>`;

          return { html };
        };
        reader.readAsText(file);
      } else {
        // setThumbnail(null);
        return null;
      }
    } catch (e) {
      alert("Something went wrong while parsing your files.");
    }
  };

  const generateThumbnailFromURI = async (fileUri) => {
    try {
      const defaultStyles = `
        display: flex;
        align-items: center;
        justify-content: center;
        width: 150px;
        height: 200px;
        background-color: #f0f0f0;
        border: 1px solid #ddd;
        overflow: hidden;
        padding: 10px;
        text-align: center;
      `;

      // Fetch the file from the URI
      const response = await fetch(fileUri);
      const blob = await response.blob();
      const file = new File([blob], "file", { type: blob.type });

      if (file?.type === "application/pdf") {
        const pdf = await getDocument(URL.createObjectURL(file)).promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 0.2 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        return canvas.toDataURL();
      } else if (file?.name?.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = `<div style="${defaultStyles}">${result.value}</div>`;

        return { html };
      } else if (file?.type === "text/plain" || file?.name?.endsWith(".txt")) {
        const text = await blob.text();
        const html = `<div style="${defaultStyles}"><p>${text}</p></div>`;

        return { html };
      } else {
        return null;
      }
    } catch (e) {
      // alert("Something went wrong while parsing your file.");
    }
  };

  const handleRightClick = (event, file) => {
    event.preventDefault();

    setActiveFile(file);

    setContextMenuPosition({ x: event.pageX, y: event.pageY });
    setContextMenuVisible(true);
  };

  const handleDeleteFile = async () => {
    setContextMenuVisible(false);
    setSummary("");

    const index = files.findIndex((item) => item.name == activeFile.name);
    files.splice(index, 1);

    try {
      if (activeFile.key) {
        await backendAPI.post("/delete-file", { userID, key: activeFile.key });
        alert("File deleted");
      }
    } catch (e) {
      console.log(e);

      alert("Could not delete file.");
    }

    setActiveFile({});
  };

  const closeContextMenu = () => {
    setContextMenuVisible(false);
  };

  const handleDownload = (file) => {
    if (file) {
      const url = file?.uri || URL.createObjectURL(file);
      const a = document.createElement("a");

      a.href = url;
      a.download = file.name;

      document.body.appendChild(a);

      a.click();

      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    }
  };

  const handleSummarize = async (file, index) => {
    setLoading(true);
    setActiveFile(file);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("userID", userID);

      const response = await backendAPI.post("/summarize", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      file.summarizedText = response.data.summary;
      file.key = response.data.s3BucketKey;

      files.splice(index, 1, file);

      alert("File summarized successfully!");
    } catch (error) {
      alert("Failed to summarize the file. Please try again.");
    }

    setLoading(false);
  };

  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.log("nah");
    }
  };

  const getThumbnails = async () => {
    const newFiles = [];

    for (const file of files) {
      if (file.thumbnail) {
      } else {
        file.thumbnail = await generateThumbnailFromURI(file.uri);
      }

      newFiles.push(file);
    }

    setFiles(newFiles);
  };

  useEffect(() => {
    if (files.length > 0 && files.some((item) => !item.thumbnail)) {
      getThumbnails();
    }
  }, [files]);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-24 gap-y-8"
      onDrop={handleDrop}
      onDragOver={(event) => event.preventDefault()}
      onClick={closeContextMenu}
    >
      <div className="w-full h-auto flex items-center justify-center flex-col gap-y-1">
        <h1 className="text-[30px] font-semibold text-gray-700 capitalize">
          {files.length > 0
            ? "Great! Now you can start summarizing"
            : "Get Started by Uploading a Document"}
        </h1>
        <h4 className="text-[20px] font-medium text-gray-600 lg:w-[50%] text-center leading-tight">
          {files.length > 0
            ? 'Now, click the "Summarize" button to get an AI-generated summary of your file. Right click a row to delete that file.'
            : "Drag and drop a file or click to browse your computer. Supported file types are PDF, DOCX, and TXT."}
        </h4>
      </div>
      {files.length > 0 ? (
        <div className=" w-full h-auto flex flex-col items-center justify-center gap-y-4">
          {files.map((file, index) => (
            <div
              key={index}
              className="mt-2 w-full lg:w-[70%] h-auto rounded-lg border-2 border-gray-400 bg-white drop-shadow-xl flex flex-row items-center justify-between p-3 hover:drop-shadow-2xl transition duration-300"
              onContextMenu={(e) => handleRightClick(e, file)}
            >
              <div className="flex-[1.5] h-full flex flex-row items-start justify-start gap-x-4">
                {!file.thumbnail?.html && (
                  <img
                    src={file.thumbnail}
                    alt="Thumbnail"
                    className="w-auto h-auto"
                  />
                )}
                {file.thumbnail?.html && (
                  <div
                    dangerouslySetInnerHTML={{ __html: file.thumbnail.html }}
                  ></div>
                )}
                <div className="w-auto h-full flex flex-col items-start justify-start gap-y-3 pt-1">
                  <p className="text-[18px] leading-tight font-medium">
                    {file.name}
                  </p>
                  <p className="text-[15px] leading-tight">
                    <span className=" font-medium">Size:</span>{" "}
                    {formatFileSize(file.size)}
                  </p>
                  <p className="text-[15px] leading-tight">
                    <span className=" font-medium">Last Modified:</span>{" "}
                    {formatDate(file.lastModified)}
                  </p>
                  <p className="text-[15px] leading-tight">
                    <span className=" font-medium">Summarized:</span>{" "}
                    {file.summarizedText ? "True" : "False"}
                  </p>
                </div>
              </div>
              <div className="flex-1 h-full flex flex-col items-end justify-center gap-y-4">
                {loading && activeFile.name == file.name ? (
                  <span className="w-[200px] h-[50px] rounded-md bg-deepBlue text-white font-medium flex items-center justify-center">
                    <ClockLoader size={35} color="#fff" />
                  </span>
                ) : (
                  loading &&
                  !file.summarizedText && (
                    <span className="w-[200px] h-[50px] rounded-md bg-deepBlue text-white font-medium flex items-center justify-center">
                      Waiting...
                    </span>
                  )
                )}

                {file.summarizedText && (
                  <button
                    onClick={() => {
                      setActiveFile(file);
                      setActiveTab(true);
                    }}
                    className="w-[200px] h-[50px] rounded-md bg-blue hover:bg-deepBlue transition duration-300 text-white font-medium"
                  >
                    View Summary
                  </button>
                )}

                {!loading && !file.summarizedText && (
                  <button
                    onClick={() => handleSummarize(file, index)}
                    className="w-[200px] h-[50px] rounded-md bg-blue hover:bg-deepBlue transition duration-300 text-white font-medium"
                  >
                    Summarize
                  </button>
                )}

                <button
                  onClick={() => handleDownload(file)}
                  className="px-3 h-[50px] rounded-md border-2 border-blue text-black hover:bg-gray-200 transition duration-300 font-medium"
                >
                  Download
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={handleFileInputClick}
            className="w-[200px] h-[50px] rounded-md bg-blue text-white font-medium hover:bg-deepBlue transition duration-300 mt-4"
          >
            Upload More Files
          </button>
        </div>
      ) : (
        <label
          htmlFor="file-upload"
          className="mx-auto lg:w-[50%] w-[90%] lg:h-[450px] h-full bg-white rounded-md drop-shadow-lg hover:drop-shadow-2xl transition duration-300 cursor-pointer flex flex-col items-center justify-center"
        >
          <input
            onChange={handleFileChange}
            id="file-upload"
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            multiple={true}
          />
          <div className="w-[100px] h-[100px] rounded-full bg-[#ADD8E6] flex items-center justify-center">
            <FaCloudUploadAlt size={40} className="text-white" />
          </div>
          <p className="mt-2 text-gray-600">
            Click or Drag to Upload (Max 10MB each)
          </p>
        </label>
      )}

      <input
        ref={fileInputRef}
        onChange={handleFileChange}
        type="file"
        accept=".pdf,.docx,.txt"
        className="hidden"
        multiple={true}
      />

      {contextMenuVisible && (
        <div
          style={{
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
          }}
          className="absolute bg-white shadow-lg rounded-md p-2 z-50"
        >
          <button
            onClick={handleDeleteFile}
            className="text-red-500 hover:bg-red-100 px-4 py-2 rounded-md"
          >
            Delete file
          </button>
        </div>
      )}

      {activeTab && (
        <RenderSummary
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          file={activeFile}
          handleDeleteFile={handleDeleteFile}
        />
      )}
    </main>
  );
}
