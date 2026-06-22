import React from 'react';

const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange, label = 'items' }) => {
  const totalPages = Math.max(1, Math.ceil((totalItems || 0) / Math.max(itemsPerPage || 1, 1)));
  if (totalItems <= itemsPerPage) return null;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-sm text-slate-500">
        Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} {label}
      </p>
      <div className="flex gap-2">
        <button
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold disabled:opacity-40"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        >
          Prev
        </button>
        <button
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-bold disabled:opacity-40"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
