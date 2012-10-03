var gm = (require('gm')),
    fs = require('fs'),
    path = require('path'),
    config = require('./config'),
    progress = new require('progress'),
    opts = config.options,
    bpCount = (function () {
      var c = 0;
      Object.keys(config.breakpoints).forEach(function(bpList) {
          c += config.breakpoints[bpList].length;
      });      
      return c;
    }()),
    imCount = 0,
    bar, 
    
    artisticDirectionMethods = {
      zoom : function (srcPath, newWidth, outStream, cb) {
        var zoomLevel = opts.artisticDirection.zoom || '112.5%';
        
        zoomLevel = zoomLevel.replace(/[^\d.]/g, '')/100;
        
        gm(fs.createReadStream(srcPath))
        .resize(newWidth * zoomLevel)
        .size({bufferStream:true}, function (err, dimensions) {
          if (err) { return err; }
          this
          .gravity('Center')
          .crop(newWidth, dimensions.height)
          .stream(function (err, stdout, _, cmd) {
            if (err) cb(err);
            stdout.pipe(outStream);
            
            stdout.on('end', cb);
          });
        });
        
          
      }
    };
    
  opts.dirPrefix = opts.dirPrefix || __dirname;
  
function codeGenerators (files, area, dir) {
  var self = config, gc = self.options.generateCode, imp = gc.implementation, 
    implementations = {
      picture: function () { //maybe reimpliment this using jsdom...
        var srcset;
        files.forEach(function (src) {
          area.code += '<picture alt=""'; 
          if (gc.className) area.code += ' class="' + gc.className + '"'; 
          area.code += '>\n';
             
          
          self.breakpoints['1x'].forEach(function (bp) {
            //slightly flawed atm, any 2x's/1.5x's etc. without a 1x compliment will be missed out.
            //need to abstract the behaviour out some, then logic as is, PLUS finding any 2x alone
            //or any 1.5x 2x matching or etc etc. 

            srcset = dir + '/' + bp + '/' + src;
            Object.keys(self.breakpoints).forEach(function(dpr) {
              if (dpr === '1x') return;              
              if (self.breakpoints[dpr].indexOf(bp) + 1) {
                srcset = srcset + ', ' + dir + '/' + bp + '@' + dpr + '/' + src + ' ' + dpr;                
              }            
            });            

            area.code += '  <source media="(' + gc.minOrMax + ':' + bp + 'px)" srcset="' + srcset + '"/>\n';
          });
          
          area.code += '  <img src="' + dir + '/' + gc.defaultBreakpoint + '/' + src + '" alt="">\n';
          area.code += '</picture>\n\n';      
        });
        
        if (gc.complete) {gc.complete(area.code)};

      }
    };
    
    
    implementations[imp]();
  
  
}
    
   
    

function resize(inStream, newWidth, outStream, cb) {


    gm(inStream)
    .resize(newWidth)
    .stream(function (err, stdout, _, cmd) {
      if (err) cb(err);
      stdout.pipe(outStream);
      
      stdout.on('end', cb);
    })

}

function createBreakPointFolders(areaDir, cb) {
  var bpArray = [];
  areaDir = opts.dirPrefix + '/' + areaDir;

  
  Object.keys(config.breakpoints).forEach(function (dpr) {
      config.breakpoints[dpr].forEach(function(bp) {
        var outPath = areaDir + '/' + bp + (dpr !== '1x' ? '@' + dpr : '')  + '/';
        if (!fs.existsSync(outPath)) { 
          fs.mkdirSync(outPath); 
        }
        bpArray.push(path.basename(outPath).replace('/',''));
      });
  });
  
  cb(null, bpArray);
}

function percToDec(str) {
return +str.replace('%','')/100;
}

function numericSort(arr, minW) {
  return arr.sort(function (a, b) { return (minW ? a - b : b - a); });
}
  
