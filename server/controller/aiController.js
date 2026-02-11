import OpenAI from "openai";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import FormData from "form-data";
import fs from 'fs';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// Helper function to update free usage
const updateFreeUsage = async (userId, currentUsage) => {
  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      free_usage: currentUsage + 1,
    },
  });
};

// Helper function to clean up uploaded files
const cleanupFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up file:', error);
  }
};

// Generate Article
export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (!prompt) {
      return res.json({
        success: false,
        message: "Prompt is required",
      });
    }

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to premium to continue.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: length || 1000,
    });

    const content = response.choices[0].message.content;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type, created_at) 
      VALUES (${userId}, ${prompt}, ${content}, 'article', NOW())
    `;

    if (plan !== "premium") {
      await updateFreeUsage(userId, free_usage);
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error('Generate Article Error:', error.message);
    res.json({ 
      success: false, 
      message: error.message || "Failed to generate article" 
    });
  }
};

// Generate Blog Title
export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (!prompt) {
      return res.json({
        success: false,
        message: "Prompt is required",
      });
    }

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to premium to continue.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type, created_at) 
      VALUES (${userId}, ${prompt}, ${content}, 'blog-title', NOW())
    `;

    if (plan !== "premium") {
      await updateFreeUsage(userId, free_usage);
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error('Generate Blog Title Error:', error.message);
    res.json({ 
      success: false, 
      message: error.message || "Failed to generate blog title" 
    });
  }
};

// Generate Image
export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;
    const plan = req.plan;

    if (!prompt) {
      return res.json({
        success: false,
        message: "Prompt is required",
      });
    }

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    const formData = new FormData();
    formData.append('prompt', prompt);

    const response = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1", 
      formData, 
      {
        headers: {
          'x-api-key': process.env.CLIPDROP_API_KEY,
          ...formData.getHeaders()
        },
        responseType: 'arraybuffer',
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(response.data).toString('base64')}`;

    const { secure_url } = await cloudinary.uploader.upload(base64Image, {
      folder: 'generated-images',
      resource_type: 'image'
    });

    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish, created_at) 
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false}, NOW())
    `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.error('Generate Image Error:', error.message);
    console.error('Full error:', error.response?.data || error);
    
    res.json({ 
      success: false, 
      message: error.message || "Failed to generate image" 
    });
  }
};

// Remove Background from Image - CORRECTED
export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image = req.file;
    const plan = req.plan;

    console.log('Remove Background Request:', { 
      userId, 
      plan, 
      hasFile: !!image,
      filename: image?.originalname 
    });

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    if (!image) {
      return res.json({
        success: false,
        message: "No image file uploaded",
      });
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedMimeTypes.includes(image.mimetype)) {
      cleanupFile(image.path);
      return res.json({
        success: false,
        message: "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
      });
    }

    // Validate file size (10MB limit)
    if (image.size > 10 * 1024 * 1024) {
      cleanupFile(image.path);
      return res.json({
        success: false,
        message: "File size exceeds 10MB limit.",
      });
    }

    console.log('Removing background using Remove.bg API...');

    // Create form data for Remove.bg
    const formData = new FormData();
    formData.append('image_file', fs.createReadStream(image.path));
    formData.append('size', 'auto');

    // Call Remove.bg API
    const removeBgResponse = await axios.post(
      'https://api.remove.bg/v1.0/removebg',
      formData,
      {
        headers: {
          'X-Api-Key': process.env.REMOVEBG_API_KEY,
          ...formData.getHeaders()
        },
        responseType: 'arraybuffer'
      }
    );

    // Convert to base64 for Cloudinary upload
    const base64Image = `data:image/png;base64,${Buffer.from(removeBgResponse.data).toString('base64')}`;

    // Upload to Cloudinary
    const { secure_url } = await cloudinary.uploader.upload(base64Image, {
      folder: 'background-removed',
      resource_type: "image"
    });

    console.log('Background removed successfully:', secure_url);

    cleanupFile(image.path);

    await sql`
      INSERT INTO creations (user_id, prompt, content, type, created_at) 
      VALUES (${userId}, 'Remove background from the image', ${secure_url}, 'background-removal', NOW())
    `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    cleanupFile(req.file?.path);
    console.error('Remove Background Error:', error.message);
    console.error('Full error:', error.response?.data || error);
    
    if (error.response?.status === 403) {
      return res.json({
        success: false,
        message: "Invalid or expired Remove.bg API key"
      });
    }
    
    res.json({ 
      success: false, 
      message: error.message || "Failed to remove background" 
    });
  }
};

// Remove Object from Image
export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    if (!req.file) {
      return res.json({
        success: false,
        message: "No image file uploaded",
      });
    }

    if (!object || object.trim() === '') {
      cleanupFile(req.file.path);
      return res.json({
        success: false,
        message: "Object to remove must be specified",
      });
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      cleanupFile(req.file.path);
      return res.json({
        success: false,
        message: "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
      });
    }

    const { public_id } = await cloudinary.uploader.upload(req.file.path, {
      folder: 'object-removed',
      resource_type: "image"
    });

    cleanupFile(req.file.path);

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image"
    });

    await sql`
      INSERT INTO creations (user_id, prompt, content, type, created_at) 
      VALUES (${userId}, ${`Remove ${object} from image`}, ${imageUrl}, 'object-removal', NOW())
    `;

    res.json({ success: true, content: imageUrl });
  } catch (error) {
    cleanupFile(req.file?.path);
    console.error('Remove Object Error:', error.message);
    res.json({ 
      success: false, 
      message: error.message || "Failed to remove object from image" 
    });
  }
};

// Review Resume - CORRECTED
export const reviewResume = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;

    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    if (!resume) {
      return res.json({
        success: false,
        message: "No resume file uploaded",
      });
    }

    // Validate file type
    if (resume.mimetype !== 'application/pdf') {
      cleanupFile(resume.path);
      return res.json({
        success: false,
        message: "Only PDF files are supported for resume review",
      });
    }

    // Validate file size (5MB limit)
    if (resume.size > 5 * 1024 * 1024) {
      cleanupFile(resume.path);
      return res.json({
        success: false,
        message: "Resume file size exceeds 5MB limit."
      });
    }

    console.log('Reading PDF file...');
    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);

    // Validate PDF has content
    if (!pdfData.text || pdfData.text.trim().length === 0) {
      cleanupFile(resume.path);
      return res.json({
        success: false,
        message: "Unable to extract text from PDF. Please ensure the PDF contains readable text."
      });
    }

    console.log(`PDF parsed successfully. Text length: ${pdfData.text.length} characters`);

    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas of improvement. Include specific suggestions for enhancing the resume's effectiveness.\n\nResume Content:\n\n${pdfData.text}`;

    console.log('Sending to AI for review...');
    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    console.log('AI review completed successfully');

    cleanupFile(resume.path);

    await sql`
      INSERT INTO creations (user_id, prompt, content, type, created_at) 
      VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume-review', NOW())
    `;

    res.json({ success: true, content });
  } catch (error) {
    cleanupFile(req.file?.path);
    console.error('Review Resume Error:', error.message);
    console.error('Full error:', error);
    
    // Provide more specific error messages
    if (error.message.includes('pdf-parse')) {
      return res.json({
        success: false,
        message: "Failed to parse PDF file. The file may be corrupted or password-protected."
      });
    }
    
    if (error.message.includes('ENOENT')) {
      return res.json({
        success: false,
        message: "Resume file not found. Please try uploading again."
      });
    }
    
    res.json({ 
      success: false, 
      message: error.message || "Failed to review resume" 
    });
  }
};