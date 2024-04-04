// cannister code goes here
import { v4 as uuidv4 } from 'uuid';
import { Server, StableBTreeMap, ic } from 'azle';
import express from 'express';

class Message {
    id!: string;
    title!: string;
    body!: string;
    attachmentURL!: string;
    createdAt!: Date;
    updatedAt!: Date;
}

const messagesStorage = StableBTreeMap<string, Message>(0);

export default Server(() => {
    const app = express();

    app.use(express.json());

    app.post("/messages", (req: { body: Message; }, res: { json: (arg0: Message) => void; }) => {
        const message: Message =  {id: uuidv4(), createdAt: getCurrentDate(), ...req.body};
        messagesStorage.insert(message.id, message);
        res.json(message);
    });

    app.get("/messages", (req: any, res: { json: (arg0: any) => void; }) => {
        res.json(messagesStorage.values());
    });

    app.get("/messages/:id", (req: { params: { id: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): void; new(): any; }; }; json: (arg0: any) => void; }) => {
        const messageId = req.params.id;
        const messageOpt = messagesStorage.get(messageId);
        if ("None" in messageOpt) {
           res.status(404).send(`the message with id=${messageId} not found`);
        } else {
           res.json(messageOpt.Some);
        }
    });

    app.put("/messages/:id", (req: { params: { id: any; }; body: any; }, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): void; new(): any; }; }; json: (arg0: any) => void; }) => {
        const messageId = req.params.id;
        const messageOpt = messagesStorage.get(messageId);
        if ("None" in messageOpt) {
           res.status(400).send(`couldn't update a message with id=${messageId}. message not found`);
        } else {
           const message = messageOpt.Some;
           const updatedMessage = { ...message, ...req.body, updatedAt: getCurrentDate()};
           messagesStorage.insert(message.id, updatedMessage);
           res.json(updatedMessage);
        }
    });

    app.delete("/messages/:id", (req: { params: { id: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): void; new(): any; }; }; json: (arg0: any) => void; }) => {
        const messageId = req.params.id;
        const deletedMessage = messagesStorage.remove(messageId);
        if ("None" in deletedMessage) {
           res.status(400).send(`couldn't delete a message with id=${messageId}. message not found`);
        } else {
           res.json(deletedMessage.Some);
        }
    });

    return app.listen();
});

function getCurrentDate() {
    const timestamp = new Number(ic.time());
    return new Date(timestamp.valueOf() / 1000_000);
}
