const puppeteer = require('puppeteer'); 

class frenchSchool {
    constructor(){
        this.calculateFrenchSchoolFees = calculateFrenchSchoolFees;
        this.generateInvoiceHTML = generateInvoiceHTML;
        this.pdfFunc = pdfFunc;
    }
}

function calculateFrenchSchoolFees(data) {
    // Constants from the 2025-2026 Schedule
    const DEPOSIT = 1260000;
    const REG_FEE_STD = 8400000;
    const INSURANCE = 176400; // Flat rate for all
    
    let tuition = 0;
    let supplies = 0;
    let registrationFee = 0;
    let categoryColor = "#000"; // Default
    let categoryName = "";

    const isLocal = (data.nationality === 'local'); // Tanzanian or French

    // 1. Determine Base Fees based on Level
    switch (data.schoolYear) {
        case 'preschool':
            categoryName = "PRESCHOOL (TPS, PS, MS, GS)";
            categoryColor = "#5C9BD5"; // Light Blue
            supplies = 980000;
            tuition = isLocal ? 18900000 : 23450000;
            break;
        case 'primary':
            categoryName = "PRIMARY SCHOOL (CP - CM2)";
            categoryColor = "#ED7D31"; // Orange
            supplies = 980000;
            tuition = isLocal ? 22400000 : 27720000;
            break;
        case 'middle':
            categoryName = "MIDDLE SCHOOL (6e - 3e)";
            categoryColor = "#70AD47"; // Green
            supplies = 980000;
            tuition = isLocal ? 28000000 : 35280000;
            break;
        case 'high':
            categoryName = "HIGH SCHOOL (2nde - Terminale)";
            categoryColor = "#A074A0"; // Purple
            supplies = 2240000; // Higher supplies for High School
            tuition = isLocal ? 32900000 : 42840000;
            break;
    }

    // 2. Determine Registration Fee (Waived if family already has children at school)
    if (data.existingChildren === 0) {
        registrationFee = REG_FEE_STD;
    } else {
        registrationFee = 0;
    }

    // 3. Calculate Discount (5% on tuition only for 3rd child+)
    let discountAmount = 0;
    if (data.existingChildren >= 2) {
        discountAmount = tuition * 0.05;
    }

    const totalAnnual = tuition + supplies + INSURANCE - discountAmount;
    const grandTotal = totalAnnual + DEPOSIT + registrationFee;

    return {
        level: categoryName,
        color: categoryColor,
        nationalityType: isLocal ? "Tanzanian & French Families" : "Other Nationalities",
        deposit: DEPOSIT,
        registrationFee: registrationFee,
        tuition: tuition,
        supplies: supplies,
        insurance: INSURANCE,
        discount: discountAmount,
        totalAnnual: totalAnnual,
        grandTotal: grandTotal
    };
}

