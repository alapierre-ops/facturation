import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLanguage } from '../../contexts/LanguageContext';

const STATUS_OPTIONS = [
  { label: 'Prospect', value: 'prospect' },
  { label: 'Pending', value: 'pending' },
  { label: 'Quote Sent', value: 'quote_sent' },
  { label: 'Quote Accepted', value: 'quote_accepted' },
  { label: 'Finished', value: 'finished' },
  { label: 'Cancelled', value: 'cancelled' },
];

const ProjectForm = ({ onSubmit, onCancel, isSubmitting, project, clients }) => {
  const { t } = useLanguage();
  const isEdit = !!project;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    defaultValues: project ? {
      name: project.name || '',
      clientId: project.clientId ? String(project.clientId) : '',
      description: project.description || '',
      status: project.status || 'pending',
      startDate: project.startDate ? project.startDate.slice(0, 10) : '',
      endDate: project.endDate ? project.endDate.slice(0, 10) : '',
    } : {
      name: '',
      clientId: '',
      description: '',
      status: 'pending',
      startDate: '',
      endDate: '',
    }
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  useEffect(() => {
    if (project) {
      reset({
        name: project.name || '',
        clientId: project.clientId ? String(project.clientId) : '',
        description: project.description || '',
        status: project.status || 'pending',
        startDate: project.startDate ? project.startDate.slice(0, 10) : '',
        endDate: project.endDate ? project.endDate.slice(0, 10) : '',
      });
    }
  }, [project, reset]);

  const validateDates = (endDate) => {
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return t('endDateAfterStart');
    }
    return true;
  };

  const handleFormSubmit = (data) => {
    const formData = {
      ...data,
      clientId: data.clientId ? parseInt(data.clientId, 10) : null,
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('projectName')}</label>
        <input
          type="text"
          {...register('name', { required: t('nameRequired') })}
          className="mt-1 p-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        {errors.name && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.name.message}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('clientName')}</label>
        <select
          {...register('clientId', { required: t('clientRequired') })}
          className="mt-1 p-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">{t('selectClient')}</option>
          {clients?.map((client) => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
        {errors.clientId && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.clientId.message}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('projectDescription')}</label>
        <textarea
          {...register('description', { required: t('descriptionRequired') })}
          className="mt-1 p-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          rows={3}
        />
        {errors.description && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.description.message}</p>}
      </div>
      
      {isEdit && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('status')}</label>
          <select
            {...register('status', { required: t('status') + ' is required' })}
            className="mt-1 p-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{t(opt.value) || opt.label}</option>
            ))}
          </select>
          {errors.status && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.status.message}</p>}
        </div>
      )}
      
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('startDate')}</label>
          <input
            type="date"
            {...register('startDate', { required: t('startDateRequired') })}
            className="mt-1 p-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          {errors.startDate && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.startDate.message}</p>}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('endDate')}</label>
          <input
            type="date"
            {...register('endDate', { 
              required: t('endDateRequired'),
              validate: validateDates
            })}
            className="mt-1 p-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          {errors.endDate && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.endDate.message}</p>}
        </div>
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
          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600"
          disabled={isSubmitting}
        >
          {isSubmitting ? (isEdit ? t('loading') : t('loading')) : (isEdit ? t('save') : t('createProject'))}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm; 