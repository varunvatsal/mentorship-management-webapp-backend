import dotenv from "dotenv"
dotenv.config({
    path: './.env'
})
import { app } from "./app.js"
import {connection} from './db/index.js'


connection.connect((err) => {
    if(err) {
        console.log(err.message)
        return
    }
    console.log("connected to mysql database")
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`)
    })
})




