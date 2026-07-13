const express = require("express")
const app = express();
const cookieParser = require("cookie-parser")
const cors = require("cors")
const { cloudinaryConnect } = require("./config/cloudinary")
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");



dotenv.config();

const PORT = process.env.PORT || 8080
connectDB();



app.use(express.json())
app.use(cookieParser());
app.use(bodyParser.json())
app.use(cors({
    origin: "*",
    credentials: true,
}))

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp"
    })
)

cloudinaryConnect();

app.use("/api/v1/image", require("./routes/imageRoute"))
app.use("/api/v1/auth", require("./routes/userRoute"))
app.use("/api/v1/product", require("./routes/productRoute"))
app.use("/api/v1/coupon", require("./routes/couponCtrl"))
app.use("/api/v1/order", require("./routes/orderRoute"))



app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "Your server is up and running ..."
    })
})

app.listen(PORT, () => {
    console.log(`Server is running at port no ${PORT}`)
})
