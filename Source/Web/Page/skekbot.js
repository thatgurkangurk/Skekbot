/* eslint-disable no-undef */

const messageArea = document.getElementById("message-box");
const sendButton = document.getElementById("message-button");
const channelInput = document.getElementById("channel-input");

sendButton.onclick = async () => {
	const response = await fetch("send-message", {
		body: JSON.stringify({
			channelId: channelInput.value,
			message: messageArea.value,
		}),
		headers: {
			"Content-Type": "application/json",
		},
		method: "POST",
	});

	const output = await response.text();
	alert(output);
};
