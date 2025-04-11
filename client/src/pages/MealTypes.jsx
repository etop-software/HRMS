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

const TABLE_HEAD = ["Meal Type", "Meal Start", "Meal End", "Actions"];

const MealTypes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [mealTypes, setMealTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMealType, setCurrentMealType] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const fetchMealTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/api/mealtypes");
      if (!response.ok) throw new Error("Failed to fetch meal types");
      const data = await response.json();
      setMealTypes(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMealTypes();
  }, []);

  const handleOpenAdd = () => setOpenAdd(!openAdd);
  const handleOpenEdit = () => setOpenEdit(!openEdit);

  const onSubmitAdd = async (data) => {
    const requestBody = {
      mealtype: data.mealType,
      mealstart: data.mealStart,
      mealend: data.mealEnd,
    };

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/mealtypes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        await fetchMealTypes();
      } else {
        console.error("Error adding meal type");
      }
    } catch (error) {
      console.error("Network error:", error);
    }

    reset();
    setOpenAdd(false);
  };

  const onSubmitEdit = async (data) => {
    const requestBody = {
      mealtype: data.mealType,
      mealstart: data.mealStart,
      mealend: data.mealEnd,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/mealtypes/${currentMealType.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        await fetchMealTypes();
      } else {
        console.error("Error updating meal type");
      }
    } catch (error) {
      console.error("Network error:", error);
    }

    reset();
    setCurrentMealType(null);
    setOpenEdit(false);
  };

  const handleEdit = (mealType) => {
    setCurrentMealType(mealType);
    setValue("mealType", mealType.mealtype);
    setValue("mealStart", mealType.mealstart);
    setValue("mealEnd", mealType.mealend);
    setOpenEdit(true);
  };

  const handleDelete = async (mealTypeId) => {
    if (window.confirm("Are you sure you want to delete this meal type?")) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/mealtypes/${mealTypeId}`,
          { method: "DELETE" }
        );
        if (response.ok) {
          await fetchMealTypes();
        } else {
          console.error("Failed to delete meal type.");
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    }
  };

  const filteredRows = useMemo(
    () =>
      (mealTypes || []).filter(({ mealtype }) =>
        mealtype.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery, mealTypes]
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
            <SquaresPlusIcon strokeWidth={2} className="h-5 w-4" /> Add Meal Type
          </Button>
        </div>
      </CardHeader>
      {/* Add Meal Type Dialog */}
      <Dialog size="xs" open={openAdd} handler={handleOpenAdd}>
        <Card>
          <form onSubmit={handleSubmit(onSubmitAdd)}>
            <CardBody className="grid gap-6">
              <Typography variant="h6" color="gray">
                Add Meal Type
              </Typography>
              <Input
                label="Meal Type"
                {...register("mealType", { required: "Meal Type is required" })}
              />
              <Input
                label="Meal Start"
                type="time"
                {...register("mealStart", { required: "Meal Start is required" })}
              />
              <Input
                label="Meal End"
                type="time"
                {...register("mealEnd", { required: "Meal End is required" })}
              />
              {errors.mealType && (
                <p className="text-red-500">{errors.mealType.message}</p>
              )}
              {errors.mealStart && (
                <p className="text-red-500">{errors.mealStart.message}</p>
              )}
              {errors.mealEnd && (
                <p className="text-red-500">{errors.mealEnd.message}</p>
              )}
            </CardBody>
            <CardFooter>
              <Button type="submit" variant="gradient" color="blue">
                Add Meal Type
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
      {/* Edit Meal Type Dialog */}
      <Dialog size="xs" open={openEdit} handler={handleOpenEdit}>
        <Card>
          <form onSubmit={handleSubmit(onSubmitEdit)}>
            <CardBody className="grid gap-6">
              <Typography variant="h6" color="gray">
                Edit Meal Type
              </Typography>
              <Input
                label="Meal Type"
                {...register("mealType", { required: "Meal Type is required" })}
              />
              <Input
                label="Meal Start"
                type="time"
                {...register("mealStart", { required: "Meal Start is required" })}
              />
              <Input
                label="Meal End"
                type="time"
                {...register("mealEnd", { required: "Meal End is required" })}
              />
              {errors.mealType && (
                <p className="text-red-500">{errors.mealType.message}</p>
              )}
              {errors.mealStart && (
                <p className="text-red-500">{errors.mealStart.message}</p>
              )}
              {errors.mealEnd && (
                <p className="text-red-500">{errors.mealEnd.message}</p>
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
          <tbody className="divide-y divide-gray-100">
            {currentRows.map((mealType, idx) => (
              <tr
                key={mealType.id}
                className="hover:bg-blue-50/50 transition-colors duration-200"
              >
                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-600">
                  {mealType.mealtype}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                  {mealType.mealstart}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                  {mealType.mealend}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm">
                  <div className="flex gap-3">
                    <PencilSquareIcon
                      className="h-5 w-5 text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
                      onClick={() => handleEdit(mealType)}
                    />
                    <TrashIcon
                      className="h-5 w-5 text-red-500 hover:text-red-600 cursor-pointer transition-colors"
                      onClick={() => handleDelete(mealType.id)}
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

export default MealTypes;
