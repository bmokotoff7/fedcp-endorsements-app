import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://we-are-the-champions-8e273-default-rtdb.firebaseio.com/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const messageListInDB = ref(database, "messageList")

const messageToInputEl = document.getElementById("message-to")
const messageFromInputEl = document.getElementById("message-from")
const messageInputEl = document.getElementById("message-input")
const publishBtn = document.getElementById("publish-btn")
const messageListEl = document.getElementById("message-list")

// Adds message to the database
publishBtn.addEventListener("click", function() {
    let messageObj = {
        to: messageToInputEl.value,
        from: messageFromInputEl.value,
        content: messageInputEl.value
    }
    if (messageObj.to != "" && messageObj.from != "" && messageObj.content != "") {
        push(messageListInDB, messageObj)
        clearMessageInputFields()
    }
})

// Updates the message list when the database is modified
onValue(messageListInDB, function(snapshot) {
    if (snapshot.exists()) {
        let messagesArray = Object.entries(snapshot.val())
        // FORMAT: [[messageID, {content, from, to}]]
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

function clearMessageInputFields() {
    messageToInputEl.value = ""
    messageFromInputEl.value = ""
    messageInputEl.value = ""
}

function clearMessageListEl() {
    messageListEl.innerHTML = ""
}

function appendMessageToList(message) {
    // Decompose message into components
    const messageID = message[0]
    const messageObj = message[1]
    const messageTo = messageObj.to
    const messageFrom = messageObj.from
    const messageContent = messageObj.content

    // Create message-div
    const messageDiv = document.createElement("div")
    messageDiv.className = "message-div"
    // Create message
    const messageEl = document.createElement("div")
    messageEl.className = "message"
    messageEl.innerHTML = `
        <p>To: ${messageTo}</p>
        <p>${messageContent}</p>
        <p>From: ${messageFrom}</p>
    `
    // Create message-btns
    const messageBtns = document.createElement("div")
    messageBtns.className = "message-btns"
    // Create delete-btn
    const deleteBtn = document.createElement("button")
    deleteBtn.textContent = "Delete"
    deleteBtn.addEventListener("click", function() {
        const exactLocationOfMessageInDB = ref(database, `messageList/${messageID}`)
        remove(exactLocationOfMessageInDB)
    })

    // Append delete-btn to message-btns div
    messageBtns.append(deleteBtn)
    // Append message to message-div
    messageDiv.append(messageEl)
    // Append message-btns to message-div
    messageDiv.append(messageBtns)
    // Append message-div to message-list
    messageListEl.append(messageDiv)
}

