// ==UserScript==
// @name         AE construct
// @namespace    http://tampermonkey.net/
// @description   ~who use who know~
// @version      2.1.4
// @description  try to take over the world!
// @author       DS
// @match        http://*.astroempires.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var href = window.location.href;
    var domain = href.substring(0,href.search('com')+4);
    var detailHtmlInfo = "";

    //Anti-Detection
    //http://cdn.astroempires.com/javascript/js_jquery_debug_v1.0.js
    var all_js = document.getElementsByTagName('script');
    for(var i=0; i < all_js.length; i++) {
        var src = all_js[i].getAttributeNode("src");
        if(src == null) continue;
        var value = src.value;
        //Log(value);
        if(value.search("js_jquery_debug") > 0 ){
            alert("Disabled, admins were looking.");
            return;
        }
    }

    //defence
    if(href.search("view=defenses")>-1||href.search("view=structures")>-1){

        var tab ;
        if (href.search("view=defenses")>-1){
            tab = 1;
        }else if (href.search("view=structures")>-1){
            tab = 0;
        }
        setCookie("tab",tab);

        var structuresObj = null;
        if(href.search("view=structures")>-1){
            var baseStructuresTable = document.getElementById("base_structures").getElementsByTagName('table')[0];
            var baseStructuresTrs = baseStructuresTable.getElementsByTagName('tr');
            structuresObj = getBaseStructures(baseStructuresTrs);
        }
        var baseQueueTable = document.getElementById("base-queue");
        var baseQueueForm = baseQueueTable.getElementsByTagName('form')[0];
        var baseQueueTrs = baseQueueForm.getElementsByTagName('tr');

        var params = baseQueueTable.getElementsByTagName('script')[0].innerHTML;
        var start = params.search('base.aspx');
        var end = params.search('add_stack');

        params = params.substring(start,end + 'add_stack'.length).replace('method=ajax&','');

        var canQueueInfo = getCanQueueInfo(baseQueueTrs);
        var queueInfo = getQueueInfo(baseQueueTrs);

        var defTable = document.evaluate("//table[@class='layout listing']",
                                         document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;
        var rowLength = defTable.rows.length;
        var columnLength = defTable.rows[1].cells.length;


        for (i = 0; i < rowLength; i++) {
            if (i == 0) {
                var newTd1 = defTable.rows[0].insertCell(columnLength);
                newTd1.innerHTML = "<input type='button' id='submitAll' value='All'/>  <input type='button' id='submitThis' value='This'/>";
                document.getElementById("submitAll").addEventListener("click",
                                                                      function(){
                    var units = document.getElementsByName("unitNumber");
                    for(var j=0;j<units.length;j++) {
                        //Log(units[j].id + " -- " + units[j].value);
                        setCookie(units[j].id, units[j].value ,48);
                    }
                    window.location.href = domain + "empire.aspx?manualAll=1";
                });
                document.getElementById("submitThis").addEventListener("click",
                                                                       function(){
                    var units = document.getElementsByName("unitNumber");
                    for(var j=0;j<units.length;j++) {
                        //Log(units[j].id + " -- " + units[j].value);
                        setCookie(units[j].id, units[j].value ,48);
                    }
                    if(href.search("manual") <=0 ){
                        window.location.href = href + "&manual";
                    }else{
                        window.location.href = href
                    }
                });
            }else if(i%2 == 1){
                var unitName = defTable.rows[i].cells[1].getElementsByTagName('b')[0].getElementsByTagName('a')[0].innerHTML;//childNodes[0].
                var newTd2 = defTable.rows[i].insertCell(columnLength);
                var unitNum = parseInt(getCookie(unitName, 0));
                //Log(i + " -- " + unitName);
                newTd2.innerHTML = "<input type='text' id='" + unitName + "' name='unitNumber' value='" + unitNum + "'/>";

                var nameTable = defTable.rows[i].cells[1].innerHTML;
                var pos1 = nameTable.search("\\u0028Level ");
                var structureLevel ;
                if(pos1<1) {
                    structureLevel = 0;
                } else {
                    structureLevel= nameTable.substring(pos1+7,pos1+9);
                    if(structureLevel.search("\\u0029")>0) {
                        structureLevel = structureLevel.substring(0,structureLevel.search("\\u0029"));
                    }
                }

                var structureStatusHtml = defTable.rows[i].cells[6].innerHTML;
                //Log(structureStatusHtml);
                //out popul -- out area
                var structureStatus = "free";
                if(structureStatusHtml.search("Build")>-1) {
                    structureStatus = "free";
                } else if (structureStatusHtml.search("working")>-1) {
                    structureStatus = "waiting";
                } else if(structureStatusHtml.search("req")>-1) {
                    structureStatus = "req upgrade";
                } else if(structureStatusHtml.search("out popul")>-1) {
                    structureStatus = "out popul";
                } else if(structureStatusHtml.search("out area")>-1) {
                    structureStatus = "out area";
                } else if(structureStatusHtml.search("out energy")>-1) {
                    structureStatus = "out energy";
                } else if(structureStatusHtml.search("out cred")>-1) {
                    structureStatus = "out credits";
                } else {
                    structureStatus = "building";
                    structureLevel++;
                }

                var queueLv = 0
                for(var item in queueInfo){
                    if(item == unitName){
                        queueLv = parseInt(queueInfo[item]);
                    }
                }

                structureLevel = parseInt(structureLevel) + queueLv;
                if(href.search("manual") > -1 && structureLevel < unitNum && canQueueInfo.length >0){

                    if(!isExists(canQueueInfo, unitName) && href.search("view=structures")>-1){
                        unitName = getResource(structuresObj,canQueueInfo,queueInfo);
                    }
                    Log(unitName + " build ");
                    var suffix;
                    if(href.search('manualAll') > -1){
                        suffix="&manualAll=" + getQueryString("manualAll");
                    }else{
                        suffix="&manual";
                    }
                    var myForm = document.createElement("form");
                    myForm.method="post";
                    var addUrl = params;
                    addUrl = addUrl +"&_q=" +(new Date).getTime() + suffix;
                    myForm.action = addUrl;
                    var myInput = document.createElement("input");
                    myInput.setAttribute("name", "item");
                    myInput.setAttribute("value", unitName);

                    var ran = getRandom(2,4)*1000;
                    setTimeout(function(){
                        myForm.appendChild(myInput);
                        document.body.appendChild(myForm);
                        myForm.submit();
                        document.body.removeChild(myForm);
                    },ran);

                    return;
                }
            }
        }

        if(href.search("manualAll") > 0){
            let index = parseInt(getQueryString("manualAll")) + 1;
            Log("next manual base is " + index);
            ran = getRandom(2,4)*1000;
            setTimeout(function(){
                window.location.href = domain + "empire.aspx?manualAll=" + index;
            },ran);
        }
    }

    //auto construct empire page
    if(href.search('empire.aspx')>-1) {
        var autoTable = document.getElementById("empire_events");
        var tmpUrl = domain +"empire.aspx?autostruct=1";
        var autoNode = document.createElement("td");
        var lvNode = document.createElement("td");
        //"<a href='" + tmpUrl + "' onclick='setMaxLv()'>Auto Build</a>"
        autoNode.innerHTML = "<input class='input-button' type=\"button\" id='auto_build' value='Auto'/>";
        lvNode.innerHTML = "<input type='text'  name='MAX' id='max_lv' size='2'  maxlength='2' value='20'/>"

        if(autoTable!=null){
            var autoTrs = autoTable.getElementsByTagName('tr');
            autoTrs[0].childNodes[0].appendChild(autoNode);
            autoTrs[0].childNodes[0].appendChild(lvNode);

            document.getElementById('auto_build').onclick = function(){
                //document.getElementById('auto_build').attachEvent("onclick", function(){
                var max = document.getElementById("max_lv").value;
                if(max == ""){
                    max = 20;
                }
                Log("max: " + max);
                setCookie("max",max);
                window.location.href = tmpUrl;
            };
        }

        //auto build

        if(href.search('autostruct') > -1 || href.search("manualAll") > -1){
            tab = getCookie("tab",0);
            var basesTable = document.getElementById("empire_events").getElementsByTagName('table')[0];
            var basesTrs = basesTable.getElementsByTagName('tr');
            var log = "";
            var autoherf;

            let index = parseInt(getQueryString("autostruct"));
            if(href.search("manualAll") > -1){
                index = parseInt(getQueryString("manualAll"));
            }
            for( ; index < basesTrs.length ; index++){
                Log("index:" + index);
                //if(index < basesTrs.length){
                var basesTds = basesTrs[index].getElementsByTagName('td');
                var content = basesTds[5].childNodes[0].textContent;
                var baseHerf = basesTds[5].childNodes[0].getAttribute('href');
                var offSet = content.search("\\u0028")
                var queueNum = content.substring(offSet+1,offSet+2)
                //~~~~
                if(queueNum < 5){
                    if(href.search("manualAll") > -1){
                        if(tab == 1){
                            baseHerf = baseHerf.replace('structures','defenses');
                        }
                        let ran = getRandom(2,4)*1000;
                        setTimeout(function(){
                            window.location.href = domain + baseHerf + "&manualAll=" + index ;
                        },ran);
                    }else{
                        let ran = getRandom(2,4)*1000;
                        setTimeout(function(){
                            window.location.href = domain + baseHerf + "&autostruct=" + index ;
                        },ran);
                    }
                    return;
                }
                //log = log + "queueNum: " + queueNum + " baseHerf: " + baseHerf + "\n";
            }

            // var ranTime = getRandom(10,20)*1000*60;
            // setTimeout(function(){
            //     if(href.search("manualAll") > -1){
            //         window.location.href = domain + "empire.aspx?manualAll=1";
            //     }else{
            //         window.location.href = domain + "empire.aspx?autostruct=1";
            //     }
            // },ranTime);

        }
    }

    function autoBuild(tmpUrl, max){
        if(max == null || max == ""){
            max = 20;
        }
        Log("autoBuild max: " + max);
        setCookie("max",max);
        window.location.href = tmpUrl;
    }

    //auto construct base page

    if(href.search('view=structures') > -1) {
        let autoTable = document.getElementById("base_structures");
        let autoNode = document.createElement("td");
        let tmpUrl = href.trim() + "&auto";
        autoNode.innerHTML = "<a href='" + tmpUrl + "'>Auto</a>"
        if(autoTable!=null){
            let autoTrs = autoTable.getElementsByTagName('tr');
            autoTrs[0].childNodes[0].appendChild(autoNode);
        }
        if(href.search('auto') < 0)return;

        let suffix;
        if(href.search('autostruct') > -1){
            suffix="&autostruct=" + getQueryString("autostruct");
        }else{
            delCookie("max");
            suffix="&auto";
        }

        //defined constant
        var maxStructures = {};
        maxStructures.Shipyards = 12;

        var baseTable , tempTables;
        tempTables = document.evaluate(
            "//table[@class='base_top']",
            document,
            null,
            XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
            null);
        baseTable = tempTables.snapshotItem(0);

        var baseInfo = {};

        //baseInfo = getBaseInfo(baseTable);
        //var leftEnergy = baseInfo.maxEnergy - baseInfo.currentEnergy;
        // for(aa in baseInfo) {
        // alert(baseInfo[aa]);
        // }

        let baseStructuresTable = document.getElementById("base_structures").getElementsByTagName('table')[0];
        let baseStructuresTrs = baseStructuresTable.getElementsByTagName('tr');
        let structuresObj = new Array();

        structuresObj = getBaseStructures(baseStructuresTrs);

        let baseQueueTable = document.getElementById("base-queue");
        let baseQueueForm = baseQueueTable.getElementsByTagName('form')[0];
        let baseQueueTrs = baseQueueForm.getElementsByTagName('tr');

        let params = baseQueueTable.getElementsByTagName('script')[0].innerHTML;
        let start = params.search('base.aspx');
        let end = params.search('add_stack');

        params = params.substring(start,end + 'add_stack'.length).replace('method=ajax&','');
        //var oldparams = params;
        //params = oldparams.substring(0,10)+oldparams.substring(22);
        //alert(params);

        let canQueueInfo = {};
        canQueueInfo = getCanQueueInfo(baseQueueTrs);

        var construct = null;
        if(canQueueInfo.length > 0){
            let queueInfo = {};
            queueInfo = getQueueInfo(baseQueueTrs);
            construct = calculateBuild(structuresObj, canQueueInfo, queueInfo, maxStructures);
            Log("build : " + construct);
        }

        if(construct != null){
            let myForm = document.createElement("form");
            myForm.method="post";
            //var addUrl = "base.aspx?method=ajax&zone=queue&player=278355&version=1&base=503041&view=structures&action=add_stack";
            let addUrl = params;
            addUrl = addUrl +"&_q=" +(new Date).getTime() + suffix;
            myForm.action = addUrl;
            let myInput = document.createElement("input");
            myInput.setAttribute("name", "item");
            myInput.setAttribute("value", construct);

            //~~~~~
            let ran = getRandom(2,4)*1000;
            setTimeout(function(){
                myForm.appendChild(myInput);
                document.body.appendChild(myForm);
                myForm.submit();
                document.body.removeChild(myForm);
            },ran);
        }else{
            if(href.search('autostruct') > -1){
                var index = parseInt(getQueryString("autostruct")) + 1;
                //Log("next is base " + index);
                let ran = getRandom(2,4)*1000;
                setTimeout(function(){
                    window.location.href = domain + "empire.aspx?autostruct=" + index;
                },ran)
            }else{
                //window.location.href = domain + "empire.aspx";
                // let ranTime = getRandom(10,20)*1000*60;
                // setTimeout(function(){
                //     window.location.href = href;
                //     //Log(herf);
                // },ranTime);
            }
        }

        /*if(nowArea<maxArea) {

    }*/

    }

    function xhttpRequest(ahref){
        var hr=new XMLHttpRequest();
        hr.onreadystatechange=function(){XHR_loadover(hr,ahref)};
        hr.open("GET",ahref,false);
        hr.overrideMimeType('text/html; charset=' + document.characterSet);
        hr.send(null)
    };

    function XHR_loadover(hr,ahref){
        if(hr.readyState == 4){
            var str=hr.responseText;
            //alert(str);
            detailHtmlInfo = str;

        };
    };

    function getBaseInfo(baseTable) {
        var baseTrs = baseTable.getElementsByTagName('tr');
        var baseInfoTr = baseTrs[1];
        var baseInfoTds = baseInfoTr.getElementsByTagName('td');
        var areaHtml = baseInfoTds[1].innerHTML;
        var energyHtml = baseInfoTds[2].innerHTML;
        var populationHtml = baseInfoTds[3].innerHTML;

        var temp = areaHtml.split("/");
        var currentArea = temp[0];
        var maxArea = temp[1];
        let index = maxArea.search("\\u0028");
        if(index > 0 ){
            maxArea = maxArea.substring(0,index);
        }

        temp = energyHtml.split("/");
        var currentEnergy = temp[0];
        var maxEnergy = temp[1];
        index = maxEnergy.search("\\u0028");
        if(index > 0 ){
            maxEnergy = maxEnergy.substring(0,index);
        }

        temp = populationHtml.split("/");
        var currentPopulation = temp[0];
        var maxPopulation = temp[1];
        index = maxPopulation.search("\\u0028");
        if(index > 0 ){
            maxPopulation = maxPopulation.substring(0,index);
        }

        Log("area: " + currentArea + "/" + maxArea + " energy: " + currentEnergy+"/"+maxEnergy + " population: " + currentPopulation + "/" + maxPopulation);
        //var maxInfoArray = new Array();
        var baseInfo = {};
        baseInfo.currentArea = currentArea;
        baseInfo.maxArea = maxArea;
        baseInfo.currentEnergy = currentEnergy;
        baseInfo.maxEnergy = maxEnergy;
        baseInfo.currentPopulation = currentPopulation;
        baseInfo.maxPopulation = maxPopulation;
        return baseInfo;
    }

    function getBaseStructures(baseStructuresTrs) {
        var structuresObj = new Array();
        var strucInfo = "";
        for(var i=1; i<baseStructuresTrs.length; i++) {
            if(i%2!=0) {
                var baseStructuresTds = baseStructuresTrs[i].getElementsByTagName('td');
                var baseStructureTd = baseStructuresTds[1];
                var baseStructureHtml = baseStructuresTds[1].innerHTML;
                var structureName = baseStructureTd.getElementsByTagName('b')[0].getElementsByTagName('a')[0].innerHTML;
                var urbanPopulation ;
                if(structureName=="Urban Structures") {
                    var pos = baseStructureHtml.search("bases fertility");
                    urbanPopulation = baseStructureHtml.substring(pos+17,pos+18);
                    //alert(urbanPopulation);
                }
                var pos1 = baseStructureHtml.search("\\u0028Level ");
                var structureLevel ;
                if(pos1<1) {
                    structureLevel = 0;
                } else {
                    structureLevel= baseStructureHtml.substring(pos1+7,pos1+9);
                    if(structureLevel.search("\\u0029")>0) {
                        structureLevel = structureLevel.substring(0,structureLevel.search("\\u0029"));
                    }
                }

                var production = 0;

                if(structureName=="Metal Refineries") {
                    var subStructureHtml = baseStructureTd.getElementsByTagName('div')[0].innerHTML;
                    var pos2 = subStructureHtml.search("\\u0029");
                    if(pos2 > 0){
                        production = subStructureHtml.substring(pos2-1,pos2);
                        //alert(production);
                    }
                }
                var cost = parseInt(baseStructuresTds[2].innerHTML.replace(",",""));

                var structureEnergy = baseStructuresTds[3].innerHTML;
                if(structureEnergy==null||structureEnergy=="") structureEnergy = 0;
                structureEnergy = 0 + parseInt(structureEnergy);

                var structureStatusHtml = baseStructuresTds[6].innerHTML;
                //out popul -- out area
                var structureStatus = "free";

                if(structureStatusHtml.search("Build")>-1) {
                    structureStatus = "free";
                } else if (structureStatusHtml.search("working")>-1) {
                    structureStatus = "waiting";
                } else if(structureStatusHtml.search("req")>-1) {
                    structureStatus = "req upgrade";
                } else if(structureStatusHtml.search("out popul")>-1) {
                    structureStatus = "out popul";
                } else if(structureStatusHtml.search("out area")>-1) {
                    structureStatus = "out area";
                } else if(structureStatusHtml.search("out energy")>-1) {
                    structureStatus = "out energy";
                } else if(structureStatusHtml.search("out cred")>-1) {
                    structureStatus = "out credits";
                } else {
                    structureStatus = "building";
                    structureLevel++;
                    cost = Math.ceil(cost * 1.5);
                }

                //Log(structureName+" lv: "+structureLevel + " cost: " + cost);

                var structureForm = baseStructuresTrs[i].getElementsByTagName('form')[0];
                //alert(structureForm);
                //alert(baseStructuresTrs[i].innerHTML);
                //alert(structureForm.innerHTML);

                if(structureName=="Robotic Factories"){
                    production = 2;
                }
                if(structureName=="Shipyards"){
                    production = 2;
                }
                if(structureName=="Nanite Factories"){
                    production = 4;
                }
                if(structureName=="Android Factories"){
                    production = 6;
                }
                if(structureName=="Orbital Shipyards"){
                    production = 8;
                }

                var structureInfo = {};
                structureInfo.structureName = structureName;
                structureInfo.structureLevel = structureLevel;
                structureInfo.structureEnergy = structureEnergy;
                structureInfo.cost = cost;
                structureInfo.structurePopulation = -1;
                structureInfo.structureArea = -1;
                structureInfo.structureStatus = structureStatus;
                structureInfo.structureForm = structureForm;
                structureInfo.production = production;


                if(structureName=="Urban Structures") {
                    structureInfo.structurePopulation = urbanPopulation;
                }
                if(structureName=="Terraform") {
                    structureInfo.structurePopulation = 0;
                    structureInfo.structureArea = 5;
                }
                if(structureName=="Multi-Level Platforms") {
                    structureInfo.structurePopulation = 0;
                    structureInfo.structureArea = 10;
                }
                if(structureName=="Orbital Base") {
                    structureInfo.structurePopulation = 10;
                }
                if(structureName=="Orbital Shipyards") {
                    structureInfo.structureArea = 0;
                }
                if(structureName=="Jump Gate") {
                    structureInfo.structureArea = 0;
                }

                for(var aa in structureInfo) {
                    strucInfo = strucInfo + aa + " " + structureInfo[aa] +"\n";
                }
                strucInfo = strucInfo +"\n";
                structuresObj.push(structureInfo);
            }
        }

        //alert(strucInfo); //show all the structures info
        // return {
        // structuresObj: structuresObj,
        // buildingStructure: buildingStructure
        // };
        return structuresObj;
    }

    function getQueueInfo(baseQueueTrs) {
        var queueInfo = {};
        if(baseQueueTrs.length>1) {
            for(var i=0; i<baseQueueTrs.length-1; i++) {
                var queueStructure = baseQueueTrs[i].getElementsByTagName('td')[0].innerHTML;
                if(queueInfo[queueStructure]=="undefined" || queueInfo[queueStructure]==null) {
                    queueInfo[queueStructure] = 1;
                } else {
                    queueInfo[queueStructure] ++;
                }
            }
        }

        //for(item in queueInfo){
        //   Log(item + "  " + queueInfo[item]);
        //}
        return queueInfo;
    }

    function getCanQueueInfo(baseQueueTrs) {
        var canQueueInfo = new Array();
        var optionInfos = baseQueueTrs[baseQueueTrs.length-1].getElementsByTagName('option');
        var log = "";
        for(var i=0; i<optionInfos.length; i++) {
            log = log + optionInfos[i].innerHTML+"\n";
            canQueueInfo.push(optionInfos[i].innerHTML);
        }
        //alert(log);
        return canQueueInfo;
    }

    function getResource(structuresObj, canQueueInfo, queueInfo){
        var conStruct = new Array();
        if(isExists(canQueueInfo, "Terraform")){
            conStruct.push("Terraform");
        }
        if(isExists(canQueueInfo, "Multi-Level Platforms")){
            conStruct.push("Multi-Level Platforms");
        }
        var mt = 0;

        if(conStruct.length != 0 ){
            var marginalArea = getCost(structuresObj,conStruct,5,0,0);
            mt = marginalArea.cheapestPrice;
        }
        conStruct = new Array("Urban Structures");
        if(isExists(canQueueInfo, "Orbital Base")){
            conStruct.push("Orbital Base");
        }
        var marginalPopulation = getCost(structuresObj,conStruct,4,0,mt);

        var solarEnergy,GasEnergy;
        for(var bb in structuresObj){
            if(structuresObj[bb].structureName == "Solar Plants"){
                solarEnergy = structuresObj[bb].structureEnergy;
            }else if(structuresObj[bb].structureName == "Gas Plants"){
                GasEnergy = structuresObj[bb].structureEnergy;
            }
        }
        var solarLv = getLevelFromStructuresObj(structuresObj, "Solar Plants", queueInfo) ;
        var gasLv = getLevelFromStructuresObj(structuresObj, "Gas Plants", queueInfo) ;
        conStruct = new Array();
        if(isExists(canQueueInfo, "Fusion Plants")){
            conStruct.push("Fusion Plants");
        }
        if(isExists(canQueueInfo, "Antimatter Plants")){
            conStruct.push("Antimatter Plants");
        }
        if(isExists(canQueueInfo,"Antimatter Plants") && GasEnergy <= 2 && solarEnergy <= 2){
        }else {
            if((GasEnergy <= 2 && solarEnergy <= 2 && solarLv < 3)||(solarEnergy == 3 && solarLv < 6)|| solarEnergy > 3){
                conStruct.push("Solar Plants");
            }
            if((GasEnergy <= 2 && solarEnergy <= 2 && gasLv < 3) || (GasEnergy == 3 && gasLv < 6) || GasEnergy > 3){
                conStruct.push("Gas Plants");
            }
        }
        //var mp = Math.max(500,marginalPopulation.cheapestPrice);
        var mp = marginalPopulation.cheapestPrice;
        var marginalEnergy = getCost(structuresObj,conStruct,2, mp, mt);
        var build = null;
        if(isExists(canQueueInfo, marginalEnergy.cheapest)){
            build = marginalEnergy.cheapest;
        }else if(isExists(canQueueInfo,"Urban Structures") && isExists(canQueueInfo, marginalPopulation.cheapest)){
            build = marginalPopulation.cheapest;
        }else{
            build = marginalArea.cheapest;
        }

        return build;
    }

    /*  structuresObj
    structureInfo.structureName
    structureInfo.structureLevel
    structureInfo.structureEnergy
    structureInfo.structurePopulation = -1;
    structureInfo.structureArea = -1;
    structureInfo.structureStatus
    structureInfo.structureForm

    added by Android:
    structureInfo.cost
    structureInfo.production
    ---------------------------------------------------------------------------------------------
    only few structures need to cotrol the level, such as shipyard and...eh...what else...:
    maxStructures
    maxStructures.Shipyards = 12;
    maxStructures.Metal; input by user.
*/
    function calculateBuild(structuresObj, canQueueInfo, queueInfo, maxStructures) {
        var isFree = (document.getElementById("advertising") != null);
        Log("isFree : " + isFree);
        var log = "";

        //only one available item, just build it!
        //if(canQueueInfo.length == 1){
        //  for( aa in canQueueInfo){
        //      return canQueueInfo[aa];
        //  }
        //}

        var mrLv = getLevelFromStructuresObj(structuresObj,"Metal Refineries", queueInfo);

        //looking for the best value/price ratio construct-structure
        var conStruct;
        var temp;
        //building type : 1.production 2.power 3.econ 4.population 5.area
        var type = 0;
        log = "";
        var syLv = getLevelFromStructuresObj(structuresObj,"Shipyards",queueInfo);
        var spLv = getLevelFromStructuresObj(structuresObj, "Spaceports",queueInfo) ;
        var robotLv = getLevelFromStructuresObj(structuresObj, "Robotic Factories",queueInfo) ;
        var econLv = getLevelFromStructuresObj(structuresObj, "Economic Centers",queueInfo) ;
        var NaniLv = getLevelFromStructuresObj(structuresObj, "Nanite Factories",queueInfo) ;
        var AndroidLv = getLevelFromStructuresObj(structuresObj, "Android Factories",queueInfo) ;
        var OSPLv = getLevelFromStructuresObj(structuresObj, "Orbital Shipyards",queueInfo) ;

        var maxLv = 1;
        if(mrLv >= 18){
            maxLv = 20;
        }else if(mrLv >= 15){
            maxLv = 15;
        }else if(mrLv >= 10){
            maxLv = 10;
        }else if(mrLv >= 8){
            maxLv = 5;
        }

        Log("Metal lv: " + mrLv + " spLv: " + maxLv);

        if(mrLv >=4 && spLv < maxLv && isExists(canQueueInfo, "Spaceports")) {
            return "Spaceports";
        }

        if((mrLv - robotLv) >4 && isExists(canQueueInfo, "Robotic Factories")) {
            return "Robotic Factories";
        }

        if (NaniLv > 0 && (econLv - NaniLv ) < 1 && isExists(canQueueInfo, "Economic Centers") && econLv < 12) {
            return "Economic Centers";
        }

        conStruct = new Array();
        if(isExists(canQueueInfo, "Terraform")){
            conStruct.push("Terraform");
        }
        if(isExists(canQueueInfo, "Multi-Level Platforms")){
            conStruct.push("Multi-Level Platforms");
        }
        var mt = 0;

        if(conStruct.length != 0 ){
            var marginalArea = getCost(structuresObj,conStruct,5,0,0);
            mt = marginalArea.cheapestPrice;
        }
        conStruct = new Array("Urban Structures");
        if(isExists(canQueueInfo, "Orbital Base")){
            conStruct.push("Orbital Base");
        }
        var marginalPopulation = getCost(structuresObj,conStruct,4,0,mt);

        var solarEnergy,GasEnergy;
        for(bb in structuresObj){
            if(structuresObj[bb].structureName == "Solar Plants"){
                solarEnergy = structuresObj[bb].structureEnergy;
            }else if(structuresObj[bb].structureName == "Gas Plants"){
                GasEnergy = structuresObj[bb].structureEnergy;
            }
        }
        var solarLv = getLevelFromStructuresObj(structuresObj, "Solar Plants", queueInfo) ;
        var gasLv = getLevelFromStructuresObj(structuresObj, "Gas Plants", queueInfo) ;
        conStruct = new Array();
        if(isExists(canQueueInfo, "Fusion Plants")){
            conStruct.push("Fusion Plants");
        }
        if(isExists(canQueueInfo, "Antimatter Plants")){
            conStruct.push("Antimatter Plants");
        }
        if(isExists(canQueueInfo,"Antimatter Plants") && GasEnergy <= 2 && solarEnergy <= 2){
        }else {
            if((GasEnergy <= 2 && solarEnergy <= 2 && solarLv < 3)||(solarEnergy == 3 && solarLv < 6)|| solarEnergy > 3){
                conStruct.push("Solar Plants");
            }
            if((GasEnergy <= 2 && solarEnergy <= 2 && gasLv < 3) || (GasEnergy == 3 && gasLv < 6) || GasEnergy > 3){
                conStruct.push("Gas Plants");
            }
        }
        //var mp = Math.max(500,marginalPopulation.cheapestPrice);
        var mp = marginalPopulation.cheapestPrice;
        var marginalEnergy = getCost(structuresObj,conStruct,2, mp, mt);

        conStruct = new Array("Metal Refineries","Robotic Factories");
        if(!isFree || NaniLv < 5) {
            conStruct.push("Nanite Factories");
        }

        if(!isFree || AndroidLv < 5) {
            conStruct.push("Android Factories");
        }

        if(!isFree || OSPLv < 5) {
            conStruct.push("Orbital Shipyards");
        }

        if(syLv < maxStructures.Shipyards){
            conStruct.push("Shipyards");
        }
        var marginalProduction = getCost(structuresObj,conStruct,1,mp,mt,marginalEnergy.cheapestPrice);
        var cheapestProduction = marginalProduction.cheapest;
        var needEnergy = "";
        for(var bb in structuresObj){
            if(structuresObj[bb].structureName == cheapestProduction){
                needEnergy = structuresObj[bb].structureEnergy;
            }
        }

         maxLv = parseInt(getCookie("max",100));
        //Log('Metal level ' + mrLv + " Max level " + maxLv);
        if(mrLv >= maxLv && cheapestProduction == "Metal Refineries"){
            Log('terminate building by reach the max lv');
            return null;
        }

        //Log("cheapestProduction " + cheapestProduction + " needEnergy: " + needEnergy + " finalEnergy: " + finalEnergy)
        //finalEnergy + needEnergy >= 0 &&
        if(isExists(canQueueInfo, cheapestProduction)){
            return cheapestProduction;
        }

        var build = null;
        if(isExists(canQueueInfo, marginalEnergy.cheapest)){
            build = marginalEnergy.cheapest;
        }else if(isExists(canQueueInfo,"Urban Structures") && isExists(canQueueInfo, marginalPopulation.cheapest)){
            build = marginalPopulation.cheapest;
        }else{
            build = marginalArea.cheapest;
        }


        return build;
    }

    function getCost(structuresObj, conStruct, type, MarginalPopulation, MarginalArea, MarginalEnergy) {
        var cheapest;
        var cheapestPrice = -1;
        var needEnergy = 0;
        for(var aa in conStruct){
            for(var bb in structuresObj){
                if(structuresObj[bb].structureName == conStruct[aa]){
                    var value;
                    switch(type){
                        case 1: value = structuresObj[bb].production; break;
                        case 2: value = structuresObj[bb].structureEnergy;break;
                            //case 3: break;
                        case 4: value = structuresObj[bb].structurePopulation;break;
                        case 5: value = structuresObj[bb].structureArea;break;
                    }
                    var temp = parseInt(structuresObj[bb].cost) / value;
                    var costInqueue = temp;
                    var populationPlus = 0;
                    var areaPlus = 0;
                    var energyPlus = 0;
                    if(queueInfo[conStruct[aa]] > 0){
                        for(var i=0; i < queueInfo[conStruct[aa]]; i++){
                            costInqueue = Math.ceil(costInqueue * 1.5);
                        }
                    }else{
                        costInqueue = 0;
                    }
                    if(structuresObj[bb].structurePopulation == -1){
                        populationPlus = MarginalPopulation / value;
                    }
                    if(structuresObj[bb].structureArea == -1){
                        areaPlus = MarginalArea / value;
                    }
                    if(MarginalEnergy != null && structuresObj[bb].structureEnergy < 0){
                        energyPlus = -MarginalEnergy * structuresObj[bb].structureEnergy / value;
                    }
                    //~~~~~
                    //Log(structuresObj[bb].structureName + " base: " + temp + "inqueue: " + costInqueue + " ppPlus: " + populationPlus +  " areaPlus: " + areaPlus + " energyPlus: " + energyPlus);
                    temp = temp + costInqueue + populationPlus + areaPlus;
                    //Log("total: " + temp);
                    if (cheapestPrice == -1){
                        cheapestPrice = temp;
                        cheapest = conStruct[aa];
                    }else{
                        if( temp < cheapestPrice){
                            cheapestPrice = temp;
                            cheapest = conStruct[aa];
                        }
                    }
                    break;
                }
            }
        }
        Log("type:" + type + " cheapest:" + cheapest + " cheapestPrice:" + cheapestPrice);
        return {
            cheapest: cheapest,
            cheapestPrice: cheapestPrice
        };
    }

    function isExists(canQueueInfo, structureName) {
        var ret = false;
        for(var aa in canQueueInfo) {
            if(canQueueInfo[aa] == structureName)return true;
        }
        return ret;
    }

    // function getLeftEnergy(structuresObj, queueInfo,leftEnergy){
    // var temp = 0;
    // for(var aa in queueInfo){
    // for(bb in structuresObj){
    // if(structuresObj[bb].structureName == aa){
    // temp = temp + structuresObj[bb].structureEnergy * queueInfo[aa];
    // }
    // }
    // }
    // temp = leftEnergy + temp;
    // return temp;
    // }

    function getLevelFromStructuresObj(structuresObj, structureName, queueInfo) {
        var v1 = 0;
        var v2 = 0;
        for(var aa in structuresObj) {
            if(structuresObj[aa].structureName == structureName){
                v1 = structuresObj[aa].structureLevel;
                break;
                //return structuresObj[aa].structureLevel;
            }
        }
        for(var bb in queueInfo){
            //alert(bb + "  " +queueInfo[bb]);
            if(bb == structureName){
                v2 = queueInfo[bb];
            }
        }
        var ret = parseInt(v1) + parseInt(v2);
        //alert(structureName + "  " + v1+ "  " +v2 + "  " + ret);
        return ret;
    }

    function getFormFromStructuresObj(structuresObj, structureName) {
        alert(structureName);
        var ret = 0;
        for(var aa in structuresObj) {
            if(structuresObj[aa].structureName == structureName) {
                alert(structuresObj[aa].structureName);
                alert(structuresObj[aa].structureForm.innerHTML);
                return structuresObj[aa].structureForm;
            }
        }
        return ret;
    }

    function getRandom(Min,Max)
    {
        var Range = Max - Min;
        var Rand = Math.random();
        return(Min + Math.round(Rand * Range));
    }

    function Log(l){
        console.log(l);
    }

    function setCookie(objName,objValue){
        localStorage.setItem(objName, objValue);
        // var str = objName + "=" + escape(objValue);
        // if(objHours > 0){
        //     var date = new Date();
        //     var ms = objHours*3600*1000;
        //     date.setTime(date.getTime() + ms);
        //     str += "; expires=" + date.toGMTString();
        // }
        // document.cookie = str;
    }

    function getCookie(objName, def){
        // var arrStr = document.cookie.split("; ");
        // for(var i = 0;i < arrStr.length;i ++){
        //     var temp = arrStr[i].split("=");
        //     if(temp[0] == objName) return unescape(temp[1]);
        // }
        // return def;
        return localStorage.getItem(objName)?localStorage.getItem(objName):def
    }

    function delCookie(name){
        // var date = new Date();
        // date.setTime(date.getTime() - 10000);
        // document.cookie = name + "=a; expires=" + date.toGMTString();
        localStorage.removeItem(name)
    }

    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }
    // Your code here...
})();