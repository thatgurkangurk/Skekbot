import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ComponentType, DiscordAPIError, MessageFlags, SlashCommandBuilder, User } from "discord.js";
import type { CommandInterface } from "../Types/command-interface.ts";

const options = {
	Rock: "🪨",
	Paper: "📄",
	Scissors: "✂️",
};

async function announce(interaction: ChatInputCommandInteraction, buttonInteraction: ButtonInteraction, user1: User, user2: User, user1Choice: string, user2Choice: string) {
	let outcome: string;
	const losers: User[] = [];

	(await interaction.fetchReply()).edit({
		components: [],
	});

	if (user1Choice === user2Choice) {
		if (user1 === user2) {
			outcome = "You played yourself and tied!";
			losers.push(user1);
		} else {
			outcome = "It's a tie!";
			losers.push(user1, user2);
		}
	} else if (
		(user1Choice === "Rock" && user2Choice === "Scissors") ||
		(user1Choice === "Scissors" && user2Choice === "Paper") ||
		(user1Choice === "Paper" && user2Choice === "Rock") )
	{
		outcome = user1 === user2 ? "You played yourself and won!" : `${user1} wins!`;
		if (user1 !== user2) losers.push(user2);
	} else {
		outcome = user1 === user2 ? "You played yourself and lost!" : `${user2} wins!`;
		if (user1 !== user2) losers.push(user1);
	}

	const guild = buttonInteraction.guild;
	if (guild) {
		losers.forEach(async (loser) => {
			if (loser === buttonInteraction.client.user) return;
			try {
				await (await guild.members.fetch(loser)).timeout(60000, "Loser!");
			} catch(e) {
				if (e instanceof DiscordAPIError) return;
				console.log("Error: " + (e as Error));
			}
		});
	}

	await buttonInteraction.reply({
		content: `${user1} chose ${user1Choice}.\n${user2} chose ${user2Choice}.\n\n${outcome}`,
	});
}

const command: CommandInterface = {
	data: new SlashCommandBuilder()
		.setName("rock-paper-scissors")
		.setDescription("Play a game of rock paper scissors.")
		.addUserOption(option => option
			.setName("against")
			.setDescription("The user to play against. Defaults to the bot.")
		),

	async execute(interaction) {
		const against = interaction.options.getUser("against") ?? interaction.client.user;
		const initiator = interaction.user;

		const row = new ActionRowBuilder<ButtonBuilder>();

		for (const [key, value] of Object.entries(options)) {
			row.addComponents(new ButtonBuilder()
				.setCustomId(key)
				.setLabel(key)
				.setEmoji(value)
				.setStyle(ButtonStyle.Primary));
		}

		const response = await interaction.reply({
			content: `${against}, ${initiator} has challenged you to a game of rock paper scissors!`,
			components: [row],
			withResponse: true,
		});

		const collector = response.resource?.message?.createMessageComponentCollector({
			componentType: ComponentType.Button,
		});

		if (!collector) {
			await interaction.editReply({
				content: "An error occurred.",
			});
			return;
		}

		let user1Choice: string | undefined;
		let user2Choice: string | undefined;

		collector.on("collect", async buttonInteraction => {
			const id = buttonInteraction.customId;
			const user = buttonInteraction.user;

			if (user === initiator) user1Choice = id;
			else if (user === against) user2Choice = id;
			else {
				return await buttonInteraction.reply({
					content: "You aren't a part of this battle!",
					flags: [MessageFlags.Ephemeral]
				});
			}

			switch (id) {
				case "a":
					console.log("v");
					break;
				case "b":
					console.log("a");
			}

			if (against.bot || against === initiator) {
				const botChoice = Object.keys(options)[Math.floor(Math.random() * Object.keys(options).length)];
				if (typeof botChoice !== "string") throw new Error("Bot choice is not a string.");

				user2Choice = botChoice;
			}

			if (user1Choice && user2Choice) {
				collector.stop();
				await announce(interaction, buttonInteraction, initiator, against, user1Choice, user2Choice);
				return;
			}

			await buttonInteraction.deferUpdate();
		});
	}
};

export default command;
