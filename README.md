# lolztest telegram bot

Инструкция по установке и запуске на windows:

1. Устанавливаем Node.js [ https://nodejs.org/en ]
2. Скачиваем репозиторий
3. В config.js указываем токен телеграм бота.
4. Открываем install.bat для установки зависимостей
5. Запускаем start.bat - для запуска программы.



Инструкция по установке и запуске на ubuntu:
1. установка Node.js:
sudo apt update
sudo apt install nodejs
sudo apt install npm

2. Клонирование репозитория:
git clone <URL репозитория>
cd <название папки проекта>

3. Настройка файла config.js:
Откройте файл config.js в вашем текстовом редакторе и укажите токен вашего телеграм-бота.

4. Установка зависимостей:
npm install

5. Запуск программы:
pm2 start index.js
   

