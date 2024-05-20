import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const URL_SERV = 'http://localhost:3000';


const UpdateCampaign = ({campaigns, onEdit, onDelete }) => {

  const maxLength = 15;
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
        {campaigns.map(campaign => (
            <div
              key={campaign._id}
              className="card mt-3"
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
                    <p className="card-text"><strong>Enrolled user:</strong> {campaign.enrolledUsers.length}</p>
                    <div className="text-left"> 
                      <Link to={`/campaigndetails/${campaign._id}`} className="btn btn-orange">View Details</Link>
                      <Link to={`/campaign/${campaign._id}`} className="btn btn-orange mx-1 " onClick={()=>onEdit(campaign._id)}>Edit</Link>
                      <button className="btn btn-danger" onClick={() => onDelete(campaign._id)}>Delete</button>
                      {campaign.type === 'private' && (
                      <>
                        <Link to={`/campaign/${campaign._id}/assignUser`} className="btn btn-success mx-1">Add User</Link>
                        <Link to={`/campaign/${campaign._id}/removeUser`}className="btn btn-warning">Remove User</Link>
                      </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
    </div>
  )
}

export default UpdateCampaign

// style={{ position: "absolute", bottom: "10px", right: "10px" }}