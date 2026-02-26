import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registering user:", formData);
    // Add your signup logic here (e.g., Axios post or Firebase)
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Sign Up for FreeRein</h2>
        <input 
          type="text" name="name" placeholder="Full Name" 
          onChange={handleChange} required 
        />
        <input 
          type="email" name="email" placeholder="Email Address" 
          onChange={handleChange} required 
        />
        <input 
          type="password" name="password" placeholder="Password" 
          onChange={handleChange} required 
        />
        <button type="submit">Create Account</button>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
};

export default Register;