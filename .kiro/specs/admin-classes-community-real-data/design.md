# Design Document

## Overview

This design document outlines the technical approach for transforming the Admin Manage Classes section and Alumni Community page from mock data implementations to fully functional, database-driven features. The solution leverages existing ClassGroup models and introduces a new CommunityPost model to enable real-time user interactions.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│  AdminClassesPage  │  CommunityPage  │  CreatePostDialog    │
│  (Real Data)       │  (Real Posts)   │  (New Component)     │
└──────────┬─────────┴────────┬────────┴──────────┬───────────┘
           │                  │                    │
           ▼                  ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Layer                                │
├─────────────────────────────────────────────────────────────┤
│  /api/class-groups  │  /api/community  │  /api/community/   │
│  (Enhanced)         │  (New)           │  posts (New)       │
└──────────┬──────────┴────────┬─────────┴──────────┬─────────┘
           │                   │                     │
           ▼                   ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                              │
├─────────────────────────────────────────────────────────────┤
│  classGroupService  │  communityService  │  imageService    │
│  (Enhanced)         │  (New)             │  (Existing)      │
└──────────┬──────────┴────────┬────────────┴──────────┬──────┘
           │                   │                        │
           ▼                   ▼                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
├─────────────────────────────────────────────────────────────┤
│  ClassGroup Model   │  CommunityPost Model  │  User Model   │
│  (Enhanced)         │  (New)                │  (Existing)   │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Frontend Components

#### 1. AdminClassesPage (Enhanced)

**Purpose**: Display and manage class groups with real database data

**Key Changes**:
- Remove mock data generation
- Integrate with `/api/class-groups` endpoint
- Remove "Section" and "Class Teacher" fields
- Remove status selection (Active/Inactive/Graduated)
- Display real member counts and student lists
- Add loading and error states

**Component Structure**:
```javascript
AdminClassesPage
├── ClassesTable (displays real class groups)
├── ClassDialog (create/edit without section/teacher/status)
├── StudentListDialog (shows real students per class)
└── LoadingScreen / ErrorAlert
```

**API Integration**:
```javascript
// Fetch real class groups
GET /api/class-groups
Response: { success: true, data: [classGroups] }

// Create new class
POST /api/class-groups
Body: { name, description, graduationYear, coverImage }

// Update class
PUT /api/class-groups/:id
Body: { name, description, coverImage }

// Delete class
DELETE /api/class-groups/:id

// Get class members
GET /api/class-groups/:id/members
Response: { success: true, data: [members] }
```

#### 2. CommunityPage (Complete Rewrite)

**Purpose**: Display real user posts with interaction capabilities

**Key Changes**:
- Remove all mock data
- Fetch posts from `/api/community/posts`
- Display real user profiles (name, photo, graduation year)
- Add post creation interface
- Implement real-time interactions (like, comment, share)
- Add empty state when no posts exist

**Component Structure**:
```javascript
CommunityPage
├── CreatePostCard (authenticated users only)
│   ├── PostTextInput
│   └── ImageUploadButton
├── PostsList
│   └── PostCard (for each post)
│       ├── UserAvatar (real profile picture)
│       ├── UserInfo (real name, graduation year)
│       ├── PostContent (text + optional image)
│       └── PostActions (like, comment, share)
└── EmptyState (when no posts)
```

#### 3. CreatePostDialog (New Component)

**Purpose**: Allow users to create community posts

**Features**:
- Text input with character limit
- Image upload with preview
- Submit button with loading state
- Validation and error handling

**Props**:
```typescript
interface CreatePostDialogProps {
  open: boolean;
  onClose: () => void;
  onPostCreated: (post: CommunityPost) => void;
}
```

### Backend Components

#### 1. CommunityPost Model (New)

**Schema**:
```javascript
const communityPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  image: {
    url: String,
    thumbnailUrl: String,
    caption: String
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
communityPostSchema.index({ createdAt: -1 });
communityPostSchema.index({ author: 1, createdAt: -1 });
communityPostSchema.index({ isPublic: 1, createdAt: -1 });
```

#### 2. Community Routes (New)

**File**: `backend/routes/community.js`

