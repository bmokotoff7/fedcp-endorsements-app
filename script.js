import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://we-are-the-champions-8e273-default-rtdb.firebaseio.com/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const messageListInDB = ref(database, "messageList")

const messageInputEl = document.getElementById("message-input")
const publishBtn = document.getElementById("publish-btn")
const messageListEl = document.getElementById("message-list")

publishBtn.addEventListener("click", function(){
    let messageContent = messageInputEl.value 
    if (messageContent != "") {
        push(messageListInDB, messageContent)
        clearMessageInputEl()
    }
})

onValue(messageListInDB, function(snapshot) {
    if (snapshot.exists()) {
        let messagesArray = Object.entries(snapshot.val())
        clearMessageListEl()
        for (let i = 0; i < messagesArray.length; i++) {
            let currentMessage = messagesArray[i]
            appendMessageToList(currentMessage)
        }
    }
    else {
        messageListEl.innerHTML = "No messages yet"
    }
})

function clearMessageInputEl() {
    messageInputEl.value = ""
}

function clearMessageListEl() {
    messageListEl.innerHTML = ""
}

function appendMessageToList(message) {
    let messageID = message[0]
    let messageContent = message[1]
    let newMessage = document.createElement("li")
    newMessage.textContent = messageContent
    newMessage.addEventListener("dblclick", function() {
        let exactLocationOfMessageInDB = ref(database, `messageList/${messageID}`)
        remove(exactLocationOfMessageInDB)
    })

    messageListEl.append(newMessage)
}