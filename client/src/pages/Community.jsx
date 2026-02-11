import React, { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Heart } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

// Configure the base URL for all axios requests
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Community = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { getToken } = useAuth();

  // Fetches all published creations from the backend
  const fetchCreations = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/user/get-published-creations");
      if (data.success) {
        setCreations(data.creations);
      } else {
        toast.error(data.message || "Failed to fetch creations");
      }
    } catch (error) {
      console.error('Fetch creations error:', error);
      toast.error(error.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Toggles the 'like' status for a specific creation
  const imageLikeToggle = async (id) => {
    try {
      const { data } = await axios.post(
        "/api/user/get-like-creation",
        { id },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        // Refresh the creations to show the updated like status
        await fetchCreations();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Like toggle error:', error);
      toast.error(error.response?.data?.message || "Failed to update like status.");
    }
  };

  // Fetch creations on initial component mount
  useEffect(() => {
    fetchCreations();
  }, []);

  return (
    <div className="flex flex-col flex-1 h-full gap-4 p-4 md:p-6 bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-800">
        Community Creations ({creations.length})
      </h1>
      
      {/* Scrollable container for the image gallery */}
      <div className="bg-white h-full w-full rounded-xl shadow-sm overflow-y-auto custom-scroll p-4">
        {loading ? (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading creations...</p>
            </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
            {creations.map((creation) => (
              <div
                key={creation.id}
                className="mb-4 break-inside-avoid relative block group w-full"
              >
                <img
                  src={creation.content}
                  alt={creation.prompt}
                  className="w-full rounded-lg object-cover shadow-md"
                />

                {/* Hover overlay for details and like button */}
                <div
                  className="absolute inset-0 flex flex-col justify-end p-3 
                             text-white rounded-lg opacity-0 group-hover:opacity-100 
                             bg-gradient-to-t from-black/80 to-transparent 
                             transition-opacity duration-300"
                >
                  <div className="flex justify-between items-end w-full">
                    <p className="text-sm font-light flex-1 mr-2">
                      {creation.prompt}
                    </p>

                    <div className="flex gap-1.5 items-center flex-shrink-0 bg-black/30 p-1.5 rounded-full">
                      <p className="text-sm font-semibold">{Array.isArray(creation.likes) ? creation.likes.length : 0}</p>
                      <Heart
                        onClick={() => imageLikeToggle(creation.id)}
                        className={`w-5 h-5 hover:scale-110 cursor-pointer transition-transform
                          ${
                            Array.isArray(creation.likes) && creation.likes.includes(user?.id)
                              ? "fill-red-500 text-red-500"
                              : "text-white"
                          }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
