# Design Document

## Overview

This design document outlines the technical architecture and implementation approach for enhancing the Class Groups feature of the PSDAHS Alumni Platform. The enhancement will create a comprehensive system that automatically assigns members to their graduating class groups, displays all class groups from 2007/2008 to 2024/2025 with visual representation, and provides flexible membership management.

The design builds upon the existing ClassGroup model and user authentication system, extending functionality to support automatic assignment during registration, enhanced visual presentation, and improved member management workflows.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│  • ClassGroupsPage (List View)                              │
│  • ClassGroupDetailPage (Individual Group View)             │
│  • RegisterForm (Enhanced with auto-assignment)             │
│  • ClassGroupCard Component                                 │
│  • MembershipActions Component                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     API Layer                                │
├─────────────────────────────────────────────────────────────┤
│  • POST /api/auth/register (Enhanced)                       │
│  • GET /api/class-groups (List all groups)                  │
│  • GET /api/class-groups/:id (Get specific group)           │
│  • POST /api/class-groups/:id/join                          │
│  • POST /api/class-groups/:id/leave                         │
│  • GET /api/class-groups/:id/members                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
├─────────────────────────────────────────────────────────────┤
│  • classGroupService (Auto-assignment logic)                │
│  • membershipService (Join/Leave operations)                │
│  • imageService (Class photo management)                    │
│  • notificationService (Member notifications)               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                               │
├─────────────────────────────────────────────────────────────┤
│  • ClassGroup Model (Enhanced)                              │
│  • User Model (Enhanced with classGroups array)             │
│  • ClassGroupMember (Embedded in ClassGroup)                │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Registration Flow with Automatic Class Group Assignment**:
   - User submits registration form with graduation year (required field)
   - Backend validates user data including graduation year
   - User account is created in database
   - **IMMEDIATELY** after account creation, auto-assignment service executes:
     - Finds class group matching user's graduation year
     - Adds user to class group's members array with current timestamp
     - Updates user's classGroups array with the assigned group
     - Increments class group's memberCount by 1
     - Marks assignment as active and complete
   - User information (name, profile picture, graduation year) is now visible in class group
   - Welcome notification is sent with class group info
   - User can immediately see their class group on first login

2. **Class Groups Display Flow**:
   - User navigates to Class Groups page
   - Frontend requests all class groups from API
   - Backend retrieves groups with member counts
   - Frontend displays groups in grid/list with photos
   - User's membership status is indicated on each card

3. **Join/Leave Flow**:
   - User clicks Join/Leave button on class group
   - Frontend sends request to API
   - Backend validates membership status
   - Member is added/removed from group
   - Member count is updated
   - Frontend updates UI and shows notification

## Components and Interfaces

### Frontend Components

#### 1. ClassGroupsPage Component

**Purpose**: Main page displaying all class groups from 2007/2008 to 2024/2025

**Props**: None (uses Redux for state management)

**State**:
```javascript
{
  classGroups: Array<ClassGroup>,
  loading: boolean,
  error: string | null,
  filter: 'all' | 'my-groups',
  searchTerm: string,
  sortBy: 'year-desc' | 'year-asc' | 'members-desc'
}
```

**Key Features**:
- Grid/list layout of class group cards
- Filter tabs: "All Groups" and "My Groups"
- Search functionality by class name or year
- Sort options by year or member count
- Responsive design for mobile and desktop

#### 2. ClassGroupDetailPage Component

**Purpose**: Displays detailed information for a specific class group

**Props**:
```javascript
{
  groupId: string  // From URL params
}
```

**State**:
```javascript
{
  classGroup: ClassGroup | null,
  members: Array<User>,
  posts: Array<Post>,
  events: Array<Event>,
  albums: Array<Album>,
  loading: boolean,
  error: string | null,
  activeTab: 'posts' | 'members' | 'events' | 'photos'
}
```

**Key Features**:
- Class photo banner/header
- Class name and graduation year display
- Join/Leave button based on membership status
- Tabbed interface for posts, members, events, photos
- Member list with profile pictures
- Activity feed specific to the class group

#### 3. ClassGroupCard Component

**Purpose**: Reusable card component for displaying class group summary

**Props**:
```javascript
{
  classGroup: ClassGroup,
  isMember: boolean,
  onJoin: (groupId: string) => void,
  onLeave: (groupId: string) => void,
  onClick: (groupId: string) => void
}
```

