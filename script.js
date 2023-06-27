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
        // let messagesArray = Object.entries(snapshot.val())
        // clearMessageListEl()
        // for (let i = 0; i < messagesArray.length; i++) {
        //     let currentMessage = messagesArray[i]
        //     appendMessageToList(currentMessage)
        // }
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

// TO-DO: fix how message appears here. Shows correctly in DB, but appears as an object on message cards
function appendMessageToList(message) {
    // Decompose message into components
    let messageID = message[0]
    let messageTo = message[1].to
    let messageFrom = message[1].from
    let messageContent = message[1].content

    // Create unique like button for this message
    let likeBtn = document.createElement("button")
    likeBtn.className = "message-like-btn"
    likeBtn.id = `like-btn-${messageID}`
    likeBtn.innerText = "Like"
    likeBtn.addEventListener("click", function() {
        console.log(`Liked message ${messageID}`)
    })

    // TO-DO: look into odd behavior after fixing how messages display (delete button only working on newest entry)
    // Create unique delete button for this message
    let deleteBtn = document.createElement("button")
    deleteBtn.className = "message-delete-btn"
    deleteBtn.id = `delete-btn-${messageID}`
    deleteBtn.innerText = "Delete"
    deleteBtn.addEventListener("click", function() {
        //let exactLocationOfMessageInDB = ref(database, `messageList/${messageID}`)
        //remove(exactLocationOfMessageInDB)
        console.log(`Deleted message ${messageID}`)
    })

    // Add formatted message to list 
    messageListEl.innerHTML += `
        <li>
            <p>To: ${messageTo}</p>
            <p>${messageContent}</p>
            <p>From: ${messageFrom}</p>
            <div class="message-btns" id="message-btns-${messageID}">
            </div>
        </li>`

    // Add like and delete buttons to the formatted message
    let messageBtnDiv = document.getElementById(`message-btns-${messageID}`)
    messageBtnDiv.append(likeBtn)
    messageBtnDiv.append(deleteBtn)
}