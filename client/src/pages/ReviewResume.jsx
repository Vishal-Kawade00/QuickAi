import { FileText, Sparkles } from 'lucide-react';
import React, { useState } from 'react'
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import toast from "react-hot-toast";
import Markdown from "react-markdown";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReviewResume = () => {

   const [input, setInput] = useState("");
   const [loading, setLoading] = useState(false);
   const [content, setContent] = useState("");
     
   const { getToken } = useAuth();
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!input) {
      toast.error("Please select a resume file");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("resume", input);

      const { data } = await axios.post(
        "/api/ai/resume-review",
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${await getToken()}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );

      if (data.success) {
        setContent(data.content);
        toast.success("Resume analysed successfully!");
      } else {
        toast.error(data.message || "Failed to analyse resume");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to analyse resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 flex flex-nowrap items-start gap-4 text-slate-700 custom-scroll">
      {/* Left Col */}
      <form
        className="w-full max-w-[460px] p-4 bg-white border rounded-lg border-gray-200"
        onSubmit={onSubmitHandler}
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#00DA83]" />
          <h1 className="text-xl font-semibold">Resume Review</h1>
        </div>
        <p className="mt-6 font-medium text-sm">Upload Resume</p>
        <input
          type="file"
          required
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-300"
          onChange={(e) => setInput(e.target.files[0])}
          accept='application/pdf'
        />
        <p className="text-xs text-gray-500 font-light mt-1" >Suppots PDF resume only.</p>
        <button className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00AD83] to-[#009BB3] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer hover:scale-101  transition-all duration-300">
           {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <FileText className="w-5" />
          )}
          {loading ? "Processing..." : "Review Resume"}
           
        </button>
      </form>
      {/* Right Col */}
      <div className="w-full max-w p-4 bg-white rounded-lg flex flex-col border border-gray-200 max-h-full min-h-96 overflow-y-auto custom-scroll">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-[#00DA83]" />
          <h1 className="text-xl font-semibold">Analysis Results</h1>
        </div>
        
        {!content ? (
         <div className="flex flex-1 justify-center items-center">
          <div className="flex flex-col items-center gap-5 text-sm text-gray-400">
            <FileText className="w-9 h-9" />
            <p>Upload an resume and click "Review Resume" to get started</p>
          </div>
        </div>
        ) : (
          <div className="mt-3 h-full overflow-y-auto text-sm text-slate-600 custom-scroll">
            <div className="reset-tw">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ReviewResume;