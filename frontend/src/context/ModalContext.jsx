import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext(null);
export const useGlobalModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isConfirm: false });

    const openModal = ({ title, message, onConfirm = null, isConfirm = false }) => setModalState({ isOpen: true, title, message, onConfirm, isConfirm });
    const closeModal = () => setModalState({ ...modalState, isOpen: false });
    const confirm = (title, message, callback) => openModal({ title, message, onConfirm: callback, isConfirm: true });
    const alert = (title, message) => openModal({ title, message, isConfirm: false });
    const handleConfirm = (result) => { if (modalState.onConfirm) modalState.onConfirm(result); closeModal(); };

    return (
        <ModalContext.Provider value={{ alert, confirm }}>
            {children}
            {modalState.isOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
                        <h3 className="text-xl font-bold mb-3">{modalState.title}</h3>
                        <p className="text-gray-700 mb-6 whitespace-pre-wrap">{modalState.message}</p>
                        <div className="flex justify-end space-x-3">
                            {modalState.isConfirm && <button onClick={() => handleConfirm(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">취소</button>}
                            <button onClick={() => handleConfirm(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{modalState.isConfirm ? '확인' : '닫기'}</button>
                        </div>
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    );
};