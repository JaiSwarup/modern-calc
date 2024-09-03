import React from "react";

interface ToolbarProps {
  onSave: () => void;
  onExport: () => void;
  onDelete: () => void;
  onFormat: (format: string) => void;
  onFontSizeChange: (size: string) => void;
  onFontColorChange: (color: string) => void;
  fontSizes: string[];
  fontColors: string[];
  selectedFontSize: string;
  selectedFontColor: string;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onSave,
  onExport,
  onDelete,
  onFormat,
  onFontSizeChange,
  onFontColorChange,
  fontSizes,
  fontColors,
  selectedFontSize,
  selectedFontColor,
}) => (
  <div>
    <button onClick={onSave}>Save</button>
    <button onClick={onExport}>Export</button>
    <button onClick={onDelete}>Delete</button>
    <button onClick={() => onFormat('bold')}>Bold</button>
    <button onClick={() => onFormat('italic')}>Italic</button>
    <button onClick={() => onFormat('underline')}>Underline</button>
    <button onClick={() => onFormat('yellow')}>Color</button>

    <div style={{ display: 'inline-block', marginLeft: '10px' }}>
      <label>Font Size:</label>
      <select value={selectedFontSize} onChange={(e) => onFontSizeChange(e.target.value)}>
        <option value="default">Default</option>
        {fontSizes.map(size => (
          <option key={size} value={size}>{size}</option>
        ))}
      </select>
    </div>

    <div style={{ display: 'inline-block', marginLeft: '10px' }}>
      <label>Font Color:</label>
      <select value={selectedFontColor} onChange={(e) => onFontColorChange(e.target.value)}>
        <option value="default">Default</option>
        {fontColors.map(color => (
          <option key={color} value={color}>{color}</option>
        ))}
      </select>
    </div>
  </div>
);

export default Toolbar;
