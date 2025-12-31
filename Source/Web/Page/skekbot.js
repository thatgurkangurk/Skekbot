/* eslint-disable no-undef */
// @ts-check

const messageArea = /** @type {HTMLTextAreaElement | null} */ (
	document.getElementById("message-box")
);

const sendButton = /** @type {HTMLInputElement | null} */ (
	document.getElementById("message-button")
);

const channelInput = /** @type {HTMLInputElement | null} */ (
	document.getElementById("channel-input")
);

const replyInput = /** @type {HTMLInputElement | null} */ (
	document.getElementById("reply-input")
);

const webTokenInput = /** @type {HTMLInputElement | null} */ (
	document.getElementById("web-token")
);

sendButton?.addEventListener("click", async () => {
	if (!channelInput || !messageArea || !replyInput || !webTokenInput) {
		console.warn("some input is missing!");
		return;
	}

	const response = await fetch("send-message", {
		body: JSON.stringify({
			channelId: channelInput.value,
			message: messageArea.value,
			replyToId: replyInput.value,
		}),
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${webTokenInput.value}`
		},
		method: "POST",
	});

	const output = await response.text();
	alert(output);
});
