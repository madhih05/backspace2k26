import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve index.html on root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/backspace', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/backspace.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

