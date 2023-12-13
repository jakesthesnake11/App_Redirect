const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');

const app = express();
const port = 3000;
const db = new sqlite3.Database('appRedirect.db');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Function to retrieve all redirects
function getAllRedirects(callback) {
    db.all("SELECT * FROM redirects ORDER BY appName ASC", [], (err, rows) => {
        callback(err, rows);
    });
}

// Route for serving the form page with list of URLs
app.get('/', (req, res) => {
    getAllRedirects((err, rows) => {
        if (err) {
            res.status(500).send("Error retrieving redirects.");
            return;
        }

        let html = rows.map(row => 
            `<li>${row.appName}: <a href="/redirect/${row.uniqueId}">Link</a></li>`
        ).join('');

        res.sendFile(__dirname + '/public/index.html', { html });
    });
});

// Route for form submission
app.post('/create', [
    body('appName').trim().escape(),
    body('appleStoreLink').trim().isURL().escape(),
    body('googlePlayLink').trim().isURL().escape()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).send("Failed to Create Link");
        return;
    }

    const { appName, appleStoreLink, googlePlayLink } = req.body;
    const uniqueId = uuidv4();

    db.run("INSERT INTO redirects (appName, appleLink, googleLink, uniqueId) VALUES (?, ?, ?, ?)", 
        [appName, appleStoreLink, googlePlayLink, uniqueId], 
        function (err) {
            if (err) {
                res.status(500).send("Failed to Create Link");
                return;
            }

            getAllRedirects((err, rows) => {
                if (err) {
                    res.status(500).send("Error retrieving redirects.");
                    return;
                }

                let listHtml = rows.map(row => 
                    `<li>${row.appName}: <a href="/redirect/${row.uniqueId}">Link</a></li>`
                ).join('');

                res.send(`<h1>Successfully Created Link</h1><ul>${listHtml}</ul><a href="/">Create Another Link</a>`);
            });
        }
    );
});

// Route for dynamic redirection
app.get('/redirect/:uniqueId', (req, res) => {
    const uniqueId = req.params.uniqueId;

    db.get("SELECT appleLink, googleLink FROM redirects WHERE uniqueId = ?", [uniqueId], (err, row) => {
        if (err || !row) {
            res.status(404).send('Link not found');
            return;
        }

        const dynamicPage = generateDynamicPage(row.appleLink, row.googleLink);
        res.send(dynamicPage);
    });
});

function generateDynamicPage(appleLink, googleLink) {
    // ... existing generateDynamicPage function ...
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});