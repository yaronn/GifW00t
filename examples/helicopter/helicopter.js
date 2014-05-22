/*jslint browser: true, undef: true, eqeqeq: true, nomen: true, white: true */
/*global window: false, document: false */
/* Human readable keyCode index */
var KEY = {
    'BACKSPACE': 8, 'TAB': 9, 'NUM_PAD_CLEAR': 12, 'ENTER': 13, 'SHIFT': 16,
    'CTRL': 17, 'ALT': 18, 'PAUSE': 19, 'CAPS_LOCK': 20, 'ESCAPE': 27,
    'SPACEBAR': 32, 'PAGE_UP': 33, 'PAGE_DOWN': 34, 'END': 35, 'HOME': 36,
    'ARROW_LEFT': 37, 'ARROW_UP': 38, 'ARROW_RIGHT': 39, 'ARROW_DOWN': 40,
    'PRINT_SCREEN': 44, 'INSERT': 45, 'DELETE': 46, 'SEMICOLON': 59,
    'WINDOWS_LEFT': 91, 'WINDOWS_RIGHT': 92, 'SELECT': 93,
    'NUM_PAD_ASTERISK': 106, 'NUM_PAD_PLUS_SIGN': 107,
    'NUM_PAD_HYPHEN-MINUS': 109, 'NUM_PAD_FULL_STOP': 110,
    'NUM_PAD_SOLIDUS': 111, 'NUM_LOCK': 144, 'SCROLL_LOCK': 145,
    'EQUALS_SIGN': 187, 'COMMA': 188, 'HYPHEN-MINUS': 189,
    'FULL_STOP': 190, 'SOLIDUS': 191, 'GRAVE_ACCENT': 192,
    'LEFT_SQUARE_BRACKET': 219, 'REVERSE_SOLIDUS': 220,
    'RIGHT_SQUARE_BRACKET': 221, 'APOSTROPHE': 222
};

(function () {
	/* 0 - 9 */
	for (var i = 48; i <= 57; i++) {
        KEY['' + (i - 48)] = i;
	}
	/* A - Z */
	for (i = 65; i <= 90; i++) {
        KEY['' + String.fromCharCode(i)] = i;
	}
	/* NUM_PAD_0 - NUM_PAD_9 */
	for (i = 96; i <= 105; i++) {
        KEY['NUM_PAD_' + (i - 96)] = i;
	}
	/* F1 - F12 */
	for (i = 112; i <= 123; i++) {
        KEY['F' + (i - 112 + 1)] = i;
	}
})();

var Heli = {};

Heli.Consts = [
  {name: "State", consts: ["WAITING", "PAUSED", "PLAYING", "DYING"]},
  {name: "Dir",   consts: ["UP", "DOWN"]}
];

Heli.FOOTER_HEIGHT = 20;
Heli.FPS           = 19;

Heli.Color = {
    BACKGROUND  : "#C3CCB5", BLOCK         : "#403B37",
    HOME_TEXT   : "#403B37", RAND_BLOCK    : "#403B37",
    USER        : "#FFFF00", TARGET_STROKE : "#B24524",
    DIALOG_TEXT : "#333333", FOOTER_BG     : "#403B37",
    FOOTER_TEXT : "#C3CCB5"
};

Heli.User = function (params) {

    var _distance = 0,
        position = null,
        _trail   = null,
        momentum = null;

    function finished() {
        if (_distance > bestDistance()) {
            localStorage.bestDistance = _distance;
        }
    }

    function bestDistance() {
      return parseInt(localStorage.bestDistance || 0, 10);
    }

    function distance() {
        return _distance;
    }

    function reset() {
        _distance = 0;
        position = 50;
        _trail = [];
        momentum = 0;
    }

    function move(thrusters) {

        _distance += 1;

        momentum += ((thrusters) ? 0.4 : -0.5);
        position += momentum;

        if (params.tick() % 2 === 0) {
            _trail.push(position);
        }

        if (_trail.length > 4) {
            _trail.shift();
        }

        return position;
    }

    function trail() {
        return _trail;
    }

    return {
        "reset":reset,
        "move":move,
        "trail":trail,
        "distance":distance,
        "finished":finished,
        "bestDistance":bestDistance
    };
};

