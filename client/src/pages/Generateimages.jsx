import { Image, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Generateimages = () => {
  const imageStyle = [
    "Realistic",
    "Ghibli style",
    "Anime style",
    "Cartoon style",
    "Fantasy style",
    "Realistic style",
    "3D style",
    "Portrait style",
  ];

  const [selectedStyle, setSelectedStyle] = useState("Realistic");
  const [input, setInput] = useState("");
  const [publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const prompt = `Generate an image of ${input} in the style ${selectedStyle}`;

      const { data } = await axios.post(
        "/api/ai/generate-image",
        { prompt, publish },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="h-full overflow-y-auto p-4 flex flex-wrap items-start gap-4 text-slate-700 custom-scroll">
      {/* Left Col */}
      <form
        className="w-full max-w-[460px] p-4 bg-white border rounded-lg border-gray-200"
        onSubmit={onSubmitHandler}
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#00AD25]" />
          <h1 className="text-xl font-semibold">AI Image Generator</h1>
        </div>
        <p className="mt-6 font-medium text-sm">Describe Your Image</p>
        <textarea
          row={4}
          placeholder="Describe what you want to see in the image..."
          required
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          onChange={(e) => setInput(e.target.value)}
          value={input}
        />
        <p className="mt-4 text-sm font-medium">Category</p>
        <div className="mt-3 flex flex-wrap gap-3 sm:max-w-9/11">
          {imageStyle.map((item) => (
            <span
              key={item}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer hover:-translate-y-1 transition-all duration-300 ${
                selectedStyle === item
                  ? "bg-green-50 text-green-700"
                  : "text-gray-500 border-gray-300"
              }`}
              onClick={() => setSelectedStyle(item)}
            >
              {item}
            </span>
          ))}
        </div>
        <div className="my-6 flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => {
                setPublish(e.target.checked);
              }}
              checked={publish}
              className="sr-only peer"
            />
            <div
              className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600
       peer-checked:bg-green-500 transition-colors duration-300"
            ></div>
            <span
              className="absolute left-1 top-0.5 w-5 h-5 bg-white rounded-full 
       peer-checked:translate-x-5 transition-transform duration-300 shadow"
            ></span>
          </label>

          <p className="text-sm">Make this image Public</p>
        </div>
        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00AD25] to-[#04FF50] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer hover:scale-101  transition-all duration-300"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Image className="w-5" />
          )}
          {loading ? "Processing..." : "Generate Image"}
          
        </button>
      </form>
      {/* Right Col */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 overflow-y-auto custom-scroll">
        <div className="flex items-center gap-3">
          <Image className="w-5 h-5 text-[#8E37EB]" />
          <h1 className="text-xl font-semibold">Generated Titles</h1>
        </div>

        {!content ? (
          <div className="flex flex-1 justify-center items-center">
            <div className="flex flex-col items-center gap-5 text-sm text-gray-400">
              <Image className="w-9 h-9" />
              <p>Enter a topic and click "Generate Title" to get started</p>
            </div>
          </div>
        ) : (
          <div className="mt-3 h-full">
            <img src={content} alt="image" className="w-full h-full" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Generateimages;
