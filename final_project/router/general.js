const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  // Check if both username and password are provided
  if (username && password) {
    // Check if the user does not already exist
    if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user. Username or password is not provided!"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    // Creating a new Promise to handle data reading
  let booksPromise = new Promise((resolve,reject) => {
    try {
      const data = JSON.stringify(books,null,4);
      // Resolving the promise with the data if successfully
      resolve(data);
    } catch (err) {
      // Rejecting the promise if an error occurs
      reject(err);
    }
  });
  // Handling the resolved and rejected states of the promise
  booksPromise.then(
    // Logging the data if the promise is resolved
    (data) => res.send(data),
    // Logging an error message if the promise is rejected
    (err) => {
      console.error("Error reading data:", err);
      res.status(500).send("Error reading data");
    }
  );
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    // Creating a new Promise to handle data reading
    let detailsPromise = new Promise((resolve,reject) => {
      try {
        const book = JSON.stringify(books[isbn],null,4);
        // Resolving the promise with the data if successfully
        resolve(book);
      } catch (err) {
        // Rejecting the promise if an error occurs
        reject(err);
      }
    });
    // Handling the resolved and rejected states of the promise
    detailsPromise.then(
      // Logging the data if the promise is resolved
      (book) => res.send(isbn +": "+ book),
      // Logging an error message if the promise is rejected
      (err) => {
        console.error("Error reading data:", err);
        res.status(500).send("Error reading data");
      }
    );
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    const getAuthorBooks = async (author) => {
      let isbns = Object.keys(books);
      let author_books = [];
      for (let key of isbns) {
        if (books[key].author === author) {
          author_books.push(key +":", books[key]);
        }
      }
      return author_books;
    };

    try {
      const authorBooks = await getAuthorBooks(author);
      res.send(JSON.stringify(authorBooks, null, 4));
    } catch (err) {
      // Logging the rejection message
      console.log("Rejected for data: ", err);
      res.status(500).send("Error retrieving data");
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    const getTitleBooks = async (title) => {
      let isbn = Object.keys(books);
      let title_books = [];
      for (let key of isbn) {
        if (books[key].title.toUpperCase() === title.toUpperCase()) {
          title_books.push(key +":", books[key]);
        }
      }
      return title_books;
    };

    try {
      const titleBooks = await getTitleBooks(title);
      res.send(JSON.stringify(titleBooks,null,4));
    } catch (err) {
      // Logging the rejection message
      console.log("Rejected for data: ", err);
      res.status(500).send("Error retrieving data");
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const reviews = books[isbn].reviews;
  res.send(JSON.stringify(reviews),null,4);
});

module.exports.general = public_users;
