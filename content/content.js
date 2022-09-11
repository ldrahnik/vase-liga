// messages 
const ALARM_EVENT_ADDITIONAL_PERSONAL_PLAYER_STATS = "alarm-event-additional-personal-player-stats"
const ESTIMATE_ROUND_RANKING = "estimate-round-ranking"

// urls
const RANKING_TABLE_BADMINTON_PRAGUE = "https://www.vaseliga.cz/zebricek/badminton/praha"
const RANKING_TABLE_BADMINTON_PRAGUE_CURRENT_MONTH = RANKING_TABLE_BADMINTON_PRAGUE
const PREVIOUS_EVENTS_PRAGUE = "https://www.vaseliga.cz/akce/badminton/praha?categoryUrl=tournament&interestEvents=0&filter=all"

const INTERMEDIATE = 'Středně pokročilí'
const BEGINERS = 'Začátečníci'
const ADVANCED = 'Pokročilí'
const SKILL_CATEGORY_NAMES = [BEGINERS, INTERMEDIATE, ADVANCED]


function getStatsForPlayerEstimatedFromThisEventText(playerRankingEstimated) {
    return ", " + playerRankingEstimated + ". v žebříčku podle účasti na tomto eventu"
}


function getStatsForPlayerEstimatedFromPreviousEventText(playerRankingEstimated) {
    return ", " + playerRankingEstimated + ". v žebříčku podle účasti na posledním eventu"
}


function getStatsForPlayerEstimatedFromPreviousPreviousEventText(playerRankingEstimated) {
    return ", " + playerRankingEstimated + ". v žebříčku podle účasti na předposledním eventu"
}


function getStatsForPlayerCurrentRoundText(playerRanking) {
    return ", " + playerRanking + ". v žebříčku aktuálního kola"
}


function getStatsForPlayerPreviousRoundText(playerRanking) {
    return ", " + playerRanking + ". v žebříčku minulého kola"
}


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


function getEstimatedAverageStatsForAllPlayersOfPreviousEventWithResultsText(
    averagePlayerEstimatedRanking,
    averagePlayerEstimatedPercentil,
    countPlayersEstimated
) {
    if(countPlayersEstimated) {
        return "<br><br>Pro " + countPlayersEstimated + " hráčů bylo z výsledků na minulém turnaji odhadnuté průměrné místo v žebříčku: " + averagePlayerEstimatedRanking + " a průměrný percentil: " + averagePlayerEstimatedPercentil + "."
    }
    return ""
}


function getEstimatedAverageStatsForAllPlayersOfPreviousPreviousEventWithResultsText(
    averagePlayerEstimatedRanking,
    averagePlayerEstimatedPercentil,
    countPlayersEstimated
) {
    if(countPlayersEstimated) {
        return "<br><br>Pro " + countPlayersEstimated + " hráčů bylo z výsledků na předminulém turnaji odhadnuté průměrné místo v žebříčku: " + averagePlayerEstimatedRanking + " a průměrný percentil: " + averagePlayerEstimatedPercentil + "."
    }
    return ""
}

function getEstimatedAverageStatsForAllPlayersOfThisEventWithResultsText(
    averagePlayerEstimatedRanking,
    averagePlayerEstimatedPercentil,
    countPlayersEstimated
) {
    return "<br><br>Pro " + countPlayersEstimated + " hráčů bylo z výsledků na tomto turnaji odhadnuté průměrné místo v žebříčku: " + averagePlayerEstimatedRanking + " a průměrný percentil: " + averagePlayerEstimatedPercentil + "."
}

var previousEvents = []


async function estimatePreviousEvents() {
    previousEvents = await loadPreviousEventResults(2)
    previousEvents = await loadRankingsForPreviousEventResults(previousEvents)
    previousEvents = await estimateNotFoundRankingsInRankingTableForPreviousEventResults(previousEvents)
}


