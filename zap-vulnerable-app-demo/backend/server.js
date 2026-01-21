const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Intentionally insecure: open CORS (vulnerability #3)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Intentionally missing security headers (vulnerability #4)
// We deliberately DO NOT use helmet() or set X-Frame-Options, CSP, HSTS, etc.
// This is for demo purposes only.

// Dummy "database" - in-memory array (to simulate SQL-like search behaviour)
const products = [
  { id: 1, name: 'Personal Loan', description: 'Low interest personal loan.' },
  { id: 2, name: 'Savings Account', description: 'High interest savings account.' },
  { id: 3, name: 'Credit Card', description: 'Cashback credit card.' }
];

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Vulnerable search endpoint
// - Simulates SQL injection risk (vulnerability #1)
// - Reflected XSS by echoing user input into HTML without encoding (vulnerability #2)
app.get('/search', (req, res) => {
  const query = req.query.q || '';

  // Simulate naive string-based "SQL" building (for explanation only)
  const simulatedSql = "SELECT * FROM products WHERE name LIKE '%" + query + "%'";
  console.log('Simulated SQL:', simulatedSql);

  // Very naive search: just matches substring (no real SQL)
  const results = products.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.description.toLowerCase().includes(query.toLowerCase())
  );

  // Intentionally vulnerable: reflect raw user input into HTML without escaping
  // If query contains <script>alert(1)</script>, it will be executed by the browser.
  const resultHtml = results.map(p => `<li><strong>${p.name}</strong> - ${p.description}</li>`).join('');

  res.send(`
    <html>
      <head>
        <title>Vulnerable Search</title>
      </head>
      <body>
        <h1>Search Results</h1>
        <p>You searched for: <code>${query}</code></p>
        <p><em>(Try payloads like <code>' OR '1'='1</code> or <code>&lt;script&gt;alert('xss')&lt;/script&gt;</code>)</em></p>
        <ul>
          ${resultHtml || '<li>No results found</li>'}
        </ul>
        <a href="/">Back</a>
      </body>
    </html>
  `);
});

// Simple endpoint to show JSON (used by ZAP)
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Health check for CI
app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

app.listen(PORT, () => {
  console.log(`Vulnerable app listening on http://localhost:${PORT}`);
});
