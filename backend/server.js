const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDb = require("./db_config");
const { notFoundErr, errorHandler } = require("./middlewares/errorHandler");
const authRouter = require("./routes/userRoutes");
const cors = require("cors");
dotenv.config();

connectDb();
app.use(express.json({ limit: "10mb" }));
app.use(cors({ credentials: true, origin: process.env.FRONT_END_URL }));
app.use(cookieParser());

app.use("/api/user", authRouter);

app.use(notFoundErr);
app.use(errorHandler);

app.listen(process.env.PORT || 5500, () => {
  console.log("Server started...");
});
