import React, { useState, useMemo, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  PencilSquareIcon,
  SquaresPlusIcon,
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
  IconButton,
  Checkbox,
} from "@material-tailwind/react";
import { useForm } from "react-hook-form";

const TABLE_HEAD = [
  "Shift Code",
  "Shift Name",
  "In Time",
  "Out Time",
  "Grace Time (mins)",
  "Break Time (mins)",
  "Next Day",
  "Actions",
];

const Shift = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [shifts, setShifts] = useState([]); // Shift data
  const storedUserType = localStorage.getItem('userType');
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm();
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const handleEditClick = (shift) => {
    setSelectedShift(shift);

    reset({
      shiftCode: shift.shift_code,
      shiftName: shift.shift_name,
      inTime: shift.in_time,
      outTime: shift.out_time,
      graceTime: shift.grace_time,
      breakTime: shift.break_time,
      nextday: shift.nextday,
      deductBreak: shift.deduct_break,
      otStartsAfter: shift.ot_starts_after,
      minOT: shift.min_ot_time,
      weeklyOff: shift.selected_week_off,
      halfday: shift.selected_halfday,
      halfDayInTime: shift.halfday_in_time,
      halfDayOutTime: shift.halfday_out_time,
      halfDayGraceTime: shift.halfday_grace_time,
      halfDayBreakTime: shift.halfday_break_time,
      halfDayOTStartsAfter: shift.halfday_ot_starts_after,
      halfDayMinOT: shift.halfday_min_time_for_ot,
    });

    setOpenEditDialog(true);
  };

  const handleEditSubmit = async (data) => {
    const requestBody = {
      shiftCode: data.shiftCode,
      shiftName: data.shiftName,
      inTime: data.inTime,
      outTime: data.outTime,
      graceTime: data.graceTime,
      breakTime: data.breakTime,
      nextday: data.nextday,
      deductBreak: data.deductBreak,
      selectedWeekOff:
        data.weeklyOff?.length > 0 ? data.weeklyOff.join(",") : null,
      selectedHalfday: data.halfday?.length > 0 ? data.halfday.join(",") : null,
      otStartsAfter: data.otStartsAfter,
      minOtTime: data.minOT,
      isActive: true, // Set as active by default
      halfDayInTime: data.halfDayInTime || null,
      halfDayOutTime: data.halfDayOutTime || null,
      halfDayGraceTime: data.halfDayGraceTime || null,
      halfDayBreakTime: data.halfDayBreakTime || null,
      halfDayOTStartsAfter: data.halfDayOTStartsAfter || null,
      halfDayMinOT: data.halfDayMinOT || null,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/shifts/${selectedShift.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        fetchShifts(); // Refresh the list after successful edit
        setOpenEditDialog(false); // Close dialog
        setSelectedShift(null); // Reset selected shift
      } else {
        console.error("Failed to update shift:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating shift:", error);
    }
  };

  const handleDelete = async (id) => {
    // Confirm deletion with the user
    if (!confirm("Are you sure you want to delete this shift?")) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/shifts/${id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" }, // Optional, for consistent API behavior
        }
      );

      if (response.ok) {
        alert("Shift deleted successfully."); // Provide user feedback
        fetchShifts(); // Refresh the list after successful deletion
      } else {
        // Log the error and alert the user
        console.error("Failed to delete shift:", response.statusText);
        alert("Failed to delete the shift. Please try again.");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert(
        "An error occurred while deleting the shift. Please check your network and try again."
      );
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

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleOpen = () => setOpen(!open);

  const filteredShifts = useMemo(
    () =>
      shifts.filter(({ shift_name }) =>
        shift_name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery, shifts]
  );

  const onSubmit = async (data) => {
    const requestBody = {
      shiftCode: data.shiftCode,
      shiftName: data.shiftName,
      inTime: data.inTime,
      outTime: data.outTime,
      graceTime: data.graceTime,
      breakTime: data.breakTime,
      nextday: data.nextday,
      deductBreak: data.deductBreak,
      selectedWeekOff: data.weeklyOff,
      selectedHalfday: data.selectedHalfday,
    };

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/shifts",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        console.log("Shift successfully added", responseData);
        fetchShifts(); // Fetch updated shift list
      } else {
        const errorData = await response.json();
        console.error("Submission error:", response.statusText, errorData);
      }
    } catch (error) {
      console.error("Network error:", error);
    }

    reset();
    setOpen(false);
  };

  return (
    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="flex items-center justify-between gap-5 mt-2 mb-3">
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            <div className="w-full md:w-72">
              <Input
                label="Search Shift"
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
            <SquaresPlusIcon strokeWidth={2} className="h-5 w-4" /> Add Shift
          </Button>
        </div>
      </CardHeader>
      <Dialog
        size="xl"
        open={open}
        handler={handleOpen}
        className="bg-transparent shadow-none"
      >
        <Card className="mx-auto w-full max-w-[1100px]">
          <div className="modal-header flex justify-between items-center p-4 border-b">
            <Typography variant="h5">Add Shift</Typography>
            <button
              type="button"
              className="btn-close"
              onClick={handleOpen}
              aria-label="Close"
            ></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardBody className="grid grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
              <div className="flex flex-col">
                <Input
                  label="Shift Code"
                  size="small"
                  {...register("shiftCode")}
                />
              </div>
              <div className="flex flex-col">
                <Input
                  label="Shift Name"
                  size="small"
                  {...register("shiftName")}
                />
              </div>

              {/* Weekly Off Section */}
              <Typography
                variant="small"
                color="blue-gray"
                className="col-span-3"
              >
                Weekly Off
              </Typography>
              <div className="col-span-3 grid grid-cols-7 gap-1">
                {[
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ].map((day) => (
                  <div key={day} className="flex items-center">
                    <Checkbox
                      type="checkbox"
                      id={`weeklyOff-${day}`}
                      checked={watch("weeklyOff")?.includes(day)}
                      onChange={({ target }) => {
                        const currentValues = watch("weeklyOff") || [];
                        if (target.checked) {
                          setValue("weeklyOff", [...currentValues, day]);
                        } else {
                          setValue(
                            "weeklyOff",
                            currentValues.filter((value) => value !== day)
                          );
                        }
                      }}
                    />
                    <label htmlFor={`weeklyOff-${day}`} className="ml-2">
                      {day}
                    </label>
                  </div>
                ))}
              </div>

              {/* Time Settings */}
              <div className="flex flex-col">
                <Input
                  label="In Time"
                  size="small"
                  type="time"
                  {...register("inTime")}
                />
              </div>
              <div className="flex flex-col">
                <Input
                  label="Out Time"
                  size="small"
                  type="time"
                  {...register("outTime")}
                />
              </div>
              <div className="flex flex-col">
                <Input
                  label="Grace Time (Minutes)"
                  size="small"
                  type="number"
                  {...register("graceTime")}
                />
              </div>
              <div className="flex flex-col">
                <Input
                  label="Break Time (Minutes)"
                  size="small"
                  type="number"
                  {...register("breakTime")}
                />
              </div>
              <div className="flex flex-col">
                <Input
                  label="OT Starts After (Minutes)"
                  size="small"
                  type="number"
                  {...register("otStartsAfter")}
                />
              </div>
              <div className="flex flex-col">
                <Input
                  label="Minimum Time for OT (Minutes)"
                  size="small"
                  type="number"
                  {...register("minOT")}
                />
              </div>

              {/* Checkboxes */}
              <div className="col-span-3 grid grid-cols-7 mt-1">
                <div className="flex items-center col-span-2">
                  <Checkbox
                    type="checkbox"
                    id="nextday"
                    {...register("nextday")}
                  />
                  <label htmlFor="nextday" className="ml-2">
                    Next Day Shift
                  </label>
                </div>
                <div className="flex items-center col-span-3">
                  <Checkbox
                    type="checkbox"
                    id="deductBreak"
                    {...register("deductBreak")}
                  />
                  <label htmlFor="deductBreak" className="ml-2">
                    Deduct Break
                  </label>
                </div>
              </div>

              {/* Half-Day Settings */}
              <Typography
                variant="small"
                color="blue-gray"
                className="col-span-3"
              >
                Half-Day Settings
              </Typography>
              <div className="col-span-3 grid grid-cols-7 gap-1">
                {[
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ].map((day) => (
                  <div key={day} className="flex items-center">
                    <Checkbox
                      type="checkbox"
                      id={`halfday-${day}`}
                      {...register("halfday")}
                      value={day}
                    />
                    <label htmlFor={`halfday-${day}`} className="ml-2">
                      {day}
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex flex-col">
                <Input
                  label="Half-Day In Time"
                  size="small"
                  type="time"
                  {...register("halfDayInTime")}
                />
              </div>
              <div className="flex flex-col">
                <Input
                  label="Half-Day Out Time"
                  size="small"
                  type="time"
                  {...register("halfDayOutTime")}
                />
              </div>
              <div className="flex flex-col">
                <Input
                  label="Half-Day Break Time (Minutes)"
                  size="small"
                  type="number"
                  {...register("halfDayBreakTime")}
                />
              </div>
              <div className="flex flex-col">
                <Input
                  label="Half-Day Grace Time (Minutes)"
                  size="small"
                  type="number"
                  {...register("halfDayGraceTime")}
                />
              </div>
              <div className="flex flex-col">
                <Input
                  label="Half-Day OT Starts After (Minutes)"
                  size="small"
                  type="number"
                  {...register("halfDayOTStartsAfter")}
                />
              </div>
              <div className="flex flex-col">
                <Input
                  label="Minimum Time for Half-Day OT (Minutes)"
                  size="small"
                  type="number"
                  {...register("halfDayMinOT")}
                />
              </div>
            </CardBody>

            <CardFooter className="pt-0 flex justify-end">
              <Button type="submit" variant="gradient" color="blue">
                Add Shift
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
        size="xl"
        open={openEditDialog}
        handler={() => setOpenEditDialog(false)}
        className="bg-transparent shadow-none"
      >
        <Card className="mx-auto w-full max-w-[1100px]">
          <div className="modal-header flex justify-between items-center p-4 border-b">
            <Typography variant="h5">Edit Shift</Typography>
            <button
              type="button"
              className="btn-close"
              onClick={() => setOpenEditDialog(false)}
              aria-label="Close"
            ></button>
          </div>
          <form onSubmit={handleSubmit(handleEditSubmit)}>
            <CardBody className="grid grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
              <div className="flex flex-col">
                <Input
                  label="Shift Code"
                  size="small"
                  {...register("shiftCode")}
                />
              </div>
              <div className="flex flex-col">
                <Input
                  label="Shift Name"
                  size="small"
                  {...register("shiftName")}
                />
              </div>

              <Typography
                variant="small"
                color="blue-gray"
                className="col-span-3"
              >
                Weekly Off
              </Typography>
              <div className="col-span-3 grid grid-cols-7 gap-1">
                {[
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ].map((day) => (
                  <div key={day} className="flex items-center">
                    <Checkbox
                      type="checkbox"
                      id={`weeklyOff-${day}`}
                      {...register("weeklyOff")}
                      value={day}
                    />
                    <label htmlFor={`weeklyOff-${day}`} className="ml-2">
                      {day}
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex flex-col">
                <Input
                  label="In Time"
                  size="small"
                  type="time"
                  {...register("inTime")}
                />
              </div>
              <div className="flex flex-col">
                <Input
                  label="Out Time"
                  size="small"
                  type="time"
                  {...register("outTime")}
                />
              </div>
              <div className="flex flex-col">
                <Input
                  label="Grace Time (Minutes)"
                  size="small"
                  type="number"
                  {...register("graceTime")}
                />
              </div>
              <div className="flex flex-col">
                <Input
                  label="Break Time (Minutes)"
                  size="small"
                  type="number"
                  {...register("breakTime")}
                />
              </div>
              <div className="flex flex-col">
                <Input
                  label="OT Starts After (Minutes)"
                  size="small"
                  type="number"
                  {...register("otStartsAfter")}
                />
              </div>
              <div className="flex flex-col">
                <Input
                  label="Minimum Time for OT (Minutes)"
                  size="small"
                  type="number"
                  {...register("minOT")}
                />
              </div>

              <div className="col-span-3 grid grid-cols-7 mt-1">
                <div className="flex items-center col-span-2">
                  <Checkbox
                    type="checkbox"
                    id="nextday"
                    {...register("nextday")}
                  />
                  <label htmlFor="nextday" className="ml-2">
                    Next Day Shift
                  </label>
                </div>
                <div className="flex items-center col-span-3">
                  <Checkbox
                    type="checkbox"
                    id="deductBreak"
                    {...register("deductBreak")}
                  />
                  <label htmlFor="deductBreak" className="ml-2">
                    Deduct Break
                  </label>
                </div>
              </div>

              <Typography
                variant="small"
                color="blue-gray"
                className="col-span-3"
              >
                Half-Day Settings
              </Typography>
              <div className="col-span-3 grid grid-cols-7 gap-1">
                {[
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ].map((day) => (
                  <div key={day} className="flex items-center">
                    <Checkbox
                      type="checkbox"
                      id={`halfday-${day}`}
                      {...register("halfday")}
                      value={day}
                    />
                    <label htmlFor={`halfday-${day}`} className="ml-2">
                      {day}
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex flex-col">
                <Input
                  label="Half-Day In Time"
                  size="small"
                  type="time"
                  {...register("halfDayInTime")}
                />
              </div>
              <div className="flex flex-col">
                <Input
                  label="Half-Day Out Time"
                  size="small"
                  type="time"
                  {...register("halfDayOutTime")}
                />
              </div>
              <div className="flex flex-col">
                <Input
                  label="Half-Day Break Time (Minutes)"
                  size="small"
                  type="number"
                  {...register("halfDayBreakTime")}
                />
              </div>
              <div className="flex flex-col">
                <Input
                  label="Half-Day Grace Time (Minutes)"
                  size="small"
                  type="number"
                  {...register("halfDayGraceTime")}
                />
              </div>
              <div className="flex flex-col">
                <Input
                  label="Half-Day OT Starts After (Minutes)"
                  size="small"
                  type="number"
                  {...register("halfDayOTStartsAfter")}
                />
              </div>
              <div className="flex flex-col">
                <Input
                  label="Minimum Time for Half-Day OT (Minutes)"
                  size="small"
                  type="number"
                  {...register("halfDayMinOT")}
                />
              </div>
            </CardBody>

            <CardFooter className="pt-0 flex justify-end">
              <Button type="submit" variant="gradient" color="blue">
                Update Shift
              </Button>
              <Button
                variant="text"
                color="blue"
                onClick={() => setOpenEditDialog(false)}
              >
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Card>
      </Dialog>

      {/* Shift Table */}
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
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredShifts.map((shift) => (
              <tr key={shift.id}>
                <td className="px-6  whitespace-nowrap text-sm text-gray-600">
                  {shift.shift_code}
                </td>
                <td className="px-6  whitespace-nowrap text-sm text-gray-600">
                  {shift.shift_name}
                </td>
                <td className="px-6  whitespace-nowrap text-sm text-gray-600">
                  {shift.in_time}
                </td>
                <td className="px-6  whitespace-nowrap text-sm text-gray-600">
                  {shift.out_time}
                </td>
                <td className="px-6  whitespace-nowrap text-sm text-gray-600">
                  {shift.grace_time || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {shift.break_time || "-"}
                </td>
                <td className="px-6  whitespace-nowrap text-sm text-gray-600">
                  {shift.nextday ? "Yes" : "No"}
                </td>
                <td className="px-6 text-sm  text-gray-600">
                  <div className="flex space-x-2">
  <>
    <PencilSquareIcon
      className="h-5 w-5 my-2 cursor-pointer text-blue-600"
      onClick={() => handleEditClick(shift)}
      title="Edit"
    />
    <TrashIcon
      className="h-5 w-5 my-2 cursor-pointer text-red-600"
      onClick={() => handleDelete(shift.id)}
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

export default Shift;
