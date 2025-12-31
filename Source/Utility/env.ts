export const env = {
	BOT_TOKEN: process.env["BOT_ID"],
	PORT: Number.parseInt(process.env["PORT"] ?? "443"),
	WEB_PASSWORD: process.env["WEB_PASSWORD"],
	DEV_SERVER_ID: process.env["DEV_SERVER_ID"], // note: this is a string, due to discord.js
};
