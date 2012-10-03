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
      dirs: ['gallery/originals', 'gallery/originals/LANDOFGIANTS_friday'], //required, array of directories to be referenced from web page area
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

    
    generateCode: false, /* {    //generatedCode will be loaded onto the area[n].code property, which can then be output in anyway neccessary    
      implementation: 'picture', //picture or srcset
      defaultBreakpoint: 1024, //what size is the fallback
      minOrMax: 'min-width', //min-width (mobile first) or max-width (desktop first) approach
      className: false, //add a class attribute to each element
      exportCode: 'middleware', //TODO: middleware or string - causes index.js to load code onto module.exports either as a simple string, or as Express/Connect middleware
      complete: function (code) { //final code        
        console.log(code);
      }
      
      
    }*/

    
  }
  
}