async function getTextFunctionForEstimatingPlayersFromPreviousEvent(previousEvent, displayedEventDateText) {
    const fdfd = previousEvent.date == displayedEventDateText
    return previousEvent.date == displayedEventDateText ? getEstimatedAverageStatsForAllPlayersOfThisEventWithResultsText : getEstimatedAverageStatsForAllPlayersOfPreviousEventWithResultsText
}


async function getTextFunctionForEstimatingPlayersFromPreviousPreviousEvent(previousEvent, displayedEventDateText) {
    const fdfd = previousEvent.date == displayedEventDateText
    return previousEvent.date == displayedEventDateText ? getEstimatedAverageStatsForAllPlayersOfThisEventWithResultsText : getEstimatedAverageStatsForAllPlayersOfPreviousPreviousEventWithResultsText
}


async function getTextFunctionForEstimatingPlayerFromPreviousEvent(previousEvent, displayedEventDateText) {
    return previousEvent.date == displayedEventDateText ? getEstimatedAverageStatsForAllPlayersOfThisEventWithResultsText : getEstimatedAverageStatsForAllPlayersOfPreviousEventWithResultsText
}


async function getTextFunctionForEstimatingPlayerFromPreviousPreviousEvent(previousEvent, displayedEventDateText) {
    return previousEvent.date == displayedEventDateText ? getEstimatedAverageStatsForAllPlayersOfThisEventWithResultsText : getEstimatedAverageStatsForAllPlayersOfPreviousPreviousEventWithResultsText
}


async function main() {
    await estimatePreviousEvents()
    var previousMonthRankingTableUrl = await loadPreviousRankingTableUrl()

    const eventDateLabelElement = document.evaluate("//th[contains(., 'Začátek akce')]", document, null, XPathResult.ANY_TYPE, null).iterateNext();
    // format 02.09.2022 19:00
    const displayedEventDateText = eventDateLabelElement.nextSibling.nextSibling.innerText

    var textEstimatingFromPreviousEvent = await getTextFunctionForEstimatingPlayersFromPreviousEvent(previousEvents[0], displayedEventDateText)
    var textEstimatingFromPreviousPreviousEvent = await getTextFunctionForEstimatingPlayersFromPreviousPreviousEvent(previousEvents[1], displayedEventDateText)

    displayAdditionalStatsForPlayersSkillGroupParticipatingToEventByGivenRankingTableUrl(RANKING_TABLE_BADMINTON_PRAGUE_CURRENT_MONTH, getAverageStatsForAllPlayersCurrentRoundText, BEGINERS, () => {
        displayAdditionalStatsForPlayersSkillGroupParticipatingToEventByGivenRankingTableUrl(previousMonthRankingTableUrl, getAverageStatsForAllPlayersPreviousRoundText, BEGINERS, () => {
            displayAdditionalEstimatedStatsForAllPlayersParticipatingToEvent(previousEvents[0], textEstimatingFromPreviousEvent, BEGINERS, () => {
                displayAdditionalEstimatedStatsForAllPlayersParticipatingToEvent(previousEvents[1], textEstimatingFromPreviousPreviousEvent, BEGINERS)
            })
        })
    })
    displayAdditionalStatsForPlayersSkillGroupParticipatingToEventByGivenRankingTableUrl(RANKING_TABLE_BADMINTON_PRAGUE_CURRENT_MONTH, getAverageStatsForAllPlayersCurrentRoundText, ADVANCED, () => {
        displayAdditionalStatsForPlayersSkillGroupParticipatingToEventByGivenRankingTableUrl(previousMonthRankingTableUrl, getAverageStatsForAllPlayersPreviousRoundText, ADVANCED, () => {
            displayAdditionalEstimatedStatsForAllPlayersParticipatingToEvent(previousEvents[0], textEstimatingFromPreviousEvent, ADVANCED, () => {
                displayAdditionalEstimatedStatsForAllPlayersParticipatingToEvent(previousEvents[1], textEstimatingFromPreviousPreviousEvent, ADVANCED)
            })
        })
    })
    displayAdditionalStatsForPlayersSkillGroupParticipatingToEventByGivenRankingTableUrl(RANKING_TABLE_BADMINTON_PRAGUE_CURRENT_MONTH, getAverageStatsForAllPlayersCurrentRoundText, INTERMEDIATE, () => {
        displayAdditionalStatsForPlayersSkillGroupParticipatingToEventByGivenRankingTableUrl(previousMonthRankingTableUrl, getAverageStatsForAllPlayersPreviousRoundText, INTERMEDIATE, () => {
            displayAdditionalEstimatedStatsForAllPlayersParticipatingToEvent(previousEvents[0], textEstimatingFromPreviousEvent, INTERMEDIATE, () => {
                displayAdditionalEstimatedStatsForAllPlayersParticipatingToEvent(previousEvents[1], textEstimatingFromPreviousPreviousEvent, INTERMEDIATE)
            })
        })
    })
}


