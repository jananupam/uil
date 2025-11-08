
import React, { useState, useCallback } from 'react';
import { MOCK_REQUESTS } from './constants';
import Dashboard from './components/Dashboard';
import ITRequestForm from './components/ITRequestForm';
// Fix: Import RequestStatus enum to use its members.
import { ITRequest, RequestStatus } from './types';
import { Header } from './components/Header';

type View = 'dashboard' | 'form';

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [requests, setRequests] = useState<ITRequest[]>(MOCK_REQUESTS);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFormSubmit = useCallback((newRequest: Omit<ITRequest, 'id' | 'submittedAt' | 'status'>) => {
    const newTicketId = `TICKET-${String(requests.length + 1).padStart(3, '0')}`;
    const submittedRequest: ITRequest = {
      ...newRequest,
      id: newTicketId,
      submittedAt: new Date(),
      // Fix: Use the RequestStatus enum member for type safety instead of a string literal.
      status: RequestStatus.New,
    };
    setRequests(prevRequests => [submittedRequest, ...prevRequests]);
    setView('dashboard');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }, [requests.length]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header currentView={view} setView={setView} />
      <main className="p-4 sm:p-6 lg:p-8">
        {showSuccess && (
          <div className="mb-4 max-w-7xl mx-auto bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
            <p className="font-bold">Success!</p>
            <p>Your IT service request has been submitted successfully.</p>
          </div>
        )}
        {view === 'dashboard' ? (
          <Dashboard requests={requests} />
        ) : (
          <ITRequestForm onSubmit={handleFormSubmit} />
        )}
      </main>
    </div>
  );
};

export default App;
