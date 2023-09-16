const crypt = require("../crypto");
const crypto = new crypt();
const puppeteer = require("puppeteer");
const pixelmatch = require("pixelmatch");
const fs = require("fs");
const fsp = require('fs.promises');
const PNG = require('pngjs').PNG;
const sharp = require('sharp');

const {BigQuery} = require('@google-cloud/bigquery');
const cookieMan = require("../cookieMan");
const cookieManager = new cookieMan();
const bigqueryClient = new BigQuery();
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const myBucket = storage.bucket('webscrapy');
const myBucket2 = storage.bucket('alliancepdf');
const previousScreenshotPath = './temp/previous-screenshot.png';
const currentScreenshotPath = './temp/current-screenshot.png';
const diffScreenshotPath = './temp/diff-screenshot.png';
const filename = "./temp/temp6942.png"
const specialDomains = [];




class webscrap {
    constructor(){
        this.getalliancepdf = getalliancepdf;
        this.geturl = geturl;
        this.getoldscraps = getoldscraps;
        this.getscrap = getscrap
        this.comparescraps = comparescraps;
        this.pdfFunc = pdfFunc;
    }
}


const geturl_old = async (req,res,next)=>{

    const url = req.params.id;
    if(isValidHttpUrl(url)){


      try{

    
    let domain = (new URL(url));
    domain = domain.hostname;
    const browser = {};
    browser.b = await puppeteer.launch({args: ['--no-sandbox'],ignoreHTTPSErrors:true});
    const page = {};
    page.b = await browser.b.newPage();
    await page.b.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });
    
    const date = cookieManager.customDateFormater();
    const timestamp = date.year+"_"+date.month+"_"+date.day+"_"+date.hour+"_"+date.minute+"_"+date.second.replaceAll(".","_");
    const currentScreenshotName = `${timestamp}-${domain.replaceAll(".","_")}.png`;

    await page.b.goto(url,{waitUntil:"networkidle2"});
    await page.b.evaluate(_ => {
      function xcc_contains(selector, text) {
          var elements = document.querySelectorAll(selector);
          return Array.prototype.filter.call(elements, function(element){
              return RegExp(text, "i").test(element.textContent.trim());
          });
      }
      var _xcc;
      _xcc = xcc_contains('[id*=cookie] a, [class*=cookie] a, [id*=cookie] button, [class*=cookie] button', '^(Alle akzeptieren|Akzeptieren|Verstanden|Zustimmen|Okay|OK|Accept)$');
      if (_xcc != null && _xcc.length != 0) { _xcc[0].click(); }
  });
    await page.b.screenshot({path: currentScreenshotPath, fullPage:true});


    const ret = {};
    ret.r = await Promise.all([
        myBucket.upload(currentScreenshotPath, { destination: currentScreenshotName }),
      ]);

    const currentScreenshotUrl = `https://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/${currentScreenshotName}`;


    res.send({domain,url,currentScreenshotUrl})
    await browser.b.close();
    }catch(e){
      console.log(e);
      res.send(e.message);
    }

  }else{
    res.send({"notValidUrl":url})
  }
}

const getoldscraps = async (req,res,next)=>{
    const url = req.params.id;
    if(isValidHttpUrl(url)){
    let domain = (new URL(url));
    domain = domain.hostname;
    const searchTerm = domain.replaceAll(".","_")
    const matchingFiles = [];
    
    const [files] = await myBucket.getFiles();

    for (const file of files) {
        // Check if the file's name contains the search term
        if (file.name.includes(searchTerm)) {
          matchingFiles.push("https://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/"+file.name);
        }
      }

      if(matchingFiles.length>=1){
        res.send({domain,matchingFiles})
      }else{
        const returnVal = {"no":"files"}
        res.send({domain,returnVal})
      }
    }else{
      res.send({"notValidUrl":url})
    }
}

const getscrap_old =  async(req,res,next) =>{
    const file = myBucket.file(req.params.id);
    const exists = await file.exists();

      if(exists[0]){
        const meta = await file.getMetadata().then(function(data) {
          const metadata = data[0];
          const apiResponse = data[1];
          return metadata;
        });
        const fileData = await file.download().then(function(data) {
            const contents = data[0];
            return contents;
          }).catch(e=>{
            console.log(e);
          });
          res.set('Content-Disposition', `inline; filename="${req.params.id+"."+meta.contentType.split("/")[1]}"`);
          res.contentType(`${meta.contentType}`);
          res.send(fileData);

      }else{
        res.send({"no":"scrap"});
      }

}

