// REST (representational state transfer) is set of guidelines to design API
// connection protocol must be stateless, e.g., http, current request sent by client to server should be independent of the previous and the next requests
// uniform interface between client and server, i.e., API (application programming interface)
// API provides interface between client and server so that they can exchange data, (in form of text, json, js object, xml, html)
// json is javascript object notation, it is one of the forms in which data is transferred between client and server
// node is runtime environment for javascript out of the browser, interpreter
// express is framework to create servers
// database is handy and efficient way of storing data, relational (tabular) db are postgres, mysql, sqlite, oracle, nosql databases mongodb, dynamo, redis
// mongodb document-based nosql databased, data si stored in json format
// npm (node package manager) is an open-source repository of pre-written code that can be included in our own code
// package.json is kind of like a record of the entire project, also includes which dependencies have been used
// node_modules folder contains all necessary files of owu installed npm packages/modules

// create server
import express from "express";
import env from "dotenv";
// express() is a function that returns the server's object, which is generally stored in an object named app
const app = express();
const port = 8080;

// callback means anonymous function
app.listen(port, function () {
    console.log(`Server running at port ${port}`);
});

// https requests are of 5 kinds - get, post, patch, put, delete
// get to fetch data, post to send data, patch to update, put to replace, delete to remove
// restful APIs have the following barebones structure:
// get /comments/            fetch all comments
// get /comments/new         form to create new comment
// post /comments/           create new comment
// get /comments/:id/        fetch one comment
// patch /comments/:id/edit/   edit one comment
// delete /comments/:id/    delete one comment
// CRUD ops create, read, update, delete

// for each request, express creates two objects automatically, request object (req) and response object (res)
// both these objects are passed in as parameters into the callback by express
app.get("/", function (req, res) {
    res.send("Homepage :)");
});
env.config();
import pg from "pg";

const db = new pg.Client({
    user: "postgres", host: "localhost", database: "comments", password: process.env.PG_PASSWORD, port: 5432
});
db.connect();

app.get("/comments", async function (req, res) {
    const result = await db.query("select * from comments");
    let comments = result.rows;
    res.render("index.ejs", {comments});
});

app.get("/comments/new", function (req, res) {
    res.render("new.ejs");
});

// use method is executed everytime client sends a request to server, irrespective of the type of request
// now express can read the contents of post/patch/put request
// urlencoded parses form data
app.use(express.urlencoded({extended: true}));
// json data can be parsed using json() method

app.post("/comments", async function (req, res) {
    // const username = req.body.username;
    // const comment = req.body.comment;
    // object destructuring
    const {username, comment} = req.body;
    await db.query("insert into comments (username, comment) values ($1, $2)", [username, comment]);
    res.redirect("/comments");
});

app.get("/comments/:id", async function (req, res) {
    // :id is called route parameter
    // const id = parseInt(req.params.id);
    let {id} = req.params;
    id = parseInt(id);
    const result = await db.query("select * from comments where id = $1", [id]);
    let comment = result.rows[0];
    res.render("comment.ejs", {comment});
});

import methodOverride from "method-override";

app.use(methodOverride("_method"));

app.get("/comments/:id/edit", async function (req, res) {
    let {id} = req.params;
    id = parseInt(id);
    const result = await db.query("select * from comments where id = $1", [id]);
    let comment = result.rows[0];
    res.render("edit.ejs", {comment});
});


app.patch("/comments/:id", async function (req, res) {
    let {id} = req.params;
    id = parseInt(id);
    const {comment: newCommentText} = req.body;
    await db.query("update comments set comment = $1 where id = $2", [newCommentText, id]);
    res.redirect("/comments");
});

app.delete("/comments/:id", async function (req, res) {
    let {id} = req.params;
    id = parseInt(id);
    await db.query("delete from comments where id = $1", [id]);
    res.redirect("/comments");
});