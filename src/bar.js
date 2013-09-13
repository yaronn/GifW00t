(function(window, document){

window.anigif_bar = {
        
        
        install: function() {
            var self = this;
            
            this.downloadHtml("http://anigif.yaronn01.c9.io/src/bar.html", function(err, html) {
                var div = document.createElement("div");
                div.style.position = "fixed";
                div.style.right = "5%";
                div.style.top="5%";
                div.innerHTML = html;
                document.body.appendChild(div)
                self.init(div)
            })              
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
            
            this.setEnabled({record: true, stop: false, play: false})
            this.status("ready")
            
            var buttons = ["record", "stop", "play"];
            for (var i in buttons) {
                this.el.querySelectorAll("#"+buttons[i])[0].onclick = function(e) {self.click(e)};
            }
            
            this.recordOptions = {};
            
        },
        
        click: function(e) {
            var source = e.target || e.srcElement;  
            this[source.id](e.target)
        },
        
        record: function(el) {
            this.setEnabled({record: false, stop: true, play: false})
            el.className = "blink"
            this.status("recording...")
            window.anigif.startRecord(this.recordOptions);
        },
        
        stop: function(el) {
            var self = this;
            this.status("processing...")
            self.el.querySelectorAll("#record")[0].className = "";
            self.setEnabled({record: false, stop: false, play: false})
            document.body.style.cursor = "wait";
            window.setTimeout(function() {self.stopInternal()}, 200);
        },
        
        stopInternal: function() {
            var self = this;
            window.anigif.stopRecord(function() {
                self.status("done");
                document.body.style.cursor = "default";
                self.setEnabled({record: true, stop: false, play: true})
            })
        },
        
        play: function(el) {
            var win=window.open(window.anigif.img, '_blank');
            win.focus();
        },
        
        setEnabled: function(buttons) {
            for (var b in buttons) {
                this.el.querySelectorAll("#"+b)[0].className = buttons[b]?"":"disabled";
            }
        },
        
        status: function(txt) {
            this.el.querySelectorAll("#status")[0].innerText = txt
        }
}

function install() {
   window.anigif_bar.install(); 
}

if(window.addEventListener){
    window.addEventListener('load',install,false); //W3C
}
else{
    window.attachEvent('onload',install); //IE
}


})(window,document);