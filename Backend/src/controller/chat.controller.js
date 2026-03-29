import { generateResponse, generateChatTitle } from "../services/aiService.js";
import chatModel from "../models/chatModel.js"
import messageModel from "../models/messageModel.js"

export async function sendMessage(req, res) {

  const { message, chat: chatId } = req.body;
  const file = req.file;

  let title= null, chat = null;

  if(!chatId) {
     title = await generateChatTitle(message);
     chat = await chatModel.create({
    user: req.user.id,
    title
  })
  }

  let messageContent = message;
  
  // If file is attached, append file info to message
  if(file) {
    messageContent = `${message}\n[File: ${file.originalname} (${(file.size / 1024).toFixed(2)} KB)]`;
  }

   const userMessage = await messageModel.create({
    chat: chatId || chat._id,
    content: messageContent,
    role: "user",
    fileInfo: file ? {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size
    } : null
  })

  const messages = await messageModel.find({chat: chatId || chat._id});

   const result = await generateResponse(messages);

  const aiMessgage = await messageModel.create({
    chat: chatId || chat._id,
    content: result,
    role: "ai"
  })

  res.status(201).json({ 
    title,
    chat,
    aiMessgage
   });
  
}

export async function getChats(req, res) {
  const user = req.user;

  const chats = await chatModel.find({ user: user.id })

  res.status(200).json({
   message: "Chats retrieved successfully",
   chats
  })
}

export async function getMessages(req, res) {
  const { chatId } = req.params;

  const chat = await messageModel.find({ 
    _id: chatId,
    user: req.user.id
  })
  if(!chat) {
    return res.status(404).json({
      message: "Chat not found"
    })
  }

  const messages = await messageModel.find({ chat: chatId });

  res.status(200).json({
    message: "Messages retrieved successfully",
    messages
  })
}

export async function deleteChat(req, res) {
  const { chatId } = req.params;

  const chat = await chatModel.findOneAndDelete({
    _id: chatId,
    user: req.user.id
  })

  await messageModel.deleteMany({
    chat: chatId
  })

  if(!chat) {
    return res.status(404).json({
      message: "Chat not found"
    })
  }

  res.status(200).json({
    message: "Chat deleted successfully"
  })
}