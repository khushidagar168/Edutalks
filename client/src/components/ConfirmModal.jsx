import React from 'react';

const ConfirmModal = ({ title = "Are you sure?", message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <p className="text-gray-600 my-4">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;