const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Setup session middleware for customer routes
app.use("/customer", session({
  secret: "fingerprint_customer",  // Secret used to sign the session ID
  resave: true,
  saveUninitialized: true
}));

// Authentication middleware for customer routes
app.use("/customer/auth/*", function auth(req, res, next) {
  const accessToken = req.session.accessToken;  // Retrieve access token from session

  if (!accessToken) {
    return res.status(401).json({ message: "Access token not found. Please log in." });
  }

  // Verify the access token using the JWT secret
  jwt.verify(accessToken, "your_jwt_secret_key", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }
    
    // Token is valid, attach user information to the request
    req.user = user;
    
    // Proceed to the next middleware or route handler
    next();
  });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
