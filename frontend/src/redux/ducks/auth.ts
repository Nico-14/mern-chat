import ws from '../../ws';

const initialState: AuthSession = {
  username: '',
  friends: [],
  loggedIn: false,
  token: '',
  id: '',
};

//Types
const LOGIN = 'LOGIN';
const CHANGE_USERNAME = 'CHANGE_USERNAME';
const CHANGE_DISPLAY_NAME = 'CHANGE_DISPLAY_NAME';

//Actions
interface LoginAction {
  type: typeof LOGIN;
  payload: AuthSession;
}

interface ChangeUsernameAction {
  type: typeof CHANGE_USERNAME;
  payload: string;
}

interface ChangeDisplayNameAction {
  type: typeof CHANGE_DISPLAY_NAME;
  payload: string;
}

type AuthActions = LoginAction | ChangeUsernameAction | ChangeDisplayNameAction;

//Actions
export const login = (newSession: AuthSession): AuthActions => {
  sessionStorage.setItem('token', newSession.token);
  ws.auth();

  return {
    type: LOGIN,
    payload: newSession,
  };
};

export const changeUsername = (username: string) => ({ type: CHANGE_USERNAME, payload: username });
export const changeDisplayName = (displayName: string) => ({ type: CHANGE_DISPLAY_NAME, payload: displayName });

const reducer = (state: AuthSession = initialState, action: AuthActions): AuthSession => {
  switch (action.type) {
    case LOGIN:
      return { ...action.payload, loggedIn: true };
    case CHANGE_USERNAME:
      return { ...state, username: action.payload };
    case CHANGE_DISPLAY_NAME:
      return { ...state, displayName: action.payload };
    default:
      return state;
  }
};

export default reducer;
