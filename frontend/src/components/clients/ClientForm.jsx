import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLanguage } from '../../contexts/LanguageContext';

const ClientForm = ({ onSubmit, onCancel, isSubmitting, client }) => {
  const { t } = useLanguage();
  const isEdit = !!client;
  
  const initialType = client && client.name && !client.firstName && !client.lastName ? 'company' : 'person';
  const [clientType, setClientType] = useState(initialType);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: client ? {
      name: client.name || '',
      firstName: client.firstName || '',
      lastName: client.lastName || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
    } : {
      name: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
    }
  });

  useEffect(() => {
    if (client) {
      reset({
        name: client.name || '',
        firstName: client.firstName || '',
        lastName: client.lastName || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
      });
      if (client.name && !client.firstName && !client.lastName) {
        setClientType('company');
      } else {
        setClientType('person');
      }
    }
  }, [client, reset]);

  const handleTypeChange = (e) => {
    setClientType(e.target.value);
    reset();
  };

  const handleFormSubmit = (data) => {
    let formData;
    if (clientType === 'person') {
      formData = {
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        address: data.address,
      };
    } else {
      formData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      };
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('clientType')}</label>
        <div className="flex gap-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="person"
              checked={clientType === 'person'}
              onChange={handleTypeChange}
              className="form-radio text-blue-600"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">{t('person')}</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              value="company"
              checked={clientType === 'company'}
              onChange={handleTypeChange}
              className="form-radio text-blue-600"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">{t('company')}</span>
          </label>
        </div>
      </div>

      {clientType === 'person' ? (
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('firstName')}</label>
            <input
              type="text"
              {...register('firstName', { required: t('firstNameRequired') })}
              className="mt-1 p-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {errors.firstName && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.firstName.message}</p>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('lastName')}</label>
            <input
              type="text"
              {...register('lastName', { required: t('lastNameRequired') })}
              className="mt-1 p-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {errors.lastName && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('companyName')}</label>
          <input
            type="text"
            {...register('name', { required: t('companyNameRequired') })}
            className="mt-1 p-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          {errors.name && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
        <input
          type="email"
          {...register('email', {
            required: t('emailRequired'),
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: t('invalidEmail'),
            },
          })}
          className="mt-1 p-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        {errors.email && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('phone')}</label>
        <input
          type="text"
          {...register('phone', {
            required: t('phoneRequired'),
            pattern: {
              value: /^0\d{9}$/,
              message: t('invalidPhone'),
            },
          })}
          className="mt-1 p-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        {errors.phone && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('address')}</label>
        <input
          type="text"
          {...register('address', { required: t('addressRequired') })}
          className="mt-1 p-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        {errors.address && (
          <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.address.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
          disabled={isSubmitting}
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('saving') : (isEdit ? t('update') : t('create'))}
        </button>
      </div>
    </form>
  );
};

export default ClientForm; 