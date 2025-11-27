import React from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  TextField,
  FormControl,
  FormLabel,
  Divider,
  useTheme,
  Grid,
  FormHelperText,
  Paper
} from '@mui/material';
import { useFormContext, Controller } from 'react-hook-form';
import { Person as PersonIcon, Visibility as VisibilityIcon } from '@mui/icons-material';

const DonorRecognitionForm = () => {
  const theme = useTheme();
  const { control, watch, setValue } = useFormContext();
  const showOnWall = watch('showOnWall', false);
  const displayOption = watch('displayOption', 'fullName');
  const customDisplayName = watch('customDisplayName', '');

  const handleDisplayOptionChange = (event) => {
    setValue('displayOption', event.target.value);
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 4, 
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper
      }}
    >
      <Typography variant="h6" component="h3" gutterBottom>
        Recognition Preferences
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Choose how you'd like to be recognized for your generous contribution.
      </Typography>

      <FormGroup sx={{ mb: 3 }}>
        <Controller
          name="showOnWall"
          control={control}
          defaultValue={false}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  {...field}
                  checked={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    // Reset display options when unchecking
                    if (!e.target.checked) {
                      setValue('displayOption', 'fullName');
                      setValue('customDisplayName', '');
                    }
                  }}
                  color="primary"
                />
              }
              label="Display my donation on the donor wall"
            />
          )}
        />
        <FormHelperText sx={{ ml: 4, mt: -1, mb: 2 }}>
          Your generosity inspires others to give. Choose how you'd like to be recognized below.
        </FormHelperText>
      </FormGroup>

      {showOnWall && (
        <Box sx={{ pl: 2, borderLeft: `2px solid ${theme.palette.primary.main}` }}>
          <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
            <FormLabel component="legend" sx={{ mb: 1, fontWeight: 'medium' }}>
              Display as:
            </FormLabel>
            <Controller
              name="displayOption"
              control={control}
              defaultValue="fullName"
              render={({ field }) => (
                <RadioGroup
                  {...field}
                  aria-label="display-options"
                  onChange={handleDisplayOptionChange}
                  sx={{ gap: 2 }}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderColor: displayOption === 'fullName' ? 'primary.main' : 'divider',
                      backgroundColor: displayOption === 'fullName' ? 'primary.light' : 'background.paper',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: 'primary.main',
                        cursor: 'pointer'
                      },
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onClick={() => setValue('displayOption', 'fullName')}
                  >
                    <Radio
                      value="fullName"
                      checked={displayOption === 'fullName'}
                      sx={{ mr: 1 }}
                    />
                    <Box>
                      <Typography variant="body1">Full Name</Typography>
                      <Typography variant="body2" color="text.secondary">
                        John D.
                      </Typography>
                    </Box>
                  </Paper>

                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderColor: displayOption === 'initials' ? 'primary.main' : 'divider',
                      backgroundColor: displayOption === 'initials' ? 'primary.light' : 'background.paper',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: 'primary.main',
                        cursor: 'pointer'
                      },
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onClick={() => setValue('displayOption', 'initials')}
                  >
                    <Radio
                      value="initials"
                      checked={displayOption === 'initials'}
                      sx={{ mr: 1 }}
                    />
                    <Box>
                      <Typography variant="body1">Initials</Typography>
                      <Typography variant="body2" color="text.secondary">
                        J.D.
                      </Typography>
                    </Box>
                  </Paper>

                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderColor: displayOption === 'custom' ? 'primary.main' : 'divider',
                      backgroundColor: displayOption === 'custom' ? 'primary.light' : 'background.paper',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: 'primary.main',
                        cursor: 'pointer'
                      },
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1
                    }}
                    onClick={() => setValue('displayOption', 'custom')}
                  >
                    <Box display="flex" alignItems="center">
                      <Radio
                        value="custom"
                        checked={displayOption === 'custom'}
                        sx={{ mr: 1, alignSelf: 'flex-start', mt: 0.5 }}
                      />
                      <Box>
                        <Typography variant="body1">Custom Name</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Choose how your name appears
                        </Typography>
                      </Box>
                    </Box>
                    {displayOption === 'custom' && (
                      <Box sx={{ ml: 6, width: '100%' }}>
                        <Controller
                          name="customDisplayName"
                          control={control}
                          defaultValue=""
                          rules={{
                            validate: (value) => {
                              if (displayOption === 'custom' && !value.trim()) {
                                return 'Please enter a display name';
                              }
                              return true;
                            }
                          }}
                          render={({ field, fieldState: { error } }) => (
                            <TextField
                              {...field}
                              fullWidth
                              size="small"
                              placeholder="e.g., The Smith Family, Anonymous Donor, etc."
                              error={!!error}
                              helperText={error?.message || 'This is how your name will appear on the donor wall'}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                        />
                      </Box>
                    )}
                  </Paper>

                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderColor: displayOption === 'anonymous' ? 'primary.main' : 'divider',
                      backgroundColor: displayOption === 'anonymous' ? 'primary.light' : 'background.paper',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        borderColor: 'primary.main',
                        cursor: 'pointer'
                      },
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onClick={() => setValue('displayOption', 'anonymous')}
                  >
                    <Radio
                      value="anonymous"
                      checked={displayOption === 'anonymous'}
                      sx={{ mr: 1 }}
                    />
                    <Box>
                      <Typography variant="body1">Anonymous</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Listed as "Anonymous Donor"
                      </Typography>
                    </Box>
                  </Paper>
                </RadioGroup>
              )}
            />
          </FormControl>

          <FormGroup sx={{ mt: 3 }}>
            <Controller
              name="receiveImpactUpdates"
              control={control}
              defaultValue={true}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">
                        Send me impact updates about how my gift is making a difference
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        We'll share stories and updates about the impact of your donation
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start', mt: 1 }}
                />
              )}
            />
          </FormGroup>
        </Box>
      )}
    </Paper>
  );
};

export default DonorRecognitionForm;
