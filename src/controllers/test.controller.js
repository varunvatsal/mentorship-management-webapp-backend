import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { connection } from "../db/index.js"
import bcrypt from "bcrypt"

const printHello = (req, res) => {
    console.log("hello")

    return res.status(200)
    .json(
        new ApiResponse(200, {}, "post request sent")
    )
}

const getData = asyncHandler(async (req, res) => {
    let [[result]] = await connection.promise().query("select * from test where id = ?", [1])
    console.log(result)

    const encr = await bcrypt.hash(result.name, 10)

    const comp = await bcrypt.compare("varun vatsal ", encr)

    return res.status(200)
    .json(
        new ApiResponse(200, {result, encr, comp}, "data retrived")
    )
})

const testDatabase = asyncHandler(async (req, res) => {
    let [result] = await connection.promise().query("select * from skill")

    console.log(result)

    return res.status(200)
    .json(
        new ApiResponse(200, {result}, "data fetched")
    )
})

const getAllUser = asyncHandler(async (req, res) => {
    let [result] = await connection.promise().query("select * from user")

    return res.status(200)
    .json(
        new ApiResponse(200, result, "users fetched successfully")
    )
})

const getHeader = asyncHandler(async (req, res) => {

    console.log(req.headers.name)

    return res.status(200)
    .json(
        new ApiResponse(200, {}, "header fetched")
    )
})

export {printHello, getData, testDatabase, getAllUser, getHeader}