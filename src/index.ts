import express from 'express';
import path from 'path';

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;
const HOST: string = '0.0.0.0';

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve index.html on root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/backspace', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/backspace.html'));
});

app.listen(PORT, HOST,() => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

