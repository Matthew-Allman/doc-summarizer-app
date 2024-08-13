"use client";

import { useEffect, useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";

import { useGlobalContext } from "./authContext";

import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import mammoth from "mammoth";

GlobalWorkerOptions.workerSrc =
  "https://unpkg.com/pdfjs-dist@2.10.377/build/pdf.worker.min.js";

export default function Home() {
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });

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

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      generateThumbnail(selectedFile);
      setFile(selectedFile);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const droppedFile = event.dataTransfer.files[0];

    const allowedExtensions = /(\.pdf|\.docx|\.txt)$/i;

    if (allowedExtensions.test(droppedFile?.name)) {
      generateThumbnail(droppedFile);
      setFile(droppedFile);
    } else {
      alert("Please upload a file with a .pdf, .docx, or .txt extension.");
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

        setThumbnail(canvas.toDataURL());
      } else if (file?.name?.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = `<div style="${defaultStyles}">${result.value}</div>`;

        setThumbnail({ html });
      } else if (file?.type === "text/plain" || file?.name?.endsWith(".txt")) {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result;
          const html = `<div style="${defaultStyles}"><p>${text}</p></div>`;

          setThumbnail({ html });
        };
        reader.readAsText(file);
      } else {
        setThumbnail(null);
      }
    } catch (e) {
      alert("Something went wrong while parsing your file.");
    }
  };

  const handleRightClick = (event) => {
    event.preventDefault();
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setContextMenuVisible(true);
  };

  const handleDeleteFile = () => {
    setFile(null);
    setThumbnail(null);
    setContextMenuVisible(false);
  };

  const closeContextMenu = () => {
    setContextMenuVisible(false);
  };

  const handleDownload = () => {
    if (file) {
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");

      a.href = url;
      a.download = file.name;

      document.body.appendChild(a);

      a.click();

      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    console.log(file);
  }, [file]);

  return (
    <main
      className="flex h-screen flex-col items-center justify-center p-24 gap-y-8"
      onDrop={handleDrop}
      onDragOver={(event) => event.preventDefault()}
      onClick={closeContextMenu} // Close context menu when clicking anywhere else
    >
      <div className="w-full h-auto flex items-center justify-center flex-col gap-y-1">
        <h1 className="text-[30px] font-semibold text-gray-700 capitalize">
          {file
            ? "Great! Now you can start summarizing"
            : "Get Started by Uploading a Document"}
        </h1>
        <h4 className="text-[20px] font-medium text-gray-600 lg:w-[50%] text-center leading-tight">
          {file
            ? 'Now, click the "Summarize" button to get an AI-generated summary of your file. Right click a row to delete that file.'
            : "Drag and drop a file or click to browse your computer. Supported file types are PDF, DOCX, and TXT."}
        </h4>
      </div>
      {file ? (
        <div
          className="mt-2 w-full lg:w-[70%] h-auto rounded-lg border-2 border-gray-400 bg-white drop-shadow-xl flex flex-row items-start justify-between p-3"
          onContextMenu={handleRightClick}
        >
          <div className="flex-[1.5] h-full flex flex-row items-start justify-start gap-x-4">
            {!thumbnail?.html && (
              <img src={thumbnail} alt="Thumbnail" className="w-auto h-auto" />
            )}
            {thumbnail?.html && (
              <div dangerouslySetInnerHTML={{ __html: thumbnail.html }}></div>
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
                <span className=" font-medium">Summarized:</span> False
              </p>
            </div>
          </div>
          <div className="flex-1 h-full flex flex-col items-end justify-center gap-y-4">
            <button className="w-[200px] h-[50px] rounded-md bg-blue hover:bg-deepBlue transition duration-300 text-white font-medium">
              Summarize
            </button>
            <button
              onClick={handleDownload}
              className="px-3 h-[50px] rounded-md border-2 border-blue text-black hover:bg-gray-200 transition duration-300 font-medium"
            >
              Download
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor="file-upload"
          className="mx-auto lg:w-[50%] w-[90%] lg:h-[80%] h-full bg-white rounded-md drop-shadow-lg hover:drop-shadow-2xl transition duration-300 cursor-pointer flex flex-col items-center justify-center"
        >
          <input
            onChange={handleFileChange}
            id="file-upload"
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
          />
          <div className="w-[100px] h-[100px] rounded-full bg-[#ADD8E6] flex items-center justify-center">
            <FaCloudUploadAlt size={40} className="text-white" />
          </div>
          <p className="mt-2 text-gray-600">Click or Drag to Upload</p>
        </label>
      )}
      {contextMenuVisible && (
        <div
          style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
          className="fixed bg-white shadow-lg rounded-md p-2 z-50"
        >
          <button
            onClick={handleDeleteFile}
            className="text-red-500 hover:bg-red-100 px-4 py-2 rounded-md"
          >
            Delete file
          </button>
        </div>
      )}
    </main>
  );
}
