const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Simple in-memory "database"
let usersDB = [];

// Register user
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (usersDB.find(u => u.username === username)) {
        return res.status(400).json({ message: "Username already exists!" });
    }
    const newUser = { username, password, balance: 0, transactions: [] };
    usersDB.push(newUser);
    res.status(201).json({ message: "User registered successfully!" });
});

// Login user
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = usersDB.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials!" });
    }
    res.json(user);  // Send back user data (without password)
});

// Handle transactions
app.post('/transaction', (req, res) => {
    const { username, type, amount } = req.body;
    const user = usersDB.find(u => u.username === username);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (type === "withdraw") {
        if (user.balance < amount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }
        user.balance -= amount;
        user.transactions.push(`Withdrew $${amount}`);
    } else if (type === "deposit") {
        user.balance += amount;
        user.transactions.push(`Deposited $${amount}`);
    }

    res.json(user);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
