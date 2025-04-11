import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Input,
  Select,
  Option,
  Typography,
  Button,
  CardBody,
  CardFooter,
} from "@material-tailwind/react";
import MultiSelectDropdownAreas from "../components/MultiselectAreas";

const EmployeeForm = ({
  onSubmit,
  departments,
  designations,
  areas,
  selectedEmployee,
  passportImage,
  handleImageUpload,
  selectedAreas,
  setSelectedAreas,
  onCancel,
  isEditMode,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3">
          <Typography className="mb-3 font-normal" variant="h6" color="gray">
            {isEditMode ? "Edit Employee" : "Add Employee"}
          </Typography>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Employee ID"
              size="lg"
              disabled={isEditMode}
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
              label="Company ID"
              size="lg"
              {...register("companyid", { required: "Company ID is required" })}
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
                pattern: {
                  value: /^\d{10}$/,
                  message: "Phone number must be 10 digits",
                },
              })}
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
            areasForDropdown={areas}
            selectedAreas={selectedAreas}
            setSelectedAreas={setSelectedAreas}
          />

          <div>
            <Controller
              name="privilege"
              control={control}
              render={({ field }) => (
                <Select label="Select Privilege" {...field} size="lg">
                  <Option value="0">Normal User</Option>
                  <Option value="14">Admin</Option>
                </Select>
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
          {isEditMode ? "Update" : "Add"}
        </Button>
        <Button variant="text" color="blue" onClick={onCancel}>
          Cancel
        </Button>
      </CardFooter>
    </form>
  );
};

export default EmployeeForm;