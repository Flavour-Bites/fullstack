import 'dotenv/config';
import { validateEnv } from './config/env.js';
import { createApp } from './app.js';

validateEnv();

const PORT = Number(process.env.PORT || 3000);

async function start() {
  const app = await createApp();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

start();
