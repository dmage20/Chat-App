const createMessage = (username, text) =>{
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const createLocationMessage = (username, position) => {
    return {
        username,
        url: `https://google.com/maps?q=${position.lat},${position.lon}`,
        createdAt: new Date().getTime()
    }
}

module.exports = { createMessage, createLocationMessage}