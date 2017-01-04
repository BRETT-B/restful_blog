const   express     =   require("express"),
        app         =   express(),
        bodyParser  =   require("body-parser"),
        sanitizer   =   require("express-sanitizer"),
        override    =   require("method-override"),
        mongoose    =   require("mongoose");
        
//configure mongoose
mongoose.connect("mongodb://localhost/restful_blog");

//configure app
app.set("view engine", "ejs");
app.locals.moment = require('moment');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(sanitizer());
app.use(override("_method"));

//set up a new schema
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

//compile into a model
var Blog = mongoose.model("Blog", blogSchema);

//RESTful Routes
app.get("/", (req, res) => {
    res.redirect("/blogs");
});

//Index Route
app.get("/blogs", (req, res) => {
    Blog.find({}, (err, blogs) => {
        if(err){
            console.log("Error");
        }else{
            res.render("index", {blogs: blogs});
        }
    });
});

//New Route
app.get("/blogs/new", (req, res) => res.render("new"));

//Create Route
app.post("/blogs", (req, res) => {
    //Create Blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, (err, newBlog) => {
        if(err){
            res.render("new");
        }else{
            res.redirect("/blogs");
        }
    });
});

//Show Route
app.get("/blogs/:id", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("show", {blog: foundBlog});
        }
    });
});

//Edit Route
app.get("/blogs/:id/edit", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("edit", {blog: foundBlog});
        }
    });
});

//Update Route
app.put("/blogs/:id", (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs/" + req.params.id);  
        }
    });
});

//Destroy/Delete Route
app.delete("/blogs/:id", (req, res) => {
    //delete blog and redirect
   Blog.findByIdAndRemove(req.params.id, (err) => {
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs");
        }
   }); 
});

app.listen(process.env.PORT, process.env.IP, () => console.log("Server is listening..."));