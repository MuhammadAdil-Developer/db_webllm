// import { useRouter } from 'next/router';
// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { ChatBox } from '../components/ChatBox';
// import { Loading } from '@/pages';
// import { InitModal, InstructionModal } from '@/components/InitModal';
// import { useChatStore } from '@/store/chat';

// const Sidebar = dynamic(
//   async () => (await import('../components/SideBar')).Sidebar,
//   {
//     loading: () => <Loading />,
//   },
// );

// export default function ChatPage() {
//   const router = useRouter();
//   const { threadId } = router.query; // Get thread_id from URL
//   const [messages, setMessages] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);

//   // Fetch chat history based on threadId
//   useEffect(() => {
//     if (!threadId) return;

//     const fetchChatHistory = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get(`http://127.0.0.1:8000/chat?thread_id=${threadId}`);
//         setMessages(response.data.messages || []);
//       } catch (error) {
//         console.error('Failed to fetch chat history:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchChatHistory();
//   }, [threadId]);

//   if (loading) {
//     return <Loading />;
//   }

//   return (
//     <>
//       <div className="bg-base-100 drawer drawer-mobile">
//         <input id="my-drawer" type="checkbox" className="drawer-toggle" />
//         <div className="drawer-content p-2">
//           <ChatBox />
//         </div>
//         <div className="drawer-side">
//           <label htmlFor="my-drawer" className="drawer-overlay"></label>
//           <aside className="bg-base-200 w-70">
//             <Sidebar />
//           </aside>
//         </div>
//       </div>
//       <InitModal />
//       <InstructionModal />
//     </>
//   );
// }
