declare interface User {
  id: string;
  username: string;
  displayName?: string;
}

declare interface AuthSession extends User {
  token: string;
  friends: [];
  loggedIn: boolean;
}

declare interface UserData extends AuthSession {
  chats: [];
}

declare interface Chat {
  id: string;
  user: User;
  messages: Message[];
  isSelected: boolean;
  isTemp?: boolean;
  allMessagesAreLoaded: boolean;
}

declare interface Message {
  id: string;
  from: string;
  content: string;
  date: Date;
  chat?: Chat;
  chatId?: string;
}

declare interface TempChat {
  user?: User;
  messages?: Message[];
  id?: string;
}

declare interface MessageSent {
  id: message.id;
  chatId: string;
  clientMsgId?: string;
  clientChatId?: string;
}
