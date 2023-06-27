import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

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
        content: messageInputEl.value,
        likes: 0
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
    let messageLikes = messageObj.likes
    
    // Save message to localStorage if it's not there already (for like feature)
    if (!localStorage.getItem(`${messageID}`)) {
        localStorage.setItem(`${messageID}`, JSON.stringify(false))
    }

    // Create message-div
    const messageDiv = document.createElement("div")
    messageDiv.className = "message-div"
    // Create message div
    const messageEl = document.createElement("div")
    messageEl.className = "message"
    messageEl.innerHTML = `
        <p>To: ${messageTo}</p>
        <p>${messageContent}</p>
        <p>From: ${messageFrom}</p>
    `
    // Create message-btns div
    const messageBtns = document.createElement("div")
    messageBtns.className = "message-btns"
    // Create like-btn
    const likeBtn = document.createElement("button")
    likeBtn.textContent = `Likes: ${messageLikes}`
    likeBtn.addEventListener("click", function() {
        likeMessage(`${messageID}`, messageLikes, likeBtn)
    })
    // Create delete-btn
    const deleteBtn = document.createElement("button")
    deleteBtn.textContent = "Delete"
    deleteBtn.addEventListener("click", function() {
        const exactLocationOfMessageInDB = ref(database, `messageList/${messageID}`)
        remove(exactLocationOfMessageInDB)
        localStorage.removeItem(`${messageID}`)
    })

    // Append like-btn to message-btns div
    messageBtns.append(likeBtn)
    // Append delete-btn to message-btns div
    messageBtns.append(deleteBtn)
    // Append message to message-div
    messageDiv.append(messageEl)
    // Append message-btns to message-div
    messageDiv.append(messageBtns)
    // Append message-div to message-list
    messageListEl.append(messageDiv)
}

function likeMessage(messageID, messageLikes, likeBtn) {
    //console.log(localStorage.getItem(messageID))
    if (JSON.parse(localStorage.getItem(messageID)) === false) {
        messageLikes++
        likeBtn.textContent = `Likes: ${messageLikes}`
        const exactLocationOfMessageInDB = ref(database, `messageList/${messageID}/likes`)
        set(exactLocationOfMessageInDB, messageLikes)
        localStorage.setItem(`${messageID}`, true)
    }
}

