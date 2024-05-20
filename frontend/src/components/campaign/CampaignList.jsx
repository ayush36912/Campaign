import React, { useEffect, useState } from 'react';
import CampaignDetails from './CampaignDetails';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Transition } from 'react-transition-group';

const URL_SERV = 'http://localhost:3000';


const CampaignList = ({ campaigns }) => {

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(2);
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth(); 
  const [show, setShow] = useState({});
  const [enrolledCampaigns, setEnrolledCampaigns] = useState([]);

  // useEffect(() => {
  //   if (isLoggedIn && user) {
  //     setEnrolledCampaigns(user.enrolledCampaigns || []);
  //   }
  // }, [isLoggedIn, user]);

  if (!Array.isArray(campaigns)) {
    return <p>Loading campaigns...</p>;
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = campaigns.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(campaigns.length / itemsPerPage);

  const maxLength = 10;

  const handleenroll = async (campaignId) => {
    try {
      const response = await fetch(`${URL_SERV}/enrolledCampaign/${campaignId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      if(response.ok){
        setShow(prevState => ({ 
          ...prevState,
           [campaignId]: true }));
        console.log('User enrolled successfully');
        toast.success('User enrolled successfully');
      }else{
        throw new Error('Server error');
      } 
    } catch (error) {
      console.error('failed to enroll campaign:', error);
    }
  }

  // const filteredCampaigns = currentItems.filter(campaign => !enrolledCampaigns.includes(campaign._id));

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      navigate(`/campaigns?page=${pageNumber}`);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      navigate(`/campaigns?page=${currentPage - 1}`);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      navigate(`/campaigns?page=${currentPage + 1}`);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
        {currentItems.map(campaign => (
          <Transition key={campaign._id} in={show[campaign._id] !== true} timeout={{
            exit:500
          }}>
            {state => (
            <div
              key={campaign._id}
              className={`card mt-3 trs trs-${state}`}
            >
              <div className="card-header"><strong>{campaign.title}</strong></div>
              <div className="row no-gutters">
                <div className="col-md-4">
                  <img src={`http://localhost:3000/${campaign.imageUrl[0]}`} className='image-fluid w-100 h-100 rounded' alt={campaign.title} />
                </div>
                <div className="col-md-8">
                  <div className="card-body">
                    <p className="card-text"><strong>Type:</strong> {campaign.type}</p>
                    <p className="card-text"><strong>Description:</strong> {campaign.description.length > maxLength ? campaign.description.substring(0, maxLength) + '...' : campaign.description}</p>
                    <div className="text-left"> 
                      <Link to={`/campaigndetails/${campaign._id}`} className="btn btn-orange">View Details</Link>
                      {(isLoggedIn && user) ? (
                      <Link to='' className='btn btn-warning mx-3' onClick={()=>handleenroll(campaign._id)} disabled={show[campaign._id] === true}>{show[campaign._id] ? "Enrolled" : "Enroll Now!"}</Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}
            </Transition>
          ))}
        </div> 
        <div className="pagination fixed-bottom">
            {currentPage !== 1 && (
              <Link to={`/campaigns?page=${currentPage - 1}`} className="pagination-btn" onClick={()=>goToPreviousPage()}>Previous</Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => (
            <Link key={i} to={`/campaigns?page=${i + 1}`} className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => goToPage(i + 1)}>
              {i + 1}
            </Link>
            ))}
           {currentPage !== totalPages && (
            <Link to={`/campaigns?page=${currentPage + 1}`} className="pagination-btn" onClick={()=>goToNextPage()}>Next</Link>
          )}
          </div>
      </div>
    </div>
  )
}

export default CampaignList
