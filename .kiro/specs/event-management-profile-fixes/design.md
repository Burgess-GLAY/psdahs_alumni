# Design Document

## Overview

This design addresses critical issues in the PSDAHS Alumni application related to profile picture persistence and event management functionality. The solution ensures profile pictures remain visible after logout/login cycles, implements a fully functional admin event management interface with CRUD operations, provides admin control over event registration, fixes pagination, and enables comprehensive event detail management through the UI.

### Key Design Principles

1. **Data Persistence**: Profile pictures must be fetched fresh on each login
2. **Admin Control**: All event management through UI, no code editing required
3. **Real Data Only**: Remove all mock/placeholder data, rely on database
4. **User Experience**: Smooth pagination and clear admin interfaces
5. **Flexibility**: Admin decides which events require registration

## Architecture

### Profile Picture Flow

```
Login/Session Restore
        │
        ▼
   initializeAuth()
        │
        ▼
   authService.getMe()
        │
        ▼
Backend /api/auth/me
        │
        ▼
Returns user with profilePicture
        │
        ▼
Redux state updated
        │
        ▼
Navbar displays Avatar
```

### Event Management Flow

```
Admin Dashboard
        │
        ├──> Create Event
        │    │
        │    ├──> Event Form Dialog
        │    │    - Basic Info
        │    │    - Registration Toggle
        │    │    - Speakers (dynamic)
        │    │    - Agenda (dynamic)
        │    │    - FAQ (dynamic)
        │    │    - Location Details
        │    │
        │    └──> POST /api/events
        │
        ├──> Edit Event
        │    │
        │    ├──> Pre-filled Form Dialog
        │    └──> PUT /api/events/:id
        │
        └──> Delete Event
             │
             ├──> Confirmation Dialog
             └──> DELETE /api/events/:id
```

## Components and Interfaces

### 1. Enhanced Event Model (Backend)

**Location**: `backend/models/Event.js`

**Enhanced Schema**:
```javascript
{
  // Existing fields...
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  location: String,
  
  // Enhanced fields
  registrationEnabled: {
    type: Boolean,
    default: false  // Admin must explicitly enable
  },
  
  speakers: [{
    name: { type: String, required: true },
    title: String,
    bio: String,
    photo: String,
    order: Number
  }],
  
  agenda: [{
    time: String,
    title: { type: String, required: true },
    description: String,
    speaker: String,
    order: Number
  }],
  
  faq: [{
    question: { type: String, required: true },
    answer: { type: String, required: true },
    order: Number
  }],
  
  locationDetails: {
    venueName: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    directions: String,
    parkingInfo: String
  },
  
  // Existing fields...
  featuredImage: String,
  category: String,
  capacity: Number,
  isPublished: Boolean
}
```

### 2. Event Form Dialog Component

**Location**: `frontend/src/components/admin/EventFormDialog.js`

**Purpose**: Comprehensive form for creating/editing events

**Props**:
```typescript
interface EventFormDialogProps {
  open: boolean;
  onClose: () => void;
  event?: Event | null;  // null for create, Event for edit
  onSave: (eventData: Event) => Promise<void>;
}
```

**Form Sections**:

1. **Basic Information**
   - Title (required)
   - Description (required, rich text)
   - Category (dropdown)
   - Start Date/Time (required)
   - End Date/Time (required)
   - Featured Image (upload)
   - Capacity (number)
   - Published Status (toggle)

2. **Registration Settings**
   - Registration Enabled (toggle) - **Default: OFF**
   - Registration Deadline (date, conditional)
   - Price (number, conditional)

3. **Speakers Section**
   - Dynamic list of speakers
   - Add/Remove speaker buttons
   - Fields per speaker:
     - Name (required)
     - Title/Position
     - Bio (textarea)
     - Photo (upload)
   - Drag-to-reorder functionality

4. **Agenda Section**
   - Dynamic list of agenda items
   - Add/Remove item buttons
   - Fields per item:
     - Time (time picker)
     - Title (required)
     - Description
     - Speaker (dropdown from speakers list)
   - Drag-to-reorder functionality

5. **FAQ Section**
   - Dynamic list of Q&A pairs
   - Add/Remove FAQ buttons
   - Fields per FAQ:
     - Question (required)
     - Answer (required, textarea)
   - Drag-to-reorder functionality

6. **Location Details**
   - Venue Name
   - Address fields (street, city, state, zip, country)
   - Coordinates (lat/lng) - optional
   - Directions (textarea)
   - Parking Information (textarea)

