const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    cake :{
        type:String,
    },

    word :[{
        date:{
            type:Date,default :Date.now,
        },
        comment_name : {
            type: String,
            
        },
        comment_email : {
            type: String,
            
        },
        comment: {
            type : String,
           
        }
    }]
});
module.exports = mongoose.model('comment',userSchema);