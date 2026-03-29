import {createSlice, current} from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chats: {},
    currentChatId: null,
    isloading: false,
    error: null
  },
  reducers: {
    createNewChat:(state, action) =>{
      const {chatId, title} = action.payload
      state.chats[chatId] = {
        id: chatId,
        title,
        messages: [],
        lastUpdated: new Date().toISOString(),
      }
    },
    addNewMessage:(state, action) => {
      const {chatId, content, role} = action.payload
      const messageId = `${Date.now()}-${Math.random()}`
      state.chats[chatId].messages.push({
        id: messageId,
        content, 
        role
      })
    },
    addMessages:(state, action) => {
      const {chatId, messages} = action.payload
      const messagesWithIds = messages.map(msg => ({
        id: `${Date.now()}-${Math.random()}`,
        ...msg
      }))
      state.chats[chatId].messages.push(...messagesWithIds)
    },
    setChats:(state, action) => {
       state.chats = action.payload
  },
   setCurrentChatId:(state, action) => {
     state.currentChatId = action.payload
   },
   setLoading:(state, action) => {
     state.isloading = action.payload
   },
    setError:(state, action) => {
      state.error = action.payload
    },
 }
})

export const { setChats, setCurrentChatId, setLoading, setError, createNewChat, addNewMessage, addMessages } = chatSlice.actions
export default  chatSlice.reducer