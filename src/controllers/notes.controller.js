const notesService = require('../services/notes.service');
const { successResponse } = require('../helpers/response.helper');

exports.createNote = async (req, res, next) => {
  try {
    const { title, content, translationData, tags = [] } = req.body;
    
    if (!content) {
      throw new Error('Note content is required');
    }

    const note = await notesService.createNote({
      title,
      content,
      translationData,
      tags
    });

    successResponse(res, {
      message: 'Note created successfully',
      note: note
    }, 201);
  } catch (err) {
    next(err);
  }
};

exports.getNotes = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const notes = await notesService.getNotes({
      page: parseInt(page),
      limit: parseInt(limit),
      search
    });

    successResponse(res, {
      notes: notes.notes,
      total: notes.total,
      page: parseInt(page),
      totalPages: Math.ceil(notes.total / parseInt(limit))
    });
  } catch (err) {
    next(err);
  }
};

exports.getNoteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const note = await notesService.getNoteById(id);
    
    if (!note) {
      throw new Error('Note not found');
    }

    successResponse(res, { note });
  } catch (err) {
    next(err);
  }
};

exports.updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedNote = await notesService.updateNote(id, updateData);
    
    if (!updatedNote) {
      throw new Error('Note not found');
    }

    successResponse(res, {
      message: 'Note updated successfully',
      note: updatedNote
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await notesService.deleteNote(id);
    
    if (!result) {
      throw new Error('Note not found');
    }

    successResponse(res, {
      message: 'Note deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.searchNotes = async (req, res, next) => {
  try {
    const { query, tags } = req.query;
    
    const notes = await notesService.searchNotes({ query, tags });
    
    successResponse(res, {
      notes: notes.notes,
      total: notes.total,
      query: query || '',
      tags: tags || ''
    });
  } catch (err) {
    next(err);
  }
};