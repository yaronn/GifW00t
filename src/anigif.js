


(function(window, document) {
    
    "use strict";
    
    window.anigif = {
        
        init: function() {
            this.frames = [];
            this.images = [];
            this._log = "";
        },
        
        log: function(str) {
            console.log(str);
            this._log += str + "\r\n";
        },
        
        merge_options: function(obj1,obj2){
            var obj3 = {};
            for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
            for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
            return obj3;
        },

        startRecord: function(opts) {
            
            this.init();
            
            var options = this.merge_options({
                maxFrames: 3,
                frameInterval: 1500,
                el: document.getElementById("main")
            }, opts);
            
            this.recordFrame(options);
        },
        
        recordFrame: function(options) {
            var self = this;
            this.frames.push(options.el.cloneNode(true));
            console.log("took snapshot");
            if (this.frames.length<options.maxFrames) {
                window.setTimeout(function() {
                    self.recordFrame(options);
                    }, options.frameInterval);
            }
        },
        
        stopRecord: function(cba) {
            var self = this;
            async.times(this.frames.length, self.renderImage.bind(self), function(err){
                self.composeAnimatedGif();
                cba();
            });
        },
        
        renderImage: function(i, cbx) {
            var self = this;
            document.body.appendChild(this.frames[i]);

            window.html2canvas( [ this.frames[i] ], {
                onrendered: function(canvas) {
                    var img = canvas.toDataURL("image/png");
                    self.log(img);
                    self.images.push(canvas);
                    self.frames[i].parentElement.removeChild(self.frames[i]);
                    cbx();
                }
            });
        },
        
        composeAnimatedGif: function() {
            var encoder = new window.GIFEncoder();
            encoder.setRepeat(0); //auto-loop
            encoder.setDelay(1000);
            encoder.start();
             for (var i=0; i<this.images.length; i++) {
                var context = this.images[i].getContext('2d');
                encoder.addFrame(context);
            }
            encoder.finish();
            this.log("final: ");
            this.img = 'data:image/gif;base64,' + window.encode64(encoder.stream().getData())
            this.log(this.img);
        }
        
    };
    
    window.anigif.init();


window.encode64 = function(input) {
	var output = "", i = 0, l = input.length,
	key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", 
	chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	while (i < l) {
		chr1 = input.charCodeAt(i++);
		chr2 = input.charCodeAt(i++);
		chr3 = input.charCodeAt(i++);
		enc1 = chr1 >> 2;
		enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
		enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
		enc4 = chr3 & 63;
		if (isNaN(chr2)) enc3 = enc4 = 64;
		else if (isNaN(chr3)) enc4 = 64;
		output = output + key.charAt(enc1) + key.charAt(enc2) + key.charAt(enc3) + key.charAt(enc4);
	}
	return output;
}

})(window, document);