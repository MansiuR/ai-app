import { Router } from "express";
import { sendMessage, getMessages, getChats, deleteChat } from "../controller/chat.controller.js";
import {authUser} from "../middleware/authMiddleware.js";
import multer from "multer";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

const chatRouter = Router();

chatRouter.post("/message", authUser, upload.single('file'), sendMessage);

chatRouter.get("/", authUser, getChats);

chatRouter.get("/:chatId/messages", authUser, getMessages);

chatRouter.delete("/delete/:chatId",authUser, deleteChat)

export default chatRouter;