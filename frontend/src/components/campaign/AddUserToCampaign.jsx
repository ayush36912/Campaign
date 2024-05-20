import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Select from 'react-select';
import { toast } from 'react-toastify';

const URL_SERV = 'http://localhost:3000';

const AddUserToCampaign = () => {
    
      const [userId, setUserId] = useState('');
      const [userName, setUserName] = useState([]);
      const [errors, setErrors] = useState('');
      const [userIds, setUserIds] = useState([]);  
      const [selectedUserIds, setSelectedUserIds] = useState([]);
      const [assignedUsers, setAssignedUsers] = useState([]); 
      const {campaignId} = useParams();
    
      const userIdRegex = /^[a-z0-9]{24}$/;

      useEffect(() => {
        const fetchUserIds = async () => {
          try {
            const response = await fetch(`${URL_SERV}/users`,{
              method: 'GET',
              credentials: 'include',
            });
            if (response.ok) {
              const data = await response.json();
              setUserIds(data.emails);
            } else {
              throw new Error('Failed to fetch user IDs');
            }
          } catch (error) {
            console.error('Error fetching user IDs:', error);
          }
        };
        fetchUserIds();
      }, []);

      
      useEffect(() => {
        const fetchAssignedUsers = async () => {
            try {
                const response = await fetch(`${URL_SERV}/admin/campaign/${campaignId}/assignedUsers`,{
                  method: 'GET',
                  credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setAssignedUsers(data.assignedUsers);
                } else {
                    throw new Error('Failed to fetch assigned users');
                }
            } catch (error) {
                console.error('Error fetching assigned users:', error);
            }
        };
        fetchAssignedUsers();
      }, [campaignId]);

      const handleChange = (selectedOptions) => {
        setSelectedUserIds(selectedOptions.map(option => option.value));
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          await Promise.all(selectedUserIds.map(async (email) => {
          const response = await fetch(`${URL_SERV}/admin/campaign/${campaignId}/assignUser/${email}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          });
          if(response.ok){
            console.log('User added successfully');
            toast.success('User added successfully');
           
          }else{
            throw new Error('Server error');
          }
          }));
          setSelectedUserIds([]); 
        } catch (error) {
          console.error('failed to add user:', error);
          //toast.error('User is alredy assigned to campign');
        }
      };

      const filteredUserIds = userIds.filter(id => !assignedUsers.includes(id));
    
      return (
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card mt-3">
                <div className="card-header">Add User to Campaign</div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="userId">User IDs:</label>
                      <Select
                        className={`form-control ${errors && 'is-invalid'}`}
                        id="userId"
                        name="userId"
                        value={selectedUserIds.map(id => ({ value: id, label: id }))}
                        onChange={handleChange}
                        options={filteredUserIds.map(userId => ({ value: userId, label: userId }))}
                        required
                        isMulti
                      />
                      {errors && <div className="invalid-feedback">{errors}</div>}
                    </div>
                    <button type="submit" className="btn btn-orange mt-2">Add User</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

export default AddUserToCampaign
