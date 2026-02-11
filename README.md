QuickAi: AI-Powered Multi-Tool Platform
QuickAi is a comprehensive full-stack web application that leverages artificial intelligence to provide a suite of productivity and creative tools. Built with a focus on seamless user experience, the platform integrates advanced AI capabilities including content generation, image manipulation, and document analysis.

Core Features
Creative Writing Suite: Generate full-length articles and catchy blog titles powered by OpenAI.

Image Generation & Editing: Create hyper-realistic images from text prompts and perform advanced edits like background or object removal using Cloudinary integration.

Document Intelligence: Analyze and review resumes using automated PDF parsing.

Community Showcase: Explore a public gallery of AI-generated content shared by other users.

Unified Dashboard: A centralized workspace to manage all AI tasks and view history.

Technical Stack
Frontend:

React 19 with Vite for high-performance development.

Tailwind CSS 4 for modern, responsive styling.

Clerk for secure user authentication and session management.

React Router Dom for seamless client-side navigation.

Backend:

Node.js and Express 5 server architecture.

Neon Database (Serverless PostgreSQL) for scalable data storage.

Cloudinary for cloud-based image storage and processing.

Multer for efficient multipart/form-data handling.

Getting Started
Prerequisites
Node.js (v18 or higher)

A Clerk account for authentication keys

Cloudinary account for image hosting

OpenAI API key

Installation
Clone the repository:

Bash
git clone [your-repo-url]
cd QuickAi-03
Setup Backend:

Bash
cd server
npm install
# Create a .env file with your CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, 
# CLOUDINARY_URL, and OPENAI_API_KEY
npm run server
Setup Frontend:

Bash
cd ../client
npm install
# Create a .env file with VITE_CLERK_PUBLISHABLE_KEY
npm run dev
Project Structure
/client: React application including pages for different AI tools and a custom layout system.

/server: Express API handling authentication middleware, AI routing, and third-party integrations.
