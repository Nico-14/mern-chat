import axios from 'axios';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/ducks/auth';
import { loadChats } from '../../redux/ducks/chats';
import Button from '../Button';
import styles from './AuthForm.module.css';

const AuthForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logIn();
  };

  const logIn = () => {
    setErrorMsg('');
    if (username.trim().length < 6 && password.trim().length < 6) return;
    setIsLoading(true);
    axios
      .post('http://localhost:8080/api/auth/login', { username: username.trim(), password: password.trim() })
      .then(({ data }: any) => {
        dispatch(login(data));
        dispatch(loadChats(data.chats));
        setIsLoading(true);
      })
      .catch((err) => {
        setErrorMsg(err.response.data);
        setIsLoading(false);
      });
  };

  const register = () => {
    setErrorMsg('');
    if (username.trim().length < 6 && password.trim().length < 6) return;
    setIsLoading(true);
    axios
      .post('http://localhost:8080/api/auth/signup', { username: username.trim(), password: password.trim() })
      .then(({ data }: any) => {
        dispatch(login(data));
        setIsLoading(true);
      })
      .catch((err) => {
        setErrorMsg(err.response.data);
        setIsLoading(false);
      });
  };

  return (
    <div className={styles.content}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', margin: 'auto' }}>
        <input
          placeholder="Username"
          value={username}
          onChange={({ currentTarget }) => setUsername(currentTarget.value)}
          className={styles.input}
          disabled={isLoading}
        ></input>
        <input
          placeholder="Password"
          value={password}
          onChange={({ currentTarget }) => setPassword(currentTarget.value)}
          className={styles.input}
          disabled={isLoading}
        ></input>
        <div className={styles.buttons}>
          <Button onClick={logIn} disabled={isLoading}>
            Log In
          </Button>
          <Button onClick={register} disabled={isLoading}>
            Sign up
          </Button>
        </div>
        <p className={styles.error_message}>{errorMsg}</p>
      </form>
    </div>
  );
};

export default AuthForm;
