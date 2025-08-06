# Photo Upload Feature for Task Completion

## Overview
This feature allows workers to upload photos when marking tasks as complete, and enables admins to view these completion photos to verify task completion.

## Features Implemented

### 1. Worker Dashboard Photo Upload
- **Location**: `src/pages/WorkerDashboard.jsx`
- **Functionality**: 
  - Workers must upload at least one photo before marking a task as complete
  - Photo upload modal with drag-and-drop support
  - Preview of uploaded photos with ability to remove individual photos
  - Multiple photo selection support

### 2. Admin Dashboard Photo Viewer
- **Location**: `src/pages/DashboardHomePage.jsx`
- **Functionality**:
  - "View Photos" button appears on resolved tasks with completion photos
  - Full-screen photo viewer modal with navigation
  - Thumbnail navigation for multiple photos
  - Photo counter and close functionality

### 3. Enhanced Complaint Cards
- **Location**: `src/components/ComplainCard.jsx`
- **Functionality**:
  - Display completion photos for resolved tasks
  - Photo count indicator
  - Thumbnail preview of first 3 photos with "+X more" indicator

### 4. API Integration
- **Backend Requirements**:
  - Endpoint: `POST /issues/{issueId}/status/`
  - Content-Type: `multipart/form-data`
  - Accepts: `status` field and multiple `photos` files
  - Returns: Updated task with `completion_photos` array

## User Flow

### For Workers:
1. Worker sees assigned tasks in their dashboard
2. When task is "in_progress", "Complete with Photos" button appears
3. Clicking button opens photo upload modal
4. Worker must select at least one photo
5. Photos are previewed with option to remove
6. After uploading, task status changes to "resolved"
7. Completion photos are stored and linked to the task

### For Admins:
1. Admin sees all complaints in dashboard
2. Resolved tasks with completion photos show "View Photos" button
3. Clicking button opens full-screen photo viewer
4. Admin can navigate through multiple photos
5. Thumbnail navigation available for quick access
6. Photos are displayed in complaint cards for quick preview

## Technical Implementation

### Frontend Changes:
- **WorkerDashboard.jsx**: Added photo upload modal and FormData handling
- **DashboardHomePage.jsx**: Added photo viewer modal with navigation
- **ComplainCard.jsx**: Added completion photo display
- **Dashboard.css**: Added styles for modals and photo components

### Key Components:
1. **Photo Upload Modal**: Handles file selection and preview
2. **Photo Viewer Modal**: Full-screen photo viewing with navigation
3. **Photo Preview**: Thumbnail display in task cards
4. **FormData Integration**: Multipart upload for photos

### State Management:
- `uploadedPhotos`: Array of selected photo files
- `showPhotoModal`: Controls photo upload modal visibility
- `selectedTaskPhotos`: Array of completion photos for viewing
- `currentPhotoIndex`: Current photo index in viewer

## Backend API Requirements

The backend should support:
```javascript
// POST /issues/{issueId}/status/
{
  "status": "resolved",
  "photos": [File1, File2, File3, ...] // Multipart form data
}

// Response should include:
{
  "id": 123,
  "status": "resolved",
  "completion_photos": [
    "http://example.com/photo1.jpg",
    "http://example.com/photo2.jpg"
  ],
  // ... other task fields
}
```

## CSS Classes Added

- `.photo-upload-modal`: Photo upload modal container
- `.photo-viewer-modal`: Photo viewer modal container
- `.photo-preview`: Photo preview container
- `.photo-navigation`: Navigation buttons
- `.photo-thumbnail`: Thumbnail images
- `.btn-photo-upload`: Photo upload buttons

## Error Handling

- Photo upload validation (minimum 1 photo required)
- File type validation (images only)
- Network error handling for upload failures
- Graceful fallback when photos are not available

## Future Enhancements

1. **Photo Compression**: Client-side image compression before upload
2. **Photo Editing**: Basic photo editing capabilities
3. **Photo Metadata**: Capture location, timestamp, and worker info
4. **Photo Approval**: Admin approval workflow for completion photos
5. **Photo Comments**: Ability to add comments to individual photos 