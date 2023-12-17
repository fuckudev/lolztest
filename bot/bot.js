import { Telegraf, session, Scenes } from 'telegraf';
import { config } from '../config.js';
import { sendMainMenu } from './handlers/commands/startHandler.js';
import { database } from '../database/db.js';
import { addBookScene } from './handlers/scenes/addBookScene.js';
import { booksPageScene } from './handlers/scenes/booksPageScene.js';
import { enterBook } from './handlers/scenes/enterBook.js';
import { selectGenre } from './handlers/scenes/enterGenre.js';
import { searchBook } from './handlers/scenes/searchBook.js';
import { deleteBookByName } from './handlers/scenes/deleteBook.js';
import { userProfile } from './handlers/scenes/userProfile.js';

async function startBot() {
  const BOT_TOKEN = config.token;
  const bot = new Telegraf(BOT_TOKEN);

  const stage = new Scenes.Stage([booksPageScene, addBookScene, enterBook, selectGenre, searchBook, deleteBookByName, userProfile]);
  bot.use(session());
  bot.use(stage.middleware());

  try {
    bot.start(async (ctx) => {
      try {
        await database.addUserToDatabase(ctx.message.from.id);
        sendMainMenu(ctx);
      } catch (error) {
        console.error('Произошла ошибка:', error.message);
      }
    });

    bot.hears('Добавить книгу', async (ctx) => {
      try {
        await ctx.scene.enter('add_book_scene');
      } catch (error) {
        console.error('Произошла ошибка при обработке команды "Добавить книгу":', error.message);
      }
    });

    bot.hears('Посмотреть список книг', async (ctx) => {
      try {
        await ctx.scene.enter('booksPage');
      } catch (error) {
        console.error('Произошла ошибка при обработке команды "Посмотреть список книг":', error.message);
      }
    });

    bot.hears('Поиск заметки', async (ctx) => {
      try {
        await ctx.scene.enter('searchBook');
      } catch (error) {
        console.error('Произошла ошибка при обработке команды "Поиск заметки":', error.message);
      }
    });

    bot.hears('Удаление заметки', async (ctx) => {
      try {
        await ctx.scene.enter('deleteBookByName');
      } catch (error) {
        console.error('Произошла ошибка при обработке команды "Удаление заметки":', error.message);
      }
    });

    bot.hears('Профиль', async (ctx) => {
      try {
        await ctx.scene.enter('userProfile');
      } catch (error) {
        console.error('Произошла ошибка при обработке команды "Профиль":', error.message);
      }
    });

    booksPageScene.hears('Выбрать книгу', async (ctx) => {
      try {
        await ctx.scene.enter('enterBook');
      } catch (error) {
        console.error('Произошла ошибка при обработке команды "Выбрать книгу":', error.message);
      }
    });

    booksPageScene.hears('По жанру', async (ctx) => {
      try {
        await ctx.scene.enter('selectGenre');
      } catch (error) {
        console.error('Произошла ошибка при обработке команды "По жанру":', error.message);
      }
    });

    bot.action('back_to_main_menu', async (ctx) => {
      try {
        await sendMainMenu(ctx);
        await ctx.answerCbQuery();
        ctx.scene.leave();
      } catch (error) {
        console.error('Произошла ошибка при обработке действия "Вернуться в главное меню":', error.message);
      }
    });

    booksPageScene.hears('Вернуться в главное меню', async (ctx) => {
      try {
        ctx.scene.leave();
        sendMainMenu(ctx);
      } catch (error) {
        console.error('Произошла ошибка при обработке команды "Вернуться в главное меню":', error.message);
      }
    });

    bot.hears('Вернуться в главное меню', async (ctx) => {
      try {
        ctx.scene.leave();
        sendMainMenu(ctx);
      } catch (error) {
        console.error('Произошла ошибка при обработке команды "Вернуться в главное меню":', error.message);
      }
    });

    await bot.launch();
    console.log('Бот запущен');
  } catch (error) {
    console.error('Произошла ошибка при запуске бота:', error.message);
  }
}

export { startBot }
