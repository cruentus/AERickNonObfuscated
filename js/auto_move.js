// ==UserScript==
// @name         AE Shit
// @namespace    http://tampermonkey.net/
// @description  Various AE things...
// @version      0.1.1 beta
// @author       Rick
// @match        http://*.astroempires.com/*
// @require      https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery.form/4.2.2/jquery.form.min.js
// @grant        null
// @grant        unsafeWindow
// ==/UserScript==

var canRun = true;
var href = window.location.href;
'use strict';
var domain = href.substring(0, href.search('com') + 4);
var detailHtmlInfo = "";
var jumpleftTime;
(function() {
    //Anti-Detection
    //http://cdn.astroempires.com/javascript/js_jquery_debug_v1.0.js
    var all_js = document.getElementsByTagName('script');
    for (var i = 0; i < all_js.length; i++) {
        var src = all_js[i].getAttributeNode("src");
        if (src == null) continue;
        var value = src.value;
        //Log(value);
        if (value.search("js_jquery_debug") > 0) {
            alert("Disabled, admins were looking.");
            canRun = false;
            return;
        }
    }
});

function get_server_load_time() {
    // get the servertime that the page loaded at
    // returns a string in the format of 'day-month-year h:m:s'
    var s = new Date(document.getElementById('server-time').title);
    return s.getDate() + '-' + (s.getMonth() + 1) + '-' + s.getFullYear() + ' ' + s.getHours() + ':' + s.getMinutes() + ':' + s.getSeconds();
}

function getaestatus(doc) {
    var stat;
    if (document.getElementById('rk_status') == null) {
        stat = document.createElement('div');
        stat.id = 'rk_status';
        stat.style.position = 'absolute';
        document.body.appendChild(stat);
    } else stat = document.getElementById('rk_status');
    // set the initial hidden/shown state
    stat.style.display = 'none';
    return document.getElementById('rk_status');
}

function my_date_parse(input) { // FIXME handle all date formats
    var parts = input.split(' ');
    var a = parts[0].split('-');
    var b = parts[1].split(':');
    var foo = new Date();
    foo.setYear(a[2]);
    foo.setDate(a[0]); // weird bug?
    foo.setMonth(a[1] - 1);
    foo.setHours(b[0]);
    foo.setMinutes(b[1]);
    foo.setSeconds(b[2]);
    return foo;
}

function initUI() { //added by RK
    var search = decodeURIComponent(window.location.search).replace('?', '');
    switch (window.location.pathname.replace('/', '').replace('.aspx', '')) {
        case 'fleet':
            if (search.match(/fleet=\d+/) != null && search.match(/view=/) == null || href.endsWith('action=recall')) jumpUI();
            else if (search.match(/fleet=\d+/) == null || search.match(/view=move_start/) != null);
            else if (search.match(/fleet=\d+&view=move/) != null) {
                launchUI();
                init_launch_tick();
            } else if (search.match(/fleet=\d+&view=attack/) != null);
            break;
        case 'empire':
            break;
    }
    var z = get_server_load_time();
    var serv_time = my_date_parse(z);
    var ts = document.createElement('div');
    ts.style.display = 'none';
    ts.id = 'rk_ts';
    ts.textContent = Date.now() - serv_time.getTime();
    getaestatus().appendChild(ts);
    insertGatherButton();
}

