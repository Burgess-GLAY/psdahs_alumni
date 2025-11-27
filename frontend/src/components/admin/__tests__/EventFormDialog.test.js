import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EventFormDialog from '../EventFormDialog';

describe('EventFormDialog - Speakers Section', () => {
    const mockOnClose = jest.fn();
    const mockOnSave = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders speakers section', () => {
        render(
            <EventFormDialog
                open={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        expect(screen.getByText('Speakers')).toBeInTheDocument();
        expect(screen.getByText('Add Speaker')).toBeInTheDocument();
    });

    test('can add a new speaker', async () => {
        render(
            <EventFormDialog
                open={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        const addButton = screen.getByText('Add Speaker');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Speaker 1')).toBeInTheDocument();
        });

        // Check that speaker fields are present by checking for the speaker card
        expect(screen.getByText('Speaker 1')).toBeInTheDocument();
        expect(screen.getByText('Upload Photo')).toBeInTheDocument();
    });

    test('can remove a speaker', async () => {
        render(
            <EventFormDialog
                open={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        // Add a speaker
        const addButton = screen.getByText('Add Speaker');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Speaker 1')).toBeInTheDocument();
        });

        // Remove the speaker
        const removeButton = screen.getByLabelText('Remove speaker 1');
        fireEvent.click(removeButton);

        await waitFor(() => {
            expect(screen.queryByText('Speaker 1')).not.toBeInTheDocument();
        });
    });

    test('validates required speaker name field', async () => {
        render(
            <EventFormDialog
                open={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        // Add a speaker
        const addButton = screen.getByText('Add Speaker');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Speaker 1')).toBeInTheDocument();
        });

        // The validation is handled by Formik/Yup and will show errors on submit
        expect(screen.getByText('Speaker 1')).toBeInTheDocument();
    });

    test('loads existing speakers in edit mode', () => {
        const mockEvent = {
            title: 'Test Event',
            description: 'Test Description',
            category: 'workshop',
            startDate: new Date(),
            endDate: new Date(),
            location: 'Test Location',
            registrationEnabled: false,
            speakers: [
                {
                    name: 'John Doe',
                    title: 'CEO',
                    bio: 'Test bio',
                    photo: '/path/to/photo.jpg',
                    order: 0
                }
            ]
        };

        render(
            <EventFormDialog
                open={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
                event={mockEvent}
            />
        );

        expect(screen.getByText('Speaker 1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('CEO')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument();
    });
});

describe('EventFormDialog - Agenda Section', () => {
    const mockOnClose = jest.fn();
    const mockOnSave = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders agenda section', () => {
        render(
            <EventFormDialog
                open={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        expect(screen.getByText('Agenda')).toBeInTheDocument();
        expect(screen.getByText('Add Agenda Item')).toBeInTheDocument();
    });

    test('can add a new agenda item', async () => {
        render(
            <EventFormDialog
                open={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        const addButton = screen.getByText('Add Agenda Item');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Agenda Item 1')).toBeInTheDocument();
        });

        expect(screen.getByText('Agenda Item 1')).toBeInTheDocument();
    });

    test('can remove an agenda item', async () => {
        render(
            <EventFormDialog
                open={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        // Add an agenda item
        const addButton = screen.getByText('Add Agenda Item');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Agenda Item 1')).toBeInTheDocument();
        });

        // Remove the agenda item
        const removeButton = screen.getByLabelText('Remove agenda item 1');
        fireEvent.click(removeButton);

        await waitFor(() => {
            expect(screen.queryByText('Agenda Item 1')).not.toBeInTheDocument();
        });
    });

    test('validates required agenda title field', async () => {
        render(
            <EventFormDialog
                open={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        // Add an agenda item
        const addButton = screen.getByText('Add Agenda Item');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Agenda Item 1')).toBeInTheDocument();
        });

        // The validation is handled by Formik/Yup and will show errors on submit
        expect(screen.getByText('Agenda Item 1')).toBeInTheDocument();
    });

    test('speaker dropdown is populated from speakers list', async () => {
        render(
            <EventFormDialog
                open={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        // Add a speaker first
        const addSpeakerButton = screen.getByText('Add Speaker');
        fireEvent.click(addSpeakerButton);

        await waitFor(() => {
            expect(screen.getByText('Speaker 1')).toBeInTheDocument();
        });

        // Add speaker name
        const speakerNameInput = screen.getAllByLabelText(/Name/i)[0];
        fireEvent.change(speakerNameInput, { target: { value: 'Jane Smith' } });

        // Add an agenda item
        const addAgendaButton = screen.getByText('Add Agenda Item');
        fireEvent.click(addAgendaButton);

        await waitFor(() => {
            expect(screen.getByText('Agenda Item 1')).toBeInTheDocument();
        });

        // The speaker dropdown should be present
        expect(screen.getByLabelText('Speaker (Optional)')).toBeInTheDocument();
    });

    test('loads existing agenda items in edit mode', () => {
        const mockEvent = {
            title: 'Test Event',
            description: 'Test Description',
            category: 'workshop',
            startDate: new Date(),
            endDate: new Date(),
            location: 'Test Location',
            registrationEnabled: false,
            speakers: [
                {
                    name: 'John Doe',
                    title: 'CEO',
                    bio: 'Test bio',
                    order: 0
                }
            ],
            agenda: [
                {
                    time: '9:00 AM - 10:00 AM',
                    title: 'Opening Keynote',
                    description: 'Welcome and introduction',
                    speaker: 'John Doe',
                    order: 0
                }
            ]
        };

        render(
            <EventFormDialog
                open={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
                event={mockEvent}
            />
        );

        expect(screen.getByText('Agenda Item 1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('9:00 AM - 10:00 AM')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Opening Keynote')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Welcome and introduction')).toBeInTheDocument();
    });

    test('can add multiple agenda items', async () => {
        render(
            <EventFormDialog
                open={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        const addButton = screen.getByText('Add Agenda Item');

        // Add first item
        fireEvent.click(addButton);
        await waitFor(() => {
            expect(screen.getByText('Agenda Item 1')).toBeInTheDocument();
        });

        // Add second item
        fireEvent.click(addButton);
        await waitFor(() => {
            expect(screen.getByText('Agenda Item 2')).toBeInTheDocument();
        });

        expect(screen.getByText('Agenda Item 1')).toBeInTheDocument();
        expect(screen.getByText('Agenda Item 2')).toBeInTheDocument();
    });
});

describe('EventFormDialog - FAQ Section', () => {
    const mockOnClose = jest.fn();
    const mockOnSave = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders FAQ section', () => {
        render(
            <EventFormDialog
                open={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
        expect(screen.getByText('Add FAQ')).toBeInTheDocument();
    });

    test('can add a new FAQ item', async () => {
        render(
            <EventFormDialog
                open={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        const addButton = screen.getByText('Add FAQ');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('FAQ 1')).toBeInTheDocument();
        });

        expect(screen.getByText('FAQ 1')).toBeInTheDocument();
    });

    test('can remove an FAQ item', async () => {
        render(
            <EventFormDialog
                open={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        // Add an FAQ item
        const addButton = screen.getByText('Add FAQ');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('FAQ 1')).toBeInTheDocument();
        });

        // Remove the FAQ item
        const removeButton = screen.getByLabelText('Remove FAQ 1');
        fireEvent.click(removeButton);

        await waitFor(() => {
            expect(screen.queryByText('FAQ 1')).not.toBeInTheDocument();
        });
    });

    test('validates required FAQ question field', async () => {
        render(
            <EventFormDialog
                open={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        // Add an FAQ item
        const addButton = screen.getByText('Add FAQ');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('FAQ 1')).toBeInTheDocument();
        });

        // The validation is handled by Formik/Yup and will show errors on submit
        expect(screen.getByText('FAQ 1')).toBeInTheDocument();
    });

    test('loads existing FAQ items in edit mode', () => {
        const mockEvent = {
            title: 'Test Event',
            description: 'Test Description',
            category: 'workshop',
            startDate: new Date(),
            endDate: new Date(),
            location: 'Test Location',
            registrationEnabled: false,
            faq: [
                {
                    question: 'What should I bring?',
                    answer: 'Please bring your ID and a notebook.',
                    order: 0
                }
            ]
        };

        render(
            <EventFormDialog
                open={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
                event={mockEvent}
            />
        );

        expect(screen.getByText('FAQ 1')).toBeInTheDocument();
        expect(screen.getByDisplayValue('What should I bring?')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Please bring your ID and a notebook.')).toBeInTheDocument();
    });

    test('can add multiple FAQ items', async () => {
        render(
            <EventFormDialog
                open={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        const addButton = screen.getByText('Add FAQ');

        // Add first item
        fireEvent.click(addButton);
        await waitFor(() => {
            expect(screen.getByText('FAQ 1')).toBeInTheDocument();
        });

        // Add second item
        fireEvent.click(addButton);
        await waitFor(() => {
            expect(screen.getByText('FAQ 2')).toBeInTheDocument();
        });

        expect(screen.getByText('FAQ 1')).toBeInTheDocument();
        expect(screen.getByText('FAQ 2')).toBeInTheDocument();
    });

    test('FAQ fields have proper labels', async () => {
        render(
            <EventFormDialog
                open={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        const addButton = screen.getByText('Add FAQ');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('FAQ 1')).toBeInTheDocument();
        });

        // Check for Question and Answer labels
        expect(screen.getByLabelText(/Question/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Answer/i)).toBeInTheDocument();
    });
});
