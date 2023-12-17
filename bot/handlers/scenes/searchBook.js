import { Markup, Scenes } from "telegraf";
import { database } from "../../../database/db.js";

const { BaseScene } = Scenes;

class SearchBook extends BaseScene {
  constructor() {
    super('searchBook');

    this.enter((ctx) => {
      ctx.reply(
        'Введите название книги или автора для поиска:',
        Markup.inlineKeyboard([
          Markup.button.callback('Вернуться в главное меню', 'back_to_main_menu'),
        ])
      );
    });

    this.on('text', async (ctx) => {
      try {
        const searchTerm = ctx.message.text.trim();

        if (!searchTerm) {
          await ctx.reply(
            'Введите название книги или автора для поиска:',
            Markup.inlineKeyboard([
              Markup.button.callback('Вернуться в главное меню', 'back_to_main_menu'),
            ])
          );
          return ctx.wizard.next();
        }

        const books = await database.searchBooks(ctx.from.id, searchTerm);

        if (books.length === 0) {
          await ctx.reply(`По запросу "${searchTerm}" ничего не найдено.`);
        } else {
          const booksInfo = [];
          for (const book of books) {
            const fullBookInfo = await database.getBookByName(ctx.from.id, book.name);
            booksInfo.push(fullBookInfo);
          }

          const booksList = booksInfo.map((book, index) => {
            const detailedInfo = `*Название:* ${book.name}\n*Автор:* ${book.author}\n*Описание:* ${book.description}\n*Жанр:* ${book.genre}`;
            return `${index + 1}. ${detailedInfo}\n`;
          });

          await ctx.replyWithMarkdown(
            `Результаты поиска для "${searchTerm}":\n\n` + booksList.join('\n'),
            Markup.inlineKeyboard([
              Markup.button.callback('Вернуться в главное меню', 'back_to_main_menu'),
            ])
          );
        }
      } catch (error) {
        console.error('Error searching books:', error.message);
        await ctx.reply(
          'Произошла ошибка при поиске книг. Попробуйте еще раз.',
          Markup.inlineKeyboard([
            Markup.button.callback('Вернуться в главное меню', 'back_to_main_menu'),
          ])
        );
      }

      // End the scene after handling the search
      return ctx.scene.leave();
    });
  }
}

const searchBook = new SearchBook();

export { searchBook };
