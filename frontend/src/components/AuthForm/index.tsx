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
    console.log('e');
    setErrorMsg('');
    if (username.trim().length === 0 || password.trim().length === 0) return;
    setIsLoading(true);
    axios
      .post<UserData>(process.env.REACT_APP_BACKEND_URL + '/auth/login', {
        username: username.trim(),
        password: password.trim(),
      })
      .then(({ data }) => {
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
    if (
      username.trim().length < 4 ||
      password.trim().length < 6 ||
      !/^(?!.*\.\.)(?!_)(?!.*\.$)(?!\d+$)[a-zA-Z0-9_]*$/.test(username)
    )
      return;
    setIsLoading(true);
    axios
      .post<AuthSession>(process.env.REACT_APP_BACKEND_URL + '/auth/signup', {
        username: username.trim(),
        password: password.trim(),
      })
      .then(({ data }) => {
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
          type="password"
        ></input>
        <div className={styles.buttons}>
          <Button disabled={isLoading}>Log In</Button>
          <Button onClick={register} disabled={isLoading} type="button">
            Sign up
          </Button>
        </div>
        <p className={styles.error_message}>{errorMsg}</p>
      </form>
    </div>
  );
};

export default AuthForm;
