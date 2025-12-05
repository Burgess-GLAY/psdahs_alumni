import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    IconButton,
    Typography,
    FormHelperText,
    FormControlLabel,
    Switch,
    Divider,
    Card,
    CardContent,
    CardActions,
    Avatar,
} from '@mui/material';
import {
    Close as CloseIcon,
    CloudUpload as CloudUploadIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as Yup from 'yup';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Validation schema using Yup
const eventValidationSchema = Yup.object().shape({
    title: Yup.string()
        .required('Title is required')
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title must not exceed 200 characters'),
    description: Yup.string()
        .required('Description is required')
        .min(10, 'Description must be at least 10 characters')
        .max(5000, 'Description must not exceed 5000 characters'),
    category: Yup.string()
        .required('Category is required')
        .oneOf(['reunion', 'career', 'workshop', 'sports', 'networking', 'other'], 'Invalid category'),
    startDate: Yup.date()
        .required('Start date is required')
        .nullable()
        .typeError('Invalid date'),
    endDate: Yup.date()
        .required('End date is required')
        .nullable()
        .typeError('Invalid date')
        .min(Yup.ref('startDate'), 'End date must be after start date'),
    location: Yup.string()
        .required('Location is required')
        .min(3, 'Location must be at least 3 characters')
        .max(200, 'Location must not exceed 200 characters'),
    capacity: Yup.number()
        .nullable()
        .positive('Capacity must be a positive number')
        .integer('Capacity must be a whole number')
        .min(1, 'Capacity must be at least 1')
        .max(100000, 'Capacity seems unreasonably large'),
    registrationEnabled: Yup.boolean(),
    featuredImage: Yup.string().nullable(),
    speakers: Yup.array().of(
        Yup.object().shape({
            name: Yup.string()
                .required('Speaker name is required')
                .min(2, 'Name must be at least 2 characters')
                .max(100, 'Name must not exceed 100 characters'),
            title: Yup.string()
                .max(100, 'Title must not exceed 100 characters'),
            bio: Yup.string()
                .max(1000, 'Bio must not exceed 1000 characters'),
            photo: Yup.string().nullable(),
            order: Yup.number(),
        })
    ),
    agenda: Yup.array().of(
        Yup.object().shape({
            time: Yup.string()
                .max(50, 'Time must not exceed 50 characters'),
            title: Yup.string()
                .required('Agenda item title is required')
                .min(2, 'Title must be at least 2 characters')
                .max(200, 'Title must not exceed 200 characters'),
            description: Yup.string()
                .max(1000, 'Description must not exceed 1000 characters'),
            speaker: Yup.string()
                .max(100, 'Speaker name must not exceed 100 characters'),
            order: Yup.number(),
        })
    ),
    faq: Yup.array().of(
        Yup.object().shape({
            question: Yup.string()
                .required('Question is required')
                .min(5, 'Question must be at least 5 characters')
                .max(500, 'Question must not exceed 500 characters'),
            answer: Yup.string()
                .required('Answer is required')
                .min(5, 'Answer must be at least 5 characters')
                .max(2000, 'Answer must not exceed 2000 characters'),
            order: Yup.number(),
        })
    ),
    locationDetails: Yup.object().shape({
        venueName: Yup.string()
            .max(200, 'Venue name must not exceed 200 characters'),
        address: Yup.object().shape({
            street: Yup.string()
                .max(200, 'Street must not exceed 200 characters'),
            city: Yup.string()
                .max(100, 'City must not exceed 100 characters'),
            state: Yup.string()
                .max(100, 'State must not exceed 100 characters'),
            zipCode: Yup.string()
                .max(20, 'Zip code must not exceed 20 characters'),
            country: Yup.string()
                .max(100, 'Country must not exceed 100 characters'),
        }),
        coordinates: Yup.object().shape({
            lat: Yup.number()
                .min(-90, 'Latitude must be between -90 and 90')
                .max(90, 'Latitude must be between -90 and 90')
                .nullable(),
            lng: Yup.number()
                .min(-180, 'Longitude must be between -180 and 180')
                .max(180, 'Longitude must be between -180 and 180')
                .nullable(),
        }),
        directions: Yup.string()
            .max(2000, 'Directions must not exceed 2000 characters'),
        parkingInfo: Yup.string()
            .max(1000, 'Parking information must not exceed 1000 characters'),
    }),
});

const EventFormDialog = ({ open, onClose, event = null, onSave }) => {
    const [previewImage, setPreviewImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [speakerPhotoPreviews, setSpeakerPhotoPreviews] = useState({});
    const [speakerPhotoFiles, setSpeakerPhotoFiles] = useState({});

    // Determine if we're in edit mode
    const isEditMode = !!event;

    // Initial form values
    const initialValues = {
        title: event?.title || '',
        description: event?.description || '',
        category: event?.category || 'other',
        startDate: event?.startDate ? new Date(event.startDate) : null,
        endDate: event?.endDate ? new Date(event.endDate) : null,
        location: event?.location || '',
        capacity: event?.capacity || '',
        registrationEnabled: event?.registrationEnabled || false, // Default OFF
        featuredImage: event?.featuredImage || '',
        speakers: event?.speakers || [],
        agenda: event?.agenda || [],
        faq: event?.faq || [],
        locationDetails: event?.locationDetails || {
            venueName: '',
            address: {
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: '',
            },
            coordinates: {
                lat: null,
                lng: null,
            },
            directions: '',
            parkingInfo: '',
        },
    };

    // Set preview image if editing an event with an existing image
    useEffect(() => {
        if (event?.featuredImage) {
            setPreviewImage(event.featuredImage);
        } else {
            setPreviewImage(null);
        }
        setImageFile(null);

        // Set speaker photo previews if editing
        if (event?.speakers) {
            const previews = {};
            event.speakers.forEach((speaker, index) => {
                if (speaker.photo) {
                    previews[index] = speaker.photo;
                }
            });
            setSpeakerPhotoPreviews(previews);
        } else {
            setSpeakerPhotoPreviews({});
        }
        setSpeakerPhotoFiles({});
    }, [event]);

    const handleImageChange = (event, setFieldValue) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size must be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
            setImageFile(file);
            setFieldValue('featuredImage', file.name);
        }
    };

    const handleSpeakerPhotoChange = (event, index, setFieldValue) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size must be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setSpeakerPhotoPreviews(prev => ({
                    ...prev,
                    [index]: reader.result
                }));
            };
            reader.readAsDataURL(file);

            setSpeakerPhotoFiles(prev => ({
                ...prev,
                [index]: file
            }));

            setFieldValue(`speakers.${index}.photo`, file.name);
        }
    };

    const handleSpeakerDragEnd = (result, values, setFieldValue) => {
        if (!result.destination) {
            return;
        }

        const items = Array.from(values.speakers);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update order field for each speaker
        const reorderedItems = items.map((item, index) => ({
            ...item,
            order: index
        }));

        setFieldValue('speakers', reorderedItems);

        // Update photo previews and files with new indices
        const newPreviews = {};
        const newFiles = {};
        items.forEach((item, newIndex) => {
            const oldIndex = values.speakers.indexOf(item);
            if (speakerPhotoPreviews[oldIndex]) {
                newPreviews[newIndex] = speakerPhotoPreviews[oldIndex];
            }
            if (speakerPhotoFiles[oldIndex]) {
                newFiles[newIndex] = speakerPhotoFiles[oldIndex];
            }
        });
        setSpeakerPhotoPreviews(newPreviews);
        setSpeakerPhotoFiles(newFiles);
    };

    const handleAgendaDragEnd = (result, values, setFieldValue) => {
        if (!result.destination) {
            return;
        }

        const items = Array.from(values.agenda);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update order field for each agenda item
        const reorderedItems = items.map((item, index) => ({
            ...item,
            order: index
        }));

        setFieldValue('agenda', reorderedItems);
    };

    const handleFaqDragEnd = (result, values, setFieldValue) => {
        if (!result.destination) {
            return;
        }

        const items = Array.from(values.faq);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update order field for each FAQ item
        const reorderedItems = items.map((item, index) => ({
            ...item,
            order: index
        }));

        setFieldValue('faq', reorderedItems);
    };

    const handleFormSubmit = async (values, { setErrors }) => {
        try {
            setIsSubmitting(true);

            // Prepare form data for submission
            const formData = new FormData();
            formData.append('title', values.title);
            formData.append('description', values.description);
            formData.append('category', values.category);
            formData.append('startDate', values.startDate.toISOString());
            formData.append('endDate', values.endDate.toISOString());
            formData.append('location', values.location);
            formData.append('registrationEnabled', values.registrationEnabled);

            if (values.capacity) {
                formData.append('capacity', values.capacity);
            }

            // Add image file if a new one was selected
            if (imageFile) {
                formData.append('image', imageFile);
            }

            // Add speakers data
            if (values.speakers && values.speakers.length > 0) {
                formData.append('speakers', JSON.stringify(values.speakers));

                // Add speaker photo files
                values.speakers.forEach((speaker, index) => {
                    if (speakerPhotoFiles[index]) {
                        formData.append(`speakerPhoto_${index}`, speakerPhotoFiles[index]);
                    }
                });
            }

            // Add agenda data
            if (values.agenda && values.agenda.length > 0) {
                formData.append('agenda', JSON.stringify(values.agenda));
            }

            // Add FAQ data
            if (values.faq && values.faq.length > 0) {
                formData.append('faq', JSON.stringify(values.faq));
            }

            // Add location details data
            if (values.locationDetails) {
                formData.append('locationDetails', JSON.stringify(values.locationDetails));
            }

            // Call the onSave callback with the form data
            await onSave(formData);

            // Close dialog and reset state
            handleClose();
        } catch (error) {
            console.error('Error submitting form:', error);
            setErrors({ submit: error.message || 'Failed to save event' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setPreviewImage(null);
        setImageFile(null);
        setSpeakerPhotoPreviews({});
        setSpeakerPhotoFiles({});
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            aria-labelledby="event-form-dialog-title"
        >
            <DialogTitle id="event-form-dialog-title">
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                        {isEditMode ? 'Edit Event' : 'Create New Event'}
                    </Typography>
                    <IconButton
                        onClick={handleClose}
                        size="small"
                        aria-label="close dialog"
                        disabled={isSubmitting}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <Formik
                initialValues={initialValues}
                validationSchema={eventValidationSchema}
                onSubmit={handleFormSubmit}
                enableReinitialize
            >
                {({ values, errors, touched, setFieldValue, handleChange, handleBlur }) => (
                    <Form>
                        <DialogContent dividers sx={{ maxHeight: '80vh', overflowY: 'auto' }}>
                            <Grid container spacing={3}>
                                {/* Basic Information Section */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom color="primary">
                                        Basic Information
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                </Grid>

                                <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        name="title"
                                        label="Event Title"
                                        fullWidth
                                        required
                                        error={touched.title && !!errors.title}
                                        helperText={touched.title && errors.title}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.title}
                                        disabled={isSubmitting}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        name="description"
                                        label="Description"
                                        fullWidth
                                        required
                                        multiline
                                        rows={4}
                                        error={touched.description && !!errors.description}
                                        helperText={touched.description && errors.description}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.description}
                                        disabled={isSubmitting}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <FormControl
                                        fullWidth
                                        error={touched.category && !!errors.category}
                                        disabled={isSubmitting}
                                    >
                                        <InputLabel id="category-label">Category *</InputLabel>
                                        <Field
                                            as={Select}
                                            labelId="category-label"
                                            name="category"
                                            label="Category *"
                                            value={values.category}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        >
                                            <MenuItem value="reunion">Reunion</MenuItem>
                                            <MenuItem value="career">Career</MenuItem>
                                            <MenuItem value="workshop">Workshop</MenuItem>
                                            <MenuItem value="sports">Sports</MenuItem>
                                            <MenuItem value="networking">Networking</MenuItem>
                                            <MenuItem value="other">Other</MenuItem>
                                        </Field>
                                        {touched.category && errors.category && (
                                            <FormHelperText>{errors.category}</FormHelperText>
                                        )}
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Field
                                        as={TextField}
                                        name="capacity"
                                        label="Capacity (Optional)"
                                        fullWidth
                                        type="number"
                                        error={touched.capacity && !!errors.capacity}
                                        helperText={touched.capacity && errors.capacity}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.capacity}
                                        disabled={isSubmitting}
                                        inputProps={{ min: 1 }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DateTimePicker
                                            label="Start Date & Time *"
                                            value={values.startDate}
                                            onChange={(value) => setFieldValue('startDate', value)}
                                            disabled={isSubmitting}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: touched.startDate && !!errors.startDate,
                                                    helperText: touched.startDate && errors.startDate,
                                                    onBlur: handleBlur,
                                                    name: 'startDate',
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DateTimePicker
                                            label="End Date & Time *"
                                            value={values.endDate}
                                            onChange={(value) => setFieldValue('endDate', value)}
                                            disabled={isSubmitting}
                                            minDateTime={values.startDate}
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    error: touched.endDate && !!errors.endDate,
                                                    helperText: touched.endDate && errors.endDate,
                                                    onBlur: handleBlur,
                                                    name: 'endDate',
                                                },
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid>

                                <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        name="location"
                                        label="Location"
                                        fullWidth
                                        required
                                        error={touched.location && !!errors.location}
                                        helperText={touched.location && errors.location}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.location}
                                        disabled={isSubmitting}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <input
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="event-image-upload"
                                        type="file"
                                        onChange={(e) => handleImageChange(e, setFieldValue)}
                                        disabled={isSubmitting}
                                    />
                                    <label htmlFor="event-image-upload">
                                        <Button
                                            variant="outlined"
                                            component="span"
                                            startIcon={<CloudUploadIcon />}
                                            disabled={isSubmitting}
                                            fullWidth
                                        >
                                            Upload Featured Image
                                        </Button>
                                    </label>
                                    {previewImage && (
                                        <Box
                                            component="img"
                                            src={previewImage}
                                            alt="Event preview"
                                            sx={{
                                                width: '100%',
                                                maxHeight: 300,
                                                objectFit: 'cover',
                                                borderRadius: 1,
                                                mt: 2,
                                            }}
                                        />
                                    )}
                                </Grid>

                                {/* Registration Settings Section */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                                        Registration Settings
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={values.registrationEnabled}
                                                onChange={(e) => setFieldValue('registrationEnabled', e.target.checked)}
                                                name="registrationEnabled"
                                                color="primary"
                                                disabled={isSubmitting}
                                            />
                                        }
                                        label={
                                            <Box>
                                                <Typography variant="body1">
                                                    Enable Registration
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    When enabled, users will see a "Register Now" button for this event
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </Grid>

                                {/* Speakers Section */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                                        Speakers
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                </Grid>

                                <Grid item xs={12}>
                                    <FieldArray name="speakers">
                                        {({ push, remove }) => (
                                            <Box>
                                                <DragDropContext
                                                    onDragEnd={(result) => handleSpeakerDragEnd(result, values, setFieldValue)}
                                                >
                                                    <Droppable droppableId="speakers">
                                                        {(provided) => (
                                                            <Box
                                                                {...provided.droppableProps}
                                                                ref={provided.innerRef}
                                                            >
                                                                {values.speakers.map((speaker, index) => (
                                                                    <Draggable
                                                                        key={`speaker-${index}`}
                                                                        draggableId={`speaker-${index}`}
                                                                        index={index}
                                                                    >
                                                                        {(provided, snapshot) => (
                                                                            <Card
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                sx={{
                                                                                    mb: 2,
                                                                                    backgroundColor: snapshot.isDragging ? 'action.hover' : 'background.paper',
                                                                                }}
                                                                            >
                                                                                <CardContent>
                                                                                    <Box display="flex" alignItems="center" mb={2}>
                                                                                        <Box
                                                                                            {...provided.dragHandleProps}
                                                                                            sx={{
                                                                                                display: 'flex',
                                                                                                alignItems: 'center',
                                                                                                mr: 2,
                                                                                                cursor: 'grab',
                                                                                            }}
                                                                                        >
                                                                                            <DragIndicatorIcon color="action" />
                                                                                        </Box>
                                                                                        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                                                                                            Speaker {index + 1}
                                                                                        </Typography>
                                                                                        <IconButton
                                                                                            size="small"
                                                                                            color="error"
                                                                                            onClick={() => {
                                                                                                remove(index);
                                                                                                // Clean up photo previews
                                                                                                const newPreviews = { ...speakerPhotoPreviews };
                                                                                                delete newPreviews[index];
                                                                                                setSpeakerPhotoPreviews(newPreviews);
                                                                                                const newFiles = { ...speakerPhotoFiles };
                                                                                                delete newFiles[index];
                                                                                                setSpeakerPhotoFiles(newFiles);
                                                                                            }}
                                                                                            disabled={isSubmitting}
                                                                                            aria-label={`Remove speaker ${index + 1}`}
                                                                                        >
                                                                                            <DeleteIcon />
                                                                                        </IconButton>
                                                                                    </Box>

                                                                                    <Grid container spacing={2}>
                                                                                        <Grid item xs={12} sm={6}>
                                                                                            <Field
                                                                                                as={TextField}
                                                                                                name={`speakers.${index}.name`}
                                                                                                label="Name"
                                                                                                fullWidth
                                                                                                required
                                                                                                error={
                                                                                                    touched.speakers?.[index]?.name &&
                                                                                                    !!errors.speakers?.[index]?.name
                                                                                                }
                                                                                                helperText={
                                                                                                    touched.speakers?.[index]?.name &&
                                                                                                    errors.speakers?.[index]?.name
                                                                                                }
                                                                                                disabled={isSubmitting}
                                                                                            />
                                                                                        </Grid>

                                                                                        <Grid item xs={12} sm={6}>
                                                                                            <Field
                                                                                                as={TextField}
                                                                                                name={`speakers.${index}.title`}
                                                                                                label="Title/Position"
                                                                                                fullWidth
                                                                                                error={
                                                                                                    touched.speakers?.[index]?.title &&
                                                                                                    !!errors.speakers?.[index]?.title
                                                                                                }
                                                                                                helperText={
                                                                                                    touched.speakers?.[index]?.title &&
                                                                                                    errors.speakers?.[index]?.title
                                                                                                }
                                                                                                disabled={isSubmitting}
                                                                                            />
                                                                                        </Grid>

                                                                                        <Grid item xs={12}>
                                                                                            <Field
                                                                                                as={TextField}
                                                                                                name={`speakers.${index}.bio`}
                                                                                                label="Bio"
                                                                                                fullWidth
                                                                                                multiline
                                                                                                rows={3}
                                                                                                error={
                                                                                                    touched.speakers?.[index]?.bio &&
                                                                                                    !!errors.speakers?.[index]?.bio
                                                                                                }
                                                                                                helperText={
                                                                                                    touched.speakers?.[index]?.bio &&
                                                                                                    errors.speakers?.[index]?.bio
                                                                                                }
                                                                                                disabled={isSubmitting}
                                                                                            />
                                                                                        </Grid>

                                                                                        <Grid item xs={12}>
                                                                                            <input
                                                                                                accept="image/*"
                                                                                                style={{ display: 'none' }}
                                                                                                id={`speaker-photo-upload-${index}`}
                                                                                                type="file"
                                                                                                onChange={(e) => handleSpeakerPhotoChange(e, index, setFieldValue)}
                                                                                                disabled={isSubmitting}
                                                                                            />
                                                                                            <label htmlFor={`speaker-photo-upload-${index}`}>
                                                                                                <Button
                                                                                                    variant="outlined"
                                                                                                    component="span"
                                                                                                    size="small"
                                                                                                    startIcon={<CloudUploadIcon />}
                                                                                                    disabled={isSubmitting}
                                                                                                >
                                                                                                    Upload Photo
                                                                                                </Button>
                                                                                            </label>
                                                                                            {speakerPhotoPreviews[index] && (
                                                                                                <Box
                                                                                                    display="flex"
                                                                                                    alignItems="center"
                                                                                                    mt={2}
                                                                                                >
                                                                                                    <Avatar
                                                                                                        src={speakerPhotoPreviews[index]}
                                                                                                        alt={speaker.name}
                                                                                                        sx={{ width: 80, height: 80, mr: 2 }}
                                                                                                    />
                                                                                                    <Typography variant="caption" color="text.secondary">
                                                                                                        Photo preview
                                                                                                    </Typography>
                                                                                                </Box>
                                                                                            )}
                                                                                        </Grid>
                                                                                    </Grid>
                                                                                </CardContent>
                                                                            </Card>
                                                                        )}
                                                                    </Draggable>
                                                                ))}
                                                                {provided.placeholder}
                                                            </Box>
                                                        )}
                                                    </Droppable>
                                                </DragDropContext>

                                                <Button
                                                    variant="outlined"
                                                    startIcon={<AddIcon />}
                                                    onClick={() => push({
                                                        name: '',
                                                        title: '',
                                                        bio: '',
                                                        photo: '',
                                                        order: values.speakers.length
                                                    })}
                                                    disabled={isSubmitting}
                                                    fullWidth
                                                >
                                                    Add Speaker
                                                </Button>
                                            </Box>
                                        )}
                                    </FieldArray>
                                </Grid>

                                {/* Agenda Section */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                                        Agenda
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                </Grid>

                                <Grid item xs={12}>
                                    <FieldArray name="agenda">
                                        {({ push, remove }) => (
                                            <Box>
                                                <DragDropContext
                                                    onDragEnd={(result) => handleAgendaDragEnd(result, values, setFieldValue)}
                                                >
                                                    <Droppable droppableId="agenda">
                                                        {(provided) => (
                                                            <Box
                                                                {...provided.droppableProps}
                                                                ref={provided.innerRef}
                                                            >
                                                                {values.agenda.map((agendaItem, index) => (
                                                                    <Draggable
                                                                        key={`agenda-${index}`}
                                                                        draggableId={`agenda-${index}`}
                                                                        index={index}
                                                                    >
                                                                        {(provided, snapshot) => (
                                                                            <Card
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                sx={{
                                                                                    mb: 2,
                                                                                    backgroundColor: snapshot.isDragging ? 'action.hover' : 'background.paper',
                                                                                }}
                                                                            >
                                                                                <CardContent>
                                                                                    <Box display="flex" alignItems="center" mb={2}>
                                                                                        <Box
                                                                                            {...provided.dragHandleProps}
                                                                                            sx={{
                                                                                                display: 'flex',
                                                                                                alignItems: 'center',
                                                                                                mr: 2,
                                                                                                cursor: 'grab',
                                                                                            }}
                                                                                        >
                                                                                            <DragIndicatorIcon color="action" />
                                                                                        </Box>
                                                                                        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                                                                                            Agenda Item {index + 1}
                                                                                        </Typography>
                                                                                        <IconButton
                                                                                            size="small"
                                                                                            color="error"
                                                                                            onClick={() => remove(index)}
                                                                                            disabled={isSubmitting}
                                                                                            aria-label={`Remove agenda item ${index + 1}`}
                                                                                        >
                                                                                            <DeleteIcon />
                                                                                        </IconButton>
                                                                                    </Box>

                                                                                    <Grid container spacing={2}>
                                                                                        <Grid item xs={12} sm={6}>
                                                                                            <Field
                                                                                                as={TextField}
                                                                                                name={`agenda.${index}.time`}
                                                                                                label="Time"
                                                                                                fullWidth
                                                                                                placeholder="e.g., 9:00 AM - 10:00 AM"
                                                                                                error={
                                                                                                    touched.agenda?.[index]?.time &&
                                                                                                    !!errors.agenda?.[index]?.time
                                                                                                }
                                                                                                helperText={
                                                                                                    touched.agenda?.[index]?.time &&
                                                                                                    errors.agenda?.[index]?.time
                                                                                                }
                                                                                                disabled={isSubmitting}
                                                                                            />
                                                                                        </Grid>

                                                                                        <Grid item xs={12} sm={6}>
                                                                                            <Field
                                                                                                as={TextField}
                                                                                                name={`agenda.${index}.title`}
                                                                                                label="Title"
                                                                                                fullWidth
                                                                                                required
                                                                                                error={
                                                                                                    touched.agenda?.[index]?.title &&
                                                                                                    !!errors.agenda?.[index]?.title
                                                                                                }
                                                                                                helperText={
                                                                                                    touched.agenda?.[index]?.title &&
                                                                                                    errors.agenda?.[index]?.title
                                                                                                }
                                                                                                disabled={isSubmitting}
                                                                                            />
                                                                                        </Grid>

                                                                                        <Grid item xs={12}>
                                                                                            <Field
                                                                                                as={TextField}
                                                                                                name={`agenda.${index}.description`}
                                                                                                label="Description"
                                                                                                fullWidth
                                                                                                multiline
                                                                                                rows={2}
                                                                                                error={
                                                                                                    touched.agenda?.[index]?.description &&
                                                                                                    !!errors.agenda?.[index]?.description
                                                                                                }
                                                                                                helperText={
                                                                                                    touched.agenda?.[index]?.description &&
                                                                                                    errors.agenda?.[index]?.description
                                                                                                }
                                                                                                disabled={isSubmitting}
                                                                                            />
                                                                                        </Grid>

                                                                                        <Grid item xs={12}>
                                                                                            <FormControl fullWidth disabled={isSubmitting}>
                                                                                                <InputLabel id={`agenda-speaker-label-${index}`}>
                                                                                                    Speaker (Optional)
                                                                                                </InputLabel>
                                                                                                <Field
                                                                                                    as={Select}
                                                                                                    labelId={`agenda-speaker-label-${index}`}
                                                                                                    name={`agenda.${index}.speaker`}
                                                                                                    label="Speaker (Optional)"
                                                                                                    value={agendaItem.speaker || ''}
                                                                                                >
                                                                                                    <MenuItem value="">
                                                                                                        <em>None</em>
                                                                                                    </MenuItem>
                                                                                                    {values.speakers.map((speaker, speakerIndex) => (
                                                                                                        <MenuItem
                                                                                                            key={speakerIndex}
                                                                                                            value={speaker.name}
                                                                                                        >
                                                                                                            {speaker.name || `Speaker ${speakerIndex + 1}`}
                                                                                                        </MenuItem>
                                                                                                    ))}
                                                                                                </Field>
                                                                                            </FormControl>
                                                                                        </Grid>
                                                                                    </Grid>
                                                                                </CardContent>
                                                                            </Card>
                                                                        )}
                                                                    </Draggable>
                                                                ))}
                                                                {provided.placeholder}
                                                            </Box>
                                                        )}
                                                    </Droppable>
                                                </DragDropContext>

                                                <Button
                                                    variant="outlined"
                                                    startIcon={<AddIcon />}
                                                    onClick={() => push({
                                                        time: '',
                                                        title: '',
                                                        description: '',
                                                        speaker: '',
                                                        order: values.agenda.length
                                                    })}
                                                    disabled={isSubmitting}
                                                    fullWidth
                                                >
                                                    Add Agenda Item
                                                </Button>
                                            </Box>
                                        )}
                                    </FieldArray>
                                </Grid>

                                {/* FAQ Section */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                                        Frequently Asked Questions
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                </Grid>

                                <Grid item xs={12}>
                                    <FieldArray name="faq">
                                        {({ push, remove }) => (
                                            <Box>
                                                <DragDropContext
                                                    onDragEnd={(result) => handleFaqDragEnd(result, values, setFieldValue)}
                                                >
                                                    <Droppable droppableId="faq">
                                                        {(provided) => (
                                                            <Box
                                                                {...provided.droppableProps}
                                                                ref={provided.innerRef}
                                                            >
                                                                {values.faq.map((faqItem, index) => (
                                                                    <Draggable
                                                                        key={`faq-${index}`}
                                                                        draggableId={`faq-${index}`}
                                                                        index={index}
                                                                    >
                                                                        {(provided, snapshot) => (
                                                                            <Card
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                sx={{
                                                                                    mb: 2,
                                                                                    backgroundColor: snapshot.isDragging ? 'action.hover' : 'background.paper',
                                                                                }}
                                                                            >
                                                                                <CardContent>
                                                                                    <Box display="flex" alignItems="center" mb={2}>
                                                                                        <Box
                                                                                            {...provided.dragHandleProps}
                                                                                            sx={{
                                                                                                display: 'flex',
                                                                                                alignItems: 'center',
                                                                                                mr: 2,
                                                                                                cursor: 'grab',
                                                                                            }}
                                                                                        >
                                                                                            <DragIndicatorIcon color="action" />
                                                                                        </Box>
                                                                                        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                                                                                            FAQ {index + 1}
                                                                                        </Typography>
                                                                                        <IconButton
                                                                                            size="small"
                                                                                            color="error"
                                                                                            onClick={() => remove(index)}
                                                                                            disabled={isSubmitting}
                                                                                            aria-label={`Remove FAQ ${index + 1}`}
                                                                                        >
                                                                                            <DeleteIcon />
                                                                                        </IconButton>
                                                                                    </Box>

                                                                                    <Grid container spacing={2}>
                                                                                        <Grid item xs={12}>
                                                                                            <Field
                                                                                                as={TextField}
                                                                                                name={`faq.${index}.question`}
                                                                                                label="Question"
                                                                                                fullWidth
                                                                                                required
                                                                                                error={
                                                                                                    touched.faq?.[index]?.question &&
                                                                                                    !!errors.faq?.[index]?.question
                                                                                                }
                                                                                                helperText={
                                                                                                    touched.faq?.[index]?.question &&
                                                                                                    errors.faq?.[index]?.question
                                                                                                }
                                                                                                disabled={isSubmitting}
                                                                                            />
                                                                                        </Grid>

                                                                                        <Grid item xs={12}>
                                                                                            <Field
                                                                                                as={TextField}
                                                                                                name={`faq.${index}.answer`}
                                                                                                label="Answer"
                                                                                                fullWidth
                                                                                                required
                                                                                                multiline
                                                                                                rows={4}
                                                                                                error={
                                                                                                    touched.faq?.[index]?.answer &&
                                                                                                    !!errors.faq?.[index]?.answer
                                                                                                }
                                                                                                helperText={
                                                                                                    touched.faq?.[index]?.answer &&
                                                                                                    errors.faq?.[index]?.answer
                                                                                                }
                                                                                                disabled={isSubmitting}
                                                                                            />
                                                                                        </Grid>
                                                                                    </Grid>
                                                                                </CardContent>
                                                                            </Card>
                                                                        )}
                                                                    </Draggable>
                                                                ))}
                                                                {provided.placeholder}
                                                            </Box>
                                                        )}
                                                    </Droppable>
                                                </DragDropContext>

                                                <Button
                                                    variant="outlined"
                                                    startIcon={<AddIcon />}
                                                    onClick={() => push({
                                                        question: '',
                                                        answer: '',
                                                        order: values.faq.length
                                                    })}
                                                    disabled={isSubmitting}
                                                    fullWidth
                                                >
                                                    Add FAQ
                                                </Button>
                                            </Box>
                                        )}
                                    </FieldArray>
                                </Grid>

                                {/* Location Details Section */}
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                                        Location Details
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />
                                </Grid>

                                <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        name="locationDetails.venueName"
                                        label="Venue Name"
                                        fullWidth
                                        error={
                                            touched.locationDetails?.venueName &&
                                            !!errors.locationDetails?.venueName
                                        }
                                        helperText={
                                            touched.locationDetails?.venueName &&
                                            errors.locationDetails?.venueName
                                        }
                                        disabled={isSubmitting}
                                        placeholder="e.g., Grand Conference Hall"
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Address
                                    </Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        name="locationDetails.address.street"
                                        label="Street Address"
                                        fullWidth
                                        error={
                                            touched.locationDetails?.address?.street &&
                                            !!errors.locationDetails?.address?.street
                                        }
                                        helperText={
                                            touched.locationDetails?.address?.street &&
                                            errors.locationDetails?.address?.street
                                        }
                                        disabled={isSubmitting}
                                        placeholder="e.g., 123 Main Street"
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Field
                                        as={TextField}
                                        name="locationDetails.address.city"
                                        label="City"
                                        fullWidth
                                        error={
                                            touched.locationDetails?.address?.city &&
                                            !!errors.locationDetails?.address?.city
                                        }
                                        helperText={
                                            touched.locationDetails?.address?.city &&
                                            errors.locationDetails?.address?.city
                                        }
                                        disabled={isSubmitting}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Field
                                        as={TextField}
                                        name="locationDetails.address.state"
                                        label="State/Province"
                                        fullWidth
                                        error={
                                            touched.locationDetails?.address?.state &&
                                            !!errors.locationDetails?.address?.state
                                        }
                                        helperText={
                                            touched.locationDetails?.address?.state &&
                                            errors.locationDetails?.address?.state
                                        }
                                        disabled={isSubmitting}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Field
                                        as={TextField}
                                        name="locationDetails.address.zipCode"
                                        label="Zip/Postal Code"
                                        fullWidth
                                        error={
                                            touched.locationDetails?.address?.zipCode &&
                                            !!errors.locationDetails?.address?.zipCode
                                        }
                                        helperText={
                                            touched.locationDetails?.address?.zipCode &&
                                            errors.locationDetails?.address?.zipCode
                                        }
                                        disabled={isSubmitting}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Field
                                        as={TextField}
                                        name="locationDetails.address.country"
                                        label="Country"
                                        fullWidth
                                        error={
                                            touched.locationDetails?.address?.country &&
                                            !!errors.locationDetails?.address?.country
                                        }
                                        helperText={
                                            touched.locationDetails?.address?.country &&
                                            errors.locationDetails?.address?.country
                                        }
                                        disabled={isSubmitting}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                                        Coordinates (Optional)
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Field
                                        as={TextField}
                                        name="locationDetails.coordinates.lat"
                                        label="Latitude"
                                        fullWidth
                                        type="number"
                                        error={
                                            touched.locationDetails?.coordinates?.lat &&
                                            !!errors.locationDetails?.coordinates?.lat
                                        }
                                        helperText={
                                            touched.locationDetails?.coordinates?.lat &&
                                            errors.locationDetails?.coordinates?.lat
                                        }
                                        disabled={isSubmitting}
                                        placeholder="e.g., 40.7128"
                                        inputProps={{ step: 'any', min: -90, max: 90 }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Field
                                        as={TextField}
                                        name="locationDetails.coordinates.lng"
                                        label="Longitude"
                                        fullWidth
                                        type="number"
                                        error={
                                            touched.locationDetails?.coordinates?.lng &&
                                            !!errors.locationDetails?.coordinates?.lng
                                        }
                                        helperText={
                                            touched.locationDetails?.coordinates?.lng &&
                                            errors.locationDetails?.coordinates?.lng
                                        }
                                        disabled={isSubmitting}
                                        placeholder="e.g., -74.0060"
                                        inputProps={{ step: 'any', min: -180, max: 180 }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        name="locationDetails.directions"
                                        label="Directions"
                                        fullWidth
                                        multiline
                                        rows={4}
                                        error={
                                            touched.locationDetails?.directions &&
                                            !!errors.locationDetails?.directions
                                        }
                                        helperText={
                                            touched.locationDetails?.directions &&
                                            errors.locationDetails?.directions
                                        }
                                        disabled={isSubmitting}
                                        placeholder="Provide detailed directions to help attendees find the venue..."
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        name="locationDetails.parkingInfo"
                                        label="Parking Information"
                                        fullWidth
                                        multiline
                                        rows={3}
                                        error={
                                            touched.locationDetails?.parkingInfo &&
                                            !!errors.locationDetails?.parkingInfo
                                        }
                                        helperText={
                                            touched.locationDetails?.parkingInfo &&
                                            errors.locationDetails?.parkingInfo
                                        }
                                        disabled={isSubmitting}
                                        placeholder="Provide information about parking availability, costs, and restrictions..."
                                    />
                                </Grid>

                                {/* Display submission errors */}
                                {errors.submit && (
                                    <Grid item xs={12}>
                                        <Typography color="error" variant="body2">
                                            {errors.submit}
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </DialogContent>

                        <DialogActions sx={{ px: 3, py: 2 }}>
                            <Button
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Event' : 'Create Event')}
                            </Button>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
};

export default EventFormDialog;
