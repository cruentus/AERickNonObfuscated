function save(key, data) {
    if (typeof(data) === "object") {
        localStorage.setItem(key, JSON.stringify(data))
    } else {
        localStorage.setItem(key, data)
    }
}

function load(key, def) {
    var data = localStorage.getItem(key);
    // console.log("data:",data)
    return data ? data : def
}

function remove(key) {
    localStorage.removeItem(key)
}


function stripCommas(num) {
    var re = /,/g;
    return num.replace(re, "");
}

function stripNewline(str) {
    var re = /(\r\n|\n|\r)/gm;
    return str.replace(re, "");
}

function trim(str, chars) {
    return ltrim(rtrim(str, chars), chars);
}

function ltrim(str, chars) {
    chars = chars || "\\s";
    return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
}

function rtrim(str, chars) {
    chars = chars || "\\s";
    return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
}

function getPlayerName(name) {
    var regex = /(\[.*?\])(.*)/;
    result = regex.exec(name);
    if (result != null)
        return result[2].substring(1);
    else return name;
}

function getGuildTag(name) {
    var regex = /\[.*?\]/;
    result = regex.exec(name);
    if (result) return result[0];
    else return name;
}

function post(url, params, referer) {
    var req = new XMLHttpRequest();
    req.open("POST", url, false);
    req.setRequestHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8");
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    if (referer && referer.length > 0) {
        req.setRequestHeader("replace_referer", referer);
    }
    req.send(params);
    if (req.readyState == 4 && req.status == 200) {
        return req.responseText;
    }
    return req;
}

function postAsync(url, params, referer, callback) {
    var req = new XMLHttpRequest();
    req.open("POST", url, true);
    req.setRequestHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8");
    req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    if (referer && referer.length > 0) {
        req.setRequestHeader("replace_referer", referer);
    }
    if (callback) {
        req.onreadystatechange = () => {
            if (req.readyState == 4 && req.status == 200) {
                callback(req.responseText)
            }
        }
    }
    req.send(params);
    // if (req.readyState == 4 && req.status == 200) {
    //     return req.responseText;
    // }
    // return req;
}

function getRandomFloat(min, max) { // used for random sleep times
    return Math.random() * (max - min) + min;
}

function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return "";
}

function _x(STR_XPATH) {
    var xresult = document.evaluate(STR_XPATH, document, null, XPathResult.STRING_TYPE, null);
    var value = xresult.stringValue
    return value;
}

var _server = null;

function getServer() { //updated for https support, rick 02-29-19
    if (_server == null) {
        var regex = /https?:\/\/([a-z]+)\.astroempires\.com/;
        var result = regex.exec(document.location);
        if (result == null) {
            regex = /https?:\/\/([a-z]+)\.astroempires\.com/;
            result = regex.exec(document.URL);
        }
        if (result != null) _server = result[1];
    }
    //console.log("Server: " + _server);
    return _server;
}

function getAsync(url, referer, callback, params) {
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.setRequestHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8");
    if (referer && referer.length > 0) {
        req.setRequestHeader("replace_referer", referer);
    }
    if (callback) {
        req.onreadystatechange = () => {
            if (req.readyState == 4 && req.status == 200) {
                callback(req.responseText, params)
            }
        }
    }
    req.send();
    // return req;
}

function getAccountId() {
    let accID = document.getElementById("account").nextSibling.innerText;
    //console.log("accID: ",accID)
    chrome.runtime.sendMessage({
        key: "accID",
        value: accID
    })
    return accID;
}

function getPageType() { // updated 2019 march rick
    var location = window.location.href;
    if (location.indexOf('empire.aspx') != -1) {
        if (location.indexOf('bases_capacities') != -1) return 'bases_capacities';
        if (location.indexOf('report') != -1) return 'report';
        if (location.indexOf('view=units') != -1) return 'empire_units';
        if (location.indexOf('view=structures') != -1) return 'empire_structures';
        return 'empire';
    } else if (location.indexOf('map.aspx') != -1) {
        switch (window.location.search.length) {
            case 17:
                if (location.indexOf('cmp=') != -1) return 'mapRegion';
                else return 'mapAstro';
                break;
            case 20:
                return 'mapSystem';
        }
    } else if (location.indexOf('base.aspx') != -1) {
        if (location.indexOf('structures') == -1 && location.indexOf('defenses') == -1 && location.indexOf('production') == -1 &&
            location.indexOf('research') == -1 && location.indexOf('trade') == -1 && location.indexOf('base=') != -1) {
            return 'baseOverview';
        } else return 'other';
    } else if (location.indexOf('messages.aspx') != -1) return 'messages';
    else if (location.indexOf('guild.aspx') != -1) return 'guild';
    else if (location.indexOf('profile.aspx') != -1 && location.indexOf('?player=') == -1) return 'profile';
    else return 'other';
}

var cached_new_style = 5;

function isNewStyle() {
    if (cached_new_style != 5) return cached_new_style;
    if (document.getElementById('background-container') || document.getElementById('background-content')) {
        cached_new_style = true;
    } else {
        cached_new_style = false;
    }
    return cached_new_style;
}

function parseToDOM(str) {
    var div = document.createElement("div");
    if (typeof str == "string")
        div.innerHTML = str;
    div.style.display = "none";
    return div;
}

function isNull(str) {
    if (!str || str == "" || str == "NaN") return true;
    return false
}

function log(obj) {
    if (!obj) {
        log("obj is null")
        return
    }
    if (obj.constructor == String) {
        console.log(obj)
    } else {
        console.log(JSON.stringify(obj))
    }
}

var thousandsFormatter = ',';

function parseNum(s) { // 2010-10, used 10+
    try {
        s += '';
        var re = /,/g;
        if (thousandsFormatter == '%2C') {
            re = /,/g;
        }
        if (thousandsFormatter == '%20') {
            re = / /g;
        }
        s = s.replace(re, "");
        return parseInt(s);
    } catch (e) {
        console.log('parseNum(' + s + ') error ' + e);
        return s;
    }
}

function checkLicense(id, thisServer) {
    var auth = false;
    var targetExtensionId = chrome.runtime.id;
    chrome.runtime.sendMessage(targetExtensionId, {
        key: "license"
    }, function(response) {
        for (var i = 0; i < response.licArray.licenses[thisServer].length; i++) {
            let licresp = response.licArray.licenses[thisServer][i].id;
            //console.log(licresp);
            //console.log('accID = ' + accID);
            if (accID == licresp) {
                auth = true;
            }
        }
        if (auth) {
            save("auth" + accID, "true");
            console.log('Authed, saving as true');
        } else {
            save("auth" + accID, "false");
            console.log('Not authed, saving as false');
        }
    })
}
var accID = getAccountId();
var thisServer = getServer();
var d = new Date();
var currentTime = Math.round(d.getTime() / 1000);
var lastLicenseCheck = parseNum(load('lastLicenseCheck' + accID, "0"));
let lastLic = load('lastLicenseCheck' + accID, "0");
var authed = load("auth" + accID, "false");
//console.log('authed = ' + authed);
if (lastLicenseCheck == '0' || currentTime > (lastLicenseCheck + (86400 * 7)) || authed == 'false') {
    //console.log('currentTime = ' + currentTime);
    console.log('last license check was either 0 or a week ago, or were not authed.. checking license');
    checkLicense(accID, thisServer);
    save('lastLicenseCheck' + accID, currentTime)
    authed = load("auth" + accID, "false");
    console.log('Authed? ' + authed);
}

Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};
Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};