function jumpUI() {
    var launchTimer = null
    let fleetOwner = getFleetOwnerId()
    if (fleetOwner) return
    let list = document.getElementsByClassName("listing-header")[0].parentNode.children
    let len = list.length;
    for (var i = 1; i < len; i++) {
        var input = document.createElement('input');
        input.setAttribute("type", "input-button")
        input.setAttribute("id", "input_" + i)
        input.value = stripCommas(list[i].children[1].innerText.trim())
        list[i].appendChild(input)
    }
    var jump_d = document.createElement('div');
    jump_d.id = 'auto_jump';
    jump_d.style.border = '1px solid red';

    var tar_location = _x("/html/body/table[2]/tbody/tr[2]/td[1]/a/small").slice(1, -1)
    var jump_tar = document.createElement('input');
    jump_tar.type = 'text';
    jump_tar.id = 'trans_target';
    jump_tar.value = tar_location;
    jump_d.appendChild(document.createTextNode('Jump Dest:'));
    jump_d.appendChild(jump_tar);

    var jump_check = document.createElement('input');
    jump_check.type = 'checkbox';
    jump_check.id = 'trans_btn';
    jump_d.appendChild(jump_check);
    jump_d.appendChild(document.createTextNode(' Enable Jump'));

    var jump_timer = document.createElement('span');
    jump_timer.id = 'auto_set';
    jump_timer.innerHTML = '';
    jump_d.appendChild(document.createElement('br'));
    jump_d.appendChild(jump_timer);

    jump_check.addEventListener('click', function() {
        $("#trans_btn").attr('disabled', true);
        moveRetry = 0;
        var time_delay = 6300;
        var nap = time_delay;
        let fleet_ch1 = load("fleet_ch1", null)
        let fleet_ch2 = load("fleet_ch2", 1)
        if (!fleet_ch1 || !fleet_ch2) {
            jump_progress.innerHTML = " Setting failed, enter fleet page once to enter parameters."
            return
        }
        var timeTag = document.getElementById("timer1")
        if (timeTag) {
            var time = timeTag.innerText.trim().split('\n')[0]
            if (time != "-" && time != "DONE") {
                nap = time_to_sec(time) * 1000 + time_delay
            }
        } else {
            nap = 0;
        }
        if (nap > 0) {
            jumpleftTime = nap / 1000;
            launchTimer = setInterval(function() {
                jumpTick();
            }, 1000);
        }
        setTimeout(function() {
            move(jump_tar.value);
        }, nap)
    })
    var tab = document.getElementById("fleet_overview");
    tab.appendChild(jump_d);
}

function format_servertime(input) {
    return input.getDate() + '-' + (input.getMonth() + 1) + '-' + input.getFullYear() + ' ' + input.getHours() + ':' + input.getMinutes() + ':' + input.getSeconds();
}

function format_time_length(input, format, raw) {
    if (!raw) raw = {};
    raw.d = Math.floor(input / (24 * 60 * 60 * 1000));
    raw.h = Math.floor(input / (60 * 60 * 1000)) % 24;
    raw.m = Math.floor(input / (60 * 1000)) % 60;
    raw.s = Math.floor(input / 1000) % 60;
    raw.ms = input % 1000;
    switch (format) {
        case 'auto':
        default:
            if (raw.d > 0) return raw.d + 'd' + raw.h + 'h';
            else if (raw.h > 0) return raw.h + 'h' + raw.m + 'm';
            else if (raw.m > 0) return raw.m + 'm' + raw.s + 's';
            else if (raw.s > 0) return raw.s + 's' + raw.ms + 'ms';
            else return raw.ms + 'ms';
    }
}

function sync_time_1(time1, time2, time3, duration, offset) {
    var launch_t = my_date_parse(time1.value);
    var land_t = new Date(launch_t.getTime() + (duration * 1000));
    var launch_in = (launch_t - Date.now()) / 1000;

    time2.value = format_servertime(land_t);
    time3.value = Math.round(launch_in + (offset / 1000), 3);

    if ((launch_in + (offset / 1000)) < 0) {
        time2.value = 'Too Late!';
        time3.value = '-' + Math.round((launch_in + (offset / 1000)) * -1, 0) + ' seconds';
        do_launch();
    }
    if (time3.value == 'NaN') time3.value = 'error';
    else time3.value = format_time_length(parseInt(time3.value) * 1000);
}

function sync_time_2(time1, time2, time3, duration, offset) {
    if (time2.value == 'Too Late!') {
        time2.value = get_server_load_time();
    }
    var land_t = my_date_parse(time2.value);
    var launch_t = new Date(land_t.getTime() - (duration * 1000));
    var launch_in = (launch_t - Date.now()) / 1000;

    time1.value = format_servertime(launch_t);
    time3.value = Math.round(launch_in + (offset / 1000), 3);

    if ((launch_in + (offset / 1000)) < 0) {
        time1.value = 'Too Late!';
        time3.value = '-' + Math.round((launch_in + (offset / 1000)) * -1, 0) + ' seconds';
        do_launch();
    }
    if (time3.value == 'NaN') time3.value = 'error';
    else time3.value = format_time_length(parseInt(time3.value) * 1000);
}

function sync_time_3(time1, time2, time3, duration, offset) {
    if (launch_t.getTime() < Date.now()) {
        time2.value = 'Too Late!';
        time3.value = '-' + (launch_in * -1) + ' seconds';
    }
}
var wormhole;

