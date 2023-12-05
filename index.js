const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 6900;

//middleware
app.use(cors());
app.use(express.json());

//mongodb


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hjmkubl.mongodb.net/?retryWrites=true&w=majority`;


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
         
        const productCollections = client.db('EliteAutos').collection('products');
        const brandCollection = client.db('EliteAutos').collection('brands');

        //get all brands
        app.get('/brands', async(req, res) => {
            const cursor = brandCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        
        // get all products
        app.get('/products', async(req, res) => {
            const cursor = productCollections.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        //create a product
        app.post('/products', async(req, res) =>{
            const newProduct = req.body;
            const result = await productCollections.insertOne(newProduct);
            res.send(result);
        })
        app.post('/brands', async(req, res) => {
            const brand = req.body;
            const result = await brandCollection.insertOne(brand);
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
    res.send('Elite Autos Server Is Running')
});

app.listen(port, () => {
    console.log(`Elite Autos Server Is Running On Port ${port}`)
})
