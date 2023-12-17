// addBookScene.js
import { Markup } from 'telegraf';
import { Scenes } from 'telegraf';
import { database } from '../../../database/db.js';
import { sendMainMenu } from '../commands/startHandler.js';

const WizardScene = Scenes.WizardScene;

export const addBookScene = new WizardScene(
  'add_book_scene',
  async (ctx) => {
    try {
      await ctx.reply('Введите название книги:');
      ctx.wizard.state.book = {};  // Clear the previous book object

      const backToMainMenuButton = Markup.inlineKeyboard([
        Markup.button.callback('Вернуться в главное меню', 'back_to_main_menu')
      ]);

      await ctx.reply('Для возврата в главное меню, нажмите кнопку ниже:', backToMainMenuButton);

      return ctx.wizard.next();
    } catch (error) {
      console.error('Error in add_book_scene step 1:', error);
      await ctx.reply('Произошла ошибка, пожалуйста, попробуйте еще раз.');
    }
  },
  async (ctx) => {
    try {
      ctx.wizard.state.book.name = ctx.message.text;  // Store the name
      await ctx.reply('Введите автора книги:');
      return ctx.wizard.next();
    } catch (error) {
      console.error('Error in add_book_scene step 2:', error);
      await ctx.reply('Произошла ошибка, пожалуйста, попробуйте еще раз.');
    }
  },
  async (ctx) => {
    try {
      ctx.wizard.state.book.author = ctx.message.text;  // Store the author
      await ctx.reply('Введите описание книги:');
      return ctx.wizard.next();
    } catch (error) {
      console.error('Error in add_book_scene step 3:', error);
      await ctx.reply('Произошла ошибка, пожалуйста, попробуйте еще раз.');
    }
  },
  async (ctx) => {
    try {
      ctx.wizard.state.book.description = ctx.message.text;  // Store the description

      const genres = await database.getGenres();
     // console.log(genres);

      const genreButtons = genres.map(genre => ({
        text: genre,
        callback_data: genre,
      }));

      const buttonsInRows = [];
      while (genreButtons.length > 0) {
        buttonsInRows.push(genreButtons.splice(0, 2));
      }

      const genresInlineKeyboard = Markup.inlineKeyboard(buttonsInRows);

      await ctx.reply('Выберите жанр книги или напишите свой:', genresInlineKeyboard);

      return ctx.wizard.next();
    } catch (error) {
      console.error('Error in add_book_scene step 4:', error);
      await ctx.reply('Произошла ошибка, пожалуйста, попробуйте еще раз.');
    }
  },
  async (ctx) => {
    try {
      const selectedGenre = ctx.callbackQuery ? ctx.callbackQuery.data : ctx.message.text.trim();

      if (!selectedGenre) {
        await ctx.reply('Выберите жанр книги или напишите свой:');
        return ctx.wizard.next();
      } else {
        ctx.wizard.state.book.genre = selectedGenre;
      }

      await ctx.reply('Книга успешно добавлена в базу данных!');
      await database.addBook(
        ctx.from.id,
        ctx.wizard.state.book.name,
        ctx.wizard.state.book.author,
        ctx.wizard.state.book.description,
        ctx.wizard.state.book.genre
      );

      sendMainMenu(ctx);
      return ctx.scene.leave();
    } catch (error) {
      console.error('Error in add_book_scene step 5:', error);
      await ctx.reply('Произошла ошибка, пожалуйста, попробуйте еще раз.');
    }
  }
);

addBookScene.action('back_to_main_menu', async (ctx) => {
  try {
    sendMainMenu(ctx);
    await ctx.answerCbQuery();
    await ctx.scene.leave();
  } catch (error) {
    console.error('Error in back_to_main_menu action:', error);
    await ctx.reply('Произошла ошибка, пожалуйста, попробуйте еще раз.');
  }
});