**State Management**:
```javascript
const [formData, setFormData] = useState({
  title: '',
  description: '',
  category: 'other',
  startDate: null,
  endDate: null,
  featuredImage: '',
  capacity: null,
  isPublished: false,
  registrationEnabled: false,  // Default OFF
  registrationDeadline: null,
  price: 0,
  speakers: [],
  agenda: [],
  faq: [],
  locationDetails: {
    venueName: '',
    address: {},
    coordinates: {},
    directions: '',
    parkingInfo: ''
  }
});
```

### 3. Enhanced AdminEventsPage

**Location**: `frontend/src/pages/admin/AdminEventsPage.js`

**Key Changes**:
- Remove mock data
- Fetch real events from API
- Make "Add Event" button functional
- Implement Edit and Delete handlers
- Add EventFormDialog integration
- Add confirmation dialog for deletions

**State**:
```javascript
const [events, setEvents] = useState([]);
const [loading, setLoading] = useState(true);
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(10);
const [totalEvents, setTotalEvents] = useState(0);
const [dialogOpen, setDialogOpen] = useState(false);
const [selectedEvent, setSelectedEvent] = useState(null);
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [eventToDelete, setEventToDelete] = useState(null);
```

**API Integration**:
```javascript
const fetchEvents = async () => {
  try {
    setLoading(true);
    const response = await api.get('/api/events', {
      params: {
        page: page + 1,
        limit: rowsPerPage,
        includeUnpublished: true  // Admin sees all
      }
    });
    setEvents(response.data.data);
    setTotalEvents(response.data.total);
  } catch (error) {
    console.error('Failed to fetch events:', error);
  } finally {
    setLoading(false);
  }
};

const handleCreateEvent = () => {
  setSelectedEvent(null);
  setDialogOpen(true);
};

const handleEditEvent = (event) => {
  setSelectedEvent(event);
  setDialogOpen(true);
};

const handleDeleteEvent = async (eventId) => {
  try {
    await api.delete(`/api/events/${eventId}`);
    fetchEvents();  // Refresh list
  } catch (error) {
    console.error('Failed to delete event:', error);
  }
};

const handleSaveEvent = async (eventData) => {
  try {
    if (selectedEvent) {
      // Update existing
      await api.put(`/api/events/${selectedEvent._id}`, eventData);
    } else {
      // Create new
      await api.post('/api/events', eventData);
    }
    setDialogOpen(false);
    fetchEvents();  // Refresh list
  } catch (error) {
    console.error('Failed to save event:', error);
  }
};
```

### 4. Enhanced EventsPage (Public)

**Location**: `frontend/src/pages/events/EventsPage.js`

**Key Changes**:
- Remove mock data completely
- Fetch real events from API
- Fix pagination to work with API
- Conditionally show "Register Now" based on `registrationEnabled`
- Update URL params for pagination

**State**:
```javascript
const [events, setEvents] = useState([]);
const [loading, setLoading] = useState(true);
const [page, setPage] = useState(1);  // 1-indexed for API
const [totalPages, setTotalPages] = useState(1);
const [searchTerm, setSearchTerm] = useState('');
const [category, setCategory] = useState('all');
const [dateFilter, setDateFilter] = useState('all');
const itemsPerPage = 6;
```

**API Integration**:
```javascript
const fetchEvents = async () => {
  try {
    setLoading(true);
    const params = {
      page,
      limit: itemsPerPage,
      upcoming: dateFilter === 'upcoming' ? 'true' : undefined,
      type: category !== 'all' ? category : undefined,
      search: searchTerm || undefined
    };
    
    const response = await api.get('/api/events', { params });
    setEvents(response.data.data);
    setTotalPages(response.data.totalPages);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    setEvents([]);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchEvents();
}, [page, category, dateFilter, searchTerm]);
```

**Pagination Fix**:
```javascript
const handlePageChange = (event, value) => {
  setPage(value);
  // Update URL
  navigate(`/events?page=${value}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// On mount, read page from URL
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const pageParam = parseInt(params.get('page')) || 1;
  setPage(pageParam);
}, [location.search]);
```

**Conditional Registration Button**:
```jsx
<CardActions sx={{ p: 2, pt: 0 }}>
  {event.registrationEnabled ? (
    <Button
      size="small"
      color="primary"
      variant={event.isRegistered ? 'outlined' : 'contained'}
      fullWidth
      onClick={(e) => handleRegisterClick(event.id, e)}
      disabled={event.isRegistered}
    >
      {event.isRegistered ? 'Registered' : 'Register Now'}
    </Button>
  ) : (
    <Button
      size="small"
      color="primary"
      variant="outlined"
      fullWidth
      onClick={() => handleEventClick(event.id)}
    >
      View Details
    </Button>
  )}
