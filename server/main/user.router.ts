import {Router} from 'express';
import client from '../../libs/prismadb';

const userRouter = Router()
userRouter.post('/', async (req, res) => {
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
})

export default userRouter;