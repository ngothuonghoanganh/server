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
import categoryRoute from './routes/category';
import productRouter from'./routes/product';

import Logger from "./lib/logger";
import { CateController } from "./controllers/category";

const upload = multer();
dotenv.config();
const app: Application = express();
const port = 3000;

const server: http.Server = http.createServer(app);

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
app.use('/api/categories', categoryRoute);
app.use('/api/products', productRouter);


try {
  server.listen(process.env.PORT || 3000, (): void => {
    console.log(`Connected successfully on port ${port}`);
  });
} catch (error) {
  console.error(`Error occured: ${error}`);
}
