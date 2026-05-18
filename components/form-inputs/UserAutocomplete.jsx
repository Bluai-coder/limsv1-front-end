import React, { useState, useRef, useEffect } from "react";

const usersMock = [
  { id: 1, name: "Nitin Saini" },
  { id: 2, name: "Rahul Sharma" },
  { id: 3, name: "Amit Kumar" },
  { id: 4, name: "Priya Verma" },
];

export default function UserAutocomplete({ onSelect ,options }) {
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!query) {
      setFiltered([]);
      return;
    }

    const result = options.filter((u) =>
      u.name.toLowerCase().includes(query.toLowerCase())
    );

    setFiltered(result);
  }, [query]);

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (user) => {
    setQuery(user.name);
    setOpen(false);
    onSelect && onSelect(user);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search User..."
        className="border px-3 py-2 rounded-md w-full text-sm"
      />

      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full bg-white border rounded-md mt-1 max-h-60 overflow-y-auto shadow">
          {filtered.map((user) => (
            <div
              key={user.id}
              onClick={() => handleSelect(user)}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
            >
              {user.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}