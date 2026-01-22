//include required packages
const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();
const port=3000;

//database config info
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
};

//initialise express app
const app = express();
//helps app to read JSON
app.use(express.json());

//start the server
app.listen(port,()=> {
    console.log('Server running on port', port);
});

const cors = require("cors");
const allowedOrigins = [
"http://localhost:3000",
// "https://YOUR-frontend.vercel.app", // add later
// "https://YOUR-frontend.onrender.com" // add later
];
app.use(
    cors({
        origin: function (origin, callback) {
            // allow requests with no origin (Postman/server-to-server)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: false,
    })
);

// example route: get all cards
app.get('/cards', async(req,res)=> {
    try {
        let connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM defaultdb.cards');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({message:'Server error for allcards'});
    }
});

//example route: add cards
app.post('/cards/new',async(req,res)=>{
    const {card_name,card_pic} = req.body;
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute('INSERT INTO defaultdb.cards (card_name,card_pic) VALUES (?,?)', [card_name,card_pic]);
        res.status(201).json({message:'Card has been added successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message:'Server error - could not add card'});
    }
});

// example route: delete card
app.delete('/cards/:id/edit',async(req,res)=> {
    const {id} = req.params;
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM defaultdb.cards WHERE id='+id);
        res.status(201).json({message:'Card '+id+' deleted successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message:'Server error - could not delete card '+id});
    }
});

// example route: update card
app.put('/cards/:id/delete',async(req,res)=> {
    const {id} = req.params;
    const {card_name,card_pic} = req.body;
    try {
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute('UPDATE defaultdb.cards SET card_name=?, card_pic=? WHERE id=?',[card_name,card_pic,id]);
        res.status(201).json({message:'Card '+card_name+' updated successfully'});
    } catch (err) {
        console.error(err);
        res.status(500).json({message:'Server error - could not update card '+card_name});
    }
});