# Event Pagination - Manual Testing Guide

## Prerequisites
- Backend server running on port 5000
- Frontend server running on port 3000
- At least 7+ events in the database (to see pagination with limit=6)

## Test Scenarios

### Scenario 1: Basic Pagination Display
**Steps:**
1. Navigate to http://localhost:3000/events
2. Observe the page

**Expected Results:**
- ✅ Events are displayed (up to 6 per page)
- ✅ If total events > 6, pagination controls appear at bottom
- ✅ If total events ≤ 6, no pagination controls
- ✅ Page number shows "1" as active

### Scenario 2: Navigate to Next Page
**Steps:**
1. On events page with pagination visible
2. Click "Next" button or page "2"
3. Observe the changes

**Expected Results:**
- ✅ URL changes to `/events?page=2`
- ✅ New set of events loads
- ✅ Page scrolls to top smoothly
- ✅ Page number "2" is now active
- ✅ "Previous" button is now visible
- ✅ Loading spinner shows briefly during fetch

### Scenario 3: Navigate to Previous Page
**Steps:**
1. On page 2 or higher
2. Click "Previous" button or page "1"
3. Observe the changes

**Expected Results:**
- ✅ URL changes to `/events?page=1`
- ✅ First set of events loads
- ✅ Page scrolls to top
- ✅ Page number "1" is active

### Scenario 4: Direct Page Number Click
**Steps:**
1. On events page with multiple pages
2. Click a specific page number (e.g., "3")
3. Observe the changes

**Expected Results:**
- ✅ URL changes to `/events?page=3`
- ✅ Correct page of events loads
- ✅ Page number "3" is active
- ✅ Both Previous and Next buttons visible (if not last page)

### Scenario 5: URL Parameter Persistence
**Steps:**
1. Navigate to page 2 (URL: `/events?page=2`)
2. Press F5 to refresh the page
3. Observe the state

**Expected Results:**
- ✅ Page stays on page 2 after refresh
- ✅ URL still shows `?page=2`
- ✅ Correct events for page 2 are displayed
- ✅ Pagination shows page 2 as active

### Scenario 6: Browser Back/Forward
**Steps:**
1. Navigate from page 1 → page 2 → page 3
2. Click browser back button twice
3. Click browser forward button once
4. Observe the navigation

**Expected Results:**
- ✅ Back button: page 3 → page 2 → page 1
- ✅ Forward button: page 1 → page 2
- ✅ Events update correctly for each page
- ✅ URL updates correctly
- ✅ Pagination state matches URL

### Scenario 7: Pagination with Filters
**Steps:**
1. On events page, select a category filter (e.g., "Reunions")
2. Observe pagination
3. Navigate to page 2 (if available)
4. Change filter to different category
5. Observe the changes

**Expected Results:**
- ✅ Pagination resets to page 1 when filter changes
- ✅ Total pages updates based on filtered results
- ✅ URL shows correct page number
- ✅ Events match the selected filter

### Scenario 8: Pagination with Search
**Steps:**
1. On events page, enter search term
2. Observe pagination
3. Navigate to page 2 (if available)
4. Clear search term
5. Observe the changes

**Expected Results:**
- ✅ Pagination updates based on search results
- ✅ Can navigate through search result pages
- ✅ Clearing search resets to page 1
- ✅ URL updates correctly

### Scenario 9: First/Last Page Buttons
**Steps:**
1. On events page with 3+ pages
2. Click "Last" button (>>)
3. Observe the change
4. Click "First" button (<<)
5. Observe the change

**Expected Results:**
- ✅ "Last" button jumps to final page
- ✅ "First" button jumps to page 1
- ✅ URL updates correctly
- ✅ Events load correctly

### Scenario 10: Invalid Page Number in URL
**Steps:**
1. Manually navigate to `/events?page=999`
2. Observe the behavior

**Expected Results:**
- ✅ Page loads without crashing
- ✅ Shows "No events found" or empty state
- ✅ Pagination shows page 999 as active (or resets to valid page)
- ✅ No console errors

