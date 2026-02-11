import express from 'express'
import cors from 'cors';
import 'dotenv/config'
import { clerkMiddleware } from '@clerk/express' // requireAuth is no longer needed here
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRouter.js';

const app = express()

await connectCloudinary()

app.use(cors());
app.use(express.json())
app.use(clerkMiddleware()) 

app.get('/', (req, res) => res.send('Server is live!'))

// THIS IS THE LINE TO DELETE
// app.use(requireAuth()) 

// Your routers now correctly handle their own authentication
app.use('/api/ai', aiRouter)
app.use('/api/user', userRouter)

const PORT  = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('Server is running on port', PORT)
})