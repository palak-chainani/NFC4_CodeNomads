import React, { useEffect, useState } from "react";
import axios from "axios";
import ComplaintCard from "../components/ComplainCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFilter } from "@fortawesome/free-solid-svg-icons";

const AllComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/issues/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        console.log("Fetched complaints:", response.data);
        console.log("First complaint details:", response.data[0]);
        console.log("Images in first complaint:", response.data[0]?.images);
        console.log("Completion photos in first complaint:", response.data[0]?.completion_photos);
        setComplaints(response.data);
      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  return (
    <section className="all-complaints-page" style={{
      backgroundColor: '#FEFAE0',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <header className="list-header" style={{
        marginBottom: '30px'
      }}>
        <h2 style={{
          color: '#0A400C',
          fontSize: '2rem',
          marginBottom: '20px'
        }}>All Complaints</h2>

        <div className="list-controls" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div className="search-bar" style={{
            position: 'relative',
            flexGrow: 1,
            maxWidth: '500px'
          }}>
            <FontAwesomeIcon icon={faSearch} className="icon" style={{
              position: 'absolute',
              left: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#819067'
            }} />
            <input 
              type="text" 
              placeholder="Search complaints..." 
              style={{
                width: '100%',
                padding: '12px 20px 12px 45px',
                borderRadius: '30px',
                border: '1px solid #B1AB86',
                backgroundColor: '#FEFAE0',
                fontSize: '1rem',
                outline: 'none',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
              }}
            />
          </div>

          <div className="action-buttons" style={{
            display: 'flex',
            gap: '15px'
          }}>
            
            
          </div>
        </div>
      </header>

      <main className="complaint-list" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {loading ? (
          <p className="status-message" style={{
            color: '#0A400C',
            textAlign: 'center',
            fontSize: '1.2rem',
            margin: '40px 0'
          }}>Loading complaints...</p>
        ) : complaints.length > 0 ? (
          complaints.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))
        ) : (
          <p className="status-message" style={{
            color: '#0A400C',
            textAlign: 'center',
            fontSize: '1.2rem',
            margin: '40px 0'
          }}>No complaints found.</p>
        )}
      </main>
    </section>
  );
};

export default AllComplaints;