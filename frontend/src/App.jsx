import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Sidebar from './Components/Sidebar/Sidebar';
import ChatHeader from './Components/ChatHeader/ChatHeader';
import MessageList from './Components/MessageList/MessageList';
import ChatInput from './Components/ChatInput/ChatInput';
import AuthModal from './Components/AuthModal/AuthModal';
import { useAuth } from './context/AuthContext';
import './App.css';

const API_BASE_URL = 'http://localhost:3777/api';

function App() {
  const { user, token, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/conversations`);
      if (response.data.success) {
        const data = response.data.data;
        const list = Array.isArray(data) ? data : data?.conversations || [];
        setConversations(list);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, []);

  // Fetch conversations on mount and when authentication state changes
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations, user, token]);

  useEffect(() => {
    scrollToBottom();
  }, [conversations, isLoading]);

  const handleSendMessage = async (question) => {
    if (!question || !question.trim()) return;

    // Optimistically add user message to the UI
    const tempUserMessage = {
      id: Date.now(),
      role: 'user',
      content: question,
    };
    setConversations((prev) => [...prev, tempUserMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat/conversations`, {
        question,
      });

      if (response.data.success) {
        const { userConversation, assistantConversation } = response.data.data;

        // Replace optimistic user message with the verified database records
        setConversations((prev) => {
          const filtered = prev.filter((msg) => msg.id !== tempUserMessage.id);
          return [
            ...filtered,
            userConversation || tempUserMessage,
            assistantConversation,
          ].filter(Boolean);
        });
      }
    } catch (error) {
      console.error('Error posting conversation:', error);

      const errorMessage =
        error.response?.data?.message ||
        'There was an error generating a response from the AI. Please try again.';

      const errorConversation = {
        id: Date.now() + 1,
        role: 'assistant',
        content: errorMessage,
      };

      setConversations((prev) => [...prev, errorConversation]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setConversations([]);
  };

  const handleClearHistory = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/chat/conversations`);
      setConversations([]);
    } catch (error) {
      console.error('Error clearing conversations:', error);
      setConversations([]);
    }
  };

  // Derive recent questions from conversations to display in sidebar
  const recentQuestions = Array.from(
    new Set(
      conversations
        .filter((msg) => msg.role === 'user')
        .map((msg) => msg.content)
    )
  ).reverse();

  return (
    <div className="app">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        onClearHistory={handleClearHistory}
        recentQuestions={recentQuestions}
        onSelectPrompt={handleSendMessage}
      />

      <main className="chat">
        <ChatHeader
          onNewChat={handleNewChat}
          onClearHistory={handleClearHistory}
          toggleSidebar={() => setSidebarOpen((prev) => !prev)}
          sidebarOpen={sidebarOpen}
        />

        <MessageList
          conversations={conversations}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
          onSelectPrompt={handleSendMessage}
        />

        <ChatInput
          handleSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </main>

      {/* Login and Registration Modal */}
      <AuthModal />
    </div>
  );
}

export default App;
