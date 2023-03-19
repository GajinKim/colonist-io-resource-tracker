console.log("Starting Colonist.io Extension...");

const body = document.getElementsByTagName("body")[0];
const playerTable = document.createElement("table");
const bankTable = document.createElement("table");

let playerUsername = "";
let players = [];
let bankResources = {
  wood: 19,
  brick: 19,
  sheep: 19,
  wheat: 19,
  ore: 19,
  devCards: 25,
};

let unprocessedEvents = [];
let processedEvents = [];

getPlayerUsername();
removeAds();

// in-game functions
updateKnownEvents();

function removeAds() {
  setInterval(() => {
    let ads = [];

    ads.push(document.getElementById("lobby_ad_left"));
    ads.push(document.getElementById("lobby_ad_right"));
    ads.push(document.getElementById("homepage_ab_300x250_container"));
    ads.push(document.getElementById("in_game_ab_left"));
    ads.push(document.getElementById("in_game_ab_right"));
    ads.push(document.getElementById("in_game_ab_bottom_small"));

    // ads.push(...document.getElementsByClassName("adsbyvli running"));

    for (let i = 0; i < ads.length; i++) {
      ads[i].style.display = "none";
    }
  }, 500);
}

/**
 * Three basic steps
 *
 * 1. Detect "new events" found in the latestEventLog (updated every 2.5sec)
 * 2. Sanitize each of the "new events"
 * 3. Append the "sanitized events" to the unprocessedEvents list
 */
function updateKnownEvents() {
  setInterval(() => {
    // detecting new events to process:

    latestEventLog = [...document.getElementsByClassName("message_post")];
    newEvents = latestEventLog.splice(
      processedEvents.length + unprocessedEvents.length
    );

    for (let i = 0; i < newEvents.length; i++) {
      let newEvent = newEvents[i];
      let newEventColor = newEvent.outerHTML
        .replace(`<div class="message_post" id="" style="color: `, "")
        .split(`;"><img`)[0]
        .replace(`"><hr></div>`, "");

      // console.log("raw text", newEvent.innerHTML)

      let sanitizedNewEventText = sanitizeEventText(newEvent.innerHTML);

      // console.log("sanitized text", sanitizedNewEventText);

      unprocessedEvents.push({
        text: sanitizedNewEventText,
        color: newEventColor,
      });
    }

    if (unprocessedEvents.length != 0) {
      console.log("processing", unprocessedEvents.length, "new events");
    }

    while (unprocessedEvents.length > 0) {
      eventToProcess = unprocessedEvents.pop();
      console.log("processing event:", eventToProcess.text); // console log latest event

      processEvent(eventToProcess); // update resource counters

      // after processing event move it to processed list
      processedEvents.push(eventToProcess);
    }
    
    rebalanceUnknowns();

    // maybe we can reset the known events array
    // as well as the known events length?\
    // and known events colors array?
  }, 2000);
}

