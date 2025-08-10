import mongoose from "mongoose";

const user = new mongoose.Schema({
    _id:{type:String,required:true},
    name:{type:String,required:true},
    email:{type:String,required:true},
    image:{type:String,required:true}
})

export default user;