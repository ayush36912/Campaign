import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const URL_SERV = 'http://localhost:3000';

const RemoveUserFromCampaign = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState('');
  const [assignedUsers, setAssignedUsers] = useState([]);
  const { campaignId } = useParams();

  

  useEffect(() => {
    const fetchAssignedUsers = async () => {
      try {
        const response = await fetch(`${URL_SERV}/admin/campaign/${campaignId}/assignedUsers`,{
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setAssignedUsers(data.assignedUsers.map(user => user.email));
        } else {
          throw new Error('Failed to fetch assigned users');
        }
      } catch (error) {
        console.error('Error fetching assigned users:', error);
      }
    };
    fetchAssignedUsers();
  }, [campaignId]);

  const handleChange = (e) => {
    const { value } = e.target;
    setEmail(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${URL_SERV}/admin/campaign/${campaignId}/removeUser/${email}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if(response.ok){
        console.log('User removed successfully');
        toast.success('User removed successfully');
      }else{
        throw new Error('Server error!');
      }
    } catch (error) {
      console.error('Failed to remove user:', error);
      toast.error('Failed to remove user');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card mt-3">
            <div className="card-header">Remove User from Campaign</div>
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label htmlFor="userId">User ID:</label>
                  <select
                    className={`form-control ${errors && 'is-invalid'}`}
                    id="userId"
                    value={email}
                    name='user'
                    onChange={handleChange}
                    maxLength={24}
                    required
                  >
                    <option value="">Select User ID</option>
                    {assignedUsers.map(id => (
                      <option key={id} value={id}>{id}</option>
                    ))}
                  </select>
                  {errors && <div className="invalid-feedback">{errors}</div>}
                </div>
                <button type="submit" className="btn btn-warning mt-2">Remove User</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveUserFromCampaign;
