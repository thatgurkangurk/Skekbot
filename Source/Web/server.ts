import express from "express";
import client from "../client.ts";
import * as z from "zod";

const PORT = 443;

const app = express();

const MessageRequest = z.object({
	channelId: z.string(),
	message: z.string(),
});

app.use(express.json());

app.get("/", (_, res) => {
	res.send("BLANK PAGE.");
});

app.use(express.static("Source/Web/Page", {
	extensions: ["html"]
}));

app.post("/send-message", async (req, res) => {
	const messageRequest = MessageRequest.parse(req.body);

	const channel = await client.channels.fetch(messageRequest.channelId);
	if (!channel || !channel.isSendable()) throw new Error("Bad channel");

	channel.send(messageRequest.message);

	res.send("Success!");
});

app.listen(PORT, () => {
	console.log(`Web interface starting on port ${PORT}.`);
});
