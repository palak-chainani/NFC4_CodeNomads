import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faRefresh, faTimes } from '@fortawesome/free-solid-svg-icons';

const AdminTaskAssignment = () => {
  const [allIssues, setAllIssues] = useState([]);
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  // Get all issues (for admin)
  const getAllIssues = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:8000/issues/', {
        headers: { 
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('All issues response:', response.data);
      setAllIssues(response.data);
    } catch (error) {
      setError('Failed to load issues');
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

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
      console.log('Workers response:', response.data);
      setAvailableWorkers(response.data.workers || response.data);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  // Assign task to worker
  const assignTaskToWorker = async (issueId, workerId) => {
    try {
      setLoading(true);
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
      
      // Refresh the issues list
      await getAllIssues();
      
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
      setLoading(false);
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

  // Load data on component mount
  useEffect(() => {
    getAllIssues();
    getAvailableWorkers();
  }, []);

  return (
    <div className="admin-task-assignment" style={{
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
        }}>Task Assignment Dashboard</h2>
        <button 
          onClick={getAllIssues} 
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
          {loading ? 'Refreshing...' : 'Refresh Issues'}
        </button>
      </div>
      
      {loading && (
        <div className="loading" style={{
          textAlign: 'center',
          padding: '40px',
          color: '#0A400C',
          fontSize: '1.2rem'
        }}>
          Loading issues...
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
      
      <div className="issues-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '20px'
      }}>
        {allIssues.map(issue => (
          <div key={issue.id} className="issue-card" style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div className="issue-header" style={{
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
              }}>{issue.title}</h3>
              {getStatusBadge(issue.status)}
            </div>
            
            <div className="issue-details" style={{
              marginBottom: '15px'
            }}>
              <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#666' }}>
                <strong>Description:</strong> {issue.description}
              </p>
              <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#666' }}>
                <strong>Category:</strong> {issue.category_name}
              </p>
              <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#666' }}>
                <strong>Priority:</strong> {getPriorityLabel(issue.priority)}
              </p>
              <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#666' }}>
                <strong>Reporter:</strong> {issue.reporter?.username || 'Unknown'}
              </p>
              <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#666' }}>
                <strong>Created:</strong> {new Date(issue.created_at).toLocaleDateString()}
              </p>
              
              {issue.assigned_to && (
                <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#666' }}>
                  <strong>Assigned to:</strong> {issue.assigned_to.username}
                </p>
              )}
            </div>
            
            <div className="issue-actions" style={{
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              {issue.status === 'new' && (
                <button 
                  onClick={() => handleAssignClick(issue)}
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
                    gap: '6px'
                  }}
                >
                  <FontAwesomeIcon icon={faUserPlus} />
                  Assign to Worker
                </button>
              )}
              
              {issue.status === 'assigned' && (
                <span className="assigned-status" style={{
                  color: '#059669',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}>
                  ✅ Assigned to {issue.assigned_to?.username}
                </span>
              )}
              
              {issue.status === 'resolved' && (
                <span className="resolved-status" style={{
                  color: '#059669',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}>
                  ✅ Completed by {issue.assigned_to?.username}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

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
            borderRadius: '12px',
            padding: '24px',
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
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '15px'
            }}>
              <h3 style={{
                margin: 0,
                color: '#0A400C',
                fontSize: '1.3rem'
              }}>Assign Task to Worker</h3>
              <button 
                onClick={() => setShowAssignmentModal(false)}
                className="modal-close"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="task-info" style={{ marginBottom: '20px' }}>
                <h4 style={{
                  margin: '0 0 10px 0',
                  color: '#0A400C',
                  fontSize: '1.1rem'
                }}>{selectedIssue?.title}</h4>
                <p style={{
                  margin: '8px 0',
                  fontSize: '0.9rem',
                  color: '#666',
                  lineHeight: '1.5'
                }}>{selectedIssue?.description}</p>
                <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#666' }}>
                  <strong>Category:</strong> {selectedIssue?.category_name}
                </p>
                <p style={{ margin: '8px 0', fontSize: '0.9rem', color: '#666' }}>
                  <strong>Priority:</strong> {getPriorityLabel(selectedIssue?.priority)}
                </p>
              </div>
              
              <div className="worker-selection">
                <label htmlFor="worker-select" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#0A400C'
                }}>
                  Select Worker:
                </label>
                <select 
                  id="worker-select"
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                  className="form-select"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.9rem'
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
              gap: '12px',
              marginTop: '20px',
              borderTop: '1px solid #e5e7eb',
              paddingTop: '15px'
            }}>
              <button 
                onClick={() => setShowAssignmentModal(false)}
                className="btn btn-secondary"
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: '1px solid #6b7280',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleAssignmentSubmit}
                disabled={!selectedWorker || loading}
                className="btn btn-primary"
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: '1px solid #0A400C',
                  backgroundColor: '#0A400C',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  opacity: (!selectedWorker || loading) ? 0.6 : 1
                }}
              >
                {loading ? 'Assigning...' : 'Assign Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTaskAssignment; 