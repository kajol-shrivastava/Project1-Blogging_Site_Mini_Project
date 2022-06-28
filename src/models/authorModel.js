const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
       fname: {
              type: String,
              trim: true,
              required: "first name is required"
       },
       lname: {
              type: String,
              trim: true,
              required: "last name is required"
       },
       title: {
              type: String,
              enum: ['Mr', 'Mrs', 'Miss'],
              required:"title is required"
       },
       email: {
              type: String,
              trim: true,
              required:"email is required" ,
              unique: true,
              validata:{
                     validator :function(email){
                     return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
              },message:"please fill the valid email address" ,isAsync:false
              }
       },
       password: {
              type: String,
              trim: true,
              required:"password is required" 
       },


}, { timestamps: true });


module.exports = mongoose.model('Author', authorSchema) 
