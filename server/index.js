// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Раздаём статические файлы из папки client
app.use(express.static(path.join(__dirname, '../client')));

// Хранилище игровых комнат в памяти
const rooms = {};

io.on('connection', (socket) => {
  console.log('Игрок подключился:', socket.id);

  // Вход в комнату
  socket.on('join_room', ({ name, roomId }) => {
    socket.join(roomId);
    
    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: [],
        deck: [],
        status: 'waiting'
      };
    }
    
    rooms[roomId].players.push({
      id: socket.id,
      name: name,
      hand: [],
      score: 0,
      status: 'active'
    });
    
    // Отправляем состояние всем в комнате
    io.to(roomId).emit('game_state', rooms[roomId]);
    console.log(`Игрок ${name} вошёл в комнату ${roomId}`);
  });

  // Действие игрока (взять карту или пас)
  socket.on('player_action', ({ action, roomId }) => {
    if (rooms[roomId]) {
      // Тут будет логика игры
      io.to(roomId).emit('game_state', rooms[roomId]);
    }
  });

  // Отключение
  socket.on('disconnect', () => {
    console.log('Игрок отключился:', socket.id);
    // Тут нужно удалить игрока из комнаты
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🎮 Сервер запущен на http://localhost:${PORT}`);
});