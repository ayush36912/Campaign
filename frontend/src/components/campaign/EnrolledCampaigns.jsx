import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Transition } from 'react-transition-group';

const URL_SERV = 'http://localhost:3000';

const EnrolledCampaigns = () => {
  const { isLoggedIn, user } = useAuth();
  const [enrolledCampaigns, setEnrolledCampaigns] = useState([]);
  const [show, setShow] = useState({});
 // const [show, setShow] = useState(true);
  const userId = user._id;

  useEffect(() => {
    const fetchEnrolledCampaigns = async () => {
      try {
        if (isLoggedIn && user && Array.isArray(user.enrolledCampaigns)) {
          const response = await fetch(`${URL_SERV}/user/${userId}/enrolledCampaigns`);
          if (response.ok) {
            const data = await response.json();
            console.log('data',data);
            setEnrolledCampaigns(data.enrolledCampaigns);
            let initialShow = {};
            data.enrolledCampaigns.forEach(campaign => {
              initialShow[campaign._id] = true;
            });
            setShow(initialShow);
            console.log('state:', show);

          } else {
            console.error('Failed to fetch enrolled campaigns:', response.statusText);
          }
        }
      } catch (error) {
        console.error('Error fetching enrolled campaigns:', error);
      }
    };
    fetchEnrolledCampaigns();
  }, [isLoggedIn, user]);

  const handleunenroll = async (campaignId) => {
    try {
      const response = await fetch(`${URL_SERV}/removeCampaign/${campaignId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if(response.ok){ 
        setShow(prevShow => ({
          ...prevShow,
          [campaignId]: false
        }));
        setTimeout(() => {
          setEnrolledCampaigns(prevCampaigns => prevCampaigns.filter(campaign => campaign._id !== campaignId));
        }, 1000); 
        console.log('after:',show);
        console.log('User UnEnrolled successfully');
        toast.success('User UnEnrolled successfully');
      }else{
        throw new Error('Server error');
      } 
    } catch (error) {
      console.error('failed to enroll campaign:', error);
      toast.error('failed to unenroll');
    }
  }

  if (!isLoggedIn || !user || enrolledCampaigns.length === 0) {
    return <p>No enrolled campaigns found.</p>;
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
        {enrolledCampaigns.map(campaign => (
          <Transition key={campaign._id} in={show[campaign._id]} timeout={{
            exit:500
          }}>
            {state => (
            <div
              key={campaign._id}
              className={`card mt-3 trs trs-${state}`}
            >
              {console.log(state)}

              <div className="card-header"><strong>{campaign.title}</strong></div>
              <div className="row no-gutters">
                <div className="col-md-4">
                  <img src={`http://localhost:3000/${campaign.imageUrl[0]}`} className='image-fluid w-100 h-100 rounded' alt={campaign.title} />
                </div>
                <div className="col-md-8">
                  <div className="card-body">
                    <p className="card-text"><strong>Type:</strong> {campaign.type}</p>
                    <p className="card-text"><strong>Description:</strong> {campaign.description}</p>
                    <div className="text-left"> 
                      <Link to={`/campaigndetails/${campaign._id}`} className="btn btn-orange">View Details</Link>
                      <Link to='' className='btn btn-warning mx-3' onClick={()=>handleunenroll(campaign._id)}>{show[campaign._id] ? 'UnEnroll' : 'UnEnrolled'}</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </Transition>
        ))}
        </div> 
      </div>
    </div>
  )
}

export default EnrolledCampaigns;

