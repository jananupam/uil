import React, { useMemo } from 'react';
import { ITRequest, RequestStatus } from '../types';
import { ChartBarIcon } from './icons';

interface TechnicianPerformanceChartProps {
  requests: ITRequest[];
}

const TechnicianPerformanceChart: React.FC<TechnicianPerformanceChartProps> = ({ requests }) => {
  const performanceData = useMemo(() => {
    const techPerformance: { [key: string]: { assigned: number; resolved: number } } = {};

    requests.forEach(req => {
      if (req.resolvedBy) {
        if (!techPerformance[req.resolvedBy]) {
          techPerformance[req.resolvedBy] = { assigned: 0, resolved: 0 };
        }

        if (req.status === RequestStatus.Resolved || req.status === RequestStatus.Closed) {
          techPerformance[req.resolvedBy].resolved += 1;
        } else { // 'New' or 'In Progress'
          techPerformance[req.resolvedBy].assigned += 1;
        }
      }
    });

    return Object.entries(techPerformance)
      .map(([name, counts]) => ({ name, ...counts }))
      .sort((a, b) => (b.assigned + b.resolved) - (a.assigned + a.resolved));
  }, [requests]);

  if (performanceData.length === 0) {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
                <ChartBarIcon className="w-6 h-6 text-slate-400 mr-3" />
                <h3 className="text-lg font-semibold text-slate-800">Technician Workload</h3>
            </div>
            <div className="text-center py-8 text-slate-500">
                <p>No assigned ticket data available to display workload metrics.</p>
            </div>
      </div>
    );
  }

  const maxCount = Math.max(...performanceData.map(d => d.assigned + d.resolved), 1);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center mb-2 sm:mb-0">
            <ChartBarIcon className="w-6 h-6 text-slate-500 mr-3" />
            <h3 className="text-lg font-semibold text-slate-800">Technician Workload: Assigned vs. Resolved</h3>
        </div>
        <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                <span>Assigned (Active)</span>
            </div>
            <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                <span>Resolved</span>
            </div>
        </div>
      </div>
      <div className="space-y-4">
        {performanceData.map(({ name, assigned, resolved }) => {
            const total = assigned + resolved;
            const barWidthPercentage = (total / maxCount) * 100;
            const resolvedSegmentWidth = total > 0 ? (resolved / total) * 100 : 0;
            const assignedSegmentWidth = total > 0 ? (assigned / total) * 100 : 0;
            
            return (
              <div key={name} className="grid grid-cols-1 sm:grid-cols-4 gap-x-4 items-center animate-fade-in-bar">
                <span className="text-sm font-medium text-slate-700 col-span-1 truncate mb-1 sm:mb-0">{name}</span>
                <div className="col-span-1 sm:col-span-3">
                  <div className="w-full bg-slate-200 rounded-full h-6" title={`Total tickets: ${total}`}>
                    <div
                      className="h-6 rounded-full flex"
                      style={{ width: `${barWidthPercentage}%` }}
                    >
                      {resolved > 0 && (
                        <div
                            className={`bg-green-500 h-full flex items-center justify-center ${assigned > 0 ? 'rounded-l-full' : 'rounded-full'}`}
                            style={{ width: `${resolvedSegmentWidth}%` }}
                            title={`Resolved: ${resolved}`}
                        >
                            <span className="text-xs font-bold text-white">{resolved}</span>
                        </div>
                      )}
                      {assigned > 0 && (
                        <div
                            className={`bg-yellow-500 h-full flex items-center justify-center ${resolved > 0 ? 'rounded-r-full' : 'rounded-full'}`}
                            style={{ width: `${assignedSegmentWidth}%` }}
                            title={`Assigned (Active): ${assigned}`}
                        >
                            <span className="text-xs font-bold text-white">{assigned}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
        })}
      </div>
      <style>{`
        @keyframes fade-in-bar {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-bar { animation: fade-in-bar 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default TechnicianPerformanceChart;
