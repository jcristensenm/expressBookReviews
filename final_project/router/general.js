const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 2));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;          // get ISBN from URL
  const book = books[isbn];             // look up book by ISBN key
  if (book) {
    return res.status(200).send(JSON.stringify(book, null, 2));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});
  
// Get book details based on author (using Axios + async/await)
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    // Example of using Axios to retrieve the book list asynchronously
    const response = await axios.get('http://localhost:5000/');

    // The root endpoint returns a JSON string, so parse it
    const allBooks = typeof response.data === 'string'
      ? JSON.parse(response.data)
      : response.data;

    const keys = Object.keys(allBooks);
    const booksByAuthor = [];

    keys.forEach((key) => {
      if (allBooks[key].author === author) {
        booksByAuthor.push(allBooks[key]);
      }
    });

    if (booksByAuthor.length > 0) {
      return res.status(200).send(JSON.stringify(booksByAuthor, null, 2));
    } else {
      return res.status(404).json({ message: "No books found for this author" });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error while fetching books by author",
      error: error.message,
    });
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const keys = Object.keys(books);
  const booksByTitle = [];

  keys.forEach((key) => {
    if (books[key].title === title) {
      booksByTitle.push(books[key]);
    }
  });

  if (booksByTitle.length > 0) {
    return res.status(200).send(JSON.stringify(booksByTitle, null, 2));
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 2));
  } else if (book) {
    return res.status(200).send(JSON.stringify({}, null, 2));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;

