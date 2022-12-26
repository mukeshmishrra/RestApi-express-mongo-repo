import express from 'express';
import { APP_PORT, DB_URL } from './config';

import errorHandler from './middlewares/errorHandler';
const app = express();
import routes from './routes';
import mongoose from 'mongoose';
import path from 'path';


// database connection
mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', ()=>{
    console.log('DB connected...');
});

// global varibal :     global varibale ko app me kahi v access kr skte hai directly.
global.appRoot = path.resolve(__dirname);

// mutipart form data use kr rah hu isliye mujhe ye middleware use krna pdega
app.use(express.urlencoded({ extended:false }))
app.use(express.json());
app.use('/api',routes);
app.use(errorHandler);

// image path pr click krne se mujhe image ko browser me open krna hai
app.use('/uploads', express.static('uploads'));

// start server
app.listen(APP_PORT, ()=>{
    console.log(`listening on port ${APP_PORT}`)
});