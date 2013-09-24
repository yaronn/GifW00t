GifW00t!
====================

![GifW00t!](https://c9.io/yaronn01/anigif/workspace/pacman/img/demo11.gif "GifW00t!")
<img src="https://c9.io/yaronn01/anigif/workspace/pacman/img/demo10.gif"  width="210px" />


What is GifW00t!?
---------------------
GifW00t! is a pure-javascript web recorder. Just add one script tag to your page, and users will be able to record and replay their interaction with the site. Some of the possibilities:

* Record game sessions and provide instant replay
* Report site bugs
* Usage instructions clip
* Share amazing data visualizations, canvas animation
* Share clips for fun and profit...

Oh and did I mention that you can use GifW00t! on 3rd party sites as well?


How to use GifW00t!?
---------------------
There are 3 options:

### 1. You surf in a site that already embedds GifW00t!
In this case all you need is to work with the [GifW00t! panel bar](http://s3-us-west-2.amazonaws.com/anigif100/pacman/index.html).

### 2. You surf in a site that does not embedd GifW00t!
No problem. Open Chrome develoepr tools (CTRL+J) or Firefox Firebug and paste this code in the console:

    var anigif_base_url = "https://s3-us-west-2.amazonaws.com/anigif100/anigif/"
    var ref=document.createElement('script')
    ref.setAttribute("src", "https://s3-us-west-2.amazonaws.com/anigif100/anigif/anigif.min.js")
    document.head.appendChild(ref)

wait a few seconds and the GifW00t! panel bar will appear.

### 3. You develop a website and want to embedd GifW00t!

*Option 1 - refer directly to GifW00t! server*
Just add this code inside your <head>:

  <script>
    var anigif_base_url = "https://s3-us-west-2.amazonaws.com/anigif100/anigif/"
  </script>
  <script src="https://s3-us-west-2.amazonaws.com/anigif100/anigif/anigif.min.js"></script>
  
*Option 2 - serve GifW00t! yourself (it is just static files)*
Copy /anigif from thsi project to your web site root. Then in your html add this:

  <script src="https://s3-us-west-2.amazonaws.com/anigif100/anigif/anigif.min.js"></script>


Compatibility
---------------------
Verified on Chrome 29 and Firefox . Will probably not work on some other browsers since some very new browser feaures are required.


Optimization
---------------------



Options
---------------------


How GifW00t works?
---------------------


More information
---------------------
