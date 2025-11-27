# Agenda Section UI Guide

## Visual Layout

The agenda section appears in the EventFormDialog after the Speakers section with the following structure:

```
┌─────────────────────────────────────────────────────────────┐
│ Agenda                                                       │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ ≡  Agenda Item 1                              [X]    │   │
│ │                                                       │   │
│ │  Time: [9:00 AM - 10:00 AM                    ]      │   │
│ │  Title: [Opening Keynote                      ] *    │   │
│ │  Description:                                         │   │
│ │  [Welcome and introduction to the event       ]      │   │
│ │  [                                             ]      │   │
│ │  Speaker: [John Doe                           ▼]     │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ ≡  Agenda Item 2                              [X]    │   │
│ │                                                       │   │
│ │  Time: [10:30 AM - 12:00 PM                   ]      │   │
│ │  Title: [Workshop Session                     ] *    │   │
│ │  Description:                                         │   │
│ │  [Hands-on workshop activities                ]      │   │
│ │  [                                             ]      │   │
│ │  Speaker: [Jane Smith                         ▼]     │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ [+ Add Agenda Item]                                         │
└─────────────────────────────────────────────────────────────┘
```

## Field Descriptions

### Time Field
- **Type**: Text input
- **Required**: No
- **Placeholder**: "e.g., 9:00 AM - 10:00 AM"
- **Max Length**: 50 characters
- **Purpose**: Specify when the agenda item occurs

### Title Field
- **Type**: Text input
- **Required**: Yes (marked with *)
- **Min Length**: 2 characters
- **Max Length**: 200 characters
- **Purpose**: Brief title of the agenda item

### Description Field
- **Type**: Multiline textarea (2 rows)
- **Required**: No
- **Max Length**: 1000 characters
- **Purpose**: Detailed description of the agenda item

### Speaker Dropdown
- **Type**: Select dropdown
- **Required**: No
- **Options**: 
  - "None" (default)
  - All speakers added in the Speakers section
- **Purpose**: Associate a speaker with this agenda item
- **Dynamic**: Updates automatically when speakers are added/removed

## Interactions

### Adding an Agenda Item
1. Click the "Add Agenda Item" button at the bottom
2. A new card appears with empty fields
3. Fill in the required title field
4. Optionally fill in time, description, and select a speaker
5. The item is automatically numbered (e.g., "Agenda Item 3")

### Removing an Agenda Item
1. Click the [X] delete button in the top-right of any agenda card
2. The item is immediately removed
3. Remaining items are automatically renumbered

### Reordering Agenda Items
1. Click and hold the ≡ (drag handle) icon on the left
2. Drag the card up or down to the desired position
3. The card shows a hover effect while dragging
4. Release to drop the item in the new position
5. Items are automatically renumbered
6. The order field is updated in the background

### Speaker Dropdown Behavior
- If no speakers exist, only "None" option is available
- As speakers are added in the Speakers section, they appear in the dropdown
- If a speaker is removed, any agenda items referencing that speaker will show the speaker name but it won't be in the dropdown anymore
- The dropdown shows speaker names, or "Speaker N" if a speaker has no name yet

## Validation

### On Submit
- **Title Required**: If title is empty, error message appears: "Agenda item title is required"
- **Title Length**: If title is too short: "Title must be at least 2 characters"
- **Title Length**: If title is too long: "Title must not exceed 200 characters"
- **Time Length**: If time exceeds limit: "Time must not exceed 50 characters"
- **Description Length**: If description exceeds limit: "Description must not exceed 1000 characters"

### Visual Feedback
- Required fields show a red asterisk (*)
- Invalid fields show red border and error text below
- Valid fields show normal border
- Disabled state (during submission) shows grayed-out appearance

## Accessibility

- All fields have proper labels
- Drag handle has cursor: grab
- Delete button has aria-label: "Remove agenda item N"
- Keyboard navigation supported
- Screen reader friendly

## Data Flow

1. **User Input** → Form fields
2. **Form State** → Formik manages values
3. **Validation** → Yup schema validates on submit
4. **Submission** → Data serialized to JSON
5. **Backend** → Agenda array saved to database
6. **Edit Mode** → Existing agenda items loaded and displayed

## Integration with Speakers

The agenda section is tightly integrated with the speakers section:

1. When a speaker is added, they immediately appear in all agenda item speaker dropdowns
2. When a speaker's name is changed, it updates in the dropdown
3. When a speaker is removed, they disappear from the dropdown (but existing references remain)
4. The speaker dropdown is disabled if the form is submitting

## Example Use Case

**Creating a Conference Event:**

1. Add speakers first:
   - Dr. Jane Smith (Keynote Speaker)
   - Prof. John Doe (Workshop Leader)
   - Sarah Johnson (Panel Moderator)

2. Add agenda items:
   - **9:00 AM - 9:30 AM**: Registration & Coffee
     - No speaker assigned
   
   - **9:30 AM - 10:30 AM**: Opening Keynote
     - Speaker: Dr. Jane Smith
     - Description: "Welcome address and industry trends"
   
   - **10:45 AM - 12:00 PM**: Technical Workshop
     - Speaker: Prof. John Doe
     - Description: "Hands-on coding session"
   
   - **1:00 PM - 2:30 PM**: Panel Discussion
     - Speaker: Sarah Johnson
     - Description: "Q&A with industry experts"

3. Reorder if needed by dragging items

4. Submit the form - all agenda data is saved

## Technical Notes

- Uses react-beautiful-dnd for drag-and-drop
- Uses Formik for form state management
- Uses Yup for validation
- Uses Material-UI components for styling
- Fully responsive design
- Works on mobile, tablet, and desktop
