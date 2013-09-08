var assert = require("assert"),
wd = require('wd'),
fs = require('fs');

describe('Record site', function(){
    
    before(function() {
        browser = wd.remote("ondemand.saucelabs.com", 80, "yaronn01", "daa47681-6117-4d8b-a6b7-fe52adc65a58");

        browser.on('status', function(info){
          console.log('\x1b[36m%s\x1b[0m', info);
        });
        
        browser.on('command', function(meth, path, data){
          console.log(' > \x1b[33m%s\x1b[0m: %s', meth, path, data || '');
        });

    })

    after(function(done) {
        console.log("before done")
        browser.quit(function() {console.log("after done"); done()})
    })  
    
    it('should create correct visual', function(done){
      browser.init({browserName:'chrome'}, function(err) {
        browser.get("https://c9.io/yaronn01/anigif/workspace/test/simple.html", function(err) {
            
            browser.elementById('txt', function(err, edit) {
                browser.elementById('start', function(err, start) {
                    browser.clickElement(start, function() {
                        setTimeout(function() {
                            edit.sendKeys("1", function() {
                                setTimeout(function() {
                                    browser.elementById('stop', function(err, end) {
                                        browser.clickElement(end, function() {
                                            browser.eval("window.anigif._log", function(err, str) {
                                                var gif = /final:\s*data:image\/gif;base64,(.*)/g.exec(str)[1]
                                                var expected = fs.readFileSync("test/simple.base64").toString().replace(/\s/g, "") ;
                                                assert.equal(expected, gif, "actuall and expected images differ")
                                                done()    
                                            })
                                        })
                                    })
                                }, 2500);
                            })
                            
                        }, 2000)
                        
                    })
                })
            })
            
            
        })
      })
    })
})
