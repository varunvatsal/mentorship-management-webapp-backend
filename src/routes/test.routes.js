import { Router } from "express";
import { printHello, getData, testDatabase, getAllUser, getHeader } from "../controllers/test.controller.js";
const router = Router()

router.route("/test").post(printHello)
router.route("/getData").post(getData)
router.route("/testDatabase").post(testDatabase)
router.route("/getAlluser").get(getAllUser)
router.route("/getHeader").post(getHeader)

export default router