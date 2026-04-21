import express from "express";
import authRouter from "./routes/auth.ts";
import vaultsRouter from "./routes/vaults.ts";

const app = express();

app.use(express.json());

app.use(authRouter);
app.use(vaultsRouter);

export default app;
