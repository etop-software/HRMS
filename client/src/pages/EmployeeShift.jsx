import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useForm, Controller } from "react-hook-form";
import ShiftCalendar from "./calanderShift";
import { PencilIcon, UserPlusIcon, TrashIcon ,PencilSquareIcon,SquaresPlusIcon} from "@heroicons/react/24/solid";
import {
  Card,
  CardHeader,
  Input,
  Dialog,
  Button,
  CardBody,
  CardFooter,
  IconButton,
  Checkbox,
  Radio,
  Select,
  Option,
} from "@material-tailwind/react";

// Table headings for the departments
const TABLE_HEAD = [
  "Employee Name",
  "Shift",
  // "Assigned Date",
  "Start Date",
  "End Date",
 
];

const EmployeeShift = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogSearchQuery, setDialogSearchQuery] = useState(""); // Search query for the dialog
  const [open, setOpen] = useState(false);
  const [employeeShifts, setEmployeeShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6); // Number of rows per page

  const [currentPage1, setCurrentPage1] = useState(1);
  const [pageSize1, setPageSize1] = useState(30);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm();

  const fetchEmployeeShifts = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/employeeShift"
      );
      if (response.ok) {
        const data = await response.json();

        console.log(data);
        
        setEmployeeShifts(data);
      } else {
        console.error("Failed to fetch employee shifts:", response.statusText);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/employeeShift/all/employees"
      );
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      } else {
        console.error("Failed to fetch employees:", response.statusText);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const fetchShifts = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/shifts"
      );
      if (response.ok) {
        const data = await response.json();
        setShifts(data);
      } else {
        console.error("Failed to fetch shifts:", response.statusText);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchEmployeeShifts();
    fetchEmployees();
    fetchShifts();
  }, []);
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEmployees(filteredDialogEmployees.map((emp) => emp.employee.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  const handleOpen = () => setOpen(!open);
  const handleEmployeeSelection = (e, employeeId) => {
    if (e.target.checked) {
      setSelectedEmployees((prevSelected) => [...prevSelected, employeeId]);
    } else {
      setSelectedEmployees((prevSelected) =>
        prevSelected.filter((id) => id !== employeeId)
      );
    }
  };
  const onSubmit = async (data) => {
    const { shiftId, startDate, endDate } = data;
    console.log(data);

    // Using selectedEmployees from the state
    if (selectedEmployees.length === 0) {
      console.error("No employees selected");
      return;
    }

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/employeeShift",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            selectedEmployees, // Use the selectedEmployees from state
            shiftId,
            startDate,
            endDate,
          }),
        }
      );
      if (response.ok) {
        await fetchEmployeeShifts(); // Refresh the shifts
        reset(); // Reset form fields
        setOpen(false); // Close the dialog
        setSelectedEmployees([]); // Clear selected employees state
      } else {
        console.error("Failed to assign shift:", response.statusText);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  // Filter employees based on search query for the dialog
  const filteredDialogEmployees = employees.filter((emp) =>
    emp.employee.name.toLowerCase().includes(dialogSearchQuery.toLowerCase())
  );

  const filterdEmployeshifts = employeeShifts.filter((employeeShift) =>
    employeeShift.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get the current page employees
  const paginatedEmployees = filteredDialogEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const startIndex = (currentPage1 - 1) * pageSize1;
  const endIndex = startIndex + pageSize1;
  
  const paginatedshifts = filterdEmployeshifts.slice(startIndex, endIndex);
  

  const totalPages = Math.ceil(filteredDialogEmployees.length / pageSize);
  const totalPages1 = Math.ceil(filterdEmployeshifts.length / pageSize1);

  return (
    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="flex items-center justify-between gap-5 mt-2 mb-3">
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            <div className="w-full md:w-72">
              {/* <Input
                label="Search Employees"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              /> */}
            </div>
          </div>
          <Button
            className="flex items-center gap-2"
            size="sm"
            onClick={handleOpen}
            color="blue"
          >
            <SquaresPlusIcon strokeWidth={2} className="h-5 w-4" /> Assign Shifts
          </Button>
        </div>
      </CardHeader>

      {/* Dialog for assigning shifts */}
      <Dialog
        size="xl"
        open={open}
        handler={handleOpen}
        className="bg-transparent shadow-none"
      >
        <Card className="mx-auto w-full max-w-[1000px] bg-white shadow-lg rounded-lg cursor-pointer">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <CardBody className="grid grid-cols-1 gap-6">
              <div className="flex flex-col md:flex-row md:space-x-4">
                <div className="flex-grow">
                  {" "}
                  {/* Allow this to take more space */}
                  {/* Search input for dialog */}
                  <Input
                    label="Search Employees with Name"
                    icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                    value={dialogSearchQuery}
                    onChange={(e) => setDialogSearchQuery(e.target.value)}
                    className="mb-3"
                  />
                  <br />
                  <div className="relative overflow-x-auto rounded-sm">
                  <table className="min-w-full border-2 border-gray-300 cursor-pointer ">
            <thead className="bg-gray-100">
              <tr>
              <th className="px-4 text-nowrap text-left border-b">
  <Checkbox
    checked={selectedEmployees.length === filteredDialogEmployees.length} // If all employees are selected, check the Select All checkbox
    onChange={handleSelectAll} // Trigger handleSelectAll when Select All checkbox is clicked
  />
</th>
                <th className="px-4  text-nowrap  text-left border-b">Name</th>
                <th className="px-4  text-nowrap text-left border-b">Employee ID</th>
                {/* <th className="px-4  text-nowrap text-left border-b">Assigned shift</th> */}
              </tr>
            </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedEmployees.map((emp) => (
                        <tr key={emp.employee.id} className="hover:bg-gray-50">
                          <td className="px-4">
                            <Checkbox
                              value={emp.employee.id}
                              checked={selectedEmployees.includes(
                                emp.employee.id
                              )}
                              onChange={(e) =>
                                handleEmployeeSelection(e, emp.employee.id)
                              }
                            />
                          </td>
                          <td className="px-8 text-nowrap text-left">
                            {emp.employee.name}
                          </td>
                          <td className="px-8 text-nowrap text-left">
                            {emp.employee.employee_id}
                          </td>
                          {/* <td className="text-nowrap">
                            {emp.shifts &&
                            emp.shifts.length > 0 &&
                            emp.shifts[0] ? (
                              emp.shifts[0].shift_name
                            ) : (
                              <p>No Shift</p>
                            )}
                          </td> */}
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
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>

                <div className="w-2/3">
                  {" "}
                  {/* Reduce the width for the shift selection */}
                  <div className="flex flex-col md:flex-row md:space-x-4">
                    <div className="w-full">
                      <Input
                        label="Start Date"
                        type="date"
                        {...register("startDate", { required: true })}
                        error={errors.startDate ? "Start date is required" : ""}
                      />
                    </div>
                    <div className="w-full">
                      <Input
                        label="End Date"
                        type="date"
                        {...register("endDate", { required: true })}
                        error={errors.endDate ? "End date is required" : ""}
                      />
                    </div>
                  </div>
                  <br />
                  <Controller
                    name="shiftId"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Shift is required" }}
                    render={({ field: { onChange, value, ref } }) => (
                      <Select
                        label="Select Shift"
                        value={value}
                        onChange={onChange}
                        error={!!errors.shiftId}
                      >
                        {shifts.map((shift) => (
                          <Option key={shift.id} value={shift.id}>
                            {shift.shift_name} ({shift.shift_code})
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
                Assign Shift
              </Button>
            </CardFooter>
          </form>
        </Card>
      </Dialog>
      
      <ShiftCalendar />
    </Card>
  );
};

export default EmployeeShift;
