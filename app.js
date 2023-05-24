/*
 * Name: Tatsuhiko Araki
 * Date: May 23, 2023
 * Section: CSE 154 AA
 *
 * This is the JS file that implements the yipper application of server side JS
 * This program displays all of end points of this yipper page.
 */

"use strict";

/**
 * Required modules
 */
const express = require('express');
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const multer = require('multer');

const app = express();
const ERROR_RESPONSE = 400;
const SERVER_ERROR = 500;
const PORT_NUM = 8000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(multer().none());

/**
 * Route that fetches all yips or searched yips from the database.
 * If a search query parameter is provided, yips matching the query will be returned.
 */
app.get('/yipper/yips', async function (req, res) {
  try {
    let db = await getDBConnection();
    let search = req.query.search;
    let text = "";
    if (!search) {
      text = await db.all("SELECT * FROM yips ORDER BY DATETIME(date) DESC");
    } else {
      text = await db.all("SELECT id FROM yips WHERE yip LIKE ? ORDER BY id;", "%" + search + "%");
    }
    await db.close();
    res.json({ "yips": text });
  } catch (error) {
    res.type("text");
    res.status(SERVER_ERROR).send('An error occurred on the server. Try again later.');
  }
});

/**
 * Route that fetches all yips by a specific user from the database.
 * The user is specified by the 'user' path parameter.
 */
app.get('/yipper/user/:user', async function (req, res) {
  try {
    let db = await getDBConnection();
    let user = req.params['user'];
    let yipData = await db.all(
      'SELECT name, yip, hashtag, date FROM yips ' +
      'WHERE name LIKE ? ORDER BY DATETIME(date) DESC;',
      user
    );
    await db.close();
    if (yipData.length === 0) {
      res.type("text");
      res.status(ERROR_RESPONSE).send("Yikes. User does not exist.");
    } else {
      res.json(yipData);
    }
  } catch (err) {
    res.type("text");
    res.status(SERVER_ERROR).send(SERVER_ERROR_MSG);
  }
});

/**
 * Route that increments the number of likes for a specific yip in the database.
 * The yip is identified by the 'id' body parameter.
 */
app.post('/yipper/likes', async function (req, res) {
  try {
    if (!req.body.id) {
      res.status(ERROR_RESPONSE).send('Missing one or more of the required params.');
      return;
    } else {
      let db = await getDBConnection();
      let id = req.body.id;
      await db.run('UPDATE yips SET likes = likes + 1 WHERE id LIKE ?;', id);
      let yipData = await db.all('SELECT likes FROM yips WHERE id LIKE ?;', id);
      if (yipData.length === 0) {
        res.status(ERROR_RESPONSE).send('Yikes. ID does not exist.');
      } else {
        await db.close();
        let likes = yipData[0].likes.toString();
        res.send(likes);
      }
    }
  } catch (error) {
    res.type("text");
    res.status(SERVER_ERROR).send('An error occurred on the server. Try again later.');
  }
});

/**
 * Route that posts a new yip to the database.
 * The yip content, user name, and hashtag are provided through the body parameters 'name' and 'full'.
 */
app.post('/yipper/new', async function (req, res) {
  try {
    let name = req.body.name;
    let full = req.body.full;
    if (name && full) {
      let db = await getDBConnection();
      let yipArray = full.split(" #");
      let yipContent = yipArray[0];
      let hashtagText = yipArray[1];
      let initialLikes = 0;
      let validUser = await db.all('SELECT * FROM yips WHERE name = ?;', name);
      let query = "INSERT INTO yips (name, yip, hashtag, likes) VALUES ('" + name +
        "', '" + yipContent + "', '" + hashtagText + "', " + initialLikes + ");";
      let result = await db.run(query);
      let newestYip = await db.all("SELECT * FROM yips WHERE id = " + result.lastID);
      let finalYip = newestYip[0];
      if (validUser === 0) {
        res.status(ERROR_RESPONSE).send('Yikes. User does not exist.');
      } else {
        res.json(finalYip);
      }
    } else {
      res.status(ERROR_RESPONSE).send('Missing one or more of the required params.');
    }
  } catch (err) {
    res.status(500).type('text')
      .send('An error occurred on the server. Try again later.');
  }
});

/**
 * Establishes a database connection to the database and returns the database object.
 * Any errors that occur should be caught in the function that calls this one.
 * @returns {sqlite3.Database} - The database object for the connection.
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'yipper.db',
    driver: sqlite3.Database
  });
  return db;
}

// Serve static files from the "public" directory
app.use(express.static("public"));
const PORT = process.env.PORT || PORT_NUM;
app.listen(PORT);
