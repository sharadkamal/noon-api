const express = require("express");
const path = require("path");
var MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
require("dotenv").config();

var url = process.env.MONGO_URL;

const PORT = 3001;
const app = express();

var urlencodedParser = bodyParser.urlencoded({
  extended: true,
});
app.use(urlencodedParser);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", (req, res) => res.render("pages/index"));

MongoClient.connect(url, { useUnifiedTopology: true })
  .then((client) => {
    const db = client.db("noon-db");

    app.get("/noon-api/get-all", (_, res) => {
      db.collection("collection")
        .find()
        .toArray()
        .then((results) => {
          console.log(results);
          res.json({ messages: results });
        })
        .catch((error) => console.error(error));
    });

    app.get("/noon-api/get-all-liked", (_, res) => {
      var query = { is_liked: 1 };
      db.collection("collection")
        .find(query)
        .toArray()
        .then((results) => {
          console.log(results);
          res.json({ messages: results });
        })
        .catch((error) => console.error(error));
    });

    app.post("/noon-api/checked-like", (req, res) => {
      var id = req.body.id;
      var status = req.body.status;
      var count = req.body.count;
      let new_like;

      if (parseInt(status) == 1) {
        new_like = parseInt(count) + 1;
      } else {
        new_like = parseInt(count) - 1;
      }

      db.collection("collection")
        .findOneAndUpdate(
          { _id: id },
          { $set: { is_liked: parseInt(status), posted_like_count: new_like } },
          { upsert: true }
        )
        .then((result) => {
          console.log(result);
          res.json({ messages: "Success" });
        });
    });
  })
  .catch((error) => console.log("error :>> ", error));

app.listen(PORT, () => console.log(`Listning to the post ${PORT}`));
