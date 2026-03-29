import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useSelector } from 'react-redux'
import { useChat } from '../hooks/useChat.jsx'
import remarkGfm from 'remark-gfm'
import { useRef } from 'react'

const Dashboard = () => {
  const chat = useChat()
  const [ chatInput, setChatInput ] = useState('')
  const chats = useSelector((state) => state.chat.chats)
  const user = useSelector((state) => state.auth.user)
  const currentChatId = useSelector((state) => state.chat.currentChatId)

  const [file, setFile] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

useEffect(() => {
  if (!currentChatId) {
    inputRef.current?.focus()
  }
}, [currentChatId])

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}, [chats, currentChatId, chat.isTyping])

// Force render when current chat messages change
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}, [chats[currentChatId]?.messages?.length])

  useEffect(() => {
    chat.initializeSocketConnection()
    chat.handleGetChats()
  }, [])

  const handleSubmitMessage = (event) => {
    event.preventDefault()

    if (audioBlob) {
      sendAudio()
      return
    }

    const trimmedMessage = chatInput.trim()
    if (!trimmedMessage && !file) {
      return
    }

    chat.handleSendMessage({ message: trimmedMessage, chatId: currentChatId, file  })

    setChatInput('')
    setFile(null)
 
  }


  const openChat = (chatId) => {
    chat.handleOpenChat(chatId, chats)
  }

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        setAudioBlob(blob)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const sendAudio = () => {
    if (audioBlob) {
      const audioFile = new File([audioBlob], 'audio.wav', { type: 'audio/wav' })
      setFile(audioFile)
      setAudioBlob(null)
    }
  }

  return (
     <main className='min-h-screen w-full bg-[#07090f]  text-white py-3 pr-3 md:py-5 md:pr-5'>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            opacity: 0.5;
            transform: translateY(0);
          }
          40% {
            opacity: 1;
            transform: translateY(-10px);
          }
        }
      `}</style>
      <section className='mx-auto flex h-[calc(100vh-1.5rem)] w-full gap-4 rounded-3xl border   p-1 md:h-[calc(100vh-2.5rem)] md:gap-6 md:p-1 border-none'>
        <aside className="hidden md:flex  flex-col h-full w-64 bg-[#0b0f17]  border-r border-white/10">
          <div className='flex items-center gap-3 mb-4 px-3 py-2'>
          <i className='ri-chat-smile-ai-line text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500'></i>
            <h1 className='text-xl font-bold text-white'>Nexus</h1>
          </div>
          <button
  onClick={chat.handleCreateNewChat}
  className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-white/10 transition mb-4 "
>
  + New Chat
</button>

          <div className='space-y-2'>
            {Object.values(chats).map((chatItem,index) => (
              <div
                key={index}
                className='flex items-center justify-between group rounded-xl hover:bg-white/10 transition'
              >
                <button
                  onClick={()=>{openChat(chatItem.id)}}
                  type='button'
                  className='flex-1 cursor-pointer border-none bg-transparent px-3 py-2 text-left text-base font-medium text-white/90 transition'
                >
                  {chatItem.title}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    chat.handleDeleteChat(chatItem.id)
                  }}
                  type='button'
                  className='opacity-0 group-hover:opacity-100 px-2 py-2 text-red-400 hover:text-red-300 transition'
                  title='Delete chat'
                >
                  <i className='ri-delete-bin-line'></i>
                </button>
              </div>
            ))}
          </div>

          <div className="mt-auto flex items-center gap-3 border-t border-white/20 pt-4 flex items-center gap-3 hover:bg-white/10 p-2 rounded-lg cursor-pointer transition">
  <div className="h-9 w-9 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold">
    {user?.email?.charAt(0).toUpperCase()}
  </div>
  <div className="flex flex-col overflow-hidden">
    <span className="text-sm truncate">{user?.email}</span>
    <span className="text-xs text-white/40">Online</span>
  </div>
</div>
        </aside>

        <section className='relative mx-auto flex h-full w-full max-w-3xl  flex-col'>

          <div
  className={`messages flex-1 space-y-3 overflow-y-auto pr-1 ${currentChatId ? 'pb-28' : 'flex flex-col items-center justify-center gap-10'}`}
>
            

{!currentChatId && (
  <div className="absolute top-[15%] left-1/2 -translate-x-1/2 text-center flex flex-col items-center gap-4">
    <div className="flex items-center gap-3 justify-center">
      <i className='ri-chat-smile-ai-3-line text-5xl text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500'></i>
    </div>
    <div>
      <h1 className='text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-2'>Nexus</h1>
      <p className='text-white/60 text-base font-light tracking-widest'>Intelligence Meets Connection</p>
    </div>
  </div>
)}

            {chats[ currentChatId ]?.messages && chats[ currentChatId ].messages.length > 0 ? (
              chats[ currentChatId ].messages.map((message, idx) => (
              <div key={message.id || `msg-${idx}`} className={`flex flex-col gap-2 w-full ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[82%] w-fit group rounded-2xl px-4 py-3 text-sm md:text-base relative ${message.role === 'user'
                      ? 'rounded-br-none bg-white/12 text-white'
                      : 'bg-gradient-to-r from-[#1f2937] to-[#111827] text-white'
                    }`}         >
                  {message.role === 'user' ? (
                    <div>
                      <p>{message.content}</p>
                      {message.fileInfo && (
                        <div className="mt-2 pt-2 border-t border-white/20 text-xs">
                          <div className="flex items-center gap-2">
                            <i className='ri-file-text-line'></i>
                            <span>{message.fileInfo.originalName}</span>
                            <span className="text-white/60">({(message.fileInfo.size / 1024).toFixed(2)} KB)</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className='mb-2 last:mb-0'>{children}</p>,
                        ul: ({ children }) => <ul className='mb-2 list-disc pl-5'>{children}</ul>,
                        ol: ({ children }) => <ol className='mb-2 list-decimal pl-5'>{children}</ol>,
                        code: ({ children }) => <code className='rounded bg-white/10 px-1 py-0.5'>{children}</code>,
                        pre: ({ children }) => <pre className='mb-2 overflow-x-auto rounded-xl bg-black/30 p-3'>{children}</pre>
                      }}
                      remarkPlugins={[remarkGfm]}
                    >
                      {message.content}
                    </ReactMarkdown>
                  )}
                </div>
                <div className={`flex gap-1 opacity-100 transition-opacity duration-200 ${message.role === 'user' ? 'mr-1' : 'ml-1'}`}>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(message.content)
                      alert('Copied to clipboard!')
                    }}
                    className="p-1 text-white/70 hover:text-white transition-all"
                    title="Copy"
                  >
                    <i className='ri-file-copy-2-line text-base'></i>
                  </button>
                  {message.role === 'user' && (
                    <button
                      onClick={() => setChatInput(message.content)}
                      className="p-1 text-white/70 hover:text-white transition-all"
                      title="Edit"
                    >
                      <i className='ri-pencil-line text-base'></i>
                    </button>
                  )}
                </div>
              </div>
            ))
            ) : null}
            {chat.isTyping && (
  <div className="mr-auto bg-gradient-to-r from-[#1f2937] to-[#111827] text-white rounded-2xl px-4 py-3 flex items-center gap-2">
    <span className="text-sm">AI is typing</span>
    <div className="flex gap-1">
      <div className="w-2 h-2 bg-white rounded-full" style={{
        animation: 'bounce 1.4s infinite',
        animationDelay: '0s'
      }}></div>
      <div className="w-2 h-2 bg-white rounded-full" style={{
        animation: 'bounce 1.4s infinite',
        animationDelay: '0.2s'
      }}></div>
      <div className="w-2 h-2 bg-white rounded-full" style={{
        animation: 'bounce 1.4s infinite',
        animationDelay: '0.4s'
      }}></div>
    </div>
  </div>
)}
            <div ref={messagesEndRef} />

          </div>

          <footer
  className={`rounded-3xl w-full transition-all duration-300 ease-in-out
  ${
    !currentChatId
      ? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[60%]'
      : 'absolute bottom-2'
  }`}
>
            <form onSubmit={handleSubmitMessage} className='flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-[#1f2937] to-[#111827] border border-white/20'>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-white hover:text-white/70 transition p-2"
                title="Attach file"
              >
                <i className='ri-add-line text-xl'></i>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                id="fileUpload"
                accept="*/*"
              />

              <input
                ref={inputRef}
                type='text'
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder='Ask Anything...'
                className='flex-1 bg-transparent px-2 py-2 text-white outline-none placeholder:text-white/45'
              />

              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startAudioRecording}
                    className="text-white hover:text-white/70 transition p-2"
                    title="Start recording audio"
                  >
                    <i className='ri-mic-line text-xl'></i>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopAudioRecording}
                    className="text-red-400 hover:text-red-300 transition p-2 animate-pulse"
                    title="Stop recording"
                  >
                    <i className='ri-stop-circle-fill text-xl'></i>
                  </button>
                )}

                <button
                  type='submit'
                  disabled={!chatInput.trim() && !file && !audioBlob}
                  className='text-white hover:text-white/70 disabled:text-white/30 transition p-2'
                >
                  <i className='ri-arrow-up-line text-xl'></i>
                </button>
              </div>
            </form>

            {(file || audioBlob) && (
              <div className={`mt-2 flex flex-wrap gap-2 ${!currentChatId ? 'hidden' : ''}`}>
                {file && (
                  <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-full bg-white/10 border border-white/20">
                    <i className='ri-file-line'></i> 
                    <span className="truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="ml-1 text-red-400 hover:text-red-300"
                    >
                      <i className='ri-close-line'></i>
                    </button>
                  </div>
                )}

                {audioBlob && (
                  <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-full bg-white/10 border border-white/20">
                    <i className='ri-mic-line'></i> 
                    <span>Audio recorded</span>
                    <button
                      type="button"
                      onClick={() => setAudioBlob(null)}
                      className="ml-1 text-red-400 hover:text-red-300"
                    >
                      <i className='ri-close-line'></i>
                    </button>
                  </div>
                )}
              </div>
            )}
          </footer>
        </section>
      </section>
    </main>
  )
}

export default Dashboard