**UI Elements**:
- Class photo (800x400px, optimized)
- Class name: "Class of YYYY/YY"
- Graduation year badge
- Member count display
- "Member" badge if user is a member
- Join/Leave button
- Hover effects for interactivity

#### 4. MembershipActions Component

**Purpose**: Handles join/leave actions with confirmation dialogs

**Props**:
```javascript
{
  classGroup: ClassGroup,
  isMember: boolean,
  onSuccess: () => void
}
```

**Features**:
- Join button with loading state
- Leave button with confirmation dialog
- Success/error notifications
- Optimistic UI updates

### Automatic Class Group Assignment Service

**Purpose**: Automatically assign new users to their respective class group during account creation based on their graduation year.

**Service Name**: `autoAssignClassGroup`

**Trigger**: Called immediately after user account creation in registration flow

**Input**:
```javascript
{
  userId: ObjectId,
  graduationYear: number,
  userInfo: {
    firstName: string,
    lastName: string,
    email: string,
    profilePicture?: string
  }
}
```

**Process**:
1. **Find Matching Class Group**:
   - Query: `ClassGroup.findOne({ graduationYear: userGraduationYear })`
   - Expected result: Class group for that year (e.g., "Class of 2020/21")

2. **Add User to Class Group**:
   - Push user reference to classGroup.members array
   - Set joinedAt to current timestamp
   - Set isActive to true
   - Set role to 'member'
   - Increment memberCount atomically

3. **Update User Record**:
   - Push class group reference to user.classGroups array
   - Set joinDate to current timestamp
   - Set isActive to true
   - Mark as successfully assigned

4. **Verify Assignment**:
   - Confirm user appears in class group members
   - Confirm class group appears in user's classGroups
   - Confirm memberCount incremented

**Output**:
```javascript
{
  success: boolean,
  assignedGroup: {
    id: string,
    name: string,
    graduationYear: number,
    memberCount: number
  },
  error?: string
}
```

**Error Handling**:
- If class group not found: Log warning, complete registration, notify admin
- If database error: Retry up to 3 times with exponential backoff
- If persistent failure: Queue for manual assignment, notify user

**Performance Requirements**:
- Complete assignment within 1 second
- Use database transaction for atomicity
- Implement optimistic locking to prevent race conditions

### Backend API Endpoints

#### 1. Enhanced Registration Endpoint with Automatic Class Group Assignment

**Endpoint**: `POST /api/auth/register`

**Request Body**:
```javascript
{
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  graduationYear: number,  // REQUIRED field, 2007-2025
  phone?: string
}
```

**Response**:
```javascript
{
  success: true,
  data: {
    user: User,
    token: string,
    assignedClassGroup: {
      id: string,
      name: string,
      graduationYear: number,
      memberCount: number
    }
  },
  message: "Registration successful. You've been added to Class of YYYY/YY"
}
```

**Automatic Assignment Logic (executed within registration transaction)**:
1. Validate user data (firstName, lastName, email, password, graduationYear)
2. Verify graduationYear is within valid range (2007-2025)
3. Create user account in database
4. **IMMEDIATELY execute auto-assignment**:
   - Query ClassGroup collection for group where graduationYear matches user's graduationYear
   - If class group exists:
     - Add new member object to classGroup.members array:
       ```javascript
       {
         user: userId,
         joinedAt: new Date(),
         isActive: true,
         role: 'member'
       }
       ```
     - Increment classGroup.memberCount by 1
     - Add class group reference to user.classGroups array:
       ```javascript
       {
         group: classGroupId,
         joinDate: new Date(),
         isAdmin: false,
         isModerator: false,
         isActive: true
       }
       ```
     - Save both user and classGroup documents
   - If class group doesn't exist, log warning but complete registration
5. Return user data with assigned class group information
6. User's information is now immediately visible in their class group member list

**Transaction Handling**:
- Use MongoDB transaction to ensure atomicity
- If auto-assignment fails, rollback user creation
- Retry logic for transient failures
- Fallback: Complete registration, queue assignment for retry

#### 2. Get All Class Groups

**Endpoint**: `GET /api/class-groups`

**Query Parameters**:
```javascript
{
  filter?: 'all' | 'my-groups',
  search?: string,
  sortBy?: 'year-desc' | 'year-asc' | 'members-desc',
  page?: number,
  limit?: number
}
```

