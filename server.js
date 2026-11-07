require('dotenv').config(); // load .env before anything reads process.env
const app = require('./app');
const { connectDB } = require('./db/db');
const { tableModel, seedData } = require('./model/tableModel.model');

const PORT = process.env.PORT || 3000;

const start = async () => {
    await connectDB();     // 1. make sure the database exists
    await tableModel();    // 2. then create the tables
    await seedData();      // 3. then seed default data
    app.listen(PORT, () => console.log(`server running on port http://localhost:${PORT}`));
};

start();