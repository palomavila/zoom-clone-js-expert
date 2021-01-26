const server = require('http').createServer((request, response) => {
  response.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Origin': 'OPTIONS, POST, GET',
  });
  response.end('hey there!');
});

const socketIo = require('socket.io');
const io = socketIo(server, {
  cors: {
    origin: '*',
    credentials: false,
  },
});

 io.on('connection', (socket) => {
   console.log('connection', socket.id);
   socket.on('join-room', (roomId, userId) => {
   
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);
    socket.on('disconnect', () => {
      console.log('disconnected', roomId, userId);
      socket.to(roomId).broadcast.emit('user-disconneected', userId);
    });
  });
});

const startServer = () => {
  const { adress, port } = server.address();
  console.info(`app running at ${adress}:${port}`);
};

server.listen(process.env.PORT || 3000, startServer);
