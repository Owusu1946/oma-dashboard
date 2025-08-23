import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { 
  PaperAirplaneIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

export default function ChatViewer() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { supabase } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userData, setUserData] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    if (sessionId) {
      fetchChatSession();
      
      // Set up a subscription for real-time messages
      let subscription;
      if (supabase) {
        subscription = supabase
          .channel('messages-changes')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `session_id=eq.${sessionId}`
          }, (payload) => {
            setMessages(prev => [...prev, payload.new]);
          })
          .subscribe();
      }
      
      return () => {
        // Clean up subscription on unmount
        if (subscription) {
          supabase.removeChannel(subscription);
        }
      };
    }
  }, [sessionId, supabase]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatSession = async () => {
    if (!supabase || !sessionId) return;
    
    try {
      setLoading(true);
      
      // Get session data
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select(`
          *,
          users (
            id,
            phone_number,
            first_name,
            consent_given
          )
        `)
        .eq('id', sessionId)
        .single();
      
      if (sessionError) throw sessionError;
      
      if (session?.users) {
        setUserData(session.users);
        setSessionData(session);
      }
      
      // Get messages
      const { data: chatMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      
      if (messagesError) throw messagesError;
      
      setMessages(chatMessages || []);
    } catch (error) {
      console.error('Error fetching chat session:', error);
      setError('Failed to load chat session');
      toast.error('Failed to load chat session');
    } finally {
      setLoading(false);
    }
  };

  // Determine where to navigate back to
  const handleBackNavigation = () => {
    // Check if the session was initiated by an admin from the users page
    if (sessionData?.metadata?.initiated_by === 'admin') {
      navigate(`/users/${userData?.id || ''}`);
    } 
    // If this was from an escalation
    else if (location.state?.from === 'escalations') {
      navigate('/escalations');
    }
    // Default fallback - go to the user profile or users list
    else if (userData?.id) {
      navigate(`/users/${userData.id}`);
    } else {
      navigate('/users');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const messageToSend = newMessage.trim();
    setNewMessage('');
    
    // Optimistically add message to UI
    const tempMessage = {
      id: `temp_${Date.now()}`,
      content: messageToSend,
      direction: 'outbound',
      created_at: new Date().toISOString(),
      user: { first_name: 'Admin' }
    };
    
    setMessages(prevMessages => [...prevMessages, tempMessage]);
    
    try {
      // Hardcoded correct API URL - API service runs on port 3000
      const apiUrl = 'http://localhost:3000/admin/send';
      console.log(`Sending message to: ${apiUrl}`);
      
      // Use the admin send endpoint which works in development mode
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id,
          sessionId: sessionId,
          message: messageToSend,
          phoneNumber: userData.phone_number // Add phone number to ensure it's sent to WhatsApp
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      // Message sent successfully
      toast.success('Message sent to user via WhatsApp!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      
      // Remove the optimistic message
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempMessage.id));
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    return format(new Date(timestamp), 'h:mm a');
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p>{error}</p>
        <button 
          onClick={handleBackNavigation}
          className="mt-2 btn btn-primary flex items-center"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleBackNavigation}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            
            {loading ? (
              <div className="h-8 w-40 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Chat with {userData?.first_name || 'User'}
                </h1>
                <p className="text-sm text-gray-500">
                  {userData?.phone_number}
                </p>
              </div>
            )}
          </div>
          
          {userData?.consent_given === false && (
            <div className="flex items-center text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-sm">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              No consent given
            </div>
          )}
        </div>
      </div>
      
      {/* Chat Messages */}
      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center p-6">
              <div className="bg-blue-50 p-4 rounded-lg text-blue-700 mb-4 inline-block">
                <p className="font-medium">New Conversation</p>
                <p className="text-sm mt-1">
                  This is a new conversation with {userData?.first_name || 'the user'}.
                  {sessionData?.metadata?.initiated_by === 'admin' && 
                    " You initiated this chat as an administrator."}
                </p>
                <p className="text-sm mt-2">Type your message below to start the conversation.</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.direction === 'inbound' ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg ${
                    message.direction === 'inbound'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-primary-600 text-white'
                  }`}
                >
                  <div className="text-sm">
                    {message.content}
                  </div>
                  <div className={`text-xs mt-1 ${
                    message.direction === 'inbound'
                      ? 'text-gray-500'
                      : 'text-primary-200'
                  }`}>
                    {formatMessageTime(message.created_at)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
      
      {/* Message Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={sendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={loading || sending || !userData}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading || sending || !newMessage.trim() || !userData}
            className="btn btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="animate-spin h-5 w-5 mr-2 border-t-2 border-b-2 border-white rounded-full"></div>
            ) : (
              <PaperAirplaneIcon className="h-5 w-5 mr-2" />
            )}
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
