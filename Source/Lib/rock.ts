import {
	MessageFlags,
	type ButtonInteraction,
	type ChatInputCommandInteraction,
	type User,
} from "discord.js";

export const options = {
	Rock: "🪨",
	Paper: "📄",
	Scissors: "✂️",
} as const;

export type Choice = keyof typeof options;

const beats: Record<Choice, Choice> = {
	Rock: "Scissors",
	Paper: "Rock",
	Scissors: "Paper",
};

export class RockPaperScissorsGame {
	private interaction: ChatInputCommandInteraction;
	private user1: User;
	private user2: User;

	private choices = new Map<string, Choice>();

	constructor(
		interaction: ChatInputCommandInteraction,
		user1: User,
		user2: User,
	) {
		this.interaction = interaction;
		this.user1 = user1;
		this.user2 = user2;
	}

	async setChoice(
		user: User,
		choice: Choice,
		buttonInteraction: ButtonInteraction,
	) {
		if (user.id !== this.user1.id && user.id !== this.user2.id) {
			return buttonInteraction.reply({
				content: "You aren't a part of this battle!",
				flags: [MessageFlags.Ephemeral],
			});
		}

		this.choices.set(user.id, choice);
	}

	isComplete() {
		return this.choices.has(this.user1.id) && this.choices.has(this.user2.id);
	}

	private getChoice(user: User) {
		return this.choices.get(user.id)!;
	}

	async finish(buttonInteraction: ButtonInteraction) {
		const c1 = this.getChoice(this.user1);
		const c2 = this.getChoice(this.user2);

		const message = await this.interaction.fetchReply();
		await message.edit({ components: [] });

		let outcome: string;
		const losers: User[] = [];

		if (c1 === c2) {
			outcome = "It's a tie!";
			if (this.user1.id === this.user2.id) {
				outcome = "You played yourself and tied!";
				losers.push(this.user1);
			} else {
				losers.push(this.user1, this.user2);
			}
		} else if (beats[c1] === c2) {
			outcome =
				this.user1.id === this.user2.id
					? "You played yourself and won!"
					: `${this.user1} wins!`;

			if (this.user1.id !== this.user2.id) losers.push(this.user2);
		} else {
			outcome =
				this.user1.id === this.user2.id
					? "You played yourself and lost!"
					: `${this.user2} wins!`;

			if (this.user1.id !== this.user2.id) losers.push(this.user1);
		}

		const guild = buttonInteraction.guild;

		if (guild) {
			for (const loser of losers) {
				if (loser.id === buttonInteraction.client.user?.id) continue;

				try {
					const member = await guild.members.fetch(loser.id);
					await member.timeout(60000, "Loser!");
				} catch {}
			}
		}

		await buttonInteraction.reply({
			content: `${this.user1} chose ${c1}.\n${this.user2} chose ${c2}.\n\n${outcome}`,
		});
	}
}