const comparescraps_old = async(req,res,next)=>{
    const obj ={} 
    const urlToScreen = req.params.url;
    if(isValidHttpUrl(urlToScreen)){
    const oldScreen =  req.params.picUrl;
    const file = myBucket.file(oldScreen);
    let domain = (new URL(urlToScreen));
    domain = domain.hostname;
    obj["1"] = {urlToScreen,oldScreen};

    // Download the file from the bucket
    await file.download({ destination: previousScreenshotPath });
    
    const browser = await puppeteer.launch({args: ['--no-sandbox'],ignoreHTTPSErrors:true});
    const page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    });
    const date = cookieManager.customDateFormater();
    const timestamp = date.year+"_"+date.month+"_"+date.day+"_"+date.hour+"_"+date.minute+"_"+date.second.replaceAll(".","_");
    const currentScreenshotName = `${timestamp}-${domain.replaceAll(".","_")}.png`;
    
  
    // Launch Puppeteer and navigate to the URL
    await page.goto(urlToScreen,{waitUntil:"networkidle2"});
    await page.evaluate(_ => {
      function xcc_contains(selector, text) {
          var elements = document.querySelectorAll(selector);
          return Array.prototype.filter.call(elements, function(element){
              return RegExp(text, "i").test(element.textContent.trim());
          });
      }
      var _xcc;
      _xcc = xcc_contains('[id*=cookie] a, [class*=cookie] a, [id*=cookie] button, [class*=cookie] button', '^(Alle akzeptieren|Akzeptieren|Verstanden|Zustimmen|Okay|OK|Accept)$');
      if (_xcc != null && _xcc.length != 0) { _xcc[0].click(); }
  });
  
    // Take a screenshot of the full page
    await page.screenshot({path: currentScreenshotPath, fullPage:true});
  
    // Close Puppeteer
    await browser.close();
  
    // Read the file and screenshot into PNG buffers
    const fileBuffer = fs.readFileSync(previousScreenshotPath);
    const screenshotBuffer = fs.readFileSync(currentScreenshotPath);
    const fileImage = PNG.sync.read(fileBuffer);
    const screenshotImage = PNG.sync.read(screenshotBuffer);
    const widthY = fileImage.width;
    const heightY = fileImage.height;
    const widthX = screenshotImage.width;
    const heightX = screenshotImage.height;
    const XY = {};
    XY.height = heightX>heightY?heightY:heightX;
    XY.width = widthX>widthY?widthY:widthX;

     // Crop the screenshot and file to same size using lowest common dimensions
    const newFile = await sharp(fileBuffer)
    .extract({left: 0, width: XY.width, height: XY.height, top: 0})
    .toBuffer();
    const newScreen = await sharp(screenshotBuffer)
    .extract({left: 0, width: XY.width, height: XY.height, top: 0})
    .toBuffer();
    
    XY.fileData = PNG.sync.read(newFile);
    XY.screenData = PNG.sync.read(newScreen);
  
    // Compare the two images and log any differences
    const diffPixels = pixelmatch(XY.fileData.data, XY.screenData.data, null, XY.width, XY.height);
    if (diffPixels/(XY.height*XY.width) > 0.15) {
      await Promise.all([
        myBucket.upload(currentScreenshotPath, { destination: currentScreenshotName }),
      ]);
      const currentScreenshotUrl = `https://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/${currentScreenshotName}`;
      obj["newScreen"] = currentScreenshotUrl;
      obj["numOfDifPix"] = diffPixels;
      obj["percDiff"] = diffPixels/(XY.height*XY.width);
    } else {
      await Promise.all([
        myBucket.upload(currentScreenshotPath, { destination: currentScreenshotName }),
      ]);
      const currentScreenshotUrl = `https://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/${currentScreenshotName}`;
      obj["newScreen"] = currentScreenshotUrl;
      console.log('No differences found');
      obj["numOfDifPix"] = diffPixels;
      obj["percDiff"] = diffPixels/(XY.height*XY.width);
    }
      }else{
    obj.res = {"notValidUrl":urlToScreen};
      }
    res.send(obj)
}




const pdfFunc = async(f, res, next)=>{
  const bodyPost = f.fields;
  const filename = bodyPost.name
  const fileData = bodyPost.data;
  const file = myBucket2.file(filename);
  const url = await file.save(Buffer.from(fileData,"base64"), {
    contentType: "application/pdf",
    resumable: false,
  }).then(()=>{
    return `https://expresstoo-jzam6yvx3q-ez.a.run.app/getalliancepdf/${filename}`;
  })
  res.send({url:url});
}




