import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Button,
  Skeleton,
  Paper,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Favorite as LikeIcon,
  Comment as CommentIcon,
  PersonAdd as FollowIcon,
  Share as ShareIcon,
  Event as EventIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  MoreVert as MoreVertIcon,
  MarkEmailRead as MarkReadIcon,
  NotificationsOff as MuteIcon,
  Block as BlockIcon,
  Person as PersonIcon,
  Group as GroupAddIcon,
  EventAvailable as EventAvailableIcon,
  ThumbUp as ThumbUpIcon,
  ChatBubble as ChatBubbleIcon,
  Reply as ReplyIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

// Mock notification service - replace with actual API calls
const notificationService = {
  getNotifications: async () => {
    // In a real app, this would be an API call
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            type: 'like',
            user: {
              id: 'user1',
              name: 'John Doe',
              avatar: '/images/avatars/user1.jpg'
            },
            post: {
              id: 'post1',
              preview: 'Check out our latest updates!',
              image: '/images/posts/post1.jpg'
            },
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
          },
          {
            id: '2',
            type: 'comment',
            user: {
              id: 'user2',
              name: 'Jane Smith',
              avatar: '/images/avatars/user2.jpg'
            },
            post: {
              id: 'post2',
              preview: 'This is a great post!',
              image: null
            },
            comment: "I really enjoyed reading this. Thanks for sharing!",
            read: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
          },
          {
            id: '3',
            type: 'new_follower',
            user: {
              id: 'user3',
              name: 'Alex Johnson',
              avatar: '/images/avatars/user3.jpg'
            },
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
          },
          {
            id: '4',
            type: 'event_reminder',
            event: {
              id: 'event1',
              title: 'Alumni Reunion 2023',
              date: '2023-12-15T18:00:00Z',
              location: 'Grand Ballroom, City Center'
            },
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
          },
          {
            id: '5',
            type: 'group_join_request',
            user: {
              id: 'user4',
              name: 'Sarah Williams',
              avatar: '/images/avatars/user4.jpg'
            },
            group: {
              id: 'group1',
              name: 'Class of 2015'
            },
            read: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
          }
        ]);
      }, 800);
    });
  },
  
  markAsRead: async (notificationId) => {
    // In a real app, this would be an API call
    console.log(`Marking notification ${notificationId} as read`);
    return new Promise(resolve => setTimeout(resolve, 300));
  },
  
  markAllAsRead: async () => {
    // In a real app, this would be an API call
    console.log('Marking all notifications as read');
    return new Promise(resolve => setTimeout(resolve, 500));
  },
  
  deleteNotification: async (notificationId) => {
    // In a real app, this would be an API call
    console.log(`Deleting notification ${notificationId}`);
    return new Promise(resolve => setTimeout(resolve, 300));
  }
};

