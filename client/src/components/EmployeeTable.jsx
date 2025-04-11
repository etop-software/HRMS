import React from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  Typography,
  Button,
  Input
} from "@material-tailwind/react";
import { PencilSquareIcon, TrashIcon ,MagnifyingGlassIcon} from "@heroicons/react/24/solid";

const EmployeeTable = ({
  employees,
  currentPage,
  itemsPerPage,
  totalPages,
  goToPreviousPage,
  goToNextPage,
  changePage,
  handleEditClick,
  handleDeleteEmployee,
}) => {
  const TABLE_HEAD = [
    "Name",
    "Area",
    "Company ID",
    "EmpID",
    "Dept",
    "Privilege",
    "Actions",
  ];

  const indexOfLastRow = currentPage * itemsPerPage;
  const indexOfFirstRow = indexOfLastRow - itemsPerPage;
  const currentRows = employees.slice(indexOfFirstRow, indexOfLastRow);

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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className="px-6 py-4 text-left text-xs font-semibold text-blue-800 uppercase tracking-wider"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRows.map((employee) => (
              <tr key={employee.employee_id}>
                <td className="px-6 whitespace-nowrap text-sm text-gray-600">
                  {employee.name}
                </td>
                <td className="px-6 whitespace-nowrap text-sm text-gray-600">
                  {employee.area_names && employee.area_names.length > 0
                    ? employee.area_names.join(", ")
                    : "N/A"}
                </td>
                <td className="px-6 whitespace-nowrap text-sm text-gray-600">
                  {employee.companyid}
                </td>
                <td className="px-6 whitespace-nowrap text-sm text-gray-600">
                  {employee.employee_id}
                </td>
                <td className="px-6 whitespace-nowrap text-sm text-gray-600">
                  {employee ? employee.department_name || "N/A" : "N/A"}
                </td>
                <td className="px-6 whitespace-nowrap text-sm text-gray-600">
                  {employee ? (
                    <>
                      {employee.privilage === "14"
                        ? "Admin"
                        : employee.privilage === "0"
                        ? "Normal User"
                        : "N/A"}
                    </>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="px-6 text-sm text-gray-600">
                  <div className="flex space-x-2">
                    <PencilSquareIcon
                      className="h-5 w-5 my-2 cursor-pointer text-blue-600"
                      onClick={() => handleEditClick(employee)}
                    />
                    <TrashIcon
                      className="h-5 w-5 my-2 cursor-pointer text-red-400"
                      onClick={() =>
                        handleDeleteEmployee(employee.employee_id)
                      }
                    />
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
                currentPage === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-500"
              }`}
            >
              Previous
            </Button>

            {Array.from({ length: totalPages }, (_, index) => (
              <Button
                key={index + 1}
                onClick={() => changePage(index + 1)}
                disabled={currentPage === index + 1}
                className={`px-4 py-2 rounded-md ${
                  currentPage === index + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {index + 1}
              </Button>
            ))}

            <Button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-500"
              }`}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
};

export default EmployeeTable;