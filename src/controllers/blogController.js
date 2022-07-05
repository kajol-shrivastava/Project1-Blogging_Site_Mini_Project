const authorModel = require('../models/authorModel')
const blogModel = require('../models/blogModel')

const {isValid,
isValidRequestBody,
checkSpaces,
checkarray,
verifyPassword,
extraspace,
isValidObjectId } =require("../validator/validator")

//--------------------------------------------CREATEBLOG-------------------------------------------------------------
const createBlog = async function (req, res) {
    try {
        //<<----------Validation--------->>  
        const data = req.body
        if (!isValidRequestBody(data))
            return res.status(400).send({ status: false, msg: "Invalid request paramter , Please provide blog details" })


        //Extracting parms
        let { title, body, authorId, tags, category, subcategory ,isPublished} = data

        //validating title
        if (!isValid(title)) {
            return res.status(400).send({ status: false, msg: "Title not recieved it is required" })
        }

      //validating body
      if (!isValid(body)) {
            return res.status(400).send({ status: false, msg: "body not recieved it is required" })
        }

        body=extraspace(body)//removing extra spaces if there is any

       
        //validation authorId
        if (!isValid(authorId)) {
            return res.status(400).send({ status: false, msg: "authorId not recieved it is required" })
        }

         if (!isValidObjectId(authorId)) {
            return res.status(400).send({ status: false, msg: "AuthorId is not valid" })
        }
        const validId = await authorModel.findById(data.authorId)
        if (!validId)
            return res.status(404).send({ status: false, msg: "No Author with this id exist" })

        //validating category
        if (!isValid(category)) {
            return res.status(400).send({ status: false, msg: "category not recieved it is required" })
        }

        //validating tags
        if (tags) {

            if (typeof (tags) == 'string') {
                message = checkSpaces(tags)

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

        //validating subcategory

        if (subcategory) {
            if (typeof (subcategory) == 'string') {
                message = checkSpaces(subcategory)
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

        //checking for isPublished status
        if(isPublished=='true'||isPublished==true){
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

        //extracting params
        const { authorId, category, tags, subcategory } = check

        //validating authorId
        if (isValid(authorId)) {
            if (!isValidObjectId(authorId)) {
                return res.status(400).send({ status: false, msg: "not valid authorId" })
            }
            if (await authorModel.findById(authorId))
                filter.authorId = authorId
            else
                res.status(404).send({ status: false, msg: "author of this id not found" })
        }

        //validating category
        if (isValid(category)) {
            filter.category = category.trim()
        }

        //validating tags
        if (isValid(tags)) {
            filter.tags = tags
        }

        //validating subcategory
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

        //validating title
        if (isValid(title)) {
           
            update.title = title
        }

        //validating body
        if (isValid(body)) {
            body=extraspace(body)
            update.body = body
        }


        //validating tags
        if (tags) {
            let message = checkSpaces(tags)
            if (message != true) {
                return res.status(400).send({ status: false, message: "tags  " + message })
            }
        }


        //validating subcategory
        if (subcategory) {
            let message = checkSpaces(subcategory)
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

        //checking if the blog is already deleted 
        if (validId.isDeleted === true)
            return res.status(404).send({ status: false, msg: "already deleted" })

        //setting isDeleted and deletedAt
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

        //validating filters

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
