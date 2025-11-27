import React, { useState } from 'react';
import { 
  Box, 
  IconButton, 
  Tooltip, 
  Popover, 
  Typography,
  Fade
} from '@mui/material';
import {
  ThumbUp,
  Favorite,
  Mood,
  SentimentSatisfied,
  SentimentVerySatisfied,
  SentimentDissatisfied,
  SentimentVeryDissatisfied
} from '@mui/icons-material';

const REACTIONS = [
  { type: 'like', label: 'Like', icon: <ThumbUp fontSize="small" color="primary" /> },
  { type: 'love', label: 'Love', icon: <Favorite fontSize="small" sx={{ color: '#e91e63' }} /> },
  { type: 'haha', label: 'Haha', icon: <Mood fontSize="small" sx={{ color: '#ff9800' }} /> },
  { type: 'wow', label: 'Wow', icon: <SentimentSatisfied fontSize="small" sx={{ color: '#ffc107' }} /> },
  { type: 'sad', label: 'Sad', icon: <SentimentDissatisfied fontSize="small" sx={{ color: '#ffeb3b' }} /> },
  { type: 'angry', label: 'Angry', icon: <SentimentVeryDissatisfied fontSize="small" sx={{ color: '#f44336' }} /> },
];

const ReactionMenu = ({ 
  onSelect, 
  currentReaction,
  size = 'medium',
  showText = true,
  buttonProps = {}
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoveredReaction, setHoveredReaction] = useState(null);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleReactionSelect = (type) => {
    onSelect(type);
    handleClose();
  };
  
  const open = Boolean(anchorEl);
  const id = open ? 'reaction-menu-popover' : undefined;
  
  // Get the current reaction data if it exists
  const currentReactionData = REACTIONS.find(r => r.type === currentReaction);
  
  // Determine which icon to show on the button
  const buttonIcon = currentReactionData ? (
    React.cloneElement(currentReactionData.icon, { 
      fontSize: size,
      sx: { 
        color: currentReactionData.type === 'like' ? 'primary.main' : 
              currentReactionData.type === 'love' ? '#e91e63' :
              currentReactionData.type === 'haha' ? '#ff9800' :
              currentReactionData.type === 'wow' ? '#ffc107' :
              currentReactionData.type === 'sad' ? '#ffeb3b' : '#f44336'
      }
    })
  ) : (
    <ThumbUp fontSize={size} />
  );
  
  const buttonText = currentReactionData ? 
    currentReactionData.label : 
    (showText ? 'Like' : '');
  
  return (
    <>
      <Box 
        display="flex" 
        alignItems="center"
        onMouseEnter={handleClick}
        sx={{ cursor: 'pointer' }}
        {...buttonProps}
      >
        <IconButton 
          size={size}
          aria-describedby={id}
          sx={{
            color: currentReaction ? 'primary.main' : 'text.secondary',
            '&:hover': {
              color: 'primary.main',
              bgcolor: 'action.hover',
            },
            ...(buttonProps.sx || {})
          }}
        >
          {buttonIcon}
        </IconButton>
        {showText && (
          <Typography 
            variant="body2" 
            color={currentReaction ? 'primary' : 'text.secondary'}
            sx={{ ml: 0.5 }}
          >
            {buttonText}
          </Typography>
        )}
      </Box>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        sx={{
          '& .MuiPaper-root': {
            bgcolor: 'transparent',
            boxShadow: 'none',
            overflow: 'visible',
          },
        }}
        disableRestoreFocus
        disableScrollLock
      >
        <Fade in={open} timeout={200}>
          <Box 
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 28,
              p: 0.5,
              boxShadow: 1,
              display: 'flex',
              alignItems: 'center',
              '&:hover': {
                '& .reaction-option': {
                  transform: 'scale(1.2)',
                  transition: 'transform 0.2s',
                },
              },
            }}
          >
            {REACTIONS.map((reaction) => {
              const isHovered = hoveredReaction === reaction.type;
              const isCurrent = currentReaction === reaction.type;
              
              return (
                <Tooltip 
                  key={reaction.type} 
                  title={reaction.label} 
                  placement="top"
                  arrow
                >
                  <Box
                    className="reaction-option"
                    sx={{
                      p: 1,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      transform: isHovered ? 'scale(1.5)' : 'scale(1)',
                      transition: 'transform 0.2s',
                      position: 'relative',
                      '&:hover': {
                        transform: 'scale(1.5)',
                        zIndex: 1,
                        '& .reaction-label': {
                          opacity: 1,
                          visibility: 'visible',
                          transform: 'translateY(0)',
                        },
                      },
                    }}
                    onMouseEnter={() => setHoveredReaction(reaction.type)}
                    onMouseLeave={() => setHoveredReaction(null)}
                    onClick={() => handleReactionSelect(reaction.type)}
                  >
                    <Box 
                      sx={{
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        bgcolor: isCurrent ? 'action.selected' : 'transparent',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      {React.cloneElement(reaction.icon, {
                        sx: {
                          fontSize: 28,
                          transition: 'all 0.2s',
                          transform: isHovered ? 'scale(1.5)' : 'scale(1)',
                        },
                      })}
                    </Box>
                    
                    <Box 
                      className="reaction-label"
                      sx={{
                        position: 'absolute',
                        bottom: '100%',
                        left: '50%',
                        transform: 'translateX(-50%) translateY(10px)',
                        bgcolor: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        whiteSpace: 'nowrap',
                        opacity: 0,
                        visibility: 'hidden',
                        transition: 'all 0.2s',
                        mb: 1,
                        '&:after': {
                          content: '""',
                          position: 'absolute',
                          top: '100%',
                          left: '50%',
                          marginLeft: -4,
                          borderWidth: 4,
                          borderStyle: 'solid',
                          borderColor: 'rgba(0, 0, 0, 0.8) transparent transparent transparent',
                        },
                      }}
                    >
                      {reaction.label}
                    </Box>
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </Fade>
      </Popover>
    </>
  );
};

export default ReactionMenu;
