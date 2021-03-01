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

type ChatsActions =
  | AddChatAction
  | DeleteChatAction
  | SelectChatAction
  | AddChatMessageAction
  | UpdateClientChatIdAction
  | UpdateClientMessageIdAction
  | RemoveTempAction
  | UpdateMessageStateAction
  | LoadChatsAction;

//Actions
export function addChat(chat: Chat): ChatsActions {
  return {
    type: ADD_CHAT,
    payload: chat,
  };
}

export function deleteChat(id: string): ChatsActions {
  return {
    type: DELETE_CHAT,
    payload: id,
  };
}

export function selectChat(id: string): ChatsActions {
  return {
    type: SELECT_CHAT,
    payload: id,
  };
}

export function addChatMessage(id: string, message: Message): ChatsActions {
  return {
    type: ADD_CHAT_MESSAGE,
    payload: { id, message },
  };
}

export function updateClientChatId(id: string, serverId: string): ChatsActions {
  return {
    type: UPDATE_CLIENT_CHAT_ID,
    payload: {
      id,
      serverId,
    },
  };
}

export function updateClientMessageId(chatId: string, id: string, serverId: string): ChatsActions {
  return {
    type: UPDATE_CLIENT_MESSAGE_ID,
    payload: {
      chatId,
      id,
      serverId,
    },
  };
}

export function removeTemp(id: string): ChatsActions {
  return {
    type: REMOVE_TEMP,
    payload: id,
  };
}

export function updateMessageState(chatId: string, id: string, newState: MessageState): ChatsActions {
  return {
    type: UPDATE_MESSAGE_STATE,
    payload: {
      chatId,
      id,
      newState,
    },
  };
}

export function loadChats(chats: Chat[]): ChatsActions {
  return {
    type: LOAD_CHATS,
    payload: chats,
  };
}

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
        chat.id === action.payload.id ? { ...chat, messages: [...chat.messages, action.payload.message] } : chat
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
    default:
      return state;
  }
};

export default reducer;
