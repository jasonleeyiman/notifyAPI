var express = require('express');
var router = express.Router();
const { connectToDB, ObjectId } = require('../utils/db');
router.post('/information', async function(req,res){
  const db=await connectToDB();
  try{
    let result=await db.collection("Tasks").insertOne(req.body);
    res.status(201).json({id: result.insertedId});
  }catch(err){
    res.status(400).json({message:err.message});
  }finally{
    await db.client.close();
  }
});
router.get('/task/info',async function(req,res){
  const db=await connectToDB();
  try{
    let result=await db.collection("Tasks").find({}).toArray();
    if(result){
      res.status(200).json(result);
    }else{
      res.status(404).json({message:"No task found"});
    }
  }catch(err){
    res.status(400).json({message:err.message});
  }finally{
    await db.client.close();
  }
});
router.put('/task/:id',async function(req,res){
  const db=await connectToDB();
  try{
    let result=await db.collection("Tasks").updateOne({_id: new ObjectId(req.params.id)}, {$set: req.body});
    if(result.modifiedCount>0){
      res.status(200).json({message:"Task updated"});
    }else{
      res.status(404).json({message:"No task found"});
    }
  }catch(err){
    res.status(400).json({message:err.message});
  }finally{
    await db.client.close();
  }
});
router.delete('/task/delete/:id',async function(req,res){
  const db=await connectToDB();
  try{
    let result=await db.collection("Tasks").deleteOne({_id: new ObjectId(req.params.id)});
    if(result.deletedCount>0){
      res.status(200).json({message:"Task deleted"});
    }else{
      res.status(404).json({message:"No task found"});
    }
  }catch(err){
    res.status(400).json({message:err.message});
  }finally{
    await db.client.close();
  }
});
router.get('/task/search/:keyword',async function(req,res){
  const db=await connectToDB();
  try{
    let result=await db.collection("Tasks").find({task:{$regex:req.params.keyword,$options: 'i'}}).toArray();
    if(result.length==0){
      res.status(404).json({message:"No task found"});
    }else{
      res.status(200).json(result);
    }
  }catch(err){
    res.status(400).json({message:err.message});
  }finally{
    await db.client.close();
  }
});
router.post('/insert/keywords', async function(req,res){
  const db=await connectToDB();
  try{
    let result=await db.collection("Keywords").insertOne(req.body);
    res.status(201).json({id: result.insertedId});
  }catch(err){
    res.status(400).json({message:err.message});
  }finally{
    await db.client.close();
  }
});
router.get('/keywords', async function(req,res){
  const db=await connectToDB();
  try{
    let result=await db.collection("Keywords").find({}).toArray();
    if(result){
      res.status(200).json(result);
    }else{
      res.status(404).json({message:"No keywords found"});
    }
  }catch(err){
    res.status(400).json({message: err.message});
  }finally{
    await db.client.close();
  }
});
router.put('/update/keywords/:id',async function(req,res){
  const db=await connectToDB();
  try{
    let result=await db.collection("Keywords").updateOne({_id: new ObjectId(req.params.id)}, {$set: req.body});
    if(result.modifiedCount>0){
      res.status(200).json({message:"Task updated"});
    }else{
      res.status(404).json({message:"No task found"});
    }
  }catch(err){
    res.status(400).json({message:err.message});
  }finally{
    await db.client.close();
  }
});
router.delete('/delete/keywords/:id',async function(req,res){
  const db=await connectToDB();
  try{
    let result=await db.collection("Keywords").deleteOne({_id: new ObjectId(req.params.id)});
    if(result.deletedCount>0){
      res.status(200).json({message:"Task deleted"});
    }else{
      res.status(404).json({message:"No task found"});
    }
  }catch(err){
    res.status(400).json({message:err.message});
  }finally{
    await db.client.close();
  }
});
// 用於做SMS訊息插入的API，是在軟件第一次被打開的時候或者是卸載之後再次下載的時候插入SMS訊息
router.post('/insert/multiple/sms', async function(req,res){
  const db=await connectToDB();
  try{
    const smsList=req.body;
    const smsIDs=smsList.map(sms => sms.smsID);
    const existingSms= await db.collection("SMS").find({ smsID: { $in: smsIDs }}).toArray();
    const existingSmsIDs = new Set(existingSms.map(sms => sms.smsID));
    const newSmsList = smsList.filter(sms => !existingSmsIDs.has(sms.smsID));
    if(newSmsList.length>0){
      const result=await db.collection("SMS").insertMany(newSmsList);
      res.status(201).json({message: "Successful", data: result});
    }else{
      res.status(200).json({message: "Successful but no message"});
    }
  }catch(err){
    res.status(400).json({message: err.message});
  }
});
module.exports = router;