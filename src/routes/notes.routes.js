const express = require('express');
const {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  searchNotes
} = require('../controllers/notes.controller');

const router = express.Router();

router.post('/', createNote);
router.get('/', getNotes);
router.get('/search', searchNotes);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;