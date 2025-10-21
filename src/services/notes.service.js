// In-memory storage for notes (replace with database in production)
let notes = [];
let currentId = 1;

exports.createNote = async (noteData) => {
  try {
    const newNote = {
      id: currentId++,
      title: noteData.title || `Note ${Date.now()}`,
      content: noteData.content,
      translationData: noteData.translationData || null,
      tags: Array.isArray(noteData.tags) ? noteData.tags : [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    notes.push(newNote);
    return newNote;
  } catch (error) {
    throw new Error(`Note creation failed: ${error.message}`);
  }
};

exports.getNotes = async ({ page, limit, search }) => {
  try {
    let filteredNotes = [...notes];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredNotes = filteredNotes.filter(note =>
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotes = filteredNotes.slice(startIndex, endIndex);

    return {
      notes: paginatedNotes,
      total: filteredNotes.length
    };
  } catch (error) {
    throw new Error(`Notes retrieval failed: ${error.message}`);
  }
};

exports.getNoteById = async (id) => {
  try {
    const noteId = parseInt(id);
    return notes.find(note => note.id === noteId) || null;
  } catch (error) {
    throw new Error(`Note retrieval failed: ${error.message}`);
  }
};

exports.updateNote = async (id, updateData) => {
  try {
    const noteId = parseInt(id);
    const noteIndex = notes.findIndex(note => note.id === noteId);
    
    if (noteIndex === -1) {
      return null;
    }

    notes[noteIndex] = {
      ...notes[noteIndex],
      ...updateData,
      updatedAt: new Date()
    };

    return notes[noteIndex];
  } catch (error) {
    throw new Error(`Note update failed: ${error.message}`);
  }
};

exports.deleteNote = async (id) => {
  try {
    const noteId = parseInt(id);
    const initialLength = notes.length;
    notes = notes.filter(note => note.id !== noteId);
    return notes.length < initialLength;
  } catch (error) {
    throw new Error(`Note deletion failed: ${error.message}`);
  }
};

exports.searchNotes = async ({ query, tags }) => {
  try {
    let filteredNotes = [...notes];

    if (query) {
      const queryLower = query.toLowerCase();
      filteredNotes = filteredNotes.filter(note =>
        note.title.toLowerCase().includes(queryLower) ||
        note.content.toLowerCase().includes(queryLower)
      );
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filteredNotes = filteredNotes.filter(note =>
        tagArray.some(tag => note.tags.includes(tag))
      );
    }

    return {
      notes: filteredNotes,
      total: filteredNotes.length
    };
  } catch (error) {
    throw new Error(`Notes search failed: ${error.message}`);
  }
};