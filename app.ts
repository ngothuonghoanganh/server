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
import paymentRouter from "./routes/payment";
import loyalCustomerRouter from "./routes/loyalCustomer";
import commentRouter from "./routes/comment";
import chatRouter from "./routes/chat";
import supplierRouter from "./routes/supplier";
import retailOrderRouter from "./routes/history";
import transactionRouter from "./routes/transaction";
import systemRouter from "./routes/system";
import notifRouter from "./routes/notif";
import serverPage from "./routes/serverpage";

import Logger from "./lib/logger";
import cronjob from "./controllers/cron/cronjob";
import chat from "./controllers/chat";
import pricingRouter from "./routes/pricing";

const upload = multer();
dotenv.config();
const app: Application = express();
const port = 3000;

const server: http.Server = http.createServer(app);

cronjob.run();

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

chat.run();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/public/views"));

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
app.use("/api/payment", paymentRouter);
app.use("/api/customerdiscountcode", customerDiscontCodeRouter);
app.use("/api/comment", commentRouter);
app.use("/api/loyalcustomer", loyalCustomerRouter);
app.use("/api/chat", chatRouter);
app.use("/api/supplier", supplierRouter);
app.use("/api/history", retailOrderRouter);
app.use("/api/transaction", transactionRouter);
app.use("/api/system", systemRouter);
app.use("/api/notif", notifRouter);
app.use("/", serverPage);
app.use("/api/pricing", pricingRouter);


try {
  server.listen(process.env.PORT || 3000, (): void => {
    console.log(`Connected successfully on port ${port}`);
  });
} catch (error) {
  console.error(`Error occured: ${error}`);
}
