// components/CommonModal.tsx

'use client';


export default function CommonModal({
  open,
  title,
  description,
  children,
  onClose,
  onSubmit,
  submitText = "Submit",
  loading = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-lg">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in">

        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500 mb-4">{description}</p>
        )}

        {/* BODY */}
        <div className="mt-4">{children}</div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>

          {onSubmit && (
            <button
              onClick={onSubmit}
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {submitText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}