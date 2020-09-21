const Blog = require('../models/blog');
const jwt = require('jsonwebtoken');
const User = require('../models/user');


const getUserIdFromToken = async (token) => {
    let userId = 'error';
    if(token) {
        jwt.verify(token, 'blog secret', async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
            } else {
                userId = decodedToken.id;
            }
        });
    }
    return userId;
}

const blog_index = (req, res) =>{
    Blog.find().sort({ createdAt: -1 })
        .then((result) => {
            res.render('blogs/index', {title: 'All Blogs', blogs: result})
        })
        .catch((err) => {
            console.log(err);
        })
    };

const blog_details = async (req, res) => {
    const id = req.params.id;
    try {
        const blog = await Blog.findById(id);
        res.render('blogs/details', {blog: blog, title: 'Blog Details'});
    } catch (err) {
        res.status(404).render('404', {title: 'Blog not found'})
        }   
    };

const user_blogs = async (req, res) => {
    const authorId = await getUserIdFromToken(req.cookies.jwt);
    const author = await User.findById(authorId);
    Blog.find().where('author').equals(author.email).sort({ createdAt: -1})
        .then((result) => {
            res.render('blogs/userblogs', {title: "User Blogs", blogs: result})
        })
        .catch((err) => {
            console.log(err);
        })
    };

const blog_create_get = (req, res) => {
    res.render('blogs/create', { title: 'Create a new Blog'})
};

const blog_create_post = async (req, res) => {
    const {title, snippet, body } = req.body;
    const authorId = await getUserIdFromToken(req.cookies.jwt);
    const author = await User.findById(authorId);
    const blog = new Blog({ title, snippet, body, author: author.email });
    blog.save()
        .then((result) => {
            res.redirect('/blogs');
        })
        .catch((err) => {
            console.log(err)
        });
};

const blog_delete = async (req, res) => {
    const { id } = req.body;
    try { 
        const userId = await getUserIdFromToken(req.cookies.jwt);
        const author = await User.findById(userId);
        blog = await Blog.findById(id);
        if(blog.author == author.email) {
            await Blog.findByIdAndDelete(id)
            .catch(err => console.log(err));
            }
        res.status(200).json({ blog: blog._id });
    } catch (err) {
        console.log(err);
        res.status(400).json({err});
    }
    }

const blog_update_get = async (req, res) => {
    const id = req.params.id;
    try {
        const blog = await Blog.findById(id);
        const userId = await getUserIdFromToken(req.cookies.jwt);
        const author = await User.findById(userId);
        if(author.email == blog.author) {
            res.render('blogs/update', {blog: blog, title: 'Update Blog'});
        } else {
            res.redirect('/blogs');
        }
    } catch (err) {
        res.status(404).render('404', {title: 'Blog not found'})
        }   
    };

const blog_update_post = async (req, res) => {
    const { title, body, snippet, id } = req.body;
    try {
        const userId = await getUserIdFromToken(req.cookies.jwt);
        const author = await User.findById(userId);
        const blog = await Blog.findById(id);
        if(author.email == blog.author) {
            await Blog.updateOne({_id: id}, { title, body, snippet});
        }
        console.log("HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE");
        res.status(200).json({ blog: id });
    } catch (err) {
        res.status(404).render('404', {title: 'Blog not found'})
    }
    }

module.exports = {
    blog_index,
    blog_details,
    blog_create_get,
    blog_create_post,
    blog_delete,
    user_blogs,
    blog_update_get,
    blog_update_post
}