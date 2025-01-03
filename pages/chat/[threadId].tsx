import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { ChatBox } from '../../components/ChatBox';
import { InitModal, InstructionModal } from '@/components/InitModal';

import { useChatStore } from '@/store/chat';
import axios from 'axios';

export function Loading() {
  return (
    <div className="flex flex-col justify-center items-center h-full w-full">
      {/* Add any loading content here */}
    </div>
  );
}

const Sidebar = dynamic(
  async () => (await import('../../components/SideBar')).Sidebar,
  {
    loading: () => <Loading />,
  }
);

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

function ChatPage() {
  const [username, setUsername] = useState<string>('');
  const setWorkerConversationHistroy = useChatStore((state) => state.setWorkerConversationHistroy);

  useEffect(() => {
    setWorkerConversationHistroy();
  }, [setWorkerConversationHistroy]);

  const router = useRouter()
  const { threadId } = router.query;

  const loading = !useHasHydrated();
  if (loading) {
    return <Loading />;
  }

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8080/chat');
        if (response.data.length > 0 && response.data[0].username) {
          setUsername(response.data[0].username); // Set username state
        }
      } catch (error) {
        console.error('Failed to fetch username:', error);
      }
    };

    fetchUsername();
  }, []);

  const showModals = username === 'a51nha';

  return (
    <>
      <div className="bg-base-100 drawer drawer-mobile">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content p-2">
          <ChatBox threadId={threadId as string} />
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer" className="drawer-overlay"></label>
          <aside className="bg-base-200 w-70">
            <Sidebar />
          </aside>
        </div>
      </div>

      {/* Conditionally render modals based on username */}
      {showModals && <InitModal />}
      {showModals && <InstructionModal />}
    </>
  );
}

export default ChatPage;
