import express from 'express';
import next from 'next';
import serverRouter from './server/main/serverRouter';
import {Server} from 'socket.io';
import {createServer} from 'http';
import { applyOp } from './server/utils/op';
import client from './libs/prismadb';
import getData from './server/utils/getData';

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const app = next({ dev });
const handle = app.getRequestHandler();


const server = express();

app.prepare().then(() => {
    const socketServer = createServer(server);
    const io = new Server(socketServer, {
        path: '/api/sockets/socket.io', // Specify the path for socket.io connections
    });
    io.on('connection', (socket) => {
        console.log('New client connected');
        socket.on('join sheet', (sheetId, userId) =>{
          console.log('user joined', sheetId);
          socket.join(sheetId);
          io.to(sheetId).emit("new-user", userId);
        })
        socket.on('leave sheet', (sheetId, userId) =>{
          console.log('user left', sheetId);
          socket.leave(sheetId);
          io.to(sheetId).emit("remove-user", userId);
        })
      
        socket.on('get-data', async (sheetId) => {
          console.log("get-data", sheetId);
          socket.emit("message", JSON.stringify({ req: "getData", data: await getData(sheetId)}));
        });
      
        socket.on('op', async (sheetId, data) => {
          const msg = JSON.parse(data.toString());
          await applyOp(msg.data);
          // const updatedData = await getData(sheetId);
          // io.to(sheetId).emit('updated-cell', JSON.stringify({ data: updatedData }));
          socket.broadcast.to(sheetId).emit('updated-cell', data);
        });
      
        socket.on('update-sheet-name', async (sheetId, name) => {
          await client.workbook.update({
            where: {
              id: sheetId
            },
            data: {
              name: name
            }
          });
          // const updatedData = await getData(sheetId);
          // io.to(sheetId).emit('updated-cell', JSON.stringify({ data: updatedData }));
          socket.broadcast.to(sheetId).emit('updated-sheet-name', name);
        });
        
      
        // socket.on('get-data', async () => {
        //   socket.emit("message", JSON.stringify({ req: "getData", data: await getData()}));
        // });
      
        // socket.on('op', async (data) => {
        //   const msg = JSON.parse(data.toString());
        //   const workbook = client.workbook.findFirst();
        //   await applyOp(msg.data);
        //   console.log("operation", msg.data);
        //   socket.broadcast.emit('updated-cell', data);
        //   io.emit('updated-cell', data);
        // });
      
        // socket.on('update-cell', async (data) => {
        //   const msg = JSON.parse(data.toString());
        //   if (msg.req === "getData"){
        //     socket.emit("message", JSON.stringify({ req: msg.req, data: await getData()}));
        //     // socket.emit("message", JSON.stringify({ req: "addPresences", data: presences }));
        //   } else if (msg.req === "op") {
        //     console.log("operation", msg.data);
        //     await applyOp(msg.data);
        //     socket.broadcast.emit('updated-cell', data);
        //   } else if (msg.req === "addPresences") {
        //     socket.broadcast.emit('updated-cell', data);
        //     presences = _.differenceBy(presences, msg.data, (v) => v.userId == null ? v.username : v.userId ).concat(msg.data);
        //   } else if (msg.req === "removePresences") {
        //     presences = _.differenceBy(presences, msg.data, (v) => v.userId == null ? v.username : v.userId );
        //     socket.broadcast.emit('updated-cell', data);
        //   }
        //   io.emit('updated-cell', data);
        // });
      
        socket.on('disconnect', (sheetId) => {
          // socket.broadcast.to(sheetId).emit('updated-cell', JSON.stringify({ req: "removePresences", data: presences }));
          console.log('Client disconnected');
      
        });
      });
      
    server.use('/api', serverRouter);
    
    server.all('*', (req, res) => {
        return handle(req, res);
    });
    
    socketServer.listen(port, () => {
        
        console.log(`> Ready on http://localhost:${port}`);
    });
    });