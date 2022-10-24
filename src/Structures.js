// Require Mongoose
const mongoose = require("mongoose");

// Define a schema
const Schema = mongoose.Schema;



const user = new Schema({
  name: {type:String,required:true,unique: true },
  ref_Id:{type:String,required:true},
  wallet_Address: {type:String,required:true,unique: true},
  pin:{type:Number,required:true},
  off_chain_balance:{type:Number,required:true},
  pending_balance:{type:Number,required:true},
  device_Id:{type:String,required:true,unique: true },
  total_power:{type:Number,required:true},
   update_Time:{type:Number,required:true},
  total_Time:{type:Number,required:true}
});



export const User = mongoose.model("User", user);