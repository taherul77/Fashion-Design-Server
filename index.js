const express= require('express');
const app =express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();


const port = process.env.PORT || 5000;

//middleware

app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion } = require('mongodb');
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




app.get('/course', async(req,res)=>{
    const data = courseCollection.find();
    const result = await data.toArray();
    res.send(result);
  
  })

  app.get('/courses', async(req,res)=>{
    const {email} = req.query;
    console.log(email);

  
  
    const query = {'instructor.email' : email};
    const result = await courseCollection.find(query).toArray();

    res.send(result)
    console.log('====================================');
    console.log(result);
    console.log('====================================');

  })

  app.post('/course-cart', async(req,res)=>{

    const item = req.body;
    console.log(item);
    const result = await cartCollection.insertOne(item);
    res.send(result);
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