import { Router } from 'express';
import { uploadPlayerImage } from '../controllers/uploadController';
import { adminMiddleware, authMiddleware } from '../middleware/authMiddleware';
import { uploadImage } from '../middleware/uploadMiddleware';

export const uploadRoutes = Router();

uploadRoutes.post('/player-images', authMiddleware, adminMiddleware, uploadImage.single('image'), uploadPlayerImage);
