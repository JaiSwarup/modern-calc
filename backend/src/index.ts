import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { applyOp } from './op';
import bodyParser from 'body-parser';
import client from './libs/prismadb';

const app = express();
const server = createServer(app);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  console.log("Incoming request:", {
      method: req.method,
      url: req.url,
      query: req.query,
      body: req.body,
      params: req.params,
  });
  console.log("Response:", {
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,

  });
  next();
});



const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://modern-calc.onrender.com"],
    methods: ["GET", "POST"],
  }
});

app.post('/api/user', async (req, res) => {
  const { id, first_name, email_addresses } = req.body.data;
  console.log(req.body.data.type);
  if (req.body.type === 'user.created') {
    try {
      const user = await client.user.create({
        data :{
          clerkId : id,
          name : first_name || "",
          email: email_addresses[0].email_address
        }
      });
      res.status(200).json({message:"User created", user});
    } catch (error) {
      res.status(400).json({message:"User already exists", error});
    }
  } else if (req.body.type === 'user.updated') {
    try {
      const user = await client.user.update({
        where: {
          clerkId: id
        },
        data: {
          name : first_name || "",
          email: email_addresses[0].email_address
        }
      });
      res.status(200).json({message:"User updated", user});
    } catch (error) {
      res.status(400).json({message:"User not found", error});
    }
  }else if (req.body.type === 'user.deleted') {
    try {
      const user = await client.user.delete({
        where: {
          clerkId: id
        }
      });
      res.status(200).json({message:"User deleted", user});
    } catch (error) {
      res.status(400).json({message:"User not found", error});
    }
  }
});

app.get('/api/user', async (req, res) => {
  const user = await client.user.findMany();
  res.status(200).json(user);
});

app.get('/api/workbooks', async (req, res) => {
  try {
    const user = await client.user.findFirst({
      where: {
        clerkId: req.query.userId as string
      }
    });
    const workbooks = await client.workbook.findMany({
      where: {
        authorId: user?.id as string
      }
    });
      res.status(200).json(workbooks);
    } catch (error) {
      // console.log(error)
      res.status(400).json({message:"User not found", error});
    }
})  

app.get('/api/workbooks/shared', async (req, res) => {
  try {
    const user = await client.user.findFirst({
      where: {
        clerkId: req.query.userId as string
      }
    });
    const workbooks = await client.workbook.findMany({
      where: {
        authorId: {
          not: user?.id as string
        },
        allowedUsers: {
          some: {
            id: user?.id as string
          }
        }
      }
    });
    res.status(200).json(workbooks);
  } catch (error) {
    // console.log(error)
    res.status(400).json({message:"User not found", error});
  }
});

app.get('/api/workbooks/create', async (req, res) => {
  console.log("req.query.userId", req.query.userId)
  try {
    const user = await client.user.findFirst({
      where: {
        clerkId: req.query.userId as string
      }
    });
    console.log(user)
    // create a workbook and a worksheet
    const workbook = await client.workbook.create({
      data: {
        name: "Untitled",
        authorId: user?.id as string,
        worksheets: {
          create: {
            name: "Sheet1",
          }
        }
      }
    });
    res.status(200).json(workbook);
  } catch (error) {
    res.status(400).json({message:"User not found", error});
  }
});

app.get('/api/workbooks/:id', async (req, res) => {
  try {
    const workbook = await client.workbook.findFirst({
      where: {
        id: req.params.id as string
      }
    });
    res.status(200).json(workbook);
  } catch (error) {
    res.status(400).json({message:"Workbook not found", error});
  }
});

app.put('/api/workbooks/:id', async (req, res) => {
  try {
    const workbook = await client.workbook.update({
      where: {
        id: req.params.id as string
      },
      data: {
        name: req.body.name
      }
    });
    res.status(200).json(workbook);
  } catch (error) {
    res.status(400).json({message:"Workbook not found", error});
  }
});

async function getData(id : string) {
  // return all worksheets related to a workbook
  try {
    const workbook = await client.workbook.findFirst({
      where: {
        id: id
      },
      include: {
        worksheets: true
      }
    });
    // console.log(workbook)
    const worksheets = workbook?.worksheets;
    // console.log(worksheets)
    if (!worksheets || worksheets.length == 0) return {name: workbook?.name, data :[{"name": "Sheet1"}]};
    return {worksheets, name: workbook?.name};
  } catch (error) {
    return {name:"fallback", data: [{"name": "Sheet1"}]};
  }
}

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

server.listen(3001, () => {
  console.log('Server listening on port 3001');
});
