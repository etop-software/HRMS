import React, { useState, useMemo, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
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
} from "@material-tailwind/react";

const TABLE_HEAD = ["Department Name", "Department Head", "Email", "Actions"];

const Department = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const storedUserType = localStorage.getItem('userType');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const fetchDepartments = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/departments"
      );
      if (response.ok) {
        const data = await response.json();
        setDepartments(data);
      } else {
        console.error("Failed to fetch departments:", response.statusText);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenAdd = () => setOpenAdd(!openAdd);
  const handleOpenEdit = () => setOpenEdit(!openEdit);

  const filteredDepartments = useMemo(
    () =>
      departments.filter(({ department_name }) =>
        department_name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery, departments]
  );

  const onSubmitAdd = async (data) => {
    const requestBody = {
      departmentName: data.department_name,
      departmentHead: data.department_head,
      email: data.email,
    };

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/departments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        await fetchDepartments();
      } else {
        const errorData = await response.json();
        console.error("Submission error:", response.statusText, errorData);
      }
    } catch (error) {
      console.error("Network error:", error);
    }

    reset();
    setOpenAdd(false);
  };

  const handleEdit = (department) => {
    setCurrentDepartment(department);
    setValue("department_name", department.department_name);
    setValue("department_head", department.department_head);
    setValue("email", department.email);
    setOpenEdit(true);
  };

  const onSubmitEdit = async (data) => {
    const requestBody = {
      departmentName: data.department_name,
      departmentHead: data.department_head,
      email: data.email,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/departments/${
          currentDepartment.id
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
        await fetchDepartments();
      } else {
        const errorData = await response.json();
        console.error("Update error:", response.statusText, errorData);
      }
    } catch (error) {
      console.error("Network error:", error);
    }

    reset();
    setOpenEdit(false);
    setCurrentDepartment(null);
  };

  const handleDelete = async (departmentId) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/departments/${departmentId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          await fetchDepartments();
        } else {
          console.error("Failed to delete department:", response.statusText);
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
                label="Search Department"
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
            <UserPlusIcon strokeWidth={2} className="h-5 w-4" /> Add Department
          </Button>
        </div>
      </CardHeader>

      {/* Add Department Dialog */}
      <Dialog size="sm" open={openAdd} handler={handleOpenAdd}>
        <Card>
          <form onSubmit={handleSubmit(onSubmitAdd)}>
            <CardBody className="grid gap-6">
              <Typography variant="h6" color="gray">
                Add Department
              </Typography>
              <Input
                label="Department Name"
                {...register("department_name", {
                  required: "Department Name is required",
                })}
              />
              <Input
                label="Department Head"
                {...register("department_head", {
                  required: "Department Head is required",
                })}
              />
              <Input
                label="Email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500">{errors.email.message}</p>
              )}
            </CardBody>
            <CardFooter>
              <Button type="submit" variant="gradient" color="blue">
                Add Department
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

      {/* Edit Department Dialog */}
      <Dialog size="sm" open={openEdit} handler={handleOpenEdit}>
        <Card>
          <form onSubmit={handleSubmit(onSubmitEdit)}>
            <CardBody className="grid gap-6">
              <Typography variant="h6" color="gray">
                Edit Department
              </Typography>
              <Input
                label="Department Name"
                {...register("department_name", {
                  required: "Department Name is required",
                })}
              />
              <Input
                label="Department Head"
                {...register("department_head", {
                  required: "Department Head is required",
                })}
              />
              <Input
                label="Email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-red-500">{errors.email.message}</p>
              )}
            </CardBody>
            <CardFooter>
              <Button type="submit" variant="gradient" color="blue">
                Save Changes
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

      {/* Department Table */}
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
            {filteredDepartments.map((department) => (
              <tr key={department.id}>
                <td className="px-6 py-2 whitespace-nowrap text-sm">
                  {department.department_name}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm">
                  {department.department_head}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm">
                  {department.email}
                </td>
                <td className="px-6 py-2 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
  <>
    <PencilSquareIcon
      className="h-5 w-5 text-blue-600 cursor-pointer"
      onClick={() => handleEdit(department)}
      title="Edit"
    />
    <TrashIcon
      className="h-5 w-5 text-red-600 cursor-pointer"
      onClick={() => handleDelete(department.id)}
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

export default Department;
