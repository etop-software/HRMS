import React, { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  PencilSquareIcon,
  TrashIcon,
  UserPlusIcon,
} from "@heroicons/react/24/solid";
import {
  Card,
  CardHeader,
  Input,
  Dialog,
  Typography,
  Button,
  CardBody,
  CardFooter,
  Textarea,
  Alert
} from "@material-tailwind/react";

const TABLE_HEAD = [
  "Employee ID",
  "Name",
  "Date",
  "Punch In 1",
  "Punch Out 1",
  "Remarks",
  "Actions",
];

const Attendance = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [attendances, setAttendances] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    color: "green" // or "red" for errors
  });

  // Handler for when the date is changed manually
  const handlePunchTimeChange1 = (newDate) => {
    setDate(newDate); // Update the state with the new date
  };

  const handleDelete = async (id) => {
    console.log("Delete button clicked for ID:", id);
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/manualLogs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete record');
      }
  
      // Remove the deleted record from the local state
      setAttendances((prev) => prev.filter((record) => record.id !== id));
  
      alert("Record deleted successfully!");
    } catch (error) {
      console.error("Error deleting attendance record:", error);
      alert("Failed to delete the record. Please try again.");
    }
};

  

  // Handler for going to the previous day
  const handlePrevDay = () => {
    const prevDay = new Date(date);
    prevDay.setDate(prevDay.getDate() - 1); // Subtract 1 day
    const newDate = prevDay.toISOString().split("T")[0]; // Format the new date
    setDate(newDate); // Update the state with the new date
  };

  const handleNextDay = () => {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1); // Add 1 day
    const newDate = nextDay.toISOString().split("T")[0]; // Format the new date
    setDate(newDate); // Update the state with the new date
  };


  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const fetchAttendances = async (date) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/manualLogs?date=${date}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setAttendances(data.data);
      } else {
        console.error("Failed to fetch attendance records:", response.statusText);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };
  

