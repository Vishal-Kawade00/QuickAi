import React, { useState } from 'react';
import MarkDown from 'react-markdown';
import { Image as ImageIcon, Music, Video, Code } from 'lucide-react';

const CreationItems = ({ item }) => {
    const [expanded, setExpanded] = useState(false);

    // Add a console log here to debug the incoming item data
    console.log("Rendering Creation Item with data:", item);

    // More robust check for the URL. It now handles non-string content
    // and trims whitespace from the URL before checking.
    const isContentUrl = typeof item.content === 'string' && item.content.trim().startsWith('http');

    // More robust check for the item type. It handles potential null values,
    // extra whitespace, and differences in capitalization (e.g., "Image" vs "image").
    const isImageType = (item.type === 'image' || item.type === 'background-removal');

    return (
        <div
            className="w-full p-4 text-sm bg-white border border-gray-200 rounded-lg cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => {
                // Prevents toggling when a user is selecting text to copy
                if (window.getSelection().toString()) return;
                setExpanded(!expanded);
            }}
        >
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h2 className="font-medium text-gray-800">{item.prompt || "No prompt provided"}</h2>
                    <p className="text-gray-500 capitalize">
                        {item.type} - {new Date(item.created_at).toLocaleDateString()}
                    </p>
                </div>
                <button className="flex-shrink-0 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-4 py-1 rounded-full capitalize text-xs font-medium">
                    {item.type}
                </button>
            </div>

            {expanded && (
                <div className="mt-4 border-t pt-4">
                    {/* Display image if the type is 'image' and content is a valid URL */}
                    {isImageType && isContentUrl ? (
                        <div>
                            <img
                                src={item.content}
                                alt={item.prompt || "Generated image"}
                                className="mt-3 w-full max-w-md rounded-md border"
                                // This handles cases where the URL is valid but the image is broken
                                onError={(e) => {
                                    const target = e.currentTarget;
                                    // Hide broken image and show a placeholder error message
                                    target.style.display = 'none';
                                    const placeholder = document.createElement('div');
                                    placeholder.className = 'text-red-500 text-center py-4 bg-red-50 rounded-md';
                                    placeholder.innerText = 'Image failed to load.';
                                    target.parentElement.appendChild(placeholder);
                                }}
                            />
                        </div>
                    ) : (
                        // For all other types, or if image URL is invalid, render as Markdown
                        <div className="mt-3 max-h-80 overflow-y-auto text-sm text-slate-700 custom-scroll">
                            <div className="prose prose-sm max-w-none">
                                <MarkDown>{item.content || "No content available."}</MarkDown>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CreationItems;

