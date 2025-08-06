import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRefresh, 
  faCheckCircle, 
  faPlay, 
  faClock, 
  faCamera, 
  faTimes,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';

const WorkerDashboard = () => {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Photo upload modal state
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Photo viewer modal state
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [selectedTaskPhotos, setSelectedTaskPhotos] = useState([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Get assigned tasks
  const getAssignedTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/issues/assigned/', {
        headers: { 
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Assigned tasks response:', response.data);
      setAssignedTasks(response.data.results || response.data);
    } catch (error) {
      setError('Failed to load tasks');
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update task status with photos
  const updateTaskStatusWithPhotos = async (issueId, newStatus, photos = []) => {
    try {
      const token = localStorage.getItem('token');
      
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('status', newStatus);
      
      // Append photos to FormData
      photos.forEach((photo, index) => {
        formData.append(`photos`, photo);
      });
      
      const response = await axios.post(`http://127.0.0.1:8000/issues/${issueId}/status/`, formData, {
        headers: { 
          'Authorization': `Token ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating task status:', error.response?.data || error.message);
      throw error;
    }
  };

  // Handle photo file selection
  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    setUploadedPhotos(prev => [...prev, ...files]);
  };

  // Remove photo from selection
  const removePhoto = (index) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Handle photo upload and task completion
  const handlePhotoUploadAndComplete = async () => {
    if (uploadedPhotos.length === 0) {
      alert('Please upload at least one photo before marking as complete.');
      return;
    }

    try {
      setUploadingPhotos(true);
      
      await updateTaskStatusWithPhotos(selectedTask.id, 'resolved', uploadedPhotos);
      
      // Refresh task list
      await getAssignedTasks();
      
      // Close modal and reset
      setShowPhotoModal(false);
      setSelectedTask(null);
      setUploadedPhotos([]);
      
      alert('Task completed successfully with photos!');
      
    } catch (error) {
      if (error.response?.status === 400) {
        alert('Invalid data. Please try again.');
      } else if (error.response?.status === 404) {
        alert('Task not found.');
      } else {
        alert('Failed to complete task. Please try again.');
      }
      console.error('Error:', error);
    } finally {
      setUploadingPhotos(false);
    }
  };

  // Handle photo viewing
  const handleViewPhotos = (task) => {
    if (task.completion_photos && task.completion_photos.length > 0) {
      setSelectedTaskPhotos(task.completion_photos);
      setCurrentPhotoIndex(0);
      setShowPhotoViewer(true);
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

  // Handle status update button click
  const handleStatusUpdate = async (issueId, currentStatus) => {
    try {
      setLoading(true);
      
      let newStatus;
      let buttonText;
      
      // Determine next status based on current status
      switch (currentStatus) {
        case 'assigned':
          newStatus = 'in_progress';
          buttonText = 'Started Work';
          break;
        case 'in_progress':
          // For in_progress, we need photos, so open modal instead
          setSelectedTask(assignedTasks.find(task => task.id === issueId));
          setShowPhotoModal(true);
          setLoading(false);
          return;
        default:
          throw new Error('Invalid status transition');
      }
      
      await updateTaskStatusWithPhotos(issueId, newStatus);
      
      // Refresh task list
      await getAssignedTasks();
      
      // Show success message
      alert(`Task ${buttonText} successfully!`);
      
    } catch (error) {
      if (error.response?.status === 400) {
        alert('Invalid status. Please try again.');
      } else if (error.response?.status === 404) {
        alert('Task not found.');
      } else {
        alert('Failed to update task. Please try again.');
      }
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get button for specific task status
  const getButtonForStatus = (task) => {
    switch (task.status) {
      case 'assigned':
        return (
          <button 
            onClick={() => handleStatusUpdate(task.id, 'assigned')}
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#0A400C',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: loading ? 0.6 : 1
            }}
          >
            <FontAwesomeIcon icon={faPlay} />
            Start Work
          </button>
        );
      
      case 'in_progress':
        return (
          <button 
            onClick={() => handleStatusUpdate(task.id, 'in_progress')}
            disabled={loading}
            className="btn btn-success"
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#059669',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: loading ? 0.6 : 1
            }}
          >
            <FontAwesomeIcon icon={faCamera} />
            Complete with Photos
          </button>
        );
      
      case 'resolved':
        return (
          <div className="status-complete" style={{
            color: '#059669',
            fontSize: '0.9rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <FontAwesomeIcon icon={faCheckCircle} />
            Task Completed
            <small style={{ display: 'block', fontSize: '0.8rem', marginTop: '4px' }}>
              Resolved on {new Date(task.resolved_at).toLocaleDateString()}
            </small>
          </div>
        );
      
      default:
        return null;
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

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
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

  // Load tasks on component mount
  useEffect(() => {
    getAssignedTasks();
  }, []);

  return (
    <div className="worker-dashboard" style={{
      backgroundColor: '#FEFAE0',
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div className="dashboard-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h2 style={{
          color: '#0A400C',
          fontSize: '2rem',
          margin: 0
        }}>My Assigned Tasks</h2>
        <button 
          onClick={getAssignedTasks} 
          disabled={loading}
          className="btn btn-outline-primary"
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: '2px solid #0A400C',
            backgroundColor: 'transparent',
            color: '#0A400C',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FontAwesomeIcon icon={faRefresh} />
          {loading ? 'Refreshing...' : 'Refresh Tasks'}
        </button>
      </div>
      
      {loading && (
        <div className="loading" style={{
          textAlign: 'center',
          padding: '40px',
          color: '#0A400C',
          fontSize: '1.2rem'
        }}>
          Loading tasks...
        </div>
      )}
      
      {error && (
        <div className="error-message" style={{
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #fecaca'
        }}>
          {error}
        </div>
      )}
      
      {assignedTasks.length === 0 && !loading && (
        <div className="no-tasks" style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666',
          fontSize: '1.1rem'
        }}>
          <p>No tasks assigned to you at the moment.</p>
          <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>
            Check back later for new assignments.
          </p>
        </div>
      )}
      
      <div className="tasks-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '20px'
      }}>
        {assignedTasks.map(task => (
          <div key={task.id} className="task-card" style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div className="task-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '15px'
            }}>
              <h3 style={{
                margin: 0,
                color: '#0A400C',
                fontSize: '1.2rem',
                fontWeight: '600'
              }}>{task.title}</h3>
              {getStatusBadge(task.status)}
            </div>
            
            <div className="task-details" style={{
              marginBottom: '15px'
            }}>
              <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#666' }}>
                <strong>Description:</strong> {task.description}
              </p>
              <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#666' }}>
                <strong>Category:</strong> {task.category_name}
              </p>
              <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#666' }}>
                <strong>Priority:</strong> {getPriorityLabel(task.priority)}
              </p>
              <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#666' }}>
                <strong>Reporter:</strong> {task.reporter?.username || 'Unknown'}
              </p>
              <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#666' }}>
                <strong>Assigned:</strong> {new Date(task.created_at).toLocaleDateString()}
              </p>
              
              {task.resolved_at && (
                <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#666' }}>
                  <strong>Completed:</strong> {new Date(task.resolved_at).toLocaleDateString()}
                </p>
              )}
              
              {/* Show completion photos for resolved tasks */}
              {task.status === 'resolved' && task.completion_photos && task.completion_photos.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#666' }}>
                    <strong>Completion Photos:</strong>
                  </p>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '5px 0' }}>
                    {task.completion_photos.slice(0, 3).map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`Completion ${index + 1}`}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          border: '1px solid #ddd'
                        }}
                      />
                    ))}
                    {task.completion_photos.length > 3 && (
                      <div style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        color: '#666'
                      }}>
                        +{task.completion_photos.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="task-actions" style={{
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              {getButtonForStatus(task)}
            </div>
          </div>
        ))}
      </div>

      {showPhotoModal && selectedTask && (
        <div className="photo-upload-modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#0A400C' }}>
              Upload Photos for Task: {selectedTask.title}
            </h3>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ marginBottom: '20px', padding: '10px' }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
              {uploadedPhotos.map((photo, index) => (
                <div key={index} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '5px', overflow: 'hidden' }}>
                  <img src={URL.createObjectURL(photo)} alt={`Uploaded ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    onClick={() => removePhoto(index)}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      backgroundColor: 'red',
                      color: 'white',
                      borderRadius: '50%',
                      width: '25px',
                      height: '25px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      border: 'none',
                      fontSize: '1rem'
                    }}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handlePhotoUploadAndComplete}
              disabled={uploadingPhotos}
              className="btn btn-success"
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#059669',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FontAwesomeIcon icon={faCheckCircle} />
              {uploadingPhotos ? 'Completing with Photos...' : 'Complete with Photos'}
            </button>
            <button
              onClick={() => setShowPhotoModal(false)}
              className="btn btn-secondary"
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#6c757d',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FontAwesomeIcon icon={faTimes} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Photo Viewer Modal */}
      {showPhotoViewer && selectedTaskPhotos.length > 0 && (
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
              onClick={() => setShowPhotoViewer(false)}
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
    </div>
  );
};

export default WorkerDashboard;