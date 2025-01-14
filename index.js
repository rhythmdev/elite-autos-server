const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 6900;

//middleware
const corsConfig = {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}
app.use(cors(corsConfig))
app.options("", cors(corsConfig))

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
        // await client.connect();

        const productCollections = client.db('EliteAutos').collection('products');
        const brandCollection = client.db('EliteAutos').collection('brands');
        const cartCollection = client.db('EliteAutos').collection('cart');

        //get all brands
        app.get('/brands', async (req, res) => {
            const cursor = brandCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // get all products
        app.get('/products', async (req, res) => {
            const cursor = productCollections.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        // get product by id
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productCollections.findOne(query);
            res.send(result);
        })
        // get cart item by email
        app.get('/myCart/:userEmail', async (req, res) => {
            const userEmail = req.params.userEmail;
            const cursor = cartCollection.find({ userEmail });
            const result = await cursor.toArray();
            res.send(result);
        })


        //create a product
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollections.insertOne(newProduct);
            res.send(result);
        })
        // for brands
        app.post('/brands', async (req, res) => {
            const brand = req.body;
            const result = await brandCollection.insertOne(brand);
            res.send(result)
        })
        //for add to cart
        app.post('/myCart', async (req, res) => {
            const cartData = req.body;
            const result = await cartCollection.insertOne(cartData);
            res.send(result);
        })

        //update specific product
        app.put('/updateProduct/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedProduct = req.body;
            const product = {
                $set: {
                    product_name: updatedProduct.product_name,
                    brand_name: updatedProduct.brand_name,
                    price: updatedProduct.price,
                    category: updatedProduct.category,
                    image: updatedProduct.image,
                    rating: updatedProduct.rating,
                    description: updatedProduct.description
                }
            }
            const result = await productCollections.updateOne(filter, product, options);
            res.send(result)
        })
        // delete item
        app.delete('/myCart/remove', async (req, res) => {
            const userEmail = req.query.userEmail;
            const productId = req.query.productId;
            const productObjectId = new ObjectId(productId);
            const result = await cartCollection.deleteOne({ userEmail, _id: productObjectId });
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
    res.send('Elite Autos Server Is Running')
});

app.listen(port, () => {
    console.log(`Elite Autos Server Is Running On Port ${port}`)
})