const getalliancepdf =  async(req,res,next) =>{
  const file = myBucket2.file(req.params.id);
  const exists = await file.exists();

    if(exists[0]){
      const meta = await file.getMetadata().then(function(data) {
        const metadata = data[0];
        const apiResponse = data[1];
        return metadata;
      });
      const fileData = await file.download().then(function(data) {
          const contents = data[0];
          return contents;
        }).catch(e=>{
          console.log(e);
        });
        res.set('Content-Disposition', `inline; filename="${req.params.id+"."+meta.contentType.split("/")[1]}"`);
        res.contentType(`${meta.contentType}`);
        res.send(fileData);

    }else{
      res.send({"no":"pdf"});
    }

}






const isValidHttpUrl = (string)=>{
  let url;
  
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }

  return url.protocol === "http:" || url.protocol === "https:";
}



const geturl = async (req, res, next) => {
  const url = req.params.id;
  if (isValidHttpUrl(url)) {
    let domain = (new URL(url)).hostname;

    // Check if domain requires special action
    if (specialDomains.includes(domain)) {
      // Custom actions for special domains
    }

    try{

      const browser = await puppeteer.launch({args: ['--no-sandbox'], ignoreHTTPSErrors: true});
      const page = await browser.newPage();

      await page.goto(url, { waitUntil: "networkidle2" });
      await page.evaluate(_ => {
        function xcc_contains(selector, text) {
          var elements = document.querySelectorAll(selector);
          return Array.prototype.filter.call(elements, function(element){
              return RegExp(text, "i").test(element.textContent.trim());
          });
      }
      var _xcc;
      _xcc = xcc_contains('[id*=cookie] a, [class*=cookie] a, [id*=cookie] button, [class*=cookie] button', '^(Alle akzeptieren|Akzeptieren|Verstanden|Zustimmen|Okay|OK|Accept)$');
      if (_xcc != null && _xcc.length != 0) { _xcc[0].click(); }
      });
      const date = cookieManager.customDateFormater();
      const timestamp = date.year+"_"+date.month+"_"+date.day+"_"+date.hour+"_"+date.minute+"_"+date.second.replaceAll(".","_");
      const htmlContent = await page.content();
      const htmlPath = `${timestamp}-${domain.replaceAll(".", "_")}.html`;
      fs.writeFileSync(htmlPath, htmlContent);
  
      // Save PDF
      const pdfPath = `${timestamp}-${domain.replaceAll(".", "_")}.pdf`;
      await page.pdf({ path: pdfPath, format: "A4" });

      //Save JSON of body text
      const innerTextJsonPath = `${timestamp}-${domain.replaceAll(".", "_")}-innerText.json`;
      const innerTextData = await page.evaluate(() => document.body.innerText);
      await fsp.writeFile(innerTextJsonPath, JSON.stringify({ innerText: innerTextData }));
  
      // Upload HTML and PDF to Google Cloud Bucket
      await Promise.all([
        myBucket.upload(htmlPath, { destination: htmlPath }),
        myBucket.upload(pdfPath, { destination: pdfPath }),
        myBucket.upload(innerTextJsonPath, { destination: innerTextJsonPath })
  
      ]);
      await browser.close();
      res.send({htmlPath,pdfPath,innerTextJsonPath})

    }catch(e){
      console.log(e)
      res.send ("error");
    }
   

  } else {
    res.send({ "notValidUrl": url });
  }
};