function check_autolaunch(e) {
    var time1 = document.getElementById('launch_auto_time1');
    var time2 = document.getElementById('launch_auto_time2');
    var time3 = document.getElementById('launch_auto_time3');
    var sel1 = document.getElementById('launch_sel_1');
    var sel2 = document.getElementById('launch_sel_2');
    var sel3 = document.getElementById('launch_sel_3');
    var distance = parseFloat(document.getElementById('distance').innerHTML);
    var maxspeed = parseFloat(document.getElementById('maxspeed').innerHTML);
    var logical = parseFloat(document.getElementById('logistics').getAttribute('js_value'));
    var duration = 0;
    var offset = document.getElementById('rk_ts').textContent;
    if (document.location.href.indexOf('use=wormhole') != -1) { // its a wormhole, always 12h trips
        wormhole = true;
        duration = 3600 * 12;
    } else if ((distance > 0) && (maxspeed > 0)) {
        wormhole = false;
        duration = Math.ceil((distance / maxspeed) * 3600);
        duration = Math.ceil(duration * (1 - logical * 0.01));
    }

    if (e == 'tick') {
        var mode = 1;
        for (var x = 1; x < 4; x++) {
            var foo = document.getElementById('launch_sel_' + x);
            if (!foo) return; // radio check boxes are missing
            if (foo.checked) mode = x;
        }
        switch (mode) {
            case 1:
                sync_time_1(time1, time2, time3, duration, offset, );
                break;
            case 2:
                sync_time_2(time1, time2, time3, duration, offset);
                break;
            case 3:
                sync_time_3(time1, time2, time3, duration, offset);
                break;
        }
    } else {
        switch (event.target.id) {
            case 'launch_auto_time1':
                sync_time_1(time1, time2, time3, duration, offset);
                break;
            case 'launch_auto_time2':
                sync_time_2(time1, time2, time3, duration, offset);
                break;
            case 'launch_auto_time3':
                sync_time_3(time1, time2, time3, duration, offset);
                break;
            case 'launch_sel_1':
                time1.readOnly = false;
                time2.readOnly = time3.readOnly = true;
                time1.style.color = 'green';
                time2.style.color = time3.style.color = 'red';
                sel2.checked = false;
                sel3.checked = false;
                sync_time_1(time1, time2, time3, duration, offset);
                break;
            case 'launch_sel_2':
                time2.readOnly = false;
                time1.readOnly = time3.readOnly = true;
                time2.style.color = 'green';
                time1.style.color = time3.style.color = 'red';
                sel1.checked = false;
                sel3.checked = false;
                sync_time_2(time1, time2, time3, duration, offset);
                break;
            case 'launch_sel_3':
                time3.readOnly = false;
                time1.readOnly = time2.readOnly = true;
                time3.style.color = 'green';
                time1.style.color = time2.style.color = 'red';
                sel1.checked = false;
                sel2.checked = false;
                sync_time_3(time1, time2, time3, duration, offset);
                break;
        }
    }
}

function toggle_autol(e) {
    var on_off = document.getElementById('auto_l_link');
    var hint = document.getElementById('auto_l');
    if (on_off.textContent == '[-]') { // the hint is open, close it
        hint.style.display = 'none';
        on_off.textContent = '[+]';
    } else { // hint is closed, open it
        hint.style.display = '';
        on_off.textContent = '[-]';
    }
}

function get_hint_area() {
    var hint = document.getElementById('hint');
    if (hint != null) return hint;
    var theform = document.getElementById('fleet_move').getElementsByTagName('form')[0].getElementsByTagName('center')[0];

    if (!theform) {
        theform = document.querySelector('#fleet_move form input[type=submit]').parentNode;
        if (!theform) throw 'minor wormhole problems';
    }
    hint = document.createElement('span');
    hint.id = 'hint';
    hint.className = 'aerick';
    theform.appendChild(hint);
    return hint;
}

