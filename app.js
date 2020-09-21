const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const BlogRoutes = require('./routes/blogRoutes');
const AuthRoutes = require('./routes/authRoutes');
const { checkUser } = require('./middleware/authMiddleware');

//express app 
const app = express();
//connect to mongo DB
const dbURI = 'mongodb+srv://test:test123@blogs.jnexg.mongodb.net/BlogDatabase?retryWrites=true&w=majority'
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => app.listen(3000))
    .catch((err) => console.log(err));

//register view engine
app.set('view engine', 'ejs');

// middleware & static files
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
    res.locals.path = req.path;
    next();
  });

//mongoose and mango sandbox routes

app.get('*', checkUser);
app.get('/' , (req, res) => {
    res.redirect('/blogs');
});

//blog routes
app.use('/blogs', BlogRoutes);

//auth routes
app.use(AuthRoutes);

// 404
app.use((req, res) => {
    res.status(404).render('404', {title: '404'});
});
