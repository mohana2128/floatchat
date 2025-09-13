import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader, Download, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import PlotlyChart from './PlotlyChart';
import MapVisualization from './MapVisualization';
import { chatService } from '../services/chatService';
import { exportService } from '../services/exportService';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  data?: any;
  visualizations?: Array<{
    type: 'plot' | 'map';
    data: any;
    config?: any;
  }>;
  suggestions?: string[];
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your ARGO Ocean Data assistant. I can help you analyze ocean temperature, salinity, depth profiles, and currents from global ARGO float networks. Try asking me questions like:\n\n• 'Show me temperature data for the North Atlantic in the last month'\n• 'What's the salinity trend near Australia?'\n• 'Display depth profiles for the Mediterranean'\n• 'Are there any temperature anomalies in the Arctic Ocean?'",
      timestamp: new Date(),
      suggestions: [
        "Show North Atlantic temperature trends",
        "Analyze Pacific Ocean salinity data",
        "Display global temperature anomalies",
        "Compare Mediterranean vs Atlantic data"
      ]
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window) {
      recognition.current = new (window as any).webkitSpeechRecognition();
      recognition.current!.continuous = false;
      recognition.current!.interimResults = false;
      recognition.current!.lang = 'en-US';

      recognition.current!.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognition.current!.onerror = () => {
        setIsListening(false);
        toast.error('Speech recognition error');
      };

      recognition.current!.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(inputValue);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.message,
        timestamp: new Date(),
        data: response.data,
        visualizations: response.visualizations,
        suggestions: response.suggestions,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error processing your request. Please try again or rephrase your question.',
        timestamp: new Date(),
        suggestions: [
          "Try a simpler query",
          "Check your connection",
          "Ask about temperature data",
          "Request help with ocean analysis"
        ]
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to process your query');
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    if (recognition.current) {
      if (isListening) {
        recognition.current.stop();
        setIsListening(false);
      } else {
        recognition.current.start();
        setIsListening(true);
        toast.success('Listening... Speak now');
      }
    } else {
      toast.error('Speech recognition not supported');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleExportChat = async () => {
    try {
      await exportService.exportChatToPDF(messages);
      toast.success('Chat exported to PDF successfully!');
    } catch (error) {
      toast.error('Failed to export chat');
    }
  };

  return (
    <div className="max-w-7xl mx-auto bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
      <div className="bg-slate-800/50 p-4 border-b border-slate-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Ocean Data Chat</h2>
            <p className="text-sm text-slate-300">AI-powered ARGO data analysis</p>
          </div>
          <button
            onClick={handleExportChat}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Chat</span>
          </button>
        </div>
      </div>

      <div className="h-[700px] overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 ml-3' 
                    : 'bg-gradient-to-r from-slate-600 to-slate-700 mr-3'
                }`}>
                  {message.type === 'user' ? 
                    <User className="h-5 w-5 text-white" /> : 
                    <Bot className="h-5 w-5 text-white" />
                  }
                </div>
                <div className={`rounded-2xl p-6 ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white' 
                    : 'bg-slate-700/80 text-slate-100'
                }`}>
                  <div className="whitespace-pre-line text-sm leading-relaxed">
                    {message.content}
                  </div>
                  
                  {message.visualizations && message.visualizations.length > 0 && (
                    <div className="mt-6 space-y-4">
                      {message.visualizations.map((viz, index) => (
                        <div key={index} className="bg-white rounded-xl p-4 shadow-lg">
                          {viz.type === 'plot' ? (
                            <PlotlyChart data={viz.data} config={viz.config} />
                          ) : (
                            <MapVisualization data={viz.data} config={viz.config} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-slate-300 mb-2">Suggested follow-up questions:</p>
                      <div className="flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-3 py-1 text-xs bg-slate-600/50 hover:bg-slate-600 rounded-full transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs mt-4 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex max-w-[85%]">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 mr-3 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="bg-slate-700/80 rounded-2xl p-6">
                <div className="flex items-center space-x-3">
                  <Loader className="h-5 w-5 text-cyan-400 animate-spin" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-slate-300">Analyzing ocean data...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t border-slate-600 bg-slate-800/30">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about ocean temperature, salinity, depth profiles, or currents..."
              className="w-full resize-none rounded-xl bg-slate-800 border border-slate-600 p-4 pr-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={handleVoiceInput}
              disabled={isLoading}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-slate-600 hover:bg-slate-500'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isListening ? (
                <MicOff className="h-4 w-4 text-white" />
              ) : (
                <Mic className="h-4 w-4 text-white" />
              )}
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed rounded-xl text-white transition-all duration-200 font-medium"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-3 text-xs text-slate-400 text-center">
          Pro tip: Try voice input by clicking the microphone or ask for specific ocean regions and parameters
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;