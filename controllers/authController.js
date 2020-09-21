const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { create } = require('../models/user');

// error handling
const handleErrors = (err) => {
    let errors = {email: '', password: ''};
    
    //error checking 

    if (err.message === 'Incorrect login') { // checking for incorrect login details
        errors.password = "Login creditentials are incorrect"
    }

    if (err.code === 11000) { // error code for duplicate email
        errors.email = 'Email is already registered';
    } else if(err.message.includes('user validation failed')) { //error code for invalid info eg email not valid 
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
}

const maxAge = 1 * 24 * 60 * 60;

const createToken = (id) => {
    return jwt.sign({ id }, 'blog secret', {
        expiresIn: maxAge
    });
}

module.exports.signup_get = (req, res) => {
    res.render('auth/signup', {title: 'Sign up'});
}

module.exports.login_get = (req, res) => {
    res.render('auth/login', {title: 'Login'});
}

module.exports.signup_post = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.create({email, password});
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(201).json({ user: user._id });
    } catch (err) {
        errs = handleErrors(err)
        res.status(400).json({errs});

    }
}

module.exports.login_post = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ user: user._id });
    } catch (err) {
        errs = handleErrors(err)
        res.status(400).json({errs});
    }
}

module.exports.logout_get = async (req, res) => {
    res.cookie('jwt', '', {maxAge: 1});
    res.redirect('/');
}