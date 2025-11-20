import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDb } from './db.js';

const app = express();
const PORT = 3001;
const SECRET_KEY = 'super-secret-key-change-this'; // In prod use env var

app.use(cors());
app.use(express.json());

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const db = await getDb();
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role || 'user']);
        res.status(201).send('User registered');
    } catch (e) {
        res.status(400).send('Error registering user');
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const db = await getDb();
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        if (!user) return res.status(400).send('User not found');

        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ username: user.username, role: user.role }, SECRET_KEY);
            res.json({ token, role: user.role });
        } else {
            res.status(403).send('Invalid credentials');
        }
    } catch (e) {
        res.status(500).send('Error logging in');
    }
});

// Admin Routes (Credentials)
app.get('/api/admin/credentials', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const db = await getDb();
    const credentials = await db.all('SELECT id, name, tenantId, clientId, subscriptionId FROM credentials'); // Exclude secret
    res.json(credentials);
});

app.post('/api/admin/credentials', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { name, tenantId, clientId, clientSecret, subscriptionId } = req.body;
    const db = await getDb();
    await db.run('INSERT INTO credentials (name, tenantId, clientId, clientSecret, subscriptionId) VALUES (?, ?, ?, ?, ?)',
        [name, tenantId, clientId, clientSecret, subscriptionId]);
    res.status(201).send('Credential added');
});

app.delete('/api/admin/credentials/:id', authenticateToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const db = await getDb();
    await db.run('DELETE FROM credentials WHERE id = ?', [req.params.id]);
    res.sendStatus(200);
});

// Get all credentials (for selection in Connect Modal)
app.get('/api/credentials', authenticateToken, async (req, res) => {
    const db = await getDb();
    // Return list without secrets
    const credentials = await db.all('SELECT id, name, tenantId, clientId, subscriptionId FROM credentials');
    res.json(credentials);
});

// Get specific credential (full) for use
app.get('/api/credentials/:id', authenticateToken, async (req, res) => {
    const db = await getDb();
    const cred = await db.get('SELECT * FROM credentials WHERE id = ?', [req.params.id]);
    if (!cred) return res.sendStatus(404);
    res.json(cred);
});

// Analysis Routes
app.post('/api/analyses', authenticateToken, async (req, res) => {
    const { type, data } = req.body;
    const db = await getDb();
    const user = await db.get('SELECT id FROM users WHERE username = ?', [req.user.username]);
    if (!user) return res.sendStatus(400);

    await db.run('INSERT INTO analyses (userId, type, data) VALUES (?, ?, ?)', [user.id, type, JSON.stringify(data)]);
    res.status(201).send('Analysis saved');
});

app.get('/api/analyses', authenticateToken, async (req, res) => {
    const db = await getDb();
    const user = await db.get('SELECT id FROM users WHERE username = ?', [req.user.username]);
    if (!user) return res.sendStatus(400);

    const analyses = await db.all('SELECT id, type, createdAt, data FROM analyses WHERE userId = ? ORDER BY createdAt DESC', [user.id]);
    const parsedAnalyses = analyses.map(a => ({ ...a, data: JSON.parse(a.data) }));
    res.json(parsedAnalyses);
});

// Seed Admin
(async () => {
    const db = await getDb();
    const admin = await db.get('SELECT * FROM users WHERE username = "admin"');
    if (!admin) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', hashedPassword, 'admin']);
        console.log('Admin user created: admin / admin123');
    }
})();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
