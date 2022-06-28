const authorModel = require('../models/authorModel')
const blogModel = require('../models/blogModel')
const mongoose = require("mongoose")
const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}
const verifyPassword = require("../controllers/authorController")
const checkSpaces = require("../controllers/authorController")

const isValid=function(value){
    if (typeof value==='undefined' || value=== null)return false
    if(typeof value==='string'&&value.trim().length===0)return false
    return true;
}

const isValidRequestBody=function(requestBody){
    return Object.keys(requestBody).length>0
}


const checkarray = function (arr) {
    let msg = 0
    let flag = 0
    if (arr.length == 0) {
        let msg1 = " array must contain must contain some value"
        return msg1
    }

    arr.forEach(element => {
        if (element.trim().length == 0)
            flag = 1
    });

    if (flag == 1) {
        msg = "array element must contain characters other than spaces"
        return msg
    }

    return true

}

//--------------------------------------------CREATEBLOG-------------------------------------------------------------
const createBlog = async function (req, res) {
    try {
        //<<----------Validation--------->>  
        const data = req.body
        if (!isValidRequestBody(data))
            return res.status(400).send({ status: false, msg: "Invalid request paramter , Please provide blog details" })


        //Extracting parms
        const { title, body, authorId, tags, category, subcategory ,isPublished} = data
        if (!isValid(title)) {
            return res.status(400).send({ status: false, msg: "Title not recieved it is required" })
        }

      
      

        if (!isValid(body)) {
            return res.status(400).send({ status: false, msg: "body not recieved it is required" })
        }

       

        if (!isValid(authorId)) {
            return res.status(400).send({ status: false, msg: "authorId not recieved it is required" })
        }

         if (!isValidObjectId(authorId)) {
            return res.status(400).send({ status: false, msg: "AuthorId is not valid" })
        }
        const validId = await authorModel.findById(data.authorId)
        if (!validId)
            return res.status(404).send({ status: false, msg: "No Author with this id exist" })

        if (!isValid(category)) {
            return res.status(400).send({ status: false, msg: "category not recieved it is required" })
        }

         if (tags) {

            if (typeof (tags) == 'string') {
                message = checkSpaces.checkSpaces(tags)

                if (message != true) {
                    return res.status(400).send({ status: false, message: "tags " + message })
                }

            }
            else {

                message = checkarray(tags)
                if (message != true) {
                    return res.status(400).send({ status: false, message: "tags " + message })
                }
            }
        }

        if (subcategory) {
            if (typeof (subcategory) == 'string') {
                message = checkSpaces.checkSpaces(subcategory)
                if (message != true) {
                    return res.status(400).send({ status: false, message: "subcategory " + message })
                }

            }
            else {
                message = checkarray(subcategory)
                if (message != true) {
                    return res.status(400).send({ status: false, message: "subcategory  " + message })
                }
            }
        }

        const author={title, body, authorId, tags, category, subcategory}
        if(isPublished=='true'){
            author.isPublished=isPublished
            author.publishedAt=Date.now('YYYY/MM/DD:mm:ss')
        }
        
         //<<-------creating Blog--------->>
        const savedData = await blogModel.create(author)
        res.status(201).send({ status: true, data: savedData })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}

//----------------------------------------------GETBLOG--------------------------------------------------------------

const getBlog = async function (req, res) {
    try {
        const check = req.query
        const filter = {}
        filter.isDeleted = false
        filter.isPublished = true
        const { authorId, category, tags, subcategory } = check

        if (isValid(authorId)) {
            if (!isValidObjectId(authorId)) {
                return res.status(400).send({ status: false, msg: "not valid authorId" })
            }
            if (await authorModel.findById(authorId))
                filter.authorId = authorId
            else
                res.status(404).send({ status: false, msg: "author of this id not found" })
        }
        if (isValid(category)) {
            filter.category = category.trim()
        }
        if (isValid(tags)) {
            filter.tags = tags
        }
        if (isValid(subcategory)) {
            filter.subcategory = subcategory
        }

         //<<-------Finding Blog--------->>
        const savedData = await blogModel.find(filter).populate("authorId")
        if (savedData.length == 0) {
            return res.status(404).send({ status: false, msg: "no record found" })
        }
        return res.status(200).send({ status: true, data: savedData })

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}


// //---------------------------------------------Update Blog---------------------------------------------------------------

// const authorLogin = async function (req, res) {
//     try {
//         //<<----------Validation--------->>  
//         const check = req.body
//         if (Object.keys(check).length == 0) {
//             return res.status(400).send({ status: false, msg: "no credentials recieved in request" })
//         }
//         const email = req.body.email
//         if (!email) {
//             return res.status(401).send({ status: false, msg: "no email recieved in request" })
//         }
//         if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
//             return res.status(401).send({ status: false, message: "Email should be a valid email address" })
//         }

//         const password = req.body.password
//         let message = checkSpaces.checkSpaces(password)
//         if (message != true) {
//             return res.status(400).send({ status: false, message: "password  " + message })
//         }
//         const result = verifyPassword.verifyPassword(password)
//         if (result != true) {
//             return res.status(401).send({ status: false, msg: result })
//         }
//         const getData = await authorModel.findOne({ email: email, password: password })
//         if (!getData) {
//             return res.status(401).send({ status: false, msg: "Incorrect email or password" })
//         }

//          //<<-------generating token --------->>
//         const token = jwt.sign({ id: getData._id }, "##k&&k@@s")
//         res.status(200).send({ status: true, data: token })

//     }
//     catch (err) {
//         res.status(500).send({ status: false, error: err.message })
//     }
// }

//--------------------------------------------UPDATE BLOG-----------------------------------------------------------
const updateBlog = async function (req, res) {
    try {
       //<<----------Validation--------->>  
        const blogId = req.params.blogId
        
        const data = req.body
        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "no data recieved to update" })
        }

        //Extracting Params
        let { title, body, tags, subcategory,isPublished } = data
        const update = {}

        const blogToBeUpdated=await blogModel.findById(blogId)

        if (isValid(title)) {
           
            update.title = title
        }

        if (isValid(body)) {
            
            update.body = body
        }


        if (tags) {
            let message = checkSpaces.checkSpaces(tags)
            if (message != true) {
                return res.status(400).send({ status: false, message: "tags  " + message })
            }
        }


        if (subcategory) {
            let message = checkSpaces.checkSpaces(subcategory)
            if (message != true) {
                return res.status(400).send({ status: false, message: "subcategory  " + message })
            }
        }

        if(blogToBeUpdated.isPublished!==true){
        update.isPublished = 'true'
        const time = Date.now('YYYY/MM/DD:mm:ss')
        update.publishedAt = time
    }

         //<<-------Updating Blog--------->>
        const updateData = await blogModel.findOneAndUpdate({ _id: blogId,isDeleted:false }, { $push: { subcategory: subcategory, tags: tags }, $set: update }, { new: true })
        
        if (!updateData) {
            return res.status(404).send({ status: false, msg: " Record not updated " })
        }
        res.status(200).send({ status: true, data: updateData })
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, error: err.message })
    }
}

