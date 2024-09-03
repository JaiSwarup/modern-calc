import React, { useState, useEffect, useMemo } from "react";
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

const socket = io(import.meta.env.VITE_SERVER_URL);

const hyperformulaInstance = HyperFormula.buildEmpty({
  licenseKey: 'internal-use-in-handsontable',
});

const Spreadsheet: React.FC = () => {
  const sheetRef = React.useRef<HotTableClass>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<boolean>(false);
  const [sheetData, setSheetData] = useState<any[][]>([[]]);
  const [cells, setCells] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const sheetId = params.id;
  if (!sheetId) {
    return (
      <div style={{width:"600px"}}>
        <h1>This is a tutorial</h1>
        <h2>Create an account for more features</h2>
        <HotTable 
        width={600}
        height="auto"
        rowHeaders={true}
        colHeaders={true}
        minCols={50}
        minRows={50}
        licenseKey="non-commercial-and-evaluation" />
      </div>
    )
  }
  const [fontSize, setFontSize] = useState<string>('default');
  const [fontColor, setFontColor] = useState<string>('default');

  // Fetch data from the server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/worksheets/${sheetId}`);
        const data = JSON.parse(response.data.content); 
        
        console.log(data)
        setSheetData(data);
        setTitle(response.data.title);
        setError(null); // Clear any previous errors
      } catch (error:any) {
        setError('Error fetching data. The sheet may not exist or there was a problem with the server.');
        setSheetData([[]]); // Clear data if there's an error
        setTitle("Error"); // Set the title to "Error" if there's an error
      }
    };

    fetchData();
  }, [sheetId]);

  const saveData = () => {
    const hot = sheetRef.current?.hotInstance;
    if (!hot) return;
    axios.post(`${import.meta.env.VITE_SERVER_URL}/worksheets/${sheetId}`, { title : title, data: hot.getData(), changeTitle : false });
  };

  const handleChanges = (changes: Handsontable.CellChange[] | null) => {
    if (!changes) return;

    changes.forEach(([row, col, , newValue]) => {
      socket.emit("update-cell", { row, col, value: newValue });
    });
  };

  const selectedRange = useMemo(() => {
    if (selected.length !== 4) return [];
    const [startRow, startCol, endRow, endCol] = selected;
    const cellsInRange = [];
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        cellsInRange.push({ row, col });
      }
    }
    return cellsInRange;
  }, [selected]);

  const updateCells = (newClassName: string) => {
    const hot = sheetRef?.current?.hotInstance;
    hot?.suspendRender()
    const newCells = [...cells];
    selectedRange.forEach(({ row, col }) => {
      const existingCell = newCells.find((cell) => cell.row === row && cell.col === col);
      if (existingCell) {
        // Toggle the class name
        const classList = new Set(existingCell.className.split(' '));
        if (classList.has(newClassName)) {
          classList.delete(newClassName);
        } else {
          classList.add(newClassName);
        }
        existingCell.className = Array.from(classList).join(' ');
      } else {
        // Add new cell if it doesn't exist
        newCells.push({ row, col, className: newClassName });
      }
    });
    setCells(newCells);
    hot?.render();
    hot?.resumeRender();
  };

  const handleBold = () => updateCells('bold');
  const handleItalic = () => updateCells('italic');
  const handleUnderline = () => updateCells('underline');
  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    updateCells(size);
  };

  const handleFontColorChange = (color: string) => {
    setFontColor(color);
    updateCells(color);
  };

  const fontSizes = ['small', 'medium', 'large'];
  const fontColors = ['red', 'green', 'blue', 'yellow', 'black'];

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
    axios.delete(`${import.meta.env.VITE_SERVER_URL}/worksheets/${sheetId}`);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleRename = () => {
    if (!title) return;
    if (title.trim() !== "") {
      setEditingTitle(false);
    }
    axios.post(`${import.meta.env.VITE_SERVER_URL}/worksheets/${sheetId}`, { title : title, data : "", changeTitle :true });
  };

  return (
    <div style={{minWidth:"800px", maxWidth:"1000px"}}>
      <div>
      <button onClick={saveData}>Save</button>
      <button onClick={handleExport}>Export</button>
      <button onClick={handleDelete}>Delete</button>
      </div>
      <div>
      <button onClick={handleBold}>Bold</button>
      <button onClick={handleItalic}>Italic</button>
      <button onClick={handleUnderline}>Underline</button>
      <div style={{ display: 'inline-block', marginLeft: '10px' }}>
        <label>Font Size:</label>
        <select value={fontSize} onChange={(e) => handleFontSizeChange(e.target.value)}>
          <option value="default">Default</option>
          {fontSizes.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'inline-block', marginLeft: '10px' }}>
        <label>Font Color:</label>
        <select value={fontColor} onChange={(e) => handleFontColorChange(e.target.value)}>
          <option value="default">Default</option>
          {fontColors.map(color => (
            <option key={color} value={color}>{color}</option>
          ))}
        </select>
      </div>
      </div>
      {error && (
        <div>
          <h1>Error</h1>
          <p>{error}</p>
        </div>
      )}
      {!error && sheetData.length > 0 && (
        <>
        <div style={{ marginTop: '20px', marginBottom: '10px' }}>
        {editingTitle ? (
          <div style={{ display: 'inline-block' }}>
            <input
              type="text"
              value={title!}
              onChange={handleTitleChange}
              onBlur={handleRename}
              onKeyPress={(e) => e.key === 'Enter' && handleRename()}
            />
            <button onClick={handleRename}>Rename</button>
          </div>
        ) : (
          <h1 style={{ display: 'inline-block', marginRight: '10px' }}>
            {title}
          </h1>
        )}
        <button onClick={() => setEditingTitle(true)}>Edit Name</button>
      </div>
        <HotTable
          ref={sheetRef}
          cell={cells}
          formulas={{
            engine: hyperformulaInstance,
            sheetName: 'Sheet1',
          }}
          rowHeaders={true}
          colHeaders={true}
          autoWrapCol={true}
          height="auto"
          width="auto"
          minCols={50}
          minRows={50}
          licenseKey="non-commercial-and-evaluation"
          afterChange={(changes) => handleChanges(changes)}
          afterSelection={(r, c, r2, c2) => setSelected([r, c, r2, c2])}
          />
          </>
      )}
    </div>
  );
};

export default Spreadsheet;
