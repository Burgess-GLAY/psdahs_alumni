const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  eventType: {
    type: String,
    enum: ['reunion', 'career', 'workshop', 'sports', 'networking', 'other'],
    default: 'other'
  },
  featuredImage: {
    type: String
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassGroup'
  },
  gallery: [{
    imageUrl: String,
    caption: String
  }],
  registrationRequired: {
    type: Boolean,
    default: false
  },
  registrationEnabled: {
    type: Boolean,
    default: false
  },
  registrationDeadline: Date,
  capacity: Number,
  price: {
    type: Number,
    default: 0
  },
  speakers: [{
    name: {
      type: String,
      required: true
    },
    title: String,
    bio: String,
    photo: String,
    order: {
      type: Number,
      default: 0
    }
  }],
  agenda: [{
    time: String,
    title: {
      type: String,
      required: true
    },
    description: String,
    speaker: String,
    order: {
      type: Number,
      default: 0
    }
  }],
  faq: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  locationDetails: {
    venueName: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    directions: String,
    parkingInfo: String
  },
  organizers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled'],
      default: 'registered'
    }
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  eventStatus: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  isFeaturedOnHomepage: {
    type: Boolean,
    default: false
  },
  featuredOrder: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// FIXED: Single composite text index for better query performance
eventSchema.index({ location: 'text', title: 'text', description: 'text' });
eventSchema.index({ startDate: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ group: 1 });
eventSchema.index({ registrationEnabled: 1 });

// Virtual for event duration in days
eventSchema.virtual('durationInDays').get(function () {
  return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24)) + 1;
});

// Method to check if registration is open
eventSchema.methods.isRegistrationOpen = function () {
  if (!this.registrationRequired) return true;
  if (!this.registrationDeadline) return true;
  return new Date() <= this.registrationDeadline &&
    this.attendees.length < (this.capacity || Infinity);
};

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
