import React from 'react';

const DeleteResidentConfirmation = ({ handleDeleteResident, setShowDeleteConfirmation }) => {
    return (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
            <div className='bg-gray-800 p-6 rounded-lg shadow-lg'>
                <h2 className='text-xl font-semibold text-gray-100 mb-4'>Are you sure you want to delete this resident?</h2>
                <div className='flex justify-end'>
                    <button
                        className='bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 mr-2'
                        onClick={handleDeleteResident}
                    >
                        Yes
                    </button>
                    <button
                        className='bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500'
                        onClick={() => setShowDeleteConfirmation(false)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteResidentConfirmation;