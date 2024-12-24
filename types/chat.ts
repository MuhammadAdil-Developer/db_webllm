export type Message = {
  content: string;
  type: 'assistant' | 'system' | 'user' | 'init';
  createTime: string;
  id: number;
  isStreaming?: boolean;
  isError?: boolean;
  isInit?: boolean;
  isLoading?: boolean;
  updateTime?: string;
  statsText?: string;
};

export interface ChatConversation {
  thread_id: string;
  id: number;
  messages: Message[];
  createTime: string;
  updateTime: string;
  title: string;
}


export type UpdateBotMsg = (msg: Partial<Message>) => void;

export type UpdateInitMsg = (msg: Partial<Message>) => void;

export type InitInfo = {
  showModal: boolean;
  initMsg: Message[];
};