```javascript
// Public routes
GET    /api/community/posts          // Get all public posts
GET    /api/community/posts/:id      // Get single post

// Protected routes (require authentication)
POST   /api/community/posts          // Create new post
PUT    /api/community/posts/:id      // Update own post
DELETE /api/community/posts/:id      // Delete own post
POST   /api/community/posts/:id/like // Like/unlike post
POST   /api/community/posts/:id/comment // Add comment
DELETE /api/community/posts/:postId/comments/:commentId // Delete comment
POST   /api/community/posts/:id/share // Share post

// Admin routes
PUT    /api/community/posts/:id/pin  // Pin/unpin post
DELETE /api/community/posts/:id/admin // Admin delete
```

#### 3. Community Controller (New)

**File**: `backend/controllers/communityController.js`

**Key Functions**:
```javascript
// Get all posts with pagination
exports.getPosts = async (req, res, next) => {
  // Query: page, limit, sort
  // Populate: author (firstName, lastName, profilePicture, graduationYear)
  // Populate: likes.user, comments.user
  // Return: posts with counts
};

// Create new post
exports.createPost = async (req, res, next) => {
  // Validate: content required
  // Handle: image upload if provided
  // Create: post with author = req.user.id
  // Return: created post with populated author
};

// Like/unlike post
exports.toggleLike = async (req, res, next) => {
  // Check: if user already liked
  // Toggle: add or remove like
  // Return: updated like count
};

// Add comment
exports.addComment = async (req, res, next) => {
  // Validate: content required
  // Add: comment with user = req.user.id
  // Return: created comment with populated user
};

// Delete post
exports.deletePost = async (req, res, next) => {
  // Check: user is author or admin
  // Delete: post and associated images
  // Return: success message
};
```

#### 4. Community Service (New)

**File**: `backend/services/communityService.js`

**Key Functions**:
```javascript
// Get posts with filters
exports.getPostsWithFilters = async (filters, options) => {
  // Apply filters: isPublic, author, dateRange
  // Apply pagination and sorting
  // Populate user data
  // Return formatted posts
};

// Create post with image
exports.createPostWithImage = async (userId, postData, imageFile) => {
  // Upload image if provided
  // Create post record
  // Return created post
};

// Get post statistics
exports.getPostStats = async (postId) => {
  // Calculate: likes count, comments count, shares count
  // Return: statistics object
};
```

### Enhanced Backend Components

#### 1. ClassGroup Controller (Enhanced)

**Enhancements**:
- Ensure `getClassGroups` returns real member counts
- Add endpoint to get detailed member list with user profiles
- Remove any status-related logic
- Ensure auto-assignment works correctly

**New Endpoint**:
```javascript
// Get detailed members for admin view
GET /api/class-groups/:id/members/detailed
Response: {
  success: true,
  data: [{
    _id: userId,
    firstName: string,
    lastName: string,
    email: string,
    profilePicture: string,
    graduationYear: number,
    joinedAt: date
  }]
}
```

#### 2. Auth Controller (Enhanced)

**Enhancement**: Ensure auto-assignment to class group on registration

```javascript
// In register function
exports.register = async (req, res, next) => {
  // ... existing user creation ...
  
  // Auto-assign to class group
  if (user.graduationYear) {
    const classGroupService = require('../services/classGroupService');
    await classGroupService.autoAssignToClassGroup(user._id, user.graduationYear);
  }
  
  // ... rest of registration ...
};
```

## Data Models

### CommunityPost Model

```typescript
interface CommunityPost {
  _id: ObjectId;
  author: User;
  content: string;
  image?: {
    url: string;
    thumbnailUrl: string;
    caption?: string;
  };
  likes: Array<{
    user: User;
    createdAt: Date;
  }>;
  comments: Array<{
    _id: ObjectId;
    user: User;
    content: string;
    createdAt: Date;
  }>;
  shares: Array<{
    user: User;
    createdAt: Date;
  }>;
  isPublic: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### ClassGroup Model (Enhanced)

**No Changes to Schema** - Already supports real data

**Usage Clarification**:
- `members` array contains real user references
- `memberCount` is automatically updated
- No status field needed (all classes are active)
- Section and teacher fields not used

## Error Handling

### Frontend Error Handling

**Loading States**:
```javascript
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

// Display LoadingScreen while fetching
if (loading) return <LoadingScreen />;

// Display ErrorAlert on error
if (error) return <ErrorAlert message={error} />;
```

**Empty States**:
```javascript
// For AdminClassesPage
if (classes.length === 0) {
  return <EmptyState message="No classes found. Create your first class!" />;
}

// For CommunityPage
if (posts.length === 0) {
  return <EmptyState message="No posts yet. Be the first to share something!" />;
}
```

### Backend Error Handling

**Validation Errors**:
```javascript
// Post content validation
if (!content || content.trim().length === 0) {
  return next(new ErrorResponse('Post content is required', 400));
}

