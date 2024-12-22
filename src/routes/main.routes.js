import { Router } from "express";
import { 
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
    updateUserDetail,
    findMentees,
    findMentors,
    findPotentialMentor,
    findUserSkill,
    findUserInterest
} from "../controllers/main.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const mainRouter = Router()

mainRouter.route("/register").post(registerUser)
mainRouter.route("/login").post(loginUser)
mainRouter.route("/getSkills").get(verifyJWT, getSkills)
mainRouter.route("/makeRequest").post(verifyJWT, makeRequest)
mainRouter.route("/acceptRequest").post(verifyJWT, acceptRequest)
mainRouter.route("/rejectRequest").post(verifyJWT, rejectRequest)
mainRouter.route("/addSkill").post(verifyJWT, addSkill)
mainRouter.route("/addUserSkill").post(verifyJWT, addUserSkill)
mainRouter.route("/addUserInterest").post(verifyJWT, addUserInterest)
mainRouter.route("/requestReceivedPending").get(verifyJWT, showAllRequestRecievedPending)
mainRouter.route("/requestSentPending").get(verifyJWT, showAllRequestSentPending)
mainRouter.route("/updateProfile").post(verifyJWT, updateUserDetail)
mainRouter.route("/findMentees").get(verifyJWT, findMentees)
mainRouter.route("/findMentors").get(verifyJWT, findMentors)
mainRouter.route("/findPotenstialMentor").get(verifyJWT, findPotentialMentor)
mainRouter.route("/findUserSkill").get(verifyJWT, findUserSkill)
mainRouter.route("/findUserInterest").get(verifyJWT, findUserInterest)

export default mainRouter