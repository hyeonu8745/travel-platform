import React from 'react';

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
        <div className="flex justify-center space-x-2 mt-6 pt-4 border-t border-gray-100">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 border rounded bg-gray-100 disabled:opacity-50">&larr;</button>
            {pages.map(p => (
                <button key={p} onClick={() => onPageChange(p)} className={`px-3 py-1 border rounded ${currentPage === p ? 'bg-indigo-600 text-white' : 'bg-white'}`}>{p}</button>
            ))}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 border rounded bg-gray-100 disabled:opacity-50">&rarr;</button>
        </div>
    );
};
export default PaginationControls;