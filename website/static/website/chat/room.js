document.addEventListener("DOMContentLoaded", () => {
    const chatId = JSON.parse(document.getElementById('chat-id').textContent);
    const userId = JSON.parse(document.getElementById('user-id').textContent);

    const chatSocket = new WebSocket(
        'ws://'
        + window.location.host
        + ":6379"
        + '/ws/chat/'
        + chatId
        + '/'
    );

    //load the previous messages
    chatSocket.onopen = (e) => {
        chatSocket.send(JSON.stringify({
            'type': 'load',
            'chatId': chatId,
            'userId': userId
        }));
    };

    //got a message, put in the textarea
    chatSocket.onmessage = (e) => {
        let data = JSON.parse(e.data);

        chatLog = document.querySelector('#chat-log');

        for (const message of data.messages) {

            let messagePosition = "right";

            //see if the message goes in the left or right
            if (message["sender"]["id"] === userId) {
                //means the user sending is the client
                messagePosition = "left";
            }

            let messageElement = /*html*/`
                <div class="row">
                    <div class="message ${messagePosition == "left" ? "ml-auto" : ""}">
                        <div>${message["sender"]["username"]}</div>
                        <div>${message["content"]}</div>
                        <div>${message["timestamp"]}</div>
                    </div>
                </div>
            `;
            chatLog.innerHTML += messageElement;
        }

        let senderOfLastMessage = data.messages[data.messages.length - 1]["sender"]["id"];

        if (data.type === "load"
            || senderOfLastMessage === userId
            || (window.innerHeight + window.scrollY) >= document.body.offsetHeight / 1.25) {

            /*scroll to bottom if: 
                its loading
                the user just sent a message 
                received a message and is close to the bottom of the page*/

            window.scrollTo(0, document.body.scrollHeight);
        }
    };

    chatSocket.onerror = (e) => {
        console.log("self.socket error", e);
    };

    chatSocket.onclose = (e) => {
        console.log("self.socket event.type", e.type);
    };

    document.querySelector('#chat-message-input').focus();

    document.querySelector('#chat-message-input').onkeyup = (e) => {
        if (e.keyCode === 13) {
            //means user clicked enter
            document.querySelector('#chat-message-submit').click();
        }
    };

    document.querySelector('#chat-message-submit').onclick = (e) => {
        let messageInputDom = document.querySelector('#chat-message-input');

        let message = messageInputDom.value;

        //send the message
        chatSocket.send(JSON.stringify({
            'type': "send",
            'message': message
        }));

        //clear input field
        messageInputDom.value = '';
    };
});