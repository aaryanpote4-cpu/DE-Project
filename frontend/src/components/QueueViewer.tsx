import React from 'react';
import { type Order } from '../api';
import { ListOrdered, Clock, Truck as TruckIcon } from 'lucide-react';

interface QueueViewerProps {
  queue: Order[];
  statuses: Record<string, string>;
  onProcessNext: () => void;
}

const QueueViewer: React.FC<QueueViewerProps> = ({ queue, statuses, onProcessNext }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full min-h-[300px]">
      <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
        <h3 className="flex items-center gap-2 text-md font-semibold text-gray-800">
          <ListOrdered className="w-5 h-5 text-blue-500" /> Order Queue
        </h3>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{queue.length} Pending</span>
      </div>

      <div className="flex-grow overflow-y-auto mb-4 space-y-2">
        {queue.length === 0 ? (
          <div className="text-slate-500 text-sm italic text-center py-8">Queue is empty</div>
        ) : (
          queue.map((order, idx) => (
            <div key={`${order.id}-${idx}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="min-w-[24px] h-6 flex items-center justify-center bg-blue-200 text-blue-800 rounded-full text-xs font-bold">{idx + 1}</div>
              <div className="flex-grow flex justify-between items-center text-sm">
                <span className="text-gray-600 truncate max-w-[120px]" title={order.id}>{order.id.slice(0, 8)}...</span>
                <span className="flex items-center gap-1 text-amber-600 font-medium text-xs bg-amber-50 px-2 py-1 rounded">
                  <Clock className="w-3 h-3" /> {statuses[order.id] || order.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={onProcessNext}
        disabled={queue.length === 0}
        className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${
          queue.length > 0 
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg' 
            : 'bg-gray-200 text-slate-500 cursor-not-allowed'
        }`}
      >
        <TruckIcon className="w-5 h-5" /> Process Next Order
      </button>
    </div>
  );
};

export default QueueViewer;
