import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.ts";
import vaultsRouter from "./routes/vaults.ts";

const app = express();

app.use(cors({
  origin: "chrome-extension://aijpofojebemijpldinfgdiaejcohlfh",
  credentials: true,
}));

app.use(express.json());

app.use(authRouter);
app.use(vaultsRouter);

export default app;
