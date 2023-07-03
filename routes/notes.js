const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Notes = require("../models/Notes");
const fetchuser = require("../middleware/fetchuser");

// Route 1: Adding a Note with post "api/notes/addnote" login required
router.post(
  "/addnote",
  [
    body("title", "Title should be at least 3 charecter").isLength({ min: 3 }),
    body("description", "Description should be at least 5 charecter").isLength({
      min: 5,
    }),
  ],
  fetchuser,
  async (req, res) => {
    const { title, description, tag } = req.body;
    // if there are error return bad request and error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      if (req.user.id) {
        const note = new Notes({
          user: req.user.id,
          title,
          description,
          tag,
        });
        const saveNote = await note.save();
        res.json(saveNote);
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Route 2: Getting all Notes with get "api/notes/getnotes" login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Route 3: Updating an Notes with put "api/notes/updatenote/:id" login required
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  const newNote = {};
  if (title) {
    newNote.title = title;
  }
  if (description) {
    newNote.description = description;
  }
  if (tag) {
    newNote.tag = tag;
  }
  try {
    // Find the note to be updated
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Note Not Found");
    }
    // Allow Update only if user Own the note // check if the user is same Authenticated user or not
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }
    // Find the note and update it
    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json(note);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});

// Route 4: Deleting an Notes with Delete "api/notes/deletenote/:id" login required
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    // Find the note to be deleted
    let note = await Notes.findById(req.params.id);
    // if the note is not present
    if (!note) {
      return res.status(404).send("Note Not Found");
    }
    // Allow Deletion only if user Own the note // check if the user is same Authenticated user or not
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }
    // Deleteing the note
    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({ note, Success: "Your Note has been Deleted" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