function launchUI() {
    var center = $("#move_fleet_form center");
    center[0].outerHTML = "<center style='margin: 10px'><input class='input-button' type=\"button\" id='launch_now' value='Launch Now'/></center>"
    var auto_l_m = document.createElement('div');
    var link = document.createElement('a');
    var auto_l = document.createElement('div');

    link.textContent = '[-]';
    link.id = 'auto_l_link';
    link.addEventListener('click', toggle_autol, false);
    link.href = 'javascript:void(0);';
    auto_l_m.appendChild(link);
    auto_l_m.appendChild(document.createTextNode('Auto Launcher'));
    var enabled = true;

    if (enabled == false) {
        auto_l.style.display = 'none';
        link.textContent = '[+]';
    }

    auto_l_m.appendChild(auto_l);
    auto_l.id = 'auto_l';
    auto_l.style.border = '1px solid red';

    var time = document.createElement('input');
    time.type = 'text';
    time.id = 'launch_auto_time1';
    auto_l.appendChild(document.createTextNode('Launch time: '));
    auto_l.appendChild(time);
    var select = document.createElement('input');
    select.type = 'radio';
    select.checked = 'checked';
    select.id = 'launch_sel_1';
    auto_l.appendChild(select);
    auto_l.appendChild(document.createElement('br'));
    var time1 = time;
    var sel1 = select;

    var time = document.createElement('input');
    time.type = 'text';
    time.id = 'launch_auto_time2';
    auto_l.appendChild(document.createTextNode('Landing Time: '));
    auto_l.appendChild(time);
    var select = document.createElement('input');
    select.type = 'radio';
    select.id = 'launch_sel_2';
    auto_l.appendChild(select);
    auto_l.appendChild(document.createElement('br'));
    var time2 = time;
    var sel2 = select;

    var time = document.createElement('input');
    time.type = 'text';
    time.id = 'launch_auto_time3';
    auto_l.appendChild(document.createTextNode('Launching in: '));
    auto_l.appendChild(time);
    var select = document.createElement('input');
    select.type = 'radio';
    select.id = 'launch_sel_3';
    auto_l.appendChild(select);
    auto_l.appendChild(document.createElement('br'));
    var time3 = time;
    var sel3 = select;

    var dispatchQty = document.createElement('input');
    dispatchQty.type = 'text';
    dispatchQty.id = 'dispatch';
    auto_l.appendChild(document.createTextNode('Shotgun Fleets: '));
    auto_l.appendChild(dispatchQty);

    var enable_check = document.createElement('input');
    enable_check.type = 'checkbox';
    enable_check.id = 'launch_auto_enable';
    enable_check.checked = false;
    var name = document.createElement('span');
    name.innerHTML = '<br>Timed Launch';
    name.appendChild(enable_check);
    auto_l.appendChild(name);

    var now = get_server_load_time();
    time1.value = now;
    time2.value = now;
    time3.value = '00:00:00';
    time1.style.color = 'green';
    time2.style.color = time3.style.color = 'red';

    time2.readOnly = true;
    time3.readOnly = true;

    sel3.style.display = 'none';

    if (now === false) {}

    time1.addEventListener('keyup', check_autolaunch, false);
    time2.addEventListener('keyup', check_autolaunch, false);
    time3.addEventListener('keyup', check_autolaunch, false);
    sel1.addEventListener('click', check_autolaunch, false);
    sel2.addEventListener('click', check_autolaunch, false);
    sel3.addEventListener('click', check_autolaunch, false);
    var launchArea = get_hint_area();
    launchArea.parentNode.insertBefore(auto_l_m, launchArea.nextSibling);
    let fleet_ch1 = document.getElementsByName("fleet_ch1")
    if (fleet_ch1) {
        // console.log("save fleet_ch1 " + fleet_ch1[0].value)
        save("fleet_ch1", fleet_ch1[0].value)
    }
    let fleet_ch2 = document.getElementsByName("fleet_ch2")
    if (fleet_ch1) {
        save("fleet_ch2", fleet_ch2[0].value)
    }
    var checkbox = document.getElementById('launch_auto_enable')
    $('#launch_now').on('click', function() {
        launchImmediate();
    })
}