Heli.Screen = function (params) {

    var _width       = params.width,
        _height      = params.height,
        _numLines    = 30,
        _direction   = Heli.Dir.UP,
        _lineWidth   = _width / _numLines,
        _lineHeight  = _height / 100,
        _gap         = null,
        _randomBlock = null,
        magnitude    = null,
        changeDir    = 0,
        _blockY      = null,
        _blockHeight = 20,
        heliHeight   = (30 / params.height) * 100, // Convert px to %
        _terrain     = [],
        img = new Image(),
        img2 = new Image();

    img.src = './heli.png';
    img2.src = './heli2.png';

    function width()  { return _width; }
    function height() { return _height; }

    function init() {

        manitude = null;
        changeDir = 0;
        _randomBlock = null;
        _gap = 80;
        _terrain = [];

        var i,
            size = (100 - _gap) / 2,
            obj  = {"top":size, "bottom":size};

        for (i = 0; i < _numLines; i += 1) {
            _terrain.push(obj);
        }
    }

    function draw(ctx) {
        ctx.fillStyle = Heli.Color.BACKGROUND;
		ctx.fillRect(0, 0, _width, _height);
        ctx.fill();
    }

    function toPix(userPos) {
        return _height - (_height * (userPos / 100));
    }

    function randomNum(low, high) {
        return low + Math.floor(Math.random() * (high - low));
    }

    function moveTerrain() {

        var toAdd, len, rand,
            last = _terrain[Math.round(_terrain.length-1)];

        if (_randomBlock === null) {
            rand = Math.floor(Math.random() * 50);
            if (params.tick() % rand === 0) {
                _randomBlock = _numLines;
                _blockY = randomNum(last.bottom, 100-last.top);
            }
        } else {
            _randomBlock -= 1;
            if (_randomBlock < 0) {
                _randomBlock = null;
            }
        }

        if (changeDir === 0) {
            _direction = (_direction === Heli.Dir.DOWN) ? Heli.Dir.UP : Heli.Dir.DOWN;
            len = (_direction === Heli.Dir.DOWN) ? last.bottom : last.top;
            magnitude = randomNum(1, 4);
            changeDir = randomNum(5, len / magnitude);
            if (params.tick() % 2 === 0) {
                if (_direction === Heli.Dir.DOWN) {
                    last.top += 1;
                } else {
                    last.bottom += 1;
                }
            }
        }

        changeDir--;

        toAdd = (_direction === Heli.Dir.UP) ? {"top":-magnitude,"bottom":magnitude}
            : {"top":magnitude,"bottom":-magnitude};

        _terrain.push({
            "top":last.top + toAdd.top,
            "bottom":last.bottom + toAdd.bottom
        });
        _terrain.shift();
    }

    function drawTerrain(ctx) {

        var i, obj, bottom;

        ctx.fillStyle = Heli.Color.BLOCK;

        for (i = 0; i < _numLines; i += 1) {
            obj = _terrain[i];
            bottom = obj.bottom;
		    ctx.fillRect(Math.floor(i * _lineWidth), 0,
                         Math.ceil(_lineWidth), obj.top * _lineHeight);
		    ctx.fillRect(Math.floor(i * _lineWidth),
                         _height - bottom * _lineHeight,
                         Math.ceil(_lineWidth),
                         _height);
        }

        if (_randomBlock !== null) {
            var start = toPix(_blockY);
            ctx.fillStyle = Heli.Color.RAND_BLOCK;

	    ctx.fillRect(_randomBlock * _lineWidth, start,
                         _lineWidth, start - toPix(_blockY + _blockHeight));
        }


    }

    function drawUser(ctx, user, trail, alternate) {

        var i, len, mid, image;

//         for (i = trail.length - 1, len = trail.length; i > 0; i -= 1) {
//             ctx.fillStyle = "rgba(255, 255, 255, " + (i / len) + ")";
//             ctx.beginPath();
//             ctx.drawImage(cloud,
//                           (_width * .25) - ((len - i) * (_lineWidth * 2)),
//                           toPix(trail[i-1]));

// //            ctx.arc((_width * .25) - ((len - i) * (_lineWidth * 2)),
//   //                  toPix(trail[i-1]), 5, 0, Math.PI * 2, false);
//             ctx.fill();
//             ctx.closePath();
//        }

        mid = Math.round(_terrain.length * 0.25);
        image = (alternate && params.tick()) % 4 < 2 ? img : img2;

        ctx.fillStyle = Heli.Color.USER;
        ctx.beginPath();
        ctx.drawImage(image, mid * _lineWidth - 40,
                      toPix(user) - (heliHeight / 2));
        ctx.fill();
        ctx.closePath();
    }

    function collided(pos) {

        var midPoint = Math.round(_terrain.length * 0.25),
            middle = _terrain[midPoint],
            size = heliHeight / 2;

        var hitBlock = (_randomBlock === midPoint ||
                        _randomBlock === midPoint-1) &&
            (pos < (_blockY + size)) &&
            (pos > (_blockY - _blockHeight));

        return (pos > (100 - middle.top)) && 100 - middle.top ||
            pos < (middle.bottom + size) && (middle.bottom + size) ||
            hitBlock;
    }

    function drawTarget(ctx, pos, amount) {
        var mid = Math.round(_terrain.length * 0.25);

        ctx.strokeStyle = Heli.Color.TARGET_STROKE;
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.arc((mid * _lineWidth)-10, toPix(pos) + 10,
                50 - amount, 0, Math.PI * 2, false);
        ctx.stroke();
        ctx.closePath();
    }

    return {
        "draw"        : draw,
        "drawUser"    : drawUser,
        "drawTerrain" : drawTerrain,
        "moveTerrain" : moveTerrain,
        "drawTarget"  : drawTarget,
        "toPix"       : toPix,
        "init"        : init,
        "width"       : width,
        "height"      : height,
        "collided"    : collided
    };
};

