const puppeteer = require('puppeteer');
// const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');


const fetchInstaPage = async (username) => {
    // const res = await fetch("https://readwell.onrender.com/");
    // const res = await fetch("https://www.instagram.com/tan1shq_c/");
    // const res = await fetch("https://www.instagram.com/chriswillx/");

    const browser = await puppeteer.launch({
        headless: 'new',
        // executablePath: path.join(__dirname, '.cache', 'puppeteer', 'chrome', 'linux-119.0.6045.105', 'chrome-linux64', 'chrome')
        executablePath: path.join('/opt', 'render', 'project', '.render', 'chrome', 'opt', 'google', 'chrome', 'chrome')
    });
    const page = await browser.newPage();
    let followersCount = -1;

    // Set the content of the page
    // await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4');
    await page.goto(`https://www.instagram.com/${username}/`, {
        waitUntil: 'networkidle0',
    });
    const content = await page.content();
    // fs.writeFile('page.html', content, (err) => console.log(err));

    const lis = await page.$$eval('meta', lis => {
        return lis.map(lis => lis.content.toLowerCase());
    });
    console.log(lis);

    // Search the array for "followers"
    const followersSpan = lis.find(text => text.includes('followers'));

    if (followersSpan) {
        // const text = "732 Followers, 753 Following, 3 Posts - See Instagram photos and videos from Tanishq Choudhary (@tan1shq_c)";

        // Use a regular expression to extract the number before "Followers"
        const match = followersSpan.match(/([\w.]+)\sfollowers/);

        if (match && match[1]) {
            followersCount = match[1];
            // followersCount = parseInt(match[1], 10);
            console.log('Followers count:', followersCount);
        } else {
            console.log('No followers count found.');
        }

    } else {
        console.log('No element containing "followers" found.');
    }

    // Close the browser
    await browser.close();
    return followersCount;
}

const app = express();
const port = process.env.PORT || 3000;

// Use body-parser middleware to parse JSON
app.use(bodyParser.json());
app.use(cors());

// Define a route that handles POST requests with JSON payload
app.get('/', async (req, res) => {
    const username = req.query.username;
    const followersCount = await fetchInstaPage(username);
    console.log(followersCount);
    res.json({ followersCount });
});

// Start the server
app.listen(port, async () => {
    console.log(`Server listening at http://localhost:${port}`);
});
