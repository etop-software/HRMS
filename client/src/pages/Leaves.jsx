import React, { useState, useMemo, useEffect } from "react"; 
import {
  MagnifyingGlassIcon,
 
} from "@heroicons/react/24/outline";
import { PencilIcon, SquaresPlusIcon, TrashIcon,PencilSquareIcon } from "@heroicons/react/24/solid";
import { useForm } from "react-hook-form";
import {
  Card,
  CardHeader,
  Input,
  Dialog,
  Typography,
  Button,
  CardBody,
  CardFooter,
  IconButton,
} from "@material-tailwind/react";

// Constants
const TABLE_HEAD = ["Leave Name", "Leave Code", "Actions"];

const Leaves = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [open, setOpen] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [openEditDialog, setOpenEditDialog] = useState(false);
const [selectedLeave, setSelectedLeave] = useState(null);
const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, leaveId: null });
 // State to hold fetched leaves data
 const storedUserType = localStorage.getItem('userType');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const handleEditClick = (leave) => {
    setSelectedLeave(leave);
    reset({
      leaveName: leave.leave_name,
      leaveCode: leave.leave_code
    });
    setOpenEditDialog(true);
  };

  const handleEditSubmit = async (data) => {
    const requestBody = {
      leaveName: data.leaveName,
      leaveCode: data.leaveCode
    };
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leaves/${selectedLeave.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
  
      if (response.ok) {
        fetchLeaves();
        setOpenEditDialog(false);
        setSelectedLeave(null);
      }
    } catch (error) {
      console.error('Error updating leave:', error);
    }
  };
  const fetchLeaves = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/api/leaves");
      if (response.ok) {
        const data = await response.json();
        setLeaves(data.leaves); // Update the leaves state with the leaves array from the response
      } else {
        console.error("Failed to fetch leaves:", response.statusText);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []); 
  const handleOpen = () => setOpen(!open);

  const filteredRows = useMemo(
    () =>
      leaves.filter(({ leave_name }) =>
        leave_name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery, leaves]
  );

  const indexOfLastRow = currentPage * itemsPerPage;
  const indexOfFirstRow = indexOfLastRow - itemsPerPage;
  const currentRows = useMemo(
    () => filteredRows.slice(indexOfFirstRow, indexOfLastRow),
    [filteredRows, indexOfFirstRow, itemsPerPage]
  );

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);

  const onSubmit = async (data) => {
    const requestBody = {
      leaveName: data.leaveName,
      leaveCode: data.leaveCode,
    };

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/api/leaves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Successfully submitted", responseData);
        // Re-fetch leaves after adding a new one
        fetchLeaves(); // Fetch updated leave list
      } else {
        const errorData = await response.json();
        alert("Submission error:", response.statusText, errorData);
        console.error("Submission error:", response.statusText, errorData);
      }
    } catch (error) {
      console.error("Network error:", error);
    }

    reset();
    setOpen(false);
  };

  return (
    <Card className="h-full w-full]">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="flex items-center justify-between gap-5 mt-2 mb-3">
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            <div className="w-full md:w-72">
              <Input
                label="Search"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Button
            className="flex items-center gap-2"
            size="sm"
            onClick={handleOpen}
            color="blue"
          >
            <SquaresPlusIcon strokeWidth={2} className="h-5 w-4" /> Add Leave
          </Button>
        </div>
      </CardHeader>

      {/* Form Dialog to Add Leave */}
      <Dialog
        size="xs"
        open={open}
        handler={handleOpen}
        className="bg-transparent shadow-none"
      >
        <Card className="mx-auto w-full max-w-full">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardBody className="grid grid-cols-1 gap-6">
              {" "}
              {/* Single column layout */}
              {/* Title */}
              <div>
                <Typography
                  className="mb-3 font-normal"
                  variant="h6"
                  color="gray"
                >
                  Add Leave
                </Typography>
              </div>
              {/* Leave Name */}
              <div>
                <Input
                  label="Leave Name"
                  size="lg"
                  {...register("leaveName", {
                    required: "Leave Name is required",
                  })}
                />
                {errors.leaveName && (
                  <p className="text-red-500">{errors.leaveName.message}</p>
                )}
              </div>
              {/* Leave Code */}
              <div>
                <Input
                  label="Leave Code"
                  size="lg"
                  {...register("leaveCode", {
                    required: "Leave Code is required",
                  })}
                />
                {errors.leaveCode && (
                  <p className="text-red-500">{errors.leaveCode.message}</p>
                )}
              </div>
            </CardBody>

            <CardFooter className="pt-0 flex justify-end">
              <Button type="submit" variant="gradient" color="blue">
                Add Leave
              </Button>
              <Button
                variant="text"
                color="blue"
                onClick={() => handleOpen(false)}
              >
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Card>
      </Dialog>

      <Dialog
        size="xs"
        open={openEditDialog}
        handler={() => setOpenEditDialog(false)}
        className="bg-transparent shadow-none"
      >
        <Card className="mx-auto w-full max-w-full">
          <form onSubmit={handleSubmit(handleEditSubmit)}>
            <CardBody className="grid grid-cols-1 gap-6">
              <div>
                <Typography
                  className="mb-3 font-normal"
                  variant="h6"
                  color="gray"
                >
                  Edit Leave
                </Typography>
              </div>

              <div>
                <Input
                  label="Leave Name"
                  size="lg"
                  {...register("leaveName", {
                    required: "Leave Name is required",
                  })}
                />
                {errors.leaveName && (
                  <p className="text-red-500">{errors.leaveName.message}</p>
                )}
              </div>

              <div>
                <Input
                  label="Leave Code"
                  size="lg"
                  {...register("leaveCode", {
                    required: "Leave Code is required",
                  })}
                />
                {errors.leaveCode && (
                  <p className="text-red-500">{errors.leaveCode.message}</p>
                )}
              </div>
            </CardBody>

            <CardFooter className="pt-0 flex justify-end">
              <Button type="submit" variant="gradient" color="blue">
                Update Leave
              </Button>
              <Button
                variant="text"
                color="blue"
                onClick={() =>{
                  reset();
                  setOpenEditDialog(false);}}
              >
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Card>
      </Dialog>

      <div className="overflow-x-hidden">
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
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRows.map((leave) => (
              <tr key={leave.id}>
                {" "}
                {/* Use unique _id for key */}
                <td className="px-6  text-sm text-gray-900">
                  {leave.leave_name}
                </td>
                <td className="px-6  text-sm text-gray-900">
                  {leave.leave_code}
                </td>
                <td className="px-6 text-sm text-gray-900">
  <div className="flex space-x-2">
    <PencilSquareIcon
      className="h-5 w-5 my-2 cursor-pointer text-blue-600"
      onClick={() => handleEditClick(leave)}
      title="Edit"
    />
    <TrashIcon
      className="h-5 w-5 my-2 cursor-pointer text-red-600"
      onClick={() => handleDeleteClick(leave.id)}
      title="Delete"
    />
  </div>


                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default Leaves;