function insertGatherButton() {
    var progressText; // later use
    var gather_d = document.createElement('div');
    gather_d.id = 'gather_div';
    gather_d.setAttribute('align', 'left')

    var gather_btn = document.createElement('input');
    gather_btn.id = 'auto-rally';
    gather_btn.type = 'button';
    gather_btn.value = "Gather";

    var progressSpan = document.createElement('span');
    progressSpan.id = 'progressSpan';

    gather_d.appendChild(document.createElement('br'));
    gather_d.appendChild(document.createTextNode('Fleet Rally: '))
    gather_d.appendChild(document.createElement('br'));
    gather_d.appendChild(gather_btn);
    gather_d.appendChild(document.createElement('br'));
    gather_d.appendChild(progressSpan);
    var div = document.getElementById("base_div");
    div.appendChild(gather_d);
    $("#auto-rally").click(auto_rally);
}
var accID = getAccountId();
var thisServer = getServer();
if (canRun == true && authed == 'true'){
   initUI();
   console.log('authed in automove = ' + authed) 
} 
var progressText = ""; // later use

function auto_rally() {
    var targetExtensionId = chrome.runtime.id
    $("#auto-rally").attr('value', 'Sending...');
    $("#auto-rally").attr('disabled', true);
    chrome.runtime.sendMessage(targetExtensionId, {
        key: "load"
    }, function(response) {
        let nap = 5000
        let counter = 1
        for (var i = 0; i < response.airline.length; i++) {
            setTimeout(function() {
                let resp = arguments[0]
                let i = arguments[1]
                progressText = "(" + counter + "/" + response.airline.length + ") ..."; // add line...
                $("#progressSpan").append(progressText);
                $("#progressSpan").append('<br');
                counter++;
                rally(resp.airline[i].fleet, resp.airline[i].to, resp.checkedFleets, resp.hangar, resp.leave)
            }, nap * i, response, i)

        }
    })
}

function rally(fleet, destination, spec, hangar, leave) {
    $.get("fleet.aspx?fleet=" + fleet + "&view=move", function(data, status) {
        var div = document.createElement('div');
        div.style.display = "none";
        document.body.appendChild(div);
        div.innerHTML = data;
        var units = $(div).find("#units").val().split(',');
        if (units.length <= 0) { //nounits
            return;
        }
        let params = []
        var maxHanger = 0;
        for (var i = 0; i < units.length; i++) {
            if (spec.includes(units[i])) {
                let num = $(div).find("[id='avail" + units[i] + "']").text()
                if (leave && units[i] == "Dreadnought") {
                    num--
                }
                params.push(units[i] + "=" + num)
                maxHanger += getHanger(units[i]) * num
            }
        }
        if (hangar) {
            let ftNum = $(div).find("[id='availFighters']").text() || 0
            params.push("Fighters=" + Math.min(maxHanger, ftNum))
        }
        moveImpl(fleet, destination, params)
    });
}

function getHanger(spec) {
    switch (spec) {
        case "Frigate":
            return 4
        case "Ion Frigate":
            return 4
        case "Cruiser":
            return 4
        case "Carrier":
            return 60
        case "Heavy Cruiser":
            return 8
        case "Battleship":
            return 40
        case "Fleet Carrier":
            return 400
        case "Dreadnought":
            return 200
        case "Titan":
            return 1000
        case "Leviathan":
            return 4000
        case "Death Star":
            return 10000
        default:
            return 0
    }
}

function getFleetOwnerId() {
    var player = document.getElementsByTagName("tbody")[3].children[1].children[0].firstElementChild.href
    if (player) {
        var index = player.indexOf("player=")
        if (index > 0) {
            return player.substr(index + 7)
        }
    }
}

var time_to_sec = function(time) {
    var s = '';
    var hour = time.split(':')[0];
    var min = time.split(':')[1];
    var sec = time.split(':')[2];
    s = Number(hour * 3600) + Number(min * 60) + Number(sec);

    return s;
};


function move(dst) {
    let fleetId = getUrlParam("fleet")
    let list = document.getElementsByClassName("listing-header")[0].parentNode.children
    let len = list.length;
    let params = []
    let units = []
    // console.log("len:" + len)
    for (var i = 1; i < len; i++) {
        units.push(list[i].children[0].firstElementChild.innerText)
        params.push(list[i].children[0].firstElementChild.innerText + "=" + stripCommas(document.getElementById("input_" + i).value)) //+ list[i].children[1].innerText.trim())
    }
    params.push("units" + "=" + units.join(" "))
    moveImpl(fleetId, dst, params)
}

var moveRetry = 0

