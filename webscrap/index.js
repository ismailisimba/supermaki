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





class webscrap {
    constructor(){
        this.checksource = checksource;
        this.getalliancepdf = getalliancepdf;
        this.geturl = geturl;
        this.getoldscraps = getoldscraps;
        this.getscrap = getscrap
        this.comparescraps = comparescraps;
        this.pdfFunc = pdfFunc;
    }
}


const checksource = async (req,res,next)=>{
    
    var rows = {};
    try{
        rows = await bigqueryClient
        .dataset("makione")
        .table("keys")
        .query(`SELECT *               
        FROM \`ismizo.makione.keys\`
        WHERE name='allkey'
        ORDER BY name NULLS LAST;`).then(r=>{
        return r;

    }).then((r)=>{
        
        const allkey = r[0][0].value;
        const bodyPlain = crypto.decrypt(req.body,allkey);
        const r2 = JSON.parse(bodyPlain);
        const obj = {};
        if(r2.usnum==="ismaadmin"){
            obj["source"] = "ok";
        }else{
            obj["source"] = "notok";
        };
        return obj;
    })
    }catch(e){
        rows = {"err":"err","details":JSON.stringify(e, null, 2)};
    }

        
    res.send(rows);
}

const geturl = async (req,res,next)=>{

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
    await page.b.screenshot({path: currentScreenshotPath, fullPage:true});


    const ret = {};
    ret.r = await Promise.all([
        myBucket.upload(currentScreenshotPath, { destination: currentScreenshotName }),
      ]);

    const currentScreenshotUrl = `https://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/${currentScreenshotName}`;


    res.send({domain,url,currentScreenshotUrl})
    await browser.b.close();
    }catch(e){
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
          res.set('Content-Disposition', `inline; filename="${req.params.id+meta.contentType.split("/")[1]}"`);
          res.contentType(`${meta.contentType}`);
          res.send(fileData);

      }else{
        res.send({"no":"scrap"});
      }

}

const comparescraps = async(req,res,next)=>{
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
        res.set('Content-Disposition', `inline; filename="${req.params.id}"`);
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

module.exports = webscrap;