main()


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


async function displayAdditionalStatsForPlayersSkillGroupParticipatingToEventByGivenRankingTableUrl(rankingTableUrl, additionalTextCallback, skillCategoryName, callback) {

    var query = document.evaluate("//div[@id='actions-table']/*/div[contains(., '" + skillCategoryName + "')]", document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null).iterateNext();
    var additionalStats = getAdditionalStatsElement(query, skillCategoryName)

    if (query) {
        const skillCategoryParticipantsUrl = query.parentElement.childNodes[9].childNodes[1].href;
        const payload = await loadFromUrlAjaxPayload(skillCategoryParticipantsUrl)
        if(payload) {
            const snippetHTML = payload.snippets["snippet--eventTabs"]
            var parser = new DOMParser()
            var responseDOM = parser.parseFromString(snippetHTML,"text/html")
            var skillCategoryHeadingElement = responseDOM.evaluate("//h3[contains(., '" + skillCategoryName + "')]", responseDOM, null, XPathResult.ANY_TYPE, null).iterateNext();

            if(skillCategoryHeadingElement) {
                responseDOM = skillCategoryHeadingElement.nextSibling.nextSibling

                var rankingTableDOM = await loadFromUrlDOM(rankingTableUrl)
                calculateAdditionalStatsForAllPlayersParticipatingToEvent(responseDOM, rankingTableDOM, function(averagePlayersRating, averagePlayerPercentil, countPlayersWithRating, totalPlayersInRound) {
                    additionalStats.innerHTML += additionalTextCallback(averagePlayersRating, averagePlayerPercentil, countPlayersWithRating, totalPlayersInRound)                            

                    if (typeof callback == 'function') {
                        callback()
                    }
                })
            }
        }
    }
}


async function loadFromUrlAjaxPayload(url) {
    return new Promise(resolve => {
        $.ajax({
            type: "POST",
            url: url,
            success: function(payload) {
                resolve(payload)
            },
            error: function() {
                resolve(null)
            }
        });
    })
}


async function loadFromUrlDOM(url) {
    return new Promise(resolve => {
        fetch(
            url, {
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
                    resolve(document)
                })
            }
        })
        .catch(() => {
            resolve(null)
        })
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


async function loadRankingForPlayer(playerName, rankingTableDOM) {
    return new Promise(resolve => {
        loadPlayerRankingFromRankingTableDOM(playerName, rankingTableDOM, (playerRanking) => {
            if (playerRanking) {
                resolve(parseInt(playerRanking))
            } else {
                resolve(-1)
            }
        })
    })
}


function getDateMonthTextFromNumber(number) {
    switch(parseInt(number)) {
        case 1:
            return "leden"
        case 2:
            return "únor"
        case 3:
            return "březen"          
        case 4:
            return "duben"
        case 5:
            return "květen"
        case 6:
            return "červen"
        case 7:
            return "červenec"
        case 8:
            return "srpen"
        case 9:
            return "září"
        case 10:
            return "říjen" 
        case 11:
            return "listopad"                                                                                                                       
        case 12:
            return "prosinec"                                                                                                                       
      }
}