function moveImpl(fleetId, dst, params) {
    let fleet_ch1 = load("fleet_ch1", null)
    let fleet_ch2 = load("fleet_ch2", 1)
    if (!fleet_ch1 || !fleet_ch2) return
    params.push("fleet_ch1" + "=" + fleet_ch1)
    params.push("fleet_ch2" + "=" + fleet_ch2)
    params.push("destination" + "=" + dst)
    if (wormhole) params.push("use" + "=" + "wormhole");
    console.log("id: " + fleetId + " dst: " + dst + " params: " + params)
    let url = "/fleet.aspx?fleet=" + fleetId + "&view=move_start";
    let referer = window.location.host + "/fleet.aspx?fleet=" + fleetId + "&view=move";
    postAsync(url, params.join("&"), referer, function(response) {
        var dom = parseToDOM(response)
        var error = $(dom).find("center.error").html()
        if (error) {
            console.log("errorStr:" + error)
            if (moveRetry < 2) {
                moveRetry++
                setTimeout(function() {
                    moveImplRetry(fleetId, dst, params)
                }, 500)
            } else {
                console.log("auto move failed")

                progressText = " Failed"; // set text
                $("#progressSpan").append(progressText);
                $("#progressSpan").append('<br>');

                $("#auto_set").html('Fail');
            }
        } else {
            console.log(fleetId + " launch success~")
            progressText = " Success"; // set text
            $("#progressSpan").append(progressText);
            $("#progressSpan").append('<br>');
            $("#auto_set").html('Success');
        }
    })
}

function moveImplRetry(fleetId, dst, params) {
    let fleet_ch1 = load("fleet_ch1", null)
    let fleet_ch2 = load("fleet_ch2", 1)
    if (!fleet_ch1 || !fleet_ch2) return
    console.log("id: " + fleetId + " dst: " + dst + " params: " + params)
    let url = "/fleet.aspx?fleet=" + fleetId + "&view=move_start";
    let referer = window.location.host + "/fleet.aspx?fleet=" + fleetId + "&view=move";
    postAsync(url, params.join("&"), referer, function(response) {
        var dom = parseToDOM(response)
        var error = $(dom).find("center.error").html()
        if (error) {
            console.log("errorStr:" + error)
            if (moveRetry < 2) {
                moveRetry++
                setTimeout(function() {
                    moveImplRetry(fleetId, dst, params)
                }, 500)
            } else {
                moveRetry = 0
                console.log("auto move failed")
                $("#auto_set").html('Fail');

                progressText = " Failed"; // set text
                $("#progressSpan").append(progressText);
                $("#progressSpan").append('<br>');
            }
        } else {
            moveRetry = 0
            console.log(fleetId + " launch success~")

            progressText = " Success"; // set text
            $("#progressSpan").append(progressText);
            $("#progressSpan").append('<br>');
            $("#auto_set").html('Success');
        }
    })
}


let launchTimes = 0;
let faildTimes = 0;
//let leftTime = 0;
var launchTimer = null;

function do_launch() {
    var enabled = document.getElementById('launch_auto_enable').checked;
    if (enabled) {
        launch();
    }
}

function init_launch_tick() {
    document.addEventListener('my_tick', autoLaunchTick, false, true);
    var newscript = document.createElement('script');
    newscript.textContent = 'function do_tick() {';
    newscript.textContent += 'var rick_ev = document.createEvent(\'Events\');'
    newscript.textContent += 'rick_ev.initEvent(\'my_tick\', true, false);'
    newscript.textContent += 'document.dispatchEvent(rick_ev);'
    newscript.textContent += 'setTimeout(do_tick, 1000);'
    newscript.textContent += '}';
    newscript.textContent += 'do_tick();'

    document.getElementsByTagName('head')[0].appendChild(newscript);
    var start_node = document.getElementById("start");
    if (!start_node) return;
    var start = start_node.innerHTML;
    var end_node = document.getElementById("destination")
    if (!end_node) return;
    var end = end_node.value;
    if (start == end) {
        //doc.getElementById("destination").value = '';
    }
}

function autoLaunchTick(e) {
    var doc = event.target
    try {
        check_autolaunch('tick', doc);
    } catch (err) {}
}

function jumpTick() {
    jumpleftTime--;
    if (jumpleftTime >= 0) {
        var days = parseInt(jumpleftTime / 60 / 60 / 24, 10);
        var hours = parseInt(jumpleftTime / 60 / 60 % 24, 10);
        var minutes = parseInt(jumpleftTime / 60 % 60, 10);
        var seconds = parseInt(jumpleftTime % 60, 10);
        var result = checkTime(days, "Days") + checkTime(hours, "hr ") + checkTime(minutes, "min ") + checkTime(seconds, "sec") + " Until Jump";
        $("#auto_set").html(result);
    }
}

