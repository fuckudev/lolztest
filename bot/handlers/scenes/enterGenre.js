import { Markup, Scenes } from "telegraf";
import { database } from "../../../database/db.js";

const { BaseScene } = Scenes;

class SelectGenre extends BaseScene {
    constructor() {
        super('selectGenre');

        this.enter((ctx) => {
            ctx.reply(
                'Введите жанр книг, которые вас интересуют:',
                Markup.inlineKeyboard([
                    Markup.button.callback('Вернуться в главное меню', 'back_to_main_menu'),
                ])
            );
        });

        this.on('text', async (ctx) => {
            const userResponse = ctx.message.text.trim();
            const lowercaseResponse = userResponse.toLowerCase();
            const uppercaseResponse = userResponse.toUpperCase();
            const capitalizedResponse = userResponse.charAt(0).toUpperCase() + userResponse.slice(1);

            if (!userResponse) {
                // Handle empty input
                await ctx.reply(
                    'Введите жанр книг, которые вас интересуют:',
                    Markup.inlineKeyboard([
                        Markup.button.callback('Вернуться в главное меню', 'back_to_main_menu'),
                    ])
                );
                return ctx.wizard.next();
            }

            try {
                const books = await database.getBooksByGenre(ctx.from.id, lowercaseResponse);

                if (books.length === 0) {
                    // Try again with uppercase version
                    const booksUppercase = await database.getBooksByGenre(ctx.from.id, uppercaseResponse);

                    if (booksUppercase.length === 0) {
                        // Try again with only the first letter uppercase
                        const booksCapitalized = await database.getBooksByGenre(ctx.from.id, capitalizedResponse);

                        if (booksCapitalized.length === 0) {
                            await ctx.reply(`Нет книг с жанром "${userResponse}".`);
                        } else {
                            const booksList = booksCapitalized.map((book, index) => {
                                return `${index + 1}. *Название:* ${book.name}\n*Автор:* ${book.author}\n`;
                            });

                            await ctx.replyWithMarkdown(
                                `Книги с жанром "${userResponse}":\n\n` + booksList.join('\n'),
                                Markup.inlineKeyboard([
                                    Markup.button.callback('Вернуться в главное меню', 'back_to_main_menu'),
                                ])
                            );
                        }
                    } else {
                        const booksList = booksUppercase.map((book, index) => {
                            return `${index + 1}. *Название:* ${book.name}\n*Автор:* ${book.author}\n`;
                        });

                        await ctx.replyWithMarkdown(
                            `Книги с жанром "${userResponse}":\n\n` + booksList.join('\n'),
                            Markup.inlineKeyboard([
                                Markup.button.callback('Вернуться в главное меню', 'back_to_main_menu'),
                            ])
                        );
                    }
                } else {
                    const booksList = books.map((book, index) => {
                        return `${index + 1}. *Название:* ${book.name}\n*Автор:* ${book.author}\n`;
                    });

                    await ctx.replyWithMarkdown(
                        `Книги с жанром "${userResponse}":\n\n` + booksList.join('\n'),
                        Markup.inlineKeyboard([
                            Markup.button.callback('Вернуться в главное меню', 'back_to_main_menu'),
                        ])
                    );
                }
            } catch (error) {
                console.error('Error fetching books by genre:', error.message);
                await ctx.reply(
                    'Произошла ошибка при получении списка книг по жанру.',
                    Markup.inlineKeyboard([
                        Markup.button.callback('Вернуться в главное меню', 'back_to_main_menu'),
                    ])
                );
            }

            // End the scene after handling the genre
            return ctx.scene.leave();
        });
    }
}

const selectGenre = new SelectGenre();

export { selectGenre };