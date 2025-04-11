import React, { useState, useMemo, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { PencilSquareIcon, TrashIcon, UserPlusIcon } from "@heroicons/react/24/solid";
import {
  Card,
  CardHeader,
  Input,
  Dialog,
  Typography,
  Button,
  CardBody,
  CardFooter,
  Textarea ,
} from "@material-tailwind/react";

const TABLE_HEAD = ["Company Name", "Contact", "Email", "Actions"];

const Company = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [currentCompany, setCurrentCompany] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchCompanies = async () => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/api/companies");
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      } else {
        console.error("Failed to fetch companies:", response.statusText);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleOpenAdd = () => setOpenAdd(!openAdd);
  const handleOpenEdit = () => setOpenEdit(!openEdit);

  const filteredCompanies = useMemo(
    () =>
      companies.filter(({ name }) =>
        name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery, companies]
  );

  const onSubmitAdd = async (data) => {
    const requestBody = {
      name: data.name,
      email: data.email,
      contact: data.contact,
      address: data.address,
    };

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        await fetchCompanies();
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

  const handleEdit = (company) => {
    setCurrentCompany(company);
    setValue("name", company.name);
    setValue("email", company.email);
    setValue("contact", company.contact);
    setValue("address", company.address);
    setOpenEdit(true);
  };

  const onSubmitEdit = async (data) => {
    const requestBody = {
      name: data.name,
      email: data.email,
      contact: data.contact,
      address: data.address,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/companies/${currentCompany.company_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        await fetchCompanies();
      } else {
        const errorData = await response.json();
        console.error("Update error:", response.statusText, errorData);
      }
    } catch (error) {
      console.error("Network error:", error);
    }

    reset();
    setOpenEdit(false);
    setCurrentCompany(null);
  };

  const handleDelete = async (companyId) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/companies/${companyId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          await fetchCompanies();
        } else {
          console.error("Failed to delete company:", response.statusText);
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
                label="Search Company"
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
            <UserPlusIcon strokeWidth={2} className="h-5 w-4" /> Add Company
          </Button>
        </div>
      </CardHeader>

      {/* Add Company Dialog */}
      <Dialog size="sm" open={openAdd} handler={handleOpenAdd}>
        <Card>
          <form onSubmit={handleSubmit(onSubmitAdd)}>
            <CardBody className="grid gap-6">
              <Typography variant="h6" color="gray">Add Company</Typography>
              <Input
                label="Company Name"
                {...register("name", { required: "Company Name is required" })}
              />
              <Input
                label="Contact"
                {...register("contact", { required: "Contact is required" })}
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
              <Textarea
                label="Address"
                size="md"
                {...register("address", { required: "Address is required" })}
              />
              {errors.email && <p className="text-red-500">{errors.email.message}</p>}
            </CardBody>
            <CardFooter>
              <Button type="submit" variant="gradient" color="blue">
                Add Company
              </Button>
              <Button variant="text" color="blue" onClick={() => handleOpenAdd(false)}>Cancel</Button>
            </CardFooter>
          </form>
        </Card>
      </Dialog>

      {/* Edit Company Dialog */}
      <Dialog size="sm" open={openEdit} handler={handleOpenEdit}>
        <Card>
          <form onSubmit={handleSubmit(onSubmitEdit)}>
            <CardBody className="grid gap-6">
              <Typography variant="h6" color="gray">Edit Company</Typography>
              <Input
                label="Company Name"
                {...register("name", { required: "Company Name is required" })}
              />
              <Input
                label="Contact"
                {...register("contact", { required: "Contact is required" })}
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
              <Textarea
                label="Address"
                size="md"
                {...register("address", { required: "Address is required" })}
              />
              {errors.email && <p className="text-red-500">{errors.email.message}</p>}
            </CardBody>
            <CardFooter>
              <Button type="submit" variant="gradient" color="blue">
                Save Changes
              </Button>
              <Button variant="text" color="blue" onClick={() => handleOpenEdit(false)}>Cancel</Button>
            </CardFooter>
          </form>
        </Card>
      </Dialog>

      {/* Company Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {TABLE_HEAD.map((head) => (
                <th key={head} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCompanies.map((company) => (
              <tr key={company.company_id}>
                <td className="px-6 py-2 whitespace-nowrap text-sm">{company.name}</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm">{company.contact}</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm">{company.email}</td>
                <td className="px-6 py-2 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <PencilSquareIcon
                      className="h-5 w-5 text-blue-600 cursor-pointer"
                      onClick={() => handleEdit(company)}
                      title="Edit"
                    />
                    <TrashIcon
                      className="h-5 w-5 text-red-600 cursor-pointer"
                      onClick={() => handleDelete(company.company_id)}
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

export default Company;
