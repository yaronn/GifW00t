

(function(window, document){

window.anigif_bar = {

        resolve_mode: typeof(anigif_base_url)=="undefined"?"absolute_from_root":"absolute_from_remote",
        
        base_url: typeof(anigif_base_url)=="undefined"?getAbsoluteUrlPrefix() + "anigif/":anigif_base_url,
        
        record_delay: 3,
        
        buttons: ["record", "stop", "play", "config"],
        
        install: function() {
            var self = this;
            
            //document.querySelectorAll("[koo=zoo]")[0].src
            window.anigif.options.base_url = self.base_url
            this.downloadHtml(self.base_url + "bar.html", function(err, html) {
                
                var div = document.createElement("div");
                div.id = "anigif_wrapper";
                div.style.position = "fixed";
                div.style.right = self.right || "5%";
                div.style.top = self.top || "5%";
                div.style.zIndex=99999
                
                var htmlworking = self.applyBaseUrl(html)
                div.innerHTML = htmlworking;
                document.body.appendChild(div)
                
               //prevant global page hooks from hapenning when interacting with anigif
                var preventBubble = function(e) {
                    e.stopPropagation();
                }
                
                div.addEventListener("keydown", preventBubble);
                div.addEventListener("keypress", preventBubble); 
                div.addEventListener("mousedown", preventBubble)
                
                self.init(div);
            })   
            
            window.anigif.progressSink = function(msg) {
                self.status(msg)
            }
            
        },
        
        applyBaseUrl: function(divstr) {
          return divstr.replace(/src="/g, 'src="'+this.base_url);
        },
        
        downloadHtml: function(url, cba) {
            var xmlHttp = new XMLHttpRequest(); 
            xmlHttp.onreadystatechange = function() {
                //window.x = xmlHttp;
                if (xmlHttp.readyState == 4) {
                    cba(xmlHttp.status == 200?null:xmlHttp.status, xmlHttp.responseText)   
                }
            }
            xmlHttp.open( "GET", url, true );
             xmlHttp.send( null );    
        },
        
        init: function(el) {
            var self = this;
            this.el = el 
            
            this.setEnabled({record: true, stop: false, play: false, config: true})
            this.status("ready")
            
            for (var i=0; i<self.buttons.length; i++) {
                this.el.querySelectorAll("#"+self.buttons[i])[0].onclick = function(e) {
                    var target = e.target || e.srcElement;
                    if (target.className=="disabled") return;
                    self.click(e);
                };
            }
            
            this.loadConfig();
              
        },
        
        loadConfig: function() {
            this.el.querySelectorAll("#cores")[0].value = window.anigif.options.cores;
            this.el.querySelectorAll("#onlyLastFrames")[0].value = window.anigif.options.onlyLastFrames;
            this.el.querySelectorAll("#framesPerSecond")[0].value = window.anigif.options.framesPerSecond;
            this.el.querySelectorAll("#rootNode")[0].value = window.anigif.options.selector;
            this.el.querySelectorAll("#ratio")[0].value = window.anigif.options.ratio;
            this.el.querySelectorAll("#quality")[0].value = window.anigif.options.quality;
            this.el.querySelectorAll("#period")[0].value = window.anigif.options.period;
            this.el.querySelectorAll("#fixedWidth")[0].value = window.anigif.options.fixedWidth;
        },
        
        saveConfig: function() {
            window.anigif.options.cores = this.el.querySelectorAll("#cores")[0].value;
            window.anigif.options.onlyLastFrames = this.el.querySelectorAll("#onlyLastFrames")[0].value;
            window.anigif.options.framesPerSecond = this.el.querySelectorAll("#framesPerSecond")[0].value;
            window.anigif.options.selector = this.el.querySelectorAll("#rootNode")[0].value;
            window.anigif.options.ratio = this.el.querySelectorAll("#ratio")[0].value;
            window.anigif.options.quality = this.el.querySelectorAll("#quality")[0].value;
            window.anigif.options.period = this.el.querySelectorAll("#period")[0].value;
            window.anigif.options.fixedWidth = this.el.querySelectorAll("#fixedWidth")[0].value;
        },
        
        click: function(e) {
            var source = e.target || e.srcElement;  
            this[source.id](e.target)
        },
        
        closeConfig: function() {
            this.el.querySelectorAll("#anigif_settings")[0].style.display = "none"
        },
        
        config: function(el) {
            var style = this.el.querySelectorAll("#anigif_settings")[0].style;
            if (style.display=="block") {
                this.saveConfig();
                style.display = "none";
            }
            else {
                style.display = "block"
            }
            
        },
        
        record: function(el) {
            var self = this;
            this.checkBrowser();
            this.setEnabled({record: false, stop: true, play: false, config: false})
            this.count(self.record_delay, function() {
                el.className = "blink"
                self.status("recording...")
                try {
                    window.anigif.startRecord();
                }
                catch (e) {
                    alert(e)
                    self.init(self.el)
                }
            })
        },
        
        checkBrowser: function() {
            var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
                // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
            var isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
            var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
                // At least Safari 3+: "[object HTMLElementConstructor]"
            var isChrome = !!window.chrome && !isOpera;              // Chrome 1+
            var isIE = /*@cc_on!@*/false || document.documentMode;   // At least IE6    
            
            if (!isChrome & !isFirefox & !isSafari) {
                alert("Gifw00t! has been tested on Chrome, Firefox and Safari only and may not work on your browser")
            }
        },
        
        count: function(seconds, cba) {
            var self = this;
            if (seconds==0) cba();
            else {
                self.status("starting in " + seconds + "...");
                window.setTimeout(function() {self.count(seconds-1, cba)}, 1000);
            }
            
        },
        
        stop: function(el) {
            var self = this;
            this.status("processing...")
            
            self.el.querySelectorAll("#record")[0].className = "";
            self.setEnabled({record: false, stop: false, play: false, config: false})
            
            document.body.style.cursor = "wait";
            
            //timeout - give the browser a chance to update the cusror
            window.setTimeout(function() {self.stopInternal()}, 5);
        },
        
        stopInternal: function() {
            var start = new Date().getTime();
            var self = this;
            window.anigif.stopRecord(function() {
                
                
                var end = new Date().getTime();
            	var time = end - start;
            	console.log("duration: " + time)
            	
            	self.status("done (" + (time/1000).toFixed(2) + "s)");
            	
                document.body.style.cursor = "default";
                self.setEnabled({record: true, stop: false, play: true, config: true})
            })
        },
        
        play: function(el) {
            var win=window.open(window.anigif.img, '_blank');
            win.focus();
        },
        
        setEnabled: function(settings) {
            for (var b in settings) {
                if (!settings.hasOwnProperty(b)) continue;
                this.el.querySelectorAll("#"+b)[0].className = settings[b]?"enabled":"disabled";
            }
        },
        
        status: function(txt) {
            this.el.querySelectorAll("#status")[0].textContent = txt
        }
}


    
function getAbsoluteUrlPrefix() {
    var el = document.createElement('span');
    el.innerHTML = '<a href=".">&nbsp;</a>';
    return el.firstChild.href;
}

function install() {
   window.anigif_bar.install(); 
}

if (document.readyState === 'complete') {
   install()
}
else {
    if(window.addEventListener){
        window.addEventListener('load',install,false); //W3C
    }
    else{
        window.attachEvent('onload',install); //IE
    }
}

})(window,document);