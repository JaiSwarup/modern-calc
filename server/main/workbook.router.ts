import {Router} from 'express';
import client from '../../libs/prismadb';

const workbookRouter = Router()

workbookRouter
.get('/', async (req, res) => {
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
.get('/shared', async (req, res) => {
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
})
.get('/create', async (req, res) => {
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
})
.get('/:workbookId', async (req, res) => {
    try {
        const workbook = await client.workbook.findFirst({
        where: {
            id: req.params.workbookId as string
        }
        });
        res.status(200).json(workbook);
    } catch (error) {
        res.status(400).json({message:"Workbook not found", error});
    }
})
.put('/:workbookId', async (req, res) => {
    try {
        const workbook = await client.workbook.update({
        where: {
            id: req.params.workbookId as string
        },
        data: {
            name: req.body.name
        }
        });
        res.status(200).json(workbook);
    } catch (error) {
        res.status(400).json({message:"Workbook not found", error});
    }
})



export default workbookRouter;