import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { connection } from "../db/index.js";
const verifyJWT = asyncHandler(async (req, res, next) => {
    try {

        const token = req.headers["accesstoken"]

        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        if(!decodedToken){
            throw new ApiError(401, "token expired")
        }

        let [[user]] = await connection.promise().query("select * from user where id = ?", [decodedToken.id])

        req.user = user

        next()
        
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid accessToken")
    }
})

export {verifyJWT}