### Scenario 11: Page Number Zero or Negative
**Steps:**
1. Manually navigate to `/events?page=0`
2. Observe the behavior
3. Try `/events?page=-1`

**Expected Results:**
- ✅ Defaults to page 1
- ✅ Shows first page of events
- ✅ URL may correct to `?page=1`

### Scenario 12: Non-numeric Page Parameter
**Steps:**
1. Manually navigate to `/events?page=abc`
2. Observe the behavior

**Expected Results:**
- ✅ Defaults to page 1
- ✅ Shows first page of events
- ✅ No console errors

## API Verification

### Check Network Tab
1. Open browser DevTools → Network tab
2. Navigate between pages
3. Observe API calls

**Expected:**
- ✅ Each page change triggers GET `/api/events?page=X&limit=6`
- ✅ Response includes: `data`, `totalPages`, `currentPage`, `total`, `count`
- ✅ Response status: 200 OK
- ✅ No duplicate requests

## Performance Checks

### Loading States
- ✅ Loading spinner appears during fetch
- ✅ Spinner disappears when data loads
- ✅ No flash of old content

### Smooth Scrolling
- ✅ Page scrolls to top on page change
- ✅ Scroll is smooth (not instant jump)
- ✅ Scroll completes before new content renders

## Accessibility Checks

### Keyboard Navigation
1. Use Tab key to navigate to pagination
2. Use Arrow keys to move between page numbers
3. Press Enter to select a page

**Expected:**
- ✅ Can reach pagination with keyboard
- ✅ Current page is clearly indicated
- ✅ Can activate page changes with Enter

### Screen Reader
- ✅ Pagination has proper ARIA labels
- ✅ Current page is announced
- ✅ Page changes are announced

## Mobile Testing

### Responsive Design
1. Open events page on mobile device or resize browser
2. Navigate between pages

**Expected:**
- ✅ Pagination controls are touch-friendly
- ✅ Buttons are large enough to tap
- ✅ Layout doesn't break on small screens

## Error Scenarios

### Network Error
1. Disconnect from network
2. Try to change pages
3. Observe error handling

**Expected:**
- ✅ Error message displays
- ✅ Previous page content remains visible
- ✅ Can retry when network returns

### Server Error
1. Stop backend server
2. Try to change pages
3. Observe error handling

**Expected:**
- ✅ Error message displays
- ✅ Graceful degradation
- ✅ No app crash

## Test Data Setup

To properly test pagination, ensure you have:
- Minimum 7 events (to see 2 pages with limit=6)
- Recommended 15+ events (to see multiple pages)
- Mix of published and unpublished events
- Events in different categories
- Events with different dates

### Quick Test Data Creation
```javascript
// Run in MongoDB shell or create script
// This creates 15 test events
for (let i = 1; i <= 15; i++) {
  db.events.insertOne({
    title: `Test Event ${i}`,
    description: `Description for test event ${i}`,
    startDate: new Date(Date.now() + i * 86400000),
    endDate: new Date(Date.now() + i * 86400000 + 3600000),
    location: `Test Location ${i}`,
    category: ['reunion', 'career', 'workshop'][i % 3],
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}
```

## Success Criteria

All scenarios should pass with:
- ✅ No console errors
- ✅ Correct data displayed
- ✅ Smooth user experience
- ✅ URL stays in sync with state
- ✅ Browser navigation works
- ✅ Filters work with pagination
- ✅ Mobile responsive
- ✅ Accessible

## Troubleshooting

### Pagination not showing
- Check if you have more than 6 events
- Verify events are published (`isPublished: true`)
- Check API response in Network tab

### Wrong events showing
- Verify API response has correct `page` parameter
- Check `skip` calculation in backend
- Verify `totalPages` calculation

### URL not updating
- Check `navigate()` call in `handlePageChange`
- Verify `location.search` is being read
- Check React Router setup

### Page not persisting on refresh
- Verify `useEffect` with `location.search` dependency
- Check `URLSearchParams` parsing
- Ensure `setPage()` is called with URL param
