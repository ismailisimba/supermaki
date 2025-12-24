const crypt = require("../crypto");
// const crypto = new crypt(); // Unused in this context based on provided code, using native crypto for hashing
const nativeCrypto = require('crypto'); // Renamed to avoid conflict
const puppeteer = require("puppeteer");
const fs = require("fs");
const fsp = require('fs.promises');
const path = require('path');
const { JSDOM } = require("jsdom");
const { BigQuery } = require('@google-cloud/bigquery');
const cookieMan = require("../cookieMan");
const cookieManager = new cookieMan();
// const bigqueryClient = new BigQuery(); // Unused in provided code
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const myBucket = storage.bucket('webscrapy');
const myBucket2 = storage.bucket('alliancepdf');

// CLOUD RUN CONFIGURATION
// Cloud Run only allows writing to /tmp
const TEMP_DIR = '/tmp'; 

const specialDomains = [];

class webscrap {
    constructor() {
        this.getalliancepdf = getalliancepdf;
        this.geturl = geturl;
        this.getoldscraps = getoldscraps;
        this.getscrap = getscrap;
        this.comparescraps = comparescraps;
        this.pdfFunc = pdfFunc;
    }
}

/**
 * Creates a safe, short filename using MD5 hashing to prevent ENAMETOOLONG errors.
 */
function createSafeFileName(url) {
    try {
        const urlObj = new URL(url);
        const hostName = urlObj.hostname.replace(/[^a-z0-9]/gi, '_');
        
        // Create a hash of the full URL to ensure uniqueness and short length
        const hash = nativeCrypto.createHash('md5').update(url).digest('hex');
        
        // Return hostname + hash (e.g., "example_com-9e107d9d372bb6826bd81d3542a419d6")
        return `${hostName}-${hash}`;
    } catch (e) {
        // Fallback for invalid URLs
        return nativeCrypto.createHash('md5').update(url).digest('hex');
    }
}

const isValidHttpUrl = (string) => {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}

const getoldscraps = async (req, res, next) => {
    const url = req.params.id;
    
    if (isValidHttpUrl(url)) {
        const safeFileName = createSafeFileName(url);
        // The safeFileName ends with the hash (after the last hyphen)
        const parts = safeFileName.split('-');
        const urlHash = parts[parts.length - 1]; 

        const matchingFiles = [];
        const [files] = await myBucket.getFiles();

        for (const file of files) {
            // We look for files that contain this unique hash
            if (file.name.includes(urlHash) && file.name.endsWith('.html')) {
                 matchingFiles.push("https://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/" + file.name);
            }
        }

        if (matchingFiles.length >= 1) {
            res.send({ safeFileName, matchingFiles });
        } else {
            const returnVal = { "no": "files" };
            res.send({ safeFileName, returnVal });
        }
    } else {
        res.send({ "notValidUrl": url });
    }
}

