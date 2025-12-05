# Design Document

## Overview

This design document outlines the architecture and implementation strategy for auditing and standardizing all admin management pages to ensure seamless synchronization between admin actions and public-facing pages. The system will enforce structural consistency, visual uniformity, and data integrity across all admin modules (Events, Announcements, Classes, Users).

The design focuses on:
- Establishing admin data as the single source of truth
- Ensuring perfect alignment between admin forms and public page displays
- Standardizing UI/UX patterns across all admin forms
- Implementing robust validation and error handling
- Maintaining mobile responsiveness throughout

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Panel Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Events     │  │ Announcements│  │   Classes    │      │
│  │   Admin      │  │    Admin     │  │    Admin     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Events     │  │ Announcements│  │   Classes    │      │
│  │   API        │  │    API       │  │    API       │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
│         MongoDB Collections (Events, Announcements, etc.)    │
└─────────────────────────────────────────────────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   Public Pages Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Events     │  │ Announcements│  │   Classes    │      │
│  │   Page       │  │    Page      │  │    Page      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Admin Action** → Admin form submission
2. **Validation** → Client-side and server-side validation
3. **API Request** → RESTful API call with form data
4. **Database Update** → MongoDB document creation/update/deletion
5. **Response** → Success/error response to admin
6. **Public Page Refresh** → Automatic data fetch on public pages
7. **Display Update** → Public pages reflect changes immediately

## Components and Interfaces

### 1. Admin Page Components

#### AdminEventsPage
**Current State:** Well-structured with EventFormDialog component
**Status:** ✅ Keep existing structure
**Improvements Needed:**
- Ensure all fields in EventFormDialog match public EventsPage display
- Verify image upload functionality
- Confirm status toggle (published/unpublished) works correctly

**Key Features:**
- Table view with pagination
- Create/Edit/Delete operations
- Featured toggle for homepage
- Status management (upcoming, ongoing, completed, cancelled)
- Image upload support

#### AdminAnnouncementsPage
**Current State:** Comprehensive form with image upload
**Status:** ✅ Keep existing structure
**Improvements Needed:**
- Verify all fields align with public AnnouncementsPage
- Ensure pin/unpin functionality works
- Confirm publish/unpublish toggle

**Key Features:**
- Table view with pagination
- Create/Edit/Delete operations
- Pin to top functionality
- Publish/draft toggle
- Category filtering
- Image upload support
- Tags management

#### AdminClassesPage
**Current State:** Basic CRUD operations
**Status:** ⚠️ Needs enhancement for data parity
**Improvements Needed:**
- Add all fields that appear on public ClassGroupsPage
- Add class image upload
- Add motto field
- Add description field
- Ensure member management works correctly

**Key Features:**
- Table view with pagination
- Create/Edit/Delete operations
- Member count display
- View members dialog
- Graduation year management

#### AdminUsersPage
**Current State:** Comprehensive user management
**Status:** ✅ Keep existing structure
**Improvements Needed:**
- Verify profile picture upload works
- Ensure role management is consistent
- Confirm status toggle functionality

**Key Features:**
- Table view with pagination
- Create/Edit/Delete operations
- Role management (admin/user)
- Status toggle (active/inactive)
- Search functionality
- Profile picture upload

### 2. Form Dialog Components

#### EventFormDialog
**Structure:** ✅ Excellent - comprehensive and well-organized
**Sections:**
1. Basic Information (title, description, category, capacity)
2. Date & Time (start date, end date)
3. Location (location field)
4. Featured Image Upload
5. Registration Settings (enable/disable toggle)
6. Speakers (drag-and-drop reorderable list)
7. Agenda (drag-and-drop reorderable list)
8. FAQ (drag-and-drop reorderable list)
9. Location Details (venue, address, coordinates, directions, parking)

**Validation:** Yup schema with comprehensive rules

#### AnnouncementFormDialog
**Structure:** ✅ Good - covers all necessary fields
**Sections:**
1. Title
2. Category (updates, achievements, events)
3. Description
4. Start Date / End Date
5. Image Upload
6. Tags
7. Pin to Top Toggle
8. Publish/Draft Toggle

#### ClassFormDialog
**Structure:** ⚠️ Needs enhancement
**Current Sections:**
1. Graduation Year
2. Class Name (optional)
3. Description (optional)

**Required Additions:**
1. Class Image Upload
2. Motto Field
3. Banner Image Upload
4. Additional metadata fields

#### UserFormDialog
**Structure:** ✅ Good - comprehensive
**Sections:**
1. First Name / Last Name
2. Email
3. Password / Confirm Password
4. Graduation Year
5. Phone Number
6. Profile Picture Upload
7. Admin Toggle
8. Active/Inactive Toggle

