const jwt = require("jsonwebtoken")
const authorModel = require('../models/authorModel')
const blogModel = require('../models/blogModel')
const mongoose = require("mongoose")
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

//<<-------------------------------------------------AUTHENTICATION------------------------------------------------------------>>
const authentication = function (req, res, next) {
    try {
        const token = req.headers["X-Auth-Token"] || req.headers["x-auth-token"]
        if (!token) {
            return res.status(401).send({ status: false, msg: "Token missing" })
        }
        const decodedtoken = jwt.verify(token, "##k&&k@@s")
        
        // if (!decodedtoken) {

        //     return res.status(401).send({ status: false, msg: "Token invalid" })
        // }
     

        req["x-api-key"] = decodedtoken
       
        next()


    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}

//<<-----------------------------------------------AUTHORIZATION----------------------------------------------->>
const authrization = async function (req, res, next) {
    try {
        const blogId = req.params.blogId
        if (!isValidObjectId(blogId)) {
            return res.status(400).send({ status: false, msg: "blogId is not valid that is not in proper format" })
        }
        const validBlog = await blogModel.findById({_id:blogId,isDeleted:false})
        if (!validBlog)
            return res.status(404).send({ status: false, msg: "blog with thid blogid not found " })
        
            // comapre the logged in author's id and the author id for requested blog
        let ownerOfBlog = validBlog.authorId;
        
        //userId for the logged-in user
        let authorId = req["x-api-key"].authorid
       
        //userId comparision to check if the logged-in user is requesting for their own data
        if (ownerOfBlog != authorId)
            return res.status(403).send({ status: false, msg: 'Author logged in is not allowed to modify the requested blog data' })
        
        next()
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}


//<<-------------------------------------------AUTHORIZATION FOR DELETE BLOG--------------------------------------->>
const authorizationdeleteblog = async function (req, res,next) {
    try {
        let check = req.query
       if (Object.keys(check).length == 0) {
            res.status(400).send({ status: false, msg: "no data recieved in request" })
        }
        const authorId = req["x-api-key"].authorid
        let flag = 0
        check.isDeleted=false
        const data = await blogModel.find(check)
        if(data.length==0){
            return res.status(404).send({status:false,message:"No such documents exists"})
        }
      for (let i = 0; i < data.length; i++) {
             if (authorId == data[i].authorId) {
                flag = 1
                break;
            }
        }
        if (flag == 1) {
            req.authorId=authorId
            next()
        }
        else {
            return res.status(403).send({ status: false, msg: 'Author logged in is not allowed to modify the requested blog data' })
        }

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}

module.exports.authentication = authentication
module.exports.authrization = authrization
module.exports.authorizationdeleteblog=authorizationdeleteblog