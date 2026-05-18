// import { useState, useRef, useEffect } from "react";
// import { ChevronDown } from "lucide-react";

// const SingleSelectField = ({
//   label,
//   name,
//   options = [],
//   register,
//   setValue,
//   watch,
//   error,
//   required,
//   selected,
//   setSelected,
// }) => {
//   const [open, setOpen] = useState(false);
//   const ref = useRef();

//   const formValue = watch(name);

//   // Sync with form value
//   useEffect(() => {
//     if (formValue) {
//       setSelected(formValue);
//     }
//   }, [formValue]);

//   // Handle select (single value)
//   const handleSelect = (item) => {
//     setSelected(item.id);
//     setValue(name, item.id);
//     setOpen(false);
//   };

//   // Close dropdown outside click
//   useEffect(() => {
//     const handler = (e) => {
//       if (!ref.current?.contains(e.target)) {
//         setOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   return (
//     <div className="relative" ref={ref}>
//       <label className="block text-sm font-medium text-gray-700 mb-1">
//         {label} {required && <span className="text-red-500">*</span>}
//       </label>

//       {/* Input Wrapper */}
//       <div
//         onClick={() => setOpen(!open)}
//         className={`input-lab flex items-center justify-between cursor-pointer ${
//           error ? "input-lab-error" : ""
//         }`}
//       >
//         <input
//           readOnly
//           required
//           value={
//             selected
//               ? options.find((o) => o.id === selected)?.label || ""
//               : ""
//           }
//           placeholder={`Select ${label}`}
//           className="bg-transparent outline-none w-full cursor-pointer"
//         />

//         <ChevronDown
//           size={18}
//           className={`transition-transform duration-200 ${
//             open ? "rotate-180" : ""
//           }`}
//         />
//       </div>

//       {open && (
//         <div className="absolute z-50 w-full bg-white border rounded-md shadow-md max-h-52 overflow-y-auto mt-1">
//           {options.map((item) => (
//             <div
//               key={item.id}
//               onClick={() => handleSelect(item)}
//               className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${
//                 selected === item.id ? "bg-blue-100" : ""
//               }`}
//             >
//               {item.label}
//             </div>
//           ))}
//         </div>
//       )}

//       <input type="hidden" {...register(name)} />

//       {error && (
//         <p className="text-xs text-red-500 mt-1">{error.message}</p>
//       )}
//     </div>
//   );
// };

// export default SingleSelectField;






'use client';

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const SingleSelectField = ({
  label,
  name,
  options = [],
  register,
  setValue,
  watch,
  error,
  required,
  selected,
  setSelected,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const formValue = watch(name);

  // Sync with form value
  useEffect(() => {
    if (formValue) {
      setSelected(formValue);
    }
  }, [formValue, setSelected]);

  // Handle select
  const handleSelect = (item) => {
    setSelected(item.id);
    setValue(name, item.id);
    setOpen(false);
  };

  // Close outside click
  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative z-30 overflow-visible"
    >
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
        {required && (
          <span className="text-red-500 dark:text-red-400 ml-1">*</span>
        )}
      </label>

      {/* Input Wrapper */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        className={`
          relative
          flex
          items-center
          justify-between
          cursor-pointer
          border
          rounded-lg
          px-4
          py-2.5
          bg-white
          dark:bg-gray-900
          transition-all
          duration-200
          overflow-visible
          ${
            error
              ? "border-red-500 dark:border-red-500"
              : "border-gray-200 dark:border-gray-700"
          }
        `}
      >
        <input
          readOnly
          required
          value={
            selected
              ? options.find((o) => o.id === selected)?.label || ""
              : ""
          }
          placeholder={`Select ${label}`}
          className="
            bg-transparent
            outline-none
            w-full
            cursor-pointer
            text-gray-900
            dark:text-gray-100
            placeholder:text-gray-400
            dark:placeholder:text-gray-500
          "
        />

        <ChevronDown
          size={18}
          className={`
            transition-transform
            duration-200
            text-gray-500
            dark:text-gray-400
            flex-shrink-0
            ${open ? "rotate-180" : ""}
          `}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute
            left-0
            top-full
            mt-2
            w-full
            z-[9999]
            bg-white
            dark:bg-gray-800
            border
            border-gray-200
            dark:border-gray-700
            rounded-xl
            shadow-2xl
            max-h-52
            overflow-y-auto
            overflow-x-hidden
          "
        >
          {options?.length > 0 ? (
            options.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`
                  px-4
                  py-3
                  cursor-pointer
                  transition-colors
                  text-sm
                  ${
                    selected === item.id
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                  }
                `}
              >
                {item.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500">
              No options found
            </div>
          )}
        </div>
      )}

      {/* Hidden Input */}
      <input type="hidden" {...register(name)} />

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-1">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default SingleSelectField;