async function getEventResults(eventLink) {

    var eventDOM = await loadFromUrlDOM(eventLink)

    if(eventDOM) {

        const resultsQuery = eventDOM.evaluate("//a[contains(.,'Výsledky')]", eventDOM, null, XPathResult.ANY_TYPE, null).iterateNext();
        const eventDateLabelElement = eventDOM.evaluate("//th[contains(., 'Začátek akce')]", eventDOM, null, XPathResult.ANY_TYPE, null).iterateNext();
        // format 02.09.2022 19:00
        const eventDateText = eventDateLabelElement.nextSibling.nextSibling.innerText
        const eventDateYear = eventDateText.split(" ")[0].split(".")[2]
        const eventDateMonthText = getDateMonthTextFromNumber(eventDateText.split(".")[1])

        if (resultsQuery) {

            const resultsLink = resultsQuery.href
            var payload = await loadFromUrlAjaxPayload(resultsLink)

            const snippetHTML = payload.snippets["snippet-eventTab-eventTabs"]
            var parser = new DOMParser()
            var resultsDOM = parser.parseFromString(snippetHTML,"text/html")

            var noResultsYetElement = resultsDOM.evaluate("//div[contains(.,'Výsledky nejsou k dispozici')]", resultsDOM, null, XPathResult.ANY_TYPE, null).iterateNext()
            if(noResultsYetElement) {
                return null
            } else {
                var results = []
                results['date'] = eventDateText
                results['dateMonthText'] = eventDateMonthText
                results['dateYear'] = eventDateYear
                SKILL_CATEGORY_NAMES.forEach((skillCategoryName) => {
                    var skillCategoryHeadingElement = resultsDOM.evaluate("//h2[contains(., '" + skillCategoryName + "')]", resultsDOM, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null).iterateNext();
                    // event can be cancelled because of low interest only for some category
                    if(skillCategoryHeadingElement) {
                        results[skillCategoryName] = []
                        playersLinkElements = skillCategoryHeadingElement.nextSibling.nextSibling.querySelectorAll("a[href*='hrac']")
                        playersLinkElements.forEach((playerLinkElement) => {
                            const playerName = playerLinkElement.innerText
                            const playerEventRanking = parseInt(playerLinkElement.parentNode.previousSibling.previousSibling.innerText)
                            results[skillCategoryName].push({
                                'name': playerName,
                                'eventRanking': playerEventRanking                                                
                            })
                        })
                    }
                })
                return results
            }
        }
    }
}


async function loadPreviousEventResults(countReturnedEvents) {
    const eventsTableDOM = await loadFromUrlDOM(PREVIOUS_EVENTS_PRAGUE)
    const previousEventTagElements = eventsTableDOM.querySelectorAll("div[class*='title'] > a:first-of-type[href*='udalost']")

    var previousEvents = []
    for(let index = 0; index < previousEventTagElements.length; index++) {
        const eventLink = previousEventTagElements[index].href
        const results = await getEventResults(eventLink)
        if(results) {
            previousEvents.push(results)

            if(previousEvents.length == countReturnedEvents) {
                return previousEvents
            }
        }
    }
}


async function loadRankingsForPreviousEventResults(previousEvents) {
    for(let index = 0; index < previousEvents.length; index++) {
        const event = previousEvents[index]
        const rankingTableDOM = await loadRankingTableByYearAndMonthTextUrl(event.dateYear, event.dateMonthText)
        if(rankingTableDOM) {
            for(let skill_category_index = 0; skill_category_index < SKILL_CATEGORY_NAMES.length; skill_category_index++) {
                const skillCategoryName = SKILL_CATEGORY_NAMES[skill_category_index]
                const players = event[skillCategoryName]

                // event can be cancelled for any skill group
                if(players) {
                    for(let player_index = 0; player_index < players.length; player_index++) {
                        var player = players[player_index]
                        player['roundRanking'] = await loadRankingForPlayer(player.name, rankingTableDOM)
                    }
                }
            }
        }
    }
    return previousEvents
}


async function estimate(data) {
    return new Promise(resolve => {
        chrome.runtime.sendMessage({
            'text': ESTIMATE_ROUND_RANKING,
            'data': data
        }, (result) => {
            resolve(result)
        })
    })
}


