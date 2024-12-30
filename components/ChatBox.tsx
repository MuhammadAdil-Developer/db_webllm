import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useChatStore } from '@/store/chat';
import { IconDelete, IconRename, IconSend } from './Icons';
import { Loading } from '@/pages';
import axios from 'axios';

const Markdown = dynamic(async () => (await import('./markdown')).Markdown, {
  loading: () => <Loading />,
});

function useScrollToBottom() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollToBottom = () => {
    const dom = scrollRef.current;
    if (dom) {
      setTimeout(() => (dom.scrollTop = dom.scrollHeight), 1);
    }
  };

  useLayoutEffect(() => {
    autoScroll && scrollToBottom();
  });

  return {
    scrollRef,
    autoScroll,
    setAutoScroll,
    scrollToBottom,
  };
}

export function ChatBox({ threadId }: { threadId: string }) {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<
    { type: "user" | "assistant"; content: string; timestamp: string; isLoading?: boolean }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const { scrollRef, setAutoScroll, scrollToBottom } = useScrollToBottom();
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(threadId);
  const chatStore = useChatStore();
  const [heading, setHeading] = useState<string>('AI Data Reporting');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://20.81.171.209:8080/chat?thread_id=${threadId}`);
        
        const threadData = response.data[0];
        
        if (!threadData) {
          console.error('No thread data found');
          return;
        }

        const { human_message, ai_response, heading: apiHeading } = threadData;

        // Set the heading dynamically from the API response
        if (apiHeading) {
          setHeading(apiHeading);
        }

        // Create an interleaved array of messages
        const allMessages: { type: 'user' | 'assistant'; content: string; timestamp: string }[] = [];
        
        // Assuming human_message and ai_response arrays are of same length and correspond to each other
        const maxLength = Math.max(human_message?.length || 0, ai_response?.length || 0);
        
        for (let i = 0; i < maxLength; i++) {
          // Add human message if it exists
          if (human_message?.[i]) {
            allMessages.push({
              type: 'user',
              content: human_message[i],
              timestamp: new Date(Date.now() - (maxLength - i) * 60000).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })
            });
          }
          
          // Add AI response if it exists
          if (ai_response?.[i]) {
            allMessages.push({
              type: 'assistant',
              content: ai_response[i],
              timestamp: new Date(Date.now() - (maxLength - i) * 60000).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })
            });
          }
        }

        setMessages(allMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    if (threadId) {
      fetchMessages();
    }
  }, [threadId]);

  const submitUserInput = async () => {
    if (userInput.trim().length === 0 || loading) return;
  
    const getCurrentTimestamp = () => {
      const now = new Date();
      return now.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    };
  
    const newUserMessage = {
      type: "user" as const,
      content: userInput,
      timestamp: getCurrentTimestamp(),
    };
  
    setMessages((prev) => [...prev, newUserMessage]);
    setUserInput("");
    setAutoScroll(true);
  
    try {
      setLoading(true);
  
      setMessages((prev) => [
        ...prev,
        { type: 'assistant', content: '', timestamp: getCurrentTimestamp(), isLoading: true },
      ]);
  
      const url = currentThreadId
        ? `http://20.81.171.209:8080/chat?thread_id=${currentThreadId}`
        : 'http://20.81.171.209:8080/chat';
  
      const response = await axios.post(url, {
        message: newUserMessage.content,
        chat_type: "Q&A with stored SQL-DB",
        app_functionality: "Chat",
      });
  
      const data = response.data;
  
      // Get the latest AI response
      const aiResponse = data.ai_response?.slice(-1)[0] || 'No response received.';
  
      if (data.thread_id) {
        setCurrentThreadId(data.thread_id);
        window.history.pushState({}, '', `/chat/${data.thread_id}`);
  
        if ((window as any).refreshSidebarThreads) {
          (window as any).refreshSidebarThreads();
        }
      }
  
      setMessages((prev) => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1] = {
          type: 'assistant',
          content: aiResponse,
          timestamp: getCurrentTimestamp(),
        };
        return updatedMessages;
      });
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { type: 'assistant', content: 'Failed to get a response. Please try again.', timestamp: getCurrentTimestamp() },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };
  

  return (
    <div className="top-0 p-2 flex flex-col relative max-h-[100vh] h-[100vh]">
      {/* Header */}
      <div className="w-full px-4 flex justify-between items-center py-2 border-b border-solid border-black border-opacity-10">
        <div className="transition-all duration-200">
          <div className="my-1 text-xl font-bold">{heading}</div> {/* Dynamic heading */}
          <div className="text-base-content text-xs opacity-40 font-bold">
            {messages.length} messages
          </div>
        </div>
        <div className="flex justify-between">
          <button
            onClick={() => {
              const conversationName = window.prompt('Enter name: ');
              if (!conversationName) return;
              setCurrentThreadId('new-thread-id');
            }}
            className="btn btn-ghost btn-xs"
          >
            <IconRename />
          </button>
          <button className="btn btn-ghost btn-xs">
            <IconDelete />
          </button>
        </div>
      </div>


      {/* Welcome Section */}
      {messages.length === 0 && (
        <div className="flex flex-col py-6 p-10 ml-8 items-center">
          <div className="inline-block bg-gradient-to-r from-blue-500 to-teal-400 text-white px-6 py-2 rounded-full text-normal font-semibold shadow-lg transform transition-all hover:scale-105">
            <span className="text-lg font-bold">Welcome to AI Data Reporting</span>
          </div>
          <h1 className="text-6xl font-bold mt-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500 drop-shadow-2xl">
            Hi there,{' '}
            <span className="bg-gradient-to-r from-pink-300 via-purple-400 to-indigo-300 bg-clip-text font-extrabold text-6xl animate-pulse drop-shadow-2xl">
              User
            </span>
          </h1>
          <h2 className="text-4xl font-bold mt-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-400 drop-shadow-lg">
            What would you like to know?
          </h2>
          <p className="text-gray-500 mt-4 text-lg max-w-2xl text-center leading-relaxed">
            Simply ask your question in everyday language and uncover insights instantly,
            effortlessly!
          </p>
        </div>
      )}

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="h-full overflow-auto py-4 border-b border-solid border-black border-opacity-10"
      >
        {messages.map((item, i) => (
          <div key={i} className={`chat ${item.type === 'user' ? 'chat-end' : 'chat-start'}`}>
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img
                  src={item.type === 'assistant' ? '/vicuna.jpeg' : '/user.jpg'}
                  alt=""
                  width={40}
                  height={40}
                />
              </div>
            </div>
            <div className="chat-bubble">
              {item.isLoading ? (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                <div>{item.content}</div>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">{item.timestamp}</div>
          </div>
        ))}
        {!messages.some((item) => item.isLoading) && loading && (
          <div className="chat chat-start">
            <div className="chat-image avatar">
              <div className="w-10 rounded-full">
                <img src="/vicuna.jpeg" alt="" width={40} height={40} />
              </div>
            </div>
            <div className="chat-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="relative bottom-0 p-4">
        <div className="bg-base-100 flex items-center justify-center h-full z-30 relative">
          <div className="relative w-[50%]">
            <textarea
              className="textarea textarea-primary textarea-bordered textarea-sm w-full pr-10 focus:outline-none focus:ring-4 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-200 transition-all duration-300 ease-in-out"
              placeholder="What insights are you looking for today?"
              value={userInput}
              onChange={(e) => setUserInput(e.currentTarget.value)}
              onFocus={(e) => {
                setAutoScroll(true);
                e.target.classList.add('textarea-focus');
              }}
              onBlur={(e) => {
                setAutoScroll(false);
                e.target.classList.remove('textarea-focus');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  submitUserInput();
                }
              }}
            />
            <button
              onClick={submitUserInput}
              className="absolute top-5 right-2 btn btn-ghost btn-xs flex items-center justify-center"
            >
              <IconSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}