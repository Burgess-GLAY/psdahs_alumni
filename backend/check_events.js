const mongoose = require('mongoose');
const Event = require('./models/Event');
const dotenv = require('dotenv');

dotenv.config();

const checkEvents = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/psdahs_alumni?directConnection=true';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const now = new Date();
        console.log('Current Time:', now);

        const validFeatured = await Event.find({
            isPublished: true,
            isFeaturedOnHomepage: true,
            startDate: { $gte: now }
        }).select('title startDate isPublished isFeaturedOnHomepage');

        console.log('\n--- Valid Featured Events for Homepage ---');
        if (validFeatured.length === 0) {
            console.log('NO EVENTS match the homepage criteria (Published + Featured + Upcoming)');
        } else {
            console.log(JSON.stringify(validFeatured, null, 2));
        }

        console.log('\n--- Debugging Potential Candidates (Featured but maybe past/unpublished) ---');
        const candidates = await Event.find({ isFeaturedOnHomepage: true }).limit(5);
        console.log(JSON.stringify(candidates.map(e => ({
            title: e.title,
            startDate: e.startDate,
            isPublished: e.isPublished,
            isFeatured: e.isFeaturedOnHomepage,
            isUpcoming: e.startDate >= now
        })), null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkEvents();
