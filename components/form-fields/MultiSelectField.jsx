// import { useState, useRef, useEffect } from "react";
// import { ChevronDown } from "lucide-react";

// const MultiSelectField = ({
//   label,
//   name,
//   options = [],
//   register,
//   setValue,
//   watch,
//   error,
//   required
// }) => {
//   const [open, setOpen] = useState(false);
//   const [selected, setSelected] = useState([]);
//   const ref = useRef();

//   const formValue = watch(name);

//   useEffect(() => {
//     if (Array.isArray(formValue)) {
//       setSelected(formValue);
//     }
//   }, [formValue]);

//   const handleSelect = (item) => {
//     let updated;

//     if (selected.includes(item.id)) {
//       updated = selected.filter((id) => id !== item.id);
//     } else {
//       updated = [...selected, item.id];
//     }

//     setSelected(updated);
//     setValue(name, updated);
//     setOpen(false);
//   };

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
//             selected.length
//               ? options
//                   .filter((o) => selected.includes(o.id))
//                   .map((o) => o.label)
//                   .join(", ")
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
//                 selected.includes(item.id) ? "bg-blue-100" : ""
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

// export default MultiSelectField;






import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const MultiSelectField = ({
  label,
  name,
  options = [],
  register,
  setValue,
  watch,
  error,
  required
}) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const ref = useRef();

  const formValue = watch(name);

  useEffect(() => {
    if (Array.isArray(formValue)) {
      setSelected(formValue);
    }
  }, [formValue]);

  const handleSelect = (item) => {
    let updated;

    if (selected.includes(item.id)) {
      updated = selected.filter((id) => id !== item.id);
    } else {
      updated = [...selected, item.id];
    }

    setSelected(updated);
    setValue(name, updated);
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label} {required && <span className="text-red-500 dark:text-red-400">*</span>}
      </label>

      {/* Input Wrapper */}
      <div
        onClick={() => setOpen(!open)}
        className={`input-lab flex items-center justify-between cursor-pointer border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-900 transition-colors duration-200 ${
          error ? "border-red-500 dark:border-red-500" : ""
        }`}
      >
        <input
          readOnly
          required
          value={
            selected.length
              ? options
                  .filter((o) => selected.includes(o.id))
                  .map((o) => o.label)
                  .join(", ")
              : ""
          }
          placeholder={`Select ${label}`}
          className="bg-transparent outline-none w-full cursor-pointer text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />

        <ChevronDown
          size={18}
          className={`transition-transform duration-200 text-gray-500 dark:text-gray-400 ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {open && (
        <div className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-md max-h-52 overflow-y-auto mt-1">
          {options.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`px-3 py-2 cursor-pointer transition-colors ${
                selected.includes(item.id) 
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" 
                  : "hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
              }`}
            >
              {item.label}  
            </div>
          ))}
        </div>
      )}

      <input type="hidden" {...register(name)} />

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error.message}</p>
      )}
    </div>
  );
};

export default MultiSelectField;