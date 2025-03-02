import React from 'react';

const EditResidentForm = ({ newResident, handleInputChange, handleEditResident, setShowForm }) => {
    return (
        <form className='mb-6' onSubmit={handleEditResident}>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <input
                    type='text'
                    name='fullname'
                    placeholder='Full Name'
                    className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={newResident.fullname}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type='number'
                    name='age'
                    placeholder='Age'
                    className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={newResident.age}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type='text'
                    name='purok'
                    placeholder='Purok'
                    className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={newResident.purok}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type='text'
                    name='gender'
                    placeholder='Gender'
                    className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={newResident.gender}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type='date'
                    name='birthdate'
                    placeholder='Birthdate'
                    className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={newResident.birthdate}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type='email'
                    name='email'
                    placeholder='Email'
                    className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={newResident.email}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type='text'
                    name='phone'
                    placeholder='Phone'
                    className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={newResident.phone}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type='text'
                    name='civil_status'
                    placeholder='Civil Status'
                    className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={newResident.civil_status}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type='text'
                    name='is_pwd'
                    placeholder='PWD'
                    className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={newResident.is_pwd}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type='text'
                    name='is_senior'
                    placeholder='Senior'
                    className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={newResident.is_senior}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type='text'
                    name='employment_status'
                    placeholder='Employment Status'
                    className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={newResident.employment_status}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type='text'
                    name='income_source'
                    placeholder='Income Source'
                    className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={newResident.income_source}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type='text'
                    name='educational_level'
                    placeholder='Educational Level'
                    className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    value={newResident.educational_level}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className='flex justify-end mt-4'>
                <button
                    type='button'
                    className='bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 mr-2'
                    onClick={() => setShowForm(false)}
                >
                    Cancel
                </button>
                <button
                    type='submit'
                    className='bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500'
                >
                    Update Resident
                </button>
            </div>
        </form>
    );
};

export default EditResidentForm;