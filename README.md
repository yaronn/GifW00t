GifW00t!
====================

<img src="https://c9.io/yaronn01/anigif/workspace/pacman/img/demo8.gif"  width="220px" />
<img src="https://c9.io/yaronn01/anigif/workspace/pacman/img/demo10.gif"  width="200px" />
<img src="https://c9.io/yaronn01/anigif/workspace/pacman/img/demo7.gif"  width="200px" />
<img src="https://c9.io/yaronn01/anigif/workspace/pacman/img/demo11.gif"  width="230px" />

More information in my twitter - [@YaronNaveh](http://twitter.com/#!/YaronNaveh)


What is GifW00t!?
---------------------
GifW00t! is a pure-javascript web recorder. No plugins, Flash or Java required. Just add one script tag to your page, and users will be able to record and replay their interaction with the site. Some of the possibilities:

* Record game sessions and watch instant replay
* Report site bugs
* Usage instructions clip
* Share amazing data visualizations, canvas animation
* Share clips for fun and profit...

Oh and did I mention that you can use GifW00t! on 3rd party sites as well?

For more information check out [@YaronNaveh](http://twitter.com/#!/YaronNaveh), the project [sample site](s3-us-west-2.amazonaws.com/anigif100/pacman/index.html), or [my blog](http://webservices20.blogspot.com/).

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

**Option 1 - refer directly to GifW00t! server**

Just add this code inside your \<head\>:

    <script>
        var anigif_base_url = "https://s3-us-west-2.amazonaws.com/anigif100/anigif/"
    </script>
    <script src="https://s3-us-west-2.amazonaws.com/anigif100/anigif/anigif.min.js"></script>
  
**Option 2 - serve GifW00t! yourself (it is just static files)**

Copy /anigif from thsi project to your web site root. Then in your html add this:

    <script src="https://s3-us-west-2.amazonaws.com/anigif100/anigif/anigif.min.js"></script>


Compatibility
---------------------
Verified on Chrome 29 and Firefox 24. Will probably not work on some other browsers since some very new browser feaures are required.


Settings
---------------------
Click the GifW00t! panel bar settings button in order to change record settings. Important settings are:

**Element to record:** What element in your page should GifW00t! capture (including sub elements). The value is a CSS selector. For example if you want to capture '\<div id="main"\>' set the value to '#main'. Please always choose a Div element as the root for record.

**Frames per second:** How many frames should GifW00t! capture each second. This heavily affects performance


Optimization
---------------------
Here are the top ways to make GifW00t! render images faster:

* Choose the minimal "element to record" as you can, with the least DOM child elements as possible.
* Choose a small number of frames per second. For low-grpahic you will probably be ok with 2 per seconds. For high graphics (games, canvas) use 10 or 20 (or try with lower values first).
* Dont's record for too long... Unless you like 100GB animated GIFs. A resord should probably be from a few seconds to a minute.
* Set the "ratio" attribute to a low value. This attribute determines how result gif is scaled down compared to actuall size. 0.5 means 50%.


More information
---------------------
Check out [@YaronNaveh](http://twitter.com/#!/YaronNaveh), the project [sample site](s3-us-west-2.amazonaws.com/anigif100/pacman/index.html), or [my blog](http://webservices20.blogspot.com/).
