const express = require("express");
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("hi hello")
});
app.use(cors());
app.use(express.json());

// car-shops-3
// O7z0YJekY6SW6q40

//////////////////////


const uri = "mongodb+srv://car-shops-3:O7z0YJekY6SW6q40@cluster0.s0vwyit.mongodb.net/?retryWrites=true&w=majority";

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
        const productCollection = client.db('carShops').collection('products');
        const usersCollection = client.db('carShops').collection('users');
        const ordersCollection = client.db('carShops').collection('orders');
        const yourProductsCollection = client.db('carShops').collection('yourProducts');

        app.post('/products', async (req, res) => {
            const user = req.body;
            const result = await productCollection.insertOne(user);
            res.send(result);
        })
        app.get('/products', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const users = await cursor.toArray();
            res.send(users)
        });
        app.get('/product', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await productCollection.find(query).toArray();
            res.send(result);
        });
        app.delete('/products/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id : new ObjectId(id)};
            const result = await productCollection.deleteOne(query);
            res.send(result)
        });
        app.get('/products/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id : new ObjectId(id)};
            const result = await productCollection.findOne(query);
            res.send(result)
        });
        

        app.put('/products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const user = req.body;
            const options = { upsert: true };
            const updateduser = {
                $set: {
                    name: user.name,
                    model: user.model,
                    image: user.image,
                    price : user.price,
                    tag: user.tag
                }
            }
            const result = await productCollection.updateOne(filter, updateduser, options);
            
            res.send(result)
        })


        app.post('/orders', async (req, res) => {
            const user = req.body;
            const result = await ordersCollection.insertOne(user);
            res.json(result)
        })
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.send(result)
        })
        // app.get('/order', async(req,res)=>{
        //     const query = {};
        //     const cursor = ordersCollection.find(query);
        //     const users = await cursor.toArray();
        //     res.send(users);
        // });
        app.get('/order', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await ordersCollection.find(query).toArray();
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result)
        });
        // app.get('/users', async(req,res)=>{
        //     const query = {};
        //     const cursor = usersCollection.find(query);
        //     const users = await cursor.toArray();
        //     res.send(users) 
        // })
        app.get('/user', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await usersCollection.find(query).toArray();
            res.send(result);
        });

        // app.post('/addProducts', async (req,res)=>{
        //     const user = req.body;
        //     const result = await productCollection.insertOne(user);
        //     res.send(result)
        // });
        // app.get('/addProducts', async(req,res)=>{
        //     const email = req.query.email;
        //     const query = {email:email};
        //     const result = await productCollection.find(query).toArray();
        //     res.send(result);
        // });
        // app.delete('/addProducts/:id', async(req,res)=>{
        //     const id = req.params.id;
        //     const query = {_id : new ObjectId(id)};
        //     const result = await productCollection.deleteOne(query);
        //     res.send(result)
        // })

    } finally {

    }
}
run().catch(console.dir);


//////////////////////

app.listen(port, () => {
    console.log(`hi hello ${port}`)
})