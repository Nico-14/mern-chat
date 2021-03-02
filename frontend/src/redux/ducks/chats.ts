//Types
const ADD_CHAT = 'ADD_CHAT';
const DELETE_CHAT = 'DELETE_CHAT';
const SELECT_CHAT = 'SELECT_CHAT';
const ADD_CHAT_MESSAGE = 'ADD_CHAT_MESSAGE';
const UPDATE_CLIENT_CHAT_ID = 'UPDATE_CLIENT_CHAT_ID';
const UPDATE_CLIENT_MESSAGE_ID = 'UPDATE_CLIENT_MESSAGE_ID';
const REMOVE_TEMP = 'REMOVE_TEMP';
const UPDATE_MESSAGE_STATE = 'UPDATE_MESSAGE_STATE';
const LOAD_CHATS = 'LOAD_CHATS';
const LOAD_OLD_MESSAGES = 'LOAD_OLD_MESSAGES';
const SET_CHAT_ALL_MESSAGES_ARE_LOADED = 'SET_CHAT_ALL_MESSAGES_ARE_LOADED';

//Actions definitions
interface AddChatAction {
  type: typeof ADD_CHAT;
  payload: Chat;
}

interface DeleteChatAction {
  type: typeof DELETE_CHAT;
  payload: string;
}

interface SelectChatAction {
  type: typeof SELECT_CHAT;
  payload: string;
}

interface AddChatMessageAction {
  type: typeof ADD_CHAT_MESSAGE;
  payload: {
    id: string;
    message: Message;
  };
}

interface UpdateClientChatIdAction {
  type: typeof UPDATE_CLIENT_CHAT_ID;
  payload: {
    id: string;
    serverId: string;
  };
}

interface UpdateClientMessageIdAction {
  type: typeof UPDATE_CLIENT_MESSAGE_ID;
  payload: {
    chatId: string;
    id: string;
    serverId: string;
  };
}

interface RemoveTempAction {
  type: typeof REMOVE_TEMP;
  payload: string;
}

interface UpdateMessageStateAction {
  type: typeof UPDATE_MESSAGE_STATE;
  payload: {
    chatId: string;
    id: string;
    newState: MessageState;
  };
}

interface LoadChatsAction {
  type: typeof LOAD_CHATS;
  payload: Chat[];
}

interface LoadOldMessagesAction {
  type: typeof LOAD_OLD_MESSAGES;
  payload: {
    id: string;
    messages: Message[];
  };
}

interface SetChatAllMessagesAreLoadedAction {
  type: typeof SET_CHAT_ALL_MESSAGES_ARE_LOADED;
  payload: string;
}

type ChatsActions =
  | AddChatAction
  | DeleteChatAction
  | SelectChatAction
  | AddChatMessageAction
  | UpdateClientChatIdAction
  | UpdateClientMessageIdAction
  | RemoveTempAction
  | UpdateMessageStateAction
  | LoadChatsAction
  | LoadOldMessagesAction
  | SetChatAllMessagesAreLoadedAction;

//Actions
export const addChat = (chat: Chat): ChatsActions => ({
  type: ADD_CHAT,
  payload: chat,
});

export const deleteChat = (id: string): ChatsActions => ({
  type: DELETE_CHAT,
  payload: id,
});

export const selectChat = (id: string): ChatsActions => ({
  type: SELECT_CHAT,
  payload: id,
});

export const addChatMessage = (id: string, message: Message): ChatsActions => {
  return {
    type: ADD_CHAT_MESSAGE,
    payload: { id, message },
  };
};

export const updateClientChatId = (id: string, serverId: string): ChatsActions => ({
  type: UPDATE_CLIENT_CHAT_ID,
  payload: {
    id,
    serverId,
  },
});

export const updateClientMessageId = (chatId: string, id: string, serverId: string): ChatsActions => ({
  type: UPDATE_CLIENT_MESSAGE_ID,
  payload: {
    chatId,
    id,
    serverId,
  },
});

export const removeTemp = (id: string): ChatsActions => ({
  type: REMOVE_TEMP,
  payload: id,
});

export const updateMessageState = (chatId: string, id: string, newState: MessageState): ChatsActions => ({
  type: UPDATE_MESSAGE_STATE,
  payload: {
    chatId,
    id,
    newState,
  },
});

export const loadChats = (chats: Chat[]): ChatsActions => ({
  type: LOAD_CHATS,
  payload: chats,
});

export const loadOldMessages = (id: string, messages: Message[]): ChatsActions => ({
  type: LOAD_OLD_MESSAGES,
  payload: { id, messages },
});

export const setChatAllMessagesAreLoaded = (id: string): ChatsActions => ({
  type: SET_CHAT_ALL_MESSAGES_ARE_LOADED,
  payload: id,
});

const reducer = (state: Chat[] = [], action: ChatsActions): Chat[] => {
  switch (action.type) {
    case ADD_CHAT:
      return !state.some((chat) => chat.id === action.payload.id)
        ? [...state, { ...action.payload, messages: [] }]
        : state;
    case DELETE_CHAT:
      return state.filter((chat) => chat.id !== action.payload);
    case SELECT_CHAT:
      return state.map((chat) =>
        chat.id === action.payload
          ? { ...chat, isSelected: true }
          : chat.isSelected
          ? { ...chat, isSelected: false }
          : chat
      );
    case ADD_CHAT_MESSAGE:
      return state.map((chat) =>
        chat.id === action.payload.id
          ? {
              ...chat,
              messages: [...chat.messages, action.payload.message],
            }
          : chat
      );
    case UPDATE_CLIENT_CHAT_ID:
      return state.map((chat) => (chat.id === action.payload.id ? { ...chat, id: action.payload.serverId } : chat));
    case UPDATE_CLIENT_MESSAGE_ID:
      return state.map((chat) =>
        chat.id === action.payload.chatId
          ? {
              ...chat,
              messages: chat.messages.map((message) =>
                message.id === action.payload.id ? { ...message, id: action.payload.serverId, state: 'SENT' } : message
              ),
            }
          : chat
      );
    case REMOVE_TEMP:
      return state.map((chat) => (chat.id === action.payload ? { ...chat, isTemp: false } : chat));
    case UPDATE_MESSAGE_STATE:
      return state.map((chat) =>
        chat.id === action.payload.chatId
          ? {
              ...chat,
              messages: chat.messages.map((chat) =>
                chat.id === action.payload.id ? { ...chat, state: action.payload.newState } : chat
              ),
            }
          : chat
      );
    case LOAD_CHATS:
      return [
        ...(action.payload || []).map((chat) => ({
          ...chat,
          messages: chat.messages.map((message) => ({ ...message, date: new Date(message.date) })),
        })),
      ];
    case LOAD_OLD_MESSAGES:
      return state.map((chat) =>
        chat.id === action.payload.id
          ? {
              ...chat,
              messages: [
                ...action.payload.messages.reverse().map((message) => ({ ...message, date: new Date(message.date) })),
                ...chat.messages,
              ],
            }
          : chat
      );
    case SET_CHAT_ALL_MESSAGES_ARE_LOADED:
      return state.map((chat) => (chat.id === action.payload ? { ...chat, allMessagesAreLoaded: true } : chat));
    default:
      return state;
  }
};

export default reducer;