function generateInvoiceHTML(data, calcs) {
    const fmt = (num) => num.toLocaleString('en-US') + " TZS";
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
            
            body { 
                font-family: 'Montserrat', Helvetica, Arial, sans-serif; 
                color: #444; 
                /* Removed padding here to let PDF margins handle the edge */
                padding: 0; 
                margin: 0;
                -webkit-print-color-adjust: exact; 
                font-size: 13px; /* Slightly reduced base font size to fit better with smaller margins */
            }
            
            /* Header Section */
            .header-logos { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .logo-placeholder { 
                width: 150px; height: 70px; background: #f0f0f0; display: flex; 
                align-items: center; justify-content: center; color: #999; font-size: 10px; border: 1px dashed #ccc;
            }
            
            .school-title { text-align: center; color: #3458A5; margin-bottom: 5px; }
            .school-title h1 { margin: 0; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; }
            
            .invoice-title { 
                text-align: center; font-size: 24px; color: #6FA8DC; margin: 15px 0; font-weight: 300; 
                text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 10px;
            }
            
            /* Client Info */
            .client-box { 
                background: #f9fbfd; padding: 15px; border-radius: 6px; margin-bottom: 20px; 
                display: flex; justify-content: space-between; border-left: 5px solid #3458A5;
            }
            .client-col h3 { margin-top: 0; margin-bottom: 5px; font-size: 11px; color: #888; text-transform: uppercase; }
            .client-col p { margin: 2px 0; font-weight: 600; font-size: 13px; }

            /* Fee Table */
            .fee-container { margin-bottom: 20px; border: 1px solid #eee; border-radius: 6px; overflow: hidden; }
            
            .category-header { 
                background-color: ${calcs.color}; 
                color: white; 
                padding: 10px 15px; 
                font-size: 16px; 
                font-weight: bold; 
                text-transform: uppercase;
            }

            table { width: 100%; border-collapse: collapse; }
            td, th { padding: 10px 15px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
            th { text-align: left; background-color: #fafafa; color: #666; font-size: 11px; text-transform: uppercase; }
            .col-amount { text-align: right; font-weight: 600; }
            
            .row-subtotal { background-color: #fcfcfc; color: #555; }
            .row-total { background-color: ${calcs.color}; color: white; font-size: 15px; font-weight: bold; }
            .row-total td { border: none; }

            /* One Time Fees */
            .one-time-section { margin-top: 20px; margin-bottom: 25px; }
            .one-time-header { font-size: 13px; font-weight: bold; color: #3458A5; text-transform: uppercase; margin-bottom: 8px; border-bottom: 2px solid #3458A5; display: inline-block; }

            .notes { font-size: 10px; color: #777; margin-top: 30px; background: #f5f5f5; padding: 12px; border-radius: 5px; }
            .notes ul { margin: 0; padding-left: 20px; }
            .notes li { margin-bottom: 3px; }

            .footer-contact { margin-top: 20px; text-align: center; font-size: 11px; color: #3458A5; }
        </style>
    </head>

    <body>
        
        <!-- Header -->
        <div class="header-logos">
            <!-- Replace contents with <img> tags -->
            
            <img src="https://www.frenchschooltanzania.org/wp-content/uploads/2017/10/Logo-250.png" style="height: 60px;">
            <img src="https://www.frenchschooltanzania.org/wp-content/uploads/2017/10/logo_aefe_ec-300x154.png" style="height: 60px;">
            
        </div>

        <div class="school-title">
            <h1>International French School in Tanzania</h1>
            <span style="font-size: 11px; color: #e06666;">Lycée Français International De Tanzanie</span>
        </div>

        <div class="invoice-title">
            Pro-forma Invoice <span style="font-size: 14px; color: #999;">2025 - 2026</span>
        </div>

        <!-- Client Info -->
        <div class="client-box">
            <div class="client-col">
                <h3>Bill To</h3>
                <p>${data.parentName}</p>
                <p style="font-weight: 400;">${data.email}</p>
                <p style="font-weight: 400;">${data.phone}</p>
            </div>
            <div class="client-col" style="text-align: right;">
                <h3>Details</h3>
                <p>Date: ${date}</p>
                <p>Nationality Cat: ${calcs.nationalityType}</p>
            </div>
        </div>

        <!-- Annual Fees Table -->
        <div class="fee-container">
            <div class="category-header">
                ${calcs.level}
            </div>
            <table>
                <tr>
                    <th width="60%">Description</th>
                    <th width="40%" class="col-amount">Amount</th>
                </tr>
                <tr>
                    <td>Tuition Fees</td>
                    <td class="col-amount">${fmt(calcs.tuition)}</td>
                </tr>
                <tr>
                    <td>School Supplies</td>
                    <td class="col-amount">${fmt(calcs.supplies)}</td>
                </tr>
                <tr>
                    <td>Insurance</td>
                    <td class="col-amount">${fmt(calcs.insurance)}</td>
                </tr>
                
                ${calcs.discount > 0 ? `
                <tr style="color: #d9534f;">
                    <td><i>Less: 5% Sibling Discount (on Tuition only)</i></td>
                    <td class="col-amount">- ${fmt(calcs.discount)}</td>
                </tr>
                ` : ''}

                <tr class="row-subtotal">
                    <td><strong>Total Annual Fees</strong></td>
                    <td class="col-amount">${fmt(calcs.totalAnnual)}</td>
                </tr>
            </table>
        </div>

        <!-- One Time Fees -->
        <div class="one-time-section">
            <div class="one-time-header">Registration & Deposit</div>
            <table>
                <tr>
                    <td width="60%">Deposit <span style="font-size:10px; color:#666;">(Refundable per child)</span></td>
                    <td width="40%" class="col-amount">${fmt(calcs.deposit)}</td>
                </tr>
                <tr>
                    <td>1st Registration Fee <span style="font-size:10px; color:#666;">(Non-refundable, 1st child only)</span></td>
                    <td class="col-amount">
                        ${calcs.registrationFee === 0 ? '<span style="color:#999; font-weight:normal;">Waived</span>' : fmt(calcs.registrationFee)}
                    </td>
                </tr>
            </table>
        </div>

        <!-- Grand Total -->
        <div style="background: #3458A5; color: white; padding: 12px 15px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 14px; text-transform: uppercase;">Total Payable Amount</div>
            <div style="font-size: 22px; font-weight: bold;">${fmt(calcs.grandTotal)}</div>
        </div>

        <!-- Notes Footer -->
        <div class="notes">
            <strong>Payment Terms & Notes:</strong>
            <ul>
                <li><strong>Deposit:</strong> Payable at enrollment (refundable).</li>
                <li><strong>Discount:</strong> 5% on tuition fees if annual invoice is paid before June 30th.</li>
                <li><strong>Sibling Discount:</strong> 5% on tuition fees of the third child registered (included above if applicable).</li>
                <li><strong>Global Package:</strong> For embassies and companies, a customized invoice including extra options can be requested.</li>
                <li>Prices are in TZS (Tanzanian Shillings).</li>
            </ul>
        </div>

        <div class="footer-contact">
            More info: raf@frenchschooltanzania.org | Contact: 0769 059 655
        </div>

    </body>
    </html>
    `;
}

function pdfFunc(htmlContent, options = null) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("Starting PDF generation...");
            
            let launchConfig = {
                headless: 'shell', 
                args: [
                    '--no-sandbox', 
                    '--disable-setuid-sandbox', 
                    '--disable-dev-shm-usage',
                    '--disable-gpu'
                ]
            };

            if (process.platform === 'linux') {
                launchConfig.executablePath = '/usr/bin/google-chrome';
            } else {
                launchConfig.channel = 'chrome'; 
            }

            const browser = await puppeteer.launch(launchConfig);
            const page = await browser.newPage();
            
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
            
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                // UPDATED MARGINS: 10mm (1cm) on all sides
                margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
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
