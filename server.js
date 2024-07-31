const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

app.use(cors());
app.use(express.json());
dotenv.config();

//CONNECTION TO DATABASE
const db = mysql.createConnection({
    user: 'process.env.DB_HOST',
    root: 'process.env.DB_USER',
    password: 'process.env.DB_PASSWORD'
})
 //check if the connection works
 db.connect((err) => {
    if(err) {
         return console.log('error connecting to mysql')
    }
    console.log('connected to mysql as id:', db.threadid)

    //creating a database
    db.query(`CREATE DATABASE IF DOES EXISTS tracker`, (err, result) => {
        if(err) return console.log('err')
        
            console.log('database tracker created/checked');
        //change database
        db.changeUser({ databse: 'tracker' }, (err, result) => {
            if(err) return console.log(err)
                 
            console.log('tracker is in use');

            //create users table
            const usersTable = `
             CREATE TABLE IF NOT EXISTS users (
                id INT AUTO-INCREMENT PRIMARY KEY,
                email VARCAHR(100) NOT NULL UNIQUE,
                username VARCHAR(50) NOT NULL,
                password VARCHAR(255)
                )
            `;
            db.query(usersTable, (err, result) => {
                if (err) return console(err)
                
                console.log("usersTable created/checked successfully")
            })


        })
    })
 });

 //user registration route
app.post('/api/register', async(req, res) => {
    const { email, username, password } = req.body
    try{
        const users = `SELECT * FROM users WHERE email =?`
        //check if users exists
        db.query(users, [req.body.email], (err, data) => {
            if(data.length > 0) return res.status(409).json("user already exists");
          
            //hashing passwords
            const salt = bcrypt.genSaltSync(10)
            const hashedPassword = bcrypt.hashSync(req.body.password, salt)

            const newUser = `INSERT INTO users(email, username, password) VALUES (?)`
            value = [req.body.email, req.body.username, hashedPassword ]

            db.query(newUser [value], (err, data) => {
                if(err) return res.status(400).json("something went wrong")
                    return res.status(200).json("user created successfully")
            });
        });
    }
    catch(err) {
        res.status(500).json("internal server error")
    } 
});

//user login route
app.post('/api/login', async(req, res) = {
    const  { email, password } = req.body;
    try{
        const users = `SELECT * FROM users WHERE email = ?`;
        db.query(users, [req.body.email], (err, data) => {
            if (data.length === 0) return res.status(404).json("User not found")

            const isPasswordValid = bcrypt.compareSync(req.body.password, data[o].password)

            if(!isPasswordValid) return res.status(400).json("invalid username or password")
            
            return res.status(200).json("Login successful")
        })

    } catch (err) {
        res.status(500).json("Internal server error")
    }
});

//add a new expense
app.post('/api/expenses', (req, res) => {
    const { user_id, amount, date, category } = req.body;
    
    if (!user_id || !amount || !date || !category) {
        return res.status(400).json("All fields are required");
    }

    const query = `INSERT INTO expenses (user_id, amount, date, category) VALUES (?, ?, ?, ?)`;
    const values = [user_id, amount, date, category];

    db.query(query, values, (err) => {
        if (err) return res.status(500).json("Failed to add expense");
        return res.status(209).json("Expense added successfully");
    });
});

//view expense for a user
app.get('/api/expenses/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = 'SELECT * FROM expenses WHERE user_id = ?';

    db.query(query, [userId], (err, data) => {
        if (err) return res.status(500).json("Failed to retrieve expenses");
        return res.status(200).json(data);
    });
});

//update an expense 
app.put('/api/expenses/:id', (req, res) => {
    const { id } = req.params;
    const { amount, date, category } = req.body;

    const query = `
    UPDATE expenses
    SET amount = ?, date = ?, category = ?
    WHERE id = ?
    `;
    const values = [amount, date, category, id];

    db.query(query, values, (err) => {
        if (err) return res.status(500).json("Failed to update expenses");
        return res.status(200).json("Expense updated successfully");
    });
});

//delete an expense
app.delete('/api/expenses/:id', (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM expenses WHERE id = ?`;

    db.query(query, [id], (err) => {
        if (err) return res.status(500).json("Failed to delete expense");
        return res.status(200).json("Expense deleted successfully");
    });
});

//connection to server
app.listen(3000, () =>{
    console.log('server is running on port 3000...')
});