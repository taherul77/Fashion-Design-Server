const express= require('express');
const app =express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const port = process.env.PORT || 5000;

//middleware

app.use(cors());
app.use(express.json());


const verifyJWT = (req,res,next) =>{
  const authorization = req.headers.authorization;
  
  if(!authorization){
    return res.status(401).send({error: true , message: 'unauthorized access'});
    
  } 
  const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN,(err,decoded)=>{
      if(err){
        return res.status(401).send({error: true, message: 'unauthorized access'})
      }
      req.decoded =decoded;
      next();
    })
  
  }



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iroozgm.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


const courseCollection = client.db('summerCamp').collection('course');

const cartCollection = client.db("summerCamp").collection("cart");
const userCollection = client.db("summerCamp").collection("user");

app.post('/jwt',(req,res)=>{
  user = req.body;
  const token = jwt.sign(user,process.env.ACCESS_TOKEN,{expiresIn: '5h'});
  res.send({token});
})


app.post('/users',async(req,res)=>{
  const user = req.body;
  const email = user.email;
  const query = {email};
  const existingUser = await userCollection.findOne(query);
  if (existingUser) {
   return res.send( {message: ''});
  }
  
 
  const result = await userCollection.insertOne(user);
  res.send(result);


})

app.get('/users',  async(req,res)=>{
  const result = await userCollection.find().toArray();
  res.send(result);
  
  })


  app.patch('/users/admin/:id',async(req,res)=>{
    const id= req.params.id;
    const filter = {_id: new ObjectId(id)}
    const updateDoc ={
      $set: {
        role: 'admin' 
      },
      
    };
    const result = await userCollection.updateOne(filter,updateDoc);
      res.send(result);
  })
  app.patch('/users/instructor/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        role: 'instructor'
      },
    };
    const result = await userCollection.updateOne(filter, updateDoc);
    res.send(result);
  });
  











  app.get('/users/admin/:email',async(req,res)=>{

    const email= req.params.email;
    
    const query = {email:email}
    const user = await userCollection.findOne(query);
    const result = { admin : user?.role === 'admin'}
    res.send(result);
  })
  app.delete('/users/delete/:id', async (req,res)=>{
    const id =req.params.id;
    console.log(id);
    const query = {_id: new ObjectId(id)};
    const result = await userCollection.deleteOne(query);
    res.send(result)
    
    })


app.get('/course', async(req,res)=>{
    const data = courseCollection.find();
    const result = await data.toArray();
    res.send(result);
  
  })

  app.get('/courses',  async(req,res)=>{
    const {email} = req.query;
    console.log(email);

 
  
    const query = {'instructor.email' : email};
    const result = await courseCollection.find(query).toArray();

    res.send(result)
   

  })

  app.post('/course-cart', async(req,res)=>{

    const item = req.body;
    console.log(item);
    const result = await cartCollection.insertOne(item);
    res.send(result);
  })
  app.get('/course-cart', verifyJWT, async(req, res)=>{

    const email = req.query.email;
   
    if(!email){
      res.send([]);
    }
   
    const decodedEmail = req.decoded.email;
    if(email !== decodedEmail){
      return req.status(403).send({error: true, message: 'forbidden access'})
    }
    
    const query = { email : email};
    const result = await cartCollection.find(query).toArray();
    res.send(result);
    
    })
    app.delete('/course/delete/:id', async (req,res)=>{
      const id =req.params.id;
      console.log(id);
      const query = {_id: new ObjectId(id)};
      const result = await cartCollection.deleteOne(query);
      res.send(result)
      
      })









    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})