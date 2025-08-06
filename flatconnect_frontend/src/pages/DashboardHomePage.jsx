import React, { useState, useEffect } from "react";
import StatsCard from "../components/StatsCard";
import ComplaintCard from "../components/ComplainCard";
import axios from "axios";
import {
  faClipboardList,
  faSpinner,
  faCheckCircle,
  faExclamationCircle,
  faUserPlus,
  faCamera,
  faTimes,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DashboardHomePage = () => {
  // Add CSS for spinner animation
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Assignment modal state
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [userRole, setUserRole] = useState('');

  // Photo viewer modal state
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedTaskPhotos, setSelectedTaskPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user role
        const role = localStorage.getItem('role');
        setUserRole(role);

        // Fetch complaints
        const token = localStorage.getItem('token');
        console.log('Token being used:', token);
        
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const complaintsResponse = await axios.get('http://127.0.0.1:8000/issues/', {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });
        console.log('Full response object:', complaintsResponse);
        console.log('Complaints response:', complaintsResponse.data);
        console.log('Response status:', complaintsResponse.status);
        console.log('Response headers:', complaintsResponse.headers);
        console.log('Complaints array length:', complaintsResponse.data.length);
        console.log('First complaint:', complaintsResponse.data[0]);
        console.log('Response data type:', typeof complaintsResponse.data);
        console.log('Is array?', Array.isArray(complaintsResponse.data));
        
        // Check if data might be nested in a 'results' field
        let complaintsData = complaintsResponse.data;
        if (complaintsResponse.data.results) {
          console.log('Found results field, using nested data');
          complaintsData = complaintsResponse.data.results;
        }
        
        console.log('Final complaints data:', complaintsData);
        console.log('Final data length:', complaintsData.length);
        setComplaints(complaintsData);

        // Calculate stats from complaints data
        const totalComplaints = complaintsData.length;
        const inProgress = complaintsData.filter(c => c.status === 'in_progress').length;
        const resolved = complaintsData.filter(c => c.status === 'resolved').length;
        const newComplaints = complaintsData.filter(c => c.status === 'new').length;

        setStats([
          { title: "Total Complaints", count: totalComplaints, icon: faClipboardList },
          { title: "In Progress", count: inProgress, icon: faSpinner },
          { title: "Resolved", count: resolved, icon: faCheckCircle },
          { title: "New / Unassigned", count: newComplaints, icon: faExclamationCircle },
        ]);

        // If user is admin, fetch available workers
        if (role === 'admin') {
          await getAvailableWorkers();
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
          setError(`Failed to load dashboard data: ${error.response.status} - ${error.response.data?.detail || 'Unknown error'}`);
        } else if (error.request) {
          console.error('No response received:', error.request);
          setError('No response from server. Please check your connection.');
        } else {
          console.error('Error setting up request:', error.message);
          setError('Failed to load dashboard data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Get available workers
  const getAvailableWorkers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/issues/workers/', {
        headers: { 
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setAvailableWorkers(response.data.workers || response.data);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  // Assign task to worker
  const assignTaskToWorker = async (issueId, workerId) => {
    try {
      setAssigning(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://127.0.0.1:8000/issues/${issueId}/assign/`, {
        worker_id: workerId,
        status: 'assigned'
      }, {
        headers: { 
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Task assigned successfully:', response.data);
      
      // Refresh the complaints list
      await fetchDashboardData();
      
      // Close modal and reset
      setShowAssignmentModal(false);
      setSelectedIssue(null);
      setSelectedWorker('');
      
      alert('Task assigned successfully!');
      
    } catch (error) {
      if (error.response?.status === 403) {
        alert('You do not have permission to assign tasks.');
      } else if (error.response?.status === 400) {
        alert('Invalid worker selected. Please try again.');
      } else {
        alert('Failed to assign task. Please try again.');
      }
      console.error('Error assigning task:', error);
    } finally {
      setAssigning(false);
    }
  };

  // Handle assignment button click
  const handleAssignClick = (issue) => {
    setSelectedIssue(issue);
    setShowAssignmentModal(true);
  };

  // Handle assignment submission
  const handleAssignmentSubmit = () => {
    if (!selectedWorker) {
      alert('Please select a worker');
      return;
    }
    
    assignTaskToWorker(selectedIssue.id, selectedWorker);
  };

  // Handle photo viewing
  const handleViewPhotos = (task) => {
    if (task.completion_photos && task.completion_photos.length > 0) {
      setSelectedTaskPhotos(task.completion_photos);
      setCurrentPhotoIndex(0);
      setShowPhotoModal(true);
    } else {
      alert('No completion photos available for this task.');
    }
  };

  // Navigate photos
  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev === selectedTaskPhotos.length - 1 ? 0 : prev + 1
    );
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev === 0 ? selectedTaskPhotos.length - 1 : prev - 1
    );
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <span className="badge badge-primary">New</span>;
      case 'assigned':
        return <span className="badge badge-warning">Assigned</span>;
      case 'in_progress':
        return <span className="badge badge-info">In Progress</span>;
      case 'resolved':
        return <span className="badge badge-success">Resolved</span>;
      case 'closed':
        return <span className="badge badge-secondary">Closed</span>;
      default:
        return <span className="badge badge-light">{status}</span>;
    }
  };

  // Get priority label
  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      case 4: return 'Critical';
      default: return 'Unknown';
    }
  };

  // Refresh dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const complaintsResponse = await axios.get('http://127.0.0.1:8000/issues/', {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });
      
      let complaintsData = complaintsResponse.data;
      if (complaintsResponse.data.results) {
        complaintsData = complaintsResponse.data.results;
      }
      
      setComplaints(complaintsData);

      // Recalculate stats
      const totalComplaints = complaintsData.length;
      const inProgress = complaintsData.filter(c => c.status === 'in_progress').length;
      const resolved = complaintsData.filter(c => c.status === 'resolved').length;
      const newComplaints = complaintsData.filter(c => c.status === 'new').length;

      setStats([
        { title: "Total Complaints", count: totalComplaints, icon: faClipboardList },
        { title: "In Progress", count: inProgress, icon: faSpinner },
        { title: "Resolved", count: resolved, icon: faCheckCircle },
        { title: "New / Unassigned", count: newComplaints, icon: faExclamationCircle },
      ]);

    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
      setError('Failed to refresh dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <>
      <section className="stats-grid">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            count={stat.count}
            icon={stat.icon}
          />
        ))}
      </section>
      
      <section className="complaint-list-section">
        <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>All Complaints</h2>
          {userRole === 'admin' && (
            <button 
              onClick={fetchDashboardData} 
              disabled={loading}
              className="btn btn-outline-primary"
              style={{
                padding: '8px 16px',
                borderRadius: '4px',
                border: '1px solid #007bff',
                backgroundColor: 'transparent',
                color: '#007bff',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
        </div>
        <div className="complaint-list">
          {complaints.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No complaints found.</p>
              <p className="text-sm mt-2">Complaints will appear here once they are created.</p>
            </div>
          ) : (
            complaints.map((complaint) => (
              <div key={complaint.id} style={{ position: 'relative' }}>
                <ComplaintCard complaint={complaint} />
                {userRole === 'admin' && complaint.status === 'new' && (
                  <button 
                    onClick={() => handleAssignClick(complaint)}
                    className="btn btn-primary"
                                         style={{
                       position: 'absolute',
                       bottom: '12px',
                       right: '12px',
                       padding: '8px 16px',
                       fontSize: '13px',
                       fontWeight: '600',
                       borderRadius: '20px',
                       border: 'none',
                       backgroundColor: '#28a745',
                       color: 'white',
                       cursor: 'pointer',
                       boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)',
                       transition: 'all 0.3s ease',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '6px',
                       minWidth: '100px',
                       justifyContent: 'center'
                     }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#218838';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#28a745';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.3)';
                    }}
                  >
                    <FontAwesomeIcon icon={faUserPlus} style={{ fontSize: '12px' }} />
                    Assign Task
                  </button>
                )}
                {userRole === 'admin' && complaint.status === 'resolved' && complaint.completion_photos && complaint.completion_photos.length > 0 && (
                  <button 
                    onClick={() => handleViewPhotos(complaint)}
                    className="btn btn-info"
                                         style={{
                       position: 'absolute',
                       bottom: '12px',
                       right: '12px',
                       padding: '8px 16px',
                       fontSize: '13px',
                       fontWeight: '600',
                       borderRadius: '20px',
                       border: 'none',
                       backgroundColor: '#17a2b8',
                       color: 'white',
                       cursor: 'pointer',
                       boxShadow: '0 2px 8px rgba(23, 162, 184, 0.3)',
                       transition: 'all 0.3s ease',
                       display: 'flex',
                       alignItems: 'center',
                       gap: '6px',
                       minWidth: '120px',
                       justifyContent: 'center'
                     }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#138496';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(23, 162, 184, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#17a2b8';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 8px rgba(23, 162, 184, 0.3)';
                    }}
                  >
                    <FontAwesomeIcon icon={faCamera} style={{ fontSize: '12px' }} />
                    View Photos
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal" style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div className="modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #eee',
              paddingBottom: '10px'
            }}>
              <h3>Assign Task to Worker</h3>
              <button 
                onClick={() => setShowAssignmentModal(false)}
                className="modal-close"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="task-info" style={{ marginBottom: '20px' }}>
                <h4>{selectedIssue?.title}</h4>
                <p>{selectedIssue?.description}</p>
                <p><strong>Category:</strong> {selectedIssue?.category_name}</p>
                <p><strong>Priority:</strong> {getPriorityLabel(selectedIssue?.priority)}</p>
              </div>
              
              <div className="worker-selection">
                <label htmlFor="worker-select" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Select Worker:
                </label>
                <select 
                  id="worker-select"
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                  className="form-select"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                >
                  <option value="">Choose a worker...</option>
                  {availableWorkers.map(worker => (
                    <option key={worker.id} value={worker.id}>
                      {worker.full_name || worker.username} ({worker.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="modal-footer" style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '20px',
              borderTop: '1px solid #eee',
              paddingTop: '10px'
            }}>
              <button 
                onClick={() => setShowAssignmentModal(false)}
                className="btn btn-secondary"
                style={{
                  padding: '10px 20px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(108, 117, 125, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#5a6268';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#6c757d';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleAssignmentSubmit}
                disabled={!selectedWorker || assigning}
                className="btn btn-primary"
                style={{
                  padding: '10px 20px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: '#28a745',
                  color: 'white',
                  cursor: (!selectedWorker || assigning) ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px rgba(40, 167, 69, 0.2)',
                  opacity: (!selectedWorker || assigning) ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!(!selectedWorker || assigning)) {
                    e.target.style.backgroundColor = '#218838';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#28a745';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                {assigning ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
                    Assigning...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faUserPlus} style={{ marginRight: '8px' }} />
                    Assign Task
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Viewer Modal */}
      {showPhotoModal && selectedTaskPhotos.length > 0 && (
        <div className="photo-viewer-modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1001
        }}>
          <div className="photo-viewer-content" style={{
            position: 'relative',
            maxWidth: '90%',
            maxHeight: '90%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {/* Close button */}
            <button 
              onClick={() => setShowPhotoModal(false)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                zIndex: 1002
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            {/* Photo counter */}
            <div style={{
              position: 'absolute',
              top: '-40px',
              left: '0',
              color: 'white',
              fontSize: '16px',
              zIndex: 1002
            }}>
              {currentPhotoIndex + 1} / {selectedTaskPhotos.length}
            </div>

            {/* Main photo */}
            <img 
              src={selectedTaskPhotos[currentPhotoIndex]} 
              alt={`Task completion photo ${currentPhotoIndex + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />

            {/* Navigation buttons */}
            {selectedTaskPhotos.length > 1 && (
              <>
                <button 
                  onClick={prevPhoto}
                  style={{
                    position: 'absolute',
                    left: '-60px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    fontSize: '20px',
                    padding: '10px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    zIndex: 1002
                  }}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button 
                  onClick={nextPhoto}
                  style={{
                    position: 'absolute',
                    right: '-60px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    fontSize: '20px',
                    padding: '10px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    zIndex: 1002
                  }}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </>
            )}

            {/* Thumbnail navigation */}
            {selectedTaskPhotos.length > 1 && (
              <div style={{
                display: 'flex',
                gap: '10px',
                marginTop: '20px',
                overflowX: 'auto',
                maxWidth: '100%'
              }}>
                {selectedTaskPhotos.map((photo, index) => (
                  <img 
                    key={index}
                    src={photo} 
                    alt={`Thumbnail ${index + 1}`}
                    onClick={() => setCurrentPhotoIndex(index)}
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: index === currentPhotoIndex ? '2px solid #007bff' : '2px solid transparent',
                      opacity: index === currentPhotoIndex ? 1 : 0.7
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardHomePage;
