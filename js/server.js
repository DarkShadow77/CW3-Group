const express = require('express')
const app = express()
const cors = require('cors')

// REQUIRED MODULES FOR STATIC FILE
var path = require("path")
var fs = require("fs")

app.use(express.json())
app.use (cors())


// LOGGER MIDDLEWARE
app.use(function (req, res, next) {
    console.log("Request URL: " + req.url);
    console.log("Request Date: " + new Date());
    next();
});

// STATIC FILE SERVER MIDDLEWARE
app.use(function (req, res, next) {
    // Uses path.join to find the path where the file should be
    var filePath = path.join(__dirname, "images", req.url);
    // Built-in fs.stat gets info about a file
    fs.stat(filePath, function (err, fileInfo) {
        if (err) {
            next();
            return;
        }
        if (fileInfo.isFile()) res.sendFile(filePath);
        else next();
    });
});

const MongoClient = require('mongodb').MongoClient;

//SELECT DATABASE
let db;
MongoClient.connect("mongodb+srv://DarkShadow:123123Merry@cw2.gnjxocm.mongodb.net/test"
    , (err, client) => {
        db = client.db('webstore');
        console.log("database connected");
    })


//SELECT COLLECTION
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    return next()
})

//DISPLAY A MESSAGE FOR ROOT PATH TO SHOW THAT API IS WORKING
app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collection/messages')
})

//RETRIEVE ALL THE OBJECTS FROM A COLLECTION
app.get('/collection/:collectionName', (req, res) => {
    req.collection.find({}).toArray((error, results) => {
        if (error) return next(error)
        res.send(results)
    })
})

//RETIREVE AN OBJECT BY MONGODB ID
const ObjectID = require('mongodb').ObjectId;
app.get('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.findOne(
        { _id: new ObjectID(req.params.id) },
        (error, result) => {
            if (error) return next(error)
            res.send(result)
        })
})

//ADD AN OBJECT
app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insertOne(req.body, (error, results) => {
        if (error) return next(error)
        let response = { "message": "success" }
        res.send(results.ops)
    })
})


//UPDATE AN OBJECT BY ID
// app.put('/collection/:collectionName/:id', (req, res, next) => {
//     req.collection.updateOne(
//         {_id: new ObjectID(req.params.id)},
//         {$set: req.body},
//         {safe: true, multi: false},
//         (error, result) => {
//             if (error) return next(error)
//             res.send((result.result.n === 1) ?
//                 {msg: 'success'} : { msg: 'error'})
//         })
//         console.log(req.body)
// })

app.put('/collection/:collectionName/:id', (request, response, next) => {
    request.collection.update(
        { _id: new ObjectID(request.params.id) },
        { $set: request.body },
        { safe: true, multi: false },
        (error, result) => {
            if (error) return next(error)
            response.send(result.acknowledged == true ? {msg: 'success'} : {msg: 'error'})
        })
})

app.get('/search/:collectionName/:searchItem', (request, response, next) => {

    request.collection.aggregate(

        [{
            $search: {
                index: 'autoCompleteLessons',
                compound: {
                    should: [
                        {
                            "autocomplete": {
                                query: request.params.searchItem,
                                path: 'subject',
                                "tokenOrder": "sequential"
                            },
                        },
                        {
                            "autocomplete": {
                                query: request.params.searchItem,
                                path: 'location',
                                "tokenOrder": "sequential"
                            },
                        },
                    ],
                },
            },
        }]

    ).toArray((error, results) => {
        if (error) return next(error)
        response.send(results)
    })
})

// search
// app.get('/collection/:collectionName/search', (req, res, next) => {
//     let query_str = req.query.key_word
//     req.collection.find({}).toArray((e, results) => {
//         if (e) return next(e)
//         let newList = results.filter((lesson) => {
//             return lesson.subject.toLowerCase().match(query_str) || lesson.location.toLowerCase().match(query_str)
//         });
//         res.send(newList)
//     })
// })





app.use(function (req, res) {
    // Sets the status code to 404
    res.status(404);
    // Sends the error "File not found!”
    res.send("File not found!");
});

app.listen(process.env.PORT || 3000,()=> {
    console.log("app running");
})