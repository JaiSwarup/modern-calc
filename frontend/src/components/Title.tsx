import { HotTableClass } from "@handsontable/react";
import axios from "axios";
import React, { useState } from "react";

interface TitleEditorProps {
    sheetRef: React.RefObject<HotTableClass>;
    sheetId: string;
  title: string;
  onRename: (newTitle: string) => void;
}

const TitleEditor: React.FC<TitleEditorProps> = ({sheetRef, sheetId, title, onRename }) => {
  const [sheetTitle, setSheetTitle] = useState(title);
  const [editingTitle, setEditingTitle] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSheetTitle(e.target.value);
  };

  const handleRename = () => {
    const hot = sheetRef.current?.hotInstance;
    if (!hot) return;
    if (sheetTitle.trim() !== "") {
      onRename(sheetTitle);
      setEditingTitle(false);
    }
    axios.post(`http://localhost:3000/worksheets/${sheetId}`, { title: sheetTitle, data: hot.getData(), changeTitle : true });
  };

  return (
    <div style={{ marginTop: '20px', marginBottom: '10px' }}>
      {editingTitle ? (
        <div style={{ display: 'inline-block' }}>
          <input
            type="text"
            value={sheetTitle}
            onChange={handleTitleChange}
            onBlur={handleRename}
            onKeyPress={(e) => e.key === 'Enter' && handleRename()}
          />
          <button onClick={handleRename}>Rename</button>
        </div>
      ) : (
        <h1 style={{ display: 'inline-block', marginRight: '10px' }}>
          {sheetTitle}
        </h1>
      )}
      <button onClick={() => setEditingTitle(true)}>Edit Name</button>
    </div>
  );
};

export default TitleEditor;