function processImages(dirPath, inStream, area, img, cb) {
  Object.keys(config.breakpoints).forEach(function (dpr) {

    config.breakpoints[dpr].forEach(function(bp) {
      var  outPath = dirPath + '/' + bp + (dpr !== '1x' ? '@' + dpr : '')  + '/',
          inPath = dirPath + img,
          aD = opts.artisticDirection, 
          breakspoint = aD && aD.breakpoint && bp <= aD.breakpoint,
          aDfn,     
          multiple = +(dpr.replace(/[^\d.]/g, '')),
          newWidth,          
          
          ratio = (function () {
            var widths, percentage, minW;
            if (!area.maxWidths && !area.minWidths) {
              return percToDec(area.width);
            }
            

            
            if (!area.maxWidths) {
             widths = area.minWidths;
             minW = true;
            } else {
             widths = area.maxWidths;
           }

            numericSort(Object.keys(widths), minW).forEach(function (w) {
              //compares the current break point to sorted min/max width breakpoints
              //if the width is greater than (min)/less than (max) then load that percentage
              //into the percentage variable - once this is no longer the case percentage
              //stays as it is
              percentage = minW ? (bp > w ? widths[w] : percentage) : (bp < w ? widths[w] : percentage);
              
            });

            return percToDec(percentage);
            
          }());
          

      
      bp = +bp * multiple;        
      newWidth = Math.round(bp * ratio);
        

        
        
        if (opts.noUpscaling) {
          gm(inPath).size(function(err, imSize){
            if (imSize.width <= newWidth) {     
              fs.createReadStream(inPath)
              .on('err', function (err) {
                cb(err, 'Error when performing straight copy (readStream)')
              })                     
              .pipe(fs.createWriteStream(outPath + img).on('err', function(err) {
                cb(err, 'Error when performing straight copy (writeStream)');
              }).on('end', cb));
              return;          
            }
          
          });
        }
       
          
        
        if (aD && breakspoint) {
            if (aD.method) { 
              if (typeof aD.method === 'string' && artisticDirectionMethods[aD.method]) {
                aDfn = artisticDirectionMethods[aD.method];
              }
              
              if (aD.method instanceof Function) {
                aDfn = artisticDirectionMethods[aD.method];
              }

              
              if (aDfn) {
                aDfn(inPath, newWidth, fs.createWriteStream(outPath + img), cb);
                
                return;
              }
            }   
        }
        
    
        
        resize(inStream, newWidth, fs.createWriteStream(outPath + img), function (err) {
          cb(err, img + ' resized for client width of ' + bp +'px at device pixel ratio of ' + dpr + ' resulting in image ' + Math.round(bp * ratio) + 'px wide');
        });
          
       
    });
  });
}


function processDir(area, dir, dirFinished) {
 var  dirPath = opts.dirPrefix + '/' + dir + '/', n = 0;

  fs.readdir(dirPath, function (err, files) {
    if (err) return console.log(err);
    var supported, 
      allFilesProcessed, 
      totalFilesToGenerate, //set when we have stripped all non eligible files out
      generatedAllBreakPointImagesForFile; //set in the callback of call to processImages    
    
    //strip out any files without the supported extensions   
    files = files.filter(function (file) {
      supported = false;
      ['.jpeg', '.jpg', '.gif', '.png'].forEach(function(fmt) {
        if (path.extname(file).toLowerCase() === fmt)  { supported = true; } 
      }); 
      if (supported) { return file; }
    });
    
    totalFilesToGenerate = (files.length * bpCount);
    
    bar = new progress('\t[:bar] :percent :etas', {total: totalFilesToGenerate});
    
    function processFiles(img, n) {

      n += 1;

      
      if (opts.generateCode && n === files.length) {
        if (typeof area.code === 'undefined') { area.code = ''; }
        codeGenerators(files, area, dir);
      }
      


      if (opts.processImages) {

        processImages(dirPath, fs.createReadStream(dirPath + img), area, img, function (err, msg) {
          if (err) {
            console.log("Was attempting: " + msg, err);
          }
          
          imCount += 1;  
          generatedAllBreakPointImagesForFile = !(imCount%bpCount); //when the image count is a multiple of the breakpoint count we know we have finished generating all the required images for a master image 
            
          allFilesProcessed = (totalFilesToGenerate ===  imCount);
            
          if (generatedAllBreakPointImagesForFile && !allFilesProcessed) { processFiles(files[n], n); }
          
           
          bar.tick(1);
          if (allFilesProcessed) { //force a finish
            bar.tick(1);
            console.log('\n');
            if (dirFinished) { dirFinished(); }
          }
          
          

        
        
        });
      }
    }    
    
    //ok let the games begin...
    if (files.length) { 
        console.log('\tProcessing the ' + dir + ' folder');    
      createBreakPointFolders(dir, function(err, bpArray) {      
        console.log('\tRespizer is generating images for the following breakpoints\n', '\t' + bpArray.join(',') + '\n\t');
        processFiles(files[0], 0);              
      });  
    
    }
    

        

  });





}

//initialisation
console.log('\n\tWelcome to Respizer  - you\'re friendly neighbourhood image cruncher\n');
  

config.areas.forEach(function (area) {  

  if (!area.maxWidths && !area.minWidths && !area.width) {
      throw new Error('Each area in config.areas must have a either a width, minWidths or maxWiths property');
  }
  

  if (typeof area.dirs === 'string') {area.dirs = [area.dirs];} 
  
  if ({}.toString.call(area.dirs) === '[object Array]') {
    if (area.name) { console.log('\tPreparing to generate images for the ' + area.name + ' area'); }  
    (function nextArea (areaCount) {
      var dir = area.dirs[areaCount];
      if (!dir) { return; }
      processDir(area, dir, function () {
        nextArea(areaCount + 1)
      });            
    }(0));    
    return;    
  } 
  

  
  
});
