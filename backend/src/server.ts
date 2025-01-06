import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import client from './libs/prismadb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3001", "https://modern-calc.onrender.com"],
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
      const user = await client.user.create({
        data: {
          clerkId: id,
          email: email_addresses[0].email_address,
        },
      });
      res.status(200).json({ message: 'User authenticated', user });
    } else if (req.body.type === 'user.updated'){
      const { id, email_addresses } = req.body.data;
      const user = await client.user.findFirst({
        where: { clerkId: id },
      })
      if (!user){
        return res.status(400).json({ message: 'User not found' });
      }
      await client.user.update({
        where: { clerkId: id },
        data: { email: email_addresses[0].email_address },
      });
      res.status(200).json({ message: 'User authenticated', user });
    } else if (req.body.type === 'user.deleted'){
      const { id } = req.body.data;
      const user = await client.user.findFirst({
        where: { clerkId: id },
      })
      if (!user){
        return res.status(400).json({ message: 'User not found' });
      } else {
        await client.user.delete({
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

app.post("/test/", (req, res)=>{
  res.send("Hello World!");
})

app.post('/worksheets', async (req, res) => {
  try {
    const { userId, title, content } = req.body;

    const user = await client.user.findUnique({
      where: { clerkId: String(userId) },
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const workbook = await client.worksheet.create({
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

    const user = await client.user.findUnique({
      where: { clerkId: String(userId) },
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const workbooks = await client.worksheet.findMany({
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
    const workbook = await client.worksheet.findUnique({
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
      await client.worksheet.update({
        where: { id },
        data: { title },
      });

    } else {
      await client.worksheet.update({
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
    await client.worksheet.delete({
      where: { id },
    });

    res.status(204).end();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

async function getData() {
  const data = await client.workbook.findMany();
  return data.map((sheet: { id?: string }) => {
    delete sheet.id;
    return sheet;
  });
}

app.get('/api/', async (req, res) => {
  const data = await getData();
  res.json(data);
});

io.on('connection', (socket) => {
  


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`app is running on localhost:${PORT}`));