</CardActions>
```

### 5. Event Detail Page Enhancement

**Location**: `frontend/src/pages/events/EventDetailPage.js`

**New Sections to Display**:

1. **Speakers Section** (if speakers exist)
```jsx
{event.speakers && event.speakers.length > 0 && (
  <Box sx={{ mt: 4 }}>
    <Typography variant="h5" gutterBottom>Speakers</Typography>
    <Grid container spacing={3}>
      {event.speakers.map((speaker, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card>
            <CardMedia
              component="img"
              height="200"
              image={speaker.photo || '/images/default-profile.jpg'}
              alt={speaker.name}
            />
            <CardContent>
              <Typography variant="h6">{speaker.name}</Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {speaker.title}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {speaker.bio}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
)}
```

2. **Agenda Section** (if agenda exists)
```jsx
{event.agenda && event.agenda.length > 0 && (
  <Box sx={{ mt: 4 }}>
    <Typography variant="h5" gutterBottom>Agenda</Typography>
    <Timeline>
      {event.agenda.map((item, index) => (
        <TimelineItem key={index}>
          <TimelineSeparator>
            <TimelineDot color="primary" />
            {index < event.agenda.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="h6">{item.time}</Typography>
            <Typography variant="subtitle1">{item.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {item.description}
            </Typography>
            {item.speaker && (
              <Typography variant="caption" color="primary">
                Speaker: {item.speaker}
              </Typography>
            )}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  </Box>
)}
```

3. **FAQ Section** (if FAQ exists)
```jsx
{event.faq && event.faq.length > 0 && (
  <Box sx={{ mt: 4 }}>
    <Typography variant="h5" gutterBottom>Frequently Asked Questions</Typography>
    {event.faq.map((item, index) => (
      <Accordion key={index}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">{item.question}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2">{item.answer}</Typography>
        </AccordionDetails>
      </Accordion>
    ))}
  </Box>
)}
```

4. **Location Details Section**
```jsx
{event.locationDetails && (
  <Box sx={{ mt: 4 }}>
    <Typography variant="h5" gutterBottom>Location</Typography>
    <Card>
      <CardContent>
        <Typography variant="h6">{event.locationDetails.venueName}</Typography>
        {event.locationDetails.address && (
          <Typography variant="body2" color="text.secondary">
            {event.locationDetails.address.street}<br />
            {event.locationDetails.address.city}, {event.locationDetails.address.state} {event.locationDetails.address.zipCode}
          </Typography>
        )}
        {event.locationDetails.directions && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Directions:</Typography>
            <Typography variant="body2">{event.locationDetails.directions}</Typography>
          </Box>
        )}
        {event.locationDetails.parkingInfo && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Parking:</Typography>
            <Typography variant="body2">{event.locationDetails.parkingInfo}</Typography>
          </Box>
        )}
        {event.locationDetails.coordinates?.lat && (
          <Box sx={{ mt: 2, height: 300 }}>
            {/* Map component here */}
          </Box>
        )}
      </CardContent>
    </Card>
  </Box>
)}
```

### 6. Profile Picture Fix in authSlice

**Location**: `frontend/src/features/auth/authSlice.js`

**Issue**: The `initializeAuth` thunk already calls `authService.getMe()` which should return the profile picture. The issue is likely that the backend isn't returning it or the frontend isn't properly storing it.

**Verification Needed**:
1. Backend `/api/auth/me` must include `profilePicture` field
2. Redux state must store the complete user object
3. Navbar must read from Redux state (already does)

**Enhanced initializeAuth**:
```javascript
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { user: null, token: null };
      }

      // Validate token by fetching current user (includes profilePicture)
      const user = await authService.getMe();
      
      // Log for debugging
      console.log('[authSlice] User fetched on init:', {
        id: user.id,
        email: user.email,
        hasProfilePicture: !!user.profilePicture,
        profilePicture: user.profilePicture
      });
      
      return { user, token };
    } catch (error) {
      logError('initializeAuth', error, {
        action: 'Token validation failed during app initialization'
      });
      localStorage.removeItem('token');
      return { user: null, token: null };
    }
  }
);
```

## Data Models

### Enhanced Event Model

```typescript
interface Event {
  _id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  category: 'reunion' | 'career' | 'workshop' | 'sports' | 'networking' | 'other';
  featuredImage?: string;
  capacity?: number;
  isPublished: boolean;
  
  // Registration
  registrationEnabled: boolean;  // Default: false
  registrationDeadline?: Date;
  price?: number;
  
  // Speakers
  speakers: Speaker[];
  
  // Agenda
  agenda: AgendaItem[];
  
  // FAQ
  faq: FAQItem[];
  
  // Location Details
  locationDetails: LocationDetails;
  
  // Metadata
  createdBy: string;
  updatedBy?: string;
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
  time: string;
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

## Error Handling

### Event Management Errors

1. **Create Event Failure**
   - Display: "Failed to create event. Please try again."
   - Action: Keep form open with data, allow retry
   - Logging: Log full error with form data

2. **Update Event Failure**
   - Display: "Failed to update event. Please try again."
   - Action: Keep form open with data, allow retry
   - Logging: Log error with event ID

3. **Delete Event Failure**
   - Display: "Failed to delete event. Please try again."
   - Action: Close confirmation, allow retry
   - Logging: Log error with event ID

4. **Fetch Events Failure**
   - Display: "Failed to load events. Please refresh the page."
   - Action: Show empty state with retry button
   - Logging: Log error with query params

5. **Image Upload Failure**
   - Display: "Failed to upload image. Please try a different file."
   - Action: Clear file input, allow retry
   - Logging: Log error with file details

### Profile Picture Errors

1. **Profile Picture Load Failure**
   - Display: Fallback to initials avatar
   - Action: Silent fallback, no error shown
   - Logging: Log warning with user ID

2. **Profile Picture Missing**
   - Display: Initials avatar
   - Action: Normal operation
   - Logging: No logging needed (expected state)

## Testing Strategy

### Unit Tests

1. **Event Model Tests**
   - Test schema validation
   - Test default values (registrationEnabled = false)
   - Test required fields
   - Test nested object validation

2. **Event Controller Tests**
   - Test CRUD operations
   - Test authorization checks
   - Test query filtering
   - Test pagination

3. **EventFormDialog Tests**
   - Test form validation
   - Test dynamic field addition/removal
   - Test form submission
   - Test edit mode pre-population

4. **Profile Picture Tests**
   - Test avatar display with picture
   - Test avatar display with initials
   - Test picture persistence after login

### Integration Tests

1. **Event Management Flow**
   - Admin creates event → Event appears in list
   - Admin edits event → Changes reflected
   - Admin deletes event → Event removed
   - Admin toggles registration → Button appears/disappears

2. **Event Display Flow**
   - Public user views events → Only published events shown
   - User clicks event → Detail page shows all sections
   - User sees registration button → Only if enabled
   - Pagination works → Correct events on each page

3. **Profile Picture Flow**
   - User logs in → Picture appears
   - User logs out → Picture cleared
   - User logs back in → Picture reappears
   - Session restored → Picture loaded

## Migration Strategy

### Phase 1: Backend Enhancements

1. Update Event model with new fields
2. Update event controller to handle new fields
3. Ensure `/api/auth/me` returns profilePicture
4. Test API endpoints

### Phase 2: Frontend Components

1. Create EventFormDialog component
2. Create dynamic field components (speakers, agenda, FAQ)
3. Test form in isolation

### Phase 3: Admin Integration

1. Update AdminEventsPage to use real API
2. Integrate EventFormDialog
3. Remove mock data
4. Test CRUD operations

### Phase 4: Public Pages

1. Update EventsPage to use real API
2. Fix pagination with URL params
3. Conditional registration button
4. Update EventDetailPage with new sections

### Phase 5: Profile Picture Fix

1. Verify backend returns profilePicture
2. Add logging to authSlice
3. Test login/logout cycles
4. Verify Navbar displays correctly

### Phase 6: Testing & Cleanup

1. Remove all mock data
2. Test complete flows
3. Fix any edge cases
4. Update documentation

## Performance Considerations

1. **Image Optimization**: Compress uploaded images on backend
2. **Lazy Loading**: Load event images lazily on scroll
3. **Pagination**: Limit events per page to reduce load time
4. **Caching**: Cache event list on frontend for 5 minutes
5. **Debouncing**: Debounce search input to reduce API calls

## Accessibility

1. **Form Labels**: All form fields have proper labels
2. **Error Messages**: Clear, descriptive error messages
3. **Keyboard Navigation**: Full keyboard support in dialogs
4. **Screen Readers**: ARIA labels for dynamic content
5. **Focus Management**: Proper focus handling in modals

## Security Considerations

1. **Authorization**: Verify admin role on all event mutations
2. **Input Validation**: Sanitize all user inputs
3. **Image Upload**: Validate file types and sizes
4. **XSS Protection**: Escape HTML in event descriptions
5. **CSRF Protection**: Include CSRF tokens in mutations

## Backward Compatibility

- Existing events without new fields will display gracefully
- Registration button hidden by default (registrationEnabled = false)
- Profile picture fallback to initials if missing
- Pagination works with or without URL params
