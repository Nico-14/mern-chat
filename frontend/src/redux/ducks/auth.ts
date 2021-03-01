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

//Actions
interface LoginAction {
  type: typeof LOGIN;
  payload: AuthSession;
}

type AuthActions = LoginAction;

//Actions
export function login(newSession: AuthSession): AuthActions {
  sessionStorage.setItem('token', newSession.token);
  ws.auth();

  // delete (newSession as any).chats;
  return {
    type: LOGIN,
    payload: newSession,
  };
}

const reducer = (state: AuthSession = initialState, action: AuthActions): AuthSession => {
  switch (action.type) {
    case LOGIN:
      return { ...action.payload, loggedIn: true };
    default:
      return state;
  }
};

export default reducer;
