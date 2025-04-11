import React, { useState, useMemo, useEffect } from "react";
import MultiSelectDropdownAreas from "../components/MultiselectAreas";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import { useForm, Controller } from "react-hook-form";
import {
  PencilIcon,
  UserPlusIcon,
  TrashIcon,
  PencilSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import {
  Card,
  CardHeader,
  Input,
  Dialog,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Avatar,
  IconButton,
  Tooltip,
  Select,
  Checkbox,
  Option,
} from "@material-tailwind/react";


const TABLE_HEAD = ["Name", "Area", "Company ID", "EmpID", "Dept","Privilage", "Actions"];

const Employee = () => {
  const [mealtypes, setMealtypes] = useState([]);
  const [selectedMealtypes, setSelectedMealtypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 35;
  const [open, setOpen] = useState(false);
  const [openEditEmployee, setOpenEditEmployee] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [areas, setAreas] = useState([]);
  const [passportImage, setPassportImage] = useState(null);
  const [passportImageBytes, setPassportImageBytes] = useState(null);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const storedUserType = localStorage.getItem('userType');

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm();

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPageNumbers = 5; // Show at most 5 page numbers
  
    if (totalPages <= maxPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
  
    if (currentPage <= 3) {
      pageNumbers.push(1, 2, 3, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
    } else {
      pageNumbers.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
  
    return pageNumbers;
  };
  
  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    setSelectedMealtypes((prevSelected) => {
      if (checked) {
        return [...prevSelected, value];
      } else {
        return prevSelected.filter((mealId) => mealId !== value);
      }
    });
  };


  const handleEditClick = async (employee) => {
    setSelectedEmployee(employee);
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/employees/employeesareas/${employee.employee_id}`
    );
    const data = await response.json();
    const areaIds = data.map((area) => area.area_id);
    console.log("Mapped Area IDs:", areaIds);

    // Update the selected areas state
    setSelectedAreas(areaIds);

    reset({
      employeeId: employee.employee_id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      password: employee.password,
      rfid: employee.rfid,
      doj: employee.date_of_joining?.split("T")[0],
      department: employee.department_id,
      designation: employee.designation_id,
      privilege: employee.privilage,
      companyid: employee.companyid,
    });

    setOpenEditEmployee(true);
};


  const fetchEmployees = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/employees"
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setEmployees(data);
      } else {
        console.error("Failed to fetch employees:", response.statusText);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };
  const fetchAreas = async () => {
    const response = await fetch(import.meta.env.VITE_API_URL + "/api/areas");
    const data = await response.json();
    setAreas(data);
  };
  const fetchmeals = async () => {
    const response = await fetch(
      import.meta.env.VITE_API_URL + "/api/mealtypes"
    );
    const data = await response.json();
    setMealtypes(data);
  };

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
  const handleEditEmployee = async (data) => {
    const formattedDate = data.doj ? new Date(data.doj).toISOString().split('T')[0] : null;
  
    const requestBody = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      rfid: data.rfid,
      date_of_joining: formattedDate,
      department_id: data.department,
      designation_id: data.designation,
      passport_image: passportImageBytes || null,
      area_id: data.area,
      privilage: data.privilege,
      area_ids: selectedAreas,
      companyid: data.companyid,
    };
  
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/employees/${selectedEmployee.employee_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );
  
      if (response.ok) {
        toast.success('Employee updated successfully!');
        const updatedEmployee = await response.json();
        fetchEmployees();
      //  fetchEmployeesforDropdown();
        setOpenEditEmployee(false);
        reset();
        setPassportImage(null);
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error('Failed to update employee');
    }
  };
  
  
  const fetchDesignations = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/designations"
      );
      if (response.ok) {
        const data = await response.json();
        setDesignations(data); // Update the employees state
      } else {
        console.error("Failed to fetch designations:", response.statusText);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchDesignations();
    fetchAreas();
   fetchmeals();
  }, []); 

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const arrayBuffer = reader.result;
        const byteArray = new Uint8Array(arrayBuffer);
        setPassportImageBytes(byteArray);
        setPassportImage(URL.createObjectURL(file));
      };
      reader.readAsArrayBuffer(file);
    }
  };
  const handleDeleteEmployee = async (employeeId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this employee?");
    
    if (!isConfirmed) {
      return; 
    }
  
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/employees/${employeeId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        toast.success('Employee deleted successfully!');
        fetchEmployees(); 
      } else {
        console.error("Failed to delete employee:", response.statusText);
        toast.error('Failed to delete employee');
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error('Failed to delete employee');
    }
  };
  

  const handleOpen = () => setOpen(!open);

  const filteredRows = useMemo(
    () =>
      employees.filter(({ name = "", employee_id }) =>
        name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        employee_id.toString().includes(searchQuery.trim())
      ),
    [searchQuery, employees]
  );
  
  const indexOfLastRow = currentPage * itemsPerPage;
  const indexOfFirstRow = indexOfLastRow - itemsPerPage;
  const currentRows = useMemo(
    () => filteredRows.slice(indexOfFirstRow, indexOfLastRow),
    [filteredRows, indexOfFirstRow, itemsPerPage]
  );

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const changePage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const onSubmit = async (data) => {
    console.log(data);
    const requestBody = {
      employee_id: data.employeeId,
      company_id: data.companyid,
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      rfid: data.rfid,
      date_of_joining: data.doj,
      department_id: data.department,
      designation_id: data.designation,
    //  area_id: data.area,
      selected_areas: selectedAreas, 
     selectedMealtypes:selectedMealtypes,
      privilage: data.privilege,
    };

    if (passportImageBytes) {
      requestBody.passportImage = null;
    } else {
      requestBody.passportImage = null;
    }

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/employees",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        console.log("Successfully submitted", responseData);
        toast.success('Employee added successfully!');
        fetchEmployees(); 
      } else {
        const errorData = await response.json();
        toast.error('Failed to add employee');
        
        alert(
          "Submission error: " + response.statusText + " - " + errorData.message
        );
        console.error("Submission error:", response.statusText, errorData);
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error('Failed to add employee');
    }

    // reset();
    setPassportImage(null);
    setOpen(false);
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
            onClick={handleOpen}
            color="blue"
          >
            <UserPlusIcon strokeWidth={2} className="h-5 w-4" /> Add Employee
          </Button>
        </div>
      </CardHeader>

      <Dialog
        size="lg"
        open={openEditEmployee}
        handler={() => setOpenEditEmployee(false)}
        className="bg-transparent shadow-none"
      >
        <Card className="mx-auto w-full max-w-[1000px]">
  <form onSubmit={handleSubmit(handleEditEmployee)}>
    <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-3">
        <Typography
          className="mb-3 font-normal"
          variant="h6"
          color="gray"
        >
          Edit Employee
        </Typography>
      </div>

      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Employee ID"
            size="lg"
            disabled
            {...register("employeeId")}
          />
        </div>

        <div>
          <Input label="Name" size="lg" {...register("name")} />
        </div>

        <div>
          <Input
            label="Company ID"
            size="lg"
            {...register("companyid")}
          />
        </div>

        <div>
          <Controller
            name="department"
            control={control}
            render={({ field }) => (
              <Select label="Select Department" {...field} size="lg">
                {departments.map((dept) => (
                  <Option key={dept.id} value={dept.id}>
                    {dept.department_name}
                  </Option>
                ))}
              </Select>
            )}
          />
        </div>

        <div>
          <Controller
            name="designation"
            control={control}
            render={({ field }) => (
              <Select label="Select Designation" {...field} size="lg">
                {designations.map((desi) => (
                  <Option key={desi.id} value={desi.id}>
                    {desi.title}
                  </Option>
                ))}
              </Select>
            )}
          />
        </div>

        <div>
          <Input
            label="Phone Number"
            size="lg"
            {...register("phone")}
          />
        </div>

        <div>
          <Input
            label="Password"
            size="lg"
            type="text"
            {...register("password")}
          />
        </div>

        <div>
          <Input label="RFID" size="lg" {...register("rfid")} />
        </div>

        <div>
          <Input
            label="Date of Joining"
            type="date"
            size="lg"
            defaultValue={selectedEmployee?.date_of_joining?.split("T")[0]}
            {...register("doj")}
          />
        </div>

        <div>
          <Input
            label="Email"
            type="email"
            size="lg"
            {...register("email")}
          />
        </div>

        <MultiSelectDropdownAreas
        areasForDropdown={areas} // The available areas
        selectedAreas={selectedAreas} // The currently selected areas
        setSelectedAreas={setSelectedAreas} // Function to update the selected areas
      />

        {/* Add Privilege Field */}
        <div>
          <Controller
            name="privilege"
            control={control}
            render={({ field }) => (
              <div>
                <Select label="Select Privilege" {...field} size="lg">
                  <Option value="0">Normal User</Option>
                  <Option value="14">Admin</Option>
                </Select>
                {errors.privilege && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.privilege.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>
      </div>

      <div className="md:col-span-1 flex flex-col items-center">
        {passportImage ? (
          <img
            src={passportImage}
            alt="Passport Preview"
            className="mb-4 w-48 h-48 object-cover rounded-lg shadow-md"
          />
        ) : (
          <img
            src="https://via.placeholder.com/150"
            alt="Passport Preview"
            className="mb-4 w-48 h-48 object-cover rounded-lg shadow-md"
          />
        )}
        <Input
          label="Passport Image"
          size="lg"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />
      </div>
    </CardBody>

    <CardFooter className="pt-0 flex justify-end">
      <Button type="submit" variant="gradient" color="blue">
        Update
      </Button>
      <Button variant="text"
        color="blue"
        onClick={() => setOpenEditEmployee(false)}>
        Cancel
      </Button>
    </CardFooter>
  </form>
</Card>

      </Dialog>
      <Dialog
        size="lg"
        open={open}
        handler={handleOpen}
        className="bg-transparent shadow-none rounded-none"
      >
        <Card className="mx-auto w-full max-w-[1000px]">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Title */}
              <div className="md:col-span-3">
                <Typography
                  className="mb-3 font-normal"
                  variant="h6"
                  color="gray"
                >
                  Add Employee
                </Typography>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Employee ID"
                    size="lg"
                    {...register("employeeId", {
                      required: "Employee ID is required",
                      pattern: {
                        value: /^[0-9]+$/, 
                        message: "Only numbers are allowed",
                      },
                    })}
                  />
                  {errors.employeeId && (
                    <p className="text-red-500">{errors.employeeId.message}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Name"
                    size="lg"
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && (
                    <p className="text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="CompanyId"
                    size="lg"
                    {...register("companyid", { required: "CompanyId is required" })}
                  />
                  {errors.companyid && (
                    <p className="text-red-500">{errors.companyid.message}</p>
                  )}
                </div>
                <div>
                  <Controller
                    name="department"
                    control={control}
                    rules={{ required: "Department is required" }}
                    render={({ field }) => (
                      <Select label="Select Department" {...field} size="lg">
                        {departments.map((dept) => (
                          <Option key={dept.id} value={dept.id}>
                            {dept.department_name}
                          </Option>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.department && (
                    <p className="text-red-500">{errors.department.message}</p>
                  )}
                </div>

                <div>
                  <Controller
                    name="designation"
                    control={control}
                    rules={{ required: "Designation is required" }}
                    render={({ field }) => (
                      <Select label="Select Designation" {...field} size="lg">
                        {designations.map((desi) => (
                          <Option key={desi.id} value={desi.id}>
                            {desi.title}
                          </Option>
                        ))}
                      </Select>
                    )}
                  />
                  {errors.designation && (
                    <p className="text-red-500">{errors.designation.message}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Phone Number"
                    size="lg"
                    {...register("phone", {
                    // required: "Phone number is required",
                      pattern: {
                        value: /^\d{10}$/,
                        message: "Phone number must be 10 digits",
                      },
                    })}
                  />
                  {/* {errors.phone && (
                    <p className="text-red-500">{errors.phone.message}</p>
                  )} */}
                </div>

                <div>
                  <Input
                    label="Password"
                    size="lg"
                    type="text"
                    {...register("password", {
                      //  required: "Password is required",
                    })}
                  />
                  {/* {errors.password && (
                    <p className="text-red-500">{errors.password.message}</p>
                  )} */}
                </div>

                <div>
                  <Input
                    label="RFID"
                    size="lg"
                    {...register("rfid", {
                      //  required: "RFID is required"
                    })}
                  />
                  {/* {errors.rfid && (
                    <p className="text-red-500">{errors.rfid.message}</p>
                  )} */}
                </div>

                <div>
                  <Input
                    label="Date of Joining"
                    type="date"
                    size="lg"
                    {...register("doj", {
                      // required: "Date of Joining is required",
                    })}
                  />
                  {/* {errors.doj && (
                    <p className="text-red-500">{errors.doj.message}</p>
                  )} */}
                </div>

                <div>
                  <Input
                    label="Email"
                    type="email"
                    size="lg"
                    {...register("email", {
                      // required: "Email is required",
                      // pattern: {
                      //   value:
                      //     /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      //   message: "Please enter a valid email address",
                      // },
                    })}
                  />
                  {/* {errors.email && (
                    <p className="text-red-500">{errors.email.message}</p>
                  )} */}
                </div>
                <div>
                <MultiSelectDropdownAreas
        areasForDropdown={areas} 
        selectedAreas={selectedAreas} 
        setSelectedAreas={setSelectedAreas} 
      />
       
                  {errors.area && (
                    <p className="text-red-500">{errors.area.message}</p>
                  )}
                </div>
               <div className="md:col-span-1">
               <Controller
        name="privilege"
        control={control}
        render={({ field }) => (
          <div>
            <Select label="Select Privilege" {...field} size="lg">
              <Option value="0">Normal User</Option>
              <Option value="14">Admin</Option>
            </Select>
            {/* Error Message */}
            {errors.privilege && (
              <p className="mt-1 text-sm text-red-600">
                {errors.privilege.message}
              </p>
            )}
          </div>
        )}
      />
  {/* <label>MealTypes</label> */}
  {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
  {mealtypes.map((meal) => (
    <div key={meal.id} className="flex items-center space-x-2 gap-0">
      <Checkbox
        id={`meal-${meal.id}`}
        value={meal.id}
        onChange={handleCheckboxChange}
        checked={selectedMealtypes.includes(String(meal.id))}
        color="blue"
      />
      <label 
        htmlFor={`meal-${meal.id}`} 
        className="text-gray-700 font-medium text-sm cursor-pointer"
      >
        {meal.mealtype}
      </label>
    </div>
  ))}
</div> */}


</div> 

              </div>

              <div className="md:col-span-1 flex flex-col items-center">
                {passportImage ? (
                  <img
                    src={passportImage}
                    alt="Passport Preview"
                    className="mb-4 w-48 h-48 object-cover rounded-lg shadow-md"
                  />
                ) : (
                  <img
                    src="https://via.placeholder.com/150"
                    alt="Passport Preview"
                    className="mb-4 w-48 h-48 object-cover rounded-lg shadow-md"
                  />
                )}
                <Input
                  label="Passport Image"
                  size="lg"
                  type="file"
                  accept="image/*"
                  {...register("passportImage", {})}
                  onChange={handleImageUpload}
                />
                {errors.passportImage && (
                  <p className="text-red-500">{errors.passportImage.message}</p>
                )}
              </div>
            </CardBody>

            <CardFooter className="pt-0 flex justify-end">
              <Button type="submit" variant="gradient" color="blue">
                Add 
              </Button>

              <Button variant="text"
                color="blue"onClick={() => handleOpen(false)}>Cancel</Button>
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
                  className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider "
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
            {currentRows.map((employee) => (
              <tr key={employee.employee_id}>
                {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <img
                src={`data:image/png;base64,${employee.passportImage}`}
                  alt="Passport"
                  className="h-12 w-12 object-cover" // Adjust size as needed
                />
              </td> */}
                <td className="px-6 whitespace-nowrap text-sm text-gray-600">
                  {employee.name}
                </td>

                <td className="px-6  whitespace  text-gray-600">
  {employee.area_names && employee.area_names.length > 0
    ? employee.area_names.join(", ")
    : "N/A"}


</td>
           <td className="px-6 whitespace-nowrap text-sm text-gray-600">
                  {employee.companyid}
                </td>

                <td className="px-6  whitespace-nowrap text-sm text-gray-600">
                  {employee.employee_id}
                </td>
                <td className="px-6  whitespace-nowrap text-sm text-gray-600">
                  {employee ? employee.department_name || "N/A" : "N/A"}
                </td>
                <td className="px-6 whitespace-nowrap text-sm text-gray-600">
  {employee ? (
    <>
      {employee.privilage === '14'
        ? "Admin"
        : employee.privilage === '0'
          ? "Normal User"
          : "N/A"}
    </>
  ) : "N/A"}
</td>



                <td className="px-6 text-sm text-gray-600">
                  <div className="flex space-x-2">
  <>
    <PencilSquareIcon
      className="h-5 w-5 my-2 cursor-pointer text-blue-600"
      onClick={() => handleEditClick(employee)}
      title="Edit"
    />
    <TrashIcon
      className="h-5 w-5 my-2 cursor-pointer text-red-400"
      onClick={() => handleDeleteEmployee(employee.employee_id)}
      title="Delete"
    />
  </>


                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <CardFooter className="pt-0 flex justify-center">
  <div className="pagination flex justify-center items-center space-x-2">
    <Button
      onClick={goToPreviousPage}
      disabled={currentPage === 1}
      className={`px-4 py-2 rounded-md ${
        currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-500"
      }`}
    >
      Previous
    </Button>

    <span className="px-4 py-2 text-gray-700">
      Page {currentPage} of {totalPages}
    </span>

    <Button
      onClick={goToNextPage}
      disabled={currentPage === totalPages}
      className={`px-4 py-2 rounded-md ${
        currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-500"
      }`}
    >
      Next
    </Button>
  </div>
</CardFooter>


      </div>
      <ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  newestOnTop={false}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme="light"
/>
    </Card>
  );
};

export default Employee;
