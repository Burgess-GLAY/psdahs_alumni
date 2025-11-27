/**
 * Test script to verify Edit Event functionality
 * 
 * This script tests:
 * 1. Fetching an existing event
 * 2. Updating the event with new data
 * 3. Verifying the update was successful
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/psdahs-alumni';

async function testEditEvent() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✓ Connected to MongoDB\n');

        // Step 1: Find an existing event
        console.log('Step 1: Finding an existing event...');
        const existingEvent = await Event.findOne();

        if (!existingEvent) {
            console.log('✗ No events found in database. Please create an event first.');
            return;
        }

        console.log('✓ Found event:', existingEvent.title);
        console.log('  ID:', existingEvent._id);
        console.log('  Description:', existingEvent.description.substring(0, 50) + '...');
        console.log('  Category:', existingEvent.category);
        console.log('  Registration Enabled:', existingEvent.registrationEnabled);
        console.log('  Speakers:', existingEvent.speakers?.length || 0);
        console.log('  Agenda Items:', existingEvent.agenda?.length || 0);
        console.log('  FAQ Items:', existingEvent.faq?.length || 0);
        console.log();

        // Step 2: Update the event
        console.log('Step 2: Updating event...');
        const updateData = {
            title: existingEvent.title + ' (Updated)',
            description: existingEvent.description + '\n\nThis event has been updated via the edit functionality.',
            registrationEnabled: !existingEvent.registrationEnabled,
            speakers: [
                ...(existingEvent.speakers || []),
                {
                    name: 'New Speaker',
                    title: 'Test Speaker',
                    bio: 'Added via edit functionality test',
                    order: (existingEvent.speakers?.length || 0)
                }
            ],
            agenda: [
                ...(existingEvent.agenda || []),
                {
                    time: '3:00 PM - 4:00 PM',
                    title: 'New Agenda Item',
                    description: 'Added via edit functionality test',
                    order: (existingEvent.agenda?.length || 0)
                }
            ],
            faq: [
                ...(existingEvent.faq || []),
                {
                    question: 'Is this a test FAQ?',
                    answer: 'Yes, this was added via the edit functionality test.',
                    order: (existingEvent.faq?.length || 0)
                }
            ]
        };

        const updatedEvent = await Event.findByIdAndUpdate(
            existingEvent._id,
            updateData,
            { new: true, runValidators: true }
        );

        console.log('✓ Event updated successfully!');
        console.log('  New Title:', updatedEvent.title);
        console.log('  Registration Enabled:', updatedEvent.registrationEnabled);
        console.log('  Speakers:', updatedEvent.speakers?.length || 0);
        console.log('  Agenda Items:', updatedEvent.agenda?.length || 0);
        console.log('  FAQ Items:', updatedEvent.faq?.length || 0);
        console.log();

        // Step 3: Verify the update
        console.log('Step 3: Verifying update...');
        const verifiedEvent = await Event.findById(existingEvent._id);

        const checks = [
            {
                name: 'Title updated',
                pass: verifiedEvent.title === updateData.title
            },
            {
                name: 'Description updated',
                pass: verifiedEvent.description === updateData.description
            },
            {
                name: 'Registration toggle updated',
                pass: verifiedEvent.registrationEnabled === updateData.registrationEnabled
            },
            {
                name: 'Speaker added',
                pass: verifiedEvent.speakers.length === updateData.speakers.length
            },
            {
                name: 'Agenda item added',
                pass: verifiedEvent.agenda.length === updateData.agenda.length
            },
            {
                name: 'FAQ item added',
                pass: verifiedEvent.faq.length === updateData.faq.length
            }
        ];

        let allPassed = true;
        checks.forEach(check => {
            if (check.pass) {
                console.log(`  ✓ ${check.name}`);
            } else {
                console.log(`  ✗ ${check.name}`);
                allPassed = false;
            }
        });

        console.log();
        if (allPassed) {
            console.log('✓ All verification checks passed!');
            console.log('\n=== Edit Functionality Test: SUCCESS ===\n');
        } else {
            console.log('✗ Some verification checks failed');
            console.log('\n=== Edit Functionality Test: FAILED ===\n');
        }

        // Cleanup: Revert the changes
        console.log('Cleaning up: Reverting changes...');
        await Event.findByIdAndUpdate(existingEvent._id, {
            title: existingEvent.title,
            description: existingEvent.description,
            registrationEnabled: existingEvent.registrationEnabled,
            speakers: existingEvent.speakers,
            agenda: existingEvent.agenda,
            faq: existingEvent.faq
        });
        console.log('✓ Changes reverted\n');

    } catch (error) {
        console.error('✗ Error during test:', error.message);
        console.error(error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the test
testEditEvent();
