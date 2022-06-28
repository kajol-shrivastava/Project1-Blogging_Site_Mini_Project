const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: "title is required",
        trim: true
    },
    body: {
        type: String,
        trim: true,
        required: "body is required"
    },
    authorId: {
        type: ObjectId,
        required: "Blog Author is required",
        ref: 'Author'
    },
    tags: [{
        type: String,
        trim: true
        
    }],
    category: {
        type: String,
        trim: true,
        required: "category is required "    
    },
    subcategory: [{
        type: String,
        trim: true      
    }],
    deletedAt: {
        type: Date ,
        default:null         
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date ,
        default:null          
    },
    isPublished: {
        type: Boolean,
        default: false
    },

}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema)



