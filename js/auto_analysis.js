var x = document.getElementsByClassName("layout listing btnlisting tbllisting1 sorttable");
var myid = getAccountId()
var href = window.location.href;
var domain = href.substring(0, href.search('com') + 4);
var detailHtmlInfo = "";
var all_js = document.getElementsByTagName('script');
var div = document.getElementById("base_div");
init()


function init() {
    //Anti-Detection
    //http://cdn.astroempires.com/javascript/js_jquery_debug_v1.0.js
    for (var i = 0; i < all_js.length; i++) {
        var src = all_js[i].getAttributeNode("src");
        if (src == null) continue;
        var value = src.value;
        //Log(value);
        if (value.search("js_jquery_debug") > 0) {
            alert("Disabled, admins were looking.");
            return;
        }
    }

    var search = decodeURIComponent(window.location.search).replace('?', '');
    switch (window.location.pathname.replace('/', '').replace('.aspx', '')) {
        case 'map':
            var region = search.match(/loc=([A-Z]\d\d:\d\d)/);
            var system = search.match(/loc=([A-Z]\d\d:\d\d:\d\d)/);
            var astro = search.match(/loc=([A-Z]\d\d:\d\d:\d\d:\d\d)/);
            if (astro != null) {
                insertAnalysisButton();
                break;
            } else if (system != null) {
                break;
            }
            break;
        case 'base':
            if (search.match(/base=\d+&view=structures/) != null) {} //structs
            else if (search.match(/base=\d+&view=defenses/) != null) {} //defs
            else if (search.match(/base=\d+/) != null && search.match(/&view=/) == null && visibleBase()) {
                $('th:contains(Location)').append('&nbsp;<a href="bookmarks.aspx?action=add&astro=' + $('a[href^="map.aspx?loc="]').text() + '">bookmark</a>');
                insertAnalysisButton();
            }
            break;
    }
}

function visibleBase() {
    try {
        if ($('center:contains(Invalid Base)').length > 0) return false;
        if ($('table:contains(You can\'t see this Base Information)').length > 0) return false;
        return true;
    } catch (e) {}
}

function insertAnalysisButton() {
    var aDiv = document.createElement("div");
    aDiv.setAttribute('align', 'left');
    var aBtn = document.createElement('input');
    aBtn.type = 'button';
    aBtn.id = 'analysisTab';
    aBtn.value = 'Analyze Fleets';
    var clrEnableI = document.createElement('input');
    clrEnableI.type = 'checkbox';
    clrEnableI.id = 'clrEnable';
    clrEnableI.checked = false;
    aDiv.appendChild(aBtn);
    aDiv.appendChild(clrEnableI);
    aDiv.appendChild(document.createTextNode(' Color Fleets'));
    div.appendChild(document.createElement('br'));
    div.appendChild(document.createTextNode('Fleet Analysis: '));
    div.appendChild(document.createElement('br'));
    div.appendChild(aDiv);
    $("#analysisTab").click(analysisTab)
    $("#clrEnable").change(function() {
        if (this.checked) {
            colorSpecs();
        } else {
            uncolorSpecs();
        }
    });
    showSpec()
}

function showSpec() {
    let len = x[0].children[1].childElementCount
    let tab = x[0].children[1]
    for (var i = 0; i < len; i++) {
        let id = tab.children[i].childNodes[1].firstElementChild.href.toString().replace(/.*=(\d{1,})$/, "$1");
        let spec = load("spec_" + id, null)
        if (spec) {
            tab.children[i].cells[0].children[0].textContent = "(" + spec + ")" + " - " + tab.children[i].cells[0].children[0].textContent
        }
    }
}
var originalBG;
function colorSpecs() {
    let len = x[0].children[1].childElementCount
    let tab = x[0].children[1]
    originalBG = tab.children[1].style.background
    for (var i = 0; i < len; i++) {
        let id = tab.children[i].childNodes[1].firstElementChild.href.toString().replace(/.*=(\d{1,})$/, "$1");
        let spec = load("spec_" + id, null)
        if (spec) {
            tab.children[i].style.background = getspecColor(spec)
        }
    }
}

function uncolorSpecs() {
    let len = x[0].children[1].childElementCount
    let tab = x[0].children[1]
    for (var i = 0; i < len; i++) {
        let id = tab.children[i].childNodes[1].firstElementChild.href.toString().replace(/.*=(\d{1,})$/, "$1");
        let spec = load("spec_" + id, null)
        if (spec) {
            tab.children[i].style.background = originalBG;
        }
    }
}

