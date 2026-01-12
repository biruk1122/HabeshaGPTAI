import React, { useRef, useState } from "react";
import "boxicons/css/boxicons.min.css";

export default function TextEditor() {
  const contentRef = useRef(null);
  const [showCode, setShowCode] = useState(false);

  // Execute formatting commands
  const formatDoc = (cmd, value = null) => {
    if (cmd === "insertOrderedList" || cmd === "insertUnorderedList") {
      // Fix for lists: toggle list
      document.execCommand(cmd);
    } else {
      document.execCommand(cmd, false, value);
    }
  };

  const addLink = () => {
    const url = prompt("Insert url");
    if (url) formatDoc("createLink", url);
  };

  const toggleCode = () => {
    if (!showCode) {
      contentRef.current.textContent = contentRef.current.innerHTML;
      contentRef.current.setAttribute("contenteditable", false);
    } else {
      contentRef.current.innerHTML = contentRef.current.textContent;
      contentRef.current.setAttribute("contenteditable", true);
    }
    setShowCode(!showCode);
  };

  const changeFontSize = (size) => {
    formatDoc("fontSize", size);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 bg-gray-100 flex flex-wrap items-center justify-between gap-4">
        {/* Formatting buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => formatDoc("undo")}
            title="Undo"
            className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-200"
          >
            <i className="bx bx-undo text-lg"></i>
          </button>
          <button
            onClick={() => formatDoc("redo")}
            title="Redo"
            className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-200"
          >
            <i className="bx bx-redo text-lg"></i>
          </button>
          <button
            onClick={() => formatDoc("bold")}
            title="Bold"
            className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-200"
          >
            <i className="bx bx-bold text-lg"></i>
          </button>
          <button
            onClick={() => formatDoc("italic")}
            title="Italic"
            className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-200"
          >
            <i className="bx bx-italic text-lg"></i>
          </button>
          <button
            onClick={() => formatDoc("underline")}
            title="Underline"
            className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-200"
          >
            <i className="bx bx-underline text-lg"></i>
          </button>
          <button
            onClick={() => formatDoc("strikeThrough")}
            title="StrikeThrough"
            className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-200"
          >
            <i className="bx bx-strikethrough text-lg"></i>
          </button>
          <button
            onClick={() => formatDoc("justifyLeft")}
            title="Align Left"
            className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-200"
          >
            <i className="bx bx-align-left text-lg"></i>
          </button>
          <button
            onClick={() => formatDoc("justifyCenter")}
            title="Align Center"
            className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-200"
          >
            <i className="bx bx-align-middle text-lg"></i>
          </button>
          <button
            onClick={() => formatDoc("justifyRight")}
            title="Align Right"
            className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-200"
          >
            <i className="bx bx-align-right text-lg"></i>
          </button>
          <button
            onClick={() => formatDoc("justifyFull")}
            title="Justify"
            className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-200"
          >
            <i className="bx bx-align-justify text-lg"></i>
          </button>
          <button
            onClick={() => formatDoc("insertOrderedList")}
            title="Ordered List"
            className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-200"
          >
            <i className="bx bx-list-ol text-lg"></i>
          </button>
          <button
            onClick={() => formatDoc("insertUnorderedList")}
            title="Unordered List"
            className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-200"
          >
            <i className="bx bx-list-ul text-lg"></i>
          </button>
          <button
            onClick={addLink}
            title="Insert Link"
            className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-200"
          >
            <i className="bx bx-link text-lg"></i>
          </button>
          <button
            onClick={() => formatDoc("unlink")}
            title="Remove Link"
            className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-200"
          >
            <i className="bx bx-unlink text-lg"></i>
          </button>
          <button
            onClick={toggleCode}
            title="Show Code"
            className={`p-2 border border-gray-300 rounded-md ${
              showCode ? "bg-gray-300" : "bg-white"
            } hover:bg-gray-200`}
          >
            &lt;/&gt;
          </button>
        </div>

        {/* Font size selector */}
        <div className="flex items-center gap-2">
          <label className="text-gray-700">Font size:</label>
          <select
            onChange={(e) => changeFontSize(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="1">Extra small</option>
            <option value="2">Small</option>
            <option value="3" selected>
              Normal
            </option>
            <option value="4">Medium</option>
            <option value="5">Large</option>
            <option value="6">Extra Large</option>
            <option value="7">Huge</option>
          </select>
        </div>
      </div>

      {/* Content editable area */}
      <div
        ref={contentRef}
        contentEditable={!showCode}
        spellCheck={false}
        className="min-h-[300px] p-4 outline-none border-t border-gray-300 text-gray-800"
      >
        Start typing here...
      </div>
    </div>
  );
}
