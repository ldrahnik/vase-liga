importScripts("../libs/regression.min.js")

// messages 
const ALARM_EVENT_ADDITIONAL_PERSONAL_PLAYER_STATS = "alarm-event-additional-personal-player-stats"
const ESTIMATE_ROUND_RANKING = "estimate-round-ranking"

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
            if(tab) {
                chrome.tabs.sendMessage(tab.id,
                    {
                        text: ALARM_EVENT_ADDITIONAL_PERSONAL_PLAYER_STATS
                    }
                );
            }
        });
    }
});


chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.text === ESTIMATE_ROUND_RANKING) {

        var results = []
        const playersWithRatingOnly = msg.data.filter((player) => {
            return player[1] != -1
        })

        var polynom = regression.polynomial(playersWithRatingOnly, { order: 3 });

        for(let index = 0; index < msg.data.length; index++) {

            var player = msg.data[index]
            const playerEventRanking = player[0]
            const playerGroundRanking = player[1]

            if (playerGroundRanking == -1) {
                const predictionPoint = polynom.predict(playerEventRanking)
                results[index] = parseInt(predictionPoint[1])
            } else {
                results[index] = -1
            }

            if(index + 1 == msg.data.length) {
                sendResponse(results)
            }
        }
    }
    return true
})
