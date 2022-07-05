const mongoose = require("mongoose")

const isValid=function(value){
    if (typeof value==='undefined' || value=== null)return false
    if(typeof value==='string'&&value.trim().length===0)return false
    return true;
}

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

const isValidRequestBody=function(requestBody){
    return Object.keys(requestBody).length>0
}

const isValidTitle=function(title){
    return ['Mr','Miss','Mrs'].indexOf(title)!=-1
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

const extraspace=function(value){
    const res=value.split(" ").filter(word=>word).join(" ")
    return res
}

const validName = function (name) {
    const ret = !(/^[a-zA-Z ]{2,30}$/.test(name))
    return ret
}

const verifyPassword = function (password) {
  
    //check empty password field  
    let msg
    if (password == "") {
        
        msg = "Fill the password please!"
        return msg;
    }

    //minimum password length validation  
    if (password.length < 5) {
        
        msg = "Password length must be atleast 5 characters"
        return msg;
    }

    //maximum length of password validation  
    if (password.length > 15) {
        
        msg = "Password length must not exceed 15 characters"
        return msg;
    } else {
        return true;
    }
}

const checkSpaces=function(temp){
    let check=temp.trim()
     let len =check.length
     if(len==0){
         let msg="must contain characters other than spaces"
         return msg
     }
     return true
}

module.exports={validName,
    verifyPassword,checkSpaces,checkarray,extraspace,isValid,isValidRequestBody,isValidTitle,isValidObjectId}