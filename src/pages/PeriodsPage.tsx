import React, { useState, useEffect } from 'react';
import api from '../apiBase';

interface Period {
  _id: string;
  period: string;
  closed: boolean;
  closedAt?: string;
  closedBy?: string;
}

const PeriodsPage: React.FC = () => {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [closedPeriods, setClosedPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPeriod, setNewPeriod] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPeriods();
    fetchClosedPeriods();
  }, []);

  const fetchPeriods = async () => {
    try {
      const response = await api.get<Period[]>('/periods');
      setPeriods(response.data);
    } catch (error) {
      console.error('Error fetching periods:', error);
      setError('Failed to fetch periods');
    }
  };

  const fetchClosedPeriods = async () => {
    try {
      const response = await api.get<Period[]>('/periods/closed');
      setClosedPeriods(response.data);
    } catch (error) {
      console.error('Error fetching closed periods:', error);
    } finally {
      setLoading(false);
    }
  };

  const closePeriod = async () => {
    if (!newPeriod) return;
    try {
      await api.post('/periods/close', { period: newPeriod, closedBy: 'admin' });
      setNewPeriod('');
      fetchPeriods();
      fetchClosedPeriods();
    } catch (error) {
      console.error('Error closing period:', error);
      setError('Failed to close period');
    }
  };

  const openPeriod = async (period: string) => {
    try {
      await api.put(`/periods/${period}/open`);
      fetchPeriods();
      fetchClosedPeriods();
    } catch (error) {
      console.error('Error opening period:', error);
      setError('Failed to open period');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Period Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Close Period Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Close Period</h2>
        <div className="flex gap-4">
          <input
            type="month"
            value={newPeriod}
            onChange={(e) => setNewPeriod(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 flex-1"
            placeholder="YYYY-MM"
          />
          <button
            onClick={closePeriod}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Close Period
          </button>
        </div>
      </div>

      {/* Closed Periods */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Closed Periods (These cause 403 errors)</h2>
        {closedPeriods.length === 0 ? (
          <p className="text-gray-500">No closed periods found.</p>
        ) : (
          <div className="space-y-2">
            {closedPeriods.map((period) => (
              <div key={period._id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                <div>
                  <span className="font-semibold">{period.period}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    Closed by: {period.closedBy} on {new Date(period.closedAt!).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => openPeriod(period.period)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Open Period
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Periods */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">All Periods</h2>
        {periods.length === 0 ? (
          <p className="text-gray-500">No periods found.</p>
        ) : (
          <div className="space-y-2">
            {periods.map((period) => (
              <div key={period._id} className={`flex items-center justify-between p-3 border rounded ${
                period.closed ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
              }`}>
                <div>
                  <span className="font-semibold">{period.period}</span>
                  <span className={`text-sm ml-2 ${
                    period.closed ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {period.closed ? 'CLOSED' : 'OPEN'}
                  </span>
                </div>
                {period.closed && (
                  <button
                    onClick={() => openPeriod(period.period)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Open Period
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PeriodsPage; 