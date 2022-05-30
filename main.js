const express = require('express')
const MongoClient = require('mongodb').MongoClient
const app = express()
const mongoose =require('mongoose')
const session =require('express-session')
require('dotenv').config(); 
const PORT = process.env.PORT || 4000;

//Connect to database
mongoose.connect(process.env.DB_URI, {useNewUrlParser : true, useUnifiedTopology:true, useCreateIndex: true,useFindAndModify :false});
const db = mongoose.connection;
db.on('error',(error) => console.log(error));
db.once('open',()=> console.log('Connected to the database'));

const connectionString = 'mongodb+srv://bowz:sandy201026@Sandbox.kmw8a.mongodb.net/Department_Store?retryWrites=true&w=majority'

    // ========================
    // Middlewares
    // ========================
    app.set('view engine', 'ejs') //set template engine
    app.use(session({
        secret:'my secret key',
        saveUninitialized:true,
        resave:false,
    }));
    app.use((req,res,next) =>{
      res.locals.message = req.session.message;
      delete req.session.message;
      next();
    });
    app.use(express.urlencoded({ extended: false }))
    app.use(express.json())
    app.use(express.static('public')) //傳送靜態檔案
    app.use(express.static('uploads'));
    // ========================
    // Routes
    // ========================

    app.use("",require("./routes/routes"));

    // ========================
    // Listen
    // ========================
    app.listen(PORT, function () {
      console.log(`listening on : ${PORT}`);
    })
  
