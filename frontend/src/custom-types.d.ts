declare interface User {
  id: string;
  username: string;
}

declare interface AuthSession extends User {
  token: string;
  friends: [];
  loggedIn: boolean;
}

declare interface UserData extends AuthSession {
  chats?: [];
}

declare interface Chat {
  id: string;
  user: User;
  messages: Message[];
  isSelected: boolean;
  isTemp?: boolean;
  allMessagesAreLoaded: boolean;
}

type MessageState = 'SENDING' | 'SENT' | 'RECEIVED' | 'SEEN';
declare interface Message {
  id: string;
  from: string;
  content: string;
  date: Date;
  state: MessageState;
  chat?: Chat;
  chatId?: string;
}

declare interface TempChat {
  user?: User;
  messages?: Message[];
  id?: string;
}

declare interface MessageChangeState {
  id: message.id;
  chatId: string;
  newState: MessageState;
  clientMsgId?: string;
  clientChatId?: string;
}
