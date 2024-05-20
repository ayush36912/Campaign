import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const URL_SERV = 'http://localhost:3000';

const UpdatePassword = () => {
    const navigate = useNavigate();
    const { token } = useParams();
    const [formData, setFormData] = useState({
        newPassword: '',
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
            case 'newPassword':
                const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{5,16}$/;
                if(value.trim() === ''){
                  errorMessage = "Password is requried";
                }
                else if (value.trim().length < 5) {
                    errorMessage = 'Password must be at least 5 characters long';
                }
                else if(!passwordRegex.test(value)){
                  errorMessage = "Password should contain minimum one uppercase letter, one lowercase letter, one number and one special character.";
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
          return;
        }

        try {
            const response = await fetch(`${URL_SERV}/reset/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Password updated successfully:', data);
                toast.success('Password updated successfully.');
                navigate('/login');
            } else {
                const errorData = await response.json();
                console.log(errorData.message || 'Something went wrong.');
            }
        } catch (err) {
            console.error('Error updating password:', err);
            toast.error('Failed to update password.');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header text-white">Reset Password</div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit} noValidate>
                                <div className="form-group">
                                    <label htmlFor="newPassword">New Password</label>
                                    <input
                                        type="password"
                                        name='newPassword'
                                        className={`form-control ${errors.newPassword && 'is-invalid'}`}
                                        id="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        minLength={10}
                                        required
                                    />
                                    {errors.newPassword && <div className="invalid-feedback">{errors.newPassword}</div>}
                                </div>
                                <button type="submit" className="btn btn-orange mt-2">Update Password</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdatePassword;
