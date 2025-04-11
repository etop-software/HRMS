import React, { useState } from "react";
import { MagnifyingGlassIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";

const MultiSelectDropdown = ({
  employeesforDropdown,
  selectedEmployees,
  setSelectedEmployees,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isAllSelected = employeesforDropdown.length > 0 && 
    selectedEmployees.length === employeesforDropdown.length;

  const handleCheckboxChange = (employeeId) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAllChange = () => {
    setSelectedEmployees(isAllSelected ? [] : employeesforDropdown.map((e) => e.employee_id));
  };

  const filteredEmployees = employeesforDropdown.filter((employee) =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-[300px] max-w-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-left shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          {/* <span className="block truncate">
            {selectedEmployees.length > 0
              ? `${selectedEmployees.length} Selected`
              : "Select Employees"}
          </span> */}
          <span> Select Employees</span>
          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
        </div>
        {/* {selectedEmployees.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedEmployees.slice(0, 4).map((id) => {
              const employee = employeesforDropdown.find((e) => e.employee_id === id);
              return employee ? (
                <span
                  key={id}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {employee.name}
                </span>
              ) : null;
            })}
            {selectedEmployees.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{selectedEmployees.length - 3} more
              </span>
            )}
          </div>
        )} */}
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-72">
            <label className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAllChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">Select All</span>
            </label>

            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <label
                  key={employee.employee_id}
                  className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={employee.employee_id}
                    checked={selectedEmployees.includes(employee.employee_id)}
                    onChange={() => handleCheckboxChange(employee.employee_id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="ml-3 text-sm text-gray-700">{employee.name}</span>
                </label>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">No employees found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
