import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { InitModal, InstructionModal } from '@/components/InitModal';
import { useChatStore } from '@/store/chat';
import axios from 'axios';

export function Loading() {
  return (
    <div className="flex flex-col justify-center items-center h-full w-full">
      <Image
        src="loading.svg"
        alt=""
        width={30}
        height={14}
        className="invert-[0.5]"
      />
    </div>
  );
}

const Sidebar = dynamic(
  async () => (await import('../components/SideBar')).Sidebar,
  {
    loading: () => <Loading />,
  },
);

const ChatBox = dynamic(
  async () => (await import('../components/ChatBox')).ChatBox,
  {
    loading: () => <Loading />,
  },
);

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

function Home() {
  const [setWorkerConversationHistroy, curConversationIndex, conversations] = useChatStore((state) => [
    state.setWorkerConversationHistroy,
    state.curConversationIndex,
    state.conversations,
  ]);

  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    setWorkerConversationHistroy();
  }, [setWorkerConversationHistroy]);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/chat');
        if (response.data.length > 0 && response.data[0].username) {
          setUsername(response.data[0].username);
        }
      } catch (error) {
        console.error('Failed to fetch username:', error);
      }
    };

    fetchUsername();
  }, []);

  const loading = !useHasHydrated();
  if (loading) {
    return <Loading />;
  }

  const threadId = curConversationIndex >= 0 && curConversationIndex < conversations.length
    ? conversations[curConversationIndex].thread_id
    : '';

  const showModals = username === 'a51nha';

  return (
    <>
      <div className="bg-base-100 drawer drawer-mobile">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content p-2">

          <ChatBox threadId={threadId} />
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer" className="drawer-overlay"></label>
          <aside className="bg-base-200 w-70">
            <Sidebar />
          </aside>
        </div>
      </div>

      {showModals && <InitModal />}
      {showModals && <InstructionModal />}
    </>
  );
}

export default Home;