const comparescraps = async (req, res, next) => {
  const urlToScreen = req.params.url;
  const oldScreen =  req.params.picUrl;
  if (isValidHttpUrl(urlToScreen)) {

    try{
    let domain = (new URL(urlToScreen)).hostname;
    const browser = await puppeteer.launch({ args: ['--no-sandbox'], ignoreHTTPSErrors: true });
    const page = await browser.newPage();
        
        // Cookie logic
        await page.goto(urlToScreen, { waitUntil: "networkidle2" });
        await page.evaluate(_ => {
          function xcc_contains(selector, text) {
            var elements = document.querySelectorAll(selector);
            return Array.prototype.filter.call(elements, function(element){
                return RegExp(text, "i").test(element.textContent.trim());
            });
        }
        var _xcc;
        _xcc = xcc_contains('[id*=cookie] a, [class*=cookie] a, [id*=cookie] button, [class*=cookie] button', '^(Alle akzeptieren|Akzeptieren|Verstanden|Zustimmen|Okay|OK|Accept)$');
        if (_xcc != null && _xcc.length != 0) { _xcc[0].click(); }
        });

    // Check if domain requires special action
    if (specialDomains.includes(domain)) {
      // Custom actions for special domains
    }

    // ... rest of your code
    // Check if old HTML exists, if not, save new HTML and PDF
    const oldHtmlFile = myBucket.file(oldScreen);
    const [oldHtmlExists] = await oldHtmlFile.exists();
    if (!oldHtmlExists) {
      // Save and Upload HTML
      const date = cookieManager.customDateFormater();
      const timestamp = date.year+"_"+date.month+"_"+date.day+"_"+date.hour+"_"+date.minute+"_"+date.second.replaceAll(".","_");
      const htmlContent = await page.content();
      const htmlPath = `${timestamp}-${domain.replaceAll(".", "_")}.html`;
      fs.writeFileSync(htmlPath, htmlContent);
      await myBucket.upload(htmlPath, { destination: htmlPath });

      //
      const innerTextJsonPath = `${timestamp}-${domain.replaceAll(".", "_")}-innerText.json`;
      const innerTextData = await page.evaluate(() => document.body.innerText);
      await fsp.writeFile(innerTextJsonPath, JSON.stringify({ innerText: innerTextData }));
      await myBucket.upload(innerTextJsonPath, { destination: innerTextJsonPath });
  

      // Save and Upload PDF
      const pdfPath = `${timestamp}-${domain.replaceAll(".", "_")}.pdf`;
      await page.pdf({ path: pdfPath, format: "A4" });
      await myBucket.upload(pdfPath, { destination: pdfPath });
      await browser.close();
      res.send({ message: "HTML and PDF saved", pdfUrl: `.../${pdfPath}`, htmlUrl: `.../${htmlPath}`,jsonPath:`.../${innerTextJsonPath}`,data:{comparisonResult:[{"type":"No Difference"}]} });
      return;
    }else{
    
          // Save and Upload HTML
          const date = cookieManager.customDateFormater();
          const timestamp = date.year+"_"+date.month+"_"+date.day+"_"+date.hour+"_"+date.minute+"_"+date.second.replaceAll(".","_");
          const htmlContent = await page.content();
          const htmlPath = `${timestamp}-${domain.replaceAll(".", "_")}.html`;
          fs.writeFileSync(htmlPath, htmlContent);
          await myBucket.upload(htmlPath, { destination: htmlPath });

          //
          const innerTextJsonPath = `${timestamp}-${domain.replaceAll(".", "_")}-innerText.json`;
          const innerTextData = await page.evaluate(() => document.body.innerText);
          await fsp.writeFile(innerTextJsonPath, JSON.stringify({ innerText: innerTextData }));
          await myBucket.upload(innerTextJsonPath, { destination: innerTextJsonPath });
      
    
          // Save and Upload PDF
          const pdfPath = `${timestamp}-${domain.replaceAll(".", "_")}.pdf`;
          await page.pdf({ path: pdfPath, format: "A4" });
          await myBucket.upload(pdfPath, { destination: pdfPath });
        
      
        
      
      const comparisonResult = [];

          const oldInnerTextJsonFile = myBucket.file(`${oldScreen}-innerText.json`);
          const [oldInnerTextJsonExists] = await oldInnerTextJsonFile.exists();
          if (oldInnerTextJsonExists) {
          const oldInnerTextData = await oldInnerTextJsonFile.download().then(data => JSON.parse(data[0])).catch(e => console.log(e));

          const newInnerTextData = await page.evaluate(() => document.body.innerText);
          const resulty = findDifference(newInnerTextData, oldInnerTextData.innerText);
          if (resulty && resulty.string1Diff) {
          comparisonResult.push(resulty);
          }
          }



// Now, comparisonResult contains all your mismatches


        if (comparisonResult.length === 0) {
          comparisonResult.push({ type: 'No Difference' });
        }
        await browser.close();
        const data = { pdfPath, htmlPath, oldScreen, innerTextJsonPath,comparisonResult };
        const someHtml = generateEmailHtml(data,urlToScreen);
        res.send({data,someHtml});
      

      
    }

  }catch(e){
    console.log(e);
    res.send(e.message)
  }
      
  } else {
    res.send({ "notValidUrl": urlToScreen });
  }
};

function onlyUnique(value, index, array) {
  return array.indexOf(value) === index;
}

function hasThreeWordsWithTwoLettersOrMore(newText) {
  // Remove any extra white spaces and split the text into an array of words
  const words = newText.trim().split(/\s+/);

  // Filter out words that have less than 2 characters
  const filteredWords = words.filter(word => word.length >= 2);

  // Check if there are at least 3 such words
  return filteredWords.length >= 3;
}

const containsCode = (text) => {
  return /<[^>]*>|{[^}]*}|;/.test(text);
};

