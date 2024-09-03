import React, { useState, useEffect } from "react";
import 'handsontable/dist/handsontable.full.min.css';
import io from "socket.io-client";
import { HyperFormula } from "hyperformula";
import Handsontable from "handsontable";
import { HotTable, HotTableClass } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import axios from "axios";
import { useParams } from "react-router-dom";
import { ExportFile } from "handsontable/plugins";

registerAllModules();

const socket = io("http://localhost:3000");

const hyperformulaInstance = HyperFormula.buildEmpty({
  licenseKey: 'internal-use-in-handsontable',
});

const Spreadsheet: React.FC = () => {
  const sheetRef = React.useRef<HotTableClass>(null);
  const [sheetData, setSheetData] = useState<any[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const sheetId = params.id;

  // Fetch data from the server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/worksheets/${sheetId}`);
        const content = JSON.parse(response.data.content); // Parse the JSON string
        setSheetData(content);
        setError(null); // Clear any previous errors
      } catch (error:any) {
        setError('Error fetching data. The sheet may not exist or there was a problem with the server.');
        setSheetData([]); // Clear data if there's an error
      }
    };

    fetchData();
  }, [sheetId]);

  const saveData = () => {
    const hot = sheetRef.current?.hotInstance;
    if (!hot) return;
    axios.post(`http://localhost:3000/worksheets/${sheetId}`, { data: hot.getData() });
  };

  const handleChanges = (changes: Handsontable.CellChange[] | null) => {
    if (!changes) return;

    changes.forEach(([row, col, oldValue, newValue]) => {
      socket.emit("update-cell", { row, col, value: newValue });
    });
  };

  useEffect(() => {
    const hot = sheetRef.current?.hotInstance;
    if (hot && sheetData.length > 0) {
      hot.loadData(sheetData);
    }
  }, [sheetData]);

  useEffect(() => {
    socket.on('updated-cell', (data) => {
      const { row, col, value } = data;
      const currentCellValue = sheetRef.current?.hotInstance?.getDataAtCell(row, col);
      if (currentCellValue !== value) {
        sheetRef.current?.hotInstance?.setDataAtCell(row, col, value);
      }
    });

    return () => {
      socket.off('updated-cell');
    };
  }, []);

  const handleExport = () => {
    const hot = sheetRef.current?.hotInstance;
    if (!hot) return;
    const exportPlugin: ExportFile = hot.getPlugin('exportFile');
    exportPlugin.downloadFile('csv', {
      bom: true,
      columnDelimiter: ',',
      columnHeaders: true,
      exportHiddenColumns: true,
      exportHiddenRows: true,
      fileExtension: 'csv',
      filename: 'sheet',
      mimeType: 'text/csv',
      rowDelimiter: '\r\n',
    });
  };

  const handleDelete = () => {
    axios.delete(`http://localhost:3000/worksheets/${sheetId}`);
  };

  return (
    <>
      <button onClick={saveData}>Save</button>
      <button onClick={handleExport}>Export</button>
      <button onClick={handleDelete}>Delete</button>
      {error && (
        <div>
          <h1>Error</h1>
          <p>{error}</p>
        </div>
      )}
      {!error && sheetData.length > 0 && (
        <HotTable
          ref={sheetRef}
          data={sheetData}
          formulas={{
            engine: hyperformulaInstance,
            sheetName: 'Sheet1',
          }}
          rowHeaders={true}
          colHeaders={true}
          height="auto"
          width={1000}
          startCols={10}
          startRows={10}
          licenseKey="non-commercial-and-evaluation"
          afterChange={(changes) => handleChanges(changes)}
        />
      )}
    </>
  );
};

export default Spreadsheet;
