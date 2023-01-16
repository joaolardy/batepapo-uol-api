import express from 'express';
import cors from 'cors'

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.listen( PORT, () => {
    console.log(`a porta ${PORT} foi configurada com sucesso}`)
})