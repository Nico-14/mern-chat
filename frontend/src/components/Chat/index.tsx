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
  const [isLoading, setIsLoading] = useState(false);

  const [setRootNode, setNode] = useIntersect(
    useCallback(() => {
      if (selectedChat?.id && !isLoading) {
        const oldestMessage = selectedChat.messages[0];
        if (!selectedChat.allMessagesAreLoaded && oldestMessage) {
          setIsLoading(true);
          axios
            .get<Message[]>(`http://localhost:8080/api/chats/${selectedChat.id}/messages?last=${oldestMessage.id}`, {
              headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
            })
            .then(({ data }) => {
              if (data?.length > 0) {
                dispatch(loadOldMessages(selectedChat.id, data));
              } else {
                dispatch(setChatAllMessagesAreLoaded(selectedChat.id));
              }
              setTimeout(setIsLoading, 200, false);
            });
        }
      }
    }, [
      selectedChat?.allMessagesAreLoaded,
      selectedChat?.id,
      selectedChat?.messages,
      setIsLoading,
      isLoading,
      dispatch,
    ])
  );

  useEffect(() => {
    const lastMessage = selectedChat?.messages[selectedChat.messages.length - 1];
    if (messagesScrollDiv.current) {
      const scrollDistanteToBottom =
        messagesScrollDiv.current.scrollHeight -
        (messagesScrollDiv.current.scrollTop + messagesScrollDiv.current.clientHeight);
      if (scrollDistanteToBottom < 100 || lastMessage?.from === client.id)
        setTimeout(() => {
          if (messagesScrollDiv?.current) {
            messagesScrollDiv.current.scrollTo(
              messagesScrollDiv.current.scrollLeft,
              messagesScrollDiv.current.scrollHeight + scrollDistanteToBottom
            );
          }
        }, 200);
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
                {/* <span className={styles.last_online}>last online 5 hours ago</span> */}
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
                {isLoading && <div className={styles.loader}></div>}
                <div ref={(el) => setNode(el)} style={{ height: '20px', width: '100%' }}></div>
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
