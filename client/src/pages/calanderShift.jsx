import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import axios from "axios";

const ShiftCalendar = () => {
  const [events, setEvents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState(""); // Start with empty string

  // Fetch employees and set default selectedEmpId
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(import.meta.env.VITE_API_URL + "/api/employees/Dropdown/values");
        const employeeData = response.data;
        setEmployees(employeeData);
        if (employeeData.length > 0) {
          setSelectedEmpId(employeeData[0].employee_id); // Set first employee as default
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  // Fetch shifts based on selectedEmpId
  useEffect(() => {
    const fetchShifts = async () => {
      setEvents([]); // Reset events before fetching
      try {
        const response = await axios.get(import.meta.env.VITE_API_URL + "/api/employeeShift/shifts", {
          params: {
            start: "2024-01-01",
            end: "2030-04-30",
            empId: selectedEmpId,
          },
        });
        const uniqueEvents = Array.from(
          new Map(response.data.map((event) => [event.id || `${event.start}-${event.shiftName}`, event])).values()
        );
        setEvents(uniqueEvents);
      } catch (error) {
        console.error("Error fetching shifts:", error);
        setEvents([]); // Clear on error
      }
    };

    if (selectedEmpId) { // Only fetch if selectedEmpId is not empty
      fetchShifts();
    } else {
      setEvents([]); // Clear events when no valid employee is selected
    }
  }, [selectedEmpId]);

  const getShiftColor = (shiftName) => {
    if (!shiftName) return "#3788d8";
    const name = shiftName.toLowerCase();
    if (name.includes("morning")) return "#4CAF50";
    if (name.includes("evening")) return "#FF9800";
    if (name.includes("night")) return "#9C27B0";
    return "#2196F3";
  };

  return (
    <div className="p-4 rounded-lg shadow-lg">
      <div className="mb-4">
        <label htmlFor="empId" className="mr-2">Select Employee:</label>
        <select
          id="empId"
          value={selectedEmpId}
          onChange={(e) => setSelectedEmpId(e.target.value)}
          className="p-2 border rounded-md"
        >
          {employees.length === 0 ? (
            <option value="" disabled>Loading employees...</option>
          ) : (
            <>
              <option value="" disabled>Select an employee</option>
              {employees.map((emp) => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.name} (ID: {emp.employee_id})
                </option>
              ))}
            </>
          )}
        </select>
      </div>

      <FullCalendar
        key={selectedEmpId}
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events.map((event) => ({
          ...event,
          backgroundColor: getShiftColor(event.shiftName),
          borderColor: getShiftColor(event.shiftName),
        }))}
        eventContent={({ event }) => {
          const { shiftName, shiftCode, inPunch, outPunch } = event.extendedProps;
          const trimmedInPunch = new Date(inPunch).toISOString().slice(11, 16);
          const trimmedOutPunch = new Date(outPunch).toISOString().slice(11, 16);
          const title = shiftName || shiftCode;

          return (
            <div className="p-1">
              <div className="font-bold text-white text-sm">{title}</div>
              <div className="text-xs text-white/90">
                <span>{trimmedInPunch} - {trimmedOutPunch}</span>
              </div>
            </div>
          );
        }}
        height="auto"
        headerToolbar={{}}
        eventDisplay="block"
        eventTextColor="#FFFFFF"
        dayMaxEvents={3}
        moreLinkClassNames="text-blue-600 font-medium"
        dayCellClassNames="bg-white border-gray-200"
        eventClassNames="rounded-md shadow-sm m-1"
      />
    </div>
  );
};

export default ShiftCalendar;