**Response**:
```javascript
{
  success: true,
  data: Array<{
    _id: string,
    name: string,
    description: string,
    graduationYear: number,
    coverImage: string,
    memberCount: number,
    isMember: boolean,  // Based on authenticated user
    isAdmin: boolean,
    motto?: string
  }>,
  pagination: {
    page: number,
    limit: number,
    total: number
  }
}
```

#### 3. Get Class Group Details

**Endpoint**: `GET /api/class-groups/:id`

**Response**:
```javascript
{
  success: true,
  data: {
    _id: string,
    name: string,
    description: string,
    graduationYear: number,
    coverImage: string,
    bannerImage: string,
    memberCount: number,
    postCount: number,
    eventCount: number,
    photoCount: number,
    isMember: boolean,
    isAdmin: boolean,
    motto?: string,
    recentActivity: {
      posts: Array<Post>,
      events: Array<Event>,
      newMembers: Array<User>
    }
  }
}
```

#### 4. Join Class Group

**Endpoint**: `POST /api/class-groups/:id/join`

**Response**:
```javascript
{
  success: true,
  message: "Successfully joined Class of YYYY/YY",
  data: {
    classGroup: ClassGroup,
    memberCount: number
  }
}
```

**Logic**:
1. Verify user is authenticated
2. Check if user is already a member
3. Add user to class group members array
4. Update user's classGroups array
5. Increment member count
6. Send notification to user
7. Return updated class group data

#### 5. Leave Class Group

**Endpoint**: `POST /api/class-groups/:id/leave`

**Response**:
```javascript
{
  success: true,
  message: "Successfully left Class of YYYY/YY",
  data: {
    memberCount: number
  }
}
```

**Logic**:
1. Verify user is authenticated
2. Check if user is a member
3. Mark member as inactive in class group
4. Update user's classGroups array
5. Decrement member count
6. Return updated member count

## Data Models

### Enhanced ClassGroup Model

```javascript
{
  _id: ObjectId,
  name: String,  // "Class of 2020/21"
  description: String,
  graduationYear: Number,  // 2020
  motto: String,  // Optional: "Altiora Tendo" or class-specific motto
  coverImage: String,  // URL to class photo
  bannerImage: String,  // Optional: larger banner image
  
  // Member management
  members: [{
    user: ObjectId (ref: 'User'),
    joinedAt: Date,
    isActive: Boolean,
    role: String  // 'member' | 'moderator'
  }],
  
  admins: [ObjectId (ref: 'User')],
  
  // Counters (denormalized for performance)
  memberCount: Number,
  postCount: Number,
  eventCount: Number,
  photoCount: Number,
  
  // Content
  posts: [PostSchema],
  events: [EventSchema],
  albums: [AlbumSchema],
  
  // Settings
  isPublic: Boolean,
  settings: {
    allowMemberPosts: Boolean,
    requireApproval: Boolean,
    sendNotifications: Boolean
  },
  
  timestamps: true
}
```

### Enhanced User Model

```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  graduationYear: Number,  // Required for auto-assignment
  
  // Class group memberships
  classGroups: [{
    group: ObjectId (ref: 'ClassGroup'),
    joinDate: Date,
    isAdmin: Boolean,
    isModerator: Boolean,
    isActive: Boolean
  }],
  
  // Profile fields
  profilePicture: String,
  bio: String,
  occupation: String,
  company: String,
  
  // System fields
  isAdmin: Boolean,
  isVerified: Boolean,
  lastLogin: Date,
  
  timestamps: true
}
```

### Class Photo Storage

**Storage Strategy**: Use cloud storage (AWS S3, Cloudinary, or similar) for class photos

**File Structure**:
```
/class-photos/
  ├── 2007.jpg
  ├── 2008.jpg
  ├── 2009.jpg
  ...
  └── 2024.jpg
```

**Image Specifications**:
- Format: JPEG, PNG, or WebP
- Dimensions: 1200x600px (2:1 aspect ratio)
- Optimized versions: 800x400px (display), 400x200px (thumbnail)
- Max file size: 2MB
- Compression: 80% quality

## Error Handling

### Registration Auto-Assignment Errors

**Scenario**: Class group not found for graduation year

**Handling**:
- Create user account successfully
- Log warning about missing class group
- Send notification to admin
- Display message to user: "Your account has been created. A class group for your graduation year will be available soon."

**Scenario**: Database error during auto-assignment

