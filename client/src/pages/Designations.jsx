import React, { useState, useMemo, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  SquaresPlusIcon,
} from "@heroicons/react/24/outline";
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
} from "@material-tailwind/react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";

// Constants
const TABLE_HEAD = ["Designation Title", "Actions"];

const Designation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [designations, setDesignations] = useState([]);
  const [currentDesignation, setCurrentDesignation] = useState(null);
  const storedUserType = localStorage.getItem('userType');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  // Fetch designations
  const fetchDesignations = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/designations"
      );
      if (response.ok) {
        const data = await response.json();
        setDesignations(data);
      } else {
        console.error("Failed to fetch designations:", response.statusText);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  const handleOpenAdd = () => setOpenAdd(!openAdd);
  const handleOpenEdit = () => setOpenEdit(!openEdit);

  const filteredRows = useMemo(
    () =>
      designations.filter(({ title }) =>
        title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery, designations]
  );

  const indexOfLastRow = currentPage * itemsPerPage;
  const indexOfFirstRow = indexOfLastRow - itemsPerPage;
  const currentRows = useMemo(
    () => filteredRows.slice(indexOfFirstRow, indexOfLastRow),
    [filteredRows, indexOfFirstRow, itemsPerPage]
  );

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);

  // Add Designation
  const onSubmitAdd = async (data) => {
    const requestBody = { title: data.title };
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/designations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        fetchDesignations();
      } else {
        const errorData = await response.json();
        console.error("Add error:", errorData);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
    reset();
    setOpenAdd(false);
  };

  const handleEdit = (designation) => {
    setCurrentDesignation(designation);
    setValue("title", designation.title);
    setOpenEdit(true);
  };

  const onSubmitEdit = async (data) => {
    const requestBody = { title: data.title };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/designations/${
          currentDesignation.id
        }`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        fetchDesignations();
      } else {
        const errorData = await response.json();
        console.error("Edit error:", errorData);
      }
    } catch (error) {
      console.error("Network error:", error);
    }

    reset();
    setOpenEdit(false);
    setCurrentDesignation(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this designation?")) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/designations/${id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          fetchDesignations();
        } else {
          console.error("Delete error:", response.statusText);
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    }
  };

  return (
    <Card className="h-full w-full">
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
            onClick={handleOpenAdd}
            color="blue"
        
          >
            <SquaresPlusIcon strokeWidth={2} className="h-5 w-4" /> Add
            Designation
          </Button>
        </div>
      </CardHeader>

      <Dialog size="sm" open={openAdd} handler={handleOpenAdd}>
        <Card>
          <form onSubmit={handleSubmit(onSubmitAdd)}>
            <CardBody className="grid gap-6">
              <Typography variant="h6" color="gray">
                Add Designation
              </Typography>
              <Input
                label="Designation Title"
                {...register("title", {
                  required: "Designation Title is required",
                })}
              />
              {errors.title && (
                <p className="text-red-500">{errors.title.message}</p>
              )}
            </CardBody>
            <CardFooter>
              <Button type="submit" variant="gradient" color="blue">
                Add
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

      <Dialog size="sm" open={openEdit} handler={handleOpenEdit}>
        <Card>
          <form onSubmit={handleSubmit(onSubmitEdit)}>
            <CardBody className="grid gap-6">
              <Typography variant="h6" color="gray">
                Edit Designation
              </Typography>
              <Input
                label="Designation Title"
                {...register("title", {
                  required: "Designation Title is required",
                })}
              />
              {errors.title && (
                <p className="text-red-500">{errors.title.message}</p>
              )}
            </CardBody>
            <CardFooter>
              <Button type="submit" variant="gradient" color="blue">
                Save
              </Button>
              <Button
                variant="text"
                color="blue"
                onClick={() => handleOpenEdit(false)}
              >
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Card>
      </Dialog>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider whitespace-nowrap"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRows.map((designation) => (
              <tr key={designation.id}>
                <td className="px-6 py-2 whitespace-nowrap text-sm">
                  {designation.title}
                </td>
                <td className="px-6 py-2 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
  <>
    <PencilSquareIcon
      className="h-5 w-5 text-blue-600 cursor-pointer"
      onClick={() => handleEdit(designation)}
      title="Edit"
    />
    <TrashIcon
      className="h-5 w-5 text-red-400 cursor-pointer"
      onClick={() => handleDelete(designation.id)}
      title="Delete"
    />
  </>


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

export default Designation;
