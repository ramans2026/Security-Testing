# OWASP ZAP CI + Vulnerable Node App (Basic Vulns)

This repository contains an **intentionally vulnerable Node.js application** plus a **GitHub Actions pipeline** that runs an **OWASP ZAP Baseline Scan** on every push / pull request.

It is designed to showcase skills for **DevSecOps / QA Security / AppSec** roles using a simple, explainable setup.

---

## 🎯 Goals

- Demonstrate end-to-end **DAST automation** with OWASP ZAP in CI.
- Show how to test for common issues:
  - SQL injection-style input handling (conceptual)
  - Reflected XSS
  - Open CORS
  - Missing security headers
- Provide a low-code, easy-to-explain security testing project for interviews.

---

## 🧱 Tech Stack

- **Backend:** Node.js + Express
- **DAST Tool:** OWASP ZAP (Docker image: `owasp/zap2docker-stable`)
- **CI/CD:** GitHub Actions (`.github/workflows/zap-baseline.yml`)

---

## 📁 Project Structure

```text
zap-vulnerable-app-demo/
├─ backend/
│  ├─ server.js              # Vulnerable Node/Express app
│  └─ index.html             # Simple UI for search
├─ .github/
│  └─ workflows/
│      └─ zap-baseline.yml   # CI pipeline with ZAP Baseline Scan
├─ zap-reports/              # ZAP reports generated in CI
├─ package.json
└─ README.md
```

---

## ▶ Running the Vulnerable App Locally

**Prerequisites**

- Node.js 18+
- npm

**Steps**

```bash
npm install
npm start
```

The app will start at: `http://localhost:3000`

Check health:

```bash
curl http://localhost:3000/health
```

Open in browser: `http://localhost:3000`

---

## 🔓 Intentional Vulnerabilities (Basic Set)

This app intentionally includes **four** basic classes of vulnerabilities for learning and demonstration.

### 1. SQL Injection-style Input Handling (Conceptual)

**Endpoint:**

- `GET /search?q=<query>`

**What it does:**

- Logs a simulated SQL query string:
  ```sql
  SELECT * FROM products WHERE name LIKE '%<user-input>%'
  ```
- Uses your raw input to filter an in-memory list of products.

There is no real database here, but the pattern mimics vulnerable code that builds SQL using **string concatenation** instead of parameterised queries. In interviews, you can explain that in a real app, this pattern would be at high risk of **SQL injection**.

**How to test with ZAP / browser:**

- Try: `http://localhost:3000/search?q=' OR '1'='1`
- Confirm that ZAP flags this parameter as potentially injectable.

---

### 2. Reflected XSS

**Endpoint:**

- `GET /search?q=<query>`

**What it does:**

- Directly reflects the `q` parameter into the HTML response without encoding:
  ```html
  <p>You searched for: <code>${query}</code></p>
  ```

**Example payload:**

```text
<script>alert('xss')</script>
```

Visit:

- `http://localhost:3000/search?q=<script>alert('xss')</script>`

You will see a JavaScript alert, demonstrating **reflected XSS**. OWASP ZAP should also flag this.

---

### 3. Open CORS

The app configures CORS as:

```js
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

This means **any origin** (`*`) can make cross-origin requests to the API. In production systems, this is usually a security risk (combined with other issues) and ZAP can warn about it as a **CORS misconfiguration**.

---

### 4. Missing Security Headers

The app **does not** set common security headers, such as:

- `Content-Security-Policy`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Strict-Transport-Security`

This is intentional so that OWASP ZAP can:

- Warn about missing headers.
- Help you explain hardening steps (e.g., using `helmet()` in Express).

---

## 🤖 GitHub Actions – OWASP ZAP Baseline CI

The workflow file is located at:

- `.github/workflows/zap-baseline.yml`

**What it does:**

1. Triggers on each push and pull request to `main` / `master`.
2. Checks out the repository.
3. Installs Node.js dependencies.
4. Starts the vulnerable app on `http://localhost:3000`.
5. Runs OWASP ZAP Baseline Scan via Docker:
   ```bash
   docker run --rm \\
     --network="host" \\
     -v "$(pwd)/zap-reports:/zap/wrk" \\
     owasp/zap2docker-stable zap-baseline.py \\
       -t http://localhost:3000 \\
       -r zap-report.html \\
       -J zap-report.json \\
       -x zap-report.xml \\
       -I
   ```
6. Uploads the `zap-reports` directory as a CI artifact, including:
   - `zap-report.html`
   - `zap-report.json`
   - `zap-report.xml`

You can download and open `zap-report.html` from the GitHub Actions run to review findings.

---

## 🧠 How to Talk About This Project in an Interview

Points you can highlight:

1. **DAST Integration into CI/CD**
   - “I integrated OWASP ZAP as part of the GitHub Actions pipeline, so every commit is scanned for common web vulnerabilities.”

2. **Understanding of Vulnerabilities**
   - SQL injection risk due to string-concatenated queries.
   - Reflected XSS via unescaped user input.
   - Risks of open CORS and missing security headers.

3. **Security Testing Workflow**
   - Start with a vulnerable app, run automated ZAP scans.
   - Review ZAP reports and classify findings (true vs false positives).
   - Use findings as a checklist to harden the application (e.g., implement parameterised queries, encoding, CSP, proper CORS).

4. **DevSecOps Mindset**
   - “Security checks are not a one-time activity; I wired ZAP into CI so security regressions are caught automatically as part of the build.”

---

## 🔁 Possible Extensions

To grow this project further, you can:

- Add a "fixed" branch where you:
  - Sanitize/encode the `q` parameter.
  - Close CORS (restrict allowed origins).
  - Add security headers with `helmet`.
- Compare ZAP reports between `vulnerable` and `fixed` branches.
- Add more vulnerabilities:
  - Simple login form (broken auth).
  - Debug endpoint leaking information.
  - Insecure cookies without `HttpOnly`/`Secure`.

This makes the repository even more impressive for a Security QA / DevSecOps portfolio.