//-------------------------------------------DELETE-BY-ID-----------------------------------------------------------

const deleteById = async function (req, res) {
    try {
        const blogId = req.params.blogId

        const validId = await blogModel.findById(blogId)

        if (validId.isDeleted === 'true')
            return res.status(404).send({ status: false, msg: "already deleted" })

        
        const time = Date.now('YYYY/MM/DD:mm:ss')
        const update = { isDeleted: true, deletedAt: time }

         //<<-------deleting Blog--------->>
        const saveData = await blogModel.findOneAndUpdate({ _id: blogId }, update)
        if(!saveData){
            return res.status(400).send({status:false,msg:" Record not updated "})
        }
        res.status(200).send({ status: true, data: "Deleted Sucessfully" })

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}

//-----------------------------------------------DELETEBLOG-------------------------------------------------

const deleteBlog = async function (req, res) {
    try {
        const check = req.query
        if (Object.keys(check).length == 0) {
            res.status(400).send({ status: false, msg: "no data recieved in request" })
        }
        //extracting params
        const { category, authorId, tags, subcategory, isPublished } = check
        const filter = {}
        filter.authorId = req.authorId
        filter.isDeleted = false
        if (isValid(category)) { 
            filter.category = category }
        
            if (isValid(authorId)) {
            if (!isValidObjectId(authorId)) {
                return res.status(400).send({ status: false, msg: "not valid authorId" })
            }
            if (await authorModel.findById(authorId))
                filter.authorId = authorId
            else
                res.status(404).send({ status: false, msg: "author of this id not found" })
        }
        if (isValid(tags)) {
            filter.tags = tags
        }
        if (isValid(subcategory)) {
            filter.subcategory = subcategory
        }
        if (isPublished) {
            filter.isPublished = isPublished
        }
        const time = Date.now('YYYY/MM/DD:mm:ss')

        const update = { isDeleted: true, deletedAt: time }

        //<<-------deleting Blog--------->>
        const saveData = await blogModel.updateMany(filter, update)
        if (saveData.modifiedCount == 0) {
            return res.status(404).send({ status: false, msg: "resource to be deleted not found " })
        }
        
        res.status(200).send({ status: true, data: "Deleted Sucessfully" })
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, error: err.message })
    }
}




module.exports.createBlog = createBlog
module.exports.deleteById = deleteById
module.exports.deleteBlog = deleteBlog
module.exports.getBlog = getBlog
module.exports.updateBlog = updateBlog