const geturl = async (req, res, next) => {
    const url = req.params.id;
    
    if (isValidHttpUrl(url)) {
        const safeFileName = createSafeFileName(url);
        let domain = (new URL(url)).hostname;

        try {
            const browser = await puppeteer.launch({ 
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'], // Added flags for Cloud Run stability
                ignoreHTTPSErrors: true, 
                headless: 'new' 
            });
            const page = await browser.newPage();
            
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'en-US',
            });

            await page.goto(url, { waitUntil: "networkidle2" });

            // Cookie Consent Logic
            await page.evaluate(_ => {
                function xcc_contains(selector, text) {
                    var elements = document.querySelectorAll(selector);
                    return Array.prototype.filter.call(elements, function (element) {
                        return RegExp(text, "i").test(element.textContent.trim());
                    });
                }
                var _xcc;
                _xcc = xcc_contains('[id*=cookie] a, [class*=cookie] a, [id*=cookie] button, [class*=cookie] button, [class*=cookie] i, [class*=close] i, #CybotCookiebotDialogBodyLevelButtonAccept', '^(Alle akzeptieren|Akzeptieren|Verstanden|Zustimmen|Okay|OK|ok|Accept|Close|close)$');
                if (_xcc != null && _xcc.length != 0) { _xcc[0].click(); }
            });

            // Disable animations for cleaner snapshots
            await page.evaluate(() => {
                const instantTransitionCssRule = '* { transition: none!important; animation: none!important; }';
                const styleSheet = document.createElement('style');
                styleSheet.setAttribute("type", "text/css");
                styleSheet.innerText = instantTransitionCssRule;
                document.head.appendChild(styleSheet);
            });

            await page.evaluate(() => window.scrollTo(0, 0));

            const date = cookieManager.customDateFormater();
            const timestamp = date.year + "_" + date.month + "_" + date.day + "_" + date.hour + "_" + date.minute + "_" + date.second.replaceAll(".", "_");
            
            const htmlContent = await page.content();
            
            // Define paths using /tmp/
            const htmlFilename = `${timestamp}-${safeFileName}.html`;
            const htmlPath = path.join(TEMP_DIR, htmlFilename);
            
            fs.writeFileSync(htmlPath, htmlContent);

            // Save JSON of body text
            const innerTextJsonFilename = `${timestamp}-${safeFileName}-innerText.json`;
            const innerTextJsonPath = path.join(TEMP_DIR, innerTextJsonFilename);
            
            const htmlString1 = await page.evaluate(() => document.body.innerHTML);
            const innerTextString = extractText(htmlString1);
            const { innerTextData, htmlString } = await extractInformation(htmlString1, innerTextString);
            
            await fsp.writeFile(innerTextJsonPath, JSON.stringify({ innerText: innerTextData, htmlData: htmlString }));

            // Upload HTML and JSON to Google Cloud Bucket
            await Promise.all([
                myBucket.upload(htmlPath, { destination: htmlFilename }),
                myBucket.upload(innerTextJsonPath, { destination: innerTextJsonFilename })
            ]);

            const pdfFilename = await trySavingPdf(timestamp, safeFileName, page);
            
            await browser.close();
            
            // Return filenames (or GCS paths) rather than local tmp paths
            res.send({ htmlPath: htmlFilename, pdfPath: pdfFilename, innerTextJsonPath: innerTextJsonFilename });

        } catch (e) {
            console.log(e);
            res.send("error");
        }

    } else {
        res.send({ "notValidUrl": url });
    }
};

