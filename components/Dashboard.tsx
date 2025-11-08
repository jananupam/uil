import React, { useState, useMemo } from 'react';
import type { ITRequest } from '../types';
import { RequestStatus } from '../types';
import { SortAscIcon, SortDescIcon, PaperclipIcon, CloseIcon, ExportIcon } from './icons';
import TechnicianPerformanceChart from './TechnicianPerformanceChart';

interface DashboardProps {
  requests: ITRequest[];
  onStatusChange: (ticketId: string, newStatus: RequestStatus) => void;
  isAdmin: boolean;
  onTechnicianAssign: (ticketId: string, technicianName: string) => void;
  onRemarksChange: (ticketId: string, remarks: string) => void;
}

const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
  const baseClasses = "px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center";
  const statusConfig = {
    [RequestStatus.New]: { classes: "bg-blue-100 text-blue-800", label: "New" },
    [RequestStatus.InProgress]: { classes: "bg-yellow-100 text-yellow-800", label: "In Progress" },
    [RequestStatus.Resolved]: { classes: "bg-green-100 text-green-800", label: "Resolved" },
    [RequestStatus.Closed]: { classes: "bg-slate-100 text-slate-800", label: "Closed" },
  };
  const config = statusConfig[status];
  return <span className={`${baseClasses} ${config.classes}`}>{config.label}</span>;
};

