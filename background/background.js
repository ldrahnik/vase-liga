const ALARM_EVENT_ADDITIONAL_PERSONAL_PLAYER_STATS = "alarm-eventAdditionalPersonalPlayerStats"

chrome.alarms.create(ALARM_EVENT_ADDITIONAL_PERSONAL_PLAYER_STATS, {
    delayInMinutes: 0.05,
    periodInMinutes: 0.05
});


function getSelectedTab(callback) {
    if(typeof browser === 'undefined') {
        chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
            callback(tabs[0]);
        });
    } else {
        browser.tabs.query({active: true, lastFocusedWindow: true}).then(function (tabs) {
            callback(tabs[0]);
        });
    }
}


chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === ALARM_EVENT_ADDITIONAL_PERSONAL_PLAYER_STATS) {
        getSelectedTab(function(tab) {
            chrome.tabs.sendMessage(tab.id,
                {
                    text: ALARM_EVENT_ADDITIONAL_PERSONAL_PLAYER_STATS
                }
            );
        });
    }
});