const comparescraps = async (req, res, next) => {
    const urlToScreen = req.params.url;
    const oldScreen = req.params.picUrl; // This is a filename in the bucket
    
    if (isValidHttpUrl(urlToScreen)) {
        const safeFileName = createSafeFileName(urlToScreen);

        try {
            let domain = (new URL(urlToScreen)).hostname;
            const browser = await puppeteer.launch({ 
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'], 
                ignoreHTTPSErrors: true, 
                headless: 'new' 
            });
            const page = await browser.newPage();
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'en-US',
            });

            await page.goto(urlToScreen, { waitUntil: "networkidle2" });

            // Cookie logic
            await page.evaluate(_ => {
                function xcc_contains(selector, text) {
                    var elements = document.querySelectorAll(selector);
                    return Array.prototype.filter.call(elements, function (element) {
                        return RegExp(text, "i").test(element.textContent.trim());
                    });
                }
                var _xcc;
                _xcc = xcc_contains('[id*=cookie] a, [class*=cookie] a, [id*=cookie] button, [class*=cookie] button, [class*=cookie] i, [class*=close] i, #CybotCookiebotDialogBodyLevelButtonAccept', '^(Alle akzeptieren|Akzeptieren|Verstanden|Zustimmen|Okay|OK|ok|Accept|Close|close)$');
                if (_xcc != null && _xcc.length != 0) { _xcc[0].click(); }
            });

            await page.evaluate(() => {
                const instantTransitionCssRule = '* { transition: none!important; animation: none!important; }';
                const styleSheet = document.createElement('style');
                styleSheet.setAttribute("type", "text/css");
                styleSheet.innerText = instantTransitionCssRule;
                document.head.appendChild(styleSheet);
            });

            await page.evaluate(() => window.scrollTo(0, 0));

            // Check if old HTML exists in bucket
            const oldHtmlFile = myBucket.file(oldScreen);
            const [oldHtmlExists] = await oldHtmlFile.exists();

            const date = cookieManager.customDateFormater();
            const timestamp = date.year + "_" + date.month + "_" + date.day + "_" + date.hour + "_" + date.minute + "_" + date.second.replaceAll(".", "_");
            
            const htmlContent = await page.content();
            
            // Paths
            const htmlFilename = `${timestamp}-${safeFileName}.html`;
            const htmlPath = path.join(TEMP_DIR, htmlFilename);
            
            fs.writeFileSync(htmlPath, htmlContent);
            await myBucket.upload(htmlPath, { destination: htmlFilename });

            const innerTextJsonFilename = `${timestamp}-${safeFileName}-innerText.json`;
            const innerTextJsonPath = path.join(TEMP_DIR, innerTextJsonFilename);

            const htmlString1 = await page.evaluate(() => document.body.innerHTML);
            const innerTextString = extractText(htmlString1);
            const { innerTextData, htmlString } = await extractInformation(htmlString1, innerTextString);

            await fsp.writeFile(innerTextJsonPath, JSON.stringify({ innerText: innerTextData, htmlData: htmlString }));
            await myBucket.upload(innerTextJsonPath, { destination: innerTextJsonFilename });

            const pdfPath = await trySavingPdf(timestamp, safeFileName, page);

            if (!oldHtmlExists) {
                // If no old file, just save new stuff and return
                await browser.close();
                res.send({ 
                    message: "HTML and PDF saved", 
                    pdfUrl: `.../${pdfPath}`, 
                    htmlUrl: `.../${htmlFilename}`, 
                    jsonPath: `.../${innerTextJsonFilename}`, 
                    data: { comparisonResult: [{ "type": "No Difference" }] } 
                });
                return;
            } else {
                // Compare
                const comparisonResult = [];
                
                // We don't download the old file to disk here to avoid potential filename issues again,
                // we download it into memory to parse JSON.
                const oldInnerTextJsonFile = myBucket.file(`${oldScreen}`);
                const oldInnerTextData = await oldInnerTextJsonFile.download().then(data => JSON.parse(data[0])).catch(e => console.log(e));

                const resulty = findDifference(innerTextData, oldInnerTextData.innerText);
                const chanceOfDiff = typeof resulty != "string" ? parseFloat(resulty.string1DiffPercentage) : 0;
                
                if (resulty && resulty.string1Diff && chanceOfDiff > 5) {
                    if (true) {
                        comparisonResult.push(resulty);
                    }
                }

                if (comparisonResult.length === 0) {
                    comparisonResult.push({ type: 'No Difference' });
                }
                
                await browser.close();
                
                const ogHtml = htmlString;
                const data = { pdfPath, htmlPath: htmlFilename, oldScreen, innerTextJsonPath: innerTextJsonFilename, comparisonResult, ogHtml };
                const someHtml = await generateEmailHtml(data, urlToScreen);
                data.htmlString = undefined;
                res.send({ data, someHtml });
            }

        } catch (e) {
            console.log(e);
            res.send(e.message)
        }

    } else {
        res.send({ "notValidUrl": urlToScreen });
    }
};

const pdfFunc = async (f, res, next) => {
    const bodyPost = f.fields;
    const filename = bodyPost.name;
    const fileData = bodyPost.data;
    const file = myBucket2.file(filename);
    const url = await file.save(Buffer.from(fileData, "base64"), {
        contentType: "application/pdf",
        resumable: false,
    }).then(() => {
        return `https://expresstoo-jzam6yvx3q-ez.a.run.app/getalliancepdf/${filename}`;
    })
    res.send({ url: url });
}

const getalliancepdf = async (req, res, next) => {
    const file = myBucket2.file(req.params.id);
    const exists = await file.exists();

    if (exists[0]) {
        const meta = await file.getMetadata().then(function (data) {
            return data[0];
        });
        const fileData = await file.download().then(function (data) {
            return data[0];
        }).catch(e => {
            console.log(e);
        });
        res.set('Content-Disposition', `inline; filename="${req.params.id + "." + meta.contentType.split("/")[1]}"`);
        res.contentType(`${meta.contentType}`);
        res.send(fileData);

    } else {
        res.send({ "no": "pdf" });
    }
}

const getscrap = async (req, res, next) => {
    const file = myBucket.file(req.params.id);
    const exists = await file.exists();

    if (exists[0]) {
        const meta = await file.getMetadata().then(function (data) {
            return data[0];
        });
        const fileData = await file.download().then(function (data) {
            return data[0];
        }).catch(e => {
            console.log(e);
        });
        res.set('Content-Disposition', `inline; filename="${req.params.id + "." + meta.contentType.split("/")[1]}"`);
        res.contentType(`${meta.contentType}`);
        res.send(fileData);

    } else {
        res.send({ "no": "scrap" });
    }
}

