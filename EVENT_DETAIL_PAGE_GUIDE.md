# EventDetailPage User Guide

## Overview
The EventDetailPage displays comprehensive information about a single event, with sections that appear dynamically based on available data.

## Page Structure

### 1. Header Section
- **Featured Image**: Full-width banner image (or default if not provided)
- **Event Title**: Large, prominent heading
- **Category Badge**: Shows event category (reunion, career, workshop, etc.)
- **Status Badges**: 
  - "Registration Open" (if registrationEnabled is true)
  - "Event Ended" (if event is in the past)
- **Quick Info**: Date, time, and location displayed over the image

### 2. Main Content Area

#### Left Column (8/12 width)

**About This Event**
- Full event description
- Event statistics (registered count, spots left, category)

**Tabbed Sections** (only visible tabs appear)
- **Details Tab** (always visible)
  - Event description
  - Date & time
  - Location
  - Available seats

- **Agenda Tab** (visible if agenda items exist)
  - Timeline-style list
  - Time, title, description for each item
  - Associated speaker if specified
  - Sorted by order

- **Speakers Tab** (visible if speakers exist)
  - Grid of speaker cards
  - Photo, name, title, bio
  - Sorted by order

- **FAQ Tab** (visible if FAQ items exist)
  - Accordion-style expandable Q&A
  - Question as header, answer in expandable section
  - Sorted by order

- **Location Tab** (visible if locationDetails exist)
  - Venue name
  - Full address
  - Directions (if provided)
  - Parking information (if provided)
  - Interactive map (if coordinates provided)
  - "Get Directions" button to Google Maps

#### Right Column (4/12 width)

**Event Details Card**
- Date and time
- Location
- Available seats (if capacity is set)

**Registration Section** (only if registrationEnabled is true)
- "Register Now" button (if not registered and spots available)
- "You're Registered" button (if already registered)
- "Registration Closed" button (if capacity reached)
- Remaining spots counter

**Info Message** (if registrationEnabled is false)
- Alert showing "Registration is not available for this event"

**Contact Section**
- "Have questions?" message
- "Contact Organizer" button

## Conditional Display Logic

### Registration Button
```
IF registrationEnabled === true AND event is not past:
  IF user is registered:
    SHOW "You're Registered" (disabled, green)
  ELSE IF capacity is full:
    SHOW "Registration Closed" (disabled, red)
  ELSE:
    SHOW "Register Now" (enabled, primary)
ELSE:
  SHOW info message "Registration is not available"
```

### Tabs Display
```
Details Tab: ALWAYS VISIBLE

Agenda Tab: VISIBLE IF event.agenda.length > 0

Speakers Tab: VISIBLE IF event.speakers.length > 0

FAQ Tab: VISIBLE IF event.faq.length > 0

Location Tab: VISIBLE IF event.locationDetails exists
```

### Map Display
```
IF locationDetails.coordinates.lat AND locationDetails.coordinates.lng:
  SHOW interactive map with marker
  SHOW "Get Directions" button
ELSE:
  SHOW only text information
```

## Data Requirements

### Minimum Required Fields
- `_id`: Event identifier
- `title`: Event name
- `description`: Event description
- `startDate`: Start date/time
- `endDate`: End date/time
- `location`: Location name (fallback if locationDetails not provided)

### Optional Fields
- `featuredImage`: Event banner image
- `category`: Event category
- `capacity`: Maximum attendees
- `registrationEnabled`: Controls registration button (default: false)
- `speakers`: Array of speaker objects
- `agenda`: Array of agenda items
- `faq`: Array of FAQ items
- `locationDetails`: Detailed location information

## Example Scenarios

### Scenario 1: Basic Event (No Optional Sections)
**Data**: Only required fields
**Display**:
- Header with title and basic info
- Details tab only
- No registration button (registrationEnabled defaults to false)
- Contact section

### Scenario 2: Event with Registration
**Data**: Required fields + `registrationEnabled: true` + `capacity: 100`
**Display**:
- Header with "Registration Open" badge
- Details tab only
- "Register Now" button
- Spots remaining counter
- Contact section

### Scenario 3: Full Event (All Sections)
**Data**: All fields populated
**Display**:
- Header with all badges
- All 5 tabs visible (Details, Agenda, Speakers, FAQ, Location)
- Registration button (if enabled)
- Interactive map in Location tab
- Full contact section

