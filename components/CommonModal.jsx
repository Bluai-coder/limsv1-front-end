// // components/CommonModal.tsx

// 'use client';


// export default function CommonModal({
//   open,
//   title,
//   description,
//   children,
//   onClose,
//   onSubmit,
//   submitText = "Submit",
//   loading = false,
// }) {
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-lg">
//       <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in">

//         <h2 className="text-lg font-bold text-gray-900">{title}</h2>
//         {description && (
//           <p className="text-sm text-gray-500 mb-4">{description}</p>
//         )}

//         {/* BODY */}
//         <div className="mt-4">{children}</div>

//         {/* FOOTER */}
//         <div className="flex justify-end gap-2 mt-6">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
//           >
//             Cancel
//           </button>

//           {onSubmit && (
//             <button
//               onClick={onSubmit}
//               disabled={loading}
//               className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               {submitText}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }









// components/CommonModal.tsx (Simpler version without external icons)

'use client';

export default function CommonModal({
  open,
  title,
  description,
  children,
  onClose,
  onClick,
  submitText = "Submit",
  cancelText = "Cancel",
  loading = false,
  disableSubmit = false,
  size = "md",
}) {
  if (!open) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`
        bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full mx-4 overflow-hidden
        animate-in zoom-in-95 duration-200
        ${sizeClasses[size]}
      `}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-8">
              <h2 className="text-xl font-bold text-white">
                {title}
              </h2>
              {description && (
                <p className="text-blue-100 text-sm mt-1">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            {cancelText}
          </button>

          {/* {onSubmit && (
            <button
              onClick={onSubmit}
              disabled={disableSubmit || loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </>
              ) : (
                submitText
              )}
            </button>
          )} */}
        </div>
      </div>
    </div>
  );
}