const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose'); 
const mysql = require('mysql2');     

app.use(express.static('public'));
app.use(cors());
app.use(express.json()); 



const mongoURI = process.env.MONGO_HOST ? `mongodb://${process.env.MONGO_HOST}:27017/realstock` : 'mongodb://localhost:27017/realstock';

mongoose.connect(mongoURI)
    .then(() => console.log(' MongoDB Connected!'))
    .catch(err => console.log(' MongoDB Error:', err));

const WishSchema = new mongoose.Schema({
    user: String,        
    stockName: String, 
    price: Number,  
    date: { type: Date, default: Date.now }
});
const WishList = mongoose.model('WishList', WishSchema);


const dbConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: 'root',
    password: '1234',
    database: 'realstock_db'
};
const db = mysql.createPool(dbConfig);
db.getConnection((err) => {
    if (err) console.log(' MySQL 연결 대기 중 (Docker 실행 필요)');
    else console.log(' MySQL Connected!');
});


app.get('/api/market', (req, res) => {
    const kospi = 3579 + Math.random() * 20 - 10;
    const kosdaq = 1050 + Math.random() * 10 - 5;
    res.json({ kospi: kospi.toFixed(2), kosdaq: kosdaq.toFixed(2) });
});

app.post('/api/wish', async (req, res) => {
    const { user, stockName, price } = req.body;

    try {
        const newWish = new WishList({
            user: user,
            stockName: stockName,
            price: price
        });
        await newWish.save();
        
        console.log(`[MongoDB] ${user}님이 ${stockName}을(를) 찜했습니다!`);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'DB Error' });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

const tf = require('@tensorflow/tfjs');

app.get('/api/predict', async (req, res) => {
 
    const xData = tf.tensor([1, 2, 3, 4, 5]);
    const yData = tf.tensor([3000, 3010, 3020, 3030, 3040]);

    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

    model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

    console.log("[AI] 학습 시작...");
    await model.fit(xData, yData, { epochs: 100 });
    console.log("[AI] 학습 완료!");

    const nextDay = tf.tensor([6]); 
    const prediction = model.predict(nextDay);
    
    const resultPrice = prediction.dataSync()[0];

    res.json({ 
        day: 6, 
        predicted_price: resultPrice.toFixed(2)
    });
});