### Scenario 4: Past Event
**Data**: `endDate` is in the past
**Display**:
- Header with "Event Ended" badge
- Grayscale image filter
- All tabs based on data
- No registration button (regardless of registrationEnabled)
- Contact section

## User Interactions

### Navigation
- **Back Button**: Returns to events list
- **Share Button**: Opens share dialog or copies link
- **Tab Switching**: Click tabs to view different sections
- **FAQ Accordions**: Click to expand/collapse answers
- **Map**: Pan and zoom (scroll disabled by default)
- **Get Directions**: Opens Google Maps in new tab

### Registration Flow
1. User clicks "Register Now"
2. Registration dialog opens
3. User fills form (name, email, graduation year, guests, requirements)
4. User submits
5. Success message displays
6. Button changes to "You're Registered"

## Responsive Behavior

### Desktop (md and up)
- Two-column layout (8/4 split)
- All tabs visible in single row
- Large map (400px height)
- Speaker grid: 3 columns

### Tablet (sm to md)
- Two-column layout maintained
- Tabs may scroll horizontally
- Medium map (400px height)
- Speaker grid: 2 columns

### Mobile (xs)
- Single column layout
- Scrollable tabs
- Smaller map (300px height)
- Speaker grid: 1 column
- Stacked content

## Error Handling

### Event Not Found
- Shows alert: "Event not found"
- Displays "Back to Events" button

### API Error
- Shows alert: "Failed to load event details. Please try again later."
- Displays "Back to Events" button

### Loading State
- Shows centered loading spinner
- Minimum height to prevent layout shift

### Missing Optional Data
- Sections gracefully hidden
- No empty states or error messages
- Clean, focused display

## Accessibility Features

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly
- Focus management in dialogs
- Color contrast compliance
- Alt text on images

## Performance Considerations

- Single API call on mount
- Lazy loading of map component
- Optimized image loading
- Efficient conditional rendering
- Minimal re-renders

## Best Practices for Admins

### Creating Events for Best Display

1. **Always Provide**:
   - Clear, descriptive title
   - Detailed description
   - Accurate dates and times
   - Featured image (recommended size: 1200x600px)

2. **For Better User Experience**:
   - Set `registrationEnabled: true` if registration is needed
   - Add capacity if limiting attendees
   - Include speakers for credibility
   - Add agenda for clarity
   - Include FAQ to reduce questions
   - Provide full location details with coordinates

3. **Location Details**:
   - Always include venue name
   - Provide complete address
   - Add coordinates for map display
   - Include directions for complex locations
   - Mention parking availability

4. **Speakers**:
   - Include professional photos
   - Write concise, relevant bios
   - Specify titles/credentials
   - Order by importance

5. **Agenda**:
   - Use clear, specific times
   - Write descriptive titles
   - Add details for complex items
   - Link speakers to agenda items
   - Order chronologically

6. **FAQ**:
   - Anticipate common questions
   - Provide clear, complete answers
   - Order by importance/frequency
   - Keep answers concise

## Technical Notes

### API Endpoint
```
GET /api/events/:id
```

### Response Format
```json
{
  "success": true,
  "data": {
    // Event object
  }
}
```

### Component Location
```
frontend/src/pages/events/EventDetailPage.js
```

### Dependencies
- Material-UI components
- React Router (useParams, useNavigate)
- date-fns (date formatting)
- react-leaflet (map display)
- axios (API calls)

## Troubleshooting

### Issue: Registration button not showing
**Solution**: Check that `registrationEnabled: true` in event data

### Issue: Tabs not appearing
**Solution**: Verify that corresponding data arrays exist and have items

### Issue: Map not displaying
**Solution**: Ensure `locationDetails.coordinates.lat` and `.lng` are valid numbers

### Issue: Images not loading
**Solution**: Check image URLs are accessible and use fallback images

### Issue: Date formatting errors
**Solution**: Ensure dates are in valid ISO format from backend

## Conclusion

The EventDetailPage provides a flexible, data-driven display that adapts to the information available for each event. By conditionally rendering sections and respecting the `registrationEnabled` flag, it ensures users see only relevant information while giving admins full control over event presentation and registration availability.
