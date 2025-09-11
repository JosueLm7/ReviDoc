"use client"

import { useState, useRef, useEffect } from "react"
import { PaperAirplaneIcon, UserIcon, SparklesIcon } from "@heroicons/react/24/outline"

function ChatBot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "¡Hola! Soy tu asistente de escritura académica. ¿En qué puedo ayudarte hoy?",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      // Simular respuesta del bot (aquí iría la integración con la API)
      setTimeout(() => {
        const botResponse = {
          id: Date.now() + 1,
          type: "bot",
          content: getBotResponse(inputMessage),
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botResponse])
        setIsLoading(false)
      }, 1500)
    } catch (error) {
      console.error("Error sending message:", error)
      setIsLoading(false)
    }
  }

  const getBotResponse = (message) => {
    const responses = {
      citas:
        "Para las citas académicas, te recomiendo usar el formato APA. ¿Necesitas ayuda con alguna cita específica?",
      gramática: "Puedo ayudarte a revisar la gramática de tu texto. Comparte el párrafo que quieres revisar.",
      estructura:
        "Una buena estructura académica incluye: introducción, desarrollo, conclusión. ¿En qué parte necesitas ayuda?",
      plagio:
        "Para evitar el plagio, siempre cita tus fuentes y parafrasea correctamente. ¿Quieres que revise algún texto?",
    }

    const lowerMessage = message.toLowerCase()
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return response
      }
    }

    return "Entiendo tu consulta. Puedo ayudarte con gramática, estructura, citas académicas y detección de plagio. ¿Podrías ser más específico sobre lo que necesitas?"
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-card border border-border rounded-lg shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="w-5 h-5 text-primary" />
          <h3 className="font-serif font-semibold text-card-foreground">Asistente IA</h3>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs px-3 py-2 rounded-lg ${
                message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === "bot" && <SparklesIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                {message.type === "user" && <UserIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted text-muted-foreground max-w-xs px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-4 h-4 animate-pulse" />
                <span className="text-sm">Escribiendo...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Escribe tu pregunta..."
            className="flex-1 px-3 py-2 border border-border rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatBot
