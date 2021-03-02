import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import styles from './Chat.module.css';
import ws from '../../ws';
import { useCallback, useEffect, useRef, useState } from 'react';
import { addChatMessage, loadOldMessages, removeTemp, setChatAllMessagesAreLoaded } from '../../redux/ducks/chats';
import React from 'react';
import axios from 'axios';

interface ChatMessageProps {
  chatId: string;
  messageId: string;
}

const ChatMessage = React.memo(function ChatMessage({ chatId, messageId }: ChatMessageProps) {
  const clientId = useSelector((state: RootState) => state.auth.id);
  const message = useSelector((state: RootState) =>
    state.chats.find((chat) => chat.id === chatId)?.messages.find((message) => message.id === messageId)
  );
  const self = message?.from === clientId;

  return message ? (
    <div className={`${styles.message_container} ${self ? styles.self : ''}`}>
      <button className={styles.message_options_button}>
        <svg width="18" height="4" viewBox="0 0 18 4" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 2C0 0.896 0.896 0 2 0C3.104 0 4 0.896 4 2C4 3.104 3.104 4 2 4C0.896 4 0 3.104 0 2ZM9 0C7.896 0 7 0.896 7 2C7 3.104 7.896 4 9 4C10.104 4 11 3.104 11 2C11 0.896 10.104 0 9 0ZM16 0C14.896 0 14 0.896 14 2C14 3.104 14.896 4 16 4C17.104 4 18 3.104 18 2C18 0.896 17.104 0 16 0Z" />
        </svg>
      </button>
      <div className={styles.message_bubble}>
        <span className={styles.message_text}>{message.content}</span>
        <span className={styles.message_date}>{`${message.date
          .getHours()
          .toString()
          .padStart(2, '0')}:${message.date.getMinutes().toString().padStart(2, '0')}`}</span>
      </div>
      {self &&
        (message.state === 'RECEIVED' || message.state === 'SEEN' ? (
          <svg
            viewBox="0 0 13 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${styles.check_icon} ${message.state === 'SEEN' ? styles.seen : ''} }`}
          >
            <path d="M9.07749 0.141911C8.78816 -0.0860893 8.36949 -0.0340894 8.14216 0.255911L3.43883 6.26124L1.18616 3.46324C0.954159 3.17724 0.535492 3.13058 0.248826 3.36191C-0.0385075 3.59324 -0.0831742 4.01324 0.146826 4.29924L2.92616 7.75124C3.05349 7.90858 3.24416 7.99991 3.44616 7.99991H3.45083C3.65349 7.99858 3.84549 7.90458 3.97083 7.74391L9.19149 1.07724C9.41883 0.78791 9.36816 0.368577 9.07749 0.141911ZM12.4108 0.141911C12.1208 -0.0860893 11.7028 -0.0340894 11.4755 0.255911L6.77216 6.26124L6.36949 5.76191L5.52616 6.83991L6.25949 7.75124C6.38682 7.90858 6.57749 7.99991 6.77949 7.99991H6.78416C6.98682 7.99858 7.17882 7.90458 7.30416 7.74391L12.5248 1.07724C12.7522 0.78791 12.7015 0.368577 12.4108 0.141911ZM4.6533 3.62964L3.80863 4.70697L3.48063 4.29964C3.24996 4.01297 3.29463 3.59297 3.58196 3.36164C3.8693 3.13097 4.28863 3.17697 4.5193 3.46364L4.6533 3.62964Z" />
          </svg>
        ) : (
          <svg viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.check_icon}>
            <path d="M9.07749 0.141911C8.78816 -0.0860893 8.36949 -0.0340894 8.14216 0.255911L3.43883 6.26124L1.18616 3.46324C0.954159 3.17724 0.535492 3.13058 0.248826 3.36191C-0.0385075 3.59324 -0.0831742 4.01324 0.146826 4.29924L2.92616 7.75124C3.05349 7.90858 3.24416 7.99991 3.44616 7.99991H3.45083C3.65349 7.99858 3.84549 7.90458 3.97083 7.74391L9.19149 1.07724C9.41883 0.78791 9.36816 0.368577 9.07749 0.141911" />
          </svg>
        ))}
    </div>
  ) : (
    <></>
  );
});

const ChatInput = React.memo(function ChatInput() {
  const dispatch = useDispatch();
  const authSession = useSelector((state: RootState) => state.auth);
  const [inputValue, setInputValue] = useState('');
  const selectedChat = useSelector((state: RootState) => state.chats.find((chat) => chat.isSelected));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedChat && ws.state === WebSocket.OPEN && inputValue.trim().length > 0) {
      let msg;
      msg = ws.sendMessage(
        inputValue.trim(),
        authSession.id,
        selectedChat.user.id,
        !selectedChat.isTemp ? selectedChat.id : null,
        selectedChat.isTemp ? selectedChat.id : null
      );

      msg = {
        id: msg.clientMsgId,
        date: msg.date,
        content: msg.content,
        state: 'SENDING' as MessageState,
        from: authSession.id,
      };

      dispatch(addChatMessage(selectedChat.id, msg));

      if (selectedChat.isTemp) {
        dispatch(removeTemp(selectedChat.id));
      }

      setInputValue('');
    }
    setInputValue('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.footer}>
        <input
          className={styles.message_input}
          placeholder="Type a message here"
          onChange={({ currentTarget }) => setInputValue(currentTarget.value)}
          value={inputValue}
        ></input>
        <button className={styles.message_send_button}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10.3891 15.3333C10.3716 15.3333 10.355 15.3325 10.3383 15.3316C9.96164 15.3091 9.64748 15.0358 9.57248 14.6658L8.29081 8.35997C8.22414 8.03163 7.96831 7.7758 7.63998 7.70913L1.33414 6.42663C0.964143 6.35247 0.690809 6.0383 0.668309 5.66163C0.645809 5.28413 0.878309 4.93913 1.23664 4.8208L14.57 0.376633C14.8691 0.274966 15.1991 0.3533 15.4225 0.577466C15.6458 0.8008 15.7233 1.1308 15.6241 1.42997L11.1791 14.7633C11.0658 15.1058 10.7458 15.3333 10.3891 15.3333Z"
              fill="#fff"
            />
          </svg>
        </button>
      </div>
    </form>
  );
});

const useIntersect = (callback: Function) => {
  const [rootNode, setRootNode] = useState<HTMLElement | null>();
  const [node, setNode] = useState<HTMLElement | null>();
  const observer = useRef<IntersectionObserver | null>();

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          callback();
        }
      },
      { root: rootNode, threshold: 1 }
    );

    if (node) observer.current?.observe(node);

    return () => observer.current?.disconnect();
  }, [node, rootNode, callback]);

  return [setRootNode, setNode, callback];
};

const Chat = () => {
  const dispatch = useDispatch();
  const client = useSelector((state: RootState) => state.auth);
  const selectedChat = useSelector((state: RootState) => state.chats.find((chat) => chat.isSelected));
  const messagesScrollDiv = useRef<HTMLDivElement | null>();

  const [setRootNode, setNode] = useIntersect(
    useCallback(() => {
      if (selectedChat) {
        const { allMessagesAreLoaded, id, messages } = selectedChat;
        const oldestMessage = messages[0];
        if (!allMessagesAreLoaded && oldestMessage) {
          axios
            .get<Message[]>(`http://localhost:8080/api/chats/${id}/messages?last=${oldestMessage.id}`, {
              headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
            })
            .then(({ data }) => {
              if (data?.length > 0) {
                dispatch(loadOldMessages(id, data));
              } else {
                dispatch(setChatAllMessagesAreLoaded(id));
              }
            });
        }
      }
    }, [selectedChat?.allMessagesAreLoaded, selectedChat?.id, client.token, selectedChat?.messages])
  );

  useEffect(() => {
    const lastMessage = selectedChat?.messages[selectedChat.messages.length - 1];
    if (messagesScrollDiv.current) {
      const scrollDistanteToBottom =
        messagesScrollDiv.current.scrollHeight -
        (messagesScrollDiv.current.scrollTop + messagesScrollDiv.current.clientHeight);
      if (scrollDistanteToBottom < 100 || lastMessage?.from === client.id)
        messagesScrollDiv.current.scrollTo(
          messagesScrollDiv.current.scrollLeft,
          messagesScrollDiv.current.scrollHeight + scrollDistanteToBottom
        );
    }
  }, [selectedChat?.messages, client.id]);

  return (
    <div className={styles.container}>
      {selectedChat && (
        <>
          <div className={styles.header}>
            <div className={styles.contact_info}>
              <img
                src="https://liverampup.com/uploads/celebrity/emily-rudd-dating-parents-movies.jpg"
                alt="profile"
                className={styles.contact_profile_img}
              ></img>
              <div className={styles.contact_text}>
                <span className={styles.contact_name}>{selectedChat.user?.username}</span>
                <span className={styles.last_online}>last online 5 hours ago</span>
              </div>
            </div>
          </div>
          <div
            className={styles.content}
            ref={(el) => {
              messagesScrollDiv.current = el;
              setRootNode(el);
            }}
          >
            <div className={styles.messages}>
              <>
                <div ref={(el) => setNode(el)} style={{ height: '10px', width: '100%', background: 'red' }}></div>
                {selectedChat.messages.map((message) => (
                  <ChatMessage messageId={message.id} chatId={selectedChat.id} key={message.id} />
                ))}
              </>
            </div>
          </div>
          <ChatInput />
        </>
      )}
    </div>
  );
};

export default Chat;
