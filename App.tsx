import React, { useState, useCallback } from 'react';
import { MOCK_REQUESTS } from './constants';
import Dashboard from './components/Dashboard';
import ITRequestForm from './components/ITRequestForm';
import { ITRequest, RequestStatus } from './types';
import { Header } from './components/Header';
import LoginModal from './components/LoginModal'; // Import the new LoginModal

type View = 'dashboard' | 'form';
export type UserRole = 'user' | 'admin';

// Simulate a logged-in user for demonstration purposes
const CURRENT_USER = {
  id: 'user-1',
  firstName: 'Alice',
  lastName: 'Johnson',
  department: 'Marketing',
  email: 'alice.j@example.com',
};

// For demonstration purposes, the password is hardcoded. In a real application, this would be handled by a secure authentication service.
const ADMIN_PASSWORD = 'admin123';

const TECHNICIANS = ['John Doe', 'Jane Smith', 'Peter Jones', 'Emily White'];

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [requests, setRequests] = useState<ITRequest[]>(MOCK_REQUESTS);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFormSubmit = useCallback((newRequestData: Omit<ITRequest, 'id' | 'submittedAt' | 'status' | 'requesterId'>) => {
    const newTicketId = `TICKET-${String(requests.length + 1).padStart(3, '0')}`;
    const submittedRequest: ITRequest = {
      ...newRequestData,
      id: newTicketId,
      requesterId: CURRENT_USER.id,
      submittedAt: new Date(),
      status: RequestStatus.New,
    };
    setRequests(prevRequests => [submittedRequest, ...prevRequests]);
    setView('dashboard');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  }, [requests.length]);

  const handleStatusChange = useCallback((ticketId: string, newStatus: RequestStatus) => {
    setRequests(prevRequests =>
      prevRequests.map(req => {
        if (req.id === ticketId) {
          const updatedReq: ITRequest = { ...req, status: newStatus };
          // If the status is now resolved or closed, and it wasn't before, assign a technician
          if ((newStatus === RequestStatus.Resolved || newStatus === RequestStatus.Closed) && !req.resolvedBy) {
            const randomTechnician = TECHNICIANS[Math.floor(Math.random() * TECHNICIANS.length)];
            updatedReq.resolvedBy = randomTechnician;
          }
          
          // Set or clear the closedAt date
          if (newStatus === RequestStatus.Closed) {
            updatedReq.closedAt = new Date();
          } else {
            updatedReq.closedAt = undefined;
          }

          return updatedReq;
        }
        return req;
      })
    );
  }, []);

  const handleTechnicianAssign = useCallback((ticketId: string, technicianName: string) => {
    setRequests(prevRequests =>
      prevRequests.map(req => 
        req.id === ticketId ? { ...req, resolvedBy: technicianName || undefined } : req
      )
    );
  }, []);
  
  const handleRemarksChange = useCallback((ticketId: string, newRemarks: string) => {
    setRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === ticketId ? { ...req, remarks: newRemarks } : req
      )
    );
  }, []);

  const handleLogin = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true);
      setUserRole('admin');
      setShowLoginModal(false);
      setLoginError('');
    } else {
      setLoginError('Incorrect password. Please try again.');
    }
  };
  
  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setUserRole('user');
  };

  const handleRoleToggle = () => {
    if (userRole === 'admin') {
      handleLogout();
    } else {
      setShowLoginModal(true);
    }
  };

  const isAdmin = userRole === 'admin' && isAdminAuthenticated;

  const visibleRequests = isAdmin
    ? requests
    : requests.filter(req => req.requesterId === CURRENT_USER.id);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header 
        currentView={view} 
        setView={setView} 
        userRole={userRole} 
        onToggleRole={handleRoleToggle}
      />
      {showLoginModal && (
        <LoginModal
          onSubmit={handleLogin}
          onClose={() => {
            setShowLoginModal(false);
            setLoginError('');
          }}
          error={loginError}
        />
      )}
      <main className="p-4 sm:p-6 lg:p-8">
        {showSuccess && (
          <div className="mb-4 max-w-7xl mx-auto bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert">
            <p className="font-bold">Success!</p>
            <p>Your IT service request has been submitted successfully.</p>
          </div>
        )}
        {view === 'dashboard' ? (
          <Dashboard 
            requests={visibleRequests} 
            onStatusChange={handleStatusChange} 
            isAdmin={isAdmin}
            onTechnicianAssign={handleTechnicianAssign}
            onRemarksChange={handleRemarksChange}
          />
        ) : (
          <ITRequestForm onSubmit={handleFormSubmit} />
        )}
      </main>
    </div>
  );
};

export default App;