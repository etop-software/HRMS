import React from 'react';
import { UserCircle, Monitor } from 'lucide-react';

const AttendanceTable = ({ data }) => {
  return (
    <div className="w-[600px] overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm cursor-pointer">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Employee</span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Device</span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Date</span>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Time</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data && data.length > 0 ? (
              data.map((record, index) => {
                const getRandomColor = () => {
                  const colors = ['bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-pink-100', 'bg-indigo-100'];
                  return colors[Math.floor(Math.random() * colors.length)];
                };

                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-full ${getRandomColor()} flex items-center justify-center`}>
                          <span className="text-sm font-semibold text-gray-700">
                            {record.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{record.name || 0}</div>
                          <div className="text-xs text-gray-500">ID: {record.employee_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <Monitor className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-nowrap text-gray-600">{record.device_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-sm text-nowrap text-gray-600">
                        {record.datetime.split('T')[0]}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-sm text-gray-600">
                        {record.datetime.split('T')[1].slice(0, 5)}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="px-4 py-3 text-center text-gray-600">
                  <p className="mt-2 font-medium">No attendance records found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;
