import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const URL_SERV = 'http://localhost:3000';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        validateField(name, value);
    };

    const validateField = (name, value) => {
        let errorMessage = '';
        switch (name) {
            case 'email':
                const emailRegex = /^\S+@\S+\.\S+$/;
                if(value.trim() === ''){
                    errorMessage = "Email is requried";
                  }
                else if (!emailRegex.test(value)) {
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            default:
                break;
        }
        setErrors({
            ...errors,
            [name]: errorMessage,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let hasErrors = false;
        for (const key in formData) {
          if (formData[key].trim() === '' || errors[key]) {
            hasErrors = true;
          }
        }
        if (hasErrors) {
          toast.error('Please fill out all fields correctly.');
          return ;
        }

        try {
            const response = await fetch(`${URL_SERV}/resetPassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                const data = response.json();
                console.log('Reset password link sent to your email:',data);
                toast.success('Reset password link sent to your email.');
                navigate('/login');
            } else {
                const errorData = await response.json();
                console.log(errorData.message || 'Something went wrong.');
            }
        } catch (err) {
            console.error('Error resetting password:', err);
            toast.error('failed to sent link');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header text-white">Forgot Password</div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit} noValidate>
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        name='email'
                                        className={`form-control ${errors.email && 'is-invalid'}`}
                                        id="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        maxLength={30}
                                        required
                                    />
                                     {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                </div>
                                <button type="submit" className="btn btn-orange mt-2">Reset Password</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
