const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words');
const {createMessage, createLocationMessage} = require('./utils/message')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))


io.on('connection', (socket)=>{

        socket.on('join', (options, callback)=> {
            const {error, user} = addUser({id: socket.id, ...options})
            if(error){
                return callback(error)
            }
            socket.join(user.room)
            socket.emit('message', createMessage('Admin','Welcome!'))
            socket.broadcast.to(user.room).emit('message', createMessage('Admin',`${user.username} has joined!`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
            callback()
        })


    socket.on('sendMessage', (message, callback)=> {
        const filter = new Filter()
        if (filter.isProfane(message)){
            return callback('Profanity detected')
        }
        const user = getUser(socket.id)
        io.to(user.room).emit('message', createMessage(user.username, message), )
        callback()
    })

    socket.on('disconnect', ()=> {
        const user = removeUser(socket.id)
        if (user) {
            io.emit('message', createMessage('Admin',`${user.username} has left.`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
    
    socket.on('shareLocation', (location, callback)=> {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', createLocationMessage(user.username, location))
        callback('Your location has been shared')
    })
})

server.listen(port,()=>{
    console.log('Server is up on port '+ port);   
})

