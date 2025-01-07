import _ from 'lodash';
import client from '../../libs/prismadb';

const collection = client.worksheet;
/**
 * @param {any[]} ops Operation list
 */
export async function applyOp(ops: any[]) {
  const operations: any[] = [];

  for (const op of ops) {
    const { path, id } = op;
    const filter = { id };

    if (op.op === 'insertRowCol') {
      /**
       * Special operation: insertRowCol
       */
      const field = op.value.type === 'row' ? 'r' : 'c';
      let insertPos = op.value.index;
      if (op.value.direction === 'rightbottom') {
        insertPos += 1;
      }

      const worksheet = await collection.findUnique({ where: filter });
      if (!worksheet) continue;

      const updatedCelldata = worksheet.celldata.map((cell: any) => {
        if (cell[field] >= insertPos) {
          return { ...cell, [field]: cell[field] + op.value.count };
        }
        return cell;
      });

      operations.push(
        collection.update({
          where: filter,
          data: { celldata: updatedCelldata },
        })
      );
    } else if (op.op === 'deleteRowCol') {
      /**
       * Special operation: deleteRowCol
       */
      const field = op.value.type === 'row' ? 'r' : 'c';

      const workbook = await collection.findUnique({ where: filter });
      if (!workbook) continue;

      const updatedCelldata = workbook.celldata
        .filter((cell: any) => !(cell[field] >= op.value.start && cell[field] <= op.value.end))
        .map((cell: any) => {
          if (cell[field] >= op.value.start) {
            return { ...cell, [field]: cell[field] - (op.value.end - op.value.start + 1) };
          }
          return cell;
        });

      operations.push(
        collection.update({
          where: filter,
          data: { celldata: updatedCelldata },
        })
      );
    } else if (op.op === 'addSheet') {
      /**
       * Special operation: addSheet
       */
      operations.push(
        collection.create({
          data: op.value,
        })
      );
    } else if (op.op === 'deleteSheet') {
      /**
       * Special operation: deleteSheet
       */
      operations.push(
        collection.delete({
          where: filter,
        })
      );
    } else if (
      path.length >= 3 &&
      path[0] === 'data' &&
      _.isNumber(path[1]) &&
      _.isNumber(path[2])
    ) {
      /**
       * Cell update
       */
      const key = ['celldata.$[e].v', ...path.slice(3)].join('.');
      const [, r, c] = path;

      const workbook = await collection.findUnique({ where: filter });
      if (!workbook) continue;

      const cellExists = workbook.celldata.some(
        (cell: any) => cell.r === r && cell.c === c
      );

      const updatedCelldata = workbook.celldata.map((cell: any) => {
        if (cell.r === r && cell.c === c) {
          if (op.op === 'remove') {
            const { v, ...rest } = cell; // Remove the value field
            return rest;
          } else {
            return { ...cell, v: op.value };
          }
        }
        return cell;
      });

      if (!cellExists && op.op !== 'remove') {
        updatedCelldata.push({ r, c, v: op.value });
      }

      operations.push(
        collection.update({
          where: filter,
          data: { celldata: updatedCelldata },
        })
      );
    } else if (path.length === 2 && path[0] === 'data' && _.isNumber(path[1])) {
      console.error('Row assigning not supported');
    } else if (path.length === 0 && op.op === 'add') {
      // Add new sheet
      operations.push(
        collection.create({
          data: op.value,
        })
      );
    } else if (path[0] !== 'data') {
      // Other config update
      operations.push(
        collection.update({
          where: filter,
          data:
            op.op === 'remove'
              ? {
                  config: {
                    [op.path.join('.')]: undefined,
                  },
                }
              : {
                  config: {
                    [op.path.join('.')]: op.value,
                  },
                },
        })
      );
    } else {
      console.error('Unprocessable op', op);
    }
  }

  for (const operation of operations) {
    // console.log('Applying operation', operation);
    await operation;
  }
}
