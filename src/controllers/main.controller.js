import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { connection } from "../db/index.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const generateAccessToken = async (userID, email, password) => {
    const token = jwt.sign(
        {
            id: userID,
            email,
            password
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )

    return token
}

const generateRefreshToken = async (userID) => {
    const token = jwt.sign(
        {
            id: userID
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
    try {
        await connection.promise().execute("update user set refreshToken = ? where id = ?", [token, userID])
    } catch (error) {
        throw new ApiError(401, error.sqlMessage)
    }


    return token
}

const registerUser = asyncHandler(async (req, res) => {
    let {email, password} = req.body

    if(!email || !password){
        throw new ApiError(400, "email ans password both are required")
    } 

    password = password.split(" ").join("")

    password = await bcrypt.hash(password, 10)

    try {
        await connection.promise().execute("insert into user (email, password) values (?, ?)", [email, password])
    } catch (error) {
        throw new ApiError(401, error.sqlMessage)
    }

    return res.status(201)
    .json(
        new ApiResponse(200, {email, password}, "user created successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body

    console.log(email)
    console.log(password)

    if(!email || !password){
        throw new ApiError(400, "email and password both are required")
    } 

    const [[user]] = await connection.promise().execute("select id, email, password from user where email = ?", [email])

    if(!user){
        throw new ApiError(400, "no user with given email found")
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)

    if(!isPasswordCorrect){
        throw new ApiError(400, "incorrect password")
    }

    const accessToken = await generateAccessToken(user.id, email, password)
    const refreshToken = await generateRefreshToken(user.id)

    return res.status(200)
    .json(
        new ApiResponse(200, {user, accessToken, refreshToken}, "login successfull")
    )

})

const getSkills = asyncHandler(async (req, res) => {
    let [skills] = await connection.promise().query("select * from skill");

    return res.status(200)
    .json(
        new ApiResponse(200, skills, "skill fetches")
    )
})

const makeRequest = asyncHandler(async (req, res) => {
    const menteeId = req.user.id
    const mentorId = req.body.mentorId

    if(menteeId === mentorId) {
        throw new ApiError(401, "mentorId and menteeId should be diffrent")
    }

    const [[request]] = await connection.promise().query("select * from request where menteeId = ? and mentorId = ?", [menteeId, mentorId])

    if(request){
        throw new ApiError(401, "request already exist")
    }

    await connection.promise().query("insert into request (menteeId, mentorId, status) values (?, ?, ?)", [menteeId, mentorId, "in-progress"])

    return res.status(200)
    .json(
        new ApiResponse(201, {menteeId, mentorId, status: "in-progress"}, "request successfully made")
    )
    
})

const acceptRequest = asyncHandler(async (req, res) => {
    const mentorId = req.user.id
    const menteeId = req.body.menteeId

    await connection.promise().query("update request set status = ? where mentorId = ? and menteeId = ?", ["accepted", mentorId, menteeId])

    return res.status(200)
    .json(
        new ApiResponse(200, {mentorId, menteeId, status: "accepted"})
    )
})

const rejectRequest = asyncHandler(async (req, res) => {
    const mentorId = req.user.id
    const menteeId = req.body.menteeId

    await connection.promise().query("delete from request where mentorId = ? and menteeId = ?", [mentorId, menteeId])

    return res.status(200)
    .json(
        new ApiResponse(200, {mentorId, menteeId, status: "rejected"})
    )
})

const addSkill = asyncHandler(async (req, res) => {
    const {name} = req.body

    if(!name){
        throw new ApiError(401, "skill name is required")
    }

    await connection.promise().query("insert into skill (name) value (?)", [name])

    return res.status(200)
    .json(
        new ApiResponse(200, {skill: name}, "skill added successfully")
    )
})

const addUserSkill = asyncHandler(async (req, res) => {
    const {id} = req.user
    const {skills} = req.body

    if(!id || !skills){
        throw new ApiError(401, "ids of both user and skill is required")
    }

    skills.forEach( async element => {
        await connection.promise().query("insert into user_skill_map (userId, skillId, status) values (?, ?, ?)", [id, element, true])
    });


    return res.status(200)
    .json(
        new ApiResponse(200, {}, "skill addedd successfully")
    )
    
})

const addUserInterest = asyncHandler(async (req, res) => {
    const {id} = req.user
    const {skillId} = req.body

    if(!id || !skillId){
        throw new ApiError(401, "ids of both user and skill is required")
    }

    await connection.promise().query("insert into user_skill_map (userId, skillId, status) values (?, ?, ?)", [id, skillId, false])

    return res.status(200)
    .json(
        new ApiResponse(200, {}, "interest addedd successfully")
    )
})

const showAllRequestRecievedPending = asyncHandler(async (req, res) => {
    const {id} = req.user

    const [mentees] = await connection.promise().query("select fullname from user where id in (select menteeId from request where mentorId = ? and status = 'in-progress')", [id])

    return res.status(200)
    .json(
        new ApiResponse(200, mentees, "potential mentees fetched successfully")
    )
})

const showAllRequestSentPending = asyncHandler(async (req, res) => {
    const {id} = req.user

    const [mentors] = await connection.promise().query("select fullname from user where id in (select mentorId from request where menteeId = ? and status = 'in-progress')", [id])

    return res.status(200)
    .json(
        new ApiResponse(200, mentors, "potential mentors fetched successfully")
    )
})

const findPotentialMentor = asyncHandler(async (req, res) => {
    const {id} = req.user

    const queryString = "select fullname from user where id in (select userId from user_skill_map where status = true and skillId in (select skillId from user_skill_map where userId = ? and status = false))"

    const [mentors] = await connection.promise().query(queryString, [id])

    return res.status(200)
    .json(
        new ApiResponse(200, mentors, "potential mentors fetched succeessfully")
    )
})

const findMentees = asyncHandler(async (req, res) => {
    const {id} = req.user

    const [mentees] = await connection.promise().query("select fullname, email, mobile from user where id in (select menteeId from request where mentorId = ? and status = 'accepted')", [id])

    return res.status(200)
    .json(
        new ApiResponse(200, mentees, "mentees fetched successfully")
    )
})

const findMentors = asyncHandler(async (req, res) => {
    const {id} = req.user

    console.log("1")

    const [mentors] = await connection.promise().query("select fullname, email, mobile from user where id in (select mentorId from request where menteeId = ? and status = 'accepted')", [id])

    return res.status(200)
    .json(
        new ApiResponse(200, mentors, "mentors fetched successfully")
    )
})

const updateUserDetail = asyncHandler(async (req, res) => {
    const {id} = req.user
    const {mobile, fullname} = req.body

    if(!mobile && !fullname){
        throw new ApiError(401, "from the fields mobile, fullname atleast one fields is required")
    }

    await connection.promise().query("update user set fullname = ?, mobile = ? where id = ?", [fullname || "", mobile || 0, id])

    return res.status(200)
    .json(
        new ApiResponse(200, {id, fullname, mobile}, "profile updated successfully")
    )
    
})

const findUserSkill = asyncHandler(async (req, res) => {
    const {id} = req.user

    const [skills] = await connection.promise().query("select name from skill where id in (select skillId from user_skill_map where userId = ? and status = true)", [id])

    return res.status(200)
    .json(
        new ApiResponse(200, skills, "skills fetched successfully")
    )
})

const findUserInterest = asyncHandler(async (req, res) => {
    const {id} = req.user

    const [interests] = await connection.promise().query("select name from skill where id in (select skillId from user_skill_map where userId = ? and status = false)", [id])

    return res.status(200)
    .json(
        new ApiResponse(200, interests, "interests fetched succeddfully")
    )

})

const getUserDetail = asyncHandler(async (req, res) => {
    const {id} = req.user

    const [[user]] =  await connection.promise().query("select email, fullname, mobile from user where id = ?", [id])

    const [skills] = await connection.promise().query("select name from skill where id in (select skillId from user_skill_map where userId = ? and status = true)", [id])

    const [interests] = await connection.promise().query("select name from skill where id in (select skillId from user_skill_map where userId = ? and status = false)", [id])

    return res.status(200)
    .json(
        new ApiResponse(200, {user, skills, interests}, "user fetched successfully")
    )
})


export {
    registerUser, 
    loginUser, 
    getSkills, 
    makeRequest, 
    acceptRequest, 
    rejectRequest, 
    addSkill, 
    addUserSkill, 
    addUserInterest, 
    showAllRequestRecievedPending,
    showAllRequestSentPending,
    findPotentialMentor,
    findMentees,
    findMentors,
    updateUserDetail,
    findUserSkill,
    findUserInterest,
    getUserDetail
}