useEffect(() => {
  fetchAttendances(date); // Fetch attendance records when date changes
}, [date]); // Re-fetch whenever the date changes


  const handleOpenAdd = () => setOpenAdd(!openAdd);

  const filteredAttendances = useMemo(
    () =>
      Array.isArray(attendances) &&
      attendances.filter(({ employee_id, datetime }) => {
        // Convert employee_id to string if it's not already
        const employeeIdStr = String(employee_id || "");

        return (
          employeeIdStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
          datetime.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }),
    [searchQuery, attendances] 
  );

  const onSubmitAdd = async (data) => {
    const requestBody = {
      employee_id: data.employee_id,
      datetime: data.datetime,
      punchintime: data.punchintime,
      punchouttime: data.punchouttime,
      terminal_id: data.terminal_id,
      remarks: data.remarks,
    };

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/manualLogs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        await fetchAttendances();
        setNotification({
          show: true,
          message: "Record added successfully",
          color: "green"
        });
        setTimeout(() => setNotification({ show: false }), 3000);
      }else {
        const errorData = await response.json();
        console.error("Submission error:", response.statusText, errorData);
      }
    } catch (error) {
      console.error("Network error:", error);
    }

    reset();
    setOpenAdd(false);
  };

  const handlePunchTimeChange = (attendanceId, field, value) => {
    setAttendances((prevAttendances) =>
      prevAttendances.map((attendance) =>
        attendance.id === attendanceId
          ? { ...attendance, [field]: value }
          : attendance
      )
    );
  };

  const handleSavePunchTimes = async (attendanceId, punchInTime, punchOutTime, remarks) => {

    const updatedAttendance = { punchintime: punchInTime, punchouttime: punchOutTime ,remarks:remarks};
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/manualLogs/${attendanceId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedAttendance),
        }
      );

      if (response.ok) {
        await fetchAttendances();
        setNotification({
          show: true,
          message: "Record updated successfully",
          color: "green"
        });
        setTimeout(() => setNotification({ show: false }), 3000);
      } else {
        setNotification({
          show: true,
          message: "Operation failed: " + response.statusText,
          color: "red"
        });
        setTimeout(() => setNotification({ show: false }), 3000);
        
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAttendances.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredAttendances.length / itemsPerPage);

  return (
    <Card className="h-full w-full">
      {notification.show && (
  <div className={`fixed top-4 right-4 z-50 rounded-lg p-4 shadow-lg ${
    notification.color === "green" ? "bg-green-500" : "bg-red-500"
  } text-white`}>
    <div className="flex items-center gap-2">
      {notification.color === "green" ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span>{notification.message}</span>
    </div>
  </div>
)}
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="flex items-center justify-between gap-5 mt-2 mb-3">
          <Button
            className="flex items-center gap-2"
            size="sm"
            onClick={handleOpenAdd}
            color="blue"
          >
            <UserPlusIcon strokeWidth={2} className="h-5 w-4" /> Add Manual Logs
          </Button>
        </div>
        <div className="flex items-center justify-between gap-4 md:flex-row">
      <Button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handlePrevDay} // Call the function to go to the previous day
      >
        Prev Day
      </Button>

      <input
        className="w-[200px] border border-gray-400 rounded-md px-2 py-1"
        type="date"
        value={date} // Bind the input value to the state
        onChange={(e) => handlePunchTimeChange1(e.target.value)} // Call the handler on change
      />

      <Button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleNextDay} // Call the function to go to the next day
      >
        Next Day
      </Button>
    </div>
         </CardHeader>

      {/* Add Attendance Dialog */}
      <Dialog size="sm" open={openAdd} handler={handleOpenAdd}>
        <Card>
          <form onSubmit={handleSubmit(onSubmitAdd)}>
            <CardBody className="grid gap-6">
              <Typography variant="h6" color="gray">
                Add Manual Logs
              </Typography>
              <Input
                label="Employee ID"
                {...register("employee_id", {
                  required: "Employee ID is required",
                })}
              />
              <Input
                label="Datetime"
                type="date"
                {...register("datetime", { required: "Datetime is required" })}
              />
              <Input
                label="Punch In Time"
                type="datetime-local"
                {...register("punchintime", {
                  required: "Punch In Time is required",
                })}
              />
              <Input
                label="Punch Out Time"
                type="datetime-local"
                {...register("punchouttime", {
                  required: "Punch Out Time is required",
                })}
              />
              <Input
                label="Remarks"
                {...register("remarks", {
                  required: "remarks are required",
                })}
              />
            </CardBody>
            <CardFooter>
              <Button type="submit" variant="gradient" color="blue">
                Add Attendance
              </Button>
              <Button
                variant="text"
                color="blue"
                onClick={() => handleOpenAdd(false)}
              >
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Card>
      </Dialog>

      {/* Attendance Table */}
      <div></div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((attendance) => (
              <tr key={`${attendance.employee_id}_${attendance.date}`}>
                <td className="px-3 py-2 whitespace-nowrap w-3 text-sm font-medium text-gray-900">
                  {attendance.employee_id}
                </td>
                <td className="px-5 py-2 whitespace-nowrap w-5 text-sm font-medium text-gray-900">
                  {attendance.name}
                </td>
                <td className="px-3 w-3 whitespace-nowrap text-sm text-gray-500">
                  {attendance.date || "-"}
                </td>
                {/* Punch In 1 */}
                <td className="px-3 w-2 text-sm text-gray-500">
                  <input
                    type="datetime-local"
                    className="w-[200px] border border-gray-400 rounded-md px-2 py-1"
                    value={
                      attendance.punchin1
                        ? attendance.punchin1.substring(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      handlePunchTimeChange(
                        `${attendance.employee_id}_${attendance.date}`,
                        "punchin1",
                        e.target.value
                      )
                    }
                  />
                </td>
                {/* Punch Out 1 */}
                <td className="px-3 w-2 text-sm text-gray-500">
                  <input
                    type="datetime-local"
                    className="w-[200px] border border-gray-400 rounded-md px-2 py-1"
                    value={
                      attendance.punchout1
                        ? attendance.punchout1.substring(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      handlePunchTimeChange(
                        `${attendance.employee_id}_${attendance.date}`,
                        "punchout1",
                        e.target.value
                      )
                    }
                  />
                </td>
             
              
                {/* Remarks */}
                <td className="px-8 w-[420px] text-sm text-gray-500">
                  <input
                    type="text"
                    className="w-full border border-gray-400 rounded-md p-2"
                    value={attendance.remarks || ""}
                    onChange={(e) =>
                      handlePunchTimeChange(
                        `${attendance.employee_id}_${attendance.date}`,
                        "remarks",
                        e.target.value
                      )
                    }
                  />
                </td>
                {/* Actions */}
                <td className="px-3 whitespace-nowrap text-sm font-medium">
                  <Button
                    onClick={() =>
                      handleSavePunchTimes(
                        `${attendance.employee_id}_${attendance.date}`,
                        {
                          punchin1: attendance.punchin1,
                          punchout1: attendance.punchout1
                        
                        }
                      )
                    }
                    color="blue"
                    variant="outlined"
                  >
                    Save
                  </Button>
                  <button
                    onClick={() =>
                      handleDelete(`${attendance.employee_id}_${attendance.date}`)
                    }
                    className="text-red-600 hover:text-red-900 ml-2"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center gap-4 mt-4 mb-4">
          <Button
            variant="outlined"
            color="blue"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outlined"
            color="blue"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Attendance;
