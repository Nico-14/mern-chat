import axios, { AxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addChat, selectChat } from '../../redux/ducks/chats';
import { RootState } from '../../redux/store';
import styles from './Sidebar.module.css';
import React from 'react';
import { v4 as uuid4 } from 'uuid';
import Button from '../Button';
import { changeDisplayName, changeUsername } from '../../redux/ducks/auth';
import Avatar from 'react-avatar';

interface ChatItemProps {
  chatId: string;
}

interface InputProps {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  defaultValue?: string;
}

const Input = ({ onChange, defaultValue }: InputProps) => {
  return (
    <div className={styles.input_container}>
      <div className={styles.input}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 11C5 7.691 7.691 5 11 5C14.309 5 17 7.691 17 11C17 14.309 14.309 17 11 17C7.691 17 5 14.309 5 11ZM20.707 19.293L17.312 15.897C18.365 14.543 19 12.846 19 11C19 6.589 15.411 3 11 3C6.589 3 3 6.589 3 11C3 15.411 6.589 19 11 19C12.846 19 14.543 18.365 15.897 17.312L19.293 20.707C19.488 20.902 19.744 21 20 21C20.256 21 20.512 20.902 20.707 20.707C21.098 20.316 21.098 19.684 20.707 19.293Z" />
        </svg>
        <input placeholder="Search" onChange={onChange} defaultValue={defaultValue}></input>
      </div>
    </div>
  );
};

interface MenuProps {
  isOpen?: boolean;
  title: string;
  onClose: () => void;
  children?: React.ReactNode;
}
const Menu = ({ isOpen, onClose, title, children }: MenuProps) => {
  const [isHiding, setIsHiding] = useState(false);

  const handleClick = () => {
    setIsHiding(true);
  };

  const handleAnimationEnd = () => {
    if (isHiding) {
      if (onClose) onClose();
      setIsHiding(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className={`${styles.menu} ${isHiding ? styles.hiding : styles.showing}`}
          onAnimationEnd={handleAnimationEnd}
        >
          <div className={styles.menu_header}>
            <button onClick={handleClick} className={styles.menu_close_button}>
              <svg xmlns="http://www.w3.org/2000/svg" height="512" viewBox="0 0 64 64" width="512">
                <path d="m54 30h-39.899l15.278-14.552c.8-.762.831-2.028.069-2.828-.761-.799-2.027-.831-2.828-.069l-17.448 16.62c-.755.756-1.172 1.76-1.172 2.829 0 1.068.417 2.073 1.207 2.862l17.414 16.586c.387.369.883.552 1.379.552.528 0 1.056-.208 1.449-.621.762-.8.731-2.065-.069-2.827l-15.342-14.552h39.962c1.104 0 2-.896 2-2s-.896-2-2-2z" />
              </svg>
            </button>
            <span className={styles.menu_header_text}>{title}</span>
          </div>
          <div className={styles.content}>{children}</div>
        </div>
      )}
    </>
  );
};

interface UserSearchProps {
  onItemClick: () => void;
}

