const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name:{
        type : String,
        required:true
    },
    vip:{
        type : Boolean ,required:true
    },
    age:{
        type:String,required:true
    },
    contact_obj: [{
        mobile: String,
        telephone: String,
        email : String }],
    gender:{
        type:String,required:true
    },
    account:{
        type:String,required:true
    },
    pass:{
        type:String,required:true
    }
});
module.exports = mongoose.model('customer',userSchema);