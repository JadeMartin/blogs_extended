const express = require('express');
const blogController = require('../controllers/blogController');
const router = express.Router();
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', blogController.blog_index);

router.post('/', requireAuth, blogController.blog_create_post);

router.get('/create', requireAuth, blogController.blog_create_get);

router.get('/user', requireAuth, blogController.user_blogs);

router.get('/:id', blogController.blog_details);

router.delete('/', requireAuth, blogController.blog_delete);

router.get('/update/:id', blogController.blog_update_get);

router.post('/update', requireAuth, blogController.blog_update_post);


module.exports = router;