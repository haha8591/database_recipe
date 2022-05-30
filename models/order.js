const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    order_id :{
        type: String,required : true,unique:true
    },
    sum :{
        type:Number,
        required : true,
    },
    account :{
        type :String,
        required : true,
    },
    product: [{
        cake: String,
        price: Number }],
    date:{
        type:Date,required:true,default :Date.now,
    },
    status:{
        type:Boolean,required : true,default : false
    },
    payment:{
        type : String ,required : true
    },
    remarks:{
        type:String
    }
});
module.exports = mongoose.model('order',userSchema);