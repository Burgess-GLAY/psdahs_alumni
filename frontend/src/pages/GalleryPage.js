
import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Chip,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  CircularProgress,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Card,
  CardContent,
  CardMedia,
  CardActions
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  Image as ImageIcon,
  VideoLibrary as VideoLibraryIcon,
  Collections as CollectionsIcon,
  DateRange as DateRangeIcon,
  Person as PersonIcon,
  Comment as CommentIcon,
  Send as SendIcon,
  EmojiEmotions as EmojiEmotionsIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Sort as SortIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { format } from 'date-fns';
import ReactPlayer from 'react-player';

// Mock data for gallery items
const mockGalleryItems = [
  {
    id: 1,
    type: 'image',
    src: '/images/FIRST REUNION PARADE PICTURE 1.jpeg',
    title: 'First Reunion Parade',
    description: 'Alumni marching together in the first ever reunion parade',
    date: '2023-06-15',
    likes: 124,
    comments: 28,
    downloads: 56,
    isLiked: false,
    tags: ['reunion', 'parade', '2023'],
    user: {
      name: 'Alumni Association',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    }
  },
  {
    id: 2,
    type: 'image',
    src: '/images/FIRST REUNION PARADE PICTURE 2.jpeg',
    title: 'Reunion Parade Celebration',
    description: 'Joyful moments from the reunion parade',
    date: '2023-06-15',
    likes: 98,
    comments: 22,
    downloads: 45,
    isLiked: true,
    tags: ['reunion', 'parade', '2023'],
    user: {
      name: 'Alumni Association',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    }
  },
  {
    id: 3,
    type: 'image',
    src: '/images/FIRST REUNION PARADE PICTURE 3.jpeg',
    title: 'Parade Unity',
    description: 'Alumni showing unity and school spirit',
    date: '2023-06-15',
    likes: 110,
    comments: 18,
    downloads: 38,
    isLiked: false,
    tags: ['reunion', 'parade', 'unity'],
    user: {
      name: 'Alumni Association',
      avatar: 'https://randomuser.me/api/portraits/women/45.jpg'
    }
  },
  {
    id: 4,
    type: 'image',
    src: '/images/‏FIRST REUNION PARADE PICTURE 4.jpeg',
    title: 'Grand Parade Finale',
    description: 'The grand finale of our first reunion parade',
    date: '2023-06-15',
    likes: 132,
    comments: 31,
    downloads: 62,
    isLiked: true,
    tags: ['reunion', 'parade', 'finale'],
    user: {
      name: 'Alumni Association',
      avatar: 'https://randomuser.me/api/portraits/men/33.jpg'
    }
  },
  {
    id: 5,
    type: 'image',
    src: '/images/meet and greet at AUTHENTIC TASTE PICTURE 1.jpeg',
    title: 'Meet & Greet at Authentic Taste',
    description: 'Alumni networking over delicious food',
    date: '2023-08-20',
    likes: 87,
    comments: 15,
    downloads: 29,
    isLiked: false,
    tags: ['networking', 'social', 'food'],
    user: {
      name: 'Events Committee',
      avatar: 'https://randomuser.me/api/portraits/women/46.jpg'
    }
  },
  {
    id: 6,
    type: 'image',
    src: '/images/meet and greet at AUTHENTIC TASTE PICTURE 2.jpeg',
    title: 'Authentic Taste Gathering',
    description: 'Great conversations and connections',
    date: '2023-08-20',
    likes: 76,
    comments: 12,
    downloads: 24,
    isLiked: false,
    tags: ['networking', 'social'],
    user: {
      name: 'Events Committee',
      avatar: 'https://randomuser.me/api/portraits/men/34.jpg'
    }
  },
  {
    id: 7,
    type: 'image',
    src: '/images/meet and greet at AUTHENTIC TASTE PICTURE 3.jpeg',
    title: 'Alumni Bonding',
    description: 'Strengthening alumni bonds over dinner',
    date: '2023-08-20',
    likes: 92,
    comments: 19,
    downloads: 33,
    isLiked: true,
    tags: ['networking', 'bonding'],
    user: {
      name: 'Events Committee',
      avatar: 'https://randomuser.me/api/portraits/women/47.jpg'
    }
  },
  {
    id: 8,
    type: 'image',
    src: '/images/meet and greet at AUTHENTIC TASTE PICTURE 4.jpeg',
    title: 'Social Evening',
    description: 'An evening of laughter and memories',
    date: '2023-08-20',
    likes: 81,
    comments: 14,
    downloads: 27,
    isLiked: false,
    tags: ['social', 'memories'],
    user: {
      name: 'Events Committee',
      avatar: 'https://randomuser.me/api/portraits/men/35.jpg'
    }
  },
  {
    id: 9,
    type: 'image',
    src: '/images/meet and greet at AUTHENTIC TASTE PICTURE 5.jpeg',
    title: 'Networking Success',
    description: 'Building professional connections',
    date: '2023-08-20',
    likes: 95,
    comments: 21,
    downloads: 36,
    isLiked: true,
    tags: ['networking', 'professional'],
    user: {
      name: 'Events Committee',
      avatar: 'https://randomuser.me/api/portraits/women/48.jpg'
    }
  },
  {
    id: 10,
    type: 'image',
    src: '/images/AD ALTIORA TENDO CLASS OF 2019-2020.jpeg',
    title: 'Class of 2019-2020',
    description: 'Ad Altiora Tendo - Striving for Higher Things',
    date: '2020-06-01',
    likes: 156,
    comments: 42,
    downloads: 78,
    isLiked: true,
    tags: ['class', '2019-2020', 'graduation'],
    user: {
      name: 'Class Representative',
      avatar: 'https://randomuser.me/api/portraits/women/49.jpg'
    }
  },
  {
    id: 11,
    type: 'image',
    src: '/images/CLASS OF 2018-209 AT THE REUNION PARADE.jpeg',
    title: 'Class of 2018-2019 at Parade',
    description: 'Class of 2018-2019 representing at the reunion parade',
    date: '2023-06-15',
    likes: 143,
    comments: 38,
    downloads: 71,
    isLiked: false,
    tags: ['class', '2018-2019', 'parade'],
    user: {
      name: 'Class Representative',
      avatar: 'https://randomuser.me/api/portraits/men/36.jpg'
    }
  },
  {
    id: 12,
    type: 'image',
    src: '/images/LEVITES CLASS OF 2009-2010.jpeg',
    title: 'Levites Class of 2009-2010',
    description: 'The Levites batch reunion',
    date: '2023-05-10',
    likes: 128,
    comments: 35,
    downloads: 64,
    isLiked: true,
    tags: ['class', '2009-2010', 'levites'],
    user: {
      name: 'Class Representative',
      avatar: 'https://randomuser.me/api/portraits/women/50.jpg'
    }
  },
  {
    id: 13,
    type: 'image',
    src: '/images/CLASS OF KUKATONOR.jpeg',
    title: 'Class of Kukatonor',
    description: 'Kukatonor class reunion celebration',
    date: '2023-07-22',
    likes: 118,
    comments: 29,
    downloads: 55,
    isLiked: false,
    tags: ['class', 'kukatonor', 'reunion'],
    user: {
      name: 'Class Representative',
      avatar: 'https://randomuser.me/api/portraits/men/37.jpg'
    }
  },
  {
    id: 14,
    type: 'image',
    src: '/images/reunion sport day.jpeg',
    title: 'Alumni Sports Day',
    description: 'Competitive spirit and fun at the alumni sports day',
    date: '2023-09-10',
    likes: 167,
    comments: 45,
    downloads: 82,
    isLiked: true,
    tags: ['sports', 'competition', 'fun'],
    user: {
      name: 'Sports Committee',
      avatar: 'https://randomuser.me/api/portraits/women/51.jpg'
    }
  },
  {
    id: 15,
    type: 'image',
    src: '/images/Incoming reunion shirt.jpeg',
    title: 'Reunion Merchandise',
    description: 'Official reunion t-shirt design',
    date: '2023-05-01',
    likes: 94,
    comments: 18,
    downloads: 41,
    isLiked: false,
    tags: ['merchandise', 'reunion', 'shirt'],
    user: {
      name: 'Merchandise Team',
      avatar: 'https://randomuser.me/api/portraits/men/38.jpg'
    }
  },
  {
    id: 16,
    type: 'image',
    src: '/images/incomin reunion shirt 2.jpeg',
    title: 'Reunion Shirt Design 2',
    description: 'Alternative reunion t-shirt design',
    date: '2023-05-01',
    likes: 88,
    comments: 16,
    downloads: 37,
    isLiked: false,
    tags: ['merchandise', 'reunion', 'shirt'],
    user: {
      name: 'Merchandise Team',
      avatar: 'https://randomuser.me/api/portraits/women/52.jpg'
    }
  },
  {
    id: 17,
    type: 'image',
    src: '/images/PSDAHS ADMISSION FLYER.jpeg',
    title: 'PSDAHS Admission Information',
    description: 'Official admission flyer for prospective students',
    date: '2023-01-15',
    likes: 203,
    comments: 67,
    downloads: 145,
    isLiked: true,
    tags: ['admission', 'information', 'school'],
    user: {
      name: 'School Administration',
      avatar: 'https://randomuser.me/api/portraits/men/39.jpg'
    }
  }
];

