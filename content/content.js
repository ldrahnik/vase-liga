const ALARM_EVENT_ADDITIONAL_PERSONAL_PLAYER_STATS = "alarm-eventAdditionalPersonalPlayerStats"

// urls
const RANKING_TABLE_BADMINTON_PRAGUE = "https://www.vaseliga.cz/zebricek/badminton/praha"
const RANKING_TABLE_BADMINTON_PRAGUE_CURRENT_MONTH = RANKING_TABLE_BADMINTON_PRAGUE

// load players rating only once
var load_rating_for_all_players_participating_to_event = false


const INTERMEDIATE = 'Středně pokročilí'
const BEGINERS = 'Začátečníci'
const ADVANCED = 'Pokročilí'


function getAverageStatsForAllPlayersCurrentRoundText(
    averagePlayersRating, 
    averagePlayerPercentil,
    countPlayersWithRating,
    countPlayers
) {
    return "Pro " + countPlayersWithRating + " hráčů, kteří hrají aktuální kolo je průměrné místo v žebříčku: " + averagePlayersRating + " a průměrný percentil: " + averagePlayerPercentil + ".<br> * celkově v aktuálním kole hraje " + countPlayers + " hráčů"
}


function getAverageStatsForAllPlayersPreviousRoundText(
    averagePlayersRating, 
    averagePlayerPercentil,
    countPlayersWithRating,
    countPlayers
) {
    return "<br><br>Pro " + countPlayersWithRating + " hráčů, kteří hráli minulé kolo bylo průměrné místo v žebříčku: " + averagePlayersRating + " a průměrný percentil: " + averagePlayerPercentil + ".<br> * celkově v minulém kole hrálo " + countPlayers + " hráčů"
}


displayAdditionalStatsForPlayersParticipatingToEvent(RANKING_TABLE_BADMINTON_PRAGUE_CURRENT_MONTH, getAverageStatsForAllPlayersCurrentRoundText, BEGINERS, () => {
    loadPreviousRankingTableUrl((previous_month_ranking_table_url) => {
        displayAdditionalStatsForPlayersParticipatingToEvent(previous_month_ranking_table_url, getAverageStatsForAllPlayersPreviousRoundText, BEGINERS)
    })
})
displayAdditionalStatsForPlayersParticipatingToEvent(RANKING_TABLE_BADMINTON_PRAGUE_CURRENT_MONTH, getAverageStatsForAllPlayersCurrentRoundText, ADVANCED, () => {
    loadPreviousRankingTableUrl((previous_month_ranking_table_url) => {
        displayAdditionalStatsForPlayersParticipatingToEvent(previous_month_ranking_table_url, getAverageStatsForAllPlayersPreviousRoundText, ADVANCED)
    })
})
displayAdditionalStatsForPlayersParticipatingToEvent(RANKING_TABLE_BADMINTON_PRAGUE_CURRENT_MONTH, getAverageStatsForAllPlayersCurrentRoundText, INTERMEDIATE, () => {
    loadPreviousRankingTableUrl((previous_month_ranking_table_url) => {
        displayAdditionalStatsForPlayersParticipatingToEvent(previous_month_ranking_table_url, getAverageStatsForAllPlayersPreviousRoundText, INTERMEDIATE)
    })
})


function getAdditionalStatsElement(query, skillCategoryName) {

    const noSpecialCharactersSkillCategoryName = skillCategoryName.replace(/[^a-zA-Z0-9 ]/g, '').toLowerCase()
    const id = "additional-stats-" + noSpecialCharactersSkillCategoryName

    var additionalStats = document.getElementById(id) 
    if(!additionalStats) {
        additionalStats = document.createElement("div")
        additionalStats.setAttribute("id", id)
        additionalStats.setAttribute("class", "c_table__tr__td c_table__tr__td--nowrap")

        query.parentElement.insertBefore(additionalStats, query.parentElement.lastChild.nextSibling);
    }
    return additionalStats
}


function displayAdditionalStatsForPlayersParticipatingToEvent(rankingTableUrl, additionalTextCallback, skillCategoryName, callback) {

    const query = document.evaluate("//div[@id='actions-table']/*/div[contains(., '" + skillCategoryName + "')]", document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null).iterateNext();
    var additionalStats = getAdditionalStatsElement(query, skillCategoryName)

    if (query) {
        const strednePokrociliParticipantsUrl = query.parentElement.childNodes[9].childNodes[1].href;
        loadFromUrlAjaxPayload(strednePokrociliParticipantsUrl, (payload) => {

            if(payload) {
                const snippetHTML = payload.snippets["snippet--eventTabs"]
                var parser = new DOMParser()
                var responseDOM = parser.parseFromString(snippetHTML,"text/html")
                var skillCategoryHeadingElement = responseDOM.evaluate("//h3[contains(., '" + skillCategoryName + "')]", responseDOM, null, XPathResult.ANY_TYPE, null).iterateNext();

                if(skillCategoryHeadingElement) {
                    responseDOM = skillCategoryHeadingElement.nextSibling.nextSibling

                    loadFromUrlDOM(rankingTableUrl, function(rankingTableDOM) {
                        calculateAdditionalStatsForAllPlayersParticipatingToEvent(responseDOM, rankingTableDOM, function(averagePlayersRating, averagePlayerPercentil, countPlayersWithRating, totalPlayers) {
                            additionalStats.innerHTML += additionalTextCallback(averagePlayersRating, averagePlayerPercentil, countPlayersWithRating, totalPlayers)                            

                            if (typeof callback == 'function') {
                                callback()
                            }
                        })
                    })
                }
            }
        })
    }
}


