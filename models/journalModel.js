const connection = require('../config/db');

function getJournalsByOwner(ownerId, callback) {
  const sql = `
    SELECT journal.*, pets.id AS pet_id
    FROM journal
    JOIN pets ON journal.pet_id = pets.id
    WHERE pets.owner_id = ?
  `;
  connection.query(sql, [ownerId], callback);
}

function getJournalsByPetAndOwner(ownerId, petId, callback) {
  const sql = `
    SELECT journal.*, pets.name, pets.species, pets.breed, pets.age, pets.image 
    FROM journal 
    JOIN pets ON journal.pet_id = pets.id 
    WHERE pets.owner_id = ? AND pets.id = ?
  `;
  connection.query(sql, [ownerId, petId], callback);
}

function getJournalById(journalId, callback) {
  const sql = 'SELECT * FROM journal WHERE id = ?';
  connection.query(sql, [journalId], callback);
}

function createJournal(petId, activity, notes, entryDate, callback) {
  const sql = 'INSERT INTO journal (pet_id, activity, notes, entry_date) VALUES (?, ?, ?, ?)';
  connection.query(sql, [petId, activity, notes, entryDate], callback);
}

function updateJournal(journalId, entryDate, activity, notes, petId, callback) {
  const sql = 'UPDATE journal SET entry_date = ?, activity = ?, notes = ?, pet_id = ? WHERE id = ?';
  connection.query(sql, [entryDate, activity, notes, petId, journalId], callback);
}

function getPetIdForJournal(journalId, callback) {
  const sql = 'SELECT pet_id FROM journal WHERE id = ?';
  connection.query(sql, [journalId], callback);
}

function deleteJournal(journalId, callback) {
  const sql = 'DELETE FROM journal WHERE id = ?';
  connection.query(sql, [journalId], callback);
}

function searchJournals(ownerId, searchQuery, selectedPetId, callback) {
  let sql = `
    SELECT journal.*, pets.name, pets.species, pets.breed, pets.age, pets.image 
    FROM journal 
    JOIN pets ON journal.pet_id = pets.id 
    WHERE pets.owner_id = ? AND (journal.activity LIKE ? OR journal.notes LIKE ?)`;

  const params = [ownerId, searchQuery, searchQuery];

  if (selectedPetId) {
    sql += ' AND pets.id = ?';
    params.push(selectedPetId);
  }

  connection.query(sql, params, callback);
}

module.exports = {
  getJournalsByOwner,
  getJournalsByPetAndOwner,
  getJournalById,
  createJournal,
  updateJournal,
  getPetIdForJournal,
  deleteJournal,
  searchJournals
};
