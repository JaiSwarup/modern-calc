import {Router, json, urlencoded} from 'express';
import userRouter from './user.router';
import workbookRouter from './workbook.router';

const serverRouter = Router().use(json()).use(urlencoded({ extended: true })).use('/user', userRouter).use('/workbooks', workbookRouter);

export default serverRouter;