function sanitizeEventText(eventText) {
  let sanitizedEventText = eventText;
  sanitizedEventText = sanitizedEventText.replaceAll(
    /<img src="\/dist\/images\/card_lumber\.svg\?v([0-9]+)" alt="lumber" height="20" width="14\.25" class="lobby-chat-text-icon">/gm,
    "WOOD "
  );
  sanitizedEventText = sanitizedEventText.replaceAll(
    /<img src="\/dist\/images\/card_brick\.svg\?v([0-9]+)" alt="brick" height="20" width="14\.25" class="lobby-chat-text-icon">/gm,
    "BRICK "
  );
  sanitizedEventText = sanitizedEventText.replaceAll(
    /<img src="\/dist\/images\/card_wool\.svg\?v([0-9]+)" alt="wool" height="20" width="14\.25" class="lobby-chat-text-icon">/gm,
    "SHEEP "
  );
  sanitizedEventText = sanitizedEventText.replaceAll(
    /<img src="\/dist\/images\/card_grain\.svg\?v([0-9]+)" alt="grain" height="20" width="14\.25" class="lobby-chat-text-icon">/gm,
    "WHEAT "
  );
  sanitizedEventText = sanitizedEventText.replaceAll(
    /<img src="\/dist\/images\/card_ore\.svg\?v([0-9]+)" alt="ore" height="20" width="14\.25" class="lobby-chat-text-icon">/gm,
    "ORE "
  );
  sanitizedEventText = sanitizedEventText.replaceAll(
    /<img src="\/dist\/images\/card_rescardback\.svg\?v([0-9]+)" alt="card" height="20" width="14\.25" class="lobby-chat-text-icon">/gm,
    "UNKNOWN "
  );

  sanitizedEventText = sanitizedEventText.replaceAll(
    /<img src="\/dist\/images\/card_devcardback\.svg\?v([0-9]+)" alt="development card" height="20" width="14\.25" class="lobby-chat-text-icon">/gm,
    "DEV_CARD"
  );
  sanitizedEventText = sanitizedEventText.replaceAll(
    /<img src="\/dist\/images\/road_.*\.svg\?v([0-9]+)" alt="road" height="20" width="20" class="lobby-chat-text-icon">/gm,
    "ROAD"
  );
  sanitizedEventText = sanitizedEventText.replaceAll(
    /<img src="\/dist\/images\/settlement_.*\.svg\?v([0-9]+)" alt="settlement" height="20" width="20" class="lobby-chat-text-icon">/gm,
    "SETTLEMENT"
  );
  sanitizedEventText = sanitizedEventText.replaceAll(
    /<img src="\/dist\/images\/city_.*\.svg\?v([0-9]+)" alt="city" height="20" width="20" class="lobby-chat-text-icon">/gm,
    "CITY"
  );

  // dev card pops
  sanitizedEventText = sanitizedEventText.replaceAll(
    /<a href="#card-description-popup-7">Knight <img src="\/dist\/images\/card_knight\.svg\?v([0-9]+)" alt="card knight" height="20" width="14\.25" class="lobby-chat-text-icon"><\/a>/gm,
    "KNIGHT"
  );
  sanitizedEventText = sanitizedEventText.replaceAll(
    /<a href="#card-description-popup-9">Monopoly <img src="\/dist\/images\/card_monopoly\.svg\?v([0-9]+)" alt="card monopoly" height="20" width="14\.25" class="lobby-chat-text-icon"><\/a>/gm,
    "MONOPOLY"
  );
  sanitizedEventText = sanitizedEventText.replaceAll(
    /<a href="#card-description-popup-10">Road Building <img src="\/dist\/images\/card_roadbuilding\.svg\?v([0-9]+)" alt="card road building" height="20" width="14\.25" class="lobby-chat-text-icon"><\/a>/gm,
    "ROAD_BUILDING"
  );
  sanitizedEventText = sanitizedEventText.replaceAll(
    /<a href="#card-description-popup-11">Year of Plenty <img src="\/dist\/images\/card_yearofplenty\.svg\?v([0-9]+)" alt="card year of plenty" height="20" width="14\.25" class="lobby-chat-text-icon"><\/a>/gm,
    "YEAR_OF_PLENTY"
  );

  sanitizedEventText = sanitizedEventText.replaceAll(
    /<img src="\/dist\/images\/dice_1.svg\?v([0-9]+)" alt="dice_1" height="20" width="20" class="lobby-chat-text-icon">/gm,
    "1"
  );
  sanitizedEventText = sanitizedEventText.replaceAll(
    /<img src="\/dist\/images\/dice_2.svg\?v([0-9]+)" alt="dice_2" height="20" width="20" class="lobby-chat-text-icon">/gm,
    "2"
  );
  sanitizedEventText = sanitizedEventText.replaceAll(
    /<img src="\/dist\/images\/dice_3.svg\?v([0-9]+)" alt="dice_3" height="20" width="20" class="lobby-chat-text-icon">/gm,
    "3"
  );
  sanitizedEventText = sanitizedEventText.replaceAll(
    /<img src="\/dist\/images\/dice_4.svg\?v([0-9]+)" alt="dice_4" height="20" width="20" class="lobby-chat-text-icon">/gm,
    "4"
  );
  sanitizedEventText = sanitizedEventText.replaceAll(
    /<img src="\/dist\/images\/dice_5.svg\?v([0-9]+)" alt="dice_5" height="20" width="20" class="lobby-chat-text-icon">/gm,
    "5"
  );
  sanitizedEventText = sanitizedEventText.replaceAll(
    /<img src="\/dist\/images\/dice_6.svg\?v([0-9]+)" alt="dice_6" height="20" width="20" class="lobby-chat-text-icon">/gm,
    "6"
  );

  sanitizedEventText = sanitizedEventText.replace(/<img[\s\S]*?>/gm, "");
  sanitizedEventText = sanitizedEventText.replace(/[ \t]{2,}/gm, " ");

  return sanitizedEventText.trim();
}