function checkTime(i, type) {
    var result = ""
    if (i >= 10) {
        result = i + type;
    } else if (i > 0 && i < 10) {
        result = "0" + i + type;
    }
    return result;
}

function duration() {
    var distance = 0;
    var speed = 0;
    var logistics = 0;
    var duration = 0;

    distance = Number(document.getElementById("distance").innerHTML);
    speed = Number(document.getElementById("maxspeed").innerHTML);
    logistics = Number(document.getElementById("logistics").getAttribute("js_value"));
    console.log("Distance: " + distance);
    console.log("Speed: " + speed);
    console.log("Logistics: " + logistics);
    if ((distance > 0) && (speed > 0)) {
        duration = Math.ceil((distance / speed) * 3600);
        duration = Math.ceil(duration * (1 - logistics * 0.01))
    }
    console.log("Duration: " + duration);
    return duration
}

function success() {
    console.log("success: " + launchTimes++);
    launch();
}

function iMsuccess() {
    console.log("success: " + launchTimes++);
    launchImmediate();
}


function iMerror(data) {
    console.log("error:" + JSON.stringify(data));
    faildTimes++;
    if (faildTimes >= 5) {
        var dispatch = $("#dispatch").val()
        alert("Successful Launch" + launchTimes + "Shotgun, " + (dispatch - launchTimes) + "failed to launch");
        faildTimes = 0;
        launchTimes = 0;
    } else {
        launchImmediate()
    }
}

function error(data) {
    console.log("error:" + JSON.stringify(data));
    faildTimes++;
    if (faildTimes >= 5) {
        var dispatch = $("#dispatch").val()
        alert("Successful Launch" + launchTimes + "Shotgun, " + (dispatch - launchTimes) + "failed to launch");
        faildTimes = 0;
        launchTimes = 0;
    } else {
        launch()
    }
}

let dispatchOptions = {
    beforeSubmit: beforeSubmit,
    success: success,
    error: error,
    timeout: 3000,
};

let iMdispatchOptions = {
    beforeSubmit: beforeSubmit,
    success: iMsuccess,
    error: iMerror,
    timeout: 3000,
};

let normalOptions = {
    beforeSubmit: beforeSubmit,
    success: navitoFleet
}

function navitoFleet() {
    window.location.href = 'fleet.aspx'
}


function beforeSubmit(formData, jqForm, options) {
    if (wormhole) { // fixed for wormhole support RK
        console.log(formData)
        formData.splice(formData.length - 3, 2)
        console.log(formData)
    } else {
        console.log(formData)
        formData.splice(formData.length - 2, 2)
        console.log(formData)
    }
}

// this shit is messy.. fix it later. Had issue of not correctly checking for shotgun launches, it would continue to launch infinitely. 
function launch() {
    var dispatch = $("#dispatch").val()
    var enabled = document.getElementById('launch_auto_enable').checked;
    var checkbox = document.getElementById('launch_auto_enable')
    if (enabled) {
        if (dispatch > 0 && dispatch <= 20) {
            if (launchTimes < dispatch) {
                $("form#move_fleet_form").ajaxSubmit(dispatchOptions)
            } else {
                console.log("finished");
                faildTimes = 0;
                var time1 = document.getElementById('launch_auto_time1');
                time1.value = 'Successful launch';
                checkbox.checked = false;
                launchTimes = 0;
                navitoFleet();
            }
        } else {
            $("form#move_fleet_form").ajaxSubmit(normalOptions);
        }
    }
}

function launchImmediate() {
    var dispatch = $("#dispatch").val()
    if (dispatch > 0 && dispatch <= 20) {
        if (launchTimes < dispatch) {
            $("form#move_fleet_form").ajaxSubmit(iMdispatchOptions)
        } else {
            console.log("finished");
            faildTimes = 0;
            launchTimes = 0;
            var time1 = document.getElementById('launch_auto_time1');
            time1.value = 'Successful launch';
            navitoFleet();
        }
    } else {
        $("form#move_fleet_form").ajaxSubmit(normalOptions);
    }
}