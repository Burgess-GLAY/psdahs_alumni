import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Avatar,
  InputAdornment,
  FormLabel,
  RadioGroup,
  Radio,
  FormGroup,
  Switch,
  useTheme,
  CircularProgress,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  LocationOn as LocationIcon,
  Link as LinkIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { v4 as uuidv4 } from 'uuid';
import alumniService from '../../../services/alumniService';
import LoadingScreen from '../../../components/common/LoadingScreen';
import ErrorScreen from '../../../components/common/ErrorScreen';
import { format } from 'date-fns';

// Form validation schema
const validationSchema = Yup.object({
  // Personal Information
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string().matches(
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
    'Invalid phone number'
  ),
  gender: Yup.string().required('Gender is required'),
  dateOfBirth: Yup.date().nullable(),

  // Education Information
  graduationYear: Yup.number()
    .required('Graduation year is required')
    .min(1900, 'Invalid year')
    .max(new Date().getFullYear() + 5, 'Invalid year'),
  degree: Yup.string(),
  major: Yup.string(),

  // Professional Information
  occupation: Yup.string(),
  company: Yup.string(),
  industry: Yup.string(),

  // Contact Information
  address: Yup.object({
    street: Yup.string(),
    city: Yup.string(),
    state: Yup.string(),
    country: Yup.string(),
    zipCode: Yup.string()
  }),

  // Social Media
  socialLinks: Yup.object({
    linkedin: Yup.string().url('Must be a valid URL'),
    twitter: Yup.string().url('Must be a valid URL'),
    facebook: Yup.string().url('Must be a valid URL'),
    instagram: Yup.string().url('Must be a valid URL'),
    github: Yup.string().url('Must be a valid URL'),
    website: Yup.string().url('Must be a valid URL')
  }),

  // Additional Information
  bio: Yup.string().max(1000, 'Bio must be less than 1000 characters'),
  skills: Yup.array().of(Yup.string()),
  isActive: Yup.boolean(),
  isAdmin: Yup.boolean(),

  // Education History
  education: Yup.array().of(
    Yup.object({
      id: Yup.string(),
      institution: Yup.string().required('Institution is required'),
      degree: Yup.string().required('Degree is required'),
      fieldOfStudy: Yup.string().required('Field of study is required'),
      startDate: Yup.date().required('Start date is required'),
      endDate: Yup.date()
        .nullable()
        .when('startDate', (startDate, schema) => {
          return startDate ? schema.min(startDate, 'End date must be after start date') : schema;
        }),
      current: Yup.boolean(),
      description: Yup.string()
    })
  ),

  // Work Experience
  experience: Yup.array().of(
    Yup.object({
      id: Yup.string(),
      title: Yup.string().required('Job title is required'),
      company: Yup.string().required('Company is required'),
      location: Yup.string(),
      startDate: Yup.date().required('Start date is required'),
      endDate: Yup.date()
        .nullable()
        .when('startDate', (startDate, schema) => {
          return startDate ? schema.min(startDate, 'End date must be after start date') : schema;
        }),
      current: Yup.boolean(),
      description: Yup.string()
    })
  )
});

// Initial form values
const initialValues = {
  // Personal Information
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: '',
  dateOfBirth: null,
  profilePicture: null,

  // Education Information
  graduationYear: new Date().getFullYear(),
  degree: '',
  major: '',

  // Professional Information
  occupation: '',
  company: '',
  industry: '',

  // Contact Information
  address: {
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: ''
  },

  // Social Media
  socialLinks: {
    linkedin: '',
    twitter: '',
    facebook: '',
    instagram: '',
    github: '',
    website: ''
  },

  // Additional Information
  bio: '',
  skills: [],
  isActive: true,
  isAdmin: false,

  // Education History
  education: [
    {
      id: uuidv4(),
      institution: 'Philippine School Doha - Al Kheesa',
      degree: 'High School',
      fieldOfStudy: 'General Academic Strand',
      startDate: null,
      endDate: null,
      current: false,
      description: ''
    }
  ],

  // Work Experience
  experience: [
    {
      id: uuidv4(),
      title: '',
      company: '',
      location: '',
      startDate: null,
      endDate: null,
      current: false,
      description: ''
    }
  ]
};

