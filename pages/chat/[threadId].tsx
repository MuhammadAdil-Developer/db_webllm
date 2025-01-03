import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { ChatBox } from '../../components/ChatBox';
import { InitModal, InstructionModal } from '@/components/InitModal';

import { useChatStore } from '@/store/chat';

export function Loading() {
  return (
    <div className="flex flex-col justify-center items-center h-full w-full">

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
  const setWorkerConversationHistroy = useChatStore((state) => state.setWorkerConversationHistroy);

  useEffect(() => {
    setWorkerConversationHistroy();
  }, [setWorkerConversationHistroy]);
 
  const router = useRouter();
  const { threadId } = router.query;

  const loading = !useHasHydrated();
  if (loading) {
    return <Loading />;
  }

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
 
    </>
  );
}

export default ChatPage;
