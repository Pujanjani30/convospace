import { Router } from "express";
import { getMessages, updateUnSeenMessages, uploadMessageFile } from "../controllers/message.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { uploadSingleFile, handleMulterError } from "../middlewares/uploadFile.middleware.js";

const messageRoutes = Router();

const allowedTypes = /jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif|pdf|doc|docx|ppt|pptx|txt|zip|rar|7z|tar|gz|mp4|avi|mov|wmv|flv|webm|mp3|wav|ogg|m4a|flac|js|jsx|ts|tsx|py|ipynb|java|cpp|html|css|rtf|csv/;

messageRoutes.get("/get-messages", verifyToken, getMessages);

messageRoutes.post("/update-unseen-messages", verifyToken, updateUnSeenMessages);
messageRoutes.post("/upload-message-file",
  verifyToken,
  uploadSingleFile("file", 5, allowedTypes),
  handleMulterError,
  uploadMessageFile
);

export default messageRoutes;