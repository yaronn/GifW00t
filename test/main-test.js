var assert = require("assert"),
    wd = require('wd'),
    fs = require('fs');

var browser;

describe('Record site', function(){
    
    before(function() {
        browser = wd.promiseRemote("ondemand.saucelabs.com", 80, "yaronn01", "daa47681-6117-4d8b-a6b7-fe52adc65a58");

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
        browser.init({browserName: 'chrome', name: "correct visual"}, 
                    function() {
                        browser.get("https://c9.io/yaronn01/anigif/workspace/test/simple.html", function() {
                            setTimeout(function() {writeSettings(done)}, 3000)
                    })   
        })
    });
        
})


function writeSettings(done) {
    browser.waitForVisibleById('config', 15000, function() {
           browser.elementById('config', function(err, el) {
                browser.clickElement(el, function() {
                    
                    var setField = function(name, value, cba) {
                        browser.elementById(name, function(err, el) {
                            el.clear(function() {
                                el.sendKeys(value, function() {
                                    cba()    
                                })
                            })
                        })   
                    }
                    
                    setField("rootNode", "div_inner", function() {
                        setField("frameInterval", 1000, function() {
                            setField("cores", 2, function() {
                                setField("ratio", 0.8, function() {
                                     browser.elementById("quality", function(err, el) {
                                         el.elementById("low", function(err, el) {
                                           el.click(function() {
                                                startRecord(done)      
                                           })
                                         })
                                     })
                                })
                            })
                        })
                    })
                    
                })
           })
    })
}


function startRecord(done) {
    done();
}

/*

 


function startRecord(cba) {
    clickRecord()
    wait 1500
    type text
    wait 500
    change canvas
    wait 500
    change title
    change img
    wait 500
    stop
    get data url
    compare expected
    
}


 browser.init({browserName:'chrome'}, function(err) {
        browser.get("https://c9.io/yaronn01/anigif/workspace/test/simple.html", function(err) {
            configureAnigif({rootNode: "inner_div", interval: 1000, cores: 2, ratio: 0.8, quality: "Low"}, function() {
                startRecord()
            })
        })
      })
    })  
    
    
    
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
                        

*/