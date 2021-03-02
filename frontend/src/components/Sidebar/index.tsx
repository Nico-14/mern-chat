import axios from 'axios';
import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addChat, selectChat } from '../../redux/ducks/chats';
import { RootState } from '../../redux/store';
import styles from './Sidebar.module.css';
import React from 'react';
import { v4 as uuid4 } from 'uuid';

interface ChatItemProps {
  chatId: string;
}

interface UsersSearchProps {
  onClose: Function;
}
const UsersSearch = ({ onClose }: UsersSearchProps) => {
  const [isHiding, setIsHiding] = useState(false);
  const [results, setResults] = useState<Array<any>>([]);
  const dispatch = useDispatch();
  const timeoutRef = useRef<number | null>(null);

  const token = useSelector((state: RootState) => state.auth.token);
  const existingChats = useSelector((state: RootState) =>
    state.chats.map((chat) => ({ userId: chat.user.id, id: chat.id, isTemp: chat.isTemp, isSelected: chat.isSelected }))
  );

  const handleClick = () => {
    setIsHiding(true);
  };

  const handleAnimationEnd = () => {
    if (isHiding) {
      if (onClose) onClose();
    }
  };

  const handleChange = ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (results.length > 0) {
      setResults([]);
    }
    if (currentTarget.value.trim().length > 0) {
      timeoutRef.current = window.setTimeout(() => {
        axios
          .get(`http://localhost:8080/api/users?query=${currentTarget.value.trim()}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(({ data }) => {
            if (data?.length > 0) setResults(data);
          });
      }, 500);
    }
  };

  return (
    <div
      className={`${styles.users_search} ${isHiding ? styles.hiding : styles.showing}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div>
        Search
        <button onClick={handleClick}>X</button>
      </div>
      <div className={styles.content}>
        <div className={styles.search}>
          <div className={styles.search_input}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 11C5 7.691 7.691 5 11 5C14.309 5 17 7.691 17 11C17 14.309 14.309 17 11 17C7.691 17 5 14.309 5 11ZM20.707 19.293L17.312 15.897C18.365 14.543 19 12.846 19 11C19 6.589 15.411 3 11 3C6.589 3 3 6.589 3 11C3 15.411 6.589 19 11 19C12.846 19 14.543 18.365 15.897 17.312L19.293 20.707C19.488 20.902 19.744 21 20 21C20.256 21 20.512 20.902 20.707 20.707C21.098 20.316 21.098 19.684 20.707 19.293Z" />
            </svg>
            <input placeholder="Search" onChange={handleChange} defaultValue=""></input>
          </div>
        </div>
        <ul>
          {results &&
            results.map((result, index) => (
              <li
                key={index}
                onClick={() => {
                  const existingChat = existingChats.find((chat) => chat.userId === result.id);
                  if (existingChat) {
                    if (!existingChat.isSelected) dispatch(selectChat(existingChat.id));
                  } else {
                    const id = uuid4();
                    dispatch(
                      addChat({
                        user: result,
                        messages: [],
                        id,
                        isSelected: false,
                        isTemp: true,
                        allMessagesAreLoaded: false,
                      })
                    );
                    dispatch(selectChat(id));
                  }
                  handleClick();
                }}
              >
                {result.username}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

const Header = () => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const handleClick = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  return (
    <>
      <div className={styles.header}>
        <img
          src="https://datosdefamosos.com/wp-content/uploads/2019/11/emily-rudd.jpg"
          className={styles.header_img}
          alt="Profile"
        ></img>
        <button className={styles.create_chat_button} onClick={handleClick}>
          New Chat
        </button>
      </div>
      {isSearchVisible && <UsersSearch onClose={handleClick} />}
    </>
  );
};

const ChatItem = React.memo<ChatItemProps>(function ChatItem({ chatId }: ChatItemProps) {
  const dispatch = useDispatch();
  const chat = useSelector((state: RootState) => state.chats.find((chat) => chat.id === chatId));

  const lastMessage = chat?.messages[chat?.messages.length - 1];
  const clientId = useSelector((state: RootState) => state.auth.id);
  const self = lastMessage?.from === clientId;

  const handleClick = () => {
    if (chat && !chat.isSelected) dispatch(selectChat(chat.id));
  };

  return chat ? (
    <div
      className={`${styles.chat_item} ${chat.isSelected ? styles.selected : ''} ${
        !self && lastMessage?.state !== 'SEEN' ? styles.new_messages : ''
      }`}
      onClick={handleClick}
    >
      <img
        src="https://liverampup.com/uploads/celebrity/emily-rudd-dating-parents-movies.jpg"
        className={styles.chat_item_img}
        alt="Chat"
      />
      <div className={styles.chat_item_content}>
        <div className={styles.chat_item_header}>
          <span className={styles.chat_item_username}>{chat.user.username}</span>
          <span className={styles.chat_item_date}>{`${lastMessage?.date
            .getHours()
            .toString()
            .padStart(2, '0')}:${lastMessage?.date.getMinutes().toString().padStart(2, '0')}`}</span>
        </div>
        <div className={styles.chat_item_message}>
          <span className={styles.chat_item_message_text}>{lastMessage?.content}</span>
          {lastMessage && self ? (
            lastMessage.state === 'RECEIVED' || lastMessage.state === 'SEEN' ? (
              <svg
                viewBox="0 0 13 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`${styles.check_icon} ${lastMessage.state === 'SEEN' ? styles.seen : ''} }`}
              >
                <path d="M9.07749 0.141911C8.78816 -0.0860893 8.36949 -0.0340894 8.14216 0.255911L3.43883 6.26124L1.18616 3.46324C0.954159 3.17724 0.535492 3.13058 0.248826 3.36191C-0.0385075 3.59324 -0.0831742 4.01324 0.146826 4.29924L2.92616 7.75124C3.05349 7.90858 3.24416 7.99991 3.44616 7.99991H3.45083C3.65349 7.99858 3.84549 7.90458 3.97083 7.74391L9.19149 1.07724C9.41883 0.78791 9.36816 0.368577 9.07749 0.141911ZM12.4108 0.141911C12.1208 -0.0860893 11.7028 -0.0340894 11.4755 0.255911L6.77216 6.26124L6.36949 5.76191L5.52616 6.83991L6.25949 7.75124C6.38682 7.90858 6.57749 7.99991 6.77949 7.99991H6.78416C6.98682 7.99858 7.17882 7.90458 7.30416 7.74391L12.5248 1.07724C12.7522 0.78791 12.7015 0.368577 12.4108 0.141911ZM4.6533 3.62964L3.80863 4.70697L3.48063 4.29964C3.24996 4.01297 3.29463 3.59297 3.58196 3.36164C3.8693 3.13097 4.28863 3.17697 4.5193 3.46364L4.6533 3.62964Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.check_icon}>
                <path d="M9.07749 0.141911C8.78816 -0.0860893 8.36949 -0.0340894 8.14216 0.255911L3.43883 6.26124L1.18616 3.46324C0.954159 3.17724 0.535492 3.13058 0.248826 3.36191C-0.0385075 3.59324 -0.0831742 4.01324 0.146826 4.29924L2.92616 7.75124C3.05349 7.90858 3.24416 7.99991 3.44616 7.99991H3.45083C3.65349 7.99858 3.84549 7.90458 3.97083 7.74391L9.19149 1.07724C9.41883 0.78791 9.36816 0.368577 9.07749 0.141911" />
              </svg>
            )
          ) : !self && lastMessage?.state !== 'SEEN' ? (
            <span className={styles.unread_messages}></span>
          ) : (
            ''
          )}
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
});

const ChatList = () => {
  const chats = useSelector((state: RootState) => state.chats.filter((chat) => !chat.isTemp));
  return (
    <div className={styles.chat_list}>
      {chats
        .sort(
          (a: Chat, b: Chat) =>
            b.messages[b.messages.length - 1].date.getTime() - a.messages[a.messages.length - 1].date.getTime()
        )
        .map((chat) => (
          <ChatItem chatId={chat.id} key={chat.id} />
        ))}
    </div>
  );
};

const Sidebar = () => {
  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <div className={styles.search}>
          <div className={styles.search_input}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 11C5 7.691 7.691 5 11 5C14.309 5 17 7.691 17 11C17 14.309 14.309 17 11 17C7.691 17 5 14.309 5 11ZM20.707 19.293L17.312 15.897C18.365 14.543 19 12.846 19 11C19 6.589 15.411 3 11 3C6.589 3 3 6.589 3 11C3 15.411 6.589 19 11 19C12.846 19 14.543 18.365 15.897 17.312L19.293 20.707C19.488 20.902 19.744 21 20 21C20.256 21 20.512 20.902 20.707 20.707C21.098 20.316 21.098 19.684 20.707 19.293Z" />
            </svg>
            <input placeholder="Search"></input>
          </div>
        </div>
        <ChatList />
      </div>
    </div>
  );
};

export default Sidebar;
