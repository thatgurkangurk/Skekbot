import { Events, Message } from "discord.js";
import type { ModuleInterface } from "../Types/module-interface";
import nlp from "compromise";

const HIDDEN_USER_ID = "475851244737396740";

const ALLOWED_ABBREVIATIONS: Record<string, string> = {
	perms: "permissions",
	msgs: "messages",
	imgs: "images",
};

function extractNounsWithCorrectVerb(text: string): string | null {
	const doc = nlp(text);

	// remove pronouns
	doc.match("#Pronoun").remove("#Pronoun");

	// get all nouns
	const nounData = (doc.nouns() as any).json() as {
		text: string;
		isPlural?: boolean;
	}[];
	if (nounData.length === 0) return null;

	// map and clean nouns
	const nouns = nounData
		.map(({ text: phrase }) => {
			// remove a/an/the
			const cleaned = phrase.replace(/\b(a|an|the)\b/gi, "").trim();
			if (!cleaned) return null;

			// pick last word for natural phrasing
			let headNoun = cleaned.split(" ").pop() || cleaned;

			// expand known abbreviations
			headNoun = ALLOWED_ABBREVIATIONS[headNoun.toLowerCase()] || headNoun;

			return headNoun;
		})
		.filter(Boolean);

	if (nouns.length === 0) return null;

	// decide verb: plural if more than 1 noun OR last noun is plural
	const lastNoun = nounData[nounData.length - 1];
	const isPlural = nouns.length > 1 || lastNoun?.isPlural;

	// join nouns naturally
	let nounText: string;
	if (nouns.length === 1) {
		nounText = nouns[0] || "";
	} else if (nouns.length === 2) {
		nounText = `${nouns[0]} and ${nouns[1]}`;
	} else {
		nounText =
			nouns.slice(0, -1).join(", ") + ", and " + nouns[nouns.length - 1];
	}

	return `${nounText} ${isPlural ? "are" : "is"}`;
}

async function onMessage(message: Message) {
	if (message.author.bot) return;

	if (message.author.id !== HIDDEN_USER_ID) return;
	if (Math.random() > 0.1) return;

	const content = message.cleanContent;

	if (!content || content.length < 3) return;

	const noun = extractNounsWithCorrectVerb(message.content);

	if (!noun) return;

	// NOTE: DO NOT FOR THE LOVE OF LINUS TORVALDS ADD IS/ARE BEFORE HIDDEN I SERIOUSLY BEG OF YOU
	// I HAVE SHOT MYSELF IN THE FOOT WITH THIS GOD FORSAKEN FUNCTION TOO MANY TIMES
	// SERIOUSLY
	// amount of times i banged my head in the wall: 34
	await message.reply({
		content: `maybe the ${noun} hidden`,
		allowedMentions: {
			repliedUser: false,
		},
	});
}

const module: ModuleInterface = {
	async load(client) {
		client.on(Events.MessageCreate, onMessage);
	},
	async unload(client) {
		client.off(Events.MessageCreate, onMessage);
	},
};

export default module;
