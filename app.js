const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization'
}));

app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'assets')));

const FruitsRouter = require("./routes/FruitsRoutes");
const usersRouter = require("./routes/usersRoute");
const cartRouter = require("./routes/cartRoutes");

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})

app.use('/api/v1/fruits', FruitsRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/cart', cartRouter)

module.exports = app;