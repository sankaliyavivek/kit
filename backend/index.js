    const express = require('express');
    require('./connect')
    const http = require('http');
    const cors = require('cors');
    const {initializeSocket} = require('./socket');
    const cookieParser = require('cookie-parser');



    const app = express()
    const server = http.createServer(app); 


    app.use(cookieParser());
    app.use(express.json());
    app.use(cors({
        origin: ["https://sankaliyavivek.github.io", "http://localhost:9090","https://kit-sxkb.onrender.com"],
        credentials: true
    }));

    const foodrouter = require('./router/food')
    const userRouter = require('./router/user')
    const cartRouter = require('./router/cart')
    const orederRouter =require('./router/order')



    app.use('/food',foodrouter)
    app.use('/user',userRouter)
    app.use('/cart',cartRouter)
    app.use('/order',orederRouter)
        


    initializeSocket(server); 
    
    const port = 9090
    server.listen(port,()=>{
        console.log(`server is running on port ${port}`)
    });