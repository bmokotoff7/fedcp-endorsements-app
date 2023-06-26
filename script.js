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
    // Decompose message into components
    let messageID = message[0]
    let messageContent = message[1]

    // Create unique like button for this message
    let likeBtn = document.createElement("button")
    likeBtn.className = "message-like-btn"
    likeBtn.id = `like-btn-${messageID}`
    likeBtn.innerText = "Like"
    likeBtn.addEventListener("click", function() {
        console.log(`Liked message ${messageID}`)
    })

    // Create unique delete button for this message
    let deleteBtn = document.createElement("button")
    deleteBtn.className = "message-delete-btn"
    deleteBtn.id = `delete-btn-${messageID}`
    deleteBtn.innerText = "Delete"
    deleteBtn.addEventListener("click", function() {
        let exactLocationOfMessageInDB = ref(database, `messageList/${messageID}`)
        remove(exactLocationOfMessageInDB)
    })

    // Add formatted message to list 
    messageListEl.innerHTML += `
        <li>
            <p>To: </p>
            <p>${messageContent}</p>
            <p>From: </p>
            <div class="message-btns" id="message-btns-${messageID}">
            </div>
        </li>`

    // Add like and delete buttons to the formatted message
    let messageBtnDiv = document.getElementById(`message-btns-${messageID}`)
    messageBtnDiv.append(likeBtn)
    messageBtnDiv.append(deleteBtn)
}