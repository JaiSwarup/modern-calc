import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import Clerk, { clerkClient } from '@clerk/clerk-sdk-node';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:4173", "https://modern-calc.onrender.com"],
    methods: ["GET", "POST"],
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('update-cell', (data) => {
    // Emit the cell update to all connected clients except the sender
    socket.broadcast.emit('updated-cell', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});
app.post('/auth/clerk', async (req, res) => {
  try {
    // console.log(req.body)
    console.log(req.body.data)
    if (req.body.type === 'user.created'){
      const { id, email_addresses } = req.body.data;
      const user = await prisma.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0].email_address,
        },
      });
      res.status(200).json({ message: 'User authenticated', user });
    } else if (req.body.type === 'user.updated'){
      const { id, email_addresses } = req.body.data;
      const user = await prisma.user.findFirst({
        where: { clerkId: id },
      })
      if (!user){
        return res.status(400).json({ message: 'User not found' });
      }
      await prisma.user.update({
        where: { clerkId: id },
        data: { email: email_addresses[0].email_address },
      });
      res.status(200).json({ message: 'User authenticated', user });
    } else if (req.body.type === 'user.deleted'){
      const { id } = req.body.data;
      const user = await prisma.user.findFirst({
        where: { clerkId: id },
      })
      if (!user){
        return res.status(400).json({ message: 'User not found' });
      } else {
        await prisma.user.delete({
          where: { clerkId: id },
        });
      }
      res.status(200).json({ message: 'User deleted' });
    }
  } catch (error: any) {
    console.log("Error occured",error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/worksheets', async (req, res) => {
  try {
    const { userId, title, content } = req.body;

    const user = await prisma.user.findUnique({
      where: { clerkId: String(userId) },
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const workbook = await prisma.worksheet.create({
      data: {
        title,
        content : JSON.stringify([[]]),
        userId: user.id,
      },
    });

    res.status(201).json(workbook);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/worksheets', async (req, res) => {
  try {
    const { userId } = req.query;

    const user = await prisma.user.findUnique({
      where: { clerkId: String(userId) },
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const workbooks = await prisma.worksheet.findMany({
      where: { userId: user.id },
    });

    res.status(200).json(workbooks);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/worksheets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const workbook = await prisma.worksheet.findUnique({
      where: { id },
    });

    if (!workbook) {
      return res.status(404).json({ message: 'Workbook not found' });
    }

    res.status(200).json(workbook);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/worksheets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, data, changeTitle } = req.body;

    if (changeTitle){
      await prisma.worksheet.update({
        where: { id },
        data: { title },
      });

    } else {
      await prisma.worksheet.update({
        where: { id },
        data: { content: JSON.stringify(data) },
      });
    }


    res.status(200).json("Success");
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
);
app.delete('/worksheets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.worksheet.delete({
      where: { id },
    });

    res.status(204).end();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`app is running on localhost:${PORT}`));