async function estimateNotFoundRankingsInRankingTableForPreviousEventResults(previousEvents) {

    for(let index = 0; index < previousEvents.length; index++) {
        const event = previousEvents[index]
        const rankingTableDOM = await loadRankingTableByYearAndMonthTextUrl(event.dateYear, event.dateMonthText)
        if(rankingTableDOM) {
            for(let skill_category_index = 0; skill_category_index < SKILL_CATEGORY_NAMES.length; skill_category_index++) {
                const skillCategoryName = SKILL_CATEGORY_NAMES[skill_category_index]
                const players = event[skillCategoryName]

                // event can be cancelled for any skill group
                if(players) {
                    var data = []
                    for(let playerIndex = 0; playerIndex < players.length; playerIndex++) {
                        var player = players[playerIndex]
                        if(player.roundRanking) {
                            data.push([player.eventRanking, player.roundRanking])
                        } else {
                            data.push([player.eventRanking, -1])
                        }
                    }

                    previousEvents[index]['countPlayersAppropriateRound'] = await loadCountPlayersFromRankingTableDOM(rankingTableDOM)

                    const estimatedResults = await estimate(data)

                    for(let playerIndex = 0; playerIndex < players.length; playerIndex++) {
                        var estimatedRoundRanking = estimatedResults[playerIndex]
                        if(estimatedRoundRanking != -1) {
                            previousEvents[index][skillCategoryName][playerIndex]['roundRankingEstimated'] = estimatedRoundRanking
                        }
                    }
                }
            }
        }
    }
    return previousEvents
}


async function displayAdditionalEstimatedStatsForAllPlayersParticipatingToEvent(oneOfPreviousEvents, additionalTextCallback, skillCategoryName, callback) {
    if (!oneOfPreviousEvents[skillCategoryName]) {
        if (typeof callback == 'function') {
            callback()
        }
    }
    
    var query = document.evaluate("//div[@id='actions-table']/*/div[contains(., '" + skillCategoryName + "')]", document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null).iterateNext();
    var additionalStats = getAdditionalStatsElement(query, skillCategoryName)

    if (query) {
        const skillCategoryParticipantsUrl = query.parentElement.childNodes[9].childNodes[1].href;
        const payload = await loadFromUrlAjaxPayload(skillCategoryParticipantsUrl)
        if(payload) {
            const snippetHTML = payload.snippets["snippet--eventTabs"]
            var parser = new DOMParser()
            var responseDOM = parser.parseFromString(snippetHTML,"text/html")
            var skillCategoryHeadingElement = responseDOM.evaluate("//h3[contains(., '" + skillCategoryName + "')]", responseDOM, null, XPathResult.ANY_TYPE, null).iterateNext();

            if(skillCategoryHeadingElement) {
                responseDOM = skillCategoryHeadingElement.nextSibling.nextSibling
                calculateEstimatedStatsForAllPlayersParticipatingToEvent(responseDOM, oneOfPreviousEvents, skillCategoryName, function(averagePlayerEstimatedPercentil, averagePlayerEstimatedRanking, countPlayersEstimated) {
                    if(countPlayersEstimated) {
                        additionalStats.innerHTML += additionalTextCallback(averagePlayerEstimatedPercentil, averagePlayerEstimatedRanking, countPlayersEstimated)
                    }

                    if (typeof callback == 'function') {
                        callback()
                    }
                })
            }
        }
    }
}


