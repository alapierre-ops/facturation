import { useState, useEffect } from 'react';
import { getAvailableCountries, getTaxRateOptions, calculateLineTotals } from '../../api/taxApi';

const emptyLine = { description: '', quantity: 1, unitPrice: 0, subtotal: 0, taxAmount: 0, total: 0 };

const DevisForm = ({ projectId, onSubmit, onCancel, loading }) => {
  const [status, setStatus] = useState('draft');
  const [country, setCountry] = useState('FRANCE');
  const [taxRate, setTaxRate] = useState('STANDARD');
  const [notes, setNotes] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [lines, setLines] = useState([{ ...emptyLine }]);
  const [error, setError] = useState('');
  const [countries, setCountries] = useState([]);
  const [taxRateOptions, setTaxRateOptions] = useState([]);
  const [isLoadingTaxData, setIsLoadingTaxData] = useState(false);

  const paymentTypes = [
    { value: '', label: 'Select payment type' },
    { value: 'check', label: 'Check' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'crypto', label: 'Cryptocurrency' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'cash', label: 'Cash' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    const loadTaxData = async () => {
      setIsLoadingTaxData(true);
      try {
        const countriesRes = await getAvailableCountries();
        setCountries(countriesRes.data);
        
        const taxOptionsRes = await getTaxRateOptions(country);
        setTaxRateOptions(taxOptionsRes.data);
      } catch (err) {
        console.error('Error loading tax data:', err);
      } finally {
        setIsLoadingTaxData(false);
      }
    };
    
    loadTaxData();
  }, []);

  useEffect(() => {
    const loadTaxRateOptions = async () => {
      try {
        const res = await getTaxRateOptions(country);
        setTaxRateOptions(res.data);
        setTaxRate(res.data[0]?.value || 'STANDARD');
      } catch (err) {
        console.error('Error loading tax rate options:', err);
      }
    };
    
    if (country) {
      loadTaxRateOptions();
    }
  }, [country]);

  useEffect(() => {
    const recalculateAllLines = async () => {
      if (lines.length > 0 && country && taxRate) {
        const updatedLines = await Promise.all(
          lines.map(async (line) => {
            if (line.quantity && line.unitPrice) {
              try {
                const lineTotals = await calculateLineTotals(line.quantity, line.unitPrice, country, taxRate);
                return {
                  ...line,
                  subtotal: lineTotals.data.subtotal,
                  taxAmount: lineTotals.data.taxAmount,
                  total: lineTotals.data.total
                };
              } catch (err) {
                console.error('Error recalculating line:', err);
                return line;
              }
            }
            return line;
          })
        );
        setLines(updatedLines);
      }
    };

    recalculateAllLines();
  }, [country, taxRate]);

  const calculateTotals = () => {
    let subtotal = 0;
    let totalTax = 0;
    
    lines.forEach(line => {
      subtotal += line.subtotal || 0;
      totalTax += line.taxAmount || 0;
    });
    
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(totalTax * 100) / 100,
      total: Math.round((subtotal + totalTax) * 100) / 100
    };
  };

  const totals = calculateTotals();

  const handleLineChange = async (idx, field, value) => {
    const updatedLines = [...lines];
    updatedLines[idx] = { ...updatedLines[idx], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? parseFloat(value) : parseFloat(updatedLines[idx].quantity);
      const unitPrice = field === 'unitPrice' ? parseFloat(value) : parseFloat(updatedLines[idx].unitPrice);
      
      if (quantity && unitPrice) {
        try {
          const lineTotals = await calculateLineTotals(quantity, unitPrice, country, taxRate);
          updatedLines[idx] = {
            ...updatedLines[idx],
            subtotal: lineTotals.data.subtotal,
            taxAmount: lineTotals.data.taxAmount,
            total: lineTotals.data.total
          };
        } catch (err) {
          console.error('Error calculating line totals:', err);
        }
      }
    }
    
    setLines(updatedLines);
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
      country,
      taxRate,
      notes: notes.trim() || null,
      paymentType: paymentType || null,
      lines: lines.map(l => ({
        description: l.description,
        quantity: parseFloat(l.quantity),
        unitPrice: parseFloat(l.unitPrice),
        subtotal: l.subtotal,
        taxAmount: l.taxAmount,
        total: l.total,
      })),
    });
  };

  const getCurrencySymbol = () => {
    const selectedCountry = countries.find(c => c.code === country);
    return selectedCountry?.symbol || '€';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-500 p-2 rounded text-sm">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <label className="block text-sm font-medium mb-1">Country</label>
          <select 
            value={country} 
            onChange={e => setCountry(e.target.value)} 
            className="border rounded px-2 py-1 w-full"
            disabled={isLoadingTaxData}
          >
            {countries.map(country => (
              <option key={country.code} value={country.code}>
                {country.name} ({country.currency})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Tax Rate</label>
          <select 
            value={taxRate} 
            onChange={e => setTaxRate(e.target.value)} 
            className="border rounded px-2 py-1 w-full"
            disabled={isLoadingTaxData}
          >
            {taxRateOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Payment Type</label>
          <select 
            value={paymentType} 
            onChange={e => setPaymentType(e.target.value)} 
            className="border rounded px-2 py-1 w-full"
          >
            {paymentTypes.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Additional notes or terms..."
          rows={3}
          className="border rounded px-2 py-1 w-full"
        />
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
              <div className="w-20 text-right text-sm">
                <div>{(line.subtotal || 0).toFixed(2)} {getCurrencySymbol()}</div>
                <div className="text-xs text-gray-500">+{(line.taxAmount || 0).toFixed(2)}</div>
                <div className="font-semibold">{(line.total || 0).toFixed(2)} {getCurrencySymbol()}</div>
              </div>
              <button type="button" className="text-red-500 px-2" onClick={() => removeLine(idx)} disabled={lines.length === 1}>Remove</button>
            </div>
          ))}
        </div>
        <button type="button" className="mt-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300" onClick={addLine}>Add Line</button>
      </div>
      
      <div className="flex justify-end gap-4 items-center">
        <div className="text-right">
          <div className="text-sm text-gray-600">Subtotal: {totals.subtotal.toFixed(2)} {getCurrencySymbol()}</div>
          <div className="text-sm text-gray-600">Tax: {totals.taxAmount.toFixed(2)} {getCurrencySymbol()}</div>
          <div className="font-semibold text-lg">Total: {totals.total.toFixed(2)} {getCurrencySymbol()}</div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <button type="button" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={onCancel} disabled={loading}>Cancel</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={loading || isLoadingTaxData}>
          {loading ? 'Saving...' : 'Save Quote'}
        </button>
      </div>
    </form>
  );
};

export default DevisForm; 