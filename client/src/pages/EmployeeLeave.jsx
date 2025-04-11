import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useForm, Controller } from "react-hook-form";
import { PencilSquareIcon, UserPlusIcon, TrashIcon } from "@heroicons/react/24/solid";
import {
  Card,
  CardHeader,
  Input,
  Dialog,
  Button,
  CardBody,
  CardFooter,
  Checkbox,
  Select,
  Option,
} from "@material-tailwind/react";

// Table headings
const TABLE_HEAD = ["Employee Name", "Leave", "Start Date", "End Date", "Actions"];

const EmployeeShift = () => {
  // State variables
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogSearchQuery, setDialogSearchQuery] = useState("");
  const [open, setOpen] = useState(false); // Assign leave dialog
  const [openEditModal, setOpenEditModal] = useState(false); // Edit modal
  const [employeeLeaves, setEmployeeLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [Leaves, setLeaves] = useState({ leaves: [] }); // Leave types, assuming { leaves: [...] }
  const [currentPage, setCurrentPage] = useState(1); // Pagination for assign dialog
  const [pageSize, setPageSize] = useState(6);
  const [currentPage1, setCurrentPage1] = useState(1); // Pagination for table
  const [pageSize1, setPageSize1] = useState(5);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Form hooks for assigning leaves
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm();
  const handleCloseModal = () => {
    setOpenEditModal(false);
  };
  // Form hooks for editing leaves
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    control: controlEdit,
    formState: { errors: errorsEdit },
  } = useForm();

  // **Fetch Functions**
  const fetchEmployeeLeaves = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/assignLeave/employee/all`);
      if (response.ok) {
        const data = await response.json();
        setEmployeeLeaves(data);
        console.log("Employee leaves data:", data); // Log to verify structure
      } else {
        console.error("Failed to fetch employee leaves:", response.statusText);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/assignLeave/Leaves/all`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
        console.log("Employees data:", data); // Log to verify structure
      } else {
        console.error("Failed to fetch employees:", response.statusText);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const fetchLeaves = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leaves`);
      if (response.ok) {
        const data = await response.json();
        console.log("Leaves data:", data); // Log to verify structure
        setLeaves(data);
      } else {
        console.error("Failed to fetch leaves:", response.statusText);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchEmployeeLeaves();
    fetchEmployees();
    fetchLeaves();
  }, []);

  // **Handlers**
  const handleOpen = () => setOpen(!open);

  const handleEmployeeSelection = (e, employeeId) => {
    if (e.target.checked) {
      setSelectedEmployees((prev) => [...prev, employeeId]);
    } else {
      setSelectedEmployees((prev) => prev.filter((id) => id !== employeeId));
    }
  };


  const deleteLeaveAssignment = async (assignmentId) => {
    // Add a confirmation prompt before deletion
    const confirmDelete = confirm('Are you sure you want to delete this leave assignment?');
    if (!confirmDelete) {
      return; // Exit if the user clicks "Cancel"
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/assignLeave/leave-assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        // Handle successful deletion
        console.log('Leave assignment deleted successfully');
        // Refresh the page to reflect the changes
        window.location.reload();
      } else if (response.status === 404) {
        console.error('Leave assignment not found');
        alert('Leave assignment not found');
      } else {
        console.error('Failed to delete leave assignment:', response.statusText);
        alert('Failed to delete leave assignment');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error occurred while deleting leave assignment');
    }
  };

  // Submit handler for assigning leaves
  const onSubmit = async (data) => {
    const { leaveId, leave_start_date, leave_end_date } = data;
    if (!selectedEmployees.length) {
      console.error("No employees selected");
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/assignLeave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedEmployees,
          leaveId,
          leave_start_date,
          leave_end_date,
        }),
      });
      if (response.ok) {
        await fetchEmployeeLeaves();
        reset();
        setOpen(false);
        setSelectedEmployees([]);
      } else {
        console.error("Failed to assign leave:", response.statusText);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  // Submit handler for editing leaves
  const onEditSubmit = async (data) => {
    console.log("Edit Data:", data);
    const { leaveId, leave_start_date, leave_end_date } = data;
    const assignmentId = selectedAssignment.assignmentId;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/assignLeave/leave-assignments/${assignmentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leaveId,
            leave_start_date,
            leave_end_date,
          }),
        }
      );
      if (response.ok) {
        await fetchEmployeeLeaves();
        setOpenEditModal(false);
        setSelectedAssignment(null);
      } else {
        console.error("Failed to update leave:", response.statusText);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  // Reset edit form when a new assignment is selected
  useEffect(() => {
    if (selectedAssignment) {
      console.log("Resetting form with leaveId:", selectedAssignment.leaveId);
      resetEdit({
        leaveId: selectedAssignment.leaveId,
        leave_start_date: selectedAssignment.startDate.split("T")[0],
        leave_end_date: selectedAssignment.endDate.split("T")[0],
      });
    }
  }, [selectedAssignment, resetEdit]);

  // **Filtering and Pagination**
  const filteredDialogEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(dialogSearchQuery.toLowerCase())
  );
  const filteredEmployeeLeaves = employeeLeaves.filter((employeeleave) =>
    employeeleave.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const paginatedEmployees = filteredDialogEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const paginatedEmployeeLeaves = filteredEmployeeLeaves.slice(
    (currentPage1 - 1) * pageSize1,
    currentPage1 * pageSize1
  );
  const totalPages = Math.ceil(filteredDialogEmployees.length / pageSize);
  const totalPages1 = Math.ceil(filteredEmployeeLeaves.length / pageSize1);

  // **Render Component**
  return (
    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="flex items-center justify-between gap-5 mt-2 mb-3">
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            <div className="w-full md:w-72">
              <Input
                label="Search Employees"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Button className="flex items-center gap-2" size="sm" onClick={handleOpen} color="blue">
            <UserPlusIcon strokeWidth={2} className="h-5 w-4" /> Assign Leaves
          </Button>
        </div>
      </CardHeader>

      {/* Assign Leave Dialog */}
      <Dialog size="xl" open={open} handler={handleOpen} className="bg-transparent shadow-none">
        <Card className="mx-auto w-full max-w-[1000px] bg-white shadow-lg rounded-lg cursor-pointer">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <CardBody className="grid grid-cols-1 gap-6">
              <div className="flex flex-col md:flex-row md:space-x-4">
                <div className="flex-grow">
                  <Input
                    label="Search Employees with Name"
                    icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                    value={dialogSearchQuery}
                    onChange={(e) => setDialogSearchQuery(e.target.value)}
                    className="mb-3"
                  />
                  <div className="relative overflow-x-auto rounded-sm">
                    <table className="min-w-full border-2 border-gray-300 cursor-pointer">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 text-nowrap text-left border-b">Action</th>
                          <th className="px-4 text-nowrap text-left border-b">Name</th>
                          <th className="px-4 text-nowrap text-left border-b">Employee ID</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedEmployees.map((emp) => (
                          <tr key={emp.id} className="hover:bg-gray-50">
                            <td className="px-4">
                              <Checkbox
                                value={emp.id}
                                checked={selectedEmployees.includes(emp.id)}
                                onChange={(e) => handleEmployeeSelection(e, emp.id)}
                              />
                            </td>
                            <td className="px-8 text-nowrap text-left">{emp.name}</td>
                            <td className="px-8 text-nowrap text-left">{emp.employee_id}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-between mt-4">
                    <Button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <Button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
                <div className="w-1/2">
                  <div className="flex flex-col md:flex-row md:space-x-4">
                    <div className="w-full">
                      <Input
                        label="Start Date"
                        type="date"
                        {...register("leave_start_date", { required: true })}
                        error={errors.leave_start_date ? "Start date is required" : ""}
                      />
                    </div>
                    <div className="w-full">
                      <Input
                        label="End Date"
                        type="date"
                        {...register("leave_end_date", { required: true })}
                        error={errors.leave_end_date ? "End date is required" : ""}
                      />
                    </div>
                  </div>
                  <br />
                  <Controller
                    name="leaveId"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Leave is required" }}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        label="Select Leave"
                        value={value}
                        onChange={onChange}
                        error={!!errors.leaveId}
                      >
                        {Leaves.leaves.map((Leave) => (
                          <Option key={Leave.id} value={Leave.id}>
                            {Leave.leave_name} ({Leave.leave_code})
                          </Option>
                        ))}
                      </Select>
                    )}
                  />
                </div>
              </div>
            </CardBody>
            <CardFooter className="pt-0 pb-0 flex justify-end">
              <Button type="submit" variant="gradient" color="blue">
                Assign Leave
              </Button>
            </CardFooter>
          </form>
        </Card>
      </Dialog>

      {/* Employee Leaves Table */}
      <div className="relative overflow-x-auto sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 cursor-pointer">
          <thead className="bg-gray-100">
            <tr>
              {TABLE_HEAD.map((head) => (
                <th key={head} className="px-4 py-2 text-left border-b">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 rounded-md cursor-pointer">
            {paginatedEmployeeLeaves.map((employeeleave) =>
              employeeleave.leaves.map((leave, index) => (
                <tr key={`${employeeleave.id}-${index}`} className="border-b border-gray-200">
                  <td className="px-6 whitespace-nowrap text-sm text-gray-900">
                    {employeeleave.name}
                  </td>
                  <td className="px-6 whitespace-nowrap text-sm text-gray-900">
                    {leave.leave_name}
                  </td>
                  <td className="px-6 whitespace-nowrap text-sm text-gray-900">
                    {leave.leave_start_date.split("T")[0]}
                  </td>
                  <td className="px-6 whitespace-nowrap text-sm text-gray-900">
                    {leave.leave_end_date.split("T")[0]}
                  </td>
                  <td className="px-6 text-sm text-gray-900">
                    <div className="flex space-x-2">
                      <PencilSquareIcon
                        className="h-5 w-5 my-2 cursor-pointer text-blue-600"
                        onClick={() => {
                          const leaveType = Leaves.leaves.find((l) => l.leave_name === leave.leave_name);
                          const leaveId = leaveType ? String(leaveType.id) : null;
                          setSelectedAssignment({
                            assignmentId: leave.id,
                            employeeId: employeeleave.id,
                            employeeName: employeeleave.name,
                            leaveId: leaveId,
                            leaveName: leave.leave_name,
                            startDate: leave.leave_start_date,
                            endDate: leave.leave_end_date,
                          });
                          setOpenEditModal(true);
                        }}
                      />
                     <TrashIcon
            className="h-5 w-5 my-2 cursor-pointer text-red-600"
            onClick={() => deleteLeaveAssignment(leave.id)}
          />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <Dialog
        size="lg"
        open={openEditModal}
        handler={() => setOpenEditModal(!openEditModal)}
        className="bg-transparent shadow-none"
      >
        <Card className="mx-auto w-full max-w-[600px] bg-white shadow-lg rounded-lg">
          <form onSubmit={handleEditSubmit(onEditSubmit)} className="p-6">
            <CardBody className="grid grid-cols-1 gap-6">
              <Input
                label="Employee Name"
                value={selectedAssignment?.employeeName || ""}
                disabled
              />
              <Controller
                name="leaveId"
                control={controlEdit}
                rules={{ required: "Leave is required" }}
                render={({ field: { onChange, value } }) => {
                  console.log("Select value:", value); // Log to debug selected value
                  return (
                    <Select
                      label="Select Leave"
                      value={value}
                      onChange={onChange}
                      error={!!errorsEdit.leaveId}
                    >
                      {Leaves.leaves.map((Leave) => (
                        <Option key={Leave.id} value={String(Leave.id)}>
                          {Leave.leave_name} ({Leave.leave_code})
                        </Option>
                      ))}
                    </Select>
                  );
                }}
              />
              <Input
                label="Start Date"
                type="date"
                {...registerEdit("leave_start_date", { required: "Start date is required" })}
                error={errorsEdit.leave_start_date?.message}
              />
              <Input
                label="End Date"
                type="date"
                {...registerEdit("leave_end_date", { required: "End date is required" })}
                error={errorsEdit.leave_end_date?.message}
              />
            </CardBody>
            <CardFooter className="pt-0 pb-0  flex justify-end space-x-2">
            <Button
          type="button" // Changed from "submit" to prevent form submission
          variant="outlined"
          color="red"
          onClick={handleCloseModal}
        >
          Cancel
        </Button>
              <Button type="submit" variant="gradient" color="blue">
                Update Leave
              </Button>
            </CardFooter>
          </form>
        </Card>
      </Dialog>
    </Card>
  );
};

export default EmployeeShift;