async function calculateEstimatedStatsForAllPlayersParticipatingToEvent(document, oneOfPreviousEvents, skillCategoryName, callback) {
    const playerElements = document.querySelectorAll("a[href*='hrac/']")

    if (!playerElements.length) {
        return
    }

    const skillCategoryFromOneOfPreviousEvents = oneOfPreviousEvents[skillCategoryName]

    if (!skillCategoryFromOneOfPreviousEvents) {
        return
    }

    var totalPercentil = 0
    var totalRanking = 0
    var countPlayersEstimated = 0
    var countRoundPlayers = oneOfPreviousEvents.countPlayersAppropriateRound

    for(let index = 0; index < playerElements.length; index++) {
        const playerName = playerElements[index].innerText

        var playerEstimatedResultOnEvent = null
        skillCategoryFromOneOfPreviousEvents.forEach((player) => {
            if(player.name == playerName) {
                playerEstimatedResultOnEvent = player
            }
        })
        if(playerEstimatedResultOnEvent && playerEstimatedResultOnEvent.roundRanking == -1) {
            countPlayersEstimated += 1
            totalRanking += playerEstimatedResultOnEvent.roundRankingEstimated
            totalPercentil += ((countRoundPlayers - playerEstimatedResultOnEvent.roundRankingEstimated) / countRoundPlayers) * 100
        }
        
    }
    
    const averagePlayerEstimatedRanking = totalRanking / countPlayersEstimated
    const averagePlayerEstimatedPercentil = totalPercentil / countPlayersEstimated

    callback(parseInt(averagePlayerEstimatedRanking), parseInt(averagePlayerEstimatedPercentil), countPlayersEstimated)
}


async function calculateAdditionalStatsForAllPlayersParticipatingToEvent(document, rankingTableDOM, callback) {
    const playerElements = document.querySelectorAll("a[href*='hrac']")

    if (!playerElements.length) {
        return
    }

    var totalPercentil = 0
    var totalRanking = 0
    var countRoundPlayers = await loadCountPlayersFromRankingTableDOM(rankingTableDOM)
    var countPlayersWithRanking = 0

    for(let index = 0; index < playerElements.length; index++) {
        const playerName = playerElements[index].innerText
        var playerStats = {
            'name': playerName, 
            'ranking': await loadRankingForPlayer(playerName, rankingTableDOM)
        }
        if(playerStats.ranking != -1) {
            countPlayersWithRanking += 1
            totalRanking += playerStats.ranking
            totalPercentil += ((countRoundPlayers - playerStats.ranking) / countRoundPlayers) * 100
        }
    }
    
    const averagePlayerRanking = totalRanking / countPlayersWithRanking
    const averagePlayerPercentil = totalPercentil / countPlayersWithRanking

    callback(parseInt(averagePlayerRanking), parseInt(averagePlayerPercentil), countPlayersWithRanking, countRoundPlayers)
}


async function displayAdditionalStatsForAllPlayersParticipatingToEvent(rankingTableUrl, document, additionalTextCallback) {

    const playerElements = document.querySelectorAll("div[id='snippet--eventTabs'] a[href*='hrac']")

    if(!playerElements.length) {
        return null
    }

    var rankingTableDOM = await loadFromUrlDOM(rankingTableUrl)
    if(rankingTableDOM) {
        for(let index = 0; index < playerElements.length; index++) {
            var playerElement = playerElements[index]
            displayRatingForPlayerParticipatingToEvent(
                playerElement,
                rankingTableDOM,
                additionalTextCallback
            )
        }
        return true
    } else {
        return false
    }
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


function displayEstimatedRatingForPlayerParticipatingToEvent(playerElement, previousEvent, additionalTextCallback) {

    var playerNameElement = playerElement.childNodes[0]
    const playerName = playerNameElement.innerText

     SKILL_CATEGORY_NAMES.forEach((skillCategoryName) => {
        // event could be cancelled only for specific skill group
        if(previousEvent[skillCategoryName]) {
            previousEvent[skillCategoryName].forEach((player) => {
                if(player.name == playerName && player.roundRankingEstimated && player.roundRankingEstimated != -1) {
                    playerElement.innerHTML += additionalTextCallback(player.roundRankingEstimated)
                }
            })
        }
    })
}


function loadDOM(url) {
    return new Promise(resolve => {
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
                    resolve(document)
                })
            }
        })
    })
}


async function loadPreviousRankingTableUrl() {
    var document = await loadDOM(RANKING_TABLE_BADMINTON_PRAGUE)
    var previousRoundElement = document.getElementById("fn_round-select").childNodes[3]
    var previousRoundId = previousRoundElement.value

    var url = "https://www.vaseliga.cz/zebricek/badminton/praha?jsRoundId=" + previousRoundId + "&do=loadRank"
    return url
}


