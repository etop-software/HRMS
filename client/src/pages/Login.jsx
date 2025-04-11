import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye,EyeOffIcon} from "lucide-react";
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUsername } from '../redux/slices/userSlice'; 

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        alert("Login failed!");
        throw new Error('Login failed!');
      }

  
      const data = await response.json(); 


    

      const { token, user_id, username, force_password_change , usertype,privileges} = data;

    
      localStorage.setItem('token', token);
      localStorage.setItem('userName', username);
      localStorage.setItem('userId', user_id);
      localStorage.setItem('userType', usertype);
      localStorage.setItem('forcePasswordChange', force_password_change);
      localStorage.setItem('privileges', JSON.stringify({
          organization: privileges.organization,
          departments: privileges.departments,
          designations: privileges.designations, 
          employees: privileges.employees,
          company: privileges.company,
          shifts: privileges.shifts,
          deviceArea: privileges.deviceArea,
          reports: privileges.reports,
          processing: privileges.processing,
          manualPunch: privileges.manualPunch,
          users: privileges.users
      }));
      

      navigate(force_password_change ? "/change-password" : "/dashboard");
      
    } catch (error) {
      console.error(error);
    }
  };
  
  

  return (
    <>
     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="w-full max-w-[400px] p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <img
            src="https://etopme.ae/wp-content/uploads/2024/08/eTOP-Trading.png"
            alt="Logo"
            className="mx-auto w-40 mb-6 transform hover:scale-105 transition-transform duration-300"
          />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome Back!
          </h2>
          <p className="text-gray-600">
            Enter your credentials to access your account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Id
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Enter your User ID"
              value={formData.user_id}
              onChange={(e) =>
                setFormData({ ...formData, user_id: e.target.value })
              }
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[70%] -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeOffIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>

            <a
              href="#forgot"
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 font-medium transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Sign In
          </button>
        </form>

        {/* <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a
            href="#signup"
            className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Sign up
          </a>
        </p> */}
      </div>
      <div className="absolute bottom-4 text-center w-full left-0 text-sm text-gray-500">
  <p>© {new Date().getFullYear()} eTOP TRADING L.L.C All rights reserved.</p>
</div>
    </div>
  
    </>
   
  );
};

export default Login;