### 3. Shared Components

#### ImageUploadField
**Purpose:** Reusable image upload component
**Features:**
- File type validation
- File size validation (max 5MB)
- Preview display
- Error handling
- Loading state

#### FormSection
**Purpose:** Consistent section dividers
**Features:**
- Section title with primary color
- Divider line
- Consistent spacing

#### DraggableList
**Purpose:** Reusable drag-and-drop list
**Features:**
- Drag handle
- Add/Remove items
- Order management
- Card-based layout

## Data Models

### Event Data Model
```typescript
interface Event {
  _id: string;
  title: string;
  description: string;
  category: 'reunion' | 'career' | 'workshop' | 'sports' | 'networking' | 'other';
  startDate: Date;
  endDate: Date;
  location: string;
  capacity?: number;
  registrationEnabled: boolean;
  featuredImage?: string;
  isPublished: boolean;
  isFeaturedOnHomepage: boolean;
  eventStatus: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  speakers?: Speaker[];
  agenda?: AgendaItem[];
  faq?: FAQItem[];
  locationDetails?: LocationDetails;
  createdAt: Date;
  updatedAt: Date;
}

interface Speaker {
  name: string;
  title?: string;
  bio?: string;
  photo?: string;
  order: number;
}

interface AgendaItem {
  time?: string;
  title: string;
  description?: string;
  speaker?: string;
  order: number;
}

interface FAQItem {
  question: string;
  answer: string;
  order: number;
}

interface LocationDetails {
  venueName?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  coordinates?: {
    lat?: number;
    lng?: number;
  };
  directions?: string;
  parkingInfo?: string;
}
```

### Announcement Data Model
```typescript
interface Announcement {
  _id: string;
  title: string;
  description: string;
  category: 'updates' | 'achievements' | 'events';
  startDate: Date;
  endDate?: Date;
  imageUrl?: string;
  isPinned: boolean;
  isPublished: boolean;
  tags: string[];
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  views: number;
  likes: string[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}
```

### ClassGroup Data Model
```typescript
interface ClassGroup {
  _id: string;
  name: string;
  graduationYear: number;
  description?: string;
  motto?: string;
  classImage?: string;
  bannerImage?: string;
  memberCount: number;
  isMember: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### User Data Model
```typescript
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string; // hashed
  graduationYear: number;
  phone?: string;
  profilePicture?: string;
  isAdmin: boolean;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Admin action immediate reflection
*For any* admin action (create, update, delete, publish, unpublish), the corresponding public page should reflect the change immediately upon the next data fetch
**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

### Property 2: Form field completeness
*For any* public page display element, there must exist a corresponding admin form field that controls that element
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

### Property 3: Visual consistency across forms
*For any* two admin forms, they should share the same width constraints, spacing patterns, input design, button design, and section divider styling
**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 8.1, 8.2, 8.3, 8.4, 8.5**

### Property 4: Announcement field parity
*For any* announcement created through the admin form, all fields (title, featured image, short summary, full content, visibility status, publish date) should be captured and displayed on the public page
**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

### Property 5: Event field parity
*For any* event created through the admin form, all fields (title, image, date, time, location, descriptions, status, publish toggle) should be captured and displayed on the public page
**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

### Property 6: Class data completeness
*For any* class displayed on the Class Details page, all data elements (image, title, duration, description, category, status, metadata) must have been captured in the Add Class form
**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5**

### Property 7: User data completeness
*For any* user created through the admin form, all fields (name, email, username, password, role, status, profile image, permissions) should be captured and available in the system
**Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

### Property 8: No hardcoded data on public pages
*For any* public page (Events, Announcements, Classes, Users), all displayed data must come from the database or API, not from hardcoded values
**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

### Property 9: Validation error clarity
*For any* form submission with invalid data, the system should display specific validation error messages that identify the problematic fields
**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**

### Property 10: Mobile responsiveness
*For any* admin form viewed on mobile devices, the layout should be responsive and maintain usability with appropriate spacing and sizing
**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**

### Property 11: Image upload reliability
*For any* image uploaded through an admin form, the system should validate file type and size, display a preview, and ensure the image is accessible on the corresponding public page
**Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5**

## Error Handling

### Client-Side Validation
- **Field-level validation:** Real-time validation as user types
- **Form-level validation:** Validation on submit before API call
- **Error display:** Inline error messages below fields
- **Error styling:** Red text and red border on invalid fields

### Server-Side Validation
- **Request validation:** Validate all incoming data
- **Business logic validation:** Check constraints (e.g., end date after start date)
- **Database validation:** Mongoose schema validation
- **Error responses:** Structured error objects with field-specific messages

