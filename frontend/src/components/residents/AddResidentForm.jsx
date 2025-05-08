import React, { useState } from 'react';

const AddResidentForm = ({ newResident, handleInputChange, handleAddResident, setShowForm }) => {
    const [otherIncomeSource, setOtherIncomeSource] = useState('');
    const [otherEmploymentStatus, setOtherEmploymentStatus] = useState('');


    const handleIncomeSourceChange = (e) => {
        const { value } = e.target;
        if (value === 'Others') {
            setOtherIncomeSource('');
        }
        handleInputChange(e);
    };

    const handleEmploymentStatusChange = (e) => {
        const { value } = e.target;
        if (value === 'Others') {
            setOtherEmploymentStatus('');
        }
        handleInputChange(e);
    };

    return (
        <form className='mb-6' onSubmit={handleAddResident}>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
                <div className='flex flex-col'>
                    <label className='text-sm mb-1'>Full Name</label>
                    <input
                        type='text'
                        name='fullname'
                        placeholder='e.g., Juan Dela Cruz'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                        value={newResident.fullname}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className='flex flex-col'>
                    <label className='text-sm mb-1'>Age</label>
                    <input
                        type='number'
                        name='age'
                        placeholder='e.g., 30'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                        value={newResident.age}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className='flex flex-col'>
                    <label className='text-sm mb-1'>Purok</label>
                    <select
                        name='purok'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                        value={newResident.purok}
                        onChange={handleInputChange}
                        required
                    >
                        <option value='' disabled>Select Purok</option>
                        {[...Array(15).keys()].map(i => (
                            <option key={i + 1} value={`Purok ${i + 1}`}>Purok {i + 1}</option>
                        ))}
                    </select>
                </div>
                <div className='flex flex-col'>
                    <label className='text-sm mb-1'>Gender</label>
                    <select
                        name='gender'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                        value={newResident.gender}
                        onChange={handleInputChange}
                        required
                    >
                        <option value='' disabled>Select Gender</option>
                        <option value='Male'>Male</option>
                        <option value='Female'>Female</option>
                    </select>
                </div>
                <div className='flex flex-col'>
                    <label className='text-sm mb-1'>Birthdate</label>
                    <input
                        type='date'
                        name='birthdate'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                        value={newResident.birthdate}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className='flex flex-col'>
                    <label className='text-sm mb-1'>Email</label>
                    <input
                        type='email'
                        name='email'
                        placeholder='e.g., juan@example.com'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                        value={newResident.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className='flex flex-col'>
                    <label className='text-sm mb-1'>Phone</label>
                    <input
                        type='text'
                        name='phone'
                        placeholder='e.g., 09123456789'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                        value={newResident.phone}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div
                    className={`flex flex-col ${
                        newResident.religion === 'Others' ? 'mb-4' : ''
                    }`}
                >
                    <label className='text-sm mb-1'>Religion</label>
                    <select
                        name='religion'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                        value={newResident.religion}
                        onChange={handleInputChange}
                        required
                    >
                        <option value='' disabled>Select Religion</option>
                        <option value='Roman Catholic'>Roman Catholic</option>
                        <option value='Islam'>Islam</option>
                        <option value='Iglesia ni Cristo'>Iglesia ni Cristo</option>
                        <option value='Seventh Day Adventist'>Seventh Day Adventist</option>
                        <option value='Others'>Others</option>
                    </select>
                    {newResident.religion === 'Others' && (
                        <input
                            type='text'
                            name='religion'
                            placeholder='Please specify your religion'
                            className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                            value={newResident.religionInput || ''}
                            onChange={(e) => handleInputChange({ target: { name: 'religion', value: e.target.value } })}
                            required
                        />
                    )}
                </div>
                <div className='flex flex-col'>
                    <label className='text-sm mb-1'>Civil Status</label>
                    <select
                        name='civil_status'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                        value={newResident.civil_status}
                        onChange={handleInputChange}
                        required
                    >
                        <option value='' disabled>Select Civil Status</option>
                        <option value='Single'>Single</option>
                        <option value='Married'>Married</option>
                        <option value='Separated'>Separated</option>
                        <option value='Divorced'>Divorced</option>
                        <option value='Widowed'>Widowed</option>
                    </select>
                </div>
                <div className='flex flex-col'>
                    <label className='text-sm mb-1'>PWD</label>
                    <select
                        name='is_pwd'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                        value={newResident.is_pwd}
                        onChange={handleInputChange}
                        required
                    >
                        <option value='' disabled>Select PWD Status</option>
                        <option value='Yes'>Yes</option>
                        <option value='No'>No</option>
                    </select>
                </div>
                <div className='flex flex-col'>
                    <label className='text-sm mb-1'>Registered Voter</label>
                    <select
                        name='is_aVoter'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                        value={newResident.is_aVoter}
                        onChange={handleInputChange}
                        required
                    >
                        <option value='' disabled>Select Voter Status</option>
                        <option value='Yes'>Yes</option>
                        <option value='No'>No</option>
                    </select>
                </div>
                <div className='flex flex-col'>
                    <label className='text-sm mb-1'>Educational Level</label>
                    <select
                        name='educational_level'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                        value={newResident.educational_level}
                        onChange={handleInputChange}
                        required
                    >
                        <option value='' disabled>Select Educational Level</option>
                        <option value='Kindergarten'>Kindergarten</option>
                        <option value='Elementary Education'>Elementary Education</option>
                        <option value='Junior High School'>Junior High School</option>
                        <option value='Senior High School'>Senior High School</option>
                        <option value='Technical-Vocational Education and Training (TVET)'>Technical-Vocational Education and Training (TVET)</option>
                        <option value='Undergraduate (Tertiary) Education'>Tertiary (College) Education</option>
                        <option value="Master's Education">Master's Education</option>
                        <option value='Graduate Education'>Graduate Education</option>
                        <option value='Alternative Learning System (ALS)'>Alternative Learning System (ALS)</option>
                        <option value='Special Education (SPED)'>Special Education (SPED)</option>
                        <option value='Lifelong Learning Programs'>Lifelong Learning Programs</option>
                    </select>
                </div>
                <div className='flex flex-col'>
                    <label className='text-sm mb-1'>Employment Status</label>
                    <select
                        name='employment_status'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                        value={newResident.employment_status}
                        onChange={handleEmploymentStatusChange}
                        required
                    >
                        <option value='' disabled>Select Employment Status</option>
                        <option value='Full-time Employment'>Full-time Employment</option>
                        <option value='Part-time Employment'>Part-time Employment</option>
                        <option value='Self-employed'>Self-employed</option>
                        <option value='Freelancers or Gig Workers'>Freelancers or Gig Workers</option>
                        <option value='Contract Workers'>Contract Workers</option>
                        <option value='Temporary Workers'>Temporary Workers</option>
                        <option value='Casual or On-call Workers'>Casual or On-call Workers</option>
                        <option value='Apprentices or Interns'>Apprentices or Interns</option>
                        <option value='Unemployed'>Unemployed</option>
                        <option value='Retired'>Retired</option>
                        <option value='Volunteer Work'>Volunteer Work</option>
                        <option value='Informal Workers'>Informal Workers</option>
                        <option value='Others'>Others</option>
                    </select>
                    {newResident.employment_status === 'Others' && (
                        <input
                            type='text'
                            name='other_employment_status'
                            placeholder='Please specify'
                            className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                            value={newResident.other_employment_status || ''}
                            onChange={(e) => handleInputChange({ target: { name: 'other_employment_status', value: e.target.value } })}
                        />
                    )}
                </div>
                <div className='flex flex-col'>
                    <label className='text-sm mb-1'>Income Source</label>
                    <select
                        name='income_source'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                        value={newResident.income_source}
                        onChange={handleIncomeSourceChange}
                        required
                    >
                        <option value='' disabled>Select Income Source</option>
                        <option value='Salaries and wages'>Salaries and wages </option>
                        <option value='Business income'>Business income </option>
                        <option value='Rental income'>Rental income</option>
                        <option value='Agricultural income'>Agricultural income</option>
                        <option value='Freelancing or gig work'>Freelancing or gig work</option>
                        <option value='Remittances (from overseas Filipino workers)'>Remittances (from overseas Filipino workers)</option>
                        <option value='Dividends (from investments)'>Dividends (from investments)</option>
                        <option value='Interest income '>Interest income</option>
                        <option value='Online income'>Online income </option>
                        <option value='Pension or retirement benefits'>Pension or retirement benefits</option>
                        <option value='Others'>Others</option>
                    </select>
                    {newResident.income_source === 'Others' && (
                        <input
                            type='text'
                            name='other_income_source'
                            placeholder='Please specify'
                            className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-4 pr-4 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64'
                            value={newResident.other_income_source || ''}
                            onChange={(e) => handleInputChange({ target: { name: 'other_income_source', value: e.target.value } })}
                        />
                    )}
                </div>
                
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
                    Add Resident
                </button>
            </div>
        </form>
    );
};

export default AddResidentForm;