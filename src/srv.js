const express = require("express");
const bodyParser = require("body-parser");
const appVersion = "1.0";
const mongoose = require("mongoose");
import { User } from "./Structures";

//-----------Express----------
//-----------Express----------
//-----------Express----------
{
  const envport = 3000;
  var app = express();
  app
    .listen(envport, function () {
      console.log(`The SERVER HAS STARTED ON PORT: ${envport}`);
    })

    .on("error", function (err) {
      console.log(err);
      process.once("SIGUSR2", function () {
        process.kill(process.pid, "SIGUSR2");
      });
      process.on("SIGINT", function () {
        // this is only called on ctrl+c, not restart
        process.kill(process.pid, "SIGINT");
      });
    });
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(bodyParser.raw());
  //-----------Express----------

  app.get("/", function (req, res) {
    res.send("Hello World");
  });







  app.post("/registration", async (req, res) => {
    if (
      req.body.name.length > 3 &&
      req.body.name.length <= 12 &&
      req.body.pin.toString().length == 6 &&
      req.body.pin == req.body.rpin &&
      req.body.device_Id.length > 10 &&
      req.body.wallet_Address.length >= 10
    ) {
      const NewUser = new User({
        name: req.body.name,
        wallet_Address: req.body.wallet_Address,
        pin: req.body.pin,
        off_chain_balance: 0,
        device_Id: req.body.device_Id,
        pending_balance: 0,
        total_power: 0,
        total_Time: 0,
        update_Time: 0,
        ref_Id:req.body.ref_Id,
      });


      
      let exits = await NewUser.collection.countDocuments({
        device_Id: req.body.device_Id,
      });


      let refExits = await NewUser.collection.countDocuments({
        device_Id: req.body.ref_Id,
      });
      
      if (exits == 0 && refExits == 1) {
      try {
        let result = await NewUser.save();
       
       res.status(200).send({ status: "User registered" });

      } catch (error) {
        if(error.code == 11000)
        {
          res.status(400).send({ status: "Already exits ",value: error.keyValue }); 
        }else{
          res.status(400).send({status:"Unexpected reason"});
        }
      }
      
      
       



      } else {
        if(exits != 0)
        {
        res.status(400).send({ status: "already registered with this Id" });
        return
        }
        if(refExits == 0)
        {
        res.status(400).send({ status: "Reference not exits" });
        return
        }
      }
    } else {
      res.sendStatus(400);
    }
  });
}



app.post('/login',async (req,res)=>{

  const ipAddresses = req.header('x-forwarded-for');
  console.log(req.socket.remoteAddress);
  res.send(ipAddresses);
 
 
})







app.post("/assignpower", async (req, res) => {
  const NewUser = new User();
  let p = await NewUser.collection.findOne({ name: req.body.name });
  console.log(p);
  let refReward = 0;
  if (p.pending_balance > 0) {
    const elapsedseconds = (Date.now() - p.update_Time) / 1000;
    console.log(elapsedseconds);
    if (elapsedseconds >= p.total_Time) {
      p.total_Time = 0;

      refReward = (p.pending_balance/100)*2.5;
      p.pending_balance -= refReward;
      p.off_chain_balance += p.pending_balance;
      p.pending_balance = 0;
      //give maximum...
    } else {
      let eachunit = p.pending_balance / p.total_Time;
      let reward = eachunit * elapsedseconds;
      p.pending_balance -= reward;
      refReward = (reward/100)*2.5;
      reward -= refReward;
 
      p.off_chain_balance += reward;
     
      p.total_Time -= elapsedseconds;
    }
  }


  console.log('xxxx');
if(refReward != 0)
{
  try {
    let rp = await NewUser.collection.findOne({device_Id: p.ref_Id});
    rp.off_chain_balance += refReward;
    let tempUser = await NewUser.collection.findOneAndUpdate({ device_Id: p.ref_Id },{
      $set: {
        off_chain_balance: rp.off_chain_balance,}});
  } catch (error) {
    console.log(error);
  }
}





  p.pending_balance += req.body.rewardAmount;
  p.total_Time += req.body.total_Time;
  if (p.pending_balance != 0) {
    p.total_power = (p.total_Time / p.pending_balance) * 100;
  } else {
    p.total_power = 0;
  }


  p.update_Time = Date.now();
  NewUser.collection.findOneAndUpdate(
    { name: req.body.name },
    {
      $set: {
        total_power: p.total_power,
        pending_balance: p.pending_balance,
        total_Time: p.total_Time,
        update_Time: p.update_Time,
        off_chain_balance: p.off_chain_balance

      },
    }
  );
});

//-----------Express----------
//-----------Express----------
//-----------Express----------

//------------------DB-----------------------------
//------------------DB-----------------------------
//------------------DB-----------------------------

{
  //-----------MongoDB----------
  const mongoDB = "mongodb://localhost:27017/MicroMachine";
  mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
  //-----------MongoDB----------

  // async function AddNewUser(userData) {
  // //   const   up = new power()
  //     const NewUser = new User({ name: 'Xobi', wallet_Address:'0x01', pin: 2081 ,off_chain_balance:100,device_Id:'abcd', });
  //     NewUser.save().then(() => {
  //       console.log('New User Added');
  //       return true;
  //     });
  //   }

  async function updateDocument(args) {
    let col = db.collection(args.collectionName);
    console.log(col.name);
    return await col.findOneAndUpdate(
      { _id: x },
      { $set: { transactionHash: args.transactionHash } }
    );
  }
}

//------------------DB-----------------------------
//------------------DB-----------------------------
//------------------DB-----------------------------




process.on('uncaughtException', function (err) {
  console.error(err);
  console.log("...");
});

process.on('TypeError', function (err) {
  console.error(err);
  console.log("...");
});