async function loadRankingTableByYearAndMonthTextUrl(year, monthText) {
    var document = await loadDOM(RANKING_TABLE_BADMINTON_PRAGUE)
    var previousRoundElement = document.evaluate("//option[contains(., '" + monthText + "') and contains(., '" + year + "')]", document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null).iterateNext()
    if(previousRoundElement) {
        var previousRoundId = previousRoundElement.value

        var url = "https://www.vaseliga.cz/zebricek/badminton/praha?jsRoundId=" + previousRoundId + "&do=loadRank"
            
        var DOM = await loadFromUrlDOM(url)
        if(DOM) {
            return DOM
        } else {
            return null
        }
    }
}


async function displayEstimatedStatsForAllPlayersParticipatingToEvent(previousEvent, document, additionalTextCallback) {

    const playerElements = document.querySelectorAll("div[id='snippet--eventTabs'] a[href*='hrac']")

    if(!playerElements.length) {
        return null
    }

    for(let index = 0; index < playerElements.length; index++) {
        var playerElement = playerElements[index]
        displayEstimatedRatingForPlayerParticipatingToEvent(
            playerElement,
            previousEvent,
            additionalTextCallback
        )
    }

    return true
}


// load players rating only once
var isLoadedRatingForAllPlayersParticipatingToEvent = false
// during trying to load do not start another attempt (perodical alarm)
var lockDisplayEventAdditionalPersonalPlayerStats = false

async function displayEventAdditionalPersonalPlayerStats() {
    if (!isLoadedRatingForAllPlayersParticipatingToEvent && !lockDisplayEventAdditionalPersonalPlayerStats) {
        
        const displayingFromCurrentRound = await displayAdditionalStatsForAllPlayersParticipatingToEvent(
            RANKING_TABLE_BADMINTON_PRAGUE_CURRENT_MONTH,
            document,
            getStatsForPlayerCurrentRoundText
        )

        if (displayingFromCurrentRound) {
            isLoadedRatingForAllPlayersParticipatingToEvent = true
        } else {
            lockDisplayEventAdditionalPersonalPlayerStats = false
            return
        }

        var previousMonthRankingTableUrl = await loadPreviousRankingTableUrl()
        const displayingFromPreviousRound = await displayAdditionalStatsForAllPlayersParticipatingToEvent(
            previousMonthRankingTableUrl,
            document,
            getStatsForPlayerPreviousRoundText
        )

        if (!displayingFromPreviousRound) {
            lockDisplayEventAdditionalPersonalPlayerStats = false
            return
        }
        
        if(previousEvents.length == 0) {
            await estimatePreviousEvents()
        }

        const eventDateLabelElement = document.evaluate("//th[contains(., 'Začátek akce')]", document, null, XPathResult.ANY_TYPE, null).iterateNext();
        // format 02.09.2022 19:00
        const displayedEventDateText = eventDateLabelElement.nextSibling.nextSibling.innerText
        var textEstimatingFromPreviousEvent = await getTextFunctionForEstimatingPlayerFromPreviousEvent(previousEvents[0], displayedEventDateText)
        var textEstimatingFromPreviousPreviousEvent = await getTextFunctionForEstimatingPlayerFromPreviousPreviousEvent(previousEvents[1], displayedEventDateText)
        

        if(previousEvents.length > 0) {
            await displayEstimatedStatsForAllPlayersParticipatingToEvent(
                previousEvents[0],
                document,
                textEstimatingFromPreviousEvent
            )
        }

        if(previousEvents.length > 1) {
            await displayEstimatedStatsForAllPlayersParticipatingToEvent(
                previousEvents[1],
                document,
                textEstimatingFromPreviousPreviousEvent
            )
        }
    }
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.text === ALARM_EVENT_ADDITIONAL_PERSONAL_PLAYER_STATS) {
        displayEventAdditionalPersonalPlayerStats()
    }
})