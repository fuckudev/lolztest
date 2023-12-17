import { Markup } from "telegraf";

async function sendMainMenu(ctx) {
  try {
    ctx.scene.leave();
    const keyboard = Markup.keyboard([
      ['Добавить книгу', 'Посмотреть список книг'],
      ['Поиск заметки', 'Удаление заметки'],
      ['Профиль']
    ]).resize();
  
    ctx.reply('Выберите необходимое действие:', keyboard);
  } catch (error) {
    console.error('Error in sendMainMenu:', error.message);
  }
}

export { sendMainMenu };
