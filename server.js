const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = 3000;
const projectsPath = path.join(__dirname, 'projects.json');
const feedbackPath = path.join(__dirname, 'feedback.json');

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// GET all projects
app.get('/api/projects', (req, res) => {
  console.log('GET /api/projects called');  // Added logging for debugging
  fs.readFile(projectsPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Read error:', err);
      return res.status(500).json({ error: 'Failed to read projects file' });
    }
    try {
      const projects = JSON.parse(data);
      res.json(projects);
    } catch (err) {
      console.error('JSON parse error:', err);
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});

// POST a new project
app.post('/api/projects', (req, res) => {
  const newProject = {
    id: Date.now().toString(),
    ...req.body
  };

  console.log('New Project:', newProject);  // Log the incoming new project data for debugging

  fs.readFile(projectsPath, 'utf8', (err, data) => {
    let projects = [];
    if (!err) {
      try {
        projects = JSON.parse(data);
      } catch {
        // If there's an error reading JSON, we'll just start with an empty array
      }
    }

    projects.push(newProject);

    fs.writeFile(projectsPath, JSON.stringify(projects, null, 2), (err) => {
      if (err) {
        console.error('Write error:', err);
        return res.status(500).json({ error: 'Failed to write projects' });
      }
      res.json(newProject);  // Send back the new project after saving
    });
  });
});

// DELETE a project
app.delete('/api/projects/:id', (req, res) => {
  const id = req.params.id;

  fs.readFile(projectsPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Read error:', err);
      return res.status(500).json({ error: 'Failed to read projects file' });
    }

    let projects = [];
    try {
      projects = JSON.parse(data);
    } catch {
      return res.status(500).json({ error: 'Invalid JSON' });
    }

    const updated = projects.filter(p => p.id !== id);
    fs.writeFile(projectsPath, JSON.stringify(updated, null, 2), (err) => {
      if (err) {
        console.error('Write error:', err);
        return res.status(500).json({ error: 'Failed to write projects file' });
      }
      res.status(204).end();  // No content, but successfully deleted
    });
  });
});


// GET all feedback
app.get('/api/feedback', (req, res) => {
  fs.readFile(feedbackPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Read error:', err);
      return res.status(500).json({ error: 'Failed to read feedback file' });
    }

    try {
      const feedbacks = JSON.parse(data);
      res.json(feedbacks);
    } catch (err) {
      console.error('JSON parse error:', err);
      res.status(500).json({ error: 'Invalid JSON format in feedback file' });
    }
  });
});

// POST feedback
app.post('/api/feedback', (req, res) => {
  const { name, message } = req.body;
  if (!name || !message) {
    return res.status(400).json({ error: 'Name and message are required' });
  }

  const newFeedback = {
    id: Date.now().toString(),
    name,
    message
  };

  console.log('New Feedback:', newFeedback);

  fs.readFile(feedbackPath, 'utf8', (err, data) => {
    let feedbacks = [];
    if (!err) {
      try {
        feedbacks = JSON.parse(data);
      } catch {
        // If there's an error reading JSON, we'll just start with an empty array
      }
    }

    feedbacks.push(newFeedback);

    fs.writeFile(feedbackPath, JSON.stringify(feedbacks, null, 2), (err) => {
      if (err) {
        console.error('Write error:', err);
        return res.status(500).json({ error: 'Failed to write feedback' });
      }
      res.json(newFeedback);  // Send back the new feedback after saving
    });
  });
});

// GET a single project by ID
app.get('/api/projects/:id', (req, res) => {
  const id = req.params.id;
  fs.readFile(projectsPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Read error:', err);
      return res.status(500).json({ error: 'Failed to read projects file' });
    }
    let projects;
    try {
      projects = JSON.parse(data);
    } catch (err) {
      console.error('JSON parse error:', err);
      return res.status(500).json({ error: 'Invalid JSON format' });
    }
    const project = projects.find(p => p.id === id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