function findDifference(str1, str2) {
    if(!str1 || !str2) return '';
    const words1 = str1.split(/(\s+)/);
    const words2 = str2.split(/(\s+)/);
    let i = 0;
    let j = 0;
    let similarities = [];
    let diff1 = [];
    let diff2 = [];

    while (i < words1.length && j < words2.length) {
        let tempSim = [];
        while (i < words1.length && j < words2.length && words1[i] === words2[j]) {
            tempSim.push(words1[i]);
            i++;
            j++;
        }
        if (tempSim.length > 0) similarities.push(...tempSim);

        let tempDiff1 = [];
        let tempDiff2 = [];
        while (i < words1.length && (j >= words2.length || words1[i] !== words2[j])) {
            tempDiff1.push(words1[i]);
            i++;
        }
        while (j < words2.length && (i >= words1.length || words1[i] !== words2[j])) {
            tempDiff2.push(words2[j]);
            j++;
        }

        if (tempDiff1.length > 0 || tempDiff2.length > 0) {
            diff1.push(...tempDiff1);
            diff2.push(...tempDiff2);
        }
    }

    if (i < words1.length) diff1.push(...words1.slice(i));
    if (j < words2.length) diff2.push(...words2.slice(j));

    let similarityPercentage = 0;
    let string1DiffPercentage = 0;
    let string2DiffPercentage = 0;

    const actualWords1 = words1.filter(word => word.trim() !== '');
    if (actualWords1.length > 0) {
        similarityPercentage = (similarities.filter(word => word.trim() !== '').length / actualWords1.length) * 100;
        string1DiffPercentage = (diff1.filter(word => word.trim() !== '').length / actualWords1.length) * 100;
        string2DiffPercentage = (diff2.filter(word => word.trim() !== '').length / actualWords1.length) * 100;
    }

    if (diff1.length > 0 || diff2.length > 0 || similarities.length > 0) {
        return {
            string1Diff: diff1.join(""),
            string1DiffLength: diff1.length,
            string2Diff: diff2.join(""),
            string2DiffLength: diff2.length,
            similarities: similarities.join(""),
            similarityPercentage: similarityPercentage.toFixed(2),
            string1DiffPercentage: string1DiffPercentage.toFixed(2),
            string2DiffPercentage: string2DiffPercentage.toFixed(2),
        };
    } else {
        return '';
    }
}

const generateEmailHtml = async (data, domain) => {
    // Extract necessary data
    const { pdfPath, htmlPath, oldScreen, comparisonResult, ogHtml } = data;

    // Check if comparisonResult exists and has content
    if (!comparisonResult || comparisonResult.length === 0 || !comparisonResult[0].string1Diff) {
        return `
    <div style="max-width: 600px; margin: auto;">
      <h2 style="font-family: Arial, sans-serif;">AGA Source Checking Report for <a href="${domain}">${domain}</a> </h2>
      <p style="font-family: Arial, sans-serif;">PDF: <a href="http://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/${pdfPath}" target="_blank" style="color: #007bff; text-decoration: none;">${pdfPath}</a></p>
      <p style="font-family: Arial, sans-serif;">HTML: <a href="http://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/${htmlPath}" target="_blank" style="color: #007bff; text-decoration: none;">${htmlPath}</a></p>
      <p style="font-family: Arial, sans-serif;">Old Screen: <a href="http://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/${oldScreen.replace('-innerText.json', '.pdf')}" target="_blank" style="color: #007bff; text-decoration: none;">${oldScreen.replace('-innerText.json', '.pdf')}</a></p>

      <h3 style="font-family: Arial, sans-serif; font-color:green;">No New Text Detected</h3>
      <p style="font-family: 'Arial', Courier, monospace; font-size:12px">No new text has been detected during this run.</p>
    </div>
`;
    }

    // Extract differences and similarities
    const { string1Diff } = comparisonResult[0];
    const { htmlString } = await extractInformation(ogHtml, string1Diff);

    // Build the email HTML content
    const emailHtml = `
      <div style="max-width: 600px; margin: auto;">
        <h2 style="font-family: Arial, sans-serif;">AGA Source Checking Report for <a href="${domain}">${domain}</a> </h2>
        <p style="font-family: Arial, sans-serif;">PDF: <a href="http://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/${pdfPath}" target="_blank" style="color: #007bff; text-decoration: none;">${pdfPath}</a></p>
        <p style="font-family: Arial, sans-serif;">HTML: <a href="http://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/${htmlPath}" target="_blank" style="color: #007bff; text-decoration: none;">${htmlPath}</a></p>
        <p style="font-family: Arial, sans-serif;">Old Screen: <a href="http://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/${oldScreen.replace('-innerText.json', '.pdf')}" target="_blank" style="color: #007bff; text-decoration: none;">${oldScreen.replace('-innerText.json', '.pdf')}</a></p>

        <h3 style="font-family: Arial, sans-serif; font-color:red">New Text Detected</h3>
        <p style="font-family: 'Arial', Courier, monospace; font-size:12px">'${htmlString}'</p>
      </div>
  `;

    return emailHtml;
};

