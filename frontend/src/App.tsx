import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import styles from './App.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './redux/store';
import React, { useEffect } from 'react';
import axios from 'axios';
import { login } from './redux/ducks/auth';
import ws from './ws';
import { addChat, addChatMessage, loadChats, updateClientChatId, updateClientMessageId } from './redux/ducks/chats';
import AuthForm from './components/AuthForm';

const App = () => {
  const authSession = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (sessionStorage.getItem('token')) {
      axios
        .get('http://localhost:8080/api/users/client/data', {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
        })
        .then(({ data }) => {
          dispatch(login(data));
          dispatch(loadChats(data.chats));
        });
    }
  }, [dispatch]);

  useEffect(() => {
    const newMessageListener = (message: Message) => {
      if (message.chat) {
        dispatch(addChat(message.chat));
      }

      if (message.chatId)
        dispatch(
          addChatMessage(message.chatId, {
            id: message.id,
            content: message.content,
            date: new Date(message.date),
            from: message.from,
          })
        );
    };

    const messageChangeStateListener = (message: MessageSent) => {
      if (message.clientChatId) {
        dispatch(updateClientChatId(message.clientChatId, message.chatId));
      }

      if (message.clientMsgId) {
        dispatch(updateClientMessageId(message.chatId, message.clientMsgId, message.id));
      }
    };

    ws.addNewMessageListener(newMessageListener);
    ws.addMessageSentListener(messageChangeStateListener);
    return () => {
      ws.removeNewMessageListener(newMessageListener);
      ws.removeMessageSentListener(messageChangeStateListener);
    };
  }, [dispatch]);

  return (
    <div className={styles.container}>
      {!authSession.loggedIn ? (
        <AuthForm></AuthForm>
      ) : (
        <>
          <Sidebar />
          <Chat />
        </>
      )}
    </div>
  );
};

export default App;
