const express = require('express');
const router = express.Router();
const authorController=require("../controllers/authorController")
const blogController=require("../controllers/blogController")
const mw=require("../middlewares/auth")

//----------------------------------------------API USED IN THE PROJECT---------------------------------------------------

//----------------------------------------------CREATE AUTHOR API----------------------------------------------------
router.post('/authors',authorController.createAuthor)

//----------------------------------------------CREATE BLOG API-----------------------------------------------------
router.post('/blogs',mw.authentication,blogController.createBlog)

//----------------------------------------------GET BLOG API-------------------------------------------------------
router.get('/blogs/:blogId',mw.authentication,blogController.getBlog)

//--------------------------------------------UPDATE BLOG API-------------------------------------------------------
router.put('/blogs/:blogId',mw.authentication,mw.authrization,blogController.updateBlog)

//--------------------------------------------DELETE BLOG API-------------------------------------------------------
router.delete('/blogs/:blogId',mw.authentication,mw.authrization,blogController.deleteById)
router.delete('/blogs',mw.authentication,mw.authorizationdeleteblog,blogController.deleteBlog)

//---------------------------------------------AUTHOR LOGIN API------------------------------------------------------
router.post('/login',authorController.authorLogin)
module.exports = router;