const getscrap =  async(req,res,next) =>{
  const file = myBucket.file(req.params.id);
  const exists = await file.exists();

    if(exists[0]){
      const meta = await file.getMetadata().then(function(data) {
        const metadata = data[0];
        const apiResponse = data[1];
        return metadata;
      });
      const fileData = await file.download().then(function(data) {
          const contents = data[0];
          return contents;
        }).catch(e=>{
          console.log(e);
        });
        res.set('Content-Disposition', `inline; filename="${req.params.id+"."+meta.contentType.split("/")[1]}"`);
        res.contentType(`${meta.contentType}`);
        res.send(fileData);

    }else{
      res.send({"no":"scrap"});
    }

}

function findDifference(str1, str2) {
  console.log("str1",str1)
  console.log("str2",str2)
  let i = 0;
  let j = 0;
  let similarities = [];
  let diff1 = "";
  let diff2 = "";

  while (i < str1.length && j < str2.length) {
    // Find similar parts
    let tempSim = "";
    while (i < str1.length && j < str2.length && str1[i] === str2[j]) {
      tempSim += str1[i];
      i++;
      j++;
    }
    if (tempSim) similarities.push(tempSim);

    // Find different parts
    let tempDiff1 = "";
    let tempDiff2 = "";
    while (i < str1.length && (j >= str2.length || str1[i] !== str2[j])) {
      tempDiff1 += str1[i];
      i++;
    }
    while (j < str2.length && (i >= str1.length || str1[i] !== str2[j])) {
      tempDiff2 += str2[j];
      j++;
    }

    if (tempDiff1 || tempDiff2) {
      diff1 += tempDiff1;
      diff2 += tempDiff2;
    }
  }

  // Check if there are remaining characters in either string
  if (i < str1.length) diff1 += str1.slice(i);
  if (j < str2.length) diff2 += str2.slice(j);

  // Return the results
  if (diff1 || diff2) {
    return {
      string1Diff: diff1,
      string2Diff: diff2,
      similarities: similarities,
    };
  } else {
    return '';
  }
}




const generateEmailHtml = (data, domain) => {
  // Extract necessary data
  const { pdfPath, htmlPath, oldScreen, comparisonResult } = data;

  // Check if comparisonResult exists and has content
  if (!comparisonResult || comparisonResult.length === 0 || !comparisonResult[0].string1Diff) {
    return `
    <div style="max-width: 600px; margin: auto;">
      <h1 style="font-family: Arial, sans-serif;">AGA Source Checking Report for <a href="${domain}">${domain}</a> </h1>
      <p style="font-family: Arial, sans-serif;">PDF: <a href="http://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/${pdfPath}" target="_blank" style="color: #007bff; text-decoration: none;">${pdfPath}</a></p>
      <p style="font-family: Arial, sans-serif;">HTML: <a href="http://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/${htmlPath}" target="_blank" style="color: #007bff; text-decoration: none;">${htmlPath}</a></p>
      <p style="font-family: Arial, sans-serif;">Old Screen: <a href="http://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/${oldScreen}" target="_blank" style="color: #007bff; text-decoration: none;">${oldScreen}</a></p>

      <h2 style="font-family: Arial, sans-serif; font-color:green;">No New Text Detected</h2>
      <pre style="font-family: 'Arial', Courier, monospace;">No new text has been detected during this run.</pre>
    </div>
`;
  }

  // Extract differences and similarities
  const { string1Diff } = comparisonResult[0];

  // Build the email HTML content
  const emailHtml = `
      <div style="max-width: 600px; margin: auto;">
        <h1 style="font-family: Arial, sans-serif;">AGA Source Checking Report for <a href="${domain}">${domain}</a> </h1>
        <p style="font-family: Arial, sans-serif;">PDF: <a href="http://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/${pdfPath}" target="_blank" style="color: #007bff; text-decoration: none;">${pdfPath}</a></p>
        <p style="font-family: Arial, sans-serif;">HTML: <a href="http://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/${htmlPath}" target="_blank" style="color: #007bff; text-decoration: none;">${htmlPath}</a></p>
        <p style="font-family: Arial, sans-serif;">Old Screen: <a href="http://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/${oldScreen}" target="_blank" style="color: #007bff; text-decoration: none;">${oldScreen}</a></p>

        <h2 style="font-family: Arial, sans-serif; font-color:red">New Text Detected</h2>
        <pre style="font-family: 'Arial', Courier, monospace;">${string1Diff}</pre>
      </div>
  `;

  return emailHtml;
};















module.exports = webscrap;