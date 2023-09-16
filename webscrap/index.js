const crypt = require("../crypto");
const crypto = new crypt();
const puppeteer = require("puppeteer");
const pixelmatch = require("pixelmatch");
const fs = require("fs");
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
      res.send(e);
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
  
      // Upload HTML and PDF to Google Cloud Bucket
      await Promise.all([
        myBucket.upload(htmlPath, { destination: htmlPath }),
        myBucket.upload(pdfPath, { destination: pdfPath })
      ]);
      await browser.close();
      res.send({htmlPath,pdfPath})

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

      // Save and Upload PDF
      const pdfPath = `${timestamp}-${domain.replaceAll(".", "_")}.pdf`;
      await page.pdf({ path: pdfPath, format: "A4" });
      await myBucket.upload(pdfPath, { destination: pdfPath });
      await browser.close();
      res.send({ message: "HTML and PDF saved", pdfUrl: `.../${pdfPath}`, htmlUrl: `.../${htmlPath}` });
      return;
    }else{
    
          // Save and Upload HTML
          const date = cookieManager.customDateFormater();
          const timestamp = date.year+"_"+date.month+"_"+date.day+"_"+date.hour+"_"+date.minute+"_"+date.second.replaceAll(".","_");
          const htmlContent = await page.content();
          const htmlPath = `${timestamp}-${domain.replaceAll(".", "_")}.html`;
          fs.writeFileSync(htmlPath, htmlContent);
          await myBucket.upload(htmlPath, { destination: htmlPath });
    
          // Save and Upload PDF
          const pdfPath = `${timestamp}-${domain.replaceAll(".", "_")}.pdf`;
          await page.pdf({ path: pdfPath, format: "A4" });
          await myBucket.upload(pdfPath, { destination: pdfPath });
         
        
        
      const elementsData = await page.evaluate(() => {
        const data = [];
        document.querySelectorAll('*').forEach((element) => {
          if (element.childElementCount === 0) {
            data.push({
              id: element.id,
              className: element.className,
              innerText: element.innerText,
            });
          }
        });
        return data;
      });
        
      
      const comparisonResult = [];
      const oldFileData = await oldHtmlFile.download().then(data => data[0]).catch(e => {
          console.log(e);
        });
        
        // Convert oldFileData to elements and compare
        await page.setContent(oldFileData.toString());

        const oldElementsData = await page.evaluate(() => {
          const data = [];
          document.querySelectorAll('*').forEach((element) => {
            if(element.childElementCount=== 0){
              data.push({
                id: element.id,
                className: element.className,
                innerText: element.innerText,
              });
            }
          });
          return data;
        });

        const newElements = elementsData.filter(onlyUnique);
        const oldElements = oldElementsData.filter(onlyUnique);

        for (let i = 0; i < Math.min(newElements.length, oldElements.length); i++) {
           if (newElements[i].innerText&&newElements[i].innerText.length>1&& hasThreeWordsWithTwoLettersOrMore(newElements[i].innerText)&& newElements[i].innerText !== oldElements[i].innerText&&!containsCode(oldElements[i].innerText) && !containsCode(newElements[i].innerText)) {
            comparisonResult.push({
              type: 'Text Mismatch',
              element: newElements[i],
              oldText: oldElements[i].innerText,
              newText: newElements[i].innerText
            });
          }
        }

        if (comparisonResult.length === 0) {
          comparisonResult.push({ type: 'No Difference' });
        }
        await browser.close();
        const data = { pdfPath, htmlPath, oldScreen,comparisonResult };
        const someHtml = generateHTML(data,urlToScreen);
        res.send({data,someHtml});
      

      
    }

  }catch(e){
    console.log(e);
    res.send(e)
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




function generateHTML(data,domain) {
  const baseURL = 'https://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap';

  let htmlString = `
    <h1>Comparison results for <a href="${domain}">${domain}</a></h1>
    <table border="1">
      <thead>
        <tr>
          <th>HTML Path</th>
          <th>PDF Path</th>
          <th>Old Screen</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><a href="${baseURL}/${data.htmlPath}">${data.htmlPath}</a></td>
          <td><a href="${baseURL}/${data.pdfPath}">${data.pdfPath}</a></td>
          <td><a href="${baseURL}/${data.oldScreen}">${data.oldScreen}</a></td>
        </tr>
      </tbody>
    </table>
    <h2>New Text</h2>
  `;

  for (const item of data.comparisonResult) {
    htmlString += `
      <table border="1">
        <thead>
          <tr>
            <th>Type</th>
            <th>ID</th>
            <th>Class Name</th>
            <th>Old Text</th>
            <th>New Text</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${item.type}</td>
            <td>${item.element.id}</td>
            <td>${item.element.className}</td>
            <td>${item.oldText}</td>
            <td style="color: red;">${item.newText}</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  return htmlString;
}












module.exports = webscrap;