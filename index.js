const express = require("express");
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const SSLCommerzPayment = require('sslcommerz-lts')

app.get("/", (req, res) => {
    res.send("hi hello")
});
app.use(cors());
app.use(express.json());
const store_id = 'group64bdf1d8cd23a'
const store_passwd = 'group64bdf1d8cd23a@ssl'
const is_live = false //true for live, false for sandbox

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
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result)
        });
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
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
                    price: user.price,
                    tag: user.tag
                }
            }
            const result = await productCollection.updateOne(filter, updateduser, options);

            res.send(result)
        })


        app.post('/orders', async (req, res) => {
            // const user = req.body;
            // const result = await ordersCollection.insertOne(user);
            // res.json(result)

            const user = req.body;
            const orderService = await productCollection.findOne({ _id: new ObjectId(user.service) });
            //  (orderService);

            const transactionId = new ObjectId().toString();
            const data = {
                total_amount: orderService.price,
                currency: user.currency,
                tran_id: transactionId, // use unique tran_id for each api call
                success_url: `http://localhost:5000/order/success?transactionId=${transactionId}`,
                fail_url: `http://localhost:5000/order/fail?transactionId=${transactionId}`,
                cancel_url: 'http://localhost:5000/order/cancel',
                ipn_url: 'http://localhost:3030/ipn',
                shipping_method: 'Courier',
                product_name: user.name,
                product_category: 'Electronic',
                product_profile: user.image,
                cus_name: 'Customer Name',
                cus_email: user.email,
                cus_add1: 'Dhaka',
                cus_add2: 'Dhaka',
                cus_city: 'Dhaka',
                cus_state: 'Dhaka',
                cus_postcode: '1000',
                cus_country: 'Bangladesh',
                cus_phone: '01711111111',
                cus_fax: '01711111111',
                ship_name: 'Customer Name',
                ship_add1: 'Dhaka',
                ship_add2: 'Dhaka',
                ship_city: 'Dhaka',
                ship_state: 'Dhaka',
                ship_postcode: user.postcode,
                ship_country: 'Bangladesh',
            };


            const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
            sslcz.init(data).then(apiResponse => {
                // Redirect the user to payment gateway
                let GatewayPageURL = apiResponse.GatewayPageURL
                //  (apiResponse)
                ordersCollection.insertOne({
                    ...user,
                    price: orderService.price,
                    transactionId,
                    paid: false
                })
                res.send({ url: GatewayPageURL })
            });

        })
        // success payments
        app.post('/order/success', async (req, res) => {
            const { transactionId } = req.query;
            const result = await ordersCollection.updateOne({ transactionId }, { $set: { paid: true, paidAt: new Date() } });
             (result)

            if (result.modifiedCount > 0) {
                res.redirect(`http://localhost:3000/order/success?transactionId=${transactionId}`)
            }

        });

        app.get('/orders/by-transaction-id/:id', async (req, res) => {
            const { id } = req.params;
            const order = await ordersCollection.findOne({ transactionId: id });
            res.send(order)
        })
        // error payments
        app.post('/order/fail', async (req,res)=>{
            const { transactionId } = req.query; 
            const result = await ordersCollection.deleteOne({ transactionId },);
            if(result.deletedCount){
                res.redirect(`http://localhost:3000/order/fail`)
            }
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
     (`hi hello ${port}`)
})