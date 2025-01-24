const socket = io()
let jwtToken = null
let currentRoomName = null
let partnerId = null
let connectedToRoom = false
let fileData = null

// Currently hardcoding the server url
const serverUrl = 'http://localhost:3000'

// Function to hide the token form after submission
function hideTokenForm() {
  const tokenForm = document.querySelector('#tokenForm')
  tokenForm.style.display = 'none'
}

// Function to show an error message
function showError(message) {
  const errorMessageElement = document.createElement('div')
  errorMessageElement.textContent = message
  errorMessageElement.className = 'error-message'
  document.body.appendChild(errorMessageElement)
  console.error(message)
}

function appendMessage(message) {
  const messagesList = document.querySelector('#messages')
  const li = document.createElement('li')
  li.textContent = message
  messagesList.appendChild(li)
}

document.addEventListener('DOMContentLoaded', function () {
  const acceptButton = document.querySelector('#acceptButton')
  const rejectButton = document.querySelector('#rejectButton')

  acceptButton.addEventListener('click', function () {
    // Emit an acceptance response to the server
    socket.emit('privateRoomAccept', { roomName: currentRoomName })
    hideConnectionButtons()
  })

  rejectButton.addEventListener('click', function () {
    // Emit a rejection response to the server
    socket.emit('privateRoomReject', { roomName: currentRoomName })
    hideConnectionButtons()
    appendMessage('We are looking for another partner')
  })

  const acceptFriendButton = document.querySelector('#acceptFriendButton')
  const rejectFriendButton = document.querySelector('#rejectFriendButton')

  acceptFriendButton.addEventListener('click', function () {
    // Emit an acceptance response for friend request to the server
    socket.emit('friendRequestAccept', { otherUserId: partnerId })
    hideFriendRequestButtons()
    appendMessage('You have accepted the friend request')
  })

  rejectFriendButton.addEventListener('click', function () {
    // Emit a rejection response for friend request to the server
    socket.emit('friendRequesReject', { otherUserId: partnerId })
    hideFriendRequestButtons()
    appendMessage('You have rejected the friend request')
  })
})

document.querySelector('#tokenForm').addEventListener('submit', (event) => {
  event.preventDefault()

  const tokenInput = document.querySelector('#tokenInput')
  jwtToken = tokenInput.value // Save the entered JWT token in memory

  // Send a connection request with the token to the server
  socket.io.opts.query = { token: jwtToken }

  socket.on('message', (message) => {
    appendMessage(message)
  })

  // Receiving media messages
  socket.on('mediaMessage', ({ message, file }) => {
    appendMessage(`Uploaded file: ${file}`)
    appendMessage(message)
  })

  // Search for a user
  socket.on('privateRoomRequest', ({ roomName, message }) => {
    // Save the room name
    currentRoomName = roomName
    showConnectionButtons()
    appendMessage(message)
  })

  // Other user rejected
  socket.on('privateRoomRejected', ({ message }) => {
    currentRoomName = null
    appendMessage(message)
    hideConnectionButtons()
  })

  // Other user accepeted
  socket.on('privateRoomConnect', ({ otherUserId, roomName, message }) => {
    connectedToRoom = true
    partnerId = otherUserId
    currentRoomName = roomName
    showMessageForm()
    showFileUploadForm()
    showFriendRequestForm()
    showLeaveRoomForm()
    appendMessage(message)
  })

  // Friend request received
  socket.on('receiveFriendRequest', ({ message }) => {
    showFriendRequestButtons()
    appendMessage(message)
  })

  // friend request accepted
  socket.on('friendRequestAccepted', ({ message }) => {
    appendMessage(message)
  })

  // friend request rejected
  socket.on('friendRequesRejected', ({ message }) => {
    appendMessage(message)
  })

  // error encounted in friend request flow
  socket.on('friendRequesError', ({ message }) => {
    console.log(message)
    showError(message)
  })

  // othe user left the room
  socket.on('partnerLeft', (message) => {
    showRoomSearchForm()
    hideLeaveRoomForm()
    hideFriendRequestForm()
    hideMessageForm()
    hideFileUploadForm()
    appendMessage(message)
  })

  socket.on('connect_error', (error) => {
    connectedToRoom = false
    showError(error.message)
  })

  socket.on('error', (error) => {
    connectedToRoom = false
    showError(error)
  })

  socket.on('disconnect', () => {
    connectedToRoom = false
    console.log('Disconnected from the server')
  })

  socket.connect() // Establish the connection with the server

  hideTokenForm() // Hide the token form after successful connection
  showRoomSearchForm() // Show room search form
})