**Handling**:
- Complete user registration
- Queue auto-assignment for retry
- Log error for monitoring
- User can manually join later

### Join/Leave Operation Errors

**Scenario**: User tries to join a group they're already in

**Response**:
```javascript
{
  success: false,
  error: "You are already a member of this class group",
  code: "ALREADY_MEMBER"
}
```

**Scenario**: User tries to leave a group they're not in

**Response**:
```javascript
{
  success: false,
  error: "You are not a member of this class group",
  code: "NOT_MEMBER"
}
```

**Scenario**: Network timeout during join/leave

**Handling**:
- Show retry button
- Implement exponential backoff
- Cache operation for offline support
- Display clear error message

### Image Loading Errors

**Scenario**: Class photo fails to load

**Handling**:
- Display placeholder image with class name overlay
- Log error for monitoring
- Retry loading after delay
- Provide fallback gradient background

## Testing Strategy

### Unit Tests

**Backend Services**:
- `classGroupService.autoAssignMember()` - Test auto-assignment logic
- `classGroupService.joinGroup()` - Test join validation and execution
- `classGroupService.leaveGroup()` - Test leave validation and execution
- `classGroupService.updateMemberCount()` - Test counter updates
- `imageService.optimizeClassPhoto()` - Test image processing

**Frontend Components**:
- `ClassGroupCard` - Test rendering with different props
- `MembershipActions` - Test join/leave button states
- `ClassGroupsPage` - Test filtering and sorting
- `ClassGroupDetailPage` - Test data loading and display

### Integration Tests

**Registration Flow**:
1. Submit registration with graduation year 2020
2. Verify user account created
3. Verify user added to "Class of 2020/21"
4. Verify member count incremented
5. Verify welcome notification displayed

**Join Flow**:
1. Navigate to class groups page
2. Click join on a class group
3. Verify API call made
4. Verify member count updated
5. Verify "Member" badge displayed
6. Verify success notification shown

**Leave Flow**:
1. Click leave on a joined class group
2. Verify confirmation dialog appears
3. Confirm leave action
4. Verify API call made
5. Verify member count decremented
6. Verify "Member" badge removed

### End-to-End Tests

**Complete User Journey**:
1. New user registers with graduation year
2. User is auto-assigned to class group
3. User navigates to class groups page
4. User sees their class group marked as "Member"
5. User clicks on their class group
6. User sees class-specific content
7. User joins another class group
8. User leaves the additional class group

**Admin Journey**:
1. Admin uploads class photo for Class of 2020
2. Photo is optimized and stored
3. Photo appears on class group card
4. Photo appears on class group detail page
5. Admin updates class group description
6. Changes reflect immediately

### Performance Tests

**Load Testing**:
- Test class groups page with 18 groups (2007-2024)
- Measure page load time (target: < 2 seconds)
- Test with 1000+ members in a single group
- Measure join/leave operation time (target: < 2 seconds)

**Image Loading**:
- Test loading 18 class photos simultaneously
- Measure time to first contentful paint
- Test lazy loading implementation
- Verify image optimization reduces bandwidth

## Implementation Phases

### Phase 1: Database Setup
- Update ClassGroup model with new fields
- Create migration script for existing groups
- Generate class groups for 2007-2024
- Set up image storage infrastructure

### Phase 2: Backend API
- Enhance registration endpoint with auto-assignment
- Implement join/leave endpoints
- Add member count management
- Implement notification service

### Phase 3: Frontend Components
- Build ClassGroupCard component
- Build ClassGroupsPage with filtering
- Build ClassGroupDetailPage
- Implement MembershipActions component

### Phase 4: Integration
- Connect registration form to auto-assignment
- Integrate join/leave actions
- Add notifications
- Implement error handling

### Phase 5: Testing & Polish
- Run all test suites
- Upload class photos
- Performance optimization
- User acceptance testing

## Security Considerations

**Authentication**:
- All class group operations require authentication
- JWT token validation on every request
- Session management for logged-in users

**Authorization**:
- Members can view public class groups
- Members can join any public class group
- Only members can view full class group content
- Only admins can modify class group settings

**Data Validation**:
- Validate graduation year range (2007-2025)
- Sanitize user inputs to prevent XSS
- Validate image uploads (type, size, dimensions)
- Rate limiting on join/leave operations

**Privacy**:
- Member lists visible only to class group members
- Posts visible only to class group members
- Option to hide profile from non-members
- GDPR compliance for data export/deletion