// Mock data for comments
const mockComments = [
  {
    id: 1,
    user: 'Juan Dela Cruz',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    text: 'Great memories from this event! Can\'t wait for the next one.',
    date: '2023-06-16T14:32:00',
    likes: 12
  },
  // Add more comments...
];

const GalleryPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'popular', 'oldest'
  const [filterTags, setFilterTags] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(mockComments);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const galleryItems = [...mockGalleryItems]; // In a real app, this would come from an API

  // Filter and sort gallery items
  const filteredItems = galleryItems
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTags = filterTags.length === 0 ||
        filterTags.every(tag => item.tags.includes(tag));
      return matchesSearch && matchesTags;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'popular') return (b.likes || 0) - (a.likes || 0);
      return 0;
    });

  // Handle opening the gallery item modal
  const handleOpenItem = (item, index) => {
    setSelectedItem(item);
    setCurrentIndex(filteredItems.findIndex(i => i.id === item.id));
    setIsPlaying(item.type === 'video');
  };

  // Handle closing the gallery item modal
  const handleCloseItem = () => {
    setSelectedItem(null);
    setZoomLevel(1);
    setIsPlaying(false);
  };

  // Handle navigation between gallery items
  const navigateItems = (direction) => {
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = filteredItems.length - 1;
    if (newIndex >= filteredItems.length) newIndex = 0;

    setCurrentIndex(newIndex);
    setSelectedItem(filteredItems[newIndex]);
    setZoomLevel(1);
    setIsPlaying(filteredItems[newIndex].type === 'video');
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!selectedItem) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCloseItem();
      } else if (e.key === 'ArrowLeft') {
        navigateItems(-1);
      } else if (e.key === 'ArrowRight') {
        navigateItems(1);
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        if (selectedItem.type === 'video') {
          setIsPlaying(prev => !prev);
        }
      } else if (e.key === '+') {
        setZoomLevel(prev => Math.min(prev + 0.1, 3));
      } else if (e.key === '-') {
        setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, currentIndex]);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Handle zoom in/out
  const handleZoom = (direction) => {
    setZoomLevel(prev => {
      const newZoom = direction === 'in' ? prev + 0.1 : prev - 0.1;
      return Math.min(Math.max(newZoom, 0.5), 3); // Limit zoom between 0.5x and 3x
    });
  };

  // Toggle like status for an item
  const toggleLike = (itemId) => {
    // In a real app, this would update the backend
    const updatedItems = galleryItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          isLiked: !item.isLiked,
          likes: item.isLiked ? item.likes - 1 : item.likes + 1
        };
      }
      return item;
    });

    // Update the selected item if it's the one being liked
    if (selectedItem && selectedItem.id === itemId) {
      const updatedItem = updatedItems.find(item => item.id === itemId);
      setSelectedItem(updatedItem);
    }
  };

  // Handle adding a comment
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newComment = {
      id: comments.length + 1,
      user: 'Current User', // In a real app, this would be the logged-in user
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      text: comment,
      date: new Date().toISOString(),
      likes: 0
    };

    setComments([...comments, newComment]);
    setComment('');
  };

  // Handle menu open/close
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle tag click
  const handleTagClick = (tag) => {
    if (filterTags.includes(tag)) {
      setFilterTags(filterTags.filter(t => t !== tag));
    } else {
      setFilterTags([...filterTags, tag]);
    }
  };

  // Get all unique tags from gallery items
  const allTags = [...new Set(galleryItems.flatMap(item => item.tags))];

  return (
    <Box sx={{ py: 4, backgroundColor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: `linear(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textFillColor: 'transparent'
            }}
          >
            Alumni Gallery
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Relive the memories and stay connected with our community
          </Typography>
        </Box>

        {/* Search and Filter Bar */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 4,
            borderRadius: 2,
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder="Search gallery..."
              variant="outlined"
              size="small"
              fullWidth={isMobile}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }
              }}
            />

            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setActiveTab(1)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover'
                }
              }}
            >
              Filters
            </Button>

            <Button
              variant="outlined"
              startIcon={<SortIcon />}
              onClick={handleMenuOpen}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover'
                }
              }}
            >
              Sort: {sortBy === 'recent' ? 'Most Recent' : sortBy === 'popular' ? 'Most Popular' : 'Oldest'}
            </Button>

            <Box sx={{ display: 'flex', ml: 'auto', gap: 1 }}>
              <IconButton
                onClick={() => setViewMode('grid')}
                color={viewMode === 'grid' ? 'primary' : 'default'}
                sx={{
                  borderRadius: 1,
                  backgroundColor: viewMode === 'grid' ? 'action.selected' : 'transparent'
                }}
              >
                <GridViewIcon />
              </IconButton>
              <IconButton
                onClick={() => setViewMode('list')}
                color={viewMode === 'list' ? 'primary' : 'default'}
                sx={{
                  borderRadius: 1,
                  backgroundColor: viewMode === 'list' ? 'action.selected' : 'transparent'
                }}
              >
                <ViewListIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Active filters */}
          {filterTags.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {filterTags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleTagClick(tag)}
                  sx={{
                    borderRadius: 1,
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    '& .MuiChip-deleteIcon': {
                      color: theme.palette.primary.contrastText,
                      '&:hover': {
                        color: theme.palette.primary.light
                      }
                    }
                  }}
                />
              ))}
              <Button
                size="small"
                onClick={() => setFilterTags([])}
                sx={{
                  ml: 1,
                  textTransform: 'none',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline'
                  }
                }}
              >
                Clear all
              </Button>
            </Box>
          )}
        </Paper>

        {/* Tabs for main content and filters */}
        <Box sx={{ width: '100%' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{
              mb: 3,
              '& .MuiTabs-flexContainer': {
                justifyContent: 'flex-start',
                borderBottom: `1px solid ${theme.palette.divider}`
              }
            }}
          >
            <Tab
              label={`Gallery (${filteredItems.length})`}
              icon={<CollectionsIcon />}
              iconPosition="start"
              sx={{
                textTransform: 'none',
                minHeight: 48,
                '&.Mui-selected': {
                  fontWeight: 600
                }
              }}
            />
            <Tab
              label="Filters"
              icon={<FilterListIcon />}
              iconPosition="start"
              sx={{
                textTransform: 'none',
                minHeight: 48,
                '&.Mui-selected': {
                  fontWeight: 600
                }
              }}
            />
          </Tabs>

          {/* Gallery Content */}
          {activeTab === 0 && (
            <Box>
              {filteredItems.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 8,
                    textAlign: 'center'
                  }}
                >
                  <ImageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No items found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
                    Try adjusting your search or filter criteria to find what you're looking for.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterTags([]);
                    }}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    Clear all filters
                  </Button>
                </Box>
              ) : viewMode === 'grid' ? (
                <Grid container spacing={2}>
                  {filteredItems.map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: theme.shadows[1],
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: theme.shadows[4],
                              '& .gallery-item-overlay': {
                                opacity: 1
                              }
                            }
                          }}
                        >
                          <Box
                            sx={{
                              position: 'relative',
                              paddingTop: item.type === 'image' ? '75%' : '56.25%', // 4:3 for images, 16:9 for videos
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                            }}
                            onClick={() => handleOpenItem(item, index)}
                          >
                            {item.type === 'image' ? (
                              <Box
                                component="img"
                                src={item.src}
                                alt={item.title}
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  cursor: 'pointer'
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  backgroundColor: 'black',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer'
                                }}
                              >
                                <ReactPlayer
                                  url={item.src}
                                  width="100%"
                                  height="100%"
                                  controls={false}
                                  light={
                                    <Box sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      background: 'rgba(0,0,0,0.2)'
                                    }}>
                                      <PlayArrowIcon sx={{ fontSize: 64, color: 'white', opacity: 0.9 }} />
                                    </Box>
                                  }
                                  playing={false}
                                />
                              </Box>
                            )}

                            {/* Overlay with info */}
                            <Box
                              className="gallery-item-overlay"
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                color: 'white',
                                padding: 2,
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                                height: '100%',
                                '&:hover': {
                                  opacity: 1
                                }
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: 600,
                                  mb: 0.5,
                                  textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                                }}
                                noWrap
                              >
                                {item.title}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <FavoriteBorderIcon sx={{ fontSize: 16 }} />
                                  <Typography variant="caption">{item.likes}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CommentIcon sx={{ fontSize: 16 }} />
                                  <Typography variant="caption">{item.comments}</Typography>
                                </Box>
                                {item.downloads && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <DownloadIcon sx={{ fontSize: 16 }} />
                                    <Typography variant="caption">{item.downloads}</Typography>
                                  </Box>
                                )}
                                {item.views && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <VisibilityIcon sx={{ fontSize: 16 }} />
                                    <Typography variant="caption">{item.views}</Typography>
                                  </Box>
                                )}
                              </Box>
                              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {item.tags.slice(0, 3).map(tag => (
                                  <Chip
                                    key={tag}
                                    label={`#${tag}`}
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: '0.65rem',
                                      backgroundColor: 'rgba(255,255,255,0.2)',
                                      color: 'white',
                                      '& .MuiChip-label': {
                                        px: 0.75
                                      }
                                    }}
                                  />
                                ))}
                                {item.tags.length > 3 && (
                                  <Chip
                                    label={`+${item.tags.length - 3}`}
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: '0.65rem',
                                      backgroundColor: 'rgba(255,255,255,0.2)',
                                      color: 'white',
                                      '& .MuiChip-label': {
                                        px: 0.75
                                      }
                                    }}
                                  />
                                )}
                              </Box>
                            </Box>

                            {/* Video play button */}
                            {item.type === 'video' && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  width: 60,
                                  height: 60,
                                  borderRadius: '50%',
                                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backdropFilter: 'blur(5px)',
                                  border: '2px solid rgba(255, 255, 255, 0.3)',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    transform: 'translate(-50%, -50%) scale(1.1)'
                                  }
                                }}
                              >
                                <PlayArrowIcon sx={{ fontSize: 32, color: 'white' }} />
                              </Box>
                            )}
                          </Box>

                          <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Avatar
                                src={item.user.avatar}
                                alt={item.user.name}
                                sx={{ width: 32, height: 32, mr: 1 }}
                              />
                              <Box>
                                <Typography variant="body2" fontWeight={500} noWrap>
                                  {item.user.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {format(new Date(item.date), 'MMM d, yyyy')}
                                </Typography>
                              </Box>
                              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLike(item.id);
                                  }}
                                  sx={{
                                    color: item.isLiked ? 'error.main' : 'text.secondary',
                                    '&:hover': {
                                      color: 'error.main',
                                      backgroundColor: 'rgba(244, 67, 54, 0.08)'
                                    }
                                  }}
                                >
                                  {item.isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                                </IconButton>
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: 'text.secondary',
                                    '&:hover': {
                                      color: 'primary.main',
                                      backgroundColor: 'rgba(25, 118, 210, 0.08)'
                                    }
                                  }}
                                >
                                  <ShareIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>

                            <Typography
                              variant="body2"
                              sx={{
                                mb: 1,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {item.description}
                            </Typography>

                            <Box sx={{ mt: 'auto', display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {item.tags.slice(0, 2).map(tag => (
                                <Chip
                                  key={tag}
                                  label={`#${tag}`}
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTagClick(tag);
                                  }}
                                  sx={{
                                    height: 20,
                                    fontSize: '0.65rem',
                                    '& .MuiChip-label': {
                                      px: 0.75
                                    },
                                    backgroundColor: filterTags.includes(tag)
                                      ? theme.palette.primary.main
                                      : theme.palette.action.selected,
                                    color: filterTags.includes(tag)
                                      ? theme.palette.primary.contrastText
                                      : theme.palette.text.primary,
                                    '&:hover': {
                                      backgroundColor: filterTags.includes(tag)
                                        ? theme.palette.primary.dark
                                        : theme.palette.action.hover
                                    }
                                  }}
                                />
                              ))}
                              {item.tags.length > 2 && (
                                <Chip
                                  label={`+${item.tags.length - 2}`}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.65rem',
                                    '& .MuiChip-label': {
                                      px: 0.75
                                    }
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          mb: 2,
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: `1px solid ${theme.palette.divider}`,
                          '&:hover': {
                            boxShadow: theme.shadows[2]
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                          <Box
                            sx={{
                              width: { xs: '100%', sm: 200 },
                              height: { xs: 150, sm: 'auto' },
                              position: 'relative',
                              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleOpenItem(item, index)}
                          >
                            {item.type === 'image' ? (
                              <Box
                                component="img"
                                src={item.src}
                                alt={item.title}
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  backgroundColor: 'black',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <ReactPlayer
                                  url={item.src}
                                  width="100%"
                                  height="100%"
                                  controls={false}
                                  light={
                                    <Box sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      background: 'rgba(0,0,0,0.2)'
                                    }}>
                                      <PlayArrowIcon sx={{ fontSize: 48, color: 'white', opacity: 0.9 }} />
                                    </Box>
                                  }
                                  playing={false}
                                />
                              </Box>
                            )}

                            {item.type === 'video' && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  width: 50,
                                  height: 50,
                                  borderRadius: '50%',
                                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backdropFilter: 'blur(5px)',
                                  border: '2px solid rgba(255, 255, 255, 0.3)',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    transform: 'translate(-50%, -50%) scale(1.1)'
                                  }
                                }}
                              >
                                <PlayArrowIcon sx={{ fontSize: 28, color: 'white' }} />
                              </Box>
                            )}
                          </Box>

                          <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Avatar
                                src={item.user.avatar}
                                alt={item.user.name}
                                sx={{ width: 32, height: 32, mr: 1 }}
                              />
                              <Box>
                                <Typography variant="body2" fontWeight={500}>
                                  {item.user.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {format(new Date(item.date), 'MMM d, yyyy')}
                                </Typography>
                              </Box>
                              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLike(item.id);
                                  }}
                                  sx={{
                                    color: item.isLiked ? 'error.main' : 'text.secondary',
                                    '&:hover': {
                                      color: 'error.main',
                                      backgroundColor: 'rgba(244, 67, 54, 0.08)'
                                    }
                                  }}
                                >
                                  {item.isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                                </IconButton>
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: 'text.secondary',
                                    '&:hover': {
                                      color: 'primary.main',
                                      backgroundColor: 'rgba(25, 118, 210, 0.08)'
                                    }
                                  }}
                                >
                                  <ShareIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>

                            <Typography
                              variant="h6"
                              component="h3"
                              sx={{
                                mb: 1,
                                cursor: 'pointer',
                                '&:hover': {
                                  color: 'primary.main',
                                  textDecoration: 'underline'
                                }
                              }}
                              onClick={() => handleOpenItem(item, index)}
                            >
                              {item.title}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mb: 2,
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {item.description}
                            </Typography>

                            <Box sx={{ mt: 'auto', display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {item.tags.map(tag => (
                                <Chip
                                  key={tag}
                                  label={`#${tag}`}
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTagClick(tag);
                                  }}
                                  sx={{
                                    height: 20,
                                    fontSize: '0.65rem',
                                    '& .MuiChip-label': {
                                      px: 0.75
                                    },
                                    backgroundColor: filterTags.includes(tag)
                                      ? theme.palette.primary.main
                                      : theme.palette.action.selected,
                                    color: filterTags.includes(tag)
                                      ? theme.palette.primary.contrastText
                                      : theme.palette.text.primary,
                                    '&:hover': {
                                      backgroundColor: filterTags.includes(tag)
                                        ? theme.palette.primary.dark
                                        : theme.palette.action.hover
                                    }
                                  }}
                                />
                              ))}
                            </Box>

                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <FavoriteBorderIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {item.likes} likes
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CommentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {item.comments} comments
                                </Typography>
                              </Box>
                              {item.downloads && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <DownloadIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {item.downloads} downloads
                                  </Typography>
                                </Box>
                              )}
                              {item.views && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <VisibilityIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {item.views} views
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    </motion.div>
                  ))}
                </List>
              )}
            </Box>
          )}

          {/* Filters Panel */}
          {activeTab === 1 && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: theme.palette.background.paper
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                Filter Gallery
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Media Type
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    icon={<ImageIcon />}
                    label="Images"
                    variant="outlined"
                    onClick={() => { }}
                    sx={{
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  />
                  <Chip
                    icon={<VideoLibraryIcon />}
                    label="Videos"
                    variant="outlined"
                    onClick={() => { }}
                    sx={{
                      borderRadius: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Sort By
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant={sortBy === 'recent' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setSortBy('recent')}
                    fullWidth
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      borderRadius: 1,
                      ...(sortBy === 'recent' && {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': {
                          backgroundColor: 'primary.dark'
                        }
                      })
                    }}
                  >
                    Most Recent
                  </Button>
                  <Button
                    variant={sortBy === 'popular' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setSortBy('popular')}
                    fullWidth
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      borderRadius: 1,
                      ...(sortBy === 'popular' && {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': {
                          backgroundColor: 'primary.dark'
                        }
                      })
                    }}
                  >
                    Most Popular
                  </Button>
                  <Button
                    variant={sortBy === 'oldest' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setSortBy('oldest')}
                    fullWidth
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      borderRadius: 1,
                      ...(sortBy === 'oldest' && {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': {
                          backgroundColor: 'primary.dark'
                        }
                      })
                    }}
                  >
                    Oldest First
                  </Button>
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {allTags.map(tag => (
                    <Chip
                      key={tag}
                      label={`#${tag}`}
                      size="small"
                      onClick={() => handleTagClick(tag)}
                      variant={filterTags.includes(tag) ? 'filled' : 'outlined'}
                      color={filterTags.includes(tag) ? 'primary' : 'default'}
                      sx={{
                        borderRadius: 1,
                        '& .MuiChip-label': {
                          px: 0.75
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={() => {
                    setFilterTags([]);
                    setSortBy('recent');
                  }}
                  sx={{ borderRadius: 1, textTransform: 'none' }}
                >
                  Reset Filters
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => setActiveTab(0)}
                  sx={{ borderRadius: 1, textTransform: 'none' }}
                >
                  Apply Filters
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      </Container>

      {/* Gallery Item Dialog */}
      <Dialog
        open={!!selectedItem}
        onClose={handleCloseItem}
        maxWidth="lg"
        fullWidth
        fullScreen={isFullscreen}
        PaperProps={{
          sx: {
            m: 0,
            width: '100%',
            maxWidth: 'none',
            height: isFullscreen ? '100vh' : 'auto',
            maxHeight: isFullscreen ? 'none' : '90vh',
            borderRadius: isFullscreen ? 0 : 2,
            overflow: 'hidden',
            backgroundColor: theme.palette.background.default
          }
        }}
      >
        {selectedItem && (
          <>
            <DialogTitle sx={{
              p: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: theme.palette.background.paper
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  src={selectedItem.user.avatar}
                  alt={selectedItem.user.name}
                  sx={{ width: 40, height: 40, mr: 1.5 }}
                />
                <Box>
                  <Typography variant="subtitle1" fontWeight={500}>
                    {selectedItem.user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(selectedItem.date), 'MMMM d, yyyy')}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <IconButton
                  onClick={toggleFullscreen}
                  size="small"
                  sx={{ mr: 1 }}
                >
                  {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
                <IconButton
                  onClick={handleCloseItem}
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>

            <DialogContent
              sx={{
                p: 0,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                overflow: 'hidden',
                backgroundColor: theme.palette.background.default
              }}
            >
              {/* Media Viewer */}
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: { xs: 2, md: 4 },
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: { xs: 300, md: 500 },
                  maxHeight: 'calc(100vh - 200px)'
                }}
              >
                {selectedItem.type === 'image' ? (
                  <Box
                    component="img"
                    src={selectedItem.src}
                    alt={selectedItem.title}
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      borderRadius: 1,
                      boxShadow: theme.shadows[4],
                      transform: `scale(${zoomLevel})`,
                      transition: 'transform 0.3s ease',
                      cursor: zoomLevel > 1 ? 'grab' : 'default',
                      '&:active': {
                        cursor: zoomLevel > 1 ? 'grabbing' : 'default'
                      }
                    }}
                    onMouseDown={(e) => {
                      if (zoomLevel <= 1) return;

                      const startX = e.clientX;
                      const startY = e.clientY;
                      const startScrollLeft = e.currentTarget.scrollLeft;
                      const startScrollTop = e.currentTarget.scrollTop;

                      const handleMouseMove = (e) => {
                        const x = e.clientX - startX;
                        const y = e.clientY - startY;
                        e.currentTarget.scrollLeft = startScrollLeft - x;
                        e.currentTarget.scrollTop = startScrollTop - y;
                      };

                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };

                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'black',
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: 1,
                      '& video': {
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }
                    }}
                  >
                    <ReactPlayer
                      url={selectedItem.src}
                      width="100%"
                      height="100%"
                      playing={isPlaying}
                      controls={true}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setIsPlaying(false)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                    />

                    {!isPlaying && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(0, 0, 0, 0.3)',
                          cursor: 'pointer',
                          zIndex: 1
                        }}
                        onClick={() => setIsPlaying(true)}
                      >
                        <IconButton
                          sx={{
                            width: 80,
                            height: 80,
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(5px)',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.3)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <PlayArrowIcon sx={{ fontSize: 48, color: 'white' }} />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Navigation Arrows */}
                {filteredItems.length > 1 && (
                  <>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateItems(-1);
                      }}
                      sx={{
                        position: 'absolute',
                        left: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.7)'
                        },
                        zIndex: 2
                      }}
                    >
                      <NavigateBeforeIcon />
                    </IconButton>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateItems(1);
                      }}
                      sx={{
                        position: 'absolute',
                        right: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.7)'
                        },
                        zIndex: 2
                      }}
                    >
                      <NavigateNextIcon />
                    </IconButton>
                  </>
                )}

                {/* Zoom Controls */}
                {selectedItem.type === 'image' && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      borderRadius: 4,
                      p: 0.5,
                      zIndex: 2
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => handleZoom('out')}
                      disabled={zoomLevel <= 0.5}
                      sx={{ color: 'white' }}
                    >
                      <ZoomOutIcon />
                    </IconButton>
                    <Typography variant="body2" sx={{ color: 'white', mx: 1, minWidth: 40, textAlign: 'center' }}>
                      {Math.round(zoomLevel * 100)}%
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleZoom('in')}
                      disabled={zoomLevel >= 3}
                      sx={{ color: 'white' }}
                    >
                      <ZoomInIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>

              {/* Sidebar */}
              <Box
                sx={{
                  width: { xs: '100%', md: 350 },
                  display: 'flex',
                  flexDirection: 'column',
                  borderLeft: { xs: 'none', md: `1px solid ${theme.palette.divider}` },
                  borderTop: { xs: `1px solid ${theme.palette.divider}`, md: 'none' },
                  backgroundColor: theme.palette.background.paper,
                  overflow: 'hidden'
                }}
              >
                {/* Item Info */}
                <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                      {selectedItem.title}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => toggleLike(selectedItem.id)}
                        sx={{
                          color: selectedItem.isLiked ? 'error.main' : 'text.secondary',
                          '&:hover': {
                            color: 'error.main',
                            backgroundColor: 'rgba(244, 67, 54, 0.08)'
                          }
                        }}
                      >
                        {selectedItem.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </IconButton>
                      <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <ShareIcon />
                      </IconButton>
                      <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <BookmarkBorderIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {selectedItem.description}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
                    {selectedItem.tags.map(tag => (
                      <Chip
                        key={tag}
                        label={`#${tag}`}
                        size="small"
                        onClick={() => {
                          handleTagClick(tag);
                          handleCloseItem();
                        }}
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          '& .MuiChip-label': {
                            px: 0.75
                          },
                          backgroundColor: filterTags.includes(tag)
                            ? theme.palette.primary.main
                            : theme.palette.action.selected,
                          color: filterTags.includes(tag)
                            ? theme.palette.primary.contrastText
                            : theme.palette.text.primary,
                          '&:hover': {
                            backgroundColor: filterTags.includes(tag)
                              ? theme.palette.primary.dark
                              : theme.palette.action.hover
                          }
                        }}
                      />
                    ))}
                  </Box>

                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <FavoriteBorderIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {selectedItem.likes} likes
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CommentIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {selectedItem.comments} comments
                      </Typography>
                    </Box>
                    {selectedItem.downloads && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <DownloadIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {selectedItem.downloads} downloads
                        </Typography>
                      </Box>
                    )}
                    {selectedItem.views && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <VisibilityIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {selectedItem.views} views
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Comments Section */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, px: 1 }}>
                    Comments ({comments.length})
                  </Typography>

                  {comments.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      <CommentIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                      <Typography variant="body2">No comments yet. Be the first to comment!</Typography>
                    </Box>
                  ) : (
                    <List sx={{ width: '100%', p: 0 }}>
                      {comments.map((comment, index) => (
                        <React.Fragment key={comment.id}>
                          <ListItem
                            alignItems="flex-start"
                            sx={{
                              px: 1,
                              py: 1.5,
                              borderRadius: 1,
                              '&:hover': {
                                backgroundColor: 'action.hover'
                              }
                            }}
                          >
                            <ListItemAvatar sx={{ minWidth: 40, mt: 0.5 }}>
                              <Avatar
                                src={comment.avatar}
                                alt={comment.user}
                                sx={{ width: 32, height: 32 }}
                              />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      fontWeight: 500,
                                      mr: 1
                                    }}
                                  >
                                    {comment.user}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDistanceToNow(new Date(comment.date), { addSuffix: true })}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: 'text.primary',
                                    whiteSpace: 'pre-line',
                                    wordBreak: 'break-word'
                                  }}
                                >
                                  {comment.text}
                                </Typography>
                              }
                              disableTypography
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                size="small"
                                sx={{ color: 'text.secondary' }}
                              >
                                <FavoriteBorderIcon fontSize="small" />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                          {index < comments.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </Box>

                {/* Add Comment */}
                <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                  <Box component="form" onSubmit={handleAddComment} sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Add a comment..."
                      size="small"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      InputProps={{
                        sx: { borderRadius: 4 },
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small">
                              <EmojiEmotionsIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="small"
                      disabled={!comment.trim()}
                      sx={{
                        borderRadius: 4,
                        minWidth: 'auto',
                        px: 2,
                        '& .MuiButton-startIcon': {
                          mr: 0
                        }
                      }}
                    >
                      <SendIcon fontSize="small" />
                    </Button>
                  </Box>
                </Box>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 1, backgroundColor: theme.palette.background.paper }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 'auto' }}>
                <Typography variant="caption" color="text.secondary">
                  {currentIndex + 1} of {filteredItems.length}
                </Typography>
              </Box>

              <Button
                startIcon={<DownloadIcon />}
                size="small"
                sx={{ textTransform: 'none' }}
              >
                Download
              </Button>

              <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Save to Collection
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Menu for sort options */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => {
            setSortBy('recent');
            handleMenuClose();
          }}
          selected={sortBy === 'recent'}
        >
          Most Recent
        </MenuItem>
        <MenuItem
          onClick={() => {
            setSortBy('popular');
            handleMenuClose();
          }}
          selected={sortBy === 'popular'}
        >
          Most Popular
        </MenuItem>
        <MenuItem
          onClick={() => {
            setSortBy('oldest');
            handleMenuClose();
          }}
          selected={sortBy === 'oldest'}
        >
          Oldest First
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default GalleryPage;
