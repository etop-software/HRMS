import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import 'react-toastify/dist/ReactToastify.css';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Input,
  Button,
  Dialog,
  IconButton,
} from "@material-tailwind/react";
import { useForm } from "react-hook-form";
import {
  PencilSquareIcon,
  UserPlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const TABLE_HEAD = ["UserName", "Name", "User Type", "Actions"];

const Users = () => {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [userTypes] = useState(["Admin", "NormalUser"]);
  const [searchQuery, setSearchQuery] = useState("");

  const [privileges, setPrivileges] = useState({
    organization: false,
    shifts: false,
    deviceArea: false,
    reports: false,
    processing: false,
    manualPunch: false,
    users: false
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/users`
      );
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onSubmit = async (data) => {
    console.log(data);  
    try {
      const url = selectedUser
        ? `${import.meta.env.VITE_API_URL}/api/users/update`
        : `${import.meta.env.VITE_API_URL}/api/users/register`;

      const method = selectedUser ? "PUT" : "POST";

      if (!data.password) {
        delete data.password;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        fetchUsers();
        reset();
        setOpen(false);
        setSelectedUser(null);
        toast.success(selectedUser ? 'User updated successfully!' : 'User created successfully!');
      } else {
        toast.error('Operation failed. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again later.');
      console.error("Error saving user:", error);
    }
};


const handleEdit = (user) => {
  setSelectedUser(user);
  setValue("user_id", user.user_id);
  setValue("username", user.username);
  setValue("userType", user.usertype);
  setValue("password", "");

  // Set all privileges
  const privileges = {
    departments: user.department_access,
    designations: user.designation_access,
    employees: user.employee_access,
    company: user.company_access,
    shifts: user.shifts_access,
    deviceArea: user.device_area_access,
    reports: user.reports_access,
    processing: user.processing_access,
    manualPunch: user.manual_punch_access,
    users: user.users_access
  };

  // Set individual privileges
  Object.entries(privileges).forEach(([key, value]) => {
    setValue(`privileges.${key}`, value);
  });

  // Check if all privileges are true
  const allSelected = Object.values(privileges).every(Boolean);
  setValue("selectAll", allSelected);

  setOpen(true);
};



const handleDelete = async (userId) => {
  if (!window.confirm("Are you sure you want to delete this user?")) return;

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/users/${userId}`,
      { method: "DELETE" }
    );

    const data = await response.json(); // Parse the JSON response

    if (response.ok) {
      fetchUsers(); // Refresh user list
      toast.success(data.message || "User deleted successfully!"); // Show server message
    } else {
      toast.error(data.message || "Failed to delete user."); // Show error message from server
    }
  } catch (error) {
    toast.error("Error deleting user.");
    console.error("Error deleting user:", error);
  }
};


  return (
    <Card className="h-full w-full">
     <CardHeader floated={false} shadow={false} className="rounded-none">
  <div className="flex flex-col md:flex-row items-center justify-between gap-4">

    
    <div className="w-full md:w-72">
      <Input
        label="Search Users"
        icon={<MagnifyingGlassIcon className="h-5 w-5" />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>

    <Button
      className="flex items-center gap-2"
      onClick={() => setOpen(true)}
      color="blue"
    >
      <UserPlusIcon strokeWidth={2} className="h-5 w-4" />
      Add User
    </Button>
  </div>
</CardHeader>


      <Dialog size="md" open={open} handler={() => setOpen(false)}>
        <Card className="mx-auto w-full">
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardBody className="flex flex-col gap-4">
              <Typography variant="h4" color="blue-gray">
                {selectedUser ? "Edit User" : "Register User"}
              </Typography>

              <Input
                label="User ID"
                size="lg"
                {...register("user_id", { required: "User ID is required" })}
                disabled={!!selectedUser}
              />
              {errors.user_id && (
                <span className="text-red-500 text-sm">
                  {errors.user_id.message}
                </span>
              )}

              {/* Password Input */}
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  size="lg"
                  {...register("password")}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              <Input
                label="Full Name"
                size="lg"
                {...register("username", { required: "Username is required" })}
              />
              {errors.username && (
                <span className="text-red-500 text-sm">
                  {errors.username.message}
                </span>
              )}
              <select
                className="border border-blue-gray-200 text-blue-gray-700 rounded-lg focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
                {...register("userType", { required: "User Type is required" })}
              >
                <option value="">Select User Type</option>
                {userTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.userType && (
                <span className="text-red-500 text-sm">
                  {errors.userType.message}
                </span>
              )}
              <div className="mt-4">
                <Typography variant="h6" color="blue-gray" className="mb-3">
                  User Privileges
                </Typography>
                <div className="grid grid-cols-2 gap-4">
                  {/* Select All Checkbox */}
                  <div className="col-span-2 mb-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-500"
                        {...register("selectAll")}
                        onChange={(e) => {
                          const checked = e.target.checked
                          setValue("selectAll", checked);
                          setValue("privileges.organization", checked)
                          setValue("privileges.departments", checked)
                          setValue("privileges.designations", checked)
                          setValue("privileges.employees", checked)
                          setValue("privileges.company", checked)
                          setValue("privileges.shifts", checked)
                          setValue("privileges.deviceArea", checked)
                          setValue("privileges.reports", checked)
                          setValue("privileges.processing", checked)
                          setValue("privileges.manualPunch", checked)
                          setValue("privileges.users", checked)
                        }}
                      />
                      <span className="font-medium">Select All Privileges</span>
                    </label>
                  </div>

                  {/* Existing privilege checkboxes */}
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-500"
                      {...register("privileges.departments")}
                    />
                    <span>Departments</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-500"
                      {...register("privileges.designations")}
                    />
                    <span>Designations</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-500"
                      {...register("privileges.employees")}
                    />
                    <span>Employees</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-500"
                      {...register("privileges.company")}
                    />
                    <span>Company</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-500"
                      {...register("privileges.shifts")}
                    />
                    <span>Shifts/Leaves</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-500"
                      {...register("privileges.deviceArea")}
                    />
                    <span>Device/Area</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-500"
                      {...register("privileges.reports")}
                    />
                    <span>Reports</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-500"
                      {...register("privileges.processing")}
                    />
                    <span>Processing</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-500"
                      {...register("privileges.manualPunch")}
                    />
                    <span>Manual Punch</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-800"
                      {...register("privileges.users")}
                    />
                    <span>Users</span>
                  </label>
                </div>
              </div>
            </CardBody>
            <CardFooter className="pt-0 flex justify-end gap-2">
              <Button type="submit" color="blue">
                {selectedUser ? "Update" : "Register"}
              </Button>
              <Button
                variant="text"
                color="blue"
                onClick={() => {
                  setOpen(false);
                  setSelectedUser(null);
                  reset();
                }}
              >
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Card>
      </Dialog>

      <CardBody>
        <table className="w-full min-w-max table-auto text-left">
        <thead>
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
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.user_id}>
                <td className="px-6 text-sm text-gray-900">{user.user_id}</td>
                <td className="px-6 text-sm text-gray-900">{user.username}</td>
                <td className="px-6 text-sm text-gray-900">{user.usertype}</td>
                <td className="px-6 text-sm text-gray-900">
                  <div className="flex gap-2">
                    <IconButton
                      variant="text"
                      color="blue"
                      onClick={() => handleEdit(user)}
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton
                      variant="text"
                      color="red"
                      onClick={() => handleDelete(user.id)}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
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

export default Users;
