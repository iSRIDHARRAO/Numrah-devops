import logger from '../shared/logger.js'
import { insertMessage } from '../model/message.js'
import { areUsersFriends, insertFriendData } from '../model/friend.js'
import _ from 'lodash'

// Maintain a list of online users
const onlineUsers = {}
// Maintain a set of waiting users
let waitingUsers = new Set()
// Status of the room - to handle accept/reject connection
// null - none of the user have responsed
// true - one of the user accepted
// false - one of the user rejected
const roomStatus = {}
// User to room and room to user mapping
const userToRoom = {}
const roomToUsers = {}
// user id to username mapping
const userToDisplayName = {}
// Friend Waiting room - room with only one user waiting for his friend
const friendWaitingRoom = {}

const handleConnection = (socket, io) => {
  const userId = socket.decoded.userId
  const userName = socket.decoded.displayName
  // Keep track of the user's display name
  userToDisplayName[userId] = userName

  // Add the user to the list of online users
  onlineUsers[userId] = socket

  logger.info(`User connected: ${userId}`)

  // Listen for incoming messages from the client
  socket.on('sendMessage', ({ roomName, message, file }) => {
    // Handle incoming messages and broadcast to the users in the room
    if (file) {
      io.to(roomName).emit('mediaMessage', {
        message: `${userName}: ${message}`,
        file: file.file_path
      })
    } else {
      io.to(roomName).emit('message', `${userName}: ${message}`)
    }
    insertMessage(message, userId, roomName, file)
  })

  socket.on('searchRoom', ({ roomName }) => {
    // The user wants to connect to specefic room
    if (roomName) {
      // There is already a friend waiting for user
      if (friendWaitingRoom[roomName]) {
        const otherUserId = friendWaitingRoom[roomName]

        const socket1 = onlineUsers[userId]
        const socket2 = onlineUsers[otherUserId]

        // Join users to the private room
        socket1.join(roomName)
        socket2.join(roomName)

        // initial value of roomStatus: null (pending response)
        roomStatus[roomName] = null
        roomToUsers[roomName] = [otherUserId, userId]

        delete friendWaitingRoom[roomName]

        // Broadcast a message to the room
        io.to(socket1.id).emit('privateRoomConnect', {
          otherUserId: otherUserId,
          roomName,
          message: `You are now connected in a private room: ${roomName}!`
        })
        io.to(socket2.id).emit('privateRoomConnect', {
          otherUserId: userId,
          roomName,
          message: `You are now connected in a private room: ${roomName}!`
        })
      } else {
        // Current user is the first person to join the room
        friendWaitingRoom[roomName] = userId
        io.to(onlineUsers[userId].id).emit(
          'message',
          `Welcome, ${userName}! We are waiting for your friend to join`
        )
      }
    } else {
      // The user wants to connect with random users
      // Add the user to the waiting list
      waitingUsers.add(userId)

      // Send a welcome message to the connected user
      io.to(onlineUsers[userId].id).emit(
        'message',
        `Welcome, ${userName}! We are searching for potential friends....`
      )

      // Randomly connect two users into a private room
      connectRandomUsers(io)
    }
  })

  // Listen for private room accept event
  socket.on('privateRoomAccept', ({ roomName }) => {
    if (roomStatus[roomName] === true) {
      // If the other user already accepted
      // keep track of users and their room
      userToRoom[userId] = roomName
      const users = roomToUsers[roomName]
      // emit event - both the users are connected
      io.to(onlineUsers[users[0]].id).emit('privateRoomConnect', {
        otherUserId: users[1],
        roomName,
        message: `You are now connected in a private room: ${roomName}!`
      })
      io.to(onlineUsers[users[1]].id).emit('privateRoomConnect', {
        otherUserId: users[0],
        roomName,
        message: `You are now connected in a private room: ${roomName}!`
      })
    } else if (roomStatus[roomName] === false) {
      // If the other user already rejected
      // Add current user to the waiting list
      waitingUsers.add(userId)
      // clear the roomStatus and user/room mappings
      delete roomStatus[roomName]
      delete userToRoom[userId]
      delete roomToUsers[roomName]
      // Emit event to inform them about request rejection
      io.to(onlineUsers[userId].id).emit(
        'privateRoomRejected',
        'The request was rejected, we will find you a new partner'
      )
      // Connect 2 random users
      connectRandomUsers(io)
    } else {
      // If the current user is the first to accept
      // Update status to mark the acceptance given by one of the users
      roomStatus[roomName] = true
      // Update mapping as it will be required later
      userToRoom[userId] = roomName
      // Emit event to inform the user about status of the other partner
      io.to(onlineUsers[userId].id).emit(
        'message',
        'Waiting for your partner to accept.'
      )
    }
  })

  // Listen for private room reject event
  socket.on('privateRoomReject', ({ roomName }) => {
    if (roomStatus[roomName] === false) {
      // If the other user already rejected
      // Add current user in the waiting list
      waitingUsers.add(userId)
      // clear the roomStatus and user/room mappings
      delete roomStatus[roomName]
      delete userToRoom[userId]
      delete roomToUsers[roomName]
      // Connect 2 random users
      connectRandomUsers(io)
    } else if (roomStatus[roomName] === true) {
      // If the other user already accepted
      // Add both the users in the waiting list
      const users = roomToUsers[roomName]
      const otherUserId = users[0] === userId ? users[1] : users[0]
      waitingUsers.add(users[0])
      waitingUsers.add(users[1])
      // clear the roomStatus and user/room mappings
      delete roomStatus[roomName]
      delete userToRoom[users[0]]
      delete userToRoom[users[1]]
      delete roomToUsers[roomName]

      // Emit event to inform the user about current status
      io.to(onlineUsers[otherUserId].id).emit('privateRoomRejected', {
        message: 'The request was rejected, we will find you a new partner'
      })
      // Connect 2 random users
      connectRandomUsers(io)
    } else {
      // If the current user is the first to reject
      // Update status to mark the rejection given by one of the users
      roomStatus[roomName] = false
      // Add current user in the waiting list
      waitingUsers.add(userId)
      // clear the user/room mapping
      delete userToRoom[userId]
      // Connect 2 random users
      connectRandomUsers(io)
    }
  })

  // Listen for private room left event
  socket.on('privateRoomLeft', ({ roomName }) => {
    // Get both the users
    const users = roomToUsers[roomName]
    // clear the roomStatus and user/room mappings
    delete roomStatus[roomName]
    delete userToRoom[users[0]]
    delete userToRoom[users[1]]
    delete roomToUsers[roomName]

    const otherUserId = users[0] === userId ? users[1] : users[0]
    // Emit event to inform the user about current status
    io.to(onlineUsers[otherUserId].id).emit(
      'partnerLeft',
      'Your partner left, you can search again for a new partner'
    )
  })

  // Listen for send friend request event
  socket.on('sendFriendRequest', async ({ otherUserId }) => {
    // Check whether they are already friends
    try {
      const isFriend = await areUsersFriends(userId, otherUserId)
      if (!isFriend) {
        io.to(onlineUsers[otherUserId].id).emit('receiveFriendRequest', {
          message: `${userToDisplayName[userId]} have send you a friend request`
        })
      } else {
        io.to(onlineUsers[userId].id).emit('friendRequesError', {
          message: 'Both of you are already friends'
        })
      }
    } catch (error) {
      io.to(onlineUsers[userId].id).emit('friendRequesError', {
        message: error?.message
      })
    }
  })

  socket.on('friendRequestAccept', async ({ otherUserId }) => {
    try {
      await insertFriendData(userId, otherUserId, userToRoom[userId])
      io.to(onlineUsers[otherUserId].id).emit('friendRequestAccepted', {
        message: `${userToDisplayName[userId]} have accepted your friend request`
      })
    } catch (error) {
      io.to(onlineUsers[userId].id).emit('friendRequesError', {
        message: error?.message
      })
    }
  })

  socket.on('friendRequesReject', ({ otherUserId }) => {
    // Emit event to inform the user about current status
    io.to(onlineUsers[otherUserId].id).emit('friendRequesRejected', {
      message: `${userToDisplayName[userId]} have rejected your friend request`
    })
  })

  // Handle errors on the socket
  socket.on('error', (error) => {
    logger.error(`Socket error for ${userId}: ${error.message}`)
    socket.emit('error', 'An error occurred on the server. Please try again.')
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    // Remove the user from the list of online users
    delete onlineUsers[userId]
    delete userToDisplayName[userId]

    const roomName = userToRoom[userId]
    // If the room name is present then the user was present in the room
    if (roomName) {
      // Get the other user id
      const users = roomToUsers[roomName]
      const otherUserId = users[0] === userId ? users[1] : users[0]
      // clear the roomStatus and user/room mappings
      delete roomStatus[roomName]
      delete userToRoom[userId]
      delete userToRoom[otherUserId]
      delete roomToUsers[roomName]

      // Inform the other user about disconnection
      io.to(onlineUsers[otherUserId].id).emit(
        'message',
        'Your partner is disconnected, we will find you a new one'
      )

      // Add the other user to the waiting list
      waitingUsers.add(otherUserId)
      // Connect 2 random users
      connectRandomUsers(io)
    } else {
      // Delete the user from the waiting list
      waitingUsers.delete(userId)
    }

    // Handle disconnect logic
    logger.info(`User disconnected: ${userId}`)
  })
}

function connectRandomUsers(io) {
  if (waitingUsers.size >= 2) {
    // Randomly select two users
    const [user1, user2] = _.sampleSize([...waitingUsers], 2)

    // Create a unique room name
    const roomName = `${userToDisplayName[user1]}-${userToDisplayName[user2]}`

    const socket1 = onlineUsers[user1]
    const socket2 = onlineUsers[user2]

    // Join users to the private room
    socket1.join(roomName)
    socket2.join(roomName)

    // delete the user from waiting list
    waitingUsers.delete(user1)
    waitingUsers.delete(user2)

    // initial value of roomStatus: null (pending response)
    roomStatus[roomName] = null
    roomToUsers[roomName] = [user1, user2]

    // Broadcast a message to the room
    io.to(roomName).emit('privateRoomRequest', {
      roomName,
      message: `We found a match. Here's your private room: ${roomName}!`
    })
  }
}

export { handleConnection }
