import sqlite3 from 'sqlite3';
import { config } from '../config.js';
import { resolve } from 'path';
import { rejects } from 'assert';

class Database {
  constructor() {
    this.db = new sqlite3.Database('mydatabase.db', (err) => {
      if (err) {
        console.error('Ошибка при открытии/создании базы данных:', err.message);
      } else {
        console.log('База данных успешно открыта/создана');
        this.initializeDatabase();
      }
    });
  }

  async initializeDatabase() {
    await this.createTables();
    await this.addGenres(config.genresToAdd);
  }

  async createTables() {
    await this.createTable(`
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY,
        book INTEGER
      )
    `);

    await this.createTable(`
    CREATE TABLE IF NOT EXISTS Books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT,
      author TEXT,
      description TEXT,
      genre TEXT
    );
    `);

    await this.createTable(`
      CREATE TABLE IF NOT EXISTS Genres (
        id INTEGER PRIMARY KEY,
        genreName TEXT
      )
    `);
  }

  async createTable(query) {
    return new Promise((resolve, reject) => {
      this.db.run(query, (err) => {
        if (err) {
          console.error('Error creating table:', err.message);
          reject(err);
        } else {
         // console.log(`Table created successfully: ${query}`);
          resolve();
        }
      });
    });
  }

  async run(query, params) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function (err) {
        if (err) {
          console.error('Database run error:', err.message);
          reject(err);
        } else {
          resolve({ changes: this.changes, lastID: this.lastID });
        }
      });
    });
  }


  async addGenres(genreNames) {
    const stmtInsert = this.db.prepare('INSERT INTO Genres (genreName) VALUES (?)');
    const stmtSelect = this.db.prepare('SELECT COUNT(*) as count FROM Genres WHERE genreName = ?');
  
    for (const genreName of genreNames) {
      const result = await new Promise((resolve) => {
        stmtSelect.get([genreName], (err, row) => {
          resolve(row);
        });
      });
  
      if (result.count === 0) {
        await new Promise((resolve) => {
          stmtInsert.run([genreName], (err) => {
            if (err) {
              console.error('Ошибка при добавлении жанра:', err.message);
            } else {
            //  console.log(`Жанр "${genreName}" успешно добавлен в таблицу Genres`);
            }
            resolve();
          });
        });
      } else {
       // console.log(`Жанр "${genreName}" уже существует в таблице Genres`);
      }
    }
  
    stmtInsert.finalize();
    stmtSelect.finalize();
  
    console.log('Все жанры успешно добавлены в таблицу Genres');
  }



  async getUserProfile(userId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT id, COUNT(id) as bookCount FROM Users JOIN Books ON Users.id = Books.user_id WHERE Users.id = ?';

      this.db.get(query, [userId], (err, row) => {
        if (err) {
          console.error('Error fetching user profile:', err.message);
          reject(err);
        } else {
          const profile = {
            userId: row.id,
            bookCount: row.bookCount,
          };
          resolve(profile);
        }
      });
    });
  }

  getGenres() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM Genres', [], (err, rows) => {
        if (err) {
          console.error('Error fetching genres from the database:', err.message);
          reject(err);
        } else {
          // Extract genre names from the rows
          const genres = rows.map((row) => row.genreName);
          resolve(genres);
        }
      });
    });
  }

  addUserToDatabase(userId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT OR IGNORE INTO Users (id, book) VALUES (?, ?)',
        [userId, 0],
        function (err) {
          if (err) {
            console.error('Ошибка при добавлении пользователя:', err.message);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  addBook(userId, name, author, description, genre) {
    return new Promise((resolve, reject) => {
      const insertQuery = 'INSERT INTO Books (user_id, name, author, description, genre) VALUES (?, ?, ?, ?, ?)';
      this.db.run(insertQuery, [userId, name, author, description, genre], function (err) {
        if (err) {
          console.error(err.message);
          reject(err.message);
        } else {
          console.log(`Book ${name} added with ID ${this.lastID}`);
          resolve(`Book ${name} added with ID ${this.lastID}`);
        }
      });
    });
  }
  

  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Ошибка при закрытии базы данных:', err.message);
      } else {
        console.log('Соединение с базой данных успешно закрыто');
      }
    });
  }


  getBooksByUserId(userId) {
    return new Promise((resolve, reject) => {
      // Assuming there is a table named 'Books' in your database with columns 'user_id', 'name', 'author', 'description', 'genre'
      const query = 'SELECT name, author, description, genre FROM Books WHERE user_id = ?';
  
      this.db.all(query, [userId], (err, rows) => {
        if (err) {
          console.error('Error fetching books:', err.message);
          reject(err);
        } else {
          const books = rows.map((row) => ({
            name: row.name,
            author: row.author,
            description: row.description,
            genre: row.genre
          }));
          resolve(books);
        }
      });
    });
  }

  async getBookByName(userId, bookName) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM Books WHERE user_id = ? AND name = ? LIMIT 1';

      this.db.get(query, [userId, bookName], (err, row) => {
        if (err) {
          console.error('Error fetching book by name:', err.message);
          reject(err);
        } else {
          if (row) {
            const book = {
              id: row.id,
              name: row.name,
              author: row.author,
              description: row.description,
              genre: row.genre,
            };
            resolve(book);
          } else {
            // If no book is found with the given name, resolve with null
            resolve(null);
          }
        }
      });
    });
  }

  async searchBooks(userId, searchTerm) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT name, author
        FROM Books
        WHERE user_id = ?
          AND (name LIKE ? OR author LIKE ?)
      `;

      const searchPattern = `%${searchTerm}%`;

      this.db.all(query, [userId, searchPattern, searchPattern], (err, rows) => {
        if (err) {
          console.error('Error searching books:', err.message);
          reject(err);
        } else {
          const books = rows.map((row) => ({
            name: row.name,
            author: row.author,
          }));
          resolve(books);
        }
      });
    });
  }


  async deleteBook(userId, bookId) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM Books WHERE user_id = ? AND id = ?';

      this.db.run(query, [userId, bookId], function (err) {
        if (err) {
          console.error('Error deleting book:', err.message);
          reject(err.message);
        } else {
          if (this.changes > 0) {
            console.log(`Book with ID ${bookId} deleted for user ${userId}`);
            resolve(`Книга с номером ${bookId} удалена для пользователя ${userId}`);
          } else {
            console.log(`Book with ID ${bookId} not found for user ${userId}`);
            reject(`Книга с номером ${bookId} не найдена для пользователя ${userId}`);
          }
        }
      });
    });
  }

  async deleteBookByName(userId, bookName) {
    try {
      const query = 'DELETE FROM Books WHERE user_id = ? AND name = ?';
      const result = await this.run(query, [userId, bookName]);
      
      if (result.changes > 0) {
        console.log(`Book with name "${bookName}" deleted for user ${userId}`);
        return `Книга с названием "${bookName}" удалена для пользователя ${userId}`;
      } else {
        console.log(`Book with name "${bookName}" not found for user ${userId}`);
        throw new Error(`Книга с названием "${bookName}" не найдена для пользователя ${userId}`);
      }
    } catch (error) {
      console.error('Error deleting book:', error.message);
      throw new Error(`Произошла ошибка при удалении книги. Попробуйте еще раз.`);
    }
  }

  getBooksByGenre(userId, genre) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT name, author FROM Books WHERE user_id = ? AND genre = ?';

      this.db.all(query, [userId, genre], (err, rows) => {
        if (err) {
          console.error('Error fetching books by genre:', err.message);
          reject(err);
        } else {
          const books = rows.map((row) => ({
            name: row.name,
            author: row.author,
          }));
          resolve(books);
        }
      });
    });
  }
  


}


const database = new Database();
export { database };