const trySavingPdf = async (timestamp, safeFileName, page) => {
    try {
        const pdfFilename = `${timestamp}-${safeFileName}.pdf`;
        const pdfPath = path.join(TEMP_DIR, pdfFilename);
        
        await page.pdf({ path: pdfPath });
        
        await myBucket.upload(pdfPath, { destination: pdfFilename });
        return pdfFilename;
    } catch (e) {
        console.log(e);
        return e.message;
    }
}

function extractText(htmlString) {
    // Parse the HTML string with JSDOM
    const dom = new JSDOM(htmlString);
    const document = dom.window.document;

    // Define the tag names to extract text from
    const tags = ["div", "p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "table"];

    // Collect text from the specified elements
    let extractedText = "";
    tags.forEach(tag => {
        const elements = document.querySelectorAll(tag);
        elements.forEach(element => {
            extractedText += element.textContent + "\n"; // Append text with a newline for readability
        });
    });

    return extractedText.trim();
}

async function extractInformation(htmlString, innerTextString) {
    const dom = new JSDOM(htmlString);
    const document = dom.window.document;
    const extractedHtmlElements = [];
    const innerN = innerTextString;

    document.querySelectorAll("img, video, style, script, input, button, .dbg-query, #privacy_overview, #strict-necessary-cookies, .moove-gdpr-strict-warning-message, .moove-gdpr-tab-main-content, .moove-gdpr-strict-secondary-warning-message").forEach((e) => { e.remove(); })

    // Function to handle table extraction
    function handleTable(table) {
        const tableText = table.textContent;
        if (innerTextString.includes(tableText)) {
            extractedHtmlElements.push(table.textContent);
            innerTextString = innerTextString.replace(tableText, '');
        }
    }

    // Function to handle generic element extraction (headings, paragraphs, lists)
    function handleElement(element) {
        const elementText = element.textContent;
        if (innerTextString.includes(elementText)) {
            extractedHtmlElements.push(element.outerHTML);
            innerTextString = innerTextString.replace(elementText, '');
        }
    }
    // Iterate through all headings, paragraphs, lists, and tables
    const elements = document.querySelectorAll(" h1, h2, h3, h4, h5, h6, p, p ul, p ol, table");
    elements.forEach((ele) => {
        ele.removeAttribute('style');  // Remove inline styles
        ele.removeAttribute('class');
        let trimmedInnerHTML = ele.innerHTML.trim();
        ele.innerHTML = trimmedInnerHTML;
        updateFontSize(ele, ele.tagName.toLowerCase())
    })

    for (const element of elements) {
        if (element.tagName.toLowerCase() === 'table') {
            handleTable(element);
        } else {
            handleElement(element);
        }
    }

    return {
        innerTextData: innerN,
        htmlString: extractedHtmlElements.join(''),
    };
}

function updateFontSize(element, query) {
    let fontSize;

    switch (query) {
        case "h1":
            fontSize = "18px";
            break;
        case "h2":
        case "h3":
            fontSize = "16px";
            break;
        case "h4":
            fontSize = "14px";
            break;
        case "h5":
            fontSize = "13px";
            break;
        case "h6":
            fontSize = "13px";
            break;
        case "p":
        case "p ul":
        case "p ol":
            fontSize = "12px";
            break;
        default:
            console.error("Unknown query:", query);
            return;
    }

    element.style.fontSize = fontSize;
}

module.exports = webscrap;
