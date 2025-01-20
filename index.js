require('dotenv').config()
const express = require('express')
var jwt = require('jsonwebtoken');
var cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


// Middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dynrh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");




        const userCollection = client.db('newspaperDB').collection('users');
        const publisherCollection = client.db('newspaperDB').collection('publishers');
        const articleCollection = client.db('newspaperDB').collection('atricles');


         // jwt related api
    app.post('/jwt', async (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        res.send({ token });
      })
  
      // middlewares 
      const verifyToken = (req, res, next) => {
        // console.log('inside verify token', req.headers.authorization);
        if (!req.headers.authorization) {
          return res.status(401).send({ message: 'unauthorized access' });
        }
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
          if (err) {
            return res.status(401).send({ message: 'unauthorized access' })
          }
          req.decoded = decoded;
          next();
        })
      }
  
      // use verify admin after verifyToken
      const verifyAdmin = async (req, res, next) => {
        const email = req.decoded.email;
        const query = { email: email };
        const user = await userCollection.findOne(query);
        const isAdmin = user?.role === 'admin';
        if (!isAdmin) {
          return res.status(403).send({ message: 'forbidden access' });
        }
        next();
      }

        // User Realted API 
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;


            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query);

            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }

            const result = await userCollection.insertOne(user);
            res.send(result);
        })

        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
              $set: {
                role: 'admin'
              }
            }
            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result);
          })

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })

        //   Publisher realted API 
        app.get('/publishers', async (req, res) => {
            const result = await publisherCollection.find().toArray();
            res.send(result);
        })

        app.post('/publishers', async (req, res) => {
            const publishers = req.body;

            // const query = { email: user.email }
            // const existingUser = await userCollection.findOne(query);

            // if (existingUser) {
            //     return res.send({ message: 'user already exists', insertedId: null })
            // }

            const result = await publisherCollection.insertOne(publishers);
            res.send(result);
        })

        app.delete('/publishers/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await publisherCollection.deleteOne(query);
            res.send(result);
        })


        //   Articles realted API 
        app.get('/articles', async (req, res) => {
            const result = await articleCollection.find().toArray();
            res.send(result);
        })

        app.post('/articles', async (req, res) => {
            const publishers = req.body;

            // const query = { email: user.email }
            // const existingUser = await userCollection.findOne(query);

            // if (existingUser) {
            //     return res.send({ message: 'user already exists', insertedId: null })
            // }

            const result = await articleCollection.insertOne(publishers);
            res.send(result);
        })

        app.get('/articles/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }

            const result = await articleCollection.findOne(query);
            res.send(result);
        })

        app.delete('/articles/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await articleCollection.deleteOne(query);
            res.send(result);
        })


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