var assert = require("assert"),
    wd = require('wd'),
    fs = require('fs');

var browser;

var record_delay = 3000;
var frame_interval = 5500;
var browser_name = "";

describe('Record site', function(){
    
    beforeEach(function() {
        browser = wd.remote("ondemand.saucelabs.com", 80, "yaronn01", "daa47681-6117-4d8b-a6b7-fe52adc65a58");

        browser.on('status', function(info){
          console.log('\x1b[36m%s\x1b[0m', info);
        });
        
        browser.on('command', function(meth, path, data){
          console.log(' > \x1b[33m%s\x1b[0m: %s', meth, path, data || '');
        });

    })

    afterEach(function(done) {
        browser.quit(function() {console.log("after done"); done()})
    })  
    
     it('should create correct visual - chrome', function(done){
        browser_name = 'chrome'
        browser.init({browserName: browser_name, name: "correct visual"}, 
                    function() {
                        browser.get("https://s3-us-west-2.amazonaws.com/anigif100/simple.html", function() {
                            setTimeout(function() {writeSettings(done)}, 3000)
                    })   
        })
    })
    
    it('should create correct visual - firefox', function(done){
        browser_name = 'firefox'
        browser.init({browserName: browser_name, name: "correct visual"}, 
                    function() {
                        browser.get("https://s3-us-west-2.amazonaws.com/anigif100/simple.html", function() {
                            setTimeout(function() {writeSettings(done)}, 3000)
                    })   
        })
    })
    
    
        
})


function writeSettings(done) {
  
    browser.waitForVisibleById('config', 15000, function() {
        
           browser.elementById('config', function(err, config) {
                browser.clickElement(config, function() {
                    
                    var setField = function(name, value, cba) {
                        browser.elementById(name, function(err, el) {
                            el.clear(function() {
                                el.sendKeys(value, function() {
                                    cba()    
                                })
                            })
                        })   
                    }
                    
                    setField("rootNode", "#inner_div", function() {
                        setField("framesPerSecond", 1000/frame_interval, function() {
                            setField("cores", 2, function() {
                                setField("ratio", 0.8, function() {
                                     browser.elementById("quality", function(err, el) {
                                         el.elementById("high", function(err, el) {
                                           el.click(function() {
                                               browser.elementById("period", function(err, el) {
                                                     el.elementById("offline", function(err, el) {
                                                       el.click(function() {
                                                            browser.clickElement(config, function() {
                                                                doRecord(done)      
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
                    })
                    
                })
           })
    })
}


function doRecord(done) {
    
    var click = function(id, cba) {
        browser.elementById(id, function(err, el) {
            browser.clickElement(el, function(err) {
                cba(null)
            })
        })
    }
    
    
    browser.waitForVisibleById('record', 15000, function() {
    
        browser.elementById('record', function(err, el) {
    
            browser.clickElement(el, function(err) {    
                setTimeout(function() {
                    browser.elementById('txt', function(err, edit) {
                        edit.sendKeys("123", function(err) {
                        })
                        setTimeout(function() {
                                     click("btnCanvas", function() {})
                                     click("btnTitle", function() {})
                                     //click("btnImg", function() {})
                                     setTimeout(function() {stopRecord(done)}, frame_interval);
                                   }, frame_interval*0.8)
                    })
                }, record_delay+frame_interval*0.4)
            })
        })
    })
}

function stopRecord(done) {
     browser.elementById('stop', function(err, stop) {
        if (err) return done(err)
        browser.clickElement(stop, function(err) {   
            browser.elementById('play', function(err, play) {
                browser.waitForElementByCssSelector('#play.enabled', 25000, function(err) {
                        if (err) return done(err)
                        validateRecord(done)    
                })
            })
        })
     })
}

function validateRecord(done) {
     var func = 'var xmlHttp = new XMLHttpRequest(); ' +
                'xmlHttp.onreadystatechange = function() {\n' +
                'var reader = new FileReader();' +
                   'reader.onload = function(event){\n' +
                     'window.imgbase64 = reader.result;' +
                   '};\n' +
                   'reader.readAsDataURL(xmlHttp.response);' +
                '}\n' +
                'xmlHttp.open( "GET", window.anigif.img, true );' +
                'xmlHttp.responseType = "blob";' + 
                'xmlHttp.send( null );'

     browser.execute(func, function(err) {
         console.log(err)
         setTimeout(function() {
             
             browser.eval("window.imgbase64", function(err, actual) {
                 //fs.writeFileSync('./test/expected_'+browser_name+'.txt', actual)
                 fs.writeFileSync('./test/actual_'+browser_name+'.txt', actual)
                 var expected = fs.readFileSync('./test/expected_'+browser_name+'.txt').toString()
                 var res = actual==expected
                 if (!res) return done(new Error("actual diffes than expected"))
                 done()
             })
             
         }, 3500)
         
     })
}
