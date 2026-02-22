import { Events } from "discord.js";
import LoadCommands from "./Load/load-commands.ts";
import LoadModules from "./Load/load-modules.ts";
import client from "./client.ts";
import { env } from "./Utility/env.ts";

const TOKEN = env.BOT_TOKEN;

client.once(Events.ClientReady, (readyClient) => {
	console.log(`Logged in as ${readyClient.user.tag}`);
	void LoadModules(client);
	void LoadCommands(client);
});

void client.login(TOKEN);
