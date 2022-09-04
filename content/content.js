const ALARM_EVENT_ADDITIONAL_PERSONAL_PLAYER_STATS = "alarm-eventAdditionalPersonalPlayerStats"

// urls
const RANKING_TABLE_BADMINTON_PRAGUE_CURRENT_MONTH = "https://www.vaseliga.cz/zebricek/badminton/praha"

// load players rating only once
var load_rating_for_all_players_participating_to_event = false


function loadPragueCurrentMonthRankingTableDOM(callback) {
    fetch(RANKING_TABLE_BADMINTON_PRAGUE_CURRENT_MONTH, {
        method: 'get',
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(function (response) {
        if(response.status == 200) {
            response.text().then(function(html) {
                var parser = new DOMParser()
                var document = parser.parseFromString(html,"text/html")
                callback(document)
            })
        }
    })
}


function loadPlayerRankingFromRankingTableDOM(playerName, rankingTableDOM, callback) {
    const playerRowQuery = rankingTableDOM.evaluate("//div[@id='snippet--roundRankings']//span[contains(., '" + playerName + "')]", rankingTableDOM, null, XPathResult.ANY_TYPE, null).iterateNext();
    var playerRanking = null
    if (playerRowQuery) {
        playerRanking = playerRowQuery.parentNode.parentNode.parentNode.previousSibling.previousSibling.innerText
    }
    callback(playerRanking)
}


function loadRatingForAllPlayersParticipatingToEvent() {
    const playerElements = document.querySelectorAll("div[id='snippet--eventTabs'] a[href*='hrac/']")

    playerElements.forEach((playerElement) => {
        load_rating_for_all_players_participating_to_event = true

        loadPragueCurrentMonthRankingTableDOM((rankingTableDOM) => {

            const playerName = playerElement.innerText
            loadPlayerRankingFromRankingTableDOM(playerName, rankingTableDOM, (playerRanking) => {
                if (playerRanking) {
                    playerElement.firstChild.textContent = playerName + " (" + playerRanking + ")"
                }
            })
        })
    })
}


chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.text == ALARM_EVENT_ADDITIONAL_PERSONAL_PLAYER_STATS) {
        if (!load_rating_for_all_players_participating_to_event) {
            loadRatingForAllPlayersParticipatingToEvent()
        }
    }
});