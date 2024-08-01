const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");


dotenv.config({ path: "./config.env"});

//database connection details 
const dbURL = process.env.DATABASE;

// Connect to MongoDB
mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then((con) => {
    console.log('Database connected successfully');
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}`);
});


