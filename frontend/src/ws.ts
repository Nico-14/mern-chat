import { v4 as uuidv4 } from 'uuid';

type NewMessageListener = (message: Message) => void;
type MessageChangeStateListener = (message: MessageChangeState) => void;

class ChatSocket {
  #newMessageListeners: NewMessageListener[];
  #messageChangeStateListeners: MessageChangeStateListener[];

  #ws!: WebSocket;

  constructor() {
    this.#newMessageListeners = [];
    this.#messageChangeStateListeners = [];
    this.connect();
  }

  get state() {
    return this.#ws.readyState;
  }

  auth() {
    if (this.#ws.readyState !== WebSocket.OPEN || !sessionStorage.getItem('token')) return;
    const msg = {
      type: 'AUTHENTICATE',
      payload: {
        token: sessionStorage.getItem('token'),
      },
    };
    this.#ws.send(JSON.stringify(msg));
  }

  connect() {
    this.#ws = new WebSocket('ws://localhost:8080/ws');

    this.#ws.onopen = () => {
      this.auth();

      this.#ws.onmessage = (ev: MessageEvent) => {
        const data = JSON.parse(ev.data);
        console.log(data.type, data.payload);

        switch (data.type) {
          case 'NEW_MESSAGE':
            for (const listener of this.#newMessageListeners) {
              if (typeof listener === 'function') listener(data.payload);
            }
            break;
          case 'MESSAGE_CHANGE_STATE':
            for (const listener of this.#messageChangeStateListeners) {
              if (typeof listener === 'function') listener(data.payload);
            }
            break;
          case 'USER_CHANGE_STATE':
            break;
          default:
        }
      };
    };

    this.#ws.onclose = () => {
      setTimeout(() => this.connect(), 1000);
    };

    this.#ws.onerror = () => {
      this.#ws.close();
    };
  }

  addNewMessageListener(listener: NewMessageListener) {
    this.#newMessageListeners.push(listener);
  }

  removeNewMessageListener(listener: NewMessageListener) {
    const index = this.#newMessageListeners.indexOf(listener);
    if (index > -1) this.#newMessageListeners.splice(index, 1);
  }

  addMessageChangeStateListener(listener: MessageChangeStateListener) {
    this.#messageChangeStateListeners.push(listener);
  }

  removeMessageChangeStateListener(listener: MessageChangeStateListener) {
    const index = this.#messageChangeStateListeners.indexOf(listener);
    if (index > -1) this.#messageChangeStateListeners.splice(index, 1);
  }

  addUserChangeStateListener(listener: Function) {}

  sendMessage(
    content: string,
    clientId: string,
    toId: string,
    chatId?: string | null,
    clientChatId?: string | null
  ): {
    content: string;
    from: string;
    date: Date;
    clientMsgId: string;
  } {
    const clientMsgId = uuidv4();
    const msg = {
      type: 'SEND_MESSAGE',
      payload: {
        content,
        from: clientId,
        to: toId,
        chatId,
        date: new Date(),
        clientMsgId,
        clientChatId,
      },
    };
    this.#ws.send(JSON.stringify(msg));
    return msg.payload;
  }
}

const chatSocket = new ChatSocket();

export default chatSocket;
