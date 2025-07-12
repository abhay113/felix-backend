import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/auth.routes';
import userRoutes from './src/routes/users.routes';
import transactionRoutes from './src/routes/transaction.routes';
import walletsRoutes from './src/routes/wallets.routes';
import stellarRoutes from './src/routes/stellar.routes';
import entityRoutes from './src/routes/entity.routes';
import offerRoutes from './src/routes/entity.routes';


dotenv.config();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

const app = express();

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));


app.options("/", cors({ origin: allowedOrigins, credentials: true }));

app.use(express.json());
app.use('/api/v1', authRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1', walletsRoutes);
app.use('/api/v1', transactionRoutes);
app.use('/api/v1', stellarRoutes);
app.use('/api/v1', entityRoutes);
app.use('/api/v1', offerRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to the FELIX Backend!");
});
export default app;
