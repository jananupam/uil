import React from 'react';
import type { UserRole } from '../App';
import { ComputerIcon, DashboardIcon, UserAdminIcon } from './icons';

interface HeaderProps {
    currentView: 'dashboard' | 'form';
    setView: (view: 'dashboard' | 'form') => void;
    userRole: UserRole;
    onToggleRole: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setView, userRole, onToggleRole }) => {
    const navItemClasses = "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors";
    const activeClasses = "bg-sky-600 text-white";
    const inactiveClasses = "text-slate-100 hover:bg-sky-800 hover:text-white";

    return (
        <header className="bg-sky-700 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <img src="https://exhibitorsearch.messefrankfurt.com/images/large/company_pictures/10000016202601/0052432186/1703220504846_2565465057.jpg" alt="Company Logo" className="h-10 w-auto rounded-md" />
                        <h1 className="ml-3 text-xl font-bold text-white">IT Service Desk</h1>
                    </div>
                    <nav className="flex items-center space-x-2">
                        <button 
                            onClick={() => setView('dashboard')}
                            className={`${navItemClasses} ${currentView === 'dashboard' ? activeClasses : inactiveClasses}`}
                        >
                            <DashboardIcon className="w-5 h-5" />
                            <span>Dashboard</span>
                        </button>
                        <button 
                            onClick={() => setView('form')}
                            className={`${navItemClasses} ${currentView === 'form' ? activeClasses : inactiveClasses}`}
                        >
                            <ComputerIcon className="w-5 h-5" />
                            <span>New Request</span>
                        </button>
                        <div className="border-l border-sky-600 pl-2 ml-2">
                            <button
                                onClick={onToggleRole}
                                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-slate-100 hover:bg-sky-800 hover:text-white"
                                title={`Switch to ${userRole === 'user' ? 'Admin' : 'User'} View`}
                            >
                                <UserAdminIcon className="w-6 h-6" />
                                <span className="capitalize">{userRole} View</span>
                            </button>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
};
