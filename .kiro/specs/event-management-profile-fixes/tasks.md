# Implementation Plan

- [x] 1. Fix profile picture persistence issue





  - Update backend to ensure `/api/auth/me` returns profilePicture field
  - Add logging to authSlice initializeAuth to debug profile picture loading
  - Verify Navbar correctly displays profile picture from Redux state
  - Test logout/login cycle to confirm picture persists
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

-

- [x] 2. Enhance Event model with new fields







  - Add `registrationEnabled` field (Boolean, default: false)
  - Add `speakers` array with name, title, bio, photo, order fields
  - Add `agenda` array with time, title, description, speaker, order fields
  - Add `faq` array with question, answer, order fields
  - Add `locationDetails` object with venue, address, coordinates, directions, parking fields
  - Update Event model indexes if needed
  - _Requirements: 2.1, 3.1, 4.1, 4.2, 6.1, 6.2, 6.3, 6.4, 6.5_

-


- [x] 3. Update event controller for new fields





  - Modify createEvent to handle speakers, agenda, faq, locationDetails
  - Modify updateEvent to handle new fields
  - Ensure getEvents returns all new fields
  - Ensure getEventById returns all new fields
  - Test API endpoints with Postman or similar tool

  - _Requirements: 2.3, 3.3, 6.6_
-

- [x] 4. Create EventFormDialog component







  - Create new component file `frontend/src/components/admin/EventFormDialog.js`
  - Implement basic information section (title, description, dates, category, image, capacity)
  - Implement registration settings section with toggle (default OFF)

  - Add form validation using Formik and Yup
  - _Requirements: 2.2, 4.1, 4.2_
-

- [x] 5. Implement dynamic speakers section in EventFormDialog





  - Create dynamic list for adding/removing speakers
  - Add fields: name, title, bio, photo upload

  - Implement drag-to-reorder functionality
  - Add validation for required speaker fields
  - _Requirements: 6.2_

- [x] 6. Implement dynamic agenda section in EventFormDialog






  - Create dynamic list for adding/removing agenda items

  - Add fields: time, title, description, speaker dropdown
  - Implement drag-to-reorder functionality
  - Add validation for required agenda fields
  - _Requirements: 6.3_
-

- [x] 7. Implement dynamic FAQ section in EventFormDialog






  - Create dynamic list for adding/removing FAQ items
  - Add fields: question, answer
  - Implement drag-to-reorder functionality
  - Add validation for required FAQ fields
  - _Requirements: 6.4_


- [x] 8. Implement location details section in EventFormDialog






  - Add venue name field
  - Add address fields (street, city, state, zip, country)
  - Add optional coordinates fields (lat, lng)
  - Add directions textarea
  - Add parking information textarea
  - _Requirements: 6.5_



- [x] 9. Update AdminEventsPage to use real API




  - Remove all mock data from AdminEventsPage
  - Implement fetchEvents function using API call to `/api/events`
  - Add loading state while fetching
  - Add error handling for failed API calls
  - Display real events in table
  - _Requirements: 2.4, 7.1, 7.3, 7.4_
-

- [x] 10. Make "Add Event" button functional





  - Connect "Add Event" button to open EventFormDialog
  - Pass null/empty event to dialog for create mode
  - Implement handleSaveEvent to POST new event to API
  - Refresh events list after successful creation
  - Show success/error notifications
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
-

- [x] 11. Implement Edit functionality




  - Add Edit button click handler to open EventFormDialog
  - Pass selected event to dialog for edit mode
  - Pre-populate form with existing event data
  - Implement handleSaveEvent to PUT updated event to API
  - Refresh events list after successful update
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 12. Implement Delete functionality





  - Add Delete button click handler
  - Create confirmation dialog for delete action
  - Implement handleDeleteEvent to DELETE event via API
  - Refresh events list after successful deletion
  - Show success/error notifications
  - _Requirements: 3.4, 3.5_

- [x] 13. Update EventsPage to use real API



  - Remove all mock data from EventsPage
  - Implement fetchEvents function using API call to `/api/events`
  - Add loading state while fetching
  - Handle empty state when no events exist
  - Add error handling for failed API calls
  - _Requirements: 7.1, 7.2, 7.5_
-

- [x] 14. Fix event pagination




  - Update pagination to use API page parameter
  - Read page number from URL query params on mount
  - Update URL when page changes
  - Implement handlePageChange to fetch correct page from API
  - Ensure "Previous" and "Next" buttons work correctly
  - Test navigation between multiple pages
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 15. Implement conditional registration button




  - Check event.registrationEnabled field
  - Show "Register Now" button only if registrationEnabled is true
  - Show "View Details" button if registrationEnabled is false
  - Update both grid and list view layouts
  - Test with events that have registration enabled and disabled
  - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [x] 16. Create or update EventDetailPage
  - Fetch event details from API using event ID
  - Display basic event information
  - Add speakers section (conditional on speakers array)
  - Add agenda section with timeline (conditional on agenda array)
  - Add FAQ section with accordions (conditional on faq array)
  - Add location details section with map (conditional on locationDetails)
  - Show registration button only if registrationEnabled is true
  - _Requirements: 6.6_

- [x] 17. Test complete event management flow




  - Test admin creating a new event with all fields
  - Test admin editing an existing event
  - Test admin deleting an event
  - Test admin toggling registration enabled/disabled
  - Verify events appear on public EventsPage
  - Verify event details display correctly
  - Verify pagination works across multiple pages
  - Verify registration button appears/disappears correctly
  - _Requirements: All_

- [x] 18. Final cleanup and verification



  - Remove any remaining mock/placeholder data
  - Verify all console.log statements are appropriate
  - Test profile picture persistence through logout/login
  - Verify error handling works for all operations
  - Test on different screen sizes (mobile, tablet, desktop)
  - Update any relevant documentation
  - _Requirements: All_
