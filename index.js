// import your node modules
const express = require('express');
const db = require('./data/db.js');

// add your server code starting here
const server = express();

// wire up global middleware
server.use(express.json()); // teaches express how to parse json from the body

server.get('/api/posts', (req, res) => {
    db.find()
        .then(posts => {
            res.status(200).json(posts);
        })
        .catch(err => {
            res.status(500).json({ error: "The posts information could not be retrieved." });
        });
});


server.get('/api/posts/:id', (req, res) => {
    const id = req.params.id;

    db.findById(id)
        .then(post => {
            if(post.length > 0) {
                res.status(200).json(post);
            } else {
                res.status(404).json({ message: "The post with the specified ID does not exist." });
            }
        })
        .catch(err => res.status(500).json({ error: "The post information could not be retrieved." }));
});


server.post('/api/posts', (req, res) => {
    const postInfo = req.body // reads information from the body of the request

    db.insert(postInfo) // returns a promise, so we need to use .then().catch()
        .then(result => {
            db.findById(result.id)
                .then(post => {
                    res.status(201).json(post);
                })
                .catch(err => 
                    res.status(500).json({ error: "There was an error while saving the post to the database" })
                );
        })
        .catch(err =>
            res.status(400).json({ errorMessage: "Please provide title and contents for the post." })
        );
});


server.delete('/api/posts/:id', (req, res) => {
    const id = req.params.id;

    db.findById(id)
        .then(post => {
            let deletedPost = post;

            if (post.length) {
                db.remove(id).then(post => {
                    res.status(200).json(deletedPost);
                });
            } else {
                res.status(404).json({ message: "The post with the specified ID does not exist" });
            }
        })
        .catch(err => res.status(500).json({ message: "The post could not be removed" }));
});


server.put('/api/posts/:id', (req, res) => {
    const id = req.params.id;
    const changes = req.body;

    db.findById(id)
        .then(post => {
            if (post.length > 0 && changes.title && changes.contents) {
                db.update(id, changes)
                    .then(count => {
                        db.findById(id)
                            .then(post => {
                                res.status(200).json(post);
                            })
                    })
                    .catch( err => {
                        res.status(500).json({ error: "The post information could not be modified." });
                    })
            } else if (post.length === 0) {
                res.status(404).json({ message: "The post with the specified ID does not exist." });
            } else if (post.length > 0 & (!changes.title || !changes.contents)) {
                res.status(400).json({ errorMessage: "Please provide title and contents for the post." })
            }
        })
        .catch(err => res.status(500).json({ error: "The post information could not be modified." }))


});


server.listen(5001, () => console.log('server running'));