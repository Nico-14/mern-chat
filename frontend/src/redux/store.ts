import { createStore, combineReducers } from 'redux';
import authReducer from './ducks/auth';
import chatsReducer from './ducks/chats';

const rootReducer = combineReducers({
  auth: authReducer,
  chats: chatsReducer,
});

const store = createStore(
  rootReducer,
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ && (window as any).__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;

export type RootState = ReturnType<typeof rootReducer>;
