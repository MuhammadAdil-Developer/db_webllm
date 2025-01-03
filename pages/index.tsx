import React, { useEffect, useState } from 'react';

import dynamic from 'next/dynamic';
import Image from 'next/image';

import { InitModal, InstructionModal } from '@/components/InitModal';

import { useChatStore } from '@/store/chat';

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

  useEffect(() => {
    setWorkerConversationHistroy();
  }, [setWorkerConversationHistroy]);

  const loading = !useHasHydrated();
  if (loading) {
    return <Loading />;
  }

  // Get the current threadId from the conversations state
  const threadId = curConversationIndex >= 0 && curConversationIndex < conversations.length
  ? conversations[curConversationIndex].thread_id
  : '';


  return (
    <>
      <div className="bg-base-100 drawer drawer-mobile">
        <input id="my-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content p-2">
          {/* Pass the threadId prop to ChatBox */}
          <ChatBox threadId={threadId} />
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer" className="drawer-overlay"></label>
          <aside className="bg-base-200 w-70">
            <Sidebar />
          </aside>
        </div>
      </div>
    </>
  );
}

export default Home;



