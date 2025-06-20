import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

const ClientForm = ({ onSubmit, onCancel, isSubmitting, defaultValues }) => {
  const initialType = defaultValues && defaultValues.name && !defaultValues.firstName && !defaultValues.lastName ? 'company' : 'person';
  const [clientType, setClientType] = useState(initialType);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ defaultValues });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
      if (defaultValues.name && !defaultValues.firstName && !defaultValues.lastName) {
        setClientType('company');
      } else {
        setClientType('person');
      }
    }
  }, [defaultValues, reset]);

  const handleTypeChange = (e) => {
    setClientType(e.target.value);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Client Type</label>
        <div className="flex gap-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="person"
              checked={clientType === 'person'}
              onChange={handleTypeChange}
              className="form-radio"
            />
            <span className="ml-2">Person</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="company"
              checked={clientType === 'company'}
              onChange={handleTypeChange}
              className="form-radio"
            />
            <span className="ml-2">Company</span>
          </label>
        </div>
      </div>

      {clientType === 'person' ? (
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              {...register('firstName', { required: 'First name is required' })}
              className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              {...register('lastName', { required: 'Last name is required' })}
              className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
          <input
            type="text"
            {...register('name', { required: 'Company name is required' })}
            className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Invalid email address',
            },
          })}
          className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          type="text"
          {...register('phone', {
            required: 'Phone is required',
            pattern: {
              value: /^0\d{9}$/,
              message: 'Phone must be 10 digits and start with 0',
            },
          })}
          className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.phone && (
          <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <input
          type="text"
          {...register('address', { required: 'Address is required' })}
          className="mt-1 p-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.address && (
          <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Client'}
        </button>
      </div>
    </form>
  );
};

export default ClientForm; 