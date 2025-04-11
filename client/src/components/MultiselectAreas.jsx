import React, { useState } from "react";
import { MagnifyingGlassIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";

const MultiSelectDropdownAreas = ({
  areasForDropdown,  // Change employees to areas
  selectedAreas,     // Change employees to selected areas
  setSelectedAreas,  // Change setSelectedEmployees to setSelectedAreas
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isAllSelected = areasForDropdown.length > 0 &&
    selectedAreas.length === areasForDropdown.length;

  const handleCheckboxChange = (areaId) => {
    setSelectedAreas((prev) =>
      prev.includes(areaId)
        ? prev.filter((id) => id !== areaId)
        : [...prev, areaId]
    );
  };

  const handleSelectAllChange = () => {
    setSelectedAreas(isAllSelected ? [] : areasForDropdown.map((a) => a.area_id));
  };

  const filteredAreas = areasForDropdown.filter((area) =>
    area.area_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-[280px] max-w-md">
      <button
       type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-left shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <span> Select Areas</span>
          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
        </div>
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search areas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-20 min-h-[100px]">
            <label className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAllChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="ml-3 text-sm font-medium text-gray-700">Select All</span>
            </label>

            {filteredAreas.length > 0 ? (
              filteredAreas.map((area) => (
                <label
                  key={area.area_id}
                  className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={area.area_id}
                    checked={selectedAreas.includes(area.area_id)}
                    onChange={() => handleCheckboxChange(area.area_id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="ml-3 text-sm text-gray-700">{area.area_name}</span>
                </label>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">No areas found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdownAreas;
