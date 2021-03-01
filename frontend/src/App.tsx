import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import styles from './App.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './redux/store';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { login } from './redux/ducks/auth';
import ws from './ws';
import {
  addChat,
  addChatMessage,
  loadChats,
  updateClientChatId,
  updateClientMessageId,
  updateMessageState,
} from './redux/ducks/chats';

const App = () => {
  const authSession = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    axios.post('http://localhost:8080/api/auth/login', { username, password }).then(({ data }: any) => {
      dispatch(login(data));
      dispatch(loadChats(data.chats));
    });
  };

  useEffect(() => {
    console.log('useEffect');
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
            state: message.state,
          })
        );
    };

    const messageChangeStateListener = (message: MessageChangeState) => {
      if (message.clientChatId) {
        dispatch(updateClientChatId(message.clientChatId, message.chatId));
      }

      if (message.clientMsgId) {
        dispatch(updateClientMessageId(message.chatId, message.clientMsgId, message.id));
      }

      dispatch(updateMessageState(message.chatId, message.id, message.newState));
    };

    ws.addNewMessageListener(newMessageListener);
    ws.addMessageChangeStateListener(messageChangeStateListener);
    return () => {
      ws.removeNewMessageListener(newMessageListener);
      ws.removeMessageChangeStateListener(messageChangeStateListener);
    };
  }, [dispatch]);

  return (
    <div className={styles.container}>
      {!authSession.loggedIn ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', margin: 'auto' }}>
          <input
            placeholder="Username"
            value={username}
            onChange={({ currentTarget }) => setUsername(currentTarget.value)}
          ></input>
          <input
            placeholder="Password"
            value={password}
            onChange={({ currentTarget }) => setPassword(currentTarget.value)}
          ></input>
          <input type="submit" value="login"></input>
        </form>
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
