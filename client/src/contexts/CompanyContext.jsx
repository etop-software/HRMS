import React, { createContext, useState, useEffect, useContext } from 'react';

// Create a context for Company
const CompanyContext = createContext();

export const CompanyProvider = ({ children }) => {
  const [companyName, setCompanyName] = useState(null);
  const [allowMonthlyReport, setAllowMonthlyReport] = useState(false);
  const [allowOverTime, setAllowOverTime] = useState(false);
  const [allowLate, setAllowLate] = useState(false);
  const [allowEarlyLeave, setAllowEarlyLeave] = useState(false);
  const [allowAbsent, setAllowAbsent] = useState(false);


  // Fetch the company name when the component mounts
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL + "/api/companies"); // Replace with actual API URL
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setCompanyName(data[0].name);
            setAllowMonthlyReport(data[0].allowmonthlyreport);
            setAllowOverTime(data[0].allowovertime);
            setAllowLate(data[0].allowlate);
            setAllowEarlyLeave(data[0].allowearlyleave);
            setAllowAbsent(data[0].allowabsent); 
          }
        } else {
          console.error('Failed to fetch company data');
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
      }
    };

    fetchCompanyData();
  }, []);  // Empty dependency array means this runs only once

  return (
    <CompanyContext.Provider value={{ 
      companyName,
      allowMonthlyReport,
      allowOverTime,
      allowLate,
      allowEarlyLeave,
      allowAbsent }}>
      {children}
    </CompanyContext.Provider>
  );
};

// Custom hook to access company context
export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};