### Error Response Format
```typescript
interface ErrorResponse {
  success: false;
  error: string; // General error message
  errors?: Array<{
    field: string;
    message: string;
  }>; // Field-specific errors
  code?: string; // Error code for programmatic handling
}
```

### Error Handling Patterns

#### Network Errors
- Display user-friendly message
- Provide retry option
- Log error details for debugging

#### Validation Errors
- Highlight invalid fields
- Display specific error messages
- Prevent form submission until resolved

#### Permission Errors
- Display access denied message
- Redirect to appropriate page
- Log unauthorized access attempts

#### Not Found Errors
- Display "resource not found" message
- Provide navigation options
- Log missing resource requests

## Testing Strategy

### Unit Testing
- Test individual form components
- Test validation functions
- Test API service functions
- Test utility functions (image upload, date formatting)
- Test error handling logic

### Integration Testing
- Test complete admin workflows (create → display on public page)
- Test form submission → API → database → public page refresh
- Test image upload → storage → display
- Test status toggles → immediate reflection

### Property-Based Testing
- Use **fast-check** library for JavaScript/TypeScript
- Configure each property test to run minimum 100 iterations
- Tag each property test with format: **Feature: admin-pages-standardization, Property {number}: {property_text}**

### End-to-End Testing
- Test complete user journeys from admin panel to public pages
- Test mobile responsiveness
- Test error scenarios
- Test concurrent admin actions

### Manual Testing Checklist
- [ ] Admin actions reflect on public pages immediately
- [ ] Admin structure matches public layout
- [ ] Forms are visually consistent
- [ ] No missing data fields
- [ ] No layout mismatches
- [ ] All uploads work
- [ ] Mobile-friendly
- [ ] No broken triggers

## Implementation Notes

### Existing Code Assessment

#### AdminEventsPage + EventFormDialog
**Status:** ✅ Excellent
- Comprehensive form with all necessary fields
- Good validation using Yup
- Drag-and-drop for speakers, agenda, FAQ
- Image upload with preview
- Registration toggle
- Status management
- **Action:** Keep as-is, use as reference for other forms

#### AdminAnnouncementsPage
**Status:** ✅ Good
- Comprehensive form with necessary fields
- Image upload with preview
- Pin/unpin functionality
- Publish/draft toggle
- Tags management
- **Action:** Keep as-is, verify API integration

#### AdminClassesPage
**Status:** ⚠️ Needs Enhancement
- Basic form with limited fields
- Missing: class image, motto, banner image
- Missing: additional metadata
- **Action:** Enhance form to match public ClassGroupsPage display

#### AdminUsersPage
**Status:** ✅ Good
- Comprehensive form with all necessary fields
- Profile picture upload
- Role management
- Status toggle
- Search functionality
- **Action:** Keep as-is, verify profile picture upload

### Standardization Guidelines

#### Form Layout Standards
```jsx
<Dialog maxWidth="md" fullWidth>
  <DialogTitle>
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="h6">{title}</Typography>
      <IconButton onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </Box>
  </DialogTitle>
  
  <DialogContent dividers sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
    <Grid container spacing={3}>
      {/* Section 1 */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom color="primary">
          Section Title
        </Typography>
        <Divider sx={{ mb: 2 }} />
      </Grid>
      
      {/* Form fields */}
      <Grid item xs={12}>
        <TextField fullWidth label="Field" />
      </Grid>
    </Grid>
  </DialogContent>
  
  <DialogActions>
    <Button onClick={onClose}>Cancel</Button>
    <Button type="submit" variant="contained">Save</Button>
  </DialogActions>
</Dialog>
```

#### Image Upload Pattern
```jsx
<input
  accept="image/*"
  style={{ display: 'none' }}
  id="image-upload"
  type="file"
  onChange={handleImageChange}
/>
<label htmlFor="image-upload">
  <Button
    variant="outlined"
    component="span"
    startIcon={<CloudUploadIcon />}
    fullWidth
  >
    Upload Image
  </Button>
</label>
{previewImage && (
  <Box
    component="img"
    src={previewImage}
    alt="Preview"
    sx={{
      width: '100%',
      maxHeight: 300,
      objectFit: 'cover',
      borderRadius: 1,
      mt: 2,
    }}
  />
)}
```

#### Validation Pattern
```javascript
const validationSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters'),
  // ... other fields
});
```

### API Integration Standards

