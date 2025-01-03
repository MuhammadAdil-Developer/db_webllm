import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IconAdd, IconInfo, IconSetting } from './Icons';
import { useChatStore } from '@/store/chat';

function BottomSettings({ onNewConversation, username }: { onNewConversation: () => void, username: string }) {
  const chatStore = useChatStore();

  const isDisabled = username !== 'a51nha';

  return (
    <div className="flex items-center justify-between py-5 relative bottom-0 px-4">
      <div className="flex">
        <div
          className={`tooltip pl-3 ${isDisabled ? 'cursor-not-allowed' : ''}`}
          data-tip="connect DB"
          data-place="top"
        >
          <button
            onClick={() => !isDisabled && chatStore.toggleInstuctionModal(true)}
            className={`btn btn-ghost btn-xs -ml-2 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isDisabled}
          >
            <IconInfo />
          </button>
        </div>

        <div 
          className={`tooltip pl-3 ${isDisabled ? 'cursor-not-allowed' : ''}`}
          data-tip="in developing..." 
          data-place="top"
        >
          <button 
            className={`btn btn-ghost btn-xs -ml-2 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isDisabled}
          >
            <IconSetting />
          </button>
        </div>
      </div>

      <button
        onClick={onNewConversation}
        className="btn btn-ghost btn-xs"
      >
        <IconAdd />
      </button>
    </div>
  );
}


export const Sidebar = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('');
  const router = useRouter();
  const {
    curConversationIndex,
    setCurConversationIndex,
    clearChatState,
    setConversationMessages,
  } = useChatStore(state => ({
    curConversationIndex: state.curConversationIndex,
    setCurConversationIndex: state.setCurConversationIndex,
    clearChatState: state.clearChatState,
    setConversationMessages: state.setConversationMessages,
  }));

  const fetchThreadIds = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://aicallcenter.us/chat');
      setConversations(response.data);
      // Set user role from API response
      if (response.data.length > 0 && response.data[0].username) {
        setUserRole(response.data[0].username);
      }
            if (response.data.length > 0) {
        setCurConversationIndex(0);
      }
    } catch (error) {
      console.error('Failed to fetch threads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreadIds();
  }, []);
  
  useEffect(() => {
    if (curConversationIndex === -1 || curConversationIndex >= conversations.length) {
      return;
    }

    const threadId = conversations[curConversationIndex].thread_id;
    fetchChatHistory(threadId);
  }, [curConversationIndex, conversations]);

  const fetchChatHistory = async (threadId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`https://aicallcenter.us/chat?thread_id=${threadId}`);
      setConversationMessages(threadId, response.data.messages || []);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThreadClick = (threadId: string, index: number) => {
    setCurConversationIndex(index);
    router.push(`/chat/${threadId}`);
  };
  
  const handleNewConversation = async () => {
    setCurConversationIndex(-1);
    clearChatState();
    router.push('/');
  };

  return (
    <div className="top-0 p-2 flex flex-col relative max-h-[100vh] h-[100vh] shadow-xl rounded-lg bg-gradient-to-b from-[#282A36] via-[#282A36] to-[#3A3C49]">
      <div className="bg-[#282A36] bg-opacity-90 backdrop-blur sticky top-0 items-center gap-2 px-4 py-2 rounded-md shadow-xl">
        <div className="font-title transition-all duration-200 md:text-2xl">
          <div className="my-1 text-xl font-bold capitalize">
            Ai Data Reporting
          </div>
        </div>
        <div className="text-base-content text-xs opacity-60 font-bold">
          AI assistant running in browser.
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <div className="loader animate-spin"></div>
        </div>
      ) : (
        <div className="overflow-auto flex-1 overflow-x-hidden">
          <ul className="menu menu-compact menu-vertical flex flex-col">
            {conversations.map((item, i) => (
              <li
                key={item.thread_id}
                onClick={() => handleThreadClick(item.thread_id, i)}
                className={`cursor-pointer transition-all duration-150 ease-in-out rounded-md p-2 mb-2
                  ${i === curConversationIndex ? 'bg-blue-600 text-white shadow-md scale-95' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm w-[180px] truncate">{item.heading || "New Chat"}</div>
                  <div className="text-xs text-gray-400 flex-1 pl-2 text-right opacity-80">
                    {item.messages?.length > 0 && `Messages: ${item.messages.length}`}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    <BottomSettings onNewConversation={handleNewConversation} username={userRole} />
</div>
  );
};

export default Sidebar;