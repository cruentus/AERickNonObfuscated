var accountID = load("accID", "");

function init() {
    var accountTab = $("#account_tab");
    var accountID = load("accID", "");
    if (accountID == "") {
        accountTab.append("Log into AE and refresh this page!");
    } else {
        accountTab.append(accountID);
        var FLEETS = [
            "Corvette",
            "Recycler",
            "Destroyer",
            "Frigate",
            "Ion Frigate",
            "Scout Ship",
            "Outpost Ship",
            "Cruiser",
            "Carrier",
            "Heavy Cruiser",
            "Battleship",
            "Fleet Carrier",
            "Dreadnought",
            "Titan",
            "Leviathan",
            "Death Star"
        ];
        var fleetTabValues = [];
        var checkedFleets = load("checkedFleets" + accountID, "");
        if (checkedFleets.trim() != "") {
            try {
                fleetTabValues = checkedFleets.split(",");
            } catch (error) {
                fleetTabValues = [];
            }
        }
        var fleetTab = $("#fleet_tab");
        if (fleetTabValues) {
            for (var i = 0; i < fleetTabValues.length; i++) {
                var value = fleetTabValues[i];
                for (var j = 0; j < FLEETS.length; j++) {
                    if (FLEETS[j] == value) {
                        FLEETS.splice(j, 1);
                        fleetTab.append('<input type="checkbox" checked=true value="' + value + '" />' + value + " ");
                        break;
                    }
                }
            }
        }
        for (var i = 0; i < FLEETS.length; i++) {
            var value = FLEETS[i];
            fleetTab.append('<input type="checkbox" value="' + value + '" />' + value + " ");
        }
        var hangar = load("hangar" + accountID, false) === 'true';
        document.getElementById("hangar").checked = hangar;
        var leave = load("leave" + accountID, false) === 'true';
        document.getElementById("leave").checked = leave;
        var airline = load("airline" + accountID, null);
        if (airline) {
            var als = JSON.parse(airline);
            for (var i = 0; i < als.length; i++) {
                addline(als[i].fleet, als[i].to);
            }
        }

        $("#save").click(function() {
            saveData();
        });
        $("#add").click(function() {
            add();
        });
    }
}

function add() {
    addline($("#fleet").val(), $("#target").val());
    $("#fleet").val("");
    //$("#target").val("")
}

function addline(fleet, target) {
    //var newline = "<tr><td>" + fleet + "</td><td>" + target + '</td><td><button id=' + fleet + '>Delete</button></td></tr>'
    var newline = '<tr><td><input type="text" value=' + fleet + ' style="display:none;" id="' + fleet + 'input" /><div id ="' + fleet + 'label" >' + fleet + '</div></td><td><input type="text" style="display:none;" value=' + target + ' id="' + fleet + 'target" /><div id="' + fleet + 'targetlbl" >' + target + '</div></td><td><button id="' + fleet + 'del" >Delete</button></td><td><button id="' + fleet + 'edit" >Edit</button></td></tr>';
    $("#gather_tab tbody").append(newline);
    $('#' + fleet + 'del').click(function() {
        $('#' + fleet + 'del').parent().parent().remove();
    });
    $("#" + fleet + "edit").click(function() {
        var editVar = $("#" + fleet + "edit").text();
        if (editVar == "Edit") {
            $("#" + fleet + "edit").text('Done');
            $("#" + fleet + "input").show();
            $("#" + fleet + "label").hide();
            $("#" + fleet + "target").show();
            $("#" + fleet + "targetlbl").hide();
        } else {
            var newFleet = $("#" + fleet + "input").val();
            var newDest = $("#" + fleet + "target").val();
            $("#" + fleet + "label").text(newFleet);
            $("#" + fleet + "targetlbl").text(newDest);
            $("#" + fleet + "edit").text('Edit');
            $("#" + fleet + "input").hide();
            $("#" + fleet + "label").show();
            $("#" + fleet + "target").hide();
            $("#" + fleet + "targetlbl").show();
            saveData();
        }
    });
}

function saveData() {
    var rows = document.getElementById("gather_tab_body").children;
    var airline = [];
    for (var i = 0; i < rows.length; i++) {
        airline.push({
            fleet: stripNewline(rows[i].cells[0].innerText),
            to: stripNewline(rows[i].cells[1].innerText)
        });
    }

    if (airline.length > 0) {
        chrome.runtime.sendMessage({
            key: "airline" + accountID,
            value: airline
        });
    } else {
        chrome.runtime.sendMessage({
            key: "airline" + accountID,
            value: "remove"
        });
    }
    var hangar = document.getElementById("hangar").checked;
    chrome.runtime.sendMessage({
        key: "hangar" + accountID,
        value: hangar
    });
    var leave = document.getElementById("leave").checked;
    chrome.runtime.sendMessage({
        key: "leave" + accountID,
        value: leave
    });
    var checkedFleets = [];
    var ft = document.getElementById("fleet_tab").children;
    for (var i = 0; i < ft.length; i++) {
        if (ft[i].checked) {
            checkedFleets.push(ft[i].value);
        }
    }
    if (checkedFleets.length > 0) {
        chrome.runtime.sendMessage({
            key: "checkedFleets" + accountID,
            value: checkedFleets.join(",")
        });
    } else {
        chrome.runtime.sendMessage({
            key: "checkedFleets" + accountID,
            value: "remove"
        });
    }
}

init();