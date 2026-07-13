const express = require("express")
const { loginMemberCtrl, registerMemberCtrl, forgotPasswordCtrl, resetPasswordCtrl, getAllUsers, updateAddressCtrl, updateProfileCtrl } = require("../controllers/userCtrl")
const router = express.Router()


router.post("/login", loginMemberCtrl)
router.post("/register", registerMemberCtrl)
router.post("/forgot-password", forgotPasswordCtrl)
router.post("/reset-password/:token", resetPasswordCtrl)
router.get("/getAll", getAllUsers)
router.put("/update-address/:id", updateAddressCtrl)
router.put("/update-profile/:id", updateProfileCtrl)




module.exports = router