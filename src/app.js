import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from "mongodb";
import joi from 'joi';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
dotenv.config()

const PORT = 5000;
const app = express();
app.use(cors());
app.use(express.json());

const participanteSchema = joi.object({
    name: joi.string().min(1).required(),
})

const mensagemSchema = joi.object({
    to: joi.string().min(1),
    text: joi.string().min(1),
    type: joi.string().valid("message", "private_message").required()
});

const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db;
try {
    await mongoClient.connect()
    console.log('conexao realizada com sucesso');
    db = mongoClient.db();
} catch (err) {
    console.log(err.message);
}

app.post("/participants", async (req, res) => {
    const participante = req.body;

    try {
        //verifica se o nome esta devidamente preenchido
        const validaNome = participanteSchema.validate(
            participante,
            { abortEarly: false }
        )
        if (validaNome.error) { return res.sendStatus(422); }

        //verifica se o nome já está em uso
        const verificaNome = await db.collection("participants").findOne({ name: participante.name });
        if (verificaNome) {
            console.log(res.sendStatus(409));
            return res.sendStatus(409);
        }
        //passou pelas verificacoes, inclui no bd
        await db.collection("participants").insertOne({ name: participante.name, lastStatus: Date.now() });
        console.log(db.collection("participants"));

        const mensagemChegada = {
            from: participante.name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: dayjs().format('HH:mm:ss')
        }
        await db.collection("messages").insertOne(mensagemChegada);
        return res.sendStatus(201);
    } catch (err) {
        console.log('erro na requisicao post /participants');
    }
})

app.get("/participants", async (req, res) => {
    const listaParticipantes = await db.collection("participants").find().toArray();
    return res.status(200).send(listaParticipantes);
})

app.post("/messages", async (req, res) => {
    const mensagem = req.body;
    let validaMensagem = mensagemSchema.validate(
        mensagem,
        { abortEarly: false }
    )
    if (validaMensagem.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }
    const existeDestinatario = await db.collection("participants").findOne({ name: mensagem.to });
    console.log(existeDestinatario);
    if (existeDestinatario === null && mensagem.to !== 'Todos') {
        return res.send(console.log('destinatario nao existe'));
    }
    await db.collection("messages").insertOne({
        from: req.headers.user,
        to: mensagem.to,
        text: mensagem.text,
        type: mensagem.type,
        time: dayjs().format("HH:mm:ss")
    })

})



app.get("/messages", async (req, res) => {
    const headerMensagem = req.headers;
    const listaMensagens = await db.collection("messages").find({
        $or: [{ to: headerMensagem.user }, { to: 'Todos' }, { from: headerMensagem.user }]
    }
    ).toArray();
    return res.status(200).send(listaMensagens);
})

app.post("/status", async (req, res) => {
    const headerStatus = req.headers;
    const participanteExiste = await db.collection("participants").findOne({ name: headerStatus.user });
    if(participanteExiste === null){
        return res.sendStatus(404);
    }
    await db.collection("participants").updateOne({name: headerStatus.user}, { $set : {lastStatus: Date.now()} })
    return res.sendStatus(200);
})

app.listen(PORT, () => {
    console.log(`a porta foi configurada com sucesso}`)
})