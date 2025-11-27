const mongoose = require('mongoose');

const classRepresentativeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['president', 'vice_president', 'secretary', 'treasurer', 'member']
  },
  startYear: Number,
  endYear: Number,
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const alumniClassSchema = new mongoose.Schema({
  graduationYear: {
    type: Number,
    required: true,
    min: 1950,
    max: new Date().getFullYear() + 5
  },
  classPhoto: String,
  motto: String,
  representatives: [classRepresentativeSchema],
  classFund: {
    balance: {
      type: Number,
      default: 0
    },
    lastUpdated: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
alumniClassSchema.index({ graduationYear: 1 }, { unique: true });

alumniClassSchema.virtual('members', {
  ref: 'User',
  localField: 'graduationYear',
  foreignField: 'graduationYear',
  justOne: false
});

// Add a method to get class statistics
alumniClassSchema.methods.getClassStats = async function() {
  const User = mongoose.model('User');
  const Event = mongoose.model('Event');
  const Donation = mongoose.model('Donation');

  const [memberCount, eventsAttended, totalDonations] = await Promise.all([
    User.countDocuments({ graduationYear: this.graduationYear }),
    Event.countDocuments({
      'attendees.user': { 
        $in: await User.find({ graduationYear: this.graduationYear }).distinct('_id') 
      }
    }),
    Donation.aggregate([
      { 
        $match: { 
          donor: { 
            $in: await User.find({ graduationYear: this.graduationYear }).distinct('_id') 
          },
          paymentStatus: 'completed'
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  return {
    memberCount,
    eventsAttended,
    totalDonations: totalDonations[0]?.total || 0,
    lastUpdated: new Date()
  };
};

const AlumniClass = mongoose.model('AlumniClass', alumniClassSchema);

module.exports = AlumniClass;