function loadFromUrlAjaxPayload(url, callback) {
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
    .catch(() => {
        callback(null)
    })
}


async function loadCountPlayersFromRankingTableDOM(rankingTableDOM) {
    return new Promise(resolve => {
        const countPlayersElement = rankingTableDOM.querySelector(".fn_sortable_round")
        const countPlayers = countPlayersElement.tBodies[0].rows.length

        resolve(countPlayers)
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


async function loadRankingForPlayerParticipatingToEvent(playerElement, rankingTableDOM) {
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


async function calculateAdditionalStatsForAllPlayersParticipatingToEvent(document, rankingTableDOM, callback) {
    const playerElements = document.querySelectorAll("a[href*='hrac/']")

    if (!playerElements.length) {
        return
    }

    var totalPercentil = 0
    var totalRanking = 0
    var countPlayers = await loadCountPlayersFromRankingTableDOM(rankingTableDOM)
    var countPlayersWithRating = 0

    for(let index = 0; index < playerElements.length; index++) {
        var playerRanking = await loadRankingForPlayerParticipatingToEvent(playerElements[index], rankingTableDOM)

        if(playerRanking) {
            countPlayersWithRating += 1
            totalRanking += playerRanking
            // TODO: percentil
            totalPercentil += ((countPlayers - playerRanking) / countPlayers) * 100
        }
    }
    
    const averagePlayerRanking = totalRanking / countPlayersWithRating
    const averagePlayerPercentil = totalPercentil / countPlayersWithRating

    callback(parseInt(averagePlayerRanking), parseInt(averagePlayerPercentil), countPlayersWithRating, countPlayers)
}


function displayRatingForAllPlayersParticipatingToEvent(rankingTableUrl, document, additionalTextCallback, callback) {

    const playerElements = document.querySelectorAll("div[id='snippet--eventTabs'] a[href*='hrac/']")

    if(!playerElements.length) {
        return null
    }

    loadFromUrlDOM(rankingTableUrl, function(rankingTableDOM) {
        if(rankingTableDOM) {
            for(let index = 0; index < playerElements.length; index++) {
                var playerElement = playerElements[index]
                displayRatingForPlayerParticipatingToEvent(
                    playerElement, 
                    rankingTableDOM,
                    additionalTextCallback
                )
                if(index + 1 == playerElements.length) {
                    callback(true)
                }
            }
        } else {
            callback(false)
        }
    })
}


function displayRatingForPlayerParticipatingToEvent(playerElement, rankingTableDOM, additionalTextCallback) {

    var playerNameElement = playerElement.childNodes[0]
    const playerName = playerNameElement.innerText

    loadPlayerRankingFromRankingTableDOM(playerName, rankingTableDOM, (playerRanking) => {
        if (playerRanking) {
            playerElement.innerHTML += additionalTextCallback(playerRanking)
        }
    })
}


function loadDOM(url, callback) {
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


function loadPreviousRankingTableUrl(callback) {
    loadDOM(RANKING_TABLE_BADMINTON_PRAGUE, function(document) {
        var previousRoundElement = document.getElementById("fn_round-select").childNodes[3]
        var previousRoundId = previousRoundElement.value

        var url = "https://www.vaseliga.cz/zebricek/badminton/praha?jsRoundId=" + previousRoundId + "&do=loadRank"
        callback(url)
    })
}


chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.text === ALARM_EVENT_ADDITIONAL_PERSONAL_PLAYER_STATS) {
        if (!load_rating_for_all_players_participating_to_event) {
            displayRatingForAllPlayersParticipatingToEvent(
                RANKING_TABLE_BADMINTON_PRAGUE_CURRENT_MONTH,
                document,
                (playerRanking) => { 
                    return ", " + playerRanking + ". v žebříčku aktuálního kola"
                },
                (result) => {
                    if (result) {
                        load_rating_for_all_players_participating_to_event = true
                    }
                    loadPreviousRankingTableUrl((previous_month_ranking_table_url) => {
                        displayRatingForAllPlayersParticipatingToEvent(
                            previous_month_ranking_table_url, 
                            document, 
                            (playerRanking) => { 
                                return ", " + playerRanking + ". v žebříčku předešlého kola"
                            },
                            () => {
                                // sendResponse(true)
                            }
                        )
                    })
                }
            )
        }
    }
})