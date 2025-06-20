import { useState } from 'react';

const emptyLine = { description: '', quantity: 1, unitPrice: 0, totalHT: 0, totalTTC: 0 };

const DevisForm = ({ projectId, onSubmit, onCancel, loading }) => {
  const [status, setStatus] = useState('draft');
  const [lines, setLines] = useState([{ ...emptyLine }]);
  const [error, setError] = useState('');


  const totalHT = lines.reduce((sum, l) => sum + (parseFloat(l.quantity) * parseFloat(l.unitPrice) || 0), 0);
  const totalTTC = totalHT;

  const handleLineChange = (idx, field, value) => {
    setLines((prev) => prev.map((l, i) => i === idx ? { ...l, [field]: value, totalHT: (field === 'quantity' || field === 'unitPrice') ? (parseFloat(field === 'quantity' ? value : l.quantity) * parseFloat(field === 'unitPrice' ? value : l.unitPrice) || 0) : l.totalHT, totalTTC: (field === 'quantity' || field === 'unitPrice') ? (parseFloat(field === 'quantity' ? value : l.quantity) * parseFloat(field === 'unitPrice' ? value : l.unitPrice) || 0) : l.totalTTC } : l));
  };

  const addLine = () => setLines((prev) => [...prev, { ...emptyLine }]);
  const removeLine = (idx) => setLines((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (lines.some(l => !l.description || !l.quantity || !l.unitPrice)) {
      setError('All line items must have description, quantity, and unit price.');
      return;
    }
    onSubmit({
      projectId,
      status,
      totalHT,
      totalTTC,
      lines: lines.map(l => ({
        description: l.description,
        quantity: parseFloat(l.quantity),
        unitPrice: parseFloat(l.unitPrice),
        totalHT: l.totalHT,
        totalTTC: l.totalTTC,
      })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-500 p-2 rounded text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded px-2 py-1 w-full">
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Line Items</label>
        <div className="space-y-2">
          {lines.map((line, idx) => (
            <div key={idx} className="flex gap-2 items-end">
              <input
                type="text"
                placeholder="Description"
                value={line.description}
                onChange={e => handleLineChange(idx, 'description', e.target.value)}
                className="border rounded px-2 py-1 flex-1"
                required
              />
              <input
                type="number"
                min="0"
                step="any"
                placeholder="Quantity"
                value={line.quantity}
                onChange={e => handleLineChange(idx, 'quantity', e.target.value)}
                className="border rounded px-2 py-1 w-24"
                required
              />
              <input
                type="number"
                min="0"
                step="any"
                placeholder="Unit Price"
                value={line.unitPrice}
                onChange={e => handleLineChange(idx, 'unitPrice', e.target.value)}
                className="border rounded px-2 py-1 w-24"
                required
              />
              <div className="w-24 text-right">{(line.totalHT || 0).toFixed(2)} €</div>
              <button type="button" className="text-red-500 px-2" onClick={() => removeLine(idx)} disabled={lines.length === 1}>Remove</button>
            </div>
          ))}
        </div>
        <button type="button" className="mt-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300" onClick={addLine}>Add Line</button>
      </div>
      <div className="flex justify-end gap-4 items-center">
        <div className="font-semibold">Total: {totalHT.toFixed(2)} €</div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={onCancel} disabled={loading}>Cancel</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={loading}>{loading ? 'Saving...' : 'Save Quote'}</button>
      </div>
    </form>
  );
};

export default DevisForm; 