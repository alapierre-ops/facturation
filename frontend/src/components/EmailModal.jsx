import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Modal from './Modal';

const EmailModal = ({ onClose, onSend, defaultEmail, title }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState(defaultEmail || '');

  useEffect(() => {
    setEmail(defaultEmail || '');
  }, [defaultEmail]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(email);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('email')}
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="exemple@email.com"
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={!email}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('sendEmail')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EmailModal; 