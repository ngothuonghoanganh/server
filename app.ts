import express, { Application } from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import bodyParser from "body-parser";
import morgan, { StreamOptions } from "morgan";

import * as http from "http";
import multer from "multer";

import cookies_reader from "./services/cookies";
import indexRoute from "./routes/index";
import userRoute from "./routes/users";
import fileRoute from "./routes/files";
import categoryRoute from "./routes/category";
import productRouter from "./routes/product";
import cartRouter from "./routes/cart";
import campaignRouter from "./routes/campaign";
import orderRouter from "./routes/order";
import addressRouter from "./routes/address";
import discontCodeRouter from "./routes/discountcode";
import customerDiscontCodeRouter from "./routes/customerdiscountcode";
import { database } from "./models/firebase/firebase";
import commentRouter from "./routes/comment";


import Logger from "./lib/logger";
import cronjob from "./controllers/cron/cronjob";

const upload = multer();
dotenv.config();
const app: Application = express();
const port = 3000;

const server: http.Server = http.createServer(app);

// cronjob config
cronjob.run();

// logger config
const stream: StreamOptions = {
  write: (message) => Logger.http(message),
};

const skip = () => {
  const env = process.env.NODE_ENV || "development";
  return env !== "development";
};

const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip }
);
database.ref("hello").on("value", (snapshot) => {
  console.log(snapshot.val());
});
// server config
app.use(morganMiddleware);
app.use(bodyParser.json());
app.use(helmet());
app.use(cors());
app.use(
  express.json({
    limit: "10kb",
  })
);
app.use(cookieParser());
app.use(cookies_reader);
app.use(upload.single("file"));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// routes config
app.use("/api", indexRoute);
app.use("/api/users", userRoute);
app.use("/api/files", fileRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/campaigns", campaignRouter);
app.use("/api/order", orderRouter);
app.use("/api/address", addressRouter);
app.use("/api/discountcode", discontCodeRouter);
app.use("/api/customerdiscountcode", customerDiscontCodeRouter);
app.use("/api/comment", commentRouter);

try {
  server.listen(process.env.PORT || 3000, (): void => {
    console.log(`Connected successfully on port ${port}`);
  });
} catch (error) {
  console.error(`Error occured: ${error}`);
}
