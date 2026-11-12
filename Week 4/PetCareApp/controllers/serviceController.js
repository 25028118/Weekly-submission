const petModel = require('../models/petModel');
const serviceModel = require('../models/serviceModel');
const serviceBookingModel = require('../models/serviceBookingModel');

const VALIDATION_MESSAGE = 'Choose a pet, service, and valid booking date.';
const UNAVAILABLE_MESSAGE = 'That pet or service is unavailable for booking.';
const SAVE_ERROR_MESSAGE = 'Unable to create the booking. Please try again.';

function formatLocalDate(date) {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isValidPositiveId(value) {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return false;
  const id = Number(value);
  return Number.isSafeInteger(id) && id <= 4294967295;
}

function isValidBookingDate(value, today) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  if (year < 1000 || month < 1 || month > 12) return false;

  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31, leapYear ? 29 : 28, 31, 30, 31, 30,
    31, 31, 30, 31, 30, 31
  ];

  return day >= 1 && day <= daysInMonth[month - 1] && value >= today;
}

function renderServices(req, res, pets, services) {
  const requestedPetId = typeof req.query.petId === 'string' ? req.query.petId : '';
  const selectedPet = pets.find((pet) => String(pet.id) === requestedPetId);

  return res.render('services', {
    pets,
    services,
    selectedPetId: selectedPet ? String(selectedPet.id) : '',
    today: formatLocalDate(new Date()),
    messages: req.flash('success'),
    errors: req.flash('error'),
    session: req.session
  });
}

function listServices(req, res) {
  const ownerId = req.session.user.id;

  petModel.getPetsByOwner(ownerId, (petError, pets) => {
    if (petError) {
      console.error('Error loading pets for service booking:', petError);
      return res.status(500).send('Unable to load pets.');
    }

    serviceModel.getActiveServices((serviceError, services) => {
      if (serviceError) {
        console.error('Error loading services:', serviceError);
        return res.status(500).send('Unable to load services.');
      }

      return renderServices(req, res, pets, services);
    });
  });
}

function createBooking(req, res) {
  const ownerId = req.session.user.id;
  const { petId, serviceId, bookingDate } = req.body;
  const today = formatLocalDate(new Date());

  if (
    !isValidPositiveId(petId) ||
    !isValidPositiveId(serviceId) ||
    !isValidBookingDate(bookingDate, today)
  ) {
    req.flash('error', VALIDATION_MESSAGE);
    return res.redirect('/services');
  }

  serviceBookingModel.createPendingBooking(
    ownerId,
    Number(petId),
    Number(serviceId),
    bookingDate,
    (error, booking) => {
      if (error) {
        console.error('Error creating service booking:', error);
        req.flash('error', SAVE_ERROR_MESSAGE);
        return res.redirect(`/services?petId=${encodeURIComponent(petId)}`);
      }

      if (!booking) {
        req.flash('error', UNAVAILABLE_MESSAGE);
        return res.redirect('/services');
      }

      req.flash(
        'success',
        'Booking created. Payment is pending; no payment has been processed.'
      );
      return res.redirect('/bookings');
    }
  );
}

function listBookings(req, res) {
  serviceBookingModel.getBookingsByOwner(req.session.user.id, (error, bookings) => {
    if (error) {
      console.error('Error loading booking history:', error);
      return res.status(500).send('Unable to load booking history.');
    }

    return res.render('bookings', {
      bookings,
      messages: req.flash('success'),
      errors: req.flash('error'),
      session: req.session
    });
  });
}

module.exports = {
  listServices,
  createBooking,
  listBookings
};
