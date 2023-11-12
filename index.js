const express = require('express');
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 3004;


//middleWare

app.use(cors({

    origin: [
        'http://localhost:5173',
        'car-doctor-recape-48845.web.app',
        'car-doctor-recape-48845.firebaseapp.com',
    ],

    credentials: true
}))
app.use(express.json())
    // mongodb Connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1cctsuq.mongodb.net/?retryWrites=true&w=majority`;

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


        const servicesCollection = client.db('recape-car-doctorDb').collection('servicesCar')
        const bookingCollection = client.db('recape-car-doctorDb').collection('booking') ///
            //Auth realated api
        app.post('/jwt', async(req, res) => {
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1h'
            })
            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'none'
                })
                .send({
                    success: true
                })
        })



        // server a data patanor jonno
        app.get('/servicesCar', async(req, res) => {
            const cursor = servicesCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })
        app.get('/servicesCa/:id', async(req, res) => {
            const id = req.params.id
            const options = {

                // Include only the `title` and `imdb` fields in the returned document
                projection: {
                    title: 1,
                    price: 1,
                    service_id: 1,
                    img: 1

                },
            };

            const query = { _id: new ObjectId(id) }
            const result = await servicesCollection.findOne(query, options)
            res.send(result)
        })

        //bookings

        app.get('/bookings', async(req, res) => {
                const query = { email: req.query.email }

                const result = await bookingCollection.find(query).toArray();
                res.send(result)
            }),

            app.post('/bookings', async(req, res) => {
                const booking = req.body;
                console.log(booking)
                const result = await bookingCollection.insertOne(booking);
                res.send(result)
            })
            //delete er jonno
        app.delete('/bookings/:id', async(req, res) => {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) }
                const result = await bookingCollection.deleteOne(query);
                res.send(result)

            })
            //update er jonno 
        app.patch('/bookings/:id', async(req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updateBooking = req.body;
            console.log(updateBooking)
            const updateDoc = {
                $set: {
                    status: updateBooking.status
                },
            };
            const result = await bookingCollection.updateOne(filter, updateDoc);
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
    res.send('doctor is running')
})

app.listen(port, () => {
    console.log(`
Car doctor server is running port $ { port }
`)
})