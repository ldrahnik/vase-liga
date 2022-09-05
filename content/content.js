const ALARM_EVENT_ADDITIONAL_PERSONAL_PLAYER_STATS = "alarm-eventAdditionalPersonalPlayerStats"

// urls
const RANKING_TABLE_BADMINTON_PRAGUE_CURRENT_MONTH = "https://www.vaseliga.cz/zebricek/badminton/praha"

// load players rating only once
var load_rating_for_all_players_participating_to_event = false


const INTERMEDIATE = 'Středně pokročilí'
const BEGINERS = 'Začátečníci'
const ADVANCED = 'Pokročilí'

displayAveragePlayersRatingParticipatingToEvent(BEGINERS)
displayAveragePlayersRatingParticipatingToEvent(ADVANCED)
displayAveragePlayersRatingParticipatingToEvent(INTERMEDIATE)

function displayAveragePlayersRatingParticipatingToEvent(skillCategoryName) {

    const query = document.evaluate("//div[@id='actions-table']/*/div[contains(., '" + skillCategoryName + "')]", document, null, XPathResult.ANY_TYPE, null).iterateNext();
    if (query) {
        const strednePokrociliParticipantsUrl = query.parentElement.childNodes[9].childNodes[1].href;
        loadFromUrlAjaxDOM(strednePokrociliParticipantsUrl, (payload) => {

            if(payload) {
                const snippetHTML = payload.snippets["snippet--eventTabs"]
                var parser = new DOMParser()
                var responseDOM = parser.parseFromString(snippetHTML,"text/html")
                var skillCategoryHeadingElement = responseDOM.evaluate("//h3[contains(., '" + skillCategoryName + "')]", responseDOM, null, XPathResult.ANY_TYPE, null).iterateNext();

                if(skillCategoryHeadingElement) {
                    responseDOM = skillCategoryHeadingElement.nextSibling.nextSibling

                    loadPragueCurrentMonthRankingTableDOM((rankingTableDOM) => {
                        calculateRatingForAllPlayersParticipatingToEvent(responseDOM, rankingTableDOM, function(averagePlayersRating, countPlayersWithRatingInCurrentMonth) {

                            var averagePlayerRanking = document.createElement("div")
                            averagePlayerRanking.setAttribute("class", "c_table__tr__td c_table__tr__td--nowrap")
                            averagePlayerRanking.innerHTML = "Průměrné pořadí v žebříčku: " + averagePlayersRating + "<br>(spočítáno pouze z " + countPlayersWithRatingInCurrentMonth + " hráčů hrající aktuální měsíc ligu)"

                            query.parentElement.insertBefore(averagePlayerRanking, query.parentElement.lastChild.nextSibling);
                        })
                    })
                }
            }
        })
    }
}


function loadFromUrlAjaxDOM(url, callback) {
    $.ajax({
        type: "POST",
        url: url,
        success: function(payload) {
            callback(payload)
        },
        error: function() {
            callback(null)
        }
    });
}


function loadFromUrlDOM(url, callback) {
    fetch(url, {
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

async function loadRatingForPlayerParticipatingToEvent(playerElement, rankingTableDOM) {
    return new Promise(resolve => {
        const playerName = playerElement.innerText
        loadPlayerRankingFromRankingTableDOM(playerName, rankingTableDOM, (playerRanking) => {
            if (playerRanking) {
                resolve(parseInt(playerRanking))
            } else {
                resolve(0)
            }
        })
    })
}

async function calculateRatingForAllPlayersParticipatingToEvent(document, rankingTableDOM, callback) {
    const playerElements = document.querySelectorAll("a[href*='hrac/']")

    var totalRating = 0
    var countPlayersWithRating = 0

    for(let index = 0; index < playerElements.length; index++) {
        var playerRating = await loadRatingForPlayerParticipatingToEvent(playerElements[index], rankingTableDOM)
        if(playerRating) {
            countPlayersWithRating += 1
            totalRating += playerRating
        }
    }
    
    const averagePlayerRating = totalRating / countPlayersWithRating

    callback(parseInt(averagePlayerRating), countPlayersWithRating)
}


function displayRatingForAllPlayersParticipatingToEvent(document) {

    if (!load_rating_for_all_players_participating_to_event) {

        const playerElements = document.querySelectorAll("div[id='snippet--eventTabs'] a[href*='hrac/']")

        if(playerElements.length) {
            load_rating_for_all_players_participating_to_event = true
        }

        loadPragueCurrentMonthRankingTableDOM((rankingTableDOM) => {
            playerElements.forEach((playerElement) => {
                displayRatingForPlayerParticipatingToEvent(playerElement, rankingTableDOM)
            })
        })
    }
}

function displayRatingForPlayerParticipatingToEvent(playerElement, rankingTableDOM) {

    const playerName = playerElement.innerText
    loadPlayerRankingFromRankingTableDOM(playerName, rankingTableDOM, (playerRanking) => {
        if (playerRanking) {
            playerElement.firstChild.textContent = playerName + " (" + playerRanking + ")"
        }
    })
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.text == ALARM_EVENT_ADDITIONAL_PERSONAL_PLAYER_STATS) {
        displayRatingForAllPlayersParticipatingToEvent(document)
    }
});