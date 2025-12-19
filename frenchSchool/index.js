const puppeteer = require('puppeteer'); 

class frenchSchool {
    constructor(){
        this.calculateFrenchSchoolFees = calculateFrenchSchoolFees;
        this.generateInvoiceHTML = generateInvoiceHTML;
        this.pdfFunc = pdfFunc;
    }
}

function calculateFrenchSchoolFees(data) {
    const DEPOSIT = 1260000;
    const REGISTRATION_FEE_STD = 8400000;
    
    let tuition = 0;
    let registrationFee = 0;
    
    if (data.schoolYear === 'preschool') {
        tuition = (data.nationality === 'local') ? 20056400 : 24606400;
    } else {
        tuition = (data.nationality === 'local') ? 23556400 : 28876400;
    }

    if (data.existingChildren === 0) {
        registrationFee = REGISTRATION_FEE_STD;
    } else {
        registrationFee = 0;
    }

    let discountAmount = 0;
    if (data.existingChildren >= 2) {
        discountAmount = tuition * 0.05;
        tuition = tuition - discountAmount;
    }

    const total = DEPOSIT + registrationFee + tuition;

    return {
        deposit: DEPOSIT,
        registrationFee: registrationFee,
        tuitionBase: tuition + discountAmount, 
        tuitionFinal: tuition,
        discountApplied: discountAmount,
        total: total
    };
}

function generateInvoiceHTML(data, calcs) {
    const fmt = (num) => "Tsh " + num.toLocaleString('en-US');
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Helvetica', sans-serif; color: #333; padding: 40px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .logo { font-size: 24px; font-weight: bold; color: #002395; }
            .title { text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 30px; text-decoration: underline; }
            .info-box { margin-bottom: 30px; display: flex; justify-content: space-between; }
            .box { width: 45%; }
            .box h3 { border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; font-size: 14px; color: #555; }
            .box p { margin: 2px 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background-color: #f2f2f2; text-align: left; padding: 10px; border: 1px solid #ddd; font-size: 14px; }
            td { padding: 10px; border: 1px solid #ddd; font-size: 14px; }
            .text-right { text-align: right; }
            .total-row { font-weight: bold; background-color: #fafafa; }
            .notes { font-size: 12px; color: #666; margin-top: 40px; border-top: 2px solid #eee; padding-top: 10px; }
            .notes ul { padding-left: 20px; }
            .signature { margin-top: 60px; display: flex; justify-content: space-between; }
            .sig-line { border-top: 1px solid #000; width: 200px; padding-top: 5px; text-align: center; font-size: 12px; }
            .cta { text-align: center; margin-top: 40px; font-style: italic; font-weight: bold; color: #002395; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">FRENCH SCHOOL</div>
            <div style="text-align:right; font-size: 12px;">Date: ${date}</div>
        </div>
        <div class="title">Pro-forma Invoice</div>
        <div class="info-box">
            <div class="box">
                <h3>FROM</h3>
                <p><strong>The International French School</strong></p>
                <p>Dar es Salaam, Tanzania</p>
            </div>
            <div class="box">
                <h3>TO</h3>
                <p><strong>${data.parentName}</strong></p>
                <p>${data.address}</p>
                <p>${data.email}</p>
                <p>${data.phone}</p>
            </div>
        </div>
        <table>
            <thead>
                <tr>
                    <th style="width: 25%">Service</th>
                    <th style="width: 45%">Description</th>
                    <th style="width: 30%" class="text-right">Fees</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${data.schoolYear.toUpperCase()}</td>
                    <td>Tuition fees, supplies and insurance</td>
                    <td class="text-right">${fmt(calcs.tuitionFinal)}</td>
                </tr>
                <tr>
                    <td>Deposit</td>
                    <td>Refundable</td>
                    <td class="text-right">${fmt(calcs.deposit)}</td>
                </tr>
                <tr>
                    <td>1st Registration Fee</td>
                    <td>${calcs.registrationFee === 0 ? 'Waived (Existing Family)' : 'Non-refundable (1st Child)'}</td>
                    <td class="text-right">${fmt(calcs.registrationFee)}</td>
                </tr>
                <tr class="total-row">
                    <td colspan="2" class="text-right">TOTAL Due per year</td>
                    <td class="text-right">${fmt(calcs.total)}</td>
                </tr>
            </tbody>
        </table>
        <div class="notes">
            <strong>Notes:</strong>
            <ul>
                <li>Extra options for canteen and extracurricular activities can be discussed.</li>
                <li>5% off on tuition fees if paid before 30th June.</li>
                <li>5% off on tuition fees for 3rd child onwards.</li>
            </ul>
        </div>
        <div class="signature">
            <div></div> 
            <div class="sig-line">Authorized Signature</div>
        </div>
    </body>
    </html>
    `;
}

function pdfFunc(htmlContent, options = null) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("Starting PDF generation...");
            
            /*let launchConfig = {
                // 'new' is deprecated, use true or 'shell'. 'shell' is faster.
                headless: true, 
                args: [
                    '--no-sandbox', 
                    '--disable-setuid-sandbox', 
                    '--disable-dev-shm-usage',
                    '--disable-gpu'
                ]
            };*/
            let launchConfig = {
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
            }

            // PLATFORM CHECK
            if (process.platform === 'linux') {
                console.log("Detected Linux (Cloud Run/Docker). Using system executable.");
                launchConfig.executablePath = '/usr/bin/google-chrome';
            } else {
                console.log("Detected Windows/Local. Using cached 'chrome' channel.");
                // THIS IS THE FIX: Tell Puppeteer to use the 'chrome' version you just installed
                //launchConfig.channel = 'chrome'; 
            }

            console.log("Launching browser with config:", JSON.stringify(launchConfig));
            const browser = await puppeteer.launch(launchConfig);
            
            console.log("Browser launched. Opening page...");
            const page = await browser.newPage();

            console.log("Setting page content...");
            
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

             try {
                await page.waitForFunction('document.fonts.ready', { timeout: 5000 });
            } catch (e) {
                console.warn("[PDF Gen] Timeout waiting for document.fonts.ready, or font API not supported. Proceeding anyway.");
            }
            
            console.log("Generating PDF buffer...");
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' }
            });

            await browser.close();
            console.log("PDF generated successfully.");
            resolve(pdfBuffer);
        } catch (error) {
            console.error("CRITICAL PUPPETEER ERROR:", error);
            reject(error);
        }
    });
}

module.exports = frenchSchool;
