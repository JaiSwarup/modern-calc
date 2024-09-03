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
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
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
app.post('/auth', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await clerkClient.users.getUser(userId);
    let existingUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });
    
    if (!existingUser) {
      existingUser = await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0].emailAddress,
        },
      });
    }

    res.status(200).json({ message: 'User authenticated', user: existingUser });
  } catch (error: any) {
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
        content,
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
