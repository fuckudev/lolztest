import { Markup } from 'telegraf';
import { Scenes } from 'telegraf';
import { database } from '../../../database/db.js';
import { sendMainMenu } from '../commands/startHandler.js';

const { WizardScene } = Scenes;

// Scene for viewing books
export const booksPageScene = new WizardScene(
  'booksPage',
  async (ctx) => {
    const userId = ctx.from.id;

    try {
      const books = await database.getBooksByUserId(userId);

      if (books.length === 0) {
        await ctx.reply('У вас пока нет добавленных книг.', Markup.inlineKeyboard([
          Markup.button.callback('Вернуться в главное меню', 'back_to_main_menu')
        ]));
        // End the wizard if there are no books
        return ctx.scene.leave();
      } else {
        const booksList = books.map((book, index) => {
          return `${index + 1}. *Название:* ${book.name}\n*Автор:* ${book.author}\n`;
        });

        const keyboard = Markup.keyboard([
          ['Выбрать книгу', 'По жанру'],
          ['Вернуться в главное меню'],
        ]).resize();

        await ctx.replyWithMarkdown('Ваши книги:\n\n' + booksList.join('\n'), keyboard);
        await ctx.reply('Выберите действие:');
        // Set the next step for handling the selected action
        return ctx.wizard.next();
      }
    } catch (error) {
      console.error('Error fetching books:', error.message);
      await ctx.reply('Произошла ошибка при получении списка книг.');
      // End the wizard in case of an error
      return ctx.scene.leave();
    }
  },
  )

  
  // Function to handle selecting books by genre
  async function handleSelectGenre(ctx) {
    const userResponse = ctx.message.text.trim();
  
    if (!userResponse) {
      // Handle empty input
      await ctx.reply('Введите жанр книг, которые вас интересуют:', Markup.inlineKeyboard([
        Markup.button.callback('Вернуться в главное меню', 'back_to_main_menu')
      ]));
      return ctx.wizard.next();
    }
  
    try {
      const books = await database.getBooksByGenre(ctx.from.id, userResponse);
  
      if (books.length === 0) {
        await ctx.reply(`Нет книг с жанром "${userResponse}".`);
      } else {
        const booksList = books.map((book, index) => {
          return `${index + 1}. *Название:* ${book.name}\n*Автор:* ${book.author}\n`;
        });
  
        await ctx.replyWithMarkdown(`Книги с жанром "${userResponse}":\n\n` + booksList.join('\n'), Markup.inlineKeyboard([
          Markup.button.callback('Вернуться в главное меню', 'back_to_main_menu')
        ]));
      }
    } catch (error) {
      console.error('Error fetching books by genre:', error.message);
      await ctx.reply('Произошла ошибка при получении списка книг по жанру.', Markup.inlineKeyboard([
        Markup.button.callback('Вернуться в главное меню', 'back_to_main_menu')
      ]));
    }
  
    // End the wizard after handling the genre
    return ctx.scene.leave();
  }
