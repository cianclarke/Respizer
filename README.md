Respizer
========

A Responsive Images build tool: Resize your images into multiple breakpoint versions on the fly and generate corresponding picture/img srcset code

Version: 0.0.1

-----

Dependencies
===
Respizer relies on graphicsmagick, so you'll need that installed on your system. 
With ubuntu it's as simple as 
```
sudo apt-get install graphicsmagick
```

If you need help installing graphicsmagick see the http://www.graphicsmagick.org/. 


Installation
===

```
sudo npm install -g respizer
```

Configuration
===
Respizer uses a configuration file called `respizer.conf.js`, this must be available in your
current working directory for respizer to work. 
Here's a sample configuration file with comments:

```
module.exports = {
  breakpoints: {
    '1x': [
      1680,
      1366,
      1024,
      480,
      320,
      260
    ],
    '2x': [480, 1024] //landscape widths of iphone/ipad          
  },
  areas : [ //area refers to a space constraint on the web page that the image fits into
    {
      name: 'Gallery', //optional
      dirs: ['test'], //required, array of directories to be referenced from web page area
      width: '61.803398875%', //the percentage of viewport estate taken up by the image 
      
      minWidths: {  //the percentage of viewport estate taken up by the image *at different minimum breakpoints*
        '768' : '61.803398875%',
        '0' : '80.901699437%'
      }, //if minWidths is available it will trump width
      
      //alternative to minWidths (mobile first) is maxWidths (desktop first)
      
      maxWidths: { //the percentage of viewport estate taken up by the image *at different minimum breakpoints*
        '768': '80.901699437%',      
        Infinity: '61.803398875%'   //use infinity for normative desktop width        
      } //maxWidths will cause minWidth to be discarded
    }
  ],

  options: {
    dirPrefix: __dirname, //absolute path to be prefixed to each areas and breakpoint root    
    processImages: true, //if false, we simply generateCode unless generateCode is false.. then we do nothing
    lowResEquivalents: true,  //requires symlink support, links low DPR equivalents to high DPR e.g. 1024@2x = 2048
    noUpscaling: true, //if target size is higher than original image, uses original image instead of upscaling

    
    artisticDirection: { //object or false
      breakpoint: 480,
      zoom: '112.5%',
      method: 'zoom'                                   
    },

    
    generateCode: {    //generatedCode will be loaded onto the area[n].code property, which can then be output in anyway neccessary    
      implementation: 'picture', //picture or srcset
      defaultBreakpoint: 1024, //what size is the fallback
      minOrMax: 'min-width', //min-width (mobile first) or max-width (desktop first) approach
      className: false //add a class attribute to each element      
      
    }

    
  }
  
}

```
Explanation
===

Usage
===

Once you have your configuration file setup, usage is very simple. 

```
respizer
```


Plans
===
  * A Respizer Grunt task so that it can be part of the overall build process
  * A modification time cache, to avoid rerunning resize code unneccessarily
  * Speed improvements


Tests
===
  Clone this repository and simply run .`/index.js`, 
  the example configuration file runs respizer on the test folder which holds test.jpg
  
  It should create eight sub-directories named after the breakpoints and resize test.jpg
  to 61.803398875% of each breakpoint size for breakpoints greater than 768 and it should
  resize and crop to 80.901699437% of breakpoint sizes for breakpoints less than 768 - as 
  specified by the area.maxWidths object in the respizer.conf.js file. 
  
  No unit tests as yet :D



