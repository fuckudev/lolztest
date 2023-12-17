import { startBot } from "./bot/bot.js";

try {
    await startBot();
  } catch (error) {
    console.error('Произошла ошибка при запуске бота:', error.message);
  }
  