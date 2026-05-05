import { useState, useRef } from 'react';
import { CATEGORIES } from '../utils/categories';
import useExpenseStore from '../store/useExpenseStore';

const MAX_FILE_BYTES = 1.5 * 1024 * 1024; // 1.5 MB per attachment

function makeForm(editExpense) {
  if (editExpense) {
    return {
      amount: String(editExpense.amount),
      category: editExpense.category,
      date: editExpense.date,
      note: editExpense.note || '',
      vendor: editExpense.vendor || '',
      billCopy: editExpense.billCopy || null,
      billCopyName: editExpense.billCopyName || '',
      paymentCopy: editExpense.paymentCopy || null,
      paymentCopyName: editExpense.paymentCopyName || '',
    };
  }
  return {
    amount: '',
    category: 'office_rental',
    date: new Date().toISOString().split('T')[0],
    note: '',
    vendor: '',
    billCopy: null,
    billCopyName: '',
    paymentCopy: null,
    paymentCopyName: '',
  };
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function AttachmentButton({ label, icon, value, name, onChange, inputRef }) {
  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={onChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
          value
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
            : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-indigo-400'
        }`}
      >
        <span>{icon}</span>
        <span className="truncate max-w-[120px]">{value ? name || 'Attached' : label}</span>
      </button>
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-red-400 hover:text-red-600 text-xs"
          title="Remove attachment"
        >
          ✕
        </button>
      )}
    </div>
  );
}

/**
 * Rendered with a key prop from the parent (Dashboard/Expenses) so that it
 * fully remounts — and re-initialises form state — whenever editExpense changes
 * or the modal is opened/closed. This avoids setState-in-effect.
 */
export default function ExpenseModal({ isOpen, onClose, editExpense }) {
  const [form, setForm] = useState(() => makeForm(editExpense));
  const [error, setError] = useState('');
  const billRef = useRef(null);
  const payRef = useRef(null);
  const addExpense = useExpenseStore((s) => s.addExpense);
  const updateExpense = useExpenseStore((s) => s.updateExpense);

  if (!isOpen) return null;

  const handleFile = async (field, nameField, fileOrNull) => {
    if (fileOrNull === null) {
      setForm((f) => ({ ...f, [field]: null, [nameField]: '' }));
      return;
    }
    const file = fileOrNull?.target?.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setError(`File "${file.name}" exceeds the 1.5 MB limit. Please use a smaller file.`);
      return;
    }
    try {
      const dataUrl = await readFileAsDataURL(file);
      setForm((f) => ({ ...f, [field]: dataUrl, [nameField]: file.name }));
      setError('');
    } catch {
      setError('Failed to read file. Please try again.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    const data = {
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
      note: form.note,
      vendor: form.vendor,
      billCopy: form.billCopy,
      billCopyName: form.billCopyName,
      paymentCopy: form.paymentCopy,
      paymentCopyName: form.paymentCopyName,
    };
    if (editExpense) {
      updateExpense(editExpense.id, data);
    } else {
      addExpense(data);
    }
    onClose();
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm';

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 lg:flex lg:items-center lg:justify-center"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="fixed inset-0 lg:relative lg:inset-auto bg-white dark:bg-gray-800 lg:rounded-2xl lg:w-full lg:max-w-lg lg:shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {editExpense ? 'Edit Expense' : 'Add Expense'}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">RM</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  className={`${inputClass} pl-10`}
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Vendor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Vendor / Payee
              </label>
              <input
                type="text"
                value={form.vendor}
                onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                placeholder="e.g. TNB, Syabas, Landlord…"
                className={inputClass}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat.id })}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                      form.category === cat.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={inputClass}
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Notes (optional)
              </label>
              <textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Reference number, description…"
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* File Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Attachments <span className="text-xs font-normal text-gray-400">(images or PDF, max 1.5 MB each)</span>
              </label>
              <div className="flex flex-wrap gap-3">
                <AttachmentButton
                  label="📄 Bill Copy"
                  icon="📄"
                  value={form.billCopy}
                  name={form.billCopyName}
                  onChange={(e) => handleFile('billCopy', 'billCopyName', e)}
                  inputRef={billRef}
                />
                <AttachmentButton
                  label="✅ Payment Copy"
                  icon="✅"
                  value={form.paymentCopy}
                  name={form.paymentCopyName}
                  onChange={(e) => handleFile('paymentCopy', 'paymentCopyName', e)}
                  inputRef={payRef}
                />
              </div>

              {/* Previews */}
              {(form.billCopy || form.paymentCopy) && (
                <div className="mt-3 flex gap-3 flex-wrap">
                  {form.billCopy && (
                    <AttachmentPreview
                      dataUrl={form.billCopy}
                      name={form.billCopyName}
                      label="Bill Copy"
                    />
                  )}
                  {form.paymentCopy && (
                    <AttachmentPreview
                      dataUrl={form.paymentCopy}
                      name={form.paymentCopyName}
                      label="Payment Copy"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="pt-2 pb-safe">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-colors"
              >
                {editExpense ? 'Update Expense' : 'Add Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function AttachmentPreview({ dataUrl, name, label }) {
  const isPdf = dataUrl?.startsWith('data:application/pdf') || name?.toLowerCase().endsWith('.pdf');
  return (
    <a
      href={dataUrl}
      download={name || label}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col items-center gap-1 p-2 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-indigo-400 transition-colors max-w-[100px]"
      title={`Download ${label}`}
    >
      {isPdf ? (
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-2xl">
          📑
        </div>
      ) : (
        <img
          src={dataUrl}
          alt={label}
          className="w-16 h-16 object-cover rounded-lg"
        />
      )}
      <span className="text-xs text-gray-500 dark:text-gray-400 truncate w-full text-center">{label}</span>
    </a>
  );
}
