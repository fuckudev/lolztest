import { Markup, Scenes } from "telegraf";
import { database } from "../../../database/db.js";

const { BaseScene } = Scenes;

class DeleteBookByName extends BaseScene {
  constructor() {
    super('deleteBookByName');

    this.enter((ctx) => {
      ctx.reply(
        'Введите название книги, которую вы хотите удалить:',
        Markup.inlineKeyboard([
          Markup.button.callback('Вернуться в главное меню', 'back_to_main_menu'),
        ])
      );
    });

    this.on('text', async (ctx) => {
      try {
        const bookName = ctx.message.text.trim();

        if (!bookName) {
          await ctx.reply('Пожалуйста, введите корректное название книги.');
          return ctx.wizard.next();
        }

        const result = await database.deleteBookByName(ctx.from.id, bookName);

        await ctx.reply(result);
      } catch (error) {
        console.error('Error deleting book by name:', error.message);
        await ctx.reply(
          'Произошла ошибка при удалении книги. Попробуйте еще раз.',
          Markup.inlineKeyboard([
            Markup.button.callback('Вернуться в главное меню', 'back_to_main_menu'),
          ])
        );
      }

      // End the scene after handling the delete operation
      return ctx.scene.leave();
    });
  }
}

const deleteBookByName = new DeleteBookByName();

export { deleteBookByName };
