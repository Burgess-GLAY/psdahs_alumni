# Featured Events - Admin Guide

## What Are Featured Events?

Featured events are events that you (as an admin) choose to highlight on the homepage. Only **3 featured events** will display on the homepage at any time, showing the most important upcoming events to visitors.

## How It Works

### For Visitors (Homepage)
- The homepage shows up to 3 featured upcoming events
- If no events are featured, it automatically shows the next 3 upcoming events
- Only published, future events appear

### For Admins (Manage Events)
- You control which events are featured using a simple star icon
- Click the star to feature/unfeature any event
- Featured events show a filled star (⭐)
- Non-featured events show an empty star (☆)

## Step-by-Step Guide

### To Feature an Event on Homepage:

1. **Log in as Admin**
   - Go to your admin dashboard

2. **Navigate to Manage Events**
   - Click "Manage Events" in the admin menu

3. **Find the Event**
   - Look through your events list
   - Find the event you want to feature

4. **Click the Star Icon**
   - In the "Featured" column, click the empty star (☆)
   - The star will fill (⭐) indicating it's now featured
   - You'll see a success message

5. **Check the Homepage**
   - Visit the homepage to see your featured event
   - It will appear in the "Upcoming Events" section

### To Remove an Event from Homepage:

1. **Go to Manage Events**
2. **Find the Featured Event**
   - Look for events with a filled star (⭐)
3. **Click the Filled Star**
   - The star will become empty (☆)
   - The event is removed from homepage featured section
4. **Done!**
   - The event is still published and visible on the Events page
   - It just won't be featured on the homepage anymore

## Important Rules

### Maximum 3 Featured Events
- Only 3 events can be featured on the homepage at once
- If you feature a 4th event, all 4 will be marked as featured
- But the homepage will only show the first 3 (by order and date)

### Only Upcoming Events Show
- Past events won't appear on homepage even if featured
- The system automatically filters to show only future events
- This keeps the homepage fresh and relevant

### Only Published Events
- Draft events cannot be featured on homepage
- Make sure to publish an event before featuring it

## Quick Reference

| Icon | Meaning | Action |
|------|---------|--------|
| ☆ | Not Featured | Click to feature on homepage |
| ⭐ | Featured | Click to remove from homepage |

## Troubleshooting

### "No events showing on homepage"
**Solution**: Feature some upcoming events
1. Go to Manage Events
2. Click the star icon next to 1-3 upcoming events
3. Refresh the homepage

### "I featured an event but it's not showing"
**Possible reasons**:
- Event is in the past (only upcoming events show)
- Event is not published (check Status column)
- More than 3 events are featured (only first 3 show)

**Solution**:
- Make sure event date is in the future
- Make sure event status is not "Draft"
- Unfeature some events if you have more than 3

### "Homepage shows different events than I featured"
**Reason**: If no events are featured, the homepage automatically shows the next 3 upcoming events as a fallback.

**Solution**: Feature the specific events you want to display.

## Command Line Tools (For Developers)

### Check Featured Events Status
```bash
node backend/scripts/testFeaturedEndpoint.js
```
Shows:
- How many events are featured
- Which events will appear on homepage
- Available events that could be featured

### Auto-Feature Next 3 Upcoming Events
```bash
node backend/scripts/featureExistingEvents.js
```
Automatically features the next 3 upcoming published events.

## API Endpoints (For Developers)

### Get Featured Events
```
GET /api/events/featured?limit=3
```
Returns the featured events for homepage (public endpoint).

### Toggle Featured Status
```
PUT /api/events/:id/featured
```
Toggles whether an event is featured (admin only).

## Best Practices

### 1. Keep It Fresh
- Update featured events regularly
- Remove past events from featured
- Feature upcoming events that are most important

### 2. Feature Important Events
- Major reunions
- Registration deadlines approaching
- Special announcements
- High-priority events

### 3. Use All 3 Slots
- Try to always have 3 events featured
- This makes the homepage more engaging
- Shows visitors there's always something happening

### 4. Check Regularly
- Review featured events weekly
- Update as events pass or new events are added
- Keep the homepage current

## Example Workflow

**Monthly Event Management**:

1. **Beginning of Month**
   - Review all upcoming events
   - Feature the 3 most important events for the month
   
2. **Mid-Month**
   - Check if any featured events have passed
   - Replace with new upcoming events
   
3. **End of Month**
   - Plan next month's featured events
   - Update featured status accordingly

## Summary

The featured events system gives you complete control over what appears on the homepage. It's designed to be simple:

- ✅ Click star to feature
- ✅ Click star again to unfeature
- ✅ Max 3 events on homepage
- ✅ Only upcoming events show
- ✅ Automatic fallback if none featured

This ensures visitors always see the most relevant, important events when they visit your site!

---

**Need Help?** Contact your system administrator or check the technical documentation in `FEATURED_EVENTS_IMPLEMENTATION.md`.
