import app from './app';
import * as dotenv from 'dotenv';
dotenv.config();
import './database';
import { server } from './ws';

const WebSocket = require('ws');

server.listen(app.get('port'), () => {
  console.log(`App listen on port ${app.get('port')}`);
});
