import React from "react";
import { IoClose } from "react-icons/io5";

const RenderSummary = ({ setActiveTab, activeTab, file, handleDeleteFile }) => {
  return (
    <section
      className={`${
        activeTab
          ? "fixed z-[51] top-0 bottom-0 right-0 left-0 opacity-100 transition duration-500"
          : "hidden"
      }`}
    >
      <div
        className="fixed top-0 bottom-0 right-0 left-0 bg-gray-500 z-[10] opacity-60"
        onClick={() => setActiveTab(false)}
      ></div>
      {/* Delete Account */}
      <div className="w-full h-auto flex justify-center items-center flex-col gap-y-6 absolute mt-16">
        <div className="h-auto w-[98%] lg:w-[45%] bg-white rounded-md border border-lighGray lg:px-0 z-[1000] shadow-2xl overflow-hidden">
          <div className="h-full flex flex-col justify-center items-center mx-auto">
            <div className="w-full h-full flex flex-row justify-between items-center bg-lighterGray p-6 rounded-t-md border-b border-lighGray">
              <p className="text-[17px] font-medium capitalize">Full Summary</p>
              <IoClose
                onClick={() => setActiveTab(false)}
                className="text-gray font-bold cursor-pointer"
                size={25}
              />
            </div>

            <div className="p-6 w-full overflow-auto scroll-container h-auto">
              <p className="text-[15px] font-normal text-darkestGray text-left">
                {file.summarizedText}
              </p>
            </div>
            <span className="w-full flex items-start justify-start pl-6">
              <button
                onClick={() => setActiveTab(false)}
                className="text-[15px] text-blue font-medium underline underline-offset-2 mt-5"
              >
                Close Tab
              </button>
            </span>

            <span className="w-full h-auto flex items-center justify-end pr-6 py-6 gap-x-2">
              <button
                onClick={() => {
                  setActiveTab(false);

                  handleDeleteFile();
                }}
                className="text-white text-[12px] lg:text-[14px] font-semibold bg-red-500 hover:bg-red-600 hover:transition duration-300 p-3 rounded-md"
              >
                Delete File
              </button>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RenderSummary;
