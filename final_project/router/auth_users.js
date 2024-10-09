const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const secretKey = "secret_key";

// Utility function to check if a username is valid
const isValid = (username) => {
  // Check if the username exists in the users array
  return users.some(user => user.username === username);
};

// Utility function to authenticate a user by username and password
const authenticatedUser = (username, password) => {
  // Find the user and check if the password matches
  const user = users.find(user => user.username === username);
  return user && user.password === password;
};

// Task 7: Login as a registered user
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT token
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
    
    // Send the token back to the user
    return res.status(200).json({ message: "Login successful", token });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body; // Review from the request body
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from the Authorization header

  // Verify token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const username = decoded.username;

    // Check if the book exists
    if (books[isbn]) {
      // If reviews object doesn't exist, create it
      if (!books[isbn].reviews) {
        books[isbn].reviews = {};
      }

      // Add or modify the review for this ISBN by the logged-in user
      books[isbn].reviews[username] = review;

      return res.status(200).json({ message: "Review added/modified successfully" });
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

  // Verify token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const username = decoded.username;

    // Check if the book exists
    if (books[isbn]) {
      // Check if the user has a review to delete
      if (books[isbn].reviews && books[isbn].reviews[username]) {
        // Delete the user's review
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Review deleted successfully" });
      } else {
        return res.status(404).json({ message: "Review not found" });
      }
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
