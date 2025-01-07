import client from "../../libs/prismadb";

export default async function getData(id : string) {
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