// Skill options
const skillOptions = [
  'Leadership', 'Teamwork', 'Communication', 'Problem Solving', 'Project Management',
  'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'SQL', 'Data Analysis',
  'Public Speaking', 'Research', 'Mentoring', 'Teaching', 'Marketing', 'Design', 'Writing'
];

// Industry options
const industryOptions = [
  'Technology', 'Education', 'Healthcare', 'Finance', 'Engineering',
  'Arts & Entertainment', 'Business', 'Science', 'Government', 'Non-Profit',
  'Retail', 'Manufacturing', 'Hospitality', 'Media', 'Other'
];

const AlumniForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [skillInput, setSkillInput] = useState('');

  const isEditMode = !!id;

  // Formik
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        setIsSubmitting(true);

        // Format dates
        const formattedValues = {
          ...values,
          dateOfBirth: values.dateOfBirth ? format(values.dateOfBirth, 'yyyy-MM-dd') : null,
          education: values.education.map(edu => ({
            ...edu,
            startDate: format(edu.startDate || new Date(), 'yyyy-MM-dd'),
            endDate: edu.endDate ? format(edu.endDate, 'yyyy-MM-dd') : null
          })),
          experience: values.experience.map(exp => ({
            ...exp,
            startDate: format(exp.startDate || new Date(), 'yyyy-MM-dd'),
            endDate: exp.endDate ? format(exp.endDate, 'yyyy-MM-dd') : null
          }))
        };

        if (isEditMode) {
          await alumniService.updateAlumnus(id, formattedValues);
        } else {
          await alumniService.createAlumnus(formattedValues);
        }

        navigate('/admin/alumni');
      } catch (err) {
        console.error('Form submission error:', err);
        setError(err.message || 'Failed to save. Please try again.');

        // Handle validation errors from the server
        if (err.response?.data?.errors) {
          err.response.data.errors.forEach(error => {
            setFieldError(error.param, error.msg);
          });
        }
      } finally {
        setIsSubmitting(false);
        setSubmitting(false);
      }
    },
  });

  // Fetch alumni data if in edit mode
  useEffect(() => {
    const fetchAlumnus = async () => {
      try {
        setLoading(true);
        const data = await alumniService.getAlumnus(id);

        // Format dates for date pickers
        const formattedData = {
          ...data,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          education: data.education?.map(edu => ({
            ...edu,
            startDate: edu.startDate ? new Date(edu.startDate) : null,
            endDate: edu.endDate ? new Date(edu.endDate) : null
          })) || [],
          experience: data.experience?.map(exp => ({
            ...exp,
            startDate: exp.startDate ? new Date(exp.startDate) : null,
            endDate: exp.endDate ? new Date(exp.endDate) : null
          })) || []
        };

        formik.setValues(formattedData);

        // Set image preview if available
        if (data.profilePicture) {
          setImagePreview(data.profilePicture);
        }

        setError(null);
      } catch (err) {
        console.error('Failed to fetch alumnus:', err);
        setError('Failed to load alumnus data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isEditMode) {
      fetchAlumnus();
    }
  }, [id]);

  // Handle step change
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Handle skill input
  const handleAddSkill = () => {
    if (skillInput && !formik.values.skills.includes(skillInput)) {
      formik.setFieldValue('skills', [...formik.values.skills, skillInput]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    formik.setFieldValue(
      'skills',
      formik.values.skills.filter((skill) => skill !== skillToRemove)
    );
  };

  // Handle education/experience array updates
  const handleAddEducation = () => {
    formik.setFieldValue('education', [
      ...formik.values.education,
      {
        id: uuidv4(),
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: null,
        endDate: null,
        current: false,
        description: ''
      }
    ]);
  };

  const handleRemoveEducation = (index) => {
    const newEducation = [...formik.values.education];
    newEducation.splice(index, 1);
    formik.setFieldValue('education', newEducation);
  };

  const handleAddExperience = () => {
    formik.setFieldValue('experience', [
      ...formik.values.experience,
      {
        id: uuidv4(),
        title: '',
        company: '',
        location: '',
        startDate: null,
        endDate: null,
        current: false,
        description: ''
      }
    ]);
  };

  const handleRemoveExperience = (index) => {
    const newExperience = [...formik.values.experience];
    newExperience.splice(index, 1);
    formik.setFieldValue('experience', newExperience);
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.match('image.*')) {
        formik.setFieldError('profilePicture', 'Only image files are allowed');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        formik.setFieldError('profilePicture', 'Image must be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Set form field
      formik.setFieldValue('profilePicture', file);
    }
  };

  // Steps for the stepper
  const steps = [
    { label: 'Personal Information', icon: <PersonIcon /> },
    { label: 'Education', icon: <SchoolIcon /> },
    { label: 'Professional', icon: <WorkIcon /> },
    { label: 'Contact', icon: <EmailIcon /> },
    { label: 'Review & Submit', icon: <CheckCircleIcon /> },
  ];

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} onRetry={() => window.location.reload()} />;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: 4, px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link component={RouterLink} to="/admin/dashboard" color="inherit">
            Dashboard
          </Link>
          <Link component={RouterLink} to="/admin/alumni" color="inherit">
            Alumni
          </Link>
          <Typography color="text.primary">
            {isEditMode ? `Edit ${formik.values.firstName} ${formik.values.lastName}` : 'Add New Alumnus'}
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              component={RouterLink}
              to="/admin/alumni"
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              {isEditMode ? 'Edit Alumnus' : 'Add New Alumnus'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              component={RouterLink}
              to="/admin/alumni"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={formik.handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Box>

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Stepper activeStep={activeStep} orientation="horizontal" sx={{ mb: 4 }}>
            {steps.map((step, index) => (
              <Step key={step.label} onClick={() => setActiveStep(index)} sx={{ cursor: 'pointer' }}>
                <StepLabel
                  StepIconProps={{
                    icon: React.cloneElement(step.icon, { fontSize: 'small' })
                  }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <form onSubmit={formik.handleSubmit}>
            {/* Step 1: Personal Information */}
            {activeStep === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="profile-picture-upload"
                      type="file"
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="profile-picture-upload">
                      <Avatar
                        src={imagePreview}
                        sx={{
                          width: 150,
                          height: 150,
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.8,
                          },
                        }}
                      >
                        {formik.values.firstName?.charAt(0)}{formik.values.lastName?.charAt(0) || 'U'}
                      </Avatar>
                    </label>
                    <Button
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      size="small"
                      sx={{ mt: 2 }}
                    >
                      Upload Photo
                    </Button>
                    {formik.touched.profilePicture && formik.errors.profilePicture && (
                      <FormHelperText error>{formik.errors.profilePicture}</FormHelperText>
                    )}

                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.isActive}
                          onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
                          name="isActive"
                          color="primary"
                        />
                      }
                      label={formik.values.isActive ? 'Active' : 'Inactive'}
                      sx={{ mt: 2 }}
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.isAdmin}
                          onChange={(e) => formik.setFieldValue('isAdmin', e.target.checked)}
                          name="isAdmin"
                          color="primary"
                        />
                      }
                      label="Admin User"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="firstName"
                        name="firstName"
                        label="First Name"
                        value={formik.values.firstName}
                        onChange={formik.handleChange}
                        error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                        helperText={formik.touched.firstName && formik.errors.firstName}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="lastName"
                        name="lastName"
                        label="Last Name"
                        value={formik.values.lastName}
                        onChange={formik.handleChange}
                        error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                        helperText={formik.touched.lastName && formik.errors.lastName}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="Date of Birth"
                        value={formik.values.dateOfBirth}
                        onChange={(date) => formik.setFieldValue('dateOfBirth', date)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
                            helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="gender-label">Gender</InputLabel>
                        <Select
                          labelId="gender-label"
                          id="gender"
                          name="gender"
                          value={formik.values.gender}
                          label="Gender"
                          onChange={formik.handleChange}
                          error={formik.touched.gender && Boolean(formik.errors.gender)}
                        >
                          <MenuItem value="">
                            <em>Select Gender</em>
                          </MenuItem>
                          <MenuItem value="male">Male</MenuItem>
                          <MenuItem value="female">Female</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                          <MenuItem value="prefer-not-to-say">Prefer not to say</MenuItem>
                        </Select>
                        {formik.touched.gender && formik.errors.gender && (
                          <FormHelperText error>{formik.errors.gender}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="bio"
                        name="bio"
                        label="Bio"
                        multiline
                        rows={4}
                        value={formik.values.bio}
                        onChange={formik.handleChange}
                        error={formik.touched.bio && Boolean(formik.errors.bio)}
                        helperText={
                          formik.touched.bio && formik.errors.bio
                            ? formik.errors.bio
                            : 'Tell us about yourself (max 1000 characters)'
                        }
                        inputProps={{ maxLength: 1000 }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id="skills-label">Skills</InputLabel>
                        <Select
                          labelId="skills-label"
                          id="skills"
                          multiple
                          value={formik.values.skills}
                          onChange={(e) => formik.setFieldValue('skills', e.target.value)}
                          input={<OutlinedInput label="Skills" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip key={value} label={value} size="small" />
                              ))}
                            </Box>
                          )}
                        >
                          {skillOptions.map((skill) => (
                            <MenuItem key={skill} value={skill}>
                              {skill}
                            </MenuItem>
                          ))}
                        </Select>
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                          <TextField
                            size="small"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            placeholder="Add custom skill"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                            sx={{ flexGrow: 1, mr: 1 }}
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={handleAddSkill}
                            disabled={!skillInput.trim()}
                          >
                            Add
                          </Button>
                        </Box>
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {formik.values.skills.map((skill) => (
                            <Chip
                              key={skill}
                              label={skill}
                              onDelete={() => handleRemoveSkill(skill)}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )}

            {/* Step 2: Education */}
            {activeStep === 1 && (
              <Box>
                {formik.values.education.map((edu, index) => (
                  <Paper key={edu.id} sx={{ p: 3, mb: 3, position: 'relative' }}>
                    {index > 0 && (
                      <IconButton
                        aria-label="remove education"
                        onClick={() => handleRemoveEducation(index)}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                    <Typography variant="h6" gutterBottom>
                      {index === 0 ? 'Primary Education' : `Additional Education ${index}`}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name={`education[${index}].institution`}
                          label="Institution"
                          value={edu.institution}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.education?.[index]?.institution &&
                            Boolean(formik.errors.education?.[index]?.institution)
                          }
                          helperText={
                            formik.touched.education?.[index]?.institution &&
                            formik.errors.education?.[index]?.institution
                          }
                          required={index === 0}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name={`education[${index}].degree`}
                          label="Degree"
                          value={edu.degree}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.education?.[index]?.degree &&
                            Boolean(formik.errors.education?.[index]?.degree)
                          }
                          helperText={
                            formik.touched.education?.[index]?.degree &&
                            formik.errors.education?.[index]?.degree
                          }
                          required={index === 0}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name={`education[${index}].fieldOfStudy`}
                          label="Field of Study"
                          value={edu.fieldOfStudy}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.education?.[index]?.fieldOfStudy &&
                            Boolean(formik.errors.education?.[index]?.fieldOfStudy)
                          }
                          helperText={
                            formik.touched.education?.[index]?.fieldOfStudy &&
                            formik.errors.education?.[index]?.fieldOfStudy
                          }
                          required={index === 0}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <DatePicker
                          label="Start Date"
                          value={edu.startDate}
                          onChange={(date) =>
                            formik.setFieldValue(`education[${index}].startDate`, date)
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              error={
                                formik.touched.education?.[index]?.startDate &&
                                Boolean(formik.errors.education?.[index]?.startDate)
                              }
                              helperText={
                                formik.touched.education?.[index]?.startDate &&
                                formik.errors.education?.[index]?.startDate
                              }
                              required={index === 0}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <DatePicker
                          label="End Date"
                          value={edu.endDate}
                          onChange={(date) =>
                            formik.setFieldValue(`education[${index}].endDate`, date)
                          }
                          disabled={edu.current}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              error={
                                formik.touched.education?.[index]?.endDate &&
                                Boolean(formik.errors.education?.[index]?.endDate)
                              }
                              helperText={
                                formik.touched.education?.[index]?.endDate &&
                                formik.errors.education?.[index]?.endDate
                              }
                            />
                          )}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={edu.current}
                              onChange={(e) => {
                                formik.setFieldValue(`education[${index}].current`, e.target.checked);
                                if (e.target.checked) {
                                  formik.setFieldValue(`education[${index}].endDate`, null);
                                }
                              }}
                              name={`education[${index}].current`}
                              color="primary"
                            />
                          }
                          label="Currently Enrolled"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name={`education[${index}].description`}
                          label="Description"
                          multiline
                          rows={3}
                          value={edu.description}
                          onChange={formik.handleChange}
                          placeholder="Achievements, activities, or additional information"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddEducation}
                  sx={{ mt: 1 }}
                >
                  Add Education
                </Button>
              </Box>
            )}

            {/* Step 3: Professional */}
            {activeStep === 2 && (
              <Box>
                {formik.values.experience.map((exp, index) => (
                  <Paper key={exp.id} sx={{ p: 3, mb: 3, position: 'relative' }}>
                    {index > 0 && (
                      <IconButton
                        aria-label="remove experience"
                        onClick={() => handleRemoveExperience(index)}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                    <Typography variant="h6" gutterBottom>
                      {index === 0 ? 'Current/Most Recent Position' : `Previous Position ${index}`}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name={`experience[${index}].title`}
                          label="Job Title"
                          value={exp.title}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.experience?.[index]?.title &&
                            Boolean(formik.errors.experience?.[index]?.title)
                          }
                          helperText={
                            formik.touched.experience?.[index]?.title &&
                            formik.errors.experience?.[index]?.title
                          }
                          required={index === 0}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name={`experience[${index}].company`}
                          label="Company"
                          value={exp.company}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.experience?.[index]?.company &&
                            Boolean(formik.errors.experience?.[index]?.company)
                          }
                          helperText={
                            formik.touched.experience?.[index]?.company &&
                            formik.errors.experience?.[index]?.company
                          }
                          required={index === 0}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          name={`experience[${index}].location`}
                          label="Location"
                          value={exp.location}
                          onChange={formik.handleChange}
                          placeholder="City, Country"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel id={`industry-${index}-label`}>Industry</InputLabel>
                          <Select
                            labelId={`industry-${index}-label`}
                            id={`experience[${index}].industry`}
                            name={`experience[${index}].industry`}
                            value={exp.industry || ''}
                            label="Industry"
                            onChange={formik.handleChange}
                          >
                            <MenuItem value="">
                              <em>Select Industry</em>
                            </MenuItem>
                            {industryOptions.map((industry) => (
                              <MenuItem key={industry} value={industry}>
                                {industry}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <DatePicker
                          label="Start Date"
                          value={exp.startDate}
                          onChange={(date) =>
                            formik.setFieldValue(`experience[${index}].startDate`, date)
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              error={
                                formik.touched.experience?.[index]?.startDate &&
                                Boolean(formik.errors.experience?.[index]?.startDate)
                              }
                              helperText={
                                formik.touched.experience?.[index]?.startDate &&
                                formik.errors.experience?.[index]?.startDate
                              }
                              required={index === 0}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <DatePicker
                          label="End Date"
                          value={exp.endDate}
                          onChange={(date) =>
                            formik.setFieldValue(`experience[${index}].endDate`, date)
                          }
                          disabled={exp.current}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              error={
                                formik.touched.experience?.[index]?.endDate &&
                                Boolean(formik.errors.experience?.[index]?.endDate)
                              }
                              helperText={
                                formik.touched.experience?.[index]?.endDate &&
                                formik.errors.experience?.[index]?.endDate
                              }
                            />
                          )}
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={exp.current}
                              onChange={(e) => {
                                formik.setFieldValue(`experience[${index}].current`, e.target.checked);
                                if (e.target.checked) {
                                  formik.setFieldValue(`experience[${index}].endDate`, null);
                                }
                              }}
                              name={`experience[${index}].current`}
                              color="primary"
                            />
                          }
                          label="I currently work here"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name={`experience[${index}].description`}
                          label="Description"
                          multiline
                          rows={4}
                          value={exp.description}
                          onChange={formik.handleChange}
                          placeholder="Responsibilities, achievements, and key contributions"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddExperience}
                  sx={{ mt: 1 }}
                >
                  Add Position
                </Button>
              </Box>
            )}

            {/* Step 4: Contact */}
            {activeStep === 3 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Contact Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="email"
                        name="email"
                        label="Email Address"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="phone"
                        name="phone"
                        label="Phone Number"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        error={formik.touched.phone && Boolean(formik.errors.phone)}
                        helperText={formik.touched.phone && formik.errors.phone}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                    Address
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="address.street"
                        name="address.street"
                        label="Street Address"
                        value={formik.values.address.street}
                        onChange={formik.handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="address.city"
                        name="address.city"
                        label="City"
                        value={formik.values.address.city}
                        onChange={formik.handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="address.state"
                        name="address.state"
                        label="State/Province"
                        value={formik.values.address.state}
                        onChange={formik.handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="address.country"
                        name="address.country"
                        label="Country"
                        value={formik.values.address.country}
                        onChange={formik.handleChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="address.zipCode"
                        name="address.zipCode"
                        label="ZIP/Postal Code"
                        value={formik.values.address.zipCode}
                        onChange={formik.handleChange}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Social Media
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="socialLinks.linkedin"
                        name="socialLinks.linkedin"
                        label="LinkedIn Profile"
                        value={formik.values.socialLinks.linkedin}
                        onChange={formik.handleChange}
                        error={
                          formik.touched.socialLinks?.linkedin &&
                          Boolean(formik.errors.socialLinks?.linkedin)
                        }
                        helperText={
                          formik.touched.socialLinks?.linkedin &&
                          formik.errors.socialLinks?.linkedin
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LinkIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="socialLinks.twitter"
                        name="socialLinks.twitter"
                        label="Twitter Profile"
                        value={formik.values.socialLinks.twitter}
                        onChange={formik.handleChange}
                        error={
                          formik.touched.socialLinks?.twitter &&
                          Boolean(formik.errors.socialLinks?.twitter)
                        }
                        helperText={
                          formik.touched.socialLinks?.twitter &&
                          formik.errors.socialLinks?.twitter
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LinkIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="socialLinks.github"
                        name="socialLinks.github"
                        label="GitHub Profile"
                        value={formik.values.socialLinks.github}
                        onChange={formik.handleChange}
                        error={
                          formik.touched.socialLinks?.github &&
                          Boolean(formik.errors.socialLinks?.github)
                        }
                        helperText={
                          formik.touched.socialLinks?.github &&
                          formik.errors.socialLinks?.github
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LinkIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="socialLinks.website"
                        name="socialLinks.website"
                        label="Personal Website"
                        value={formik.values.socialLinks.website}
                        onChange={formik.handleChange}
                        error={
                          formik.touched.socialLinks?.website &&
                          Boolean(formik.errors.socialLinks?.website)
                        }
                        helperText={
                          formik.touched.socialLinks?.website &&
                          formik.errors.socialLinks?.website
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LinkIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )}

            {/* Step 5: Review & Submit */}
            {activeStep === 4 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Review Your Information
                </Typography>
                <Typography variant="body1" paragraph>
                  Please review all the information you've entered before submitting.
                  You can go back to any section to make changes.
                </Typography>

                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Personal Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Full Name</Typography>
                      <Typography variant="body1">
                        {formik.values.firstName} {formik.values.lastName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Email</Typography>
                      <Typography variant="body1">{formik.values.email}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Phone</Typography>
                      <Typography variant="body1">
                        {formik.values.phone || 'Not provided'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Date of Birth</Typography>
                      <Typography variant="body1">
                        {formik.values.dateOfBirth
                          ? format(new Date(formik.values.dateOfBirth), 'MMMM d, yyyy')
                          : 'Not provided'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Gender</Typography>
                      <Typography variant="body1">
                        {formik.values.gender
                          ? formik.values.gender.charAt(0).toUpperCase() + formik.values.gender.slice(1)
                          : 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Status</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: formik.values.isActive ? 'success.main' : 'text.disabled',
                            mr: 1
                          }}
                        />
                        <Typography variant="body1">
                          {formik.values.isActive ? 'Active' : 'Inactive'}
                        </Typography>
                        {formik.values.isAdmin && (
                          <Chip
                            label="Admin"
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">Bio</Typography>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {formik.values.bio || 'No bio provided.'}
                      </Typography>
                    </Grid>
                    {formik.values.skills.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Skills
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {formik.values.skills.map((skill, index) => (
                            <Chip key={index} label={skill} size="small" />
                          ))}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Paper>

                {formik.values.education.length > 0 && (
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Education
                    </Typography>
                    {formik.values.education.map((edu, index) => (
                      <Box key={index} sx={{ mb: index < formik.values.education.length - 1 ? 3 : 0, pb: index < formik.values.education.length - 1 ? 3 : 0, borderBottom: index < formik.values.education.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {edu.institution}
                        </Typography>
                        <Typography variant="body2">
                          {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {edu.startDate
                            ? format(new Date(edu.startDate), 'MMM yyyy')
                            : 'N/A'}
                          {' - '}
                          {edu.current
                            ? 'Present'
                            : (edu.endDate ? format(new Date(edu.endDate), 'MMM yyyy') : 'N/A')}
                        </Typography>
                        {edu.description && (
                          <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                            {edu.description}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Paper>
                )}

                {formik.values.experience.length > 0 && formik.values.experience.some(exp => exp.company) && (
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Work Experience
                    </Typography>
                    {formik.values.experience.map((exp, index) => (
                      exp.company && (
                        <Box key={index} sx={{ mb: index < formik.values.experience.length - 1 ? 3 : 0, pb: index < formik.values.experience.length - 1 ? 3 : 0, borderBottom: index < formik.values.experience.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {exp.title}
                          </Typography>
                          <Typography variant="body2">
                            {exp.company}
                            {exp.location && ` • ${exp.location}`}
                            {exp.industry && ` • ${exp.industry}`}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {exp.startDate
                              ? format(new Date(exp.startDate), 'MMM yyyy')
                              : 'N/A'}
                            {' - '}
                            {exp.current
                              ? 'Present'
                              : (exp.endDate ? format(new Date(exp.endDate), 'MMM yyyy') : 'N/A')}
                          </Typography>
                          {exp.description && (
                            <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
                              {exp.description}
                            </Typography>
                          )}
                        </Box>
                      )
                    ))}
                  </Paper>
                )}

                <Paper sx={{ p: 3 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Contact Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Email</Typography>
                      <Typography variant="body1">{formik.values.email}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Phone</Typography>
                      <Typography variant="body1">
                        {formik.values.phone || 'Not provided'}
                      </Typography>
                    </Grid>
                    {(formik.values.address.street || formik.values.address.city || formik.values.address.country) && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">Address</Typography>
                        <Typography variant="body1">
                          {[
                            formik.values.address.street,
                            formik.values.address.city,
                            formik.values.address.state,
                            formik.values.address.country,
                            formik.values.address.zipCode
                          ].filter(Boolean).join(', ')}
                        </Typography>
                      </Grid>
                    )}
                    {Object.entries(formik.values.socialLinks).some(([_, value]) => value) && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Social Media
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {Object.entries(formik.values.socialLinks)
                            .filter(([_, value]) => value)
                            .map(([platform, url]) => (
                              <Chip
                                key={platform}
                                label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                                component="a"
                                href={url.startsWith('http') ? url : `https://${url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                clickable
                                size="small"
                                variant="outlined"
                                icon={<LinkIcon fontSize="small" />}
                              />
                            ))}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Paper>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  >
                    {isSubmitting ? 'Saving...' : 'Submit'}
                  </Button>
                </Box>
              </Box>
            )}

            {/* Navigation Buttons */}
            {activeStep < 4 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0 || isSubmitting}
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  {activeStep === steps.length - 2 ? 'Review & Submit' : 'Next'}
                </Button>
              </Box>
            )}
          </form>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default AlumniForm;
