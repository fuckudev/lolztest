import { Markup, Scenes } from "telegraf";
import { database } from "../../../database/db.js";


const { BaseScene } = Scenes;

class EnterBook extends BaseScene {
    constructor() {
        super('enterBook');

        this.enter((ctx) => {
            ctx.reply(
                'Введите название книги для просмотра подробной информации:',
                Markup.inlineKeyboard([
                    Markup.button.callback('Вернуться в главное меню', 'back_to_main_menu'),
                ])
            );
        });

        this.on('text', async (ctx) => {
            try {
                const bookName = ctx.message.text.trim();
                const selectedBook = await database.getBookByName(ctx.from.id, bookName);

                if (selectedBook) {
                    const detailedInfo = `*Название:* ${selectedBook.name}\n*Автор:* ${selectedBook.author}\n*Описание:* ${selectedBook.description}\n*Жанр:* ${selectedBook.genre}`;
                    await ctx.replyWithMarkdown(detailedInfo);
                } else {
                    await ctx.reply(
                        `Книга с названием "${bookName}" не найдена, выберите действие для продолжения:`,
                        Markup.inlineKeyboard([
                            Markup.button.callback('Вернуться в главное меню', 'back_to_main_menu'),
                        ])
                    );
                }

                // Leave the scene after handling the book
                ctx.scene.leave();
            } catch (error) {
                console.error('Error handling book selection:', error.message);
            }
        });
    }
}

const enterBook = new EnterBook();

export { enterBook };