function getspecColor(spec) {
    var result = "sb"
    switch (spec) {
        case "DROP":
        case "CV":
            result = "#30fffe"
            break
        case "CR":
            result = "#25df55"
            break
        case "IF":
        case "FR":
            result = "#9725f8"
            break
        case "HC":
            result = "#105ad6"
            break
        case "BS":
            result = "#8f5311";
            break
        case "DN":
            result = "#4f2222"
        case "CAP":
            result = "#ff0ffc";
            break
        default:
            result = originalBG;
            break
    }
    return result
}

var analyzeCounter = 0;
var len2 = x[0].children[1].childElementCount

function analysisTab() {
    let len = x[0].children[1].childElementCount
    let tab = x[0].children[1]
    let nap = 3000
    for (var i = 0; i < len; i++) {
        let id = tab.children[i].childNodes[1].firstElementChild.href.toString().replace(/.*=(\d{1,})$/, "$1");
        let fleet = tab.children[i].childNodes[0].firstElementChild.href.toString()
        setTimeout(function() {
            let pfleet = arguments[0]
            let pid = arguments[1]
            getAsync(pfleet, window.location.href, analysis, pid)
        }, nap * i, fleet, id)
    }
}

function analysis(data, id) {
    let dom = parseToDOM(data)
    document.body.append(dom)
    let tabs = document.getElementById("fleet_overview").getElementsByTagName("tr")
    let len = tabs.length
    var spec = ""
    var max = 0
    for (var i = 3; i < len; i++) {
        let fleet = tabs[i].cells[0].children[0].innerText
        let num = stripCommas(tabs[i].cells[1].innerText)
        console.log('Fleet: ' + fleet + ' Num: ' + num)
        let size = (getSize(fleet) * num)
        console.log('Size: ' + size)
        console.log('Max: ' + max)
        if (size > max) {
            max = size
            spec = fleet
            console.log('Spec: ' + spec)
        }
    }
    if (max > 100000) {
        let calSpec = getSpecType(spec)
        console.log("Spec", spec)
        if (myid == id) {
            save("spec_self", calSpec)
        } else {
            div.appendChild(document.createElement('br'));
            div.appendChild(document.createTextNode(id + '-' + calSpec));
            save("spec_" + id, calSpec)
        }
        if (calspec = "sb") {
            console.log(id, calSpec)
        }
    } else {}
    analyzeCounter++;
    $(dom).remove()
    if (analyzeCounter >= len2) {
        div.appendChild(document.createElement('br'));
        div.appendChild(document.createElement('br'));
        div.appendChild(document.createTextNode('Analysis Finished!'));
    }
}

function getSpecType(spec) {
    var result = "sb"
    switch (spec) {
        case "Fighters":
        case "Bombers":
        case "Heavy Bombers":
        case "Ion Bombers":
            result = "DROP";
            break
        case "Corvette":
            result = "CV";
            break
        case "Cruiser":
            result = "CR";
            break
        case "Frigate":
            result = "FR";
            break
        case "Ion Frigate":
            result = "IF";
            break
        case "Heavy Cruiser":
            result = "HC";
            break
        case "Battleship":
            result = "BS";
            break
        case "Dreadnought":
            result = "DN";
            break
        case "Titan":
        case "Leviathan":
        case "Death Star":
            result = "CAP";
            break
    }
    return result
}

function getSize(spec) {
    switch (spec) {
        case "Fighters":
            return 5
        case "Bombers":
            return 10
        case "Heavy Bombers":
            return 30
        case "Ion Bombers":
            return 60
        case "Corvette":
            return 20
        case "Recycler":
            return 0
        case "Destroyer":
            return 0
        case "Frigate":
            return 80
        case "Ion Frigate":
            return 120
        case "Scout Ship":
            return 0
        case "Outpost Ship":
            return 0
        case "Cruiser":
            return 200
        case "Carrier":
            return 0
        case "Heavy Cruiser":
            return 500
        case "Battleship":
            return 2000
        case "Fleet Carrier":
            return 0
        case "Dreadnought":
            return 10000
        case "Titan":
            return 50000
        case "Leviathan":
            return 200000
        case "Death Star":
            return 500000
        default:
            return 0
    }
}

//added RK
function stripCommas(num) {
    var re = /,/g;
    return num.replace(re, "");
}