function processEvent(eventToProcess) {
  let eventText = eventToProcess.text;

  if (eventText.includes("received starting resources:")) {
    addNewPlayer(eventToProcess);
  }

  if (eventText.includes("got:")) {
    gotResource(eventText);
  }

  if (eventText.includes("built a")) {
    builtA(eventText);
  }

  if (eventText.includes("bought DEV_CARD")) {
    boughtDevCard(eventText);
  }

  if (eventText.includes("gave bank:")) {
    gaveBank(eventText);
  }

  if (eventText.includes("discarded:")) {
    discarded(eventText);
  }

  if (eventText.includes("traded:")) {
    traded(eventText);
  }

  if (eventText.includes("stole") && eventText.includes("from")) {
    stoleFrom(eventText);
  }

  if (eventText.match(/.* stole ([0-9]|1[0-9]): .*/g)) {
    monopoly(eventText);
  }

  if (eventText.includes("took from bank:")) {
    tookFromBank(eventText);
  }

  if (eventText.includes("used ROAD_BUILDING")) {
    placedARoad(eventText);
  }

  if (players.length != 0) {
    renderTable();
  }
}

function addNewPlayer(event) {
  eventItems = event.text
    .replace("received starting resources:", "")
    .split(" ");

  players.push({
    name: eventItems[0],
    wood: 0,
    brick: 0,
    sheep: 0,
    wheat: 0,
    ore: 0,
    unknownStolen: 0,
    unknownLost: 0,
    roads: 2,
    settlements: 2,
    cities: 0,
    color: event.color,
  });

  currentPlayer = players.find((player) => player.name === eventItems[0]);

  for (let i = 1; i < eventItems.length; i++) {
    if (eventItems[i] === "WOOD") {
      currentPlayer.wood += 1;
      bankResources.wood -= 1;
    } else if (eventItems[i] === "BRICK") {
      currentPlayer.brick += 1;
      bankResources.brick -= 1;
    } else if (eventItems[i] === "SHEEP") {
      currentPlayer.sheep += 1;
      bankResources.sheep -= 1;
    } else if (eventItems[i] === "WHEAT") {
      currentPlayer.wheat += 1;
      bankResources.wheat -= 1;
    } else if (eventItems[i] === "ORE") {
      currentPlayer.ore += 1;
      bankResources.ore -= 1;
    }
  }
}

function gotResource(eventText) {
  eventItems = eventText.replace("got:", "").split(" ");
  currentPlayer = players.find((player) => player.name === eventItems[0]);

  console.log("event item", eventItems);
  console.log("current player", currentPlayer);

  for (let i = 1; i < eventItems.length; i++) {
    if (eventItems[i] === "WOOD") {
      currentPlayer.wood += 1;
      bankResources.wood -= 1;
    } else if (eventItems[i] === "BRICK") {
      currentPlayer.brick += 1;
      bankResources.brick -= 1;
    } else if (eventItems[i] === "SHEEP") {
      currentPlayer.sheep += 1;
      bankResources.sheep -= 1;
    } else if (eventItems[i] === "WHEAT") {
      currentPlayer.wheat += 1;
      bankResources.wheat -= 1;
    } else if (eventItems[i] === "ORE") {
      currentPlayer.ore += 1;
      bankResources.ore -= 1;
    }
  }
}

