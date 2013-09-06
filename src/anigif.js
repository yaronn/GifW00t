


(function(window, document) {
    
    "use strict";
    
    window.anigif = {
        
        init: function() {
            this.frames = [];
        },
        
        startRecord: function(opts) {
            
            var options = opts || {
                maxFrames: 5,
                frameInterval: 1000,
                el: document.getElementById("main")
            };
            
            this.recordFrame(options);
        },
        
        recordFrame: function(options) {
            var self = this;
            this.frames.push(options.el.cloneNode(true));
            if (this.frames.length<options.max_frames) {
                window.setTimeout(function() {
                    self.recordFrame(options);
                    }, options.frameInterval);
            }
        },
        
        stopRecord: function() {
            for (var i=0; i<this.frames.length; i++) {
                this.renderImage(i);
            }
        },
        
        renderImage: function(i) {
            document.body.appendChild(this.frames[i]);

            window.html2canvas( [ window.frames[i] ], {
                onrendered: function(canvas) {
                    var img = canvas.toDataURL("image/png");
                    console.log(img);		
                    this.frames[i].parentElement.removeChild(this.frames[i]);
                }
            });
        }
        
    };

})(window, document);