document.querySelector('#messageForm').addEventListener('submit', (event) => {
  event.preventDefault() // Prevent the default form submission behavior

  const input = document.querySelector('#input')
  const message = input.value.trim()

  if (message) {
    socket.emit('sendMessage', {
      roomName: currentRoomName,
      message,
      file: fileData
    })
    input.value = '' // Clear the input field
    // Clear file data if any
    fileData = null
  }
})

function showConnectionButtons() {
  const connectionRequestContainer = document.querySelector(
    '#connectionRequestContainer'
  )
  connectionRequestContainer.style.display = 'block'
}

function hideConnectionButtons() {
  const connectionRequestContainer = document.querySelector(
    '#connectionRequestContainer'
  )
  connectionRequestContainer.style.display = 'none'
}

// Event listener for File Upload Form
document
  .querySelector('#fileUploadForm')
  .addEventListener('submit', function (event) {
    event.preventDefault() // Prevent the default form submission behavior

    const fileInput = document.querySelector('#fileInput')
    const file = fileInput.files[0]

    if (connectedToRoom && file) {
      uploadFile(file)
    } else {
      showError('Not connected to a room or invalid file')
    }
    fileInput.value = null
  })

// Function to handle file upload using Fetch API
function uploadFile(file) {
  const formData = new FormData()
  formData.append('media', file)

  fetch(`${serverUrl}/media/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwtToken}`
    },
    body: formData
  })
    .then((response) => response.json())
    .then((data) => {
      fileData = data
      console.log('File upload successful:', data)
      appendMessage('File uploaded! Write a message and hit send to send it')
    })
    .catch((error) => {
      console.error('File upload failed:', error)
      showError('File upload failed')
    })
}

// Event listener for leaving the room
document
  .querySelector('#leaveRoomForm')
  .addEventListener('submit', function (event) {
    event.preventDefault() // Prevent the default form submission behavior

    if (connectedToRoom) {
      socket.emit('privateRoomLeft', { roomName: currentRoomName })
      connectedToRoom = false
      appendMessage(`You have left the room: ${currentRoomName}`)
    }

    showRoomSearchForm()
    hideLeaveRoomForm()
    hideFriendRequestForm()
    hideMessageForm()
    hideFileUploadForm()
  })

function showLeaveRoomForm() {
  const leaveRoomForm = document.querySelector('#leaveRoomForm')
  leaveRoomForm.style.display = 'block'
}

function hideLeaveRoomForm() {
  const leaveRoomForm = document.querySelector('#leaveRoomForm')
  leaveRoomForm.style.display = 'none'
}

document
  .querySelector('#friendRequestForm')
  .addEventListener('submit', function (event) {
    event.preventDefault() // Prevent the default form submission behavior

    if (partnerId) {
      socket.emit('sendFriendRequest', { otherUserId: partnerId })
    }
  })

function hideFriendRequestForm() {
  const friendRequestForm = document.querySelector('#friendRequestForm')
  friendRequestForm.style.display = 'none'
}

function showFriendRequestForm() {
  const friendRequestForm = document.querySelector('#friendRequestForm')
  friendRequestForm.style.display = 'block'
}

function hideFriendRequestButtons() {
  const friendRequestContainer = document.querySelector(
    '#friendRequestContainer'
  )
  friendRequestContainer.style.display = 'none'
}

function showFriendRequestButtons() {
  const friendRequestContainer = document.querySelector(
    '#friendRequestContainer'
  )
  friendRequestContainer.style.display = 'block'
}

document
  .querySelector('#roomSearchForm')
  .addEventListener('submit', (event) => {
    event.preventDefault() // Prevent the default form submission behavior

    const input = document.querySelector('#roomNameInput')
    const roomName = input.value.trim()

    socket.emit('searchRoom', {
      roomName: roomName
    })
    hideRoomSearchForm()
  })

function hideRoomSearchForm() {
  const roomSearchForm = document.querySelector('#roomSearchForm')
  roomSearchForm.style.display = 'none'
}

function showRoomSearchForm() {
  const roomSearchForm = document.querySelector('#roomSearchForm')
  roomSearchForm.style.display = 'block'
}

function showMessageForm() {
  const messageForm = document.querySelector('#messageForm')
  messageForm.style.display = 'block'
}

function showFileUploadForm() {
  const fileUploadForm = document.querySelector('#fileUploadForm')
  fileUploadForm.style.display = 'block'
}

function hideMessageForm() {
  const messageForm = document.querySelector('#messageForm')
  messageForm.style.display = 'none'
}

function hideFileUploadForm() {
  const fileUploadForm = document.querySelector('#fileUploadForm')
  fileUploadForm.style.display = 'none'
}
