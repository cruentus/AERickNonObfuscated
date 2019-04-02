//replace referer

function replaceReferer(request) {
  // Find current referer header in request
  var referer, replace_referer;
  var headers = [];
  for (var i = 0; i < request.requestHeaders.length; ++i) {
    var header = request.requestHeaders[i];
    if (header.name.toLowerCase() === "referer") {
      referer = header;
      headers.push(referer);
    } else if (header.name.toLowerCase() === "replace_referer") {
      replace_referer = header;
    } else {
      headers.push(header);
    }
  }
  if (headers.length == 0 || !referer) {
    return;
  }
  if (replace_referer) {
    referer.value = replace_referer.value;
  }
  return {
    requestHeaders: headers
  };
}

/*****************
 * Orchestration *
 *****************/
function save(key, data) {
  if (typeof(data) === "object") {
    localStorage.setItem(key, JSON.stringify(data))
  } else {
    localStorage.setItem(key, data)
  }
}

function load(key, def) {
  var data = localStorage.getItem(key);
  return data ? data : def
}

/**
 * Start or stop the HTTP header and JavaScript modifications
 */
function start() {
  chrome.webRequest.onBeforeSendHeaders.addListener(
    replaceReferer, {
      urls: ["<all_urls>"]
    }, ["blocking", "requestHeaders"]
  );

  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    var accountID = load("accID", "")
    var key = message.key
    var value = message.value
    if (key == "license") {
      let domain = value;
      checkLicense2(accountID, domain);
      var licData = load("licdata");
      var licArray = []
      if (licData) {
        console.log('licData: ' + licData);
        licArray = JSON.parse(licData);
      }
      console.log(licArray);
      sendResponse({
        licArray: licArray
      })
      console.log('sending response');
    }
    
    if (key == "load") {
      var checkedFleets = load("checkedFleets" + accountID, "")
      var al = load("airline" + accountID, null)
      var airline = []
      if (al) {
        airline = JSON.parse(al);
      }
      var hangar = load("hangar" + accountID, false)
      var leave = load("leave" + accountID, false)
      sendResponse({
        checkedFleets: checkedFleets,
        airline: airline,
        hangar: hangar,
        leave: leave
      })
    } else {
      if (value == "remove") {
        remove(key)
      } else {
        save(key, value)
      }
    }
  });
}

function checkLicense2() {
  $.get("http://142.93.93.183/license/aelist.txt", function(data) {
    save("licdata", data);
  })
}

start();



// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Global variables only exist for the life of the page, so they get reset
// each time the page is unloaded.
// var counter = 1;

// var lastTabId = -1;
// function sendMessage() {
//   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     lastTabId = tabs[0].id;
//     chrome.tabs.sendMessage(lastTabId, "Background page started.");
//   });
// }

// sendMessage();
// chrome.browserAction.setBadgeText({text: "ON"});

// chrome.runtime.onInstalled.addListener(function() {
// console.log("Installed.");

// localStorage is persisted, so it's a good place to keep state that you
// need to persist across page reloads.
// localStorage.counter = 1;

// Register a webRequest rule to redirect bing to google.
// var wr = chrome.declarativeWebRequest;
//   chrome.declarativeWebRequest.onRequest.addRules([{
//     id: "0",
//     conditions: [new wr.RequestMatcher({url: {hostSuffix: "bing.com"}})],
//     actions: [new wr.RedirectRequest({redirectUrl: "http://google.com"})]
//   }]);
// });

// chrome.bookmarks.onRemoved.addListener(function(id, info) {
//   alert("I never liked that site anyway.");
// });

// chrome.browserAction.onClicked.addListener(function() {
//   // The event page will unload after handling this event (assuming nothing
//   // else is keeping it awake). The content script will become the main way to
//   // interact with us.
//   chrome.tabs.create({url: "http://google.com"}, function(tab) {
//     chrome.tabs.executeScript(tab.id, {file: "content.js"}, function() {
//       // Note: we also sent a message above, upon loading the event page,
//       // but the content script will not be loaded at that point, so we send
//       // another here.
//       sendMessage();
//     });
//   });
// });

// chrome.commands.onCommand.addListener(function(command) {
//   chrome.tabs.create({url: "http://www.google.com/"});
// });

// chrome.runtime.onMessage.addListener(function(msg, _, sendResponse) {
//   if (msg.setAlarm) {
//     // For testing only.  delayInMinutes will be rounded up to at least 1 in a
//     // packed or released extension.
//     chrome.alarms.create({delayInMinutes: 0.1});
//   } else if (msg.delayedResponse) {
//     // Note: setTimeout itself does NOT keep the page awake. We return true
//     // from the onMessage event handler, which keeps the message channel open -
//     // in turn keeping the event page awake - until we call sendResponse.
//     setTimeout(function() {
//       sendResponse("Got your message.");
//     }, 5000);
//     return true;
//   } else if (msg.getCounters) {
//     sendResponse({counter: counter++,
//                   persistentCounter: localStorage.counter++});
//   }
//   // If we don't return anything, the message channel will close, regardless
//   // of whether we called sendResponse.
// });

// chrome.alarms.onAlarm.addListener(function() {
//   alert("Time's up!");
// });

// chrome.runtime.onSuspend.addListener(function() {
//   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     // After the unload event listener runs, the page will unload, so any
//     // asynchronous callbacks will not fire.
//     alert("This does not show up.");
//   });
//   console.log("Unloading.");
//   chrome.browserAction.setBadgeText({text: ""});
//   chrome.tabs.sendMessage(lastTabId, "Background page unloaded.");
// });