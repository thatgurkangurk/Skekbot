import { GatewayIntentBits } from "discord.js";
import { BotClient } from "./bot-client.ts";

const client = new BotClient({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages,
	],
});

export default client;