if (content.length > 5000) {
  return next(new ErrorResponse('Post content exceeds maximum length', 400));
}
```

**Authorization Errors**:
```javascript
// Check post ownership
if (post.author.toString() !== req.user.id && !req.user.isAdmin) {
  return next(new ErrorResponse('Not authorized to modify this post', 403));
}
```

**Database Errors**:
```javascript
try {
  // Database operations
} catch (err) {
  console.error('Database error:', err);
  return next(new ErrorResponse('Server error occurred', 500));
}
```

## Testing Strategy

### Unit Tests

**Backend Tests**:
1. CommunityPost model validation
2. Community controller functions
3. Community service functions
4. ClassGroup member retrieval
5. Auto-assignment logic

**Frontend Tests**:
1. CreatePostDialog component
2. PostCard component rendering
3. AdminClassesPage data fetching
4. CommunityPage data fetching

### Integration Tests

1. **Post Creation Flow**:
   - User creates post with text
   - User creates post with image
   - Post appears in community feed
   - Post shows correct author info

2. **Post Interaction Flow**:
   - User likes post
   - User unlikes post
   - User comments on post
   - User deletes own comment

3. **Admin Class Management Flow**:
   - Admin creates new class
   - Class appears in class groups
   - User registers with graduation year
   - User automatically added to class
   - Admin views class members

4. **Data Consistency**:
   - Member counts are accurate
   - Like counts are accurate
   - Comment counts are accurate
   - No mock data displayed

### Manual Testing Checklist

**Admin Classes**:
- [ ] No mock data displayed
- [ ] Real member counts shown
- [ ] Can create new class
- [ ] Can edit existing class
- [ ] Can delete class
- [ ] Can view real student list
- [ ] No section/teacher fields visible
- [ ] No status fields visible

**Community**:
- [ ] No mock posts displayed
- [ ] Can create text post
- [ ] Can create post with image
- [ ] Real user profiles shown
- [ ] Can like/unlike posts
- [ ] Can comment on posts
- [ ] Can delete own posts
- [ ] Empty state shows when no posts

## Security Considerations

### Authentication & Authorization

1. **Post Creation**: Only authenticated users can create posts
2. **Post Modification**: Only post author or admin can edit/delete
3. **Comment Deletion**: Only comment author or admin can delete
4. **Class Management**: Only admins can create/edit/delete classes
5. **Member Viewing**: Admins can view detailed member information

### Input Validation

1. **Post Content**: Sanitize HTML, limit length, prevent XSS
2. **Image Upload**: Validate file type, size, dimensions
3. **Graduation Year**: Validate 4-digit number, reasonable range
4. **Class Name**: Prevent duplicate names for same year

### Data Privacy

1. **User Profiles**: Only show public profile information
2. **Email Addresses**: Hide from non-admin users
3. **Private Posts**: Respect isPublic flag
4. **Deleted Content**: Permanently remove from database

## Performance Optimization

### Database Optimization

1. **Indexes**: Add indexes on frequently queried fields
   - `CommunityPost.createdAt` (descending)
   - `CommunityPost.author`
   - `ClassGroup.graduationYear`

2. **Pagination**: Implement cursor-based pagination for posts
3. **Aggregation**: Use aggregation pipelines for counts
4. **Caching**: Cache frequently accessed data (class lists)

### Frontend Optimization

1. **Lazy Loading**: Load posts as user scrolls
2. **Image Optimization**: Use thumbnails for list views
3. **Debouncing**: Debounce like/unlike actions
4. **Optimistic Updates**: Update UI before server response

## Migration Strategy

### Phase 1: Backend Setup
1. Create CommunityPost model
2. Create community routes and controller
3. Create community service
4. Add tests for new endpoints

### Phase 2: Frontend Implementation
1. Update AdminClassesPage to use real data
2. Create CreatePostDialog component
3. Rewrite CommunityPage with real data
4. Add loading and error states

### Phase 3: Integration
1. Connect frontend to new endpoints
2. Test auto-assignment on registration
3. Verify data consistency
4. Remove all mock data

### Phase 4: Validation
1. Run all tests
2. Perform manual testing
3. Fix any bugs
4. Deploy to production

## Rollback Plan

If issues arise:
1. Keep old mock data code in separate branch
2. Feature flag to toggle between mock and real data
3. Database backup before migration
4. Quick rollback script available
