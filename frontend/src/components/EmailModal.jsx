import { useState } from 'react';
import Modal from './Modal';

const EmailModal = ({ isOpen, onClose, onSend, title, recipientEmail, loading }) => {
  const [email, setEmail] = useState(recipientEmail || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(email);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email du destinataire
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="exemple@email.com"
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || !email}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Envoi...' : 'Envoyer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EmailModal; 