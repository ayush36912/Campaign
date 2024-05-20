import React from 'react';
import { Carousel } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

const CampaignDetails = ({ campaigns }) => {

    const { id } = useParams();
  const campaign = campaigns.find(campaign => campaign._id === id);

  if (!campaign) {
    return <p>Campaign not found.</p>;
  }


  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header"><strong>{campaign.title}</strong></div>
            <div className="card-body">
              {/* <img src={`http://localhost:3000/${campaign.imageUrl}`} className="card-img custom-img-size" alt={campaign.title} /> */}
              <Carousel>
                {campaign.imageUrl.map((imageUrl, index) => (
                  <Carousel.Item key={index}>
                    <img
                      className="d-block w-100"
                      src={`http://localhost:3000/${imageUrl}`}
                      alt={`Slide ${index + 1}`}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
              <p className="mt-3"><strong>Type:</strong> {campaign.type}</p>
              <p><strong>Description:</strong> {campaign.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