const UserSearchMenu = ({ onItemClick }: UserSearchProps) => {
  const [results, setResults] = useState<Array<any>>([]);
  const dispatch = useDispatch();
  const timeoutRef = useRef<number | null>(null);
  const [lastUsers, setLastUsers] = useState<User[]>([]);

  const existingChats = useSelector((state: RootState) =>
    state.chats.map((chat) => ({ userId: chat.user.id, id: chat.id, isTemp: chat.isTemp, isSelected: chat.isSelected }))
  );

  const handleChange = ({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (results.length > 0) {
      setResults([]);
    }
    if (currentTarget.value.trim().length > 0) {
      timeoutRef.current = window.setTimeout(() => {
        axios
          .get(`http://localhost:8080/api/users?query=${currentTarget.value.trim()}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          })
          .then(({ data }) => {
            if (data?.length > 0) setResults(data);
          });
      }, 500);
    }
  };

  const handleItemClick = (result: any) => {
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
          allMessagesAreLoaded: true,
        })
      );
      dispatch(selectChat(id));
    }
    onItemClick();
  };

  useEffect(() => {
    axios
      .get<User[]>(process.env.REACT_APP_BACKEND_URL + '/users/last', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then(({ data }) => {
        setLastUsers(data);
      });
  }, [setLastUsers]);

  return (
    <>
      <Input onChange={handleChange}></Input>
      {results && results.length > 0 ? (
        <div className={styles.chat_list}>
          {results.map((result) => (
            <div className={styles.chat_item} key={result.id} onClick={() => handleItemClick(result)}>
              <Avatar name={result.displayName || result.username} size="48" round={true} />
              <div className={styles.chat_item_content}>
                <span className={styles.item_username}>@{result.username}</span>
                <span className={styles.item_display_name}>{result.displayName || result.username}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <span className={styles.last_users}>Latest users</span>
          <div className={styles.chat_list}>
            {lastUsers.map((user) => (
              <div className={styles.chat_item} key={user.id} onClick={() => handleItemClick(user)}>
                <Avatar name={user.displayName || user.username} size="48" round={true} />
                <div className={styles.chat_item_content}>
                  <span className={styles.item_username}>@{user.username}</span>
                  <span className={styles.item_display_name}>{user.displayName || user.username}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};

const ProfileMenu = () => {
  const timeoutRef = useRef<number | null>();
  const [errorMessage, setErrorMessage] = useState<any>();
  const [loading, setLoading] = useState<string | null>(null);
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => ({
    username: state.auth.username,
    displayName: state.auth.displayName,
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.currentTarget;
    value = value.trim();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setErrorMessage(null);

    if (
      value.length === 0 ||
      (name === 'username' &&
        (value.length < 4 ||
          !/^(?!.*\.\.)(?!_)(?!.*\.$)(?!\d+$)[a-zA-Z0-9_]*$/.test(value) ||
          user.username.toLowerCase() === value.toLowerCase())) ||
      (name === 'displayName' && user.displayName === value)
    )
      return;

    const data: any = {};
    if (name === 'username') data.username = value;
    if (name === 'displayName') data.displayName = value;

    timeoutRef.current = window.setTimeout(() => {
      setLoading(name);
      axios
        .put<User>(process.env.REACT_APP_BACKEND_URL + '/users/client', data, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        .then(({ data }) => {
          if (name === 'username') {
            dispatch(changeUsername(data.username));
          } else if (data.displayName) {
            dispatch(changeDisplayName(data.displayName));
          }
          setLoading(null);
          setErrorMessage(null);
        })
        .catch((err: AxiosError) => {
          setLoading(null);
          setErrorMessage({ name, msg: err.response?.data });
        });
    }, 500);
  };

  return (
    <div className={styles.profile_menu_content}>
      <div className={styles.profile_menu_edit}>
        <label htmlFor="edit_username">Username</label>
        <div className={styles.profile_menu_input_container}>
          <input
            className={styles.profile_menu_input}
            id="edit_username"
            name="username"
            defaultValue={user.username}
            onChange={handleChange}
            disabled={loading !== null}
          ></input>
          {loading === 'username' && <div className={`loader primary ${styles.profile_menu_loader}`}></div>}
        </div>
        {errorMessage?.name === 'username' && <p className={styles.profile_menu_error_msg}>{errorMessage.msg}</p>}
      </div>

      <div className={styles.profile_menu_edit}>
        <label htmlFor="edit_displayname">Display name</label>
        <div className={styles.profile_menu_input_container}>
          <input
            className={styles.profile_menu_input}
            id="edit_displayname"
            name="displayName"
            defaultValue={user.displayName || user.username}
            onChange={handleChange}
            disabled={loading !== null}
          ></input>
          {loading === 'displayName' && <div className={`loader primary ${styles.profile_menu_loader}`}></div>}
        </div>
        {errorMessage?.name === 'displayName' && <p className={styles.profile_menu_error_msg}>{errorMessage.msg}</p>}
      </div>
    </div>
  );
};

const Header = () => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);
  const user = useSelector((state: RootState) => ({
    username: state.auth.username,
    displayName: state.auth.displayName,
  }));

  const handleClickNewChat = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  const handleClickProfile = () => {
    setIsProfileMenuVisible(!isProfileMenuVisible);
  };

  return (
    <>
      <div className={styles.header}>
        <div className={styles.header_profile}>
          <Avatar
            name={user.displayName || user.username}
            size="42"
            round={true}
            onClick={handleClickProfile}
            style={{ cursor: 'pointer' }}
          />
          <div className={styles.header_profile_name}>
            <span className={styles.contact_displayname}>{user.displayName || user.username}</span>
            <span className={styles.contact_username}>@{user.username}</span>
          </div>
        </div>
        <Button onClick={handleClickNewChat}>New Chat</Button>
      </div>
      <Menu isOpen={isSearchVisible} onClose={handleClickNewChat} title="New chat">
        <UserSearchMenu onItemClick={handleClickNewChat} />
      </Menu>
      <Menu isOpen={isProfileMenuVisible} onClose={handleClickProfile} title="Profile">
        <ProfileMenu />
      </Menu>
    </>
  );
};

const ChatItem = React.memo<ChatItemProps>(function ChatItem({ chatId }: ChatItemProps) {
  const dispatch = useDispatch();
  const chat = useSelector((state: RootState) => state.chats.find((chat) => chat.id === chatId));
  const lastMessage = chat?.messages[chat?.messages.length - 1];

  const handleClick = () => {
    if (chat && !chat.isSelected) dispatch(selectChat(chat.id));
  };

  return chat ? (
    <div className={`${styles.chat_item} ${chat.isSelected ? styles.selected : ''}`} onClick={handleClick}>
      <Avatar name={chat.user.displayName || chat.user.username} size="48" round={true} />
      <div className={styles.chat_item_content}>
        <div className={styles.chat_item_header}>
          <span className={styles.chat_item_username}>{chat.user.displayName || chat.user.username}</span>
          <span className={styles.chat_item_date}>{`${lastMessage?.date
            .getHours()
            .toString()
            .padStart(2, '0')}:${lastMessage?.date.getMinutes().toString().padStart(2, '0')}`}</span>
        </div>
        <div className={styles.chat_item_message}>
          <span className={styles.chat_item_message_text}>{lastMessage?.content}</span>
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
        <ChatList />
      </div>
    </div>
  );
};

export default Sidebar;