Heli.Audio = function(game) {

    var files          = [],
        endEvents      = [],
        progressEvents = [],
        playing        = [];

    function load(name, path, cb) {
        
        var f = files[name] = document.createElement("audio");

        progressEvents[name] = function(event) { progress(event, name, cb); };

        f.addEventListener("canplaythrough", progressEvents[name], true);
        f.setAttribute("preload", "auto");
        f.setAttribute("autobuffer", "true");
        f.setAttribute("src", path);
        f.pause();
    }

    function progress(event, name, callback) {
        if (event.loaded === event.total && typeof callback === "function") {
            callback();
            //files[name].removeEventListener("canplaythrough",
             //                               progressEvents[name], true);
        }
    }

    function disableSound() {
        for (var i = 0; i < playing.length; i++) {
            //files[playing[i]].pause();
            //files[playing[i]].currentTime = 0;
        }
        playing = [];
    }

    function stop(file) {
        //files[file].pause();
       // files[file].currentTime = 0;
    }

    function ended(name) {

        var i, tmp = [], found = false;

        files[name].removeEventListener("ended", endEvents[name], true);

        for (i = 0; i < playing.length; i++) {
            if (!found && playing[i]) {
                found = true;
            } else {
                tmp.push(playing[i]);
            }
        }
        playing = tmp;
    }

    function play(name) {
        if (!game.soundDisabled()) {
            endEvents[name] = function() { ended(name); };
            playing.push(name);
            //files[name].addEventListener("ended", endEvents[name], true);
            //files[name].play();
        }
    }

    function pause() {
        for (var i = 0; i < playing.length; i++) {
            //files[playing[i]].pause();
        }
    }

    function resume() {
        for (var i = 0; i < playing.length; i++) {
           // files[playing[i]].play();
        }
    }

    return {
        "disableSound" : disableSound,
        "load"         : load,
        "play"         : play,
        "stop"         : stop,
        "pause"        : pause,
        "resume"       : resume
    };
};

