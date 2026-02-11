import express from 'express';
import { auth } from '../middleware/Auth.js';
import { 
  getPublishCreations, 
  getUserCreations, 
  toggleLikeCreation 
} from '../controller/userController.js';

const userRouter = express.Router();

// User's own creations (requires login)
userRouter.get('/get-user-creations', auth, getUserCreations);

// Public feed (published creations) → no auth needed
userRouter.get('/get-published-creations', getPublishCreations);

// Like / Unlike a creation
userRouter.post('/get-like-creation', auth, toggleLikeCreation);

export default userRouter;