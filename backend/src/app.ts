import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import authMiddleware from './middlewares/auth.middleware';
import chatRoutes from './routes/chats.routes';
import usersRoutes from './routes/users.routes';

const app = express();

app.set('port', process.env.PORT || 8080);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/chats', authMiddleware(), chatRoutes);
app.use('/api/users', authMiddleware(), usersRoutes);

export default app;
