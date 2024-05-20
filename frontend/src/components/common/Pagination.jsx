import React, { useState } from 'react'
import { Link } from 'react-router-dom';

const Pagination = ({campaigns}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(2);

    
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = campaigns.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(campaigns.length / itemsPerPage);

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
  )
}

export default Pagination