const NotificationItem = ({ notification, onMarkAsRead, onDelete, onMenuClick }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    if (onMenuClick) onMenuClick(notification.id);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleMarkAsRead = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    handleMenuClose();
  };
  
  const handleDelete = () => {
    onDelete(notification.id);
    handleMenuClose();
  };
  
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'like':
        return <ThumbUpIcon color="primary" />;
      case 'comment':
        return <ChatBubbleIcon color="secondary" />;
      case 'reply':
        return <ReplyIcon color="info" />;
      case 'new_follower':
        return <PersonAddIcon color="success" />;
      case 'event_reminder':
        return <EventAvailableIcon color="warning" />;
      case 'group_join_request':
        return <GroupAddIcon color="info" />;
      default:
        return <NotificationsIcon />;
    }
  };
  
  const getNotificationText = () => {
    const userName = notification.user?.name || 'Someone';
    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
    
    switch (notification.type) {
      case 'like':
        return (
          <>
            <strong>{userName}</strong> liked your post: "{notification.post?.preview || 'Post'}"
            <Typography variant="caption" display="block" color="textSecondary">
              {timeAgo}
            </Typography>
          </>
        );
      case 'comment':
        return (
          <>
            <strong>{userName}</strong> commented on your post: "{notification.comment}"
            <Typography variant="caption" display="block" color="textSecondary">
              {timeAgo}
            </Typography>
          </>
        );
      case 'reply':
        return (
          <>
            <strong>{userName}</strong> replied to your comment: "{notification.comment}"
            <Typography variant="caption" display="block" color="textSecondary">
              {timeAgo}
            </Typography>
          </>
        );
      case 'new_follower':
        return (
          <>
            <strong>{userName}</strong> started following you
            <Typography variant="caption" display="block" color="textSecondary">
              {timeAgo}
            </Typography>
          </>
        );
      case 'event_reminder':
        return (
          <>
            <strong>Reminder:</strong> {notification.event?.title} is coming up soon!
            <Typography variant="caption" display="block" color="textSecondary">
              {timeAgo}
            </Typography>
          </>
        );
      case 'group_join_request':
        return (
          <>
            <strong>{userName}</strong> wants to join {notification.group?.name}
            <Typography variant="caption" display="block" color="textSecondary">
              {timeAgo}
            </Typography>
          </>
        );
      default:
        return 'New notification';
    }
  };
  
  const getNotificationLink = () => {
    if (notification.post) {
      return `/posts/${notification.post.id}`;
    } else if (notification.event) {
      return `/events/${notification.event.id}`;
    } else if (notification.group) {
      return `/groups/${notification.group.id}`;
    } else if (notification.user) {
      return `/profile/${notification.user.id}`;
    }
    return '#';
  };
  
  return (
    <>
      <ListItem 
        button 
        component={Link} 
        to={getNotificationLink()}
        sx={{
          bgcolor: notification.read ? 'background.paper' : 'action.hover',
          borderLeft: !notification.read ? `3px solid ${theme => theme.palette.primary.main}` : '3px solid transparent',
          transition: 'background-color 0.2s',
          '&:hover': {
            bgcolor: 'action.selected',
          },
          pr: 1,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <ListItemAvatar>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Box
                sx={{
                  bgcolor: notification.read ? 'grey.500' : 'primary.main',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  border: `2px solid ${theme => theme.palette.background.paper}`,
                }}
              />
            }
          >
            <Avatar 
              src={notification.user?.avatar} 
              alt={notification.user?.name}
              sx={{ 
                bgcolor: 'primary.light',
                width: 48, 
                height: 48,
                '& .MuiSvgIcon-root': {
                  fontSize: 24,
                },
              }}
            >
              {!notification.user?.avatar && getNotificationIcon()}
            </Avatar>
          </Badge>
        </ListItemAvatar>
        
        <ListItemText 
          primary={
            <Box 
              component="span" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                '& .MuiSvgIcon-root': {
                  fontSize: '1rem',
                  ml: 0.5,
                  color: 'text.secondary',
                },
              }}
            >
              {getNotificationText()}
            </Box>
          }
          primaryTypographyProps={{
            variant: 'body2',
            component: 'div',
          }}
        />
        
        {(isHovered || anchorEl) && (
          <IconButton 
            size="small" 
            onClick={handleMenuClick}
            sx={{ 
              alignSelf: 'flex-start',
              mt: 0.5,
              opacity: isHovered || anchorEl ? 1 : 0,
              transition: 'opacity 0.2s',
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        )}
      </ListItem>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {!notification.read && (
          <MenuItem onClick={handleMarkAsRead}>
            <ListItemIcon>
              <MarkReadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as read</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete notification</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemIcon>
            <MuteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mute this type</ListItemText>
        </MenuItem>
        {notification.user && (
          <MenuItem>
            <ListItemIcon>
              <BlockIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Block user</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const open = Boolean(anchorEl);
  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await notificationService.getNotifications();
        setNotifications(data);
        const unread = data.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Poll for new notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      setNotifications(prev => 
        prev.map(n => ({
          ...n,
          read: true
        }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      setNotifications(prev => 
        prev.filter(n => n.id !== notificationId)
      );
      
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  const handleClearAll = () => {
    // In a real app, you might want to confirm this action
    notifications.forEach(n => handleDelete(n.id));
  };
  
  return (
    <>
      <Tooltip title="Notifications">
        <IconButton 
          color="inherit" 
          onClick={handleClick}
          aria-label={`${unreadCount} unread notifications`}
          aria-controls="notifications-menu"
          aria-haspopup="true"
          sx={{
            position: 'relative',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <Badge 
            badgeContent={unreadCount} 
            color="error"
            overlap="circular"
            invisible={unreadCount === 0}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      
      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: {
            width: 400,
            maxWidth: '100%',
            maxHeight: '70vh',
            overflowY: 'auto',
            '& .MuiList-root': {
              p: 0,
            },
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        MenuListProps={{
          'aria-labelledby': 'notifications-button',
        }}
      >
        <Box 
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <Typography variant="h6" component="div">
            Notifications {unreadCount > 0 && `(${unreadCount} new)`}
          </Typography>
          
          <Box>
            <Tooltip title="Mark all as read">
              <IconButton 
                size="small" 
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                <MarkReadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Clear all">
              <IconButton 
                size="small" 
                onClick={handleClearAll}
                disabled={notifications.length === 0}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Box sx={{ width: '100%' }}>
          {loading ? (
            // Skeleton loaders while loading
            Array(4).fill().map((_, index) => (
              <Box key={index} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="80%" height={20} />
                  <Skeleton variant="text" width="60%" height={16} />
                </Box>
              </Box>
            ))
          ) : notifications.length > 0 ? (
            // Notifications list
            <List disablePadding>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </List>
          ) : (
            // Empty state
            <Box 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                color: 'text.secondary',
              }}
            >
              <NotificationsIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
              <Typography variant="body1" gutterBottom>
                No notifications yet
              </Typography>
              <Typography variant="body2">
                When you get notifications, they'll appear here
              </Typography>
            </Box>
          )}
        </Box>
        
        {notifications.length > 0 && (
          <Box 
            sx={{ 
              p: 1, 
              textAlign: 'center',
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              position: 'sticky',
              bottom: 0,
            }}
          >
            <Button 
              component={Link}
              to="/notifications"
              color="primary"
              size="small"
              onClick={handleClose}
            >
              View all notifications
            </Button>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default Notifications;
