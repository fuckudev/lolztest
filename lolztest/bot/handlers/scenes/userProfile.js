import { Markup, Scenes } from "telegraf";
import { database } from "../../../database/db.js";

const { BaseScene } = Scenes;

class UserProfile extends BaseScene {
  constructor() {
    super('userProfile');

    this.enter(async (ctx) => {
      try {
        const books = await database.getBooksByUserId(ctx.from.id);

        if (books.length > 0) {
          const profileInfo = `*ID пользователя:* ${ctx.from.id}\n*Количество книг в базе данных:* ${books.length}`;
          await ctx.replyWithMarkdown(profileInfo);
        } else {
          await ctx.reply('У вас нет книг в базе данных.');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error.message);
        await ctx.reply('Произошла ошибка при получении информации о профиле. Попробуйте еще раз.');
      }

      // End the scene after sending the user profile information
      return ctx.scene.leave();
    });
  }
}

const userProfile = new UserProfile();

export { userProfile };
