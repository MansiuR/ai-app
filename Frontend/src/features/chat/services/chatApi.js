import axios from "axios";
import { getApiUrl } from "../../../config/apiConfig.js";

const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
})

export const sendMessage = async ({message, chatId, file}) => {
  const formData = new FormData()
  formData.append('message', message)
  formData.append('chat', chatId)
  
  if (file) {
    formData.append('file', file, file.name)
  }

  const response = await api.post("/api/chats/message", formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

export const getChats = async () => {
  const response = await api.get("/api/chats")
  return response.data
}

export const getMessages = async (chatId) => {
  const response = await api.get(`/api/chats/${chatId}/messages`)
  return response.data
}

export const deleteChat = async (chatId) => {
  const response = await api.delete(`/api/chats/delete/${chatId}`)
  return response.data
}