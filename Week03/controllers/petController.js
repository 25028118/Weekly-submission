const petModel = require('../models/petModel');

// Add Pet Form
function newPetForm(req, res) {
  res.render('newPet', { session: req.session });
}

// Handle Add Pet Submission
function createPet(req, res) {
  const { pet_name, species, breed, age } = req.body;
  let petImage;

  if (req.file) {
    petImage = req.file.filename; // use uploaded filename
  } else {
    petImage = null;
  }

  const ownerId = req.session.user.id;

  petModel.createPet(ownerId, pet_name, species, breed, age, petImage, (err) => {
    if (err) {
      console.error(err);
      return res.send('Failed to add pet.');
    }
    res.redirect('/journals');
  });
}

module.exports = { newPetForm, createPet };
