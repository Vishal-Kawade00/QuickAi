import { Eraser, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveBackground = () => {
   const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();
  
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (!input) {
      toast.error("Please select an image file");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", input);

      const { data } = await axios.post(
        "/api/ai/remove-image-background",
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
        toast.success("Background removed successfully!");
      } else {
        toast.error(data.message || "Failed to remove background");
      }
    } catch (error) {
      console.error('Remove background error:', error);
      toast.error(error.response?.data?.message || error.message || "Failed to remove background");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 flex flex-wrap items-start gap-4 text-slate-700 custom-scroll">
      {/* Left Col */}
      <form
        className="w-full max-w-[460px] p-4 bg-white border rounded-lg border-gray-200"
        onSubmit={onSubmitHandler}
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#FF4938]" />
          <h1 className="text-xl font-semibold">Background Removal</h1>
        </div>
        <p className="mt-6 font-medium text-sm">Upload Image</p>
        <input
          type="file"
          required
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          onChange={(e) => setInput(e.target.files[0])}
          accept="image/jpeg,image/jpg,image/png,image/webp"
        />
        <p className="text-xs text-gray-500 font-light mt-1">
          Supports JPG, PNG, and WebP formats (max 10MB)
        </p>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#F6AB41] to-[#FF4938] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer hover:scale-101 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Eraser className="w-5" />
          )}
          {loading ? "Processing..." : "Remove Background"}
        </button>
      </form>
      
      {/* Right Col */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 overflow-y-auto custom-scroll">
        <div className="flex items-center gap-3">
          <Eraser className="w-5 h-5 text-[#FF4938]" />
          <h1 className="text-xl font-semibold">Processed Image</h1>
        </div>

        {!content ? (
          <div className="flex flex-1 justify-center items-center">
            <div className="flex flex-col items-center gap-5 text-sm text-gray-400">
              <Eraser className="w-9 h-9" />
              <p>
                Upload an image and click "Remove Background" to get started
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-3 h-full flex flex-col gap-4">
            {/* Checkered background to show transparency */}
            <div 
              className="relative w-full h-96 rounded-lg overflow-hidden"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
                  linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
                  linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)
                `,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
              }}
            >
              <img 
                src={content} 
                alt="Processed image with background removed" 
                className="w-full h-full object-contain relative z-10"
              />
            </div>
            
            <a
              href={content}
              download="background-removed.png"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full text-center bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Download Image
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default RemoveBackground;