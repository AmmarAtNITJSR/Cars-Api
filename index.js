const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

// Routes Import
const brandsRoute = require('./server/all-brands/brandsRoute');
const carsRoute = require('./server/all-cars/carsRoute');

// Routes
app.use('/api/brands', brandsRoute);
app.use('/api/brands', carsRoute);  // Notice: cars nested under brands

app.get('/', (req, res) => {
    res.send('<h1>Cars-API</h1>');
});

const port = 8000;
app.listen(port, () => {
    console.log(`Server Started At ${port}!`);
});
