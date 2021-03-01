import WebSocket from 'ws';
import * as http from 'http';
import app from './app';
import jwt from 'jsonwebtoken';
import MessageModel from './models/message.model';
import UserModel from './models/user.model';
import ChatModel from './models/chat.model';

const onlineUsers = new Map<string, WebSocket>();

interface WebSocketClient extends WebSocket {
  id?: string;
}

function toEvent(this: any, message: any) {
  try {
    const event = JSON.parse(message);
    this.emit(event.type, event.payload);
  } catch (err) {
    console.log('not an event', err);
  }
}

const sendMessage = (ws: WebSocket, type: string, payload: any) => {
  ws.send(
    JSON.stringify({
      type,
      payload,
    })
  );
};

const server = http.createServer(app);
const wss = new WebSocket.Server({
  server: server,
  path: '/ws',
});

wss.on('connection', (ws: WebSocketClient) => {
  ws.on('message', toEvent)
    .on('AUTHENTICATE', (data: any) => {
      if (!data.token) return;
      jwt.verify(data.token as string, process.env.TOKEN_SECRET as string, (err, user: any) => {
        if (!err) {
          ws.id = user.id;
          onlineUsers.set(user.id, ws);
          console.log(`User with ID ${ws.id} connected`);
        }
      });
    })
    .on('SEND_MESSAGE', async (data: any) => {
      if (data.from === ws.id) {
        try {
          if (
            data.from &&
            data.to &&
            data.date &&
            data.content &&
            data.content.trim().length > 0 &&
            (await UserModel.exists({ _id: data.to }))
          ) {
            console.log('New message', data);
            const receiver = onlineUsers.get(data.to);

            const message = new MessageModel({
              from: data.from,
              to: data.to,
              content: data.content,
              date: data.date,
              state: receiver && 'RECEIVED',
            });
            await message.save();

            let chat, user;
            const query = { $or: [{ _id: data.chatId }, { participants: { $all: [data.from, data.to] } }] };
            if (await ChatModel.exists(query)) {
              await ChatModel.findOneAndUpdate(query, { $addToSet: { messages: message.id } });
            } else {
              chat = await new ChatModel({ participants: [data.to, data.from], messages: [message.id] }).save();
              user = await UserModel.findById(data.from).select('-password -friends -createdAt -updatedAt');
            }

            if (receiver) {
              sendMessage(receiver, 'NEW_MESSAGE', {
                id: message.id,
                chatId: data.chatId || chat?.id,
                content: data.content,
                date: data.date,
                from: data.from,
                chat: chat
                  ? {
                      id: chat?.id,
                      user: {
                        username: user?.username,
                        id: user?.id,
                      },
                    }
                  : undefined,
              });
            }

            sendMessage(ws, 'MESSAGE_CHANGE_STATE', {
              clientChatId: data.clientChatId,
              clientMsgId: data.clientMsgId,
              id: message.id,
              chatId: data.chatId || chat?.id,
              newState: receiver ? 'RECEIVED' : 'SENT',
            });
          }
        } catch (err) {
          console.log(err);
        }
      }
    })
    .on('update-message-status', (data: any) => {});

  ws.on('close', () => {
    if (ws.id) {
      console.log(ws.id, 'disconnected');
      onlineUsers.delete(ws.id);
    }
  });
});

export { server };
export default wss;
