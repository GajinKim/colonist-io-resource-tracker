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

let knownEvents = [];
let knownEventsLength = 0;

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

    for (let i = 0; i < ads.length; i++) {
      ads[i].style.display = "none";
    }
  }, 500);
}

function updateKnownEvents() {
  setInterval(() => {
    lastestEvents = [...document.getElementsByClassName("message_post")]; // complete list of events
    newEvents = lastestEvents.splice(knownEventsLength); // list of new events

    for (let i = 0; i < newEvents.length; i++) {
      let event = newEvents[i].innerHTML;

      // convert resources defined as <img> tags into their plain text form
      event = event.replaceAll(
        `<img src=\"/dist/images/card_lumber.svg?v153\" alt=\"lumber\" height=\"20\" width=\"14.25\" class=\"lobby-chat-text-icon\">`,
        "WOOD "
      );
      event = event.replaceAll(
        `<img src=\"/dist/images/card_brick.svg?v153\" alt=\"brick\" height=\"20\" width=\"14.25\" class=\"lobby-chat-text-icon\">`,
        "BRICK "
      );
      event = event.replaceAll(
        `<img src=\"/dist/images/card_wool.svg?v153\" alt=\"wool\" height=\"20\" width=\"14.25\" class=\"lobby-chat-text-icon\">`,
        "SHEEP "
      );
      event = event.replaceAll(
        `<img src=\"/dist/images/card_grain.svg?v153\" alt=\"grain\" height=\"20\" width=\"14.25\" class=\"lobby-chat-text-icon\">`,
        "WHEAT "
      );
      event = event.replaceAll(
        `<img src=\"/dist/images/card_ore.svg?v153\" alt=\"ore\" height=\"20\" width=\"14.25\" class=\"lobby-chat-text-icon\">`,
        "ORE "
      );
      event = event.replaceAll(
        `<img src=\"/dist/images/card_rescardback.svg?v153\" alt=\"card\" height=\"20\" width=\"14.25\" class=\"lobby-chat-text-icon\">`,
        "UNKNOWN "
      );

      // convert dev cards, roads, settlements, cities
      event = event.replaceAll(
        '<img src="/dist/images/card_devcardback.svg?v153" alt="development card" height="20" width="14.25" class="lobby-chat-text-icon">',
        "DEV_CARD"
      );
      event = event.replaceAll(
        /<img src="\/dist\/images\/road_.*\.svg\?v153" alt="road" height="20" width="20" class="lobby-chat-text-icon">/g,
        "ROAD"
      );
      event = event.replaceAll(
        /<img src="\/dist\/images\/settlement_.*\.svg\?v153" alt="settlement" height="20" width="20" class="lobby-chat-text-icon">/g,
        "SETTLEMENT"
      );
      event = event.replaceAll(
        /<img src="\/dist\/images\/city_.*\.svg\?v153" alt="city" height="20" width="20" class="lobby-chat-text-icon">/g,
        "CITY"
      );

      // dev card pops
      event = event.replaceAll(
        /<a href="#card-description-popup-7">Knight <img src="\/dist\/images\/card_knight\.svg\?v153" alt="card knight" height="20" width="14\.25" class="lobby-chat-text-icon"><\/a>/g,
        "KNIGHT"
      );
      event = event.replaceAll(
        /<a href="#card-description-popup-9">Monopoly <img src="\/dist\/images\/card_monopoly\.svg\?v153" alt="card monopoly" height="20" width="14\.25" class="lobby-chat-text-icon"><\/a>/g,
        "MONOPOLY"
      );
      event = event.replaceAll(
        /<a href="#card-description-popup-10">Road Building <img src="\/dist\/images\/card_roadbuilding\.svg\?v153" alt="card road building" height="20" width="14\.25" class="lobby-chat-text-icon"><\/a>/g,
        "ROAD_BUILDING"
      );
      event = event.replaceAll(
        /<a href="#card-description-popup-11">Year of Plenty <img src="\/dist\/images\/card_yearofplenty\.svg\?v153" alt="card year of plenty" height="20" width="14\.25" class="lobby-chat-text-icon"><\/a>/g,
        "YEAR_OF_PLENTY"
      );

      // dice
      event = event.replaceAll(
        '<img src="/dist/images/dice_1.svg?v153" alt="dice_1" height="20" width="20" class="lobby-chat-text-icon">',
        "1"
      );
      event = event.replaceAll(
        '<img src="/dist/images/dice_2.svg?v153" alt="dice_2" height="20" width="20" class="lobby-chat-text-icon">',
        "2"
      );
      event = event.replaceAll(
        '<img src="/dist/images/dice_3.svg?v153" alt="dice_3" height="20" width="20" class="lobby-chat-text-icon">',
        "3"
      );
      event = event.replaceAll(
        '<img src="/dist/images/dice_4.svg?v153" alt="dice_4" height="20" width="20" class="lobby-chat-text-icon">',
        "4"
      );
      event = event.replaceAll(
        '<img src="/dist/images/dice_5.svg?v153" alt="dice_5" height="20" width="20" class="lobby-chat-text-icon">',
        "5"
      );
      event = event.replaceAll(
        '<img src="/dist/images/dice_6.svg?v153" alt="dice_6" height="20" width="20" class="lobby-chat-text-icon">',
        "6"
      );

      // remove any remaining <img> tags (e.g. icon text)
      event = event.replace(/<img[\s\S]*?>/g, "");

      // remove any multiple spaces with single spaces
      event = event.replace(/[ \t]{2,}/g, " ");

      knownEvents.push(event.trim()); // sanitized log
    }

    // process each event
    while (knownEvents.length != knownEventsLength) {
      latestEvent = knownEvents[knownEventsLength];
      console.log(knownEventsLength + ":", latestEvent); // console log latest event

      processEvent(latestEvent); // update resource counters

      knownEventsLength++;

      //   if (knownEventsLength % 5 == 0) {
      //     console.log(knownEvents);
      //   }
    }
  }, 1000);
}