var HELICOPTER = (function() {

    /* Generate Constants from Heli.Consts arrays */
    (function (glob, consts) {
        for (var x, i = 0; i < consts.length; i += 1) {
            glob[consts[i].name] = {};
            for (x = 0; x < consts[i].consts.length; x += 1) {
                glob[consts[i].name][consts[i].consts[x]] = x;
            }
        }
    })(Heli, Heli.Consts);

    var state       = Heli.State.WAITING,
        thrustersOn = false,
        timer       = null,
        audio       = null,
        screen      = null,
        user        = null,
        pos         = 0,
        died        = 0,
       _tick        = 0;

    function keyDown(e) {

        if(e.keyCode === KEY.ENTER) {
            audio.play("start");
            thrustersOn = true;
        }

        if (e.keyCode === KEY.S) {
            localStorage.soundDisabled = !soundDisabled();
        } else if (state === Heli.State.WAITING && e.keyCode === KEY.ENTER) {
            newGame();
        } else if (state === Heli.State.PLAYING && e.keyCode === KEY.P) {
            state = Heli.State.PAUSED;
            window.clearInterval(timer);
            timer = null;
            dialog("Paused");
        } else if (state === Heli.State.PAUSED && e.keyCode === KEY.P) {
            state = Heli.State.PLAYING;
            timer = window.setInterval(mainLoop, 1000/Heli.FPS);
        }
    }

    function keyUp(e) {
        if(e.keyCode === KEY.ENTER) {
            audio.stop("start");
            thrustersOn = false;
        }
    }

    function mouseDown(e) {
        audio.play("start");
        thrustersOn = true;
        if (e.target.nodeName === "CANVAS" && state === Heli.State.WAITING) {
            newGame();
        }
    }

    function mouseUp(e) {
        audio.stop("start");
        thrustersOn = false;
    }

    function tick() {
        return _tick;
    }

    function newGame() {
        if (state != Heli.State.PLAYING) {
            user.reset();
            screen.init();
            timer = window.setInterval(mainLoop, 1000/Heli.FPS);
            state = Heli.State.PLAYING;
        }
    }

    function dialog(text) {
        var textWidth = ctx.measureText(text).width,
            x = (screen.width() - textWidth) / 2,
            y = (screen.height() / 2) - 7;

        ctx.fillStyle = Heli.Color.DIALOG_TEXT;
        ctx.font      = "14px silkscreen";
        ctx.fillText(text, x, y);
    }

    function soundDisabled() {
        return localStorage.soundDisabled === "true";
    }

    function mainLoop() {

        ++_tick;

        if (state === Heli.State.PLAYING) {

            pos = user.move(thrustersOn);
            screen.moveTerrain();

            screen.draw(ctx);
            screen.drawTerrain(ctx);

            var tmp = screen.collided(pos);
            if (tmp !== false) {
                if (tmp !== true) {
                    pos = tmp;
                }
                audio.play("crash");
                state = Heli.State.DYING;
                died = _tick;
                user.finished();
            }
            screen.drawUser(ctx, pos, user.trail(), true);

        } else if (state === Heli.State.DYING && (_tick - died) > (Heli.FPS / 1)) {
            dialog("Press enter to start again.");

            state = Heli.State.WAITING;
            window.clearInterval(timer);
            timer = null;
        } else if (state === Heli.State.DYING) {

            screen.draw(ctx);
            screen.drawTerrain(ctx);
            screen.drawUser(ctx, pos, user.trail(), false);

            screen.drawTarget(ctx, pos, _tick - died);
        }

        drawScore();
    }


    function drawScore() {

        ctx.font = "12px silkscreen";

        var recordText = "Best: " + user.bestDistance() + "m",
            distText   = "Distance: " + user.distance() + "m",
            textWidth  = ctx.measureText(recordText).width,
            textX      = screen.height() + 15;

        ctx.fillStyle = Heli.Color.FOOTER_BG;
		ctx.fillRect(0, screen.height(), screen.width(), Heli.FOOTER_HEIGHT);

        ctx.fillStyle = Heli.Color.FOOTER_TEXT;
        ctx.fillText(distText, 5, textX);
        ctx.fillText(recordText, screen.width() - (textWidth + 5), textX);
    }

    function init(wrapper, root) {

        var width  = wrapper.offsetWidth,
            height = (width / 4) * 3,
            canvas = document.createElement("canvas");

        canvas.setAttribute("width", width + "px");
        canvas.setAttribute("height", (height + 20) + "px");

        wrapper.appendChild(canvas);

        ctx = canvas.getContext('2d');

        audio = new Heli.Audio({
            "soundDisabled" : soundDisabled
        });
        screen = new Heli.Screen({
            "tick"   : tick,
            "width"  : width,
            "height" : height
        });
        user = new Heli.User({"tick":tick});

        screen.init();
        screen.draw(ctx);

        dialog("Loading ...");

        // disable sound while it sucks
        if (typeof localStorage.soundDisabled === "undefined") {
            localStorage.soundDisabled = true;
        }

        var ext = Modernizr.audio.ogg ? 'ogg' : 'mp3';

        var audio_files = [
            ["start", root + "motor." + ext],
            ["crash", root + "crash." + ext]
        ];

        load(audio_files, function () { loaded(); });
    }

    function load(arr, loaded) {

        //if (arr.length === 0) {
            loaded();
        //} else {
            //var x = arr.pop();
            //audio.load(x[0], x[1], function() { load(arr, loaded); });
        //}
    }

    function startScreen() {

        screen.draw(ctx);
        screen.drawTerrain(ctx);

        drawScore();

        ctx.fillStyle = Heli.Color.HOME_TEXT;
        ctx.font = "58px silkscreenbold";

        var text = "helicopter";
        var textWidth = ctx.measureText(text).width,
        x = (screen.width() - textWidth) / 2,
        y = screen.height() / 3;

        ctx.fillText(text, x, y);

        var t  = "Click and hold enter key of Mouse Button";
        var t1 = "to go up, release to go down.";

        ctx.font = "12px silkscreen";

        ctx.fillText(t, x + 5, y + 20);
        ctx.fillText(t1, x + 5, y + 33);

        ctx.fillText("press enter or click mouse to start", x + 5, y + 66);
        ctx.fillText("by dale harvey / arandomurl.com", x + 5, y + 145);
    }


    function loaded() {
        document.addEventListener("keydown", keyDown, true);
        document.addEventListener("keyup", keyUp, true);

        document.addEventListener("mousedown", mouseDown, true);
        document.addEventListener("mouseup", mouseUp, true);

        startScreen();
    }

    return {
        "init" : init
    };
}());