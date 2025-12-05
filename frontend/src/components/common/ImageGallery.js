import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  useMediaQuery,
  useTheme,
  Typography,
  Paper,
  ButtonBase,
  Slide,
  Fade,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon
} from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ImageGallery = ({ images, open, selectedIndex = 0, onClose }) => {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const currentImage = images[currentIndex];
  const totalImages = images.length;

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages);
    resetImageState();
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
    resetImageState();
  };

  const resetImageState = () => {
    setZoomLevel(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
    if (zoomLevel <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleRotate = (direction) => {
    setRotation((prev) => (direction === 'left' ? prev - 90 : prev + 90));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleMouseDown = (e) => {
    if (zoomLevel <= 1) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoomLevel <= 1) return;

    const x = e.clientX - dragStart.x;
    const y = e.clientY - dragStart.y;

    // Calculate max position based on zoom level
    const maxPosition = (zoomLevel - 1) * 100;

    setPosition({
      x: Math.max(Math.min(x, maxPosition), -maxPosition),
      y: Math.max(Math.min(y, maxPosition), -maxPosition)
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === '+') {
      handleZoomIn();
    } else if (e.key === '-') {
      handleZoomOut();
    } else if (e.key === 'r') {
      handleRotate('right');
    } else if (e.key === 'R') {
      handleRotate('left');
    } else if (e.key === 'f') {
      toggleFullscreen();
    }
  };

  React.useEffect(() => {
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [open, currentIndex, zoomLevel, rotation, isFullscreen]);

  if (!open || !images.length) return null;

  return (
    <Dialog
      open={open}
      fullScreen
      onClose={onClose}
      TransitionComponent={Transition}
      PaperProps={{
        style: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          overflow: 'hidden',
        },
      }}
    >
      {/* Close Button */}
      <IconButton
        edge="start"
        color="inherit"
        onClick={onClose}
        aria-label="close"
        sx={{
          position: 'fixed',
          right: 16,
          top: 8,
          zIndex: 1400,
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Toolbar */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          p: 2,
          zIndex: 1300,
          background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 1,
            borderRadius: 4,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Tooltip title="Zoom In" placement="top">
            <IconButton
              onClick={handleZoomIn}
              color="inherit"
              disabled={zoomLevel >= 3}
              size="large"
            >
              <ZoomInIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Zoom Out" placement="top">
            <IconButton
              onClick={handleZoomOut}
              color="inherit"
              disabled={zoomLevel <= 1}
              size="large"
            >
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1, bgcolor: 'rgba(255, 255, 255, 0.3)' }} />

          <Tooltip title="Rotate Left" placement="top">
            <IconButton onClick={() => handleRotate('left')} color="inherit" size="large">
              <RotateLeftIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Rotate Right" placement="top">
            <IconButton onClick={() => handleRotate('right')} color="inherit" size="large">
              <RotateRightIcon />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1, bgcolor: 'rgba(255, 255, 255, 0.3)' }} />

          <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'} placement="top">
            <IconButton onClick={toggleFullscreen} color="inherit" size="large">
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
        </Paper>
      </Box>

      {/* Navigation Arrows */}
      {!isMobile && totalImages > 1 && (
        <>
          <Fade in={true} timeout={300}>
            <IconButton
              onClick={handlePrev}
              sx={{
                position: 'fixed',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                },
                zIndex: 1200,
              }}
              size="large"
            >
              <NavigateBeforeIcon />
            </IconButton>
          </Fade>

          <Fade in={true} timeout={300}>
            <IconButton
              onClick={handleNext}
              sx={{
                position: 'fixed',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                },
                zIndex: 1200,
              }}
              size="large"
            >
              <NavigateNextIcon />
            </IconButton>
          </Fade>
        </>
      )}

      {/* Image Counter */}
      {totalImages > 1 && (
        <Box
          sx={{
            position: 'fixed',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: 2,
            zIndex: 1200,
          }}
        >
          <Typography variant="body2">
            {currentIndex + 1} / {totalImages}
          </Typography>
        </Box>
      )}

      {/* Main Image */}
      <DialogContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          p: 0,
          overflow: 'hidden',
          cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          userSelect: 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <Box
          sx={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 0.3s ease',
          }}
        >
          <Box
            component="img"
            src={currentImage.url}
            alt={`Gallery image ${currentIndex + 1}`}
            sx={{
              maxWidth: '100%',
              maxHeight: '90vh',
              objectFit: 'contain',
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center',
              transition: 'transform 0.3s ease',
              ...(zoomLevel > 1 && {
                cursor: 'grab',
                '&:active': {
                  cursor: 'grabbing',
                },
              }),
            }}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
            }}
            draggable={false}
          />
        </Box>
      </DialogContent>

      {/* Thumbnail Strip */}
      {totalImages > 1 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 80,
            left: 0,
            right: 0,
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            py: 2,
            zIndex: 1200,
            '&::-webkit-scrollbar': {
              height: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          {images.map((img, index) => (
            <ButtonBase
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                resetImageState();
              }}
              sx={{
                display: 'inline-flex',
                position: 'relative',
                width: 60,
                height: 60,
                borderRadius: 1,
                overflow: 'hidden',
                border: currentIndex === index ? '2px solid' : 'none',
                borderColor: 'primary.main',
                mr: 1,
                opacity: currentIndex === index ? 1 : 0.7,
                transition: 'all 0.2s',
                '&:hover': {
                  opacity: 1,
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Box
                component="img"
                src={img.thumbnailUrl || img.url}
                alt={`Thumbnail ${index + 1}`}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {currentIndex === index && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(25, 118, 210, 0.3)',
                  }}
                />
              )}
            </ButtonBase>
          ))}
        </Box>
      )}
    </Dialog>
  );
};

export default ImageGallery;
