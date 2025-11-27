# Requirements Document

## Introduction

The PSDAHS Alumni application has critical issues with profile picture persistence and event management functionality. Profile pictures disappear after logout/login cycles, the admin event management interface has non-functional buttons, event pagination is broken, and the system lacks comprehensive admin controls for event details. Additionally, the events system contains placeholder data that needs to be replaced with real data. This feature addresses these issues to provide a robust event management system and reliable profile picture handling.

## Glossary

- **Profile Picture**: User avatar image displayed in the navbar and profile pages
- **Event Management System**: Admin interface for creating, editing, and deleting events
- **Event Registration**: Optional feature allowing users to register for specific events
- **Event Pagination**: Navigation controls for browsing multiple pages of events
- **Event Details**: Comprehensive information including speakers, agenda, FAQ, and location
- **Admin UI**: User interface accessible only to administrators for content management
- **Real Data**: Actual system data as opposed to placeholder or mock data

## Requirements

### Requirement 1: Profile Picture Persistence

**User Story:** As a user, I want my profile picture to remain visible in the navbar after logout and re-login, so that my identity is consistently represented.

#### Acceptance Criteria

1. WHEN a user logs in with a profile picture THEN the system SHALL display the profile picture in the navbar avatar
2. WHEN a user logs out THEN the system SHALL clear the profile picture from memory
3. WHEN a user logs back in THEN the system SHALL retrieve and display their profile picture from the backend
4. WHEN the authentication state is restored from localStorage THEN the system SHALL fetch the current user profile including the profile picture
5. IF a user has no profile picture THEN the system SHALL display their initials as a fallback avatar

### Requirement 2: Admin Event Creation Interface

**User Story:** As an administrator, I want a functional "Add Event" button in the Manage Events section, so that I can create new events through the UI.

#### Acceptance Criteria

1. WHEN an administrator views the Manage Events page THEN the system SHALL display a clickable "Add Event" button
2. WHEN an administrator clicks the "Add Event" button THEN the system SHALL open an event creation form dialog
3. WHEN an administrator submits a valid event form THEN the system SHALL create the event in the database
4. WHEN an event is successfully created THEN the system SHALL display it in the events list immediately
5. WHEN an event is created THEN the system SHALL make it visible on the public Events page

### Requirement 3: Admin Event Edit and Delete Operations

**User Story:** As an administrator, I want to edit and delete existing events, so that I can maintain accurate event information.

#### Acceptance Criteria

1. WHEN an administrator views an event in the Manage Events list THEN the system SHALL display Edit and Delete action buttons
2. WHEN an administrator clicks the Edit button THEN the system SHALL open a pre-filled form with the event's current data
3. WHEN an administrator updates event data and submits THEN the system SHALL save the changes to the database
4. WHEN an administrator clicks the Delete button THEN the system SHALL prompt for confirmation before deletion
5. WHEN an administrator confirms deletion THEN the system SHALL remove the event from the database and update the UI

### Requirement 4: Admin-Controlled Event Registration

**User Story:** As an administrator, I want to control which events have registration enabled, so that only appropriate events display the "Register Now" button.

#### Acceptance Criteria

1. WHEN an administrator creates or edits an event THEN the system SHALL provide a "Registration Enabled" toggle option
2. WHEN an event has registration enabled THEN the system SHALL display a "Register Now" button on the event detail page
3. WHEN an event has registration disabled THEN the system SHALL NOT display a "Register Now" button
4. WHEN a user views an event without registration THEN the system SHALL display event information without registration options
5. WHEN an administrator toggles registration status THEN the system SHALL immediately update the event display

### Requirement 5: Functional Event Pagination

**User Story:** As a user, I want working pagination controls on the Events page, so that I can browse through all available events.

#### Acceptance Criteria

1. WHEN the Events page loads with more events than the page size THEN the system SHALL display pagination controls
2. WHEN a user clicks "Next" or a page number THEN the system SHALL load and display the corresponding page of events
3. WHEN a user is on page 2 or higher THEN the system SHALL display a "Previous" button
4. WHEN a user navigates between pages THEN the system SHALL update the URL to reflect the current page
5. WHEN a user refreshes the page THEN the system SHALL maintain the current page number from the URL

### Requirement 6: Comprehensive Event Detail Management

**User Story:** As an administrator, I want to add speakers, agenda items, FAQs, and location details through the admin UI, so that I can provide complete event information without editing code.

#### Acceptance Criteria

1. WHEN an administrator creates or edits an event THEN the system SHALL provide input fields for speakers, agenda, FAQ, and location
2. WHEN an administrator adds multiple speakers THEN the system SHALL allow adding speaker name, title, bio, and photo
3. WHEN an administrator creates an agenda THEN the system SHALL allow adding time-based agenda items with descriptions
4. WHEN an administrator adds FAQ items THEN the system SHALL allow adding question-answer pairs
5. WHEN an administrator specifies a location THEN the system SHALL allow entering venue name, address, and optional map coordinates
6. WHEN event details are saved THEN the system SHALL display them on the public event detail page

### Requirement 7: Real Data Enforcement

**User Story:** As a system administrator, I want all event data to be real and managed through the admin interface, so that users see accurate information.

#### Acceptance Criteria

1. WHEN the Events page loads THEN the system SHALL display only events from the database
2. WHEN no events exist in the database THEN the system SHALL display an empty state message
3. WHEN an administrator views the Manage Events page THEN the system SHALL display only actual database events
4. WHEN event titles are displayed THEN the system SHALL use the exact titles from the database
5. IF placeholder or mock data exists in the code THEN the system SHALL remove it and rely solely on database queries
