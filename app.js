const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const day = date.getDate();

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://nikhil-admin:test123@cluster0.ddato.mongodb.net/todolistDB", {
  useNewUrlParser: true
});

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("item", itemSchema);

const item1 = new Item({
  name: "Welcome to to-do-List"
});

const item2 = new Item({
  name: "Click to delete"
});

const item3 = new Item({
  name: "click to Add item"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema ({
  name : String,
  items : [itemSchema]
});

const List = mongoose.model("list", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if(foundItems.length === 0) {

      Item.insertMany(defaultItems, function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log("success");
        }
      });

      res.redirect("/");

    } else {

      res.render("list", {
        listTitle: day,
        newListItems: foundItems
      });

    }

  })

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list ;

  const item = new Item ({
    name : itemName
  });

  if(listName === day){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name : listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === day){
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if(!err) {
        console.log("Success");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
      if(!err) {
        res.redirect("/" +listName);
      }
    });
  }
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){ // checking if a list already exists

        const list = new List ({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/"+customListName);

      } else {
        res.render("list", {listTitle : foundList.name, newListItems : foundList.items});
      }
    }
  });


});

let port = process.env.PORT;
if(port === null || port === "") {
  port = 3000 ;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
