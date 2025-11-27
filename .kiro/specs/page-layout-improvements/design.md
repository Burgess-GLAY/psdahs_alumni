# Design Document

## Overview

This design implements a magazine-style layout for the Announcements and Community pages, featuring a horizontal card layout with images positioned on the right and content on the left. The design prioritizes readability, visual balance, and responsive behavior across all device sizes.

## Architecture

### Component Structure

Both pages will maintain their existing component hierarchy but with modified styling:

```
AnnouncementsPage
├── Container (maxWidth="xl")
├── Header Section (Title + Action Button)
├── Tabs Navigation
└── Grid Container
    └── AnnouncementCard (modified layout)
        ├── CardContent (flex container)
        │   ├── Text Section (left, 60%)
        │   │   ├── Header (title, date, tags)
        │   │   ├── Description
        │   │   └── Author Info
        │   └── Image Section (right, 40%)
        └── CardActions (interactions)

CommunityPage
├── Container (maxWidth="xl")
├── Header Section
└── List
    └── PostCard (modified layout)
        ├── CardHeader (author info)
        ├── CardContent (flex container)
        │   ├── Text Section (left, 60%)
        │   └── Image Section (right, 40%)
        └── CardActions (interactions)
```

## Components and Interfaces

### 1. Announcement Card Layout

**Layout Strategy:**
- Use CSS Flexbox for horizontal layout
- Text section: `flex: 0 0 60%` (fixed at 60% width)
- Image section: `flex: 0 0 40%` (fixed at 40% width)
- Gap between sections: 24px

**Styling Properties:**
```javascript
{
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  gap: 3,
  alignItems: 'stretch'
}
```

**Image Container:**
```javascript
{
  flex: { xs: '1 1 auto', md: '0 0 40%' },
  minHeight: { xs: 200, md: 300 },
  maxHeight: { md: 400 },
  overflow: 'hidden',
  borderRadius: 2,
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }
}
```

**Text Container:**
```javascript
{
  flex: { xs: '1 1 auto', md: '0 0 60%' },
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
}
```

### 2. Community Post Card Layout

**Layout Strategy:**
- Similar to announcements but with CardHeader above the content
- Content area uses the same 60/40 split
- Author information remains in CardHeader

**Content Section Styling:**
```javascript
{
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  gap: 3,
  p: 0
}
```

**Post Text Section:**
```javascript
{
  flex: { xs: '1 1 auto', md: '0 0 60%' },
  p: 2
}
```

**Post Image Section:**
```javascript
{
  flex: { xs: '1 1 auto', md: '0 0 40%' },
  minHeight: { xs: 200, md: 250 },
  maxHeight: { md: 350 }
}
```

### 3. Responsive Breakpoints

**Mobile (xs: 0-600px):**
- Stack layout (flexDirection: 'column')
- Image appears first (order: -1)
- Full width for both sections
- Reduced padding and gaps

**Tablet (sm: 600-900px, md: 900-1200px):**
- Transition to horizontal layout at md breakpoint (768px)
- Maintain 60/40 split
- Adjust image heights

**Desktop (lg: 1200px+):**
- Full horizontal layout
- Maximum image heights enforced
- Optimal spacing and padding

## Data Models

No changes to existing data models. The components will continue to use the same data structures:

**Announcement Object:**
```javascript
{
  id: number,
  title: string,
  description: string,
  date: string,
  image: string,
  tags: string[],
  likes: number,
  comments: number,
  author: {
    name: string,
    avatar: string
  }
}
```

**Community Post Object:**
```javascript
{
  id: number,
  user: {
    name: string,
    avatar: string,
    title: string,
    isVerified: boolean
  },
  content: string,
  image: string,
  likes: number,
  comments: number,
  date: Date
}
```

## Error Handling

### Image Loading Failures

1. **Missing Images:**
   - If `image` property is null/undefined, render text-only layout
   - Text section expands to full width
   - No broken image placeholders

2. **Failed Image Loads:**
   - Use `onError` handler on img elements
   - Display alt text
   - Optionally show placeholder icon

3. **Implementation:**
```javascript
const [imageError, setImageError] = useState(false);

<Box sx={{ display: imageError ? 'none' : 'block' }}>
  <img
    src={image}
    alt={title}
    onError={() => setImageError(true)}
  />
</Box>
```

### Layout Edge Cases

1. **Very Long Titles:**
   - Apply text truncation with ellipsis after 2 lines
   - Use CSS: `overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2;`

2. **Very Long Descriptions:**
   - Limit to 4-5 lines on cards
   - Add "Read more" functionality if needed

3. **No Content Scenarios:**
   - Gracefully handle empty arrays
   - Show appropriate empty state messages

## Testing Strategy

### Visual Regression Testing

1. **Desktop Layout (1920x1080):**
   - Verify 60/40 split is maintained
   - Check image aspect ratios
   - Validate spacing and alignment

2. **Tablet Layout (768x1024):**
   - Confirm horizontal layout at breakpoint
   - Test image sizing
   - Verify text readability

3. **Mobile Layout (375x667):**
   - Confirm stacked layout
   - Check image appears above text
   - Validate touch targets

### Functional Testing

1. **Image Loading:**
   - Test with valid images
   - Test with missing images
   - Test with broken image URLs
   - Test with various aspect ratios

2. **Responsive Behavior:**
   - Resize browser from desktop to mobile
   - Verify smooth transitions
   - Check no layout breaks at any size

3. **Accessibility:**
   - Keyboard navigation through cards
   - Screen reader announcement order
   - Focus indicators on interactive elements
   - Color contrast validation

### Browser Compatibility

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

## Implementation Notes

### Material-UI Components Used

- `Card`, `CardContent`, `CardActions`, `CardHeader`, `CardMedia`
- `Box` for flex containers
- `Typography` for text elements
- `Grid` for page-level layout
- `Avatar`, `Chip`, `IconButton` for UI elements

### CSS-in-JS Approach

Use Material-UI's `sx` prop for all styling to maintain consistency with the existing codebase:

```javascript
<Box sx={{
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  gap: 3
}}>
  {/* content */}
</Box>
```

### Performance Considerations

1. **Image Optimization:**
   - Images should be properly sized on the server
   - Consider lazy loading for images below the fold
   - Use appropriate image formats (WebP with fallbacks)

2. **Rendering Performance:**
   - Avoid unnecessary re-renders
   - Use React.memo for card components if needed
   - Maintain existing virtualization if implemented

### Accessibility Features

1. **Semantic HTML:**
   - Maintain proper heading hierarchy
   - Use semantic elements (article, section)

2. **ARIA Labels:**
   - Add aria-labels to icon buttons
   - Ensure alt text on all images

3. **Keyboard Navigation:**
   - Maintain logical tab order
   - Ensure all interactive elements are focusable

4. **Screen Reader Support:**
   - Content announced before images
   - Proper labeling of all interactive elements
