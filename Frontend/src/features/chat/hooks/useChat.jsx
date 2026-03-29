import { initializeSocketConnection } from "../services/chatSocket.js";
import { sendMessage, getChats, getMessages,deleteChat} from "../services/chatApi.js";
import { setChats, setCurrentChatId, setError,setLoading, createNewChat, addNewMessage, addMessages,  } from "../chatSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";

export const useChat = () => {
    const dispatch = useDispatch();
    const chats = useSelector((state) => state.chat.chats);
    const [isTyping, setIsTyping] = useState(false);

    async  function handleCreateNewChat() {
    try {
        dispatch(setCurrentChatId(null))
        dispatch(setLoading(false))
    } catch (error) {
        console.error("Error creating new chat:", error)
        dispatch(setError("Failed to create new chat"))
    }
}

    async function handleSendMessage({message, chatId, file}){
        dispatch(setLoading(true))
        setIsTyping(true)
        try {
            const data =  await sendMessage({message, chatId})
            const { chat, aiMessgage } = data  // Note: backend has typo 'aiMessgage'
            const finalChatId = chatId || chat?._id
            
            // Validate response has required data
            if(!finalChatId || !aiMessgage) {
                throw new Error("Invalid response from server: missing chat ID or AI message")
            }
            
            // Create new chat if needed
            if(!chatId) {
                dispatch(createNewChat({
                    chatId: finalChatId,
                    title: chat.title,
                }))
            }
            
            // Set current chat (ensures UI updates)
            dispatch(setCurrentChatId(finalChatId))
            
            // Add user message
            dispatch(addNewMessage({
                chatId: finalChatId,
                content: message,
                role: "user"
            }))
            
            // Add AI message
            dispatch(addNewMessage({
                chatId: finalChatId,
                content: aiMessgage.content || aiMessgage,
                role: aiMessgage.role || "ai"
            }))
        } catch (error) {
            console.error("Error sending message:", error)
            dispatch(setError("Failed to send message: " + error.message))
        } finally {
            setIsTyping(false)
            dispatch(setLoading(false))
        }
    }

    async function handleGetChats(){
        dispatch(setLoading(true))
        const data = await getChats()
        const {chats} = data
        dispatch(setChats(chats.reduce((acc, chat)=>{
            acc[chat._id] = {
                id: chat._id,
                title: chat.title,
                messages: [],
                lastUpdated: chat.updatedAt,
            }
            return acc
        },{})))
        dispatch(setLoading(false))
        
    }

    async function handleOpenChat(chatId, chats) {

        if(chats[chatId]?.messages.length === 0){

        const data = await getMessages(chatId)
        const { messages } = data

        const formattedMessages = messages.map(msg => ({
            content: msg.content,
            role: msg.role,
        }))
        dispatch(addMessages({
            chatId,
            messages: formattedMessages,
        }))
    }
        dispatch(setCurrentChatId(chatId))
    }

    async function handleDeleteChat(chatId){
        try {
            dispatch(setLoading(true))
            await deleteChat(chatId)
            
            // Remove chat from Redux store - compute new state object
            const updatedChats = { ...chats }
            delete updatedChats[chatId]
            dispatch(setChats(updatedChats))
            
            // Clear current chat if it was the deleted one
            dispatch(setCurrentChatId(null))
            
            dispatch(setLoading(false))
        } catch (error) {
            console.error("Error deleting chat:", error)
            dispatch(setError("Failed to delete chat"))
            dispatch(setLoading(false))
        }
    }


    return {
        initializeSocketConnection, handleSendMessage, handleGetChats, handleOpenChat, handleCreateNewChat, handleDeleteChat, isTyping
    }

}