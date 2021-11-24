const express = require("express");
const PORT = process.env.PORT || 4000;

const app = express();

const connectMongoDb = require("./db/db");
const authMiddleware = require("./middlewares/auth.middleware");

const userRouter = require("./routes/user.router");
const authRouter = require("./routes/auth.router");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user", userRouter);
app.use("/api/auth", authMiddleware, authRouter);

async function connectDBAndListen() {
  try {
    await connectMongoDb();
    app.listen(PORT, () => {
      console.log(`Server up and running on PORT ${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
}

connectDBAndListen();
