const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "invoices.json");
const USERS_FILE = path.join(__dirname, "users.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readJSON(filePath) {
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Step 1: Check if code exists (logs in old user) or flag as new user
app.post("/api/auth/check", (req, res) => {
    const normalized = (req.body.code || "").trim().toLowerCase();

    if (normalized.length < 4) {
        return res.status(400).json({ error: "Your secret PIN must be at least 4 characters long." });
    }

    const users = readJSON(USERS_FILE);
    const existingUser = users.find(u => u.code === normalized);

    if (existingUser) {
        return res.json({ status: "existing", code: normalized });
    }

    return res.json({ status: "new", code: normalized });
});

// Step 2: Confirm and register a brand-new PIN
app.post("/api/auth/register", (req, res) => {
    const normalized = (req.body.code || "").trim().toLowerCase();

    if (normalized.length < 4) {
        return res.status(400).json({ error: "Your secret PIN must be at least 4 characters long." });
    }

    const users = readJSON(USERS_FILE);
    if (!users.some(u => u.code === normalized)) {
        users.push({ code: normalized, createdAt: new Date().toISOString() });
        writeJSON(USERS_FILE, users);
    }

    res.json({ success: true, code: normalized });
});

// Middleware to require a valid registered PIN for all invoice operations
function requireSecretCode(req, res, next) {
    const code = (req.headers["x-access-code"] || "").trim().toLowerCase();
    const users = readJSON(USERS_FILE);

    if (!code || !users.some(u => u.code === code)) {
        return res.status(401).json({ error: "Unauthorized. Please enter a valid secret PIN first." });
    }
    req.secretCode = code;
    next();
}

// Get user's saved invoices
app.get("/api/invoices", requireSecretCode, (req, res) => {
    const all = readJSON(DATA_FILE);
    const userInvoices = all.filter(inv => inv.secretCode === req.secretCode);
    res.json(userInvoices);
});

// Save or update an invoice under this PIN
app.post("/api/invoices", requireSecretCode, (req, res) => {
    const all = readJSON(DATA_FILE);
    const record = {
        ...req.body,
        secretCode: req.secretCode
    };

    const existingIndex = all.findIndex(
        i => i.secretCode === req.secretCode && i.invoiceNumber === record.invoiceNumber
    );

    if (existingIndex > -1) {
        all[existingIndex] = record;
    } else {
        all.unshift(record);
    }

    writeJSON(DATA_FILE, all);
    res.json({ success: true });
});

// Delete a specific invoice for this PIN
app.delete("/api/invoices/:invoiceNumber", requireSecretCode, (req, res) => {
    const targetNum = decodeURIComponent(req.params.invoiceNumber);
    const all = readJSON(DATA_FILE);
    const filtered = all.filter(
        i => !(i.secretCode === req.secretCode && i.invoiceNumber === targetNum)
    );
    writeJSON(DATA_FILE, filtered);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});