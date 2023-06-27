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

let myAuthoredMessages = []
const myAuthoredMessagesInLS = JSON.parse(localStorage.getItem("myAuthoredMessages"))

// Get my authored messages from Local Storage
if (myAuthoredMessagesInLS) {
    myAuthoredMessages = myAuthoredMessagesInLS
}

// Adds message to the database
publishBtn.addEventListener("click", function(snapshot) {
    let messageObj = {
        to: messageToInputEl.value,
        from: messageFromInputEl.value,
        content: messageInputEl.value,
        likes: 0
    }
    if (messageObj.to != "" && messageObj.from != "" && messageObj.content != "") {
        let myMessage = push(messageListInDB, messageObj)
        let id = myMessage.key
        
        myAuthoredMessages.push(id)
        localStorage.setItem("myAuthoredMessages", JSON.stringify(myAuthoredMessages))
        
        // Makes delete button appear immediately after the message is published
        let messageBtnsDiv = document.getElementById(`message-btns-${id}`)
        for (let i = 0; i < myAuthoredMessages.length; i++) {
            if (myAuthoredMessages[i] === id) {
                // Create delete-btn
                const deleteBtn = createDeleteBtn(id, myAuthoredMessages)
                // Append delete-btn to message-btns div
                messageBtnsDiv.append(deleteBtn)
            }
        }

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
        const messageInLS = {}
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
    messageBtns.id = `message-btns-${messageID}`
    // Create like-btn
    const likeBtn = document.createElement("button")
    likeBtn.textContent = `Likes: ${messageLikes}`
    likeBtn.addEventListener("click", function() {
        likeMessage(`${messageID}`, messageLikes, likeBtn)
    })
    // Append like-btn to message-btns div
    messageBtns.append(likeBtn)

    // Makes delete button appear everytime the message list is refreshed
    for (let i = 0; i < myAuthoredMessages.length; i++) {
        if (myAuthoredMessages[i] === messageID) {
            // Create delete-btn
            const deleteBtn = createDeleteBtn(messageID, myAuthoredMessages)
            // Append delete-btn to message-btns div
            messageBtns.append(deleteBtn)
        }
    }
    
    // Append message to message-div
    messageDiv.append(messageEl)
    // Append message-btns to message-div
    messageDiv.append(messageBtns)
    // Append message-div to message-list
    messageListEl.append(messageDiv)
}

function likeMessage(messageID, messageLikes, likeBtn) {
    if (JSON.parse(localStorage.getItem(messageID)) === false) {
        messageLikes++
        likeBtn.textContent = `Likes: ${messageLikes}`
        const exactLocationOfMessageInDB = ref(database, `messageList/${messageID}/likes`)
        set(exactLocationOfMessageInDB, messageLikes)
        localStorage.setItem(`${messageID}`, true)
    }
}

function createDeleteBtn(messageID, myAuthoredMessages) {
    const deleteBtn = document.createElement("button")
    deleteBtn.textContent = "Delete"
    deleteBtn.addEventListener("click", function() {
        deleteMessage(messageID, myAuthoredMessages)
    })
    return deleteBtn
}

function deleteMessage(messageID, myAuthoredMessages) {
    const exactLocationOfMessageInDB = ref(database, `messageList/${messageID}`)
    remove(exactLocationOfMessageInDB)
    localStorage.removeItem(`${messageID}`)
    for (let i = 0; i < myAuthoredMessages.length; i++) {
        if (myAuthoredMessages[i] === messageID) {
            myAuthoredMessages.splice(i, 1)
            localStorage.setItem("myAuthoredMessages", JSON.stringify(myAuthoredMessages))
        }
    }
}