#### Create Operation
```javascript
const handleCreate = async (formData) => {
  try {
    const response = await api.post('/resource', formData);
    showSuccess('Resource created successfully!');
    fetchResources(); // Refresh list
    handleCloseDialog();
  } catch (err) {
    showError(err.response?.data?.message || 'Failed to create resource');
  }
};
```

#### Update Operation
```javascript
const handleUpdate = async (id, formData) => {
  try {
    const response = await api.put(`/resource/${id}`, formData);
    showSuccess('Resource updated successfully!');
    fetchResources(); // Refresh list
    handleCloseDialog();
  } catch (err) {
    showError(err.response?.data?.message || 'Failed to update resource');
  }
};
```

#### Delete Operation
```javascript
const handleDelete = async (id) => {
  if (!window.confirm('Are you sure? This action cannot be undone.')) {
    return;
  }
  
  try {
    await api.delete(`/resource/${id}`);
    showSuccess('Resource deleted successfully!');
    fetchResources(); // Refresh list
  } catch (err) {
    showError(err.response?.data?.message || 'Failed to delete resource');
  }
};
```

#### Toggle Operation
```javascript
const handleToggleStatus = async (id, currentStatus) => {
  try {
    const response = await api.put(`/resource/${id}/status`, {
      status: !currentStatus
    });
    showSuccess('Status updated successfully!');
    fetchResources(); // Refresh list
  } catch (err) {
    showError(err.response?.data?.message || 'Failed to update status');
  }
};
```

## Design Decisions

### 1. Keep Existing Well-Structured Forms
**Decision:** Retain AdminEventsPage, AdminAnnouncementsPage, and AdminUsersPage as-is
**Rationale:** These forms already follow good practices and have comprehensive field coverage
**Impact:** Reduces implementation time and maintains proven patterns

### 2. Enhance AdminClassesPage
**Decision:** Add missing fields to match public ClassGroupsPage display
**Rationale:** Current form lacks data parity with public page
**Impact:** Requires form redesign and API updates

### 3. Use EventFormDialog as Reference
**Decision:** Use EventFormDialog structure as the gold standard for other forms
**Rationale:** It demonstrates best practices for complex forms with validation, drag-and-drop, and image uploads
**Impact:** Ensures consistency across all admin forms

### 4. Centralize Validation Logic
**Decision:** Use Yup for all form validation
**Rationale:** Provides declarative, reusable validation schemas
**Impact:** Consistent validation patterns across all forms

### 5. Implement Optimistic Updates
**Decision:** Update UI immediately after successful API calls
**Rationale:** Provides better user experience with instant feedback
**Impact:** Requires careful error handling and rollback logic

### 6. Use FormData for File Uploads
**Decision:** Use FormData API for forms with file uploads
**Rationale:** Standard approach for multipart/form-data submissions
**Impact:** Consistent file upload handling across all forms

### 7. Maintain Mobile-First Responsive Design
**Decision:** Use Material-UI's responsive props throughout
**Rationale:** Ensures mobile usability without separate mobile views
**Impact:** Requires careful testing on various screen sizes

### 8. Implement Comprehensive Error Handling
**Decision:** Display specific, actionable error messages
**Rationale:** Helps admins quickly identify and fix issues
**Impact:** Requires detailed error messages from backend

## Security Considerations

### Authentication
- All admin routes require authentication
- JWT token validation on every request
- Token expiration handling

### Authorization
- Role-based access control (admin vs. user)
- Permission checks before sensitive operations
- Audit logging for admin actions

### Input Validation
- Client-side validation for UX
- Server-side validation for security
- SQL injection prevention (using Mongoose)
- XSS prevention (sanitizing inputs)

### File Upload Security
- File type validation (whitelist approach)
- File size limits
- Virus scanning (if applicable)
- Secure file storage with access controls

## Performance Considerations

### Pagination
- Limit results per page (10-25 items)
- Server-side pagination for large datasets
- Efficient database queries with indexes

### Image Optimization
- Compress images before upload
- Generate thumbnails for list views
- Use CDN for image delivery (if applicable)
- Lazy loading for images

### Caching
- Cache static data (categories, roles)
- Invalidate cache on updates
- Use React Query or SWR for data fetching

### Debouncing
- Debounce search inputs
- Debounce auto-save operations
- Prevent duplicate submissions

## Accessibility

### Keyboard Navigation
- All forms navigable via keyboard
- Proper tab order
- Focus management in dialogs

### Screen Reader Support
- Proper ARIA labels
- Descriptive button text
- Error announcements

### Color Contrast
- WCAG AA compliance
- Sufficient contrast ratios
- Color-blind friendly palettes

### Form Labels
- Clear, descriptive labels
- Required field indicators
- Helper text for complex fields
