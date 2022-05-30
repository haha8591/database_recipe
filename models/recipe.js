const { Int32 } = require('bson');
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    price:{
        type : Number ,required:true
    },
    star:{
        type:Number,required:true
    },
    discription: {
        type:String,required:true
    },
    cake_name:{
        type:String,required:true
    },
    image :{
        type:String,required:true
    },
    count:{
        type: Number,required:true,default :0
    },
    category:{
        type : String
    },
    website:{
        type :String
    }
});
module.exports = mongoose.model('recipe',userSchema);