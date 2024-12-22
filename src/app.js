import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import router from "./routes/test.routes.js"
import mainRouter from "./routes/main.routes.js"

const app = express()


const options = {
    origin: "*",
    credentials: true
}

app.use(cors(options))
app.use(cookieParser())

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit:"16kb"}))

app.use("/test", router)
app.use("/memberApp", mainRouter)

export {app}
