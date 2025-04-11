import React, { useState, useEffect, useMemo } from "react";
import {
  PencilSquareIcon,
  TrashIcon,
  SquaresPlusIcon,
} from "@heroicons/react/24/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
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
import { Import } from "lucide-react";

import { useCompany } from "../contexts/CompanyContext";

const TABLE_HEAD = ["Area Name", "Area Code", "Actions"];

const Areas = () => {
  const {  } = useCompany();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentArea, setCurrentArea] = useState(null);
  const storedUserType = localStorage.getItem('userType');

  console.log(storedUserType);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const fetchAreas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/api/areas");
      if (!response.ok) throw new Error("Failed to fetch areas");
      const data = await response.json();
      setAreas(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleOpenAdd = () => setOpenAdd(!openAdd);
  const handleOpenEdit = () => setOpenEdit(!openEdit);

  const onSubmitAdd = async (data) => {
    const requestBody = {
      area_name: data.areaName,
      area_code: data.areaCode,
    };

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/areas",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        await fetchAreas();
      } else {
        console.error("Error adding area");
      }
    } catch (error) {
      console.error("Network error:", error);
    }

    reset();
    setOpenAdd(false);
  };

  const onSubmitEdit = async (data) => {
    const requestBody = {
      area_name: data.areaName,
      area_code: data.areaCode,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/areas/${currentArea.area_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        await fetchAreas();
      } else {
        console.error("Error updating area");
      }
    } catch (error) {
      console.error("Network error:", error);
    }

    reset();
    setCurrentArea(null);
    setOpenEdit(false);
  };

  const handleEdit = (area) => {
    setCurrentArea(area);
    setValue("areaName", area.area_name);
    setValue("areaCode", area.area_code);
    setOpenEdit(true);
  };

  const handleDelete = async (areaId) => {
    if (window.confirm("Are you sure you want to delete this area?")) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/areas/${areaId}`,
          { method: "DELETE" }
        );
        if (response.ok) {
          await fetchAreas();
        } else {
          console.error("Failed to delete area.");
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    }
  };

  const filteredRows = useMemo(
    () =>
      (areas || []).filter(({ area_name }) =>
        area_name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery, areas]
  );

  const indexOfLastRow = currentPage * itemsPerPage;
  const indexOfFirstRow = indexOfLastRow - itemsPerPage;
  const currentRows = useMemo(
    () => filteredRows.slice(indexOfFirstRow, indexOfLastRow),
    [filteredRows, indexOfFirstRow, itemsPerPage]
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

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
            <SquaresPlusIcon strokeWidth={2} className="h-5 w-4" /> Add Area
          </Button>
        </div>
      </CardHeader>
      {/* Add Area Dialog */}
      <Dialog size="xs" open={openAdd} handler={handleOpenAdd}>
        <Card>
          <form onSubmit={handleSubmit(onSubmitAdd)}>
            <CardBody className="grid gap-6">
              <Typography variant="h6" color="gray">
                Add Area
              </Typography>
              <Input
                label="Area Name"
                {...register("areaName", { required: "Area Name is required" })}
              />
              <Input
                label="Area Code"
                {...register("areaCode", { required: "Area Code is required" })}
              />
              {errors.areaName && (
                <p className="text-red-500">{errors.areaName.message}</p>
              )}
              {errors.areaCode && (
                <p className="text-red-500">{errors.areaCode.message}</p>
              )}
            </CardBody>
            <CardFooter>
              <Button type="submit" variant="gradient" color="blue" >
                Add Area
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
      {/* Edit Area Dialog */}
      <Dialog size="xs" open={openEdit} handler={handleOpenEdit}>
        <Card>
          <form onSubmit={handleSubmit(onSubmitEdit)}>
            <CardBody className="grid gap-6">
              <Typography variant="h6" color="gray">
                Edit Area
              </Typography>
              <Input
                label="Area Name"
                {...register("areaName", { required: "Area Name is required" })}
              />
              <Input
                label="Area Code"
                {...register("areaCode", { required: "Area Code is required" })}
              />
              {errors.areaName && (
                <p className="text-red-500">{errors.areaName.message}</p>
              )}
              {errors.areaCode && (
                <p className="text-red-500">{errors.areaCode.message}</p>
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
      {/* Table */}
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
          <tbody className="divide-y divide-gray-100">
            {currentRows.map((area, idx) => (
              <tr
                key={area.area_id}
                className="hover:bg-blue-50/50 transition-colors duration-200"
              >
                <td className="px-6  py-2  whitespace-nowrap text-sm font-medium text-gray-600">
                  {area.area_name}
                </td>
                <td className="px-6  py-2   whitespace-nowrap text-sm text-gray-600">
                  {area.area_code}
                </td>
                <td className="px-6 py-2 whitespace-nowrap text-sm">
                  <div className="flex gap-3">
  <PencilSquareIcon
    className="h-5 w-5 text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
    onClick={() => handleEdit(area)}
  />

  <TrashIcon
    className="h-5 w-5 text-red-500 hover:text-red-600 cursor-pointer transition-colors"
    onClick={() => handleDelete(area.area_id)}
  />

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
     <CardFooter className="flex justify-center items-center gap-4 mt-4">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          size="sm"
          className="flex items-center gap-2"
          color="blue"
        >
          <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              clipRule="evenodd"
            />
          </svg>
          Previous
        </Button>

        <Typography variant="small" className="font-medium px-4">
          Page {currentPage} of {Math.ceil(filteredRows.length / itemsPerPage)}
        </Typography>

        <Button
          onClick={() =>
            setCurrentPage((prev) =>
              currentPage * itemsPerPage < filteredRows.length ? prev + 1 : prev
            )
          }
          disabled={currentPage * itemsPerPage >= filteredRows.length}
          size="sm"
          className="flex items-center gap-2"
          color="blue"
        >
          Next
          <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Areas;
