import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOffIcon } from "lucide-react";

const changePasswordtemp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [passwordErrors, setPasswordErrors] = useState([]);

  // Password validation function
  const validatePassword = (newPassword) => {
    const errors = [];
    
    if (newPassword.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(newPassword)) errors.push("At least one uppercase letter");
    if (!/[a-z]/.test(newPassword)) errors.push("At least one lowercase letter");
    if (!/\d/.test(newPassword)) errors.push("At least one number");
    if (!/[@$!%*?&]/.test(newPassword)) errors.push("At least one special character (@$!%*?&)");

    setPasswordErrors(errors);
  };

  // Handle password input and validate in real-time
  const handlePasswordInput = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(null);
  
    if (passwordErrors.length > 0) {
      setError("Password does not meet strength requirements!");
      return;
    }
  
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
  
    try {

      const userId = JSON.parse(localStorage.getItem("userId"));

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/change-password`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ userId: userId, new_password: password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from server:", errorData);
        throw new Error(errorData.message || "Failed to change password");
      }
  
      const data = await response.json();
  
      if (data?.user) {
        user.force_password_change = false;
        localStorage.setItem("user", JSON.stringify(user));
      }
  
      navigate("/dashboard");
    } catch (error) {
      console.error("Error changing password:", error); // Log the actual error to console
      setError(error.message || "Error changing password. Try again.");
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="w-full max-w-[400px] p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <img
            src="https://etopme.ae/wp-content/uploads/2024/08/eTOP-Trading.png"
            alt="Logo"
            className="mx-auto w-40 mb-6 transform hover:scale-105 transition-transform duration-300"
          />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Change Your Password</h2>
          <p className="text-gray-600">Set a strong password to secure your account</p>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-6">
          {/* New Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Enter new password"
              value={password}
              onChange={handlePasswordInput}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[70%] -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <Eye className="h-5 w-5" /> : <EyeOffIcon className="h-5 w-5" />}
            </button>
          </div>
          
          {/* Dynamic Password Requirements */}
          <ul className="text-sm text-red-500 space-y-1">
            {passwordErrors.map((err, index) => (
              <li key={index} className="flex items-center">
                ❌ {err}
              </li>
            ))}
          </ul>

          {/* Confirm Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[70%] -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <Eye className="h-5 w-5" /> : <EyeOffIcon className="h-5 w-5" />}
            </button>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 font-medium transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Update Password
          </button>
        </form>

        <div className="absolute bottom-4 text-center w-full left-0 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} eTOP TRADING L.L.C All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default changePasswordtemp;
