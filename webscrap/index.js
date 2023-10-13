const crypt = require("../crypto");
const crypto = new crypt();
const puppeteer = require("puppeteer");
const pixelmatch = require("pixelmatch");
const fs = require("fs");
const fsp = require('fs.promises');
const PNG = require('pngjs').PNG;
const sharp = require('sharp');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

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
    browser.b = await puppeteer.launch({args: ['--no-sandbox'],ignoreHTTPSErrors:true,headless:'new'});
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
    //await new Promise(resolve => setTimeout(resolve, 3000));
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
    const safeFileName = createSafeFileName(url);
    if(isValidHttpUrl(url)){
    let domain = (new URL(url));
    domain = domain.hostname;
    //const searchTerm = domain.replaceAll(".","_")
    const searchTerm = safeFileName;
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


function createSafeFileName(url) {
  // Remove protocol and domain from the URL, if present
  const hostName = new URL(url).hostname;
  const path = url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/, '');

  // Replace unsafe characters with _, and replace = with -
  const safeName = path.replace(/[\/\\:*?"<>|]/g, '_').replace(/=/g, '-');

  return hostName.replaceAll(".","_") +"-"+safeName;
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
    //await new Promise(resolve => setTimeout(resolve, 3000));

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
  const safeFileName = createSafeFileName(url);
  if (isValidHttpUrl(url)) {
    let domain = (new URL(url)).hostname;

    // Check if domain requires special action
    if (specialDomains.includes(domain)) {
      // Custom actions for special domains
    }

    try{

      const browser = await puppeteer.launch({args: ['--no-sandbox'],ignoreHTTPSErrors:true,headless:'new'});
      const page = await browser.newPage();
      await page.setUserAgent('Chrome/91.0.4472.124')
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US',
      });
      

      await page.goto(url, { waitUntil: "networkidle2" });
      //await new Promise(resolve => setTimeout(resolve, 3000));

      await page.evaluate(_ => {
        function xcc_contains(selector, text) {
          var elements = document.querySelectorAll(selector);
          return Array.prototype.filter.call(elements, function(element){
              return RegExp(text, "i").test(element.textContent.trim());
          });
      }
      var _xcc;
      _xcc = xcc_contains('[id*=cookie] a, [class*=cookie] a, [id*=cookie] button, [class*=cookie] button, [class*=cookie] i, [class*=close] i, #CybotCookiebotDialogBodyLevelButtonAccept', '^(Alle akzeptieren|Akzeptieren|Verstanden|Zustimmen|Okay|OK|ok|Accept|Close|close)$');
      if (_xcc != null && _xcc.length != 0) { _xcc[0].click(); }
      });

      // Add these lines to set the user agent and locale
      //await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
   

  // Add this line to disable animations
  await page.evaluate(() => {
    const instantTransitionCssRule = '* { transition: none!important; animation: none!important; }';
    const styleSheet = document.createElement('style');
    styleSheet.setAttribute("type","text/css");
    styleSheet.innerText = instantTransitionCssRule;
    document.head.appendChild(styleSheet);
  });

  // Add this line to scroll to the top before taking a screenshot
  await page.evaluate(() => window.scrollTo(0, 0));







      const date = cookieManager.customDateFormater();
      const timestamp = date.year+"_"+date.month+"_"+date.day+"_"+date.hour+"_"+date.minute+"_"+date.second.replaceAll(".","_");
      const htmlContent = await page.content();
      const htmlPath = `${timestamp}-${safeFileName}.html`;
      fs.writeFileSync(htmlPath, htmlContent);
  
      // Save PDF
      

      //Save JSON of body text
      const innerTextJsonPath = `${timestamp}-${safeFileName}-innerText.json`;
      //const innerTextData = await page.evaluate(() => document.body.innerText);
      const htmlString = await page.evaluate(() => document.body.innerHTML);
      const innerTextData =  await extractReadableData(htmlString)
      await fsp.writeFile(innerTextJsonPath, JSON.stringify({ innerText: innerTextData }));
  
      // Upload HTML and PDF to Google Cloud Bucket
      await Promise.all([
        myBucket.upload(htmlPath, { destination: htmlPath }),
        //myBucket.upload(pdfPath, { destination: pdfPath }),
        myBucket.upload(innerTextJsonPath, { destination: innerTextJsonPath })
  
      ]);
      const pdfPath = await trySavingPdf(timestamp,safeFileName,page);
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
  const safeFileName = createSafeFileName(urlToScreen);
  if (isValidHttpUrl(urlToScreen)) {

    try{
    let domain = (new URL(urlToScreen)).hostname;
    const browser = await puppeteer.launch({args: ['--no-sandbox'],ignoreHTTPSErrors:true,headless:'new'});
    const page = await browser.newPage();
    await page.setUserAgent('Chrome/91.0.4472.124');
    await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US',
    });
        
        // Cookie logic
        await page.goto(urlToScreen, { waitUntil: "networkidle2" });
        //await new Promise(resolve => setTimeout(resolve, 3000));

        await page.evaluate(_ => {
          function xcc_contains(selector, text) {
            var elements = document.querySelectorAll(selector);
            return Array.prototype.filter.call(elements, function(element){
                return RegExp(text, "i").test(element.textContent.trim());
            });
        }
        var _xcc;
        _xcc = xcc_contains('[id*=cookie] a, [class*=cookie] a, [id*=cookie] button, [class*=cookie] button, [class*=cookie] i, [class*=close] i, #CybotCookiebotDialogBodyLevelButtonAccept', '^(Alle akzeptieren|Akzeptieren|Verstanden|Zustimmen|Okay|OK|ok|Accept|Close|close)$');
        if (_xcc != null && _xcc.length != 0) { _xcc[0].click(); }
        });

        // Add these lines to set the user agent and locale
        //await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
       

        // Add this line to disable animations
        await page.evaluate(() => {
        const instantTransitionCssRule = '* { transition: none!important; animation: none!important; }';
        const styleSheet = document.createElement('style');
        styleSheet.setAttribute("type","text/css");
        styleSheet.innerText = instantTransitionCssRule;
        document.head.appendChild(styleSheet);
        });

        // Add this line to scroll to the top before taking a screenshot
        await page.evaluate(() => window.scrollTo(0, 0));


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
      const htmlPath = `${timestamp}-${safeFileName}.html`;
      fs.writeFileSync(htmlPath, htmlContent);
      await myBucket.upload(htmlPath, { destination: htmlPath });

      //
      const innerTextJsonPath = `${timestamp}-${safeFileName}-innerText.json`;
      //const innerTextData = await page.evaluate(() => document.body.innerText);
      const htmlString = await page.evaluate(() => document.body.innerHTML);
      const innerTextData =  await extractReadableData(htmlString)
      await fsp.writeFile(innerTextJsonPath, JSON.stringify({ innerText: innerTextData }));
      await myBucket.upload(innerTextJsonPath, { destination: innerTextJsonPath });
  

      // Save and Upload PDF
      const pdfPath = await trySavingPdf(timestamp,safeFileName,page);
      await browser.close();
      res.send({ message: "HTML and PDF saved", pdfUrl: `.../${pdfPath}`, htmlUrl: `.../${htmlPath}`,jsonPath:`.../${innerTextJsonPath}`,data:{comparisonResult:[{"type":"No Difference"}]} });
      return;
    }else{
    
          // Save and Upload HTML
          const date = cookieManager.customDateFormater();
          const timestamp = date.year+"_"+date.month+"_"+date.day+"_"+date.hour+"_"+date.minute+"_"+date.second.replaceAll(".","_");
          const htmlContent = await page.content();
          const htmlPath = `${timestamp}-${safeFileName}.html`;
          fs.writeFileSync(htmlPath, htmlContent);
          await myBucket.upload(htmlPath, { destination: htmlPath });

          //
          const innerTextJsonPath = `${timestamp}-${safeFileName}-innerText.json`;
          //const innerTextData = await page.evaluate(() => document.body.innerText);
          const htmlString2 = await page.evaluate(() => document.body.innerHTML);
          const innerTextData =  await extractReadableData(htmlString2)
          await fsp.writeFile(innerTextJsonPath, JSON.stringify({ innerText: innerTextData }));
          await myBucket.upload(innerTextJsonPath, { destination: innerTextJsonPath });
      
    
          // Save and Upload PDF
          const pdfPath = await trySavingPdf(timestamp,safeFileName,page);
        
      
        
      
      const comparisonResult = [];

          const oldInnerTextJsonFile = myBucket.file(`${oldScreen}`);
    
      
          //const htmlComp = await compareHtmlFromBucket(urlToScreen,`${oldScreen.replace('-innerText.json','.html')}`);
          //console.log("shitShow1",htmlComp)
      
            const oldInnerTextData = await oldInnerTextJsonFile.download().then(data => JSON.parse(data[0])).catch(e => console.log(e));
          const htmlString = await page.evaluate(() => document.body.innerHTML);
          const newInnerTextData =  await extractReadableData(htmlString);
          const resulty = findDifference(newInnerTextData, oldInnerTextData.innerText);
          const chanceOfDiff = typeof resulty!="string"?parseFloat(resulty.string1DiffPercentage):0;
          if (resulty && resulty.string1Diff && chanceOfDiff>5) {
            console.log("resulty",resulty)
              //const htmlComp = await compareHtmlFromBucket(urlToScreen,`${oldScreen.replace('-innerText.json','.html')}`);
              //console.log("shitShow1",htmlComp)
           if(true){
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



const compareHtmlFromBucket = async (url,filename) => {
  // Initialize browser and page
  const browser = await puppeteer.launch({args: ['--no-sandbox'],ignoreHTTPSErrors:true,headless:'new'});
  const page = await browser.newPage();

  // Navigate to URL and get its HTML content
  await page.goto(url, { waitUntil: 'networkidle2' });
  //await new Promise(resolve => setTimeout(resolve, 3000));

  const newHtmlContent = await page.content();

  // Evaluate the new page to a constant
  const newPageData = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    return Array.from(elements).map(el => ({
      tagName: el.tagName,
      id: el.id,
      className: el.className,
      attributes: Array.from(el.attributes).map(attr => ({ name: attr.name, value: attr.value })),
      innerText: el.innerText,
    }));
  });

  const file = myBucket.file(filename);

  let oldHtmlContent;
  try {
    oldHtmlContent = (await file.download())[0].toString();
  } catch (err) {
    console.error('Error downloading file from bucket:', err);
    return false;
  }

  // Load the old HTML content into a new Puppeteer page
  const oldPage = await browser.newPage();
  await oldPage.setContent(oldHtmlContent);

  // Evaluate the old page to a constant
  const oldPageData = await oldPage.evaluate(() => {
    const elements = document.querySelectorAll('*');
    return Array.from(elements).map(el => ({
      tagName: el.tagName,
      id: el.id,
      className: el.className,
      attributes: Array.from(el.attributes).map(attr => ({ name: attr.name, value: attr.value })),
      innerText: el.innerText,
    }));
  });

  await browser.close();

  // Now compare the oldPageData and newPageData constants
  if (oldPageData.length !== newPageData.length) {
    return true; // Different number of elements
  }

  for (let i = 0; i < oldPageData.length; i++) {
    const oldEl = oldPageData[i];
    const newEl = newPageData[i];

    if (false//oldEl.tagName !== newEl.tagName || 
        //oldEl.id !== newEl.id //|| 
        //oldEl.className !== newEl.className || 
        //oldEl.innerText !== newEl.innerText// ||
        //oldEl.attributes.length !== newEl.attributes.length

        ){
      return true; // Differences found
    }

    /*for (let j = 0; j < oldEl.attributes.length; j++) {
      const oldAttr = oldEl.attributes[j];
      const newAttr = newEl.attributes.find(attr => attr.name === oldAttr.name);
      if (!newAttr || newAttr.value !== oldAttr.value) {
        return true; // Attribute differences found
      }
    }*/
  }

  return false; // No differences found
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

/*function findDifference(str1, str2) {
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

  // Calculate percentages
  let similarityPercentage = 0;
  let string1DiffPercentage = 0;

  const totalSimilarityLength = similarities.reduce((acc, s) => acc + s.length, 0);
  if (str1.length > 0) {
    similarityPercentage = (totalSimilarityLength / str1.length) * 100;
    string1DiffPercentage = (diff1.length / str1.length) * 100;
  }

  // Return the results
  if (diff1 || diff2 || similarities.length > 0) {
    return {
      string1Diff: diff1,
      string2Diff: diff2,
      similarities: similarities,
      similarityPercentage: similarityPercentage.toFixed(2),
      string1DiffPercentage: string1DiffPercentage.toFixed(2),
    };
  } else {
    return '';
  }
}*/

/*function findDifference(str1, str2) {
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);
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

  if (words1.length > 0) {
    similarityPercentage = (similarities.length / words1.length) * 100;
    string1DiffPercentage = (diff1.length / words1.length) * 100;
  }

  if (diff1.length > 0 || diff2.length > 0 || similarities.length > 0) {
    return {
      string1Diff: diff1.join(" "),
      string2Diff: diff2.join(" "),
      similarities: similarities.join(" "),
      similarityPercentage: similarityPercentage.toFixed(2),
      string1DiffPercentage: string1DiffPercentage.toFixed(2),
    };
  } else {
    return '';
  }
}*/

function findDifference(str1, str2) {
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






const generateEmailHtml = (data, domain) => {
  // Extract necessary data
  const { pdfPath, htmlPath, oldScreen, comparisonResult } = data;

  // Check if comparisonResult exists and has content
  if (!comparisonResult || comparisonResult.length === 0 || !comparisonResult[0].string1Diff) {
    return `
    <div style="max-width: 600px; margin: auto;">
      <h2 style="font-family: Arial, sans-serif;">AGA Source Checking Report for <a href="${domain}">${domain}</a> </h2>
      <p style="font-family: Arial, sans-serif;">PDF: <a href="http://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/${pdfPath}" target="_blank" style="color: #007bff; text-decoration: none;">${pdfPath}</a></p>
      <p style="font-family: Arial, sans-serif;">HTML: <a href="http://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/${htmlPath}" target="_blank" style="color: #007bff; text-decoration: none;">${htmlPath}</a></p>
      <p style="font-family: Arial, sans-serif;">Old Screen: <a href="http://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/${oldScreen.replace('-innerText.json','.pdf')}" target="_blank" style="color: #007bff; text-decoration: none;">${oldScreen.replace('-innerText.json','.pdf')}</a></p>

      <h3 style="font-family: Arial, sans-serif; font-color:green;">No New Text Detected</h3>
      <p style="font-family: 'Arial', Courier, monospace; font-size:12px">No new text has been detected during this run.</p>
    </div>
`;
  }

  // Extract differences and similarities
  const { string1Diff } = comparisonResult[0];

  // Build the email HTML content
  const emailHtml = `
      <div style="max-width: 600px; margin: auto;">
        <h2 style="font-family: Arial, sans-serif;">AGA Source Checking Report for <a href="${domain}">${domain}</a> </h2>
        <p style="font-family: Arial, sans-serif;">PDF: <a href="http://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/${pdfPath}" target="_blank" style="color: #007bff; text-decoration: none;">${pdfPath}</a></p>
        <p style="font-family: Arial, sans-serif;">HTML: <a href="http://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/${htmlPath}" target="_blank" style="color: #007bff; text-decoration: none;">${htmlPath}</a></p>
        <p style="font-family: Arial, sans-serif;">Old Screen: <a href="http://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/${oldScreen.replace('-innerText.json','.pdf')}" target="_blank" style="color: #007bff; text-decoration: none;">${oldScreen.replace('-innerText.json','.pdf')}</a></p>


        <h3 style="font-family: Arial, sans-serif; font-color:red">New Text Detected</h3>
        <p style="font-family: 'Arial', Courier, monospace; font-size:12px">${string1Diff}</p>
      </div>
  `;

  return emailHtml;
};



const trySavingPdf =async(timestamp,domain,page)=>{
          try{
          const pdfPath = `${timestamp}-${domain.replaceAll(".", "_")}.pdf`;
          await page.pdf({ path: pdfPath});
          await myBucket.upload(pdfPath, { destination: pdfPath });
          return pdfPath
          }catch(e){
            console.log(e);
            return e.message;
          }
}



async function extractReadableData(htmlString) {
    const dom = new JSDOM(htmlString);
    const document = dom.window.document;
    let resultText = '';

    function processNode(node) {
        if (node.nodeType === 1) {  // Element node
            const tagName = node.tagName.toLowerCase();
            if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'].includes(tagName)) {
                resultText += node.textContent + '\n';
            } else if (tagName === 'table') {
                const rows = node.rows;
                for (let i = 0; i < rows.length; i++) {
                    const cols = rows[i].cells;
                    for (let j = 0; j < cols.length; j++) {
                        resultText += cols[j].textContent + '\t';
                    }
                    resultText += '\n';
                }
            } else if (tagName === 'ul' || tagName === 'ol') {
                const prevSibling = node.previousElementSibling;
                const nextSibling = node.nextElementSibling;
                if (prevSibling && prevSibling.tagName.toLowerCase() === 'p' ||
                    nextSibling && nextSibling.tagName.toLowerCase() === 'p') {
                    const items = node.querySelectorAll('li');
                    items.forEach(item => {
                        resultText += '- ' + item.textContent + '\n';
                    });
                }
            }
            // Recur for each child node
            for (let child of node.childNodes) {
                processNode(child);
            }
        }
    }

    processNode(document.body);
    return resultText;
}

// Usage:
// Assume htmlString contains the innerHTML of the body of the webpage
// const htmlString = "<body>...</body>";
// extractReadableData(htmlString).then(text => console.log(text));











module.exports = webscrap;