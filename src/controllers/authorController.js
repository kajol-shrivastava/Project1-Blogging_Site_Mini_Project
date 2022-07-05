const jwt = require("jsonwebtoken")
const authorModel = require('../models/authorModel')
const {validName,
verifyPassword,
checkSpaces,
isValid,
isValidRequestBody,
isValidTitle}=require("../validator/validator")


//<<-------------------------------------------CREATE AUTHOR---------------------------------------------------->>
const createAuthor = async function (req, res) {
    try {
              
        const requestBody = req.body
        if (!isValidRequestBody(requestBody)) 
       return res.status(400).send({ status: false, message: "Invalid request paramter , Please provide Author details" })


       //extract parameters
       const {fname,lname,title,email,password}=requestBody //object destructing
        
       //validation starts
        if (!isValid(fname)) {
            return res.status(400).send({ status: false, message: "First name  is required" })
        }

     

        if (validName(fname)) {
            return res.status(400).send({ status: false, message: "First name should be valid " })

        }

        
        if (!isValid(lname)) {
            return res.status(400).send({ status: false, message: "Last name  is required" })
        }

      
        
        if (validName(lname)) {
            return res.status(400).send({ status: false, message: "Last name should be valid " })

        }
     

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "Title is required" })
        }

         

        if (!isValidTitle(title)) {
            return res.status(400).send({ status: false, message: "Title  should be among Mr ,Mrs, Miss " })
        }

        

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Email is required" })
        }

        

        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: "Email should be a valid email address" })

        }

       

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "Password is required" })
        }

      

        const result = verifyPassword(password)
        if (result != true) {
            return res.status(400).send({ status: false, message: result })
        }

        const isEmailAlreadyUsed=await authorModel.findOne({email:email,isDeleted:false})
        if(isEmailAlreadyUsed){
            return res.status(400).send({ status: false, message: `${email} Email address already registered`})
        }
        //validation Ends

        //<<-------creating Author --------->>
        const authorData={fname,lname,title,email,password}
        const newAuthor = await authorModel.create(authorData)
        res.status(201).send({ status: true, data: newAuthor })
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}


//---------------------------------------------AUTHORLOGIN---------------------------------------------------------------

const authorLogin = async function (req, res) {
    try {
     
        const requestBody = req.body
        if (!isValidRequestBody(requestBody)) 
       return res.status(400).send({ status: false, message: "Invalid request paramter , Please provide login details" }) 
      
        //Extract params 
       const {email,password} = requestBody

       //Validation starts
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Email is required" })
        }
        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
            return res.status(400).send({ status: false, message: "Email should be a valid email address" })
        }

         if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "Password is required" })
        }
        
        const result = verifyPassword(password)
        if (result != true) {
            return res.status(400).send({ status: false, msg: result })
        }
        const author = await authorModel.findOne({ email: email, password: password ,isDeleted:false})
        if (!author) {
            return res.status(401).send({ status: false, msg: "Invalid Login Credentials" })
        }

         //<<-------generating token --------->>
        const token = jwt.sign({ 
            authorid: author._id
           
        }, "##k&&k@@s")
        res.header('x-api-key',token)
        res.status(200).send({ status: true, message:"Author Login sucessfull",data: token })

    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}


module.exports.createAuthor = createAuthor
module.exports.authorLogin = authorLogin