function gaveBank(eventText) {
  eventItems = eventText.split("and took");
  gaveBankEventItems = eventItems[0].replace("gave bank:", "").split(" ");
  andTookEventItems = eventItems[1].split(" ");
  currentPlayer = players.find(
    (player) => player.name === gaveBankEventItems[0]
  );

  for (let i = 1; i < gaveBankEventItems.length; i++) {
    if (gaveBankEventItems[i] === "WOOD") {
      currentPlayer.wood -= 1;
      bankResources.wood += 1;
    } else if (gaveBankEventItems[i] === "BRICK") {
      currentPlayer.brick -= 1;
      bankResources.brick += 1;
    } else if (gaveBankEventItems[i] === "SHEEP") {
      currentPlayer.sheep -= 1;
      bankResources.sheep += 1;
    } else if (gaveBankEventItems[i] === "WHEAT") {
      currentPlayer.wheat -= 1;
      bankResources.wheat += 1;
    } else if (gaveBankEventItems[i] === "ORE") {
      currentPlayer.ore -= 1;
      bankResources.ore += 1;
    }
  }

  for (let i = 1; i < andTookEventItems.length; i++) {
    if (andTookEventItems[i] === "WOOD") {
      currentPlayer.wood += 1;
      bankResources.wood -= 1;
    } else if (andTookEventItems[i] === "BRICK") {
      currentPlayer.brick += 1;
      bankResources.brick -= 1;
    } else if (andTookEventItems[i] === "SHEEP") {
      currentPlayer.sheep += 1;
      bankResources.sheep -= 1;
    } else if (andTookEventItems[i] === "WHEAT") {
      currentPlayer.wheat += 1;
      bankResources.wheat -= 1;
    } else if (andTookEventItems[i] === "ORE") {
      currentPlayer.ore += 1;
      bankResources.ore -= 1;
    }
  }
}

function builtA(eventText) {
  eventItems = eventText.replace("built a", "").split(" ");
  currentPlayer = players.find((player) => player.name === eventItems[0]);

  for (let i = 1; i < eventItems.length; i++) {
    if (eventItems[i] === "ROAD") {
      currentPlayer.wood -= 1;
      currentPlayer.brick -= 1;
      bankResources.wood += 1;
      bankResources.brick += 1;
      currentPlayer.roads += 1;
    } else if (eventItems[i] === "SETTLEMENT:") {
      currentPlayer.wood -= 1;
      currentPlayer.brick -= 1;
      currentPlayer.sheep -= 1;
      currentPlayer.wheat -= 1;
      bankResources.wood += 1;
      bankResources.brick += 1;
      bankResources.sheep += 1;
      bankResources.wheat += 1;
      currentPlayer.settlements += 1;
    } else if (eventItems[i] === "CITY:") {
      currentPlayer.wheat -= 2;
      currentPlayer.ore -= 3;
      bankResources.wheat += 2;
      bankResources.ore += 3;
      currentPlayer.settlements -= 1;
      currentPlayer.cities += 1;
    }
  }
}

function boughtDevCard(eventText) {
  eventItems = eventText.replace("bought DEV_CARD", "").split(" ");
  currentPlayer = players.find((player) => player.name === eventItems[0]);

  currentPlayer.sheep -= 1;
  currentPlayer.wheat -= 1;
  currentPlayer.ore -= 1;

  bankResources.sheep += 1;
  bankResources.wheat += 1;
  bankResources.ore += 1;

  bankResources.devCards -= 1;
}

function discarded(eventText) {
  eventItems = eventText.replace("discarded:", "").split(" ");
  currentPlayer = players.find((player) => player.name === eventItems[0]);

  for (let i = 1; i < eventItems.length; i++) {
    if (eventItems[i] === "WOOD") {
      currentPlayer.wood -= 1;
      bankResources.wood += 1;
    } else if (eventItems[i] === "BRICK") {
      currentPlayer.brick -= 1;
      bankResources.brick += 1;
    } else if (eventItems[i] === "SHEEP") {
      currentPlayer.sheep -= 1;
      bankResources.sheep += 1;
    } else if (eventItems[i] === "WHEAT") {
      currentPlayer.wheat -= 1;
      bankResources.wheat += 1;
    } else if (eventItems[i] === "ORE") {
      currentPlayer.ore -= 1;
      bankResources.ore += 1;
    }
  }
}

function traded(eventText) {
  // player1 traded: BRICK BRICK for: ORE ORE with: player2
  eventItems = eventText.split("traded:");

  tradeInitiator = players.find(
    (player) => player.name === eventItems[0].trim()
  );

  eventItemsAfterTraded = eventItems[1];

  tradeInitiatorResources = eventItemsAfterTraded.split("for:")[0].split(" ");
  eventItemsAfterFor = eventItemsAfterTraded.split("for:")[1];

  tradeAccepterResources = eventItemsAfterFor.split("with:")[0].split(" ");
  tradeAccepter = players.find(
    (player) => player.name === eventItemsAfterFor.split("with:")[1].trim()
  );

  for (let i = 0; i < tradeInitiatorResources.length; i++) {
    if (tradeInitiatorResources[i] === "WOOD") {
      tradeAccepter.wood += 1;
      tradeInitiator.wood -= 1;
    } else if (tradeInitiatorResources[i] === "BRICK") {
      tradeAccepter.brick += 1;
      tradeInitiator.brick -= 1;
    } else if (tradeInitiatorResources[i] === "SHEEP") {
      tradeAccepter.sheep += 1;
      tradeInitiator.sheep -= 1;
    } else if (tradeInitiatorResources[i] === "WHEAT") {
      tradeAccepter.wheat += 1;
      tradeInitiator.wheat -= 1;
    } else if (tradeInitiatorResources[i] === "ORE") {
      tradeAccepter.ore += 1;
      tradeInitiator.ore -= 1;
    }
  }

  for (let i = 0; i < tradeAccepterResources.length; i++) {
    if (tradeAccepterResources[i] === "WOOD") {
      tradeAccepter.wood -= 1;
      tradeInitiator.wood += 1;
    } else if (tradeAccepterResources[i] === "BRICK") {
      tradeAccepter.brick -= 1;
      tradeInitiator.brick += 1;
    } else if (tradeAccepterResources[i] === "SHEEP") {
      tradeAccepter.sheep -= 1;
      tradeInitiator.sheep += 1;
    } else if (tradeAccepterResources[i] === "WHEAT") {
      tradeAccepter.wheat -= 1;
      tradeInitiator.wheat += 1;
    } else if (tradeAccepterResources[i] === "ORE") {
      tradeAccepter.ore -= 1;
      tradeInitiator.ore += 1;
    }
  }
}

function stoleFrom(eventText) {
  eventItems = eventText.split(" ");

  stealerName = eventItems[0] === "You" ? playerUsername : eventItems[0];
  victimName =
    eventItems[eventItems.length - 1] === "you"
      ? playerUsername
      : eventItems[eventItems.length - 1];

  stealer = players.find((player) => player.name === stealerName);
  victim = players.find((player) => player.name === victimName);

  // depends on whether you know who stole the resource
  if (eventText.includes("UNKNOWN")) {
    stealer.unknownStolen += 1;
    victim.unknownLost += 1;
  } else {
    for (let i = 1; i < eventItems.length; i++) {
      if (eventItems[i] === "WOOD") {
        stealer.wood += 1;
        victim.wood -= 1;
      } else if (eventItems[i] === "BRICK") {
        stealer.brick += 1;
        victim.brick -= 1;
      } else if (eventItems[i] === "SHEEP") {
        stealer.sheep += 1;
        victim.sheep -= 1;
      } else if (eventItems[i] === "WHEAT") {
        stealer.wheat += 1;
        victim.wheat -= 1;
      } else if (eventItems[i] === "ORE") {
        stealer.ore += 1;
        victim.ore -= 1;
      }
    }
  }
}

function monopoly(eventText) {
  eventItems = eventText.split(" ");

  currentPlayer = players.find((player) => player.name === eventItems[0]);
  numberStolen = parseInt(eventItems[2]);
  resourceStolen = eventItems[3];

  if (resourceStolen === "WOOD") {
    for (player of players) {
      player.name != currentPlayer.name
        ? (player.wood = 0)
        : (player.wood += numberStolen);
    }
  }
  if (resourceStolen === "BRICK") {
    for (player of players) {
      player.name != currentPlayer.name
        ? (player.brick = 0)
        : (player.brick += numberStolen);
    }
  } else if (resourceStolen === "SHEEP") {
    for (player of players) {
      player.name != currentPlayer.name
        ? (player.sheep = 0)
        : (player.sheep += numberStolen);
    }
  } else if (resourceStolen === "WHEAT") {
    for (player of players) {
      player.name != currentPlayer.name
        ? (player.wheat = 0)
        : (player.wheat += numberStolen);
    }
  } else if (resourceStolen === "ORE") {
    for (player of players) {
      player.name != currentPlayer.name
        ? (player.ore = 0)
        : (player.ore += numberStolen);
    }
  }
}

function tookFromBank(eventText) {
  eventItems = eventText.split("took from bank:");
  currentPlayer = players.find(
    (player) => player.name === eventItems[0].trim()
  );
  resourcesReceived = eventItems[1].split(" ");

  for (let i = 1; i < resourcesReceived.length; i++) {
    if (resourcesReceived[i] === "WOOD") {
      currentPlayer.wood += 1;
      bankResources.wood -= 1;
    } else if (resourcesReceived[i] === "BRICK") {
      currentPlayer.brick += 1;
      bankResources.brick -= 1;
    } else if (resourcesReceived[i] === "SHEEP") {
      currentPlayer.sheep += 1;
      bankResources.sheep -= 1;
    } else if (resourcesReceived[i] === "WHEAT") {
      currentPlayer.wheat += 1;
      bankResources.wheat -= 1;
    } else if (resourcesReceived[i] === "ORE") {
      currentPlayer.ore += 1;
      bankResources.ore -= 1;
    }
  }
}

function placedARoad(eventText) {
  eventItems = eventText.split("used ROAD_BUILDING");
  currentPlayer = players.find(
    (player) => player.name === eventItems[0].trim()
  );

  currentPlayer.roads += 2;
  if (currentPlayer.roads > 15) {
    currentPlayer.roads = 15;
  }
}

// if at any point, a player's total cards is 0, refersh set their unknown cards to 0
function rebalanceUnknowns() {
  for (player of players) {
    if (player.unknownStolen == 0 && player.unknownLost == 0) {
      continue;
    }

    // player has negative resource
    if (player.wood < 0) {
      player.unknownStolen -= Math.abs(player.wood);
      player.wood = 0;
    }
    if (player.brick < 0) {
      player.unknownStolen -= Math.abs(player.brick);
      player.brick = 0;
    }
    if (player.sheep < 0) {
      player.unknownStolen -= Math.abs(player.sheep);
      player.sheep = 0;
    }
    if (player.wheat < 0) {
      player.unknownStolen -= Math.abs(player.wheat);
      player.wheat = 0;
    }
    if (player.ore < 0) {
      player.unknownStolen -= Math.abs(player.ore);
      player.ore = 0;
    }

    // player has 0 cards
    if (
      player.wood +
        player.brick +
        player.sheep +
        player.wheat +
        player.ore +
        player.unknownStolen -
        player.unknownLost ==
      0
    ) {
      player.wood = 0;
      player.brick = 0;
      player.sheep = 0;
      player.wheat = 0;
      player.ore = 0;
      player.unknownStolen = 0;
      player.unknownLost = 0;
    }

    // player "has" a resource, but the bank is full
    if (bankResources.wood === 19 && player.wood != 0) {
      player.unknownLost -= player.wood;
      player.wood = 0;
    }
    if (bankResources.brick === 19 && player.brick != 0) {
      player.unknownLost -= player.brick;
      player.brick = 0;
    }
    if (bankResources.sheep === 19 && player.sheep != 0) {
      player.unknownLost -= player.sheep;
      player.sheep = 0;
    }
    if (bankResources.wheat === 19 && player.wheat != 0) {
      player.unknownLost -= player.wheat;
      player.wheat = 0;
    }
    if (bankResources.ore === 19 && player.ore != 0) {
      player.unknownLost -= player.ore;
      player.ore = 0;
    }

    // if you have a monopoly of a single resource
    if (player.name !== playerUsername) {
      userPlayer = players.find((you) => you.name === playerUsername);
      if (userPlayer.wood === 19 - bankResources.wood && player.wood != 0) {
        player.unknownLost -= player.wood;
        player.wood = 0;
      }
      if (userPlayer.brick === 19 - bankResources.brick && player.brick != 0) {
        player.unknownLost -= player.brick;
        player.brick = 0;
      }
      if (userPlayer.sheep === 19 - bankResources.sheep && player.sheep != 0) {
        player.unknownLost -= player.sheep;
        player.sheep = 0;
      }
      if (userPlayer.wheat === 19 - bankResources.wheat && player.wheat != 0) {
        player.unknownLost -= player.wheat;
        player.wheat = 0;
      }
      if (userPlayer.ore === 19 - bankResources.ore && player.ore != 0) {
        player.unknownLost -= player.ore;
        player.ore = 0;
      }
    }
  }
}

