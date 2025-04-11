import React, { useState, useEffect, useMemo } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Typography,
  Input,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Dialog,
  DialogBody,
  DialogFooter,
  Select,
  Option,
  Checkbox,
} from "@material-tailwind/react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";

const TABLE_HEAD = [
  "Device",
  "Status",
  "Area",
  "Serial NO",
  "IP",
  "Users",
  "FP",
  "Att",
  "Face",
  // "FP V.",
  // "Face V.",
  // "Fir V.",
  "Actions",
];

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [openDialog, setOpenDialog] = useState(false); // State for Dialog visibility
  const [selectedDevice, setSelectedDevice] = useState(null); // The device that is being edited
  const [areas, setAreas] = useState([]); // Areas for the dropdown
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [currentPage, setCurrentPage] = useState(1);
  const storedUserType = localStorage.getItem('userType');
  const itemsPerPage = 20;

  // Fetch devices from API
  const fetchDevices = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + "/api/devices"
      );
      if (response.ok) {
        const data = await response.json();
        setDevices(data.devices);
        console.log(data.devices);
      } else {
        console.error("Failed to fetch devices:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  const fetchAreas = async () => {
    const response = await fetch(import.meta.env.VITE_API_URL + "/api/areas");
    const data = await response.json();
    setAreas(data);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL +
          `/api/devices/${selectedDevice.serial_number}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            device_name: selectedDevice.device_name,
            area_id: selectedDevice.area_id,
            attendance_sync: selectedDevice.attendance_sync,
            user_sync: selectedDevice.user_sync,
            Zone_id: selectedDevice.time_zone,
            reboot: selectedDevice.reboot,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.message === "Device updated successfully") {
          setOpenDialog(false); // Close the dialog
          fetchDevices(); // Refresh the device list
        } else {
          console.error("Error saving device:", data.message);
        }
      } else {
        console.error("Failed to update device. Status code:", response.status);
      }
    } catch (error) {
      console.error("Error saving device:", error);
    }
  };

  const fetchDeviceDetails = async (serialNumber) => {
    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + `/api/devices/${serialNumber}`
      );
      const data = await response.json();
      if (data.success) {
        setSelectedDevice(data.device); // Set device data to state
        setOpenDialog(true); // Open the dialog
      } else {
        console.error("Device not found.");
      }
    } catch (error) {
      console.error("Error fetching device:", error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDevices();
    fetchAreas();
  }, []);

  // Handle checkbox change to update attendance_sync
  const handleCheckboxChange = (event) => {
    const updatedDevice = {
      ...selectedDevice,
      attendance_sync: event.target.checked,
    };
    setSelectedDevice(updatedDevice); // Update the selectedDevice state
  };
  const handleCheckboxChange1 = (event) => {
    const updatedDevice = {
      ...selectedDevice,
      user_sync: event.target.checked,
    };
    setSelectedDevice(updatedDevice); // Update the selectedDevice state
  };

  const handleCheckboxChange2 = (event) => {
    const updatedDevice = {
      ...selectedDevice,
      reboot: event.target.checked,
    };
    setSelectedDevice(updatedDevice); // Update the selectedDevice state
  };



  // Filter devices based on search query
  const filteredDevices = useMemo(
    () =>
      devices.filter(
        ({ serial_number, device_ip }) =>
          serial_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          device_ip.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery, devices]
  );

  const DeleteDeviceDetails = async (serialNumber) => {
    // Prompt user for confirmation before proceeding with the deletion
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this device?"
    );

    if (!isConfirmed) {
      console.log("Device deletion canceled.");
      return; // Exit the function if the user cancels the action
    }

    try {
      const response = await fetch(
        import.meta.env.VITE_API_URL + `/api/devices/${serialNumber}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.message === "Device deleted successfully") {
          fetchDevices(); // Call function to refresh device list
        } else {
          console.error("Error deleting device:", data.message);
        }
      } else {
        console.error("Failed to delete device. Status code:", response.status);
      }
    } catch (error) {
      console.error("Error deleting device:", error);
    }
  };

  // Pagination
  const indexOfLastRow = currentPage * itemsPerPage;
  const indexOfFirstRow = indexOfLastRow - itemsPerPage;
  const currentDevices = useMemo(
    () => filteredDevices.slice(indexOfFirstRow, indexOfLastRow),
    [filteredDevices, indexOfFirstRow, itemsPerPage]
  );

  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);

  // Handle pagination click
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        {/* <div className="flex items-center justify-between gap-5 mt-2 mb-3">
          <div className="w-full md:w-72">
            <Input
              label="Search by Serial Number or IP"
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div> */}
      </CardHeader>
      <Dialog size="xs" open={openDialog} handler={() => setOpenDialog(false)}>
        <DialogBody>
          {selectedDevice && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-600">
                  Device Name
                </label>
                <input
                  type="text"
                  className="block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedDevice.device_name}
                  onChange={(e) =>
                    setSelectedDevice({
                      ...selectedDevice,
                      device_name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-600">
                  Serial Number
                </label>
                <Input value={selectedDevice.serial_number} disabled />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-600">
                  Device IP
                </label>
                <Input value={selectedDevice.device_ip} disabled />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-600">
                  Area
                </label>
                <select
                  className="block w-full px-3 py-2 border cursor-pointer border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={selectedDevice.area_id}
                  onChange={(e) =>
                    setSelectedDevice({
                      ...selectedDevice,
                      area_id: e.target.value,
                    })
                  }
                >
                  {areas.map((area) => (
                    <option key={area.area_id} value={area.area_id}>
                      {area.area_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-600">
                  Time Zone
                </label>
              </div>

              <select
                value={selectedDevice.time_zone}
                onChange={(e) =>
                  setSelectedDevice({
                    ...selectedDevice,
                    time_zone: e.target.value,
                  })
                }
                className="block w-full px-3 py-2 border cursor-pointer border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="-12:30">Etc/GMT-12:30</option>
                <option value="-12:00">Etc/GMT-12</option>
                <option value="-11:30">Etc/GMT-11:30</option>
                <option value="-11:00">Etc/GMT-11</option>
                <option value="-10:30">Etc/GMT-10:30</option>
                <option value="-10:00">Etc/GMT-10</option>
                <option value="-9:30">Etc/GMT-9:30</option>
                <option value="-9:00">Etc/GMT-9</option>
                <option value="-8:30">Etc/GMT-8:30</option>
                <option value="-8:00">Etc/GMT-8</option>
                <option value="-7:30">Etc/GMT-7:30</option>
                <option value="-7:00">Etc/GMT-7</option>
                <option value="-6:30">Etc/GMT-6:30</option>
                <option value="-6:00">Etc/GMT-6</option>
                <option value="-5:30">Etc/GMT-5:30</option>
                <option value="-5:00">Etc/GMT-5</option>
                <option value="-4:30">Etc/GMT-4:30</option>
                <option value="-4:00">Etc/GMT-4</option>
                <option value="-3:30">Etc/GMT-3:30</option>
                <option value="-3:00">Etc/GMT-3</option>
                <option value="-2:30">Etc/GMT-2:30</option>
                <option value="-2:00">Etc/GMT-2</option>
                <option value="-1:30">Etc/GMT-1:30</option>
                <option value="-1:00">Etc/GMT-1</option>
                <option value="-0:30">Etc/GMT-0:30</option>
                <option value="0:00">Etc/GMT</option>
                <option value="+0:30">Etc/GMT+0:30</option>
                <option value="+1:00">Etc/GMT+1</option>
                <option value="+1:30">Etc/GMT+1:30</option>
                <option value="+2:00">Etc/GMT+2</option>
                <option value="+2:30">Etc/GMT+2:30</option>
                <option value="+3:00">Etc/GMT+3</option>
                <option value="+3:30">Etc/GMT+3:30</option>
                <option value="+4:00">Etc/GMT+4</option>
                <option value="+4:30">Etc/GMT+4:30</option>
                <option value="+5:00">Etc/GMT+5</option>
                <option value="+5:30">Etc/GMT+5:30</option>
                <option value="+6:00">Etc/GMT+6</option>
                <option value="+6:30">Etc/GMT+6:30</option>
                <option value="+7:00">Etc/GMT+7</option>
                <option value="+7:30">Etc/GMT+7:30</option>
                <option value="+8:00">Etc/GMT+8</option>
                <option value="+8:30">Etc/GMT+8:30</option>
                <option value="+9:00">Etc/GMT+9</option>
                <option value="+9:30">Etc/GMT+9:30</option>
                <option value="+10:00">Etc/GMT+10</option>
                <option value="+10:30">Etc/GMT+10:30</option>
                <option value="+11:00">Etc/GMT+11</option>
                <option value="+11:30">Etc/GMT+11:30</option>
                <option value="+12:00">Etc/GMT+12</option>
                <option value="+12:30">Etc/GMT+12:30</option>
                <option value="+13:00">Etc/GMT+13</option>
                <option value="+13:30">Etc/GMT+13:30</option>
              </select>

              <div>
                <Checkbox
                  label="Sync Attendance Logs"
                  checked={selectedDevice.attendance_sync}
                  onChange={handleCheckboxChange}
                />
                <Checkbox
                  label="Sync Users Between Area"
                  checked={selectedDevice.user_sync}
                  onChange={handleCheckboxChange1}
                />
                
                <Checkbox
                label ="Reboot Device"
                checked={selectedDevice.reboot}
                onChange={handleCheckboxChange2}
                />
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button color="blue" onClick={handleSave}>
            Save{" "}
          </Button>
          <Button
            variant="text"
            color="blue"
            onClick={() => setOpenDialog(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </Dialog>
      <CardBody className="relative">
        <div className="overflow-x-auto shadow-sm rounded-lg">
          <table className="w-full min-w-max table-auto">
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
            <tbody className="divide-y divide-gray-200">
              {currentDevices.map((device) => (
                <tr
                  key={device.serial_number}
                  className="hover:bg-gray-50 transition-colors "
                  // onClick={() =>
                  //   fetchDeviceDetails(device.serial_number)
                  // }
                >
                  <td
                    className="px-4  text-sm font-medium text-blue-600 cursor-pointer  hover:text-blue-800 hover:underline hover:underline-offset-2"
                    onClick={() => fetchDeviceDetails(device.serial_number)} // Move the onClick here
                  >
                    {device.device_name}
                  </td>

                  <td className="px-6  text-sm whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        device.status
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {device.status ? "Online" : "Offline"}
                      <span
                        className={`w-2 h-2 ml-2 rounded-full ${
                          device.status ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></span>
                    </span>
                  </td>
                  <td className="px-5  text-sm text-gray-600 whitespace-nowrap">
                    {/* <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"> */}
                    {device.area_name}
                    {/* </span> */}
                  </td>
                  <td className="px-5 text-sm text-gray-600 whitespace-nowrap">
                    {device.serial_number}
                  </td>
                  <td className="px-5  text-sm text-gray-600 whitespace-nowrap">
                    {device.device_ip}
                  </td>
                  <td className="px-5  text-sm text-gray-600 whitespace-nowrap">
                    {device.enrolled_users}
                  </td>
                  <td className="px-5  text-sm text-gray-600 whitespace-nowrap">
                    {device.fingerprints}
                  </td>
                  <td className="px-5  text-sm text-gray-600 whitespace-nowrap">
                    {device.attendance_records}
                  </td>
                  <td className="px-5  text-sm text-gray-600 whitespace-nowrap">
                    {device.dev_support_data}
                  </td>
                  {/* <td className="px-5  text-sm text-gray-600 whitespace-nowrap">
                    {device.fingerprint_version}
                  </td>
                  <td className="px-6  text-sm text-gray-600 whitespace-nowrap">
                    {device.face_version}
                  </td>
                  <td className="px-5  text-sm text-gray-600 whitespace-nowrap">
                    {device.firmware_version}
                  </td> */}
  <td className="px-5 whitespace-nowrap">
    <div className="flex space-x-2">
      <div className="p-2 hover:bg-blue-50 rounded-full transition-colors">
        <PencilSquareIcon
          className="h-5 w-5 cursor-pointer text-blue-600"
          onClick={() => fetchDeviceDetails(device.serial_number)}
        />
      </div>
      <div className="p-2 hover:bg-red-50 rounded-full transition-colors">
        <TrashIcon
          className="h-5 w-5 cursor-pointer text-red-500"
          onClick={() => DeleteDeviceDetails(device.serial_number)}
        />
      </div>
    </div>
  </td>


                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>

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
          Page {currentPage} of{" "}
          {Math.ceil(filteredDevices.length / itemsPerPage)}
        </Typography>

        <Button
          onClick={() =>
            setCurrentPage((prev) =>
              currentPage * itemsPerPage < filteredDevices.length
                ? prev + 1
                : prev
            )
          }
          disabled={currentPage * itemsPerPage >= filteredDevices.length}
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

export default Devices;
