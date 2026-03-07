import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	SlashCommandBuilder,
} from "discord.js";
import type { CommandInterface } from "../Types/command-interface.ts";
import {
	options,
	RockPaperScissorsGame,
	type Choice,
} from "../Utility/rock.ts";

const command: CommandInterface = {
	data: new SlashCommandBuilder()
		.setName("random-rps")
		.setDescription(
			"Play a game of rock paper scissors against a random user in this server",
		),

async execute(interaction) {
    await interaction.deferReply({
        withResponse: true
    });

    await interaction.editReply({
        content: "choosing an opponent..."
    })

    const human = (
        await interaction.guild!.members.fetch({ withPresences: true })
    )
        .filter((m) => !m.user.bot)
        .filter((m) => m.presence?.status !== "offline")
        .random();

    const against = human!.user;
    const initiator = interaction.user;

    const row = new ActionRowBuilder<ButtonBuilder>();

    for (const [key, value] of Object.entries(options)) {
        row.addComponents(
            new ButtonBuilder()
                .setCustomId(key)
                .setLabel(key)
                .setEmoji(value)
                .setStyle(ButtonStyle.Primary),
        );
    }

    const response = await interaction.editReply({
        content: `${against}, ${initiator} has challenged you to a game of rock paper scissors!`,
        components: [row],
    });

    const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
    });

    if (!collector) {
        await interaction.editReply({
            content: "An error occurred.",
        });
        return;
    }

    const game = new RockPaperScissorsGame(interaction, initiator, against);

    collector.on("collect", async (buttonInteraction) => {
        const id = buttonInteraction.customId as Choice;
        const user = buttonInteraction.user;

        await game.setChoice(user, id, buttonInteraction);

        if (against.bot || against.id === initiator.id) {
            const botChoice = Object.keys(options)[
                Math.floor(Math.random() * 3)
            ] as Choice;

            await game.setChoice(against, botChoice, buttonInteraction);
        }

        if (game.isComplete()) {
            collector.stop();
            await game.finish(buttonInteraction);
            return;
        }

        await buttonInteraction.deferUpdate();
    });
}
};

export default command;