function getPlayerUsername() {
  let interval = setInterval(() => {
    if (playerUsername.length != 0) {
      clearInterval(interval);
      playerUsername = playerUsername.textContent;
      console.log("Player username detected:", playerUsername);
    } else {
      playerUsername = document.getElementById("header_profile_username");
    }
  }, 500);
}

// render/update table with latest data
function renderTable() {
  // player data table
  playerTHeader = playerTable.createTHead();
  playerTBody = playerTable.createTBody();
  playerTFooter = playerTable.createTFoot();

  playerTable.className = "generic-table";
  playerTHeader.className = "generic-table-header";
  playerTBody.className = "generic-table-body";
  playerTFooter.className = "generic-table-footer";

  playerTHeader.innerHTML = `<td class="player-name"></td><td class="wood">Wood</td><td class="brick">Brick</td><td class="sheep">Sheep</td><td class="wheat">Wheat</td><td class="ore">Ore</td><td class="unknown">Stolen / Lost (?)</td><td class="hand-size">Hand</td><td class="structure">Roads</td><td class="structure">Settlements</td><td class="structure">Cities</td>`;

  for (let i = playerTable.rows.length - 1; i > 0; i--) {
    playerTable.deleteRow(i);
  }

  for (player of players) {
    playerTBodyRow = playerTBody.insertRow();
    playerTBodyRow.innerHTML = `<td class="player-name" style="color:${player.color}">${player.name}</td><td class="wood">${player.wood}</td><td class="brick">${player.brick}</td><td class="sheep">${player.sheep}</td><td class="wheat">${player.wheat}</td><td class="ore">${player.ore}</td><td class="unknown">+${player.unknownStolen} / -${player.unknownLost}</td><td class="hand-size">${player.wood + player.brick + player.sheep + player.wheat + player.ore + player.unknownStolen - player.unknownLost}</td><td class="structure">${player.roads}</td><td class="structure">${player.settlements}</td><td class="structure">${player.cities}</td>`;
  }

  body.appendChild(playerTable);

  // bank resource table
  bankTHeader = bankTable.createTHead();
  bankTBody = bankTable.createTBody();
  bankTFooter = bankTable.createTFoot();

  bankTable.className = "bank-table";
  bankTHeader.className = "generic-table-header";
  bankTBody.className = "generic-table-body";
  bankTFooter.className = "generic-table-footer";

  for (let i = bankTable.rows.length - 1; i > 0; i--) {
    bankTable.deleteRow(i);
  }

  bankTHeader.innerHTML = `<td bank-name"></td><td class="wood">Wood</td><td class="brick">Brick</td><td class="sheep">Sheep</td><td class="wheat">Wheat</td><td class="ore">Ore</td><td class="dev-cards">Dev Cards</td>`;
  bankTBodyRow = bankTBody.insertRow();
  bankTBodyRow.innerHTML = `<td class="bank-name">Bank</td><td class="wood">${bankResources.wood}</td><td class="brick">${bankResources.brick}</td><td class="sheep">${bankResources.sheep}</td><td class="wheat">${bankResources.wheat}</td><td class="ore">${bankResources.ore}</td><td class="dev-cards">${bankResources.devCards}</td>`;
  bankTBodyRow = bankTBody.insertRow();
  bankTBodyRow.innerHTML = `<td class="bank-name">In Play</td><td class="wood">${
    19 - bankResources.wood
  }</td><td class="brick">${19 - bankResources.brick}</td><td class="sheep">${
    19 - bankResources.sheep
  }</td><td class="wheat">${19 - bankResources.wheat}</td><td class="ore">${
    19 - bankResources.ore
  }</td><td class="dev-cards">${25 - bankResources.devCards}</td>`;

  body.appendChild(bankTable);
}

module.exports = { sanitizeEventText };