const Dashboard: React.FC<DashboardProps> = ({ requests, onStatusChange, isAdmin, onTechnicianAssign, onRemarksChange }) => {
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof ITRequest | null; direction: 'ascending' | 'descending' }>({ key: 'submittedAt', direction: 'descending' });
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [editingTechnicianId, setEditingTechnicianId] = useState<string | null>(null);
  const [editingRemarksId, setEditingRemarksId] = useState<string | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const stats = useMemo(() => {
    return requests.reduce((acc, req) => {
        acc.total++;
        if(req.status === RequestStatus.New) acc.new++;
        if(req.status === RequestStatus.InProgress) acc.inProgress++;
        if(req.status === RequestStatus.Resolved) acc.resolved++;
        return acc;
    }, { total: 0, new: 0, inProgress: 0, resolved: 0 });
  }, [requests]);

  const sortedAndFilteredRequests = useMemo(() => {
    let sortableItems = [...requests];
    
    if (filter) {
        sortableItems = sortableItems.filter(item =>
            Object.values(item).some(val =>
                String(val).toLowerCase().includes(filter.toLowerCase())
            )
        );
    }
    
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key!];
        const valB = b[sortConfig.key!];

        // Push null/undefined values to the bottom
        if (valA == null && valB != null) {
          return 1;
        }
        if (valA != null && valB == null) {
          return -1;
        }
        if (valA == null && valB == null) {
          return 0;
        }

        // Handle case-insensitive sorting for strings
        if (typeof valA === 'string' && typeof valB === 'string') {
          const lowerA = valA.toLowerCase();
          const lowerB = valB.toLowerCase();
          if (lowerA < lowerB) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
          }
          if (lowerA > lowerB) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
          }
          return 0;
        }
        
        // Default comparison for other types
        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [requests, filter, sortConfig]);
  
  const handleExportCSV = () => {
    const headers = ['Ticket ID', 'First Name', 'Last Name', 'Contact Number', 'Department', 'Problem', 'Status', 'Assigned To', 'Date Raised', 'Date Closed', 'Remarks'];
    
    const formatValue = (value: any) => {
      const str = String(value ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = sortedAndFilteredRequests.map(req => [
      formatValue(req.id),
      formatValue(req.firstName),
      formatValue(req.lastName),
      formatValue(req.contactNumber),
      formatValue(req.department),
      formatValue(req.problemCategories.join(', ') + (req.otherCategoryDetail ? `: ${req.otherCategoryDetail}` : '')),
      formatValue(req.status),
      formatValue(req.resolvedBy),
      formatValue(req.submittedAt.toLocaleDateString()),
      formatValue(req.closedAt ? req.closedAt.toLocaleDateString() : ''),
      formatValue(req.remarks)
    ].join(','));
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "it_service_requests.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const requestSort = (key: keyof ITRequest) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const SortableHeader: React.FC<{ sortKey: keyof ITRequest, children: React.ReactNode }> = ({ sortKey, children }) => {
    const isSorted = sortConfig.key === sortKey;
    return (
      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
        <button onClick={() => requestSort(sortKey)} className="group inline-flex items-center">
          {children}
          <span className="ml-2 flex-none rounded text-slate-400">
             {isSorted ? (sortConfig.direction === 'ascending' ? <SortAscIcon className="w-4 h-4" /> : <SortDescIcon className="w-4 h-4" />) : <SortAscIcon className="w-4 h-4 opacity-30 group-hover:opacity-100" />}
          </span>
        </button>
      </th>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {viewingImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity"
          onClick={() => setViewingImage(null)}
          aria-modal="true"
          role="dialog"
        >
          <div className="relative p-4" onClick={e => e.stopPropagation()}>
            <img src={viewingImage} alt="Request Attachment" className="max-w-screen-lg max-h-[85vh] rounded-lg shadow-2xl" />
            <button 
              onClick={() => setViewingImage(null)} 
              className="absolute -top-2 -right-2 bg-white rounded-full p-2 text-slate-800 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close image viewer"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-lg shadow p-5"><h3 className="text-sm font-medium text-slate-500">Total Requests</h3><p className="mt-1 text-3xl font-semibold text-slate-900">{stats.total}</p></div>
        <div className="bg-white rounded-lg shadow p-5"><h3 className="text-sm font-medium text-slate-500">New</h3><p className="mt-1 text-3xl font-semibold text-blue-600">{stats.new}</p></div>
        <div className="bg-white rounded-lg shadow p-5"><h3 className="text-sm font-medium text-slate-500">In Progress</h3><p className="mt-1 text-3xl font-semibold text-yellow-600">{stats.inProgress}</p></div>
        <div className="bg-white rounded-lg shadow p-5"><h3 className="text-sm font-medium text-slate-500">Resolved</h3><p className="mt-1 text-3xl font-semibold text-green-600">{stats.resolved}</p></div>
      </div>

      {isAdmin && <TechnicianPerformanceChart requests={requests} />}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
           <input
              type="text"
              placeholder="Search requests..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full sm:w-64 rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
            />
            {isAdmin && (
                <button 
                    onClick={handleExportCSV}
                    className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                >
                    <ExportIcon className="w-5 h-5 mr-2 -ml-1 text-slate-500" />
                    Export as CSV
                </button>
            )}
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <SortableHeader sortKey="id">Ticket ID</SortableHeader>
                  <SortableHeader sortKey="firstName">Requester</SortableHeader>
                  {isAdmin && <SortableHeader sortKey="contactNumber">Contact Number</SortableHeader>}
                  <SortableHeader sortKey="department">Department</SortableHeader>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Problem</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Attachment</th>
                  <SortableHeader sortKey="status">Status</SortableHeader>
                  {isAdmin && <SortableHeader sortKey="resolvedBy">Assigned To</SortableHeader>}
                  <SortableHeader sortKey="submittedAt">Date Raised</SortableHeader>
                  <SortableHeader sortKey="closedAt">Date Closed</SortableHeader>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Remarks</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {sortedAndFilteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-sky-600">{request.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{`${request.firstName} ${request.lastName}`}</td>
                    {isAdmin && <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{request.contactNumber}</td>}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{request.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 truncate max-w-xs">{request.problemCategories.join(', ')}{request.otherCategoryDetail ? `: ${request.otherCategoryDetail}` : ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      {request.imageUrl && (
                        <button onClick={() => setViewingImage(request.imageUrl!)} className="text-slate-400 hover:text-sky-600 p-1" aria-label="View attachment">
                          <PaperclipIcon className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm relative">
                       {isAdmin ? (
                        <>
                          {editingStatusId === request.id && (
                            <div 
                              className="absolute z-10 bottom-full mb-1 left-1/2 -translate-x-1/2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                              onMouseLeave={() => setEditingStatusId(null)}
                            >
                              <div className="py-1" role="menu" aria-orientation="vertical">
                                {Object.values(RequestStatus).map(status => (
                                  <button
                                    key={status}
                                    onClick={() => {
                                      onStatusChange(request.id, status);
                                      setEditingStatusId(null);
                                    }}
                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                    role="menuitem"
                                  >
                                    <StatusBadge status={status} />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          <button
                            onClick={() => setEditingStatusId(editingStatusId === request.id ? null : request.id)}
                            className="w-full text-left p-1 -m-1 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                            aria-haspopup="true"
                            aria-expanded={editingStatusId === request.id}
                          >
                            <StatusBadge status={request.status} />
                          </button>
                        </>
                      ) : (
                        <StatusBadge status={request.status} />
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {editingTechnicianId === request.id ? (
                           <input
                            type="text"
                            value={request.resolvedBy || ''}
                            onChange={(e) => onTechnicianAssign(request.id, e.target.value)}
                            onBlur={() => setEditingTechnicianId(null)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === 'Escape') {
                                    setEditingTechnicianId(null);
                                }
                            }}
                            className="block w-full max-w-[150px] rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                            placeholder="Assign..."
                            autoFocus
                            />
                        ) : (
                            <button 
                                onClick={() => setEditingTechnicianId(request.id)}
                                className="w-full text-left p-1 -m-1 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500"
                            >
                                {request.resolvedBy || <span className="italic text-slate-400">Unassigned</span>}
                            </button>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{request.submittedAt.toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{request.closedAt ? request.closedAt.toLocaleDateString() : <span className="text-slate-400">—</span>}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs">
                        {isAdmin && editingRemarksId === request.id ? (
                            <textarea
                                value={request.remarks || ''}
                                onChange={(e) => onRemarksChange(request.id, e.target.value)}
                                onBlur={() => setEditingRemarksId(null)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === 'Escape') {
                                        setEditingRemarksId(null);
                                        e.preventDefault();
                                    }
                                }}
                                className="block w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500"
                                rows={2}
                                autoFocus
                            />
                        ) : (
                            <div 
                                className={`w-full h-full p-1 -m-1 rounded-md ${isAdmin ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                                onClick={() => isAdmin && setEditingRemarksId(request.id)}
                                title={isAdmin ? 'Click to edit' : ''}
                            >
                                {request.remarks || (isAdmin ? <span className="italic text-slate-400">Add remarks...</span> : <span className="text-slate-400">—</span>)}
                            </div>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
        {sortedAndFilteredRequests.length === 0 && <div className="text-center p-12 text-slate-500">No requests found.</div>}
      </div>
    </div>
  );
};

export default Dashboard;