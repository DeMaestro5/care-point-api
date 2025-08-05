import Logger from './core/Logger';
import { port } from './config';
import app from './app';

const serverPort = port || 3000;

app
  .listen(serverPort, () => {
    Logger.info(`server running on port : ${serverPort}`);
  })
  .on('error', (e) => Logger.error(e));