function processEvent(event) {
  if (event.includes("received starting resources:")) {
    addNewPlayer(event);
  }

  if (event.includes("got:")) {
    gotResource(event);
  }

  if (event.includes("built a")) {
    builtA(event);
  }

  if (event.includes("bought DEV_CARD")) {
    boughtDevCard(event);
  }

  if (event.includes("gave bank:")) {
    gaveBank(event);
  }

  if (event.includes("discarded:")) {
    discarded(event);
  }

  if (event.includes("traded:")) {
    traded(event);
  }

  if (event.includes("stole") && event.includes("from")) {
    stoleFrom(event);
  }

  if (event.match(/.* stole ([0-9]|1[0-9]): .*/g)) {
    monopoly(event);
  }

  if (event.includes("took from bank:")) {
    tookFromBank(event);
  }

  if (event.includes("used ROAD_BUILDING")) {
    placedARoad(event);
  }

  if (players.length != 0) {
    console.log(players);
    renderTable();
    rebalanceUnknowns();
  }
}

function addNewPlayer(event) {
  eventItems = event.replace("received starting resources:", "").split(" ");

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

function gotResource(event) {
  eventItems = event.replace("got:", "").split(" ");
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

function gaveBank(event) {
  eventItems = event.split("and took");
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

function builtA(event) {
  eventItems = event.replace("built a", "").split(" ");
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

function boughtDevCard(event) {
  eventItems = event.replace("bought DEV_CARD", "").split(" ");
  currentPlayer = players.find((player) => player.name === eventItems[0]);

  currentPlayer.sheep -= 1;
  currentPlayer.wheat -= 1;
  currentPlayer.ore -= 1;
  bankResources.sheep += 1;
  bankResources.wheat += 1;
  bankResources.ore += 1;

  bankResources.devCards -= 1;
}

function discarded(event) {
  eventItems = event.replace("discarded:", "").split(" ");
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

function traded(event) {
  // player1 traded: BRICK BRICK for: ORE ORE with: player2
  eventItems = event.split("traded:");

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

  console.log(tradeInitiator, "is losing", tradeInitiatorResources);
  console.log(tradeAccepter, "is losing", tradeAccepterResources);

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

function stoleFrom(event) {
  eventItems = event.split(" ");

  stealerName = eventItems[0] === "You" ? playerUsername : eventItems[0];
  victimName =
    eventItems[eventItems.length - 1] === "you"
      ? playerUsername
      : eventItems[eventItems.length - 1];

  stealer = players.find((player) => player.name === stealerName);
  victim = players.find((player) => player.name === victimName);

  // depends on whether you know who stole the resource
  if (event.includes("UNKNOWN")) {
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

function monopoly(event) {
  eventItems = event.split(" ");

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

function tookFromBank(event) {
  eventItems = event.split("took from bank:");
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

function placedARoad(event) {
  eventItems = event.split("used ROAD_BUILDING");
  currentPlayer = players.find(
    (player) => player.name === eventItems[0].trim()
  );

    console.log(currentPlayer);
    console.log(eventItems);

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

  playerTHeader.innerHTML = `<td class="player-name"></td><td class="wood">Wood</td><td class="brick">Brick</td><td class="sheep">Sheep</td><td class="wheat">Wheat</td><td class="ore">Ore</td><td class="unknown">Stolen / Lost (?)</td><td class="structure">Roads</td><td class="structure">Settlements</td><td class="structure">Cities</td>`;

  for (let i = playerTable.rows.length - 1; i > 0; i--) {
    playerTable.deleteRow(i);
  }

  for (player of players) {
    playerTBodyRow = playerTBody.insertRow();
    playerTBodyRow.innerHTML = `<td class="player-name">${player.name}</td><td class="wood">${player.wood}</td><td class="brick">${player.brick}</td><td class="sheep">${player.sheep}</td><td class="wheat">${player.wheat}</td><td class="ore">${player.ore}</td><td class="unknown">+${player.unknownStolen} / -${player.unknownLost}</td><td class="structure">${player.roads}</td><td class="structure">${player.settlements}</td><td class="structure">${player.cities}</td>`;
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
