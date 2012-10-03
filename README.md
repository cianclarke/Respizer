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

If you need help installing graphicsmagick see http://www.graphicsmagick.org/. 


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
    noUpscaling: true, //if target size is higher than original image, uses original image instead of upscaling

    
    artisticDirection: { //object or false
      breakpoint: 480,
      zoom: '112.5%',
      method: 'zoom'                                   
    },

    
    generateCode: {    //generatedCode will be loaded onto the area[n].code property, which can then be output in anyway neccessary    
      implementation: 'picture',
      defaultBreakpoint: 1024, //what size is the fallback
      minOrMax: 'min-width', //min-width (mobile first) or max-width (desktop first) approach
      className: false //add a class attribute to each element      
      
    }

    
  }
  
}

```
Explanation
===

breakpoints
====
`breakpoints` is an object, with properties defining the targetted device pixel ratio.
1x is normal screens, 2x is retina screens. Some devices are 1.5x, and who knows in
the future maybe for some crazy reason there will be a 3x or a 4x. 

Each device pixel ratio property holds an array of targetted screen widths. 

areas
====
`area` referrs to a designated (by percentage) piece of viewport estate that will be holding
an image (or images, in the case of a slider or such). 

You can give it a name to make Respizer's output more obvious but this optional. 

You must provide a least one directory to the `dirs` property, all images in the given
directory will be resized and converted to the given breakpoints. The breakpoint folders
will also be set up in the directory specified, you can specify more than one directory.

The `width` property specifies how much of the viewport the image will take up. For instance
if you have a wrapper element set to 61.803398875% of the body, and have an image within the 
wrapper element set to 100% of the wrapper, you're images ultimate width is 61.803398875%. 

The `minWidths` property overrides the `width` property. You can use this to accompany any 
media query breakpoints you have set that effect the width of the designated image area.

The `maxWidths` property overrides the `minWidths` property and is for exactly the same purpose, 
except it comes from a desktop first approach instead of mobile first. 

options
====
Focussing on the less obvious properties:

Respizer can generate images and/or code according to the configuration inputs. 

`processImages` allows you to turn off the image generation functionality in order to just
grab the generated code. 

`noUpscaling` should probably be left the same, it stops respizer from scaling the original 
images up if they are smaller than the defined breakpoint and instead copies them straight accross. 


Resizing detailed images down to fit on small screens can sometimes mean that the intended
focal of the image (say a person in the middle of a room) becomes too small. 

`artisticDirection` allows you to set a breakpoint at which instead of just resizing
you can apply an alternative image processing method (currently only `zoom` is implemented)
to better adapt images to smaller screen sizes. The zoom method will resize the image
to 112.5% of the specified breakpoint size, and then crop it to the breakpoint size, effectively
enlarging the focal point of the image (assuming the focal point is central).

 
`generateCode` provides settings for the generate code feature which currently outputs
HTML in the responsive `picture` element format which could then be used in browsers
with the help of [Respondu](https://github.com/davidmarkclements/Respondu)


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
  * More finite control over how and where images are created
  * More artisticDirection methods, zoomLeft zoomRight etc. 


Tests
===
  Clone this repository and simply run .`/index.js`, 
  the example configuration file runs respizer on the test folder which holds test.jpg
  
  It should create eight sub-directories named after the breakpoints and resize test.jpg
  to 61.803398875% of each breakpoint size for breakpoints greater than 768 and it should
  resize and crop to 80.901699437% of breakpoint sizes for breakpoints less than 768 - as 
  specified by the area.maxWidths object in the respizer.conf.js file. 
  
  No unit tests as yet :D



