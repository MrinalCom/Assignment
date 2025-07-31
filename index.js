const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const fs = require("fs");
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use(express.json());
app.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  //validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters long" });
  }
  //Hash the password
  const hashedPassword = bcrypt.hash(password, 10).then((hash) => {
    // Check if the hash was created successfully
    if (!hash) {
      return res.status(500).json({ error: "Error hashing password" });
    }
    console.log("Password hashed successfully", hash);
    return hash;
  });
  console.log("Hashed Password:", hashedPassword);
  // Save user to JSON database

  // const user = { username, email, password: hashedPassword };
  const saveUser = async () => {
    const user = { username, email, password: await hashedPassword };
    return user;
  };
  saveUser()
    .then((user) => {
      fs.readFile("users.json", "utf8", (err, data) => {
        if (err) {
          return res.status(500).json({ error: "Error reading database" });
        }
        let users = [];
        if (data) {
          users = JSON.parse(data);
        }
        // Check for duplicate email
        const existingUser = users.find((u) => u.email === email);
        if (existingUser) {
          return res.status(400).json({ error: "Email already registered" });
        }
        users.push(user);
        fs.writeFile("users.json", JSON.stringify(users, null, 2), (err) => {
          if (err) {
            return res.status(500).json({ error: "Error saving user" });
          }

          res.status(201).json({
            message: "User registered successfully",
            userId: users.length,
          });
        });
      });
    })
    .catch((error) => {
      console.error("Error saving user:", error);
      res.status(500).json({ error: "Internal server error" });
    });
});

// 1. Accept a POST request with a JSON body containing username, email, and password.
// 2. Validate the input (e.g., email format, password length, record duplicacy).
// 3. Hash the password securely.
// 4. Save the user to a JSON database (JSON file).
// 5. Return a success response (e.g., user ID and message).
