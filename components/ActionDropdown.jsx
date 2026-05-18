import { useState, useRef, useEffect } from "react";

export default function ActionDropdown({ onView, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="action-dropdown" ref={ref}>
      <button
        className="action-trigger"
        onClick={() => setOpen((prev) => !prev)}
      >
        ⋮
      </button>

      <div className={`action-menu ${open ? "open" : ""}`}>
        {/* <button onClick={onView}>
          <span className="icon">👁</span>
          View
        </button> */}

        <button onClick={onEdit}>
          <span className="icon">✏</span>
          Edit
        </button>

        <button className="delete" onClick={onDelete}>
          <span className="icon">🗑</span>
          Delete
        </button>
      </div>
    </div>
  );
}