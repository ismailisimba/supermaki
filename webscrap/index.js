const crypt = require("../crypto");
const crypto = new crypt();
const puppeteer = require("puppeteer");
const pixelmatch = require("pixelmatch");
const fs = require("fs");
const PNG = require('pngjs').PNG;

const {BigQuery} = require('@google-cloud/bigquery');
const cookieMan = require("../cookieMan");
const cookieManager = new cookieMan();
const bigqueryClient = new BigQuery();
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const myBucket = storage.bucket('webscrapy');
const previousScreenshotPath = './temp/previous-screenshot.png';
const currentScreenshotPath = './temp/current-screenshot.png';
const diffScreenshotPath = './temp/diff-screenshot.png';
const filename = "./temp/temp6942.png"





class webscrap {
    constructor(){
        this.geturl = checksource;
        this.geturl = geturl;
        this.getoldscraps = getoldscraps;
        this.getscrap = getscrap
        this.comparescraps = comparescraps;
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

    
    let domain = (new URL(url));
    domain = domain.hostname;
    const browser = {};
    browser.b = await puppeteer.launch({args: ['--no-sandbox']});
    const page = {};
    page.b = await browser.b.newPage();
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
    browser.b.close();
    page.b = null;
    browser.b = null;
    ret.r = null;
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
        const fileData = await file.download().then(function(data) {
            const contents = data[0];
            return contents;
          }).catch(e=>{
            console.log(e);
          });
          res.set('Content-Disposition', `inline; filename="${req.params.id}"`);
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
    await file.download({ destination: filename });
    
    const browser = await puppeteer.launch({args: ['--no-sandbox']});
    const page = await browser.newPage();
    const date = cookieManager.customDateFormater();
    const timestamp = date.year+"_"+date.month+"_"+date.day+"_"+date.hour+"_"+date.minute+"_"+date.second.replaceAll(".","_");
    const currentScreenshotName = `${timestamp}-${domain.replaceAll(".","_")}.png`;
    
  
    // Download the file to a local file
    const localFilename = filename;
    await file.download({ destination: localFilename });
  
    // Launch Puppeteer and navigate to the URL
    await page.goto(urlToScreen);
  
    // Take a screenshot of the full page
    await page.screenshot({path: currentScreenshotPath, fullPage:true});
  
    // Close Puppeteer
    await browser.close();
  
    // Read the file and screenshot into PNG buffers
    const fileBuffer = fs.readFileSync(localFilename);
    const screenshotBuffer = fs.readFileSync(currentScreenshotPath)
    const fileImage = PNG.sync.read(fileBuffer);
    const screenshotImage = PNG.sync.read(screenshotBuffer);
  
    // Crop the screenshot to the same size as the file
    const { width, height } = fileImage;
    const croppedScreenshot = new PNG({ width, height });
    PNG.bitblt(screenshotImage, croppedScreenshot, 0, 0, width, height, 0, 0);
  
    // Compare the two images and log any differences
    const diffPixels = pixelmatch(fileImage.data, croppedScreenshot.data, null, width, height);
    if (diffPixels > 0) {
      await Promise.all([
        myBucket.upload(currentScreenshotPath, { destination: currentScreenshotName }),
      ]);
      const currentScreenshotUrl = `https://expresstoo-jzam6yvx3q-ez.a.run.app/getscrap/${currentScreenshotName}`;
      obj["newScreen"] = currentScreenshotUrl;
      obj["numOfDifPix"] = diffPixels;
    } else {
      console.log('No differences found');
      obj["numOfDifPix"] = null;
    }
      }else{
    obj.res = {"notValidUrl":urlToScreen};
      }
    res.send(obj)
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