const players = [
  // Tabela graczy
  {
    "name": "Magdalena Sośnierz", //imię
    "zydelion": 10, //ilość wygranych dni
    "commander": [ //nazwa generała plus ilość wygranych gier danym generałem
      ["Ticket To Ride", 1],
      ["Catan", 2],
    ]
  },
  {
    "name": "Placeholder",
    "zydelion": 3,
    "commander": [
      ["Game of Thrones", 3],
    ]
  },
  {
    "name": "Placeholder",
    "zydelion": 1,
    "commander": [
      ["Ticket To Ride", 1],
    ]
  },
  {
    "name": "Placeholder",
    "zydelion": 1,
    "commander": [
      ["Ticket To Ride", 1],
    ]
  },
  {
    "name": "Placeholder",
    "zydelion": 1,
    "commander": [
      ["Ticket To Ride", 1],
    ]
  }
];

var sortedPlayers = sortPlayers(players); //sortujemy graczy po ilości wygranych zydelionów i commanderów po ilości wygranych gier

function sortPlayers(unsortedPlayers) {
  let playersToSort = [...unsortedPlayers];
  playersToSort.sort((a, b) => b.zydelion - a.zydelion);
  playersToSort.forEach(function(item) {
    item.commander.sort((a, b) => b[1] - a[1])
  })
  return playersToSort;
}

function rankPlayers(playersToRank) {
  let unrankedPlayers = [...playersToRank];
  let rankedPlayers = [];
  unrankedPlayers.reduce(function(prev, item, index) {
    if (index == 1) {
      prev.rank = 1; //pierwszy na liście ma zawsze 1 miejsce
      rankedPlayers.push(prev);
      if (item.zydelion == prev.zydelion) {
        item.rank = prev.rank; //jak kolejny ma tyle samo zydelionów, to ma być ta sama liczba
        rankedPlayers.push(item);
      } else if (item.zydelion < prev.zydelion) {
        item.rank = prev.rank + 1; //jak kolejny ma mniej zydelionów, to zwiększamy miejsce
        rankedPlayers.push(item)
      }
    } else if (item.zydelion == prev.zydelion) {
      item.rank = prev.rank; //jak kolejny ma tyle samo zydelionów, to ma być ta sama liczba
      rankedPlayers.push(item);
    } else if (item.zydelion < prev.zydelion) {
      item.rank = prev.rank + 1; //jak kolejny ma mniej zydelionów, to zwiększamy miejsce
      rankedPlayers.push(item);
    }
    return item;
  })
  return rankedPlayers;
}

var rankedPlayers = rankPlayers(sortedPlayers);

function inflection(num) {
  //funckja która odmienia mi słówka "wygrana"
  if (num == 1) {
    return ` wygrany mecz `;
  } else if (num > 1 && num <= 4) {
    return ` wygrane mecze `;
  } else {
    return ` wygranych meczów `;
  }
}

var winsPerCommander = commandersArray => commandersArray.map(a => a[1]); //funkcja, która wycina mi same ilości wygranych każdego commandera

function totalWin(playerNumber, players) {
  let sumOfWins = winsPerCommander(players[playerNumber].commander);
  return sumOfWins.reduce((a, b) => a + b, 0); // funkcja, która podaje mi łączną liczbę wygranych meczy danego gracza
}

function createCommanderInfo(commandersArray, totalWins) {
  //funkcja, która tworzy linijki w liście rozwijanej commanderów
  let commanderBox = document.createElement("div"); //tworzymy diva z listą rozwijaną commnaderów
  commanderBox.setAttribute("class", "info");
  commandersArray.map(function(item) {
    let winsLineBox = document.createElement("div"); //tworzymy diva z pojedynczą linią w liście
    winsLineBox.setAttribute("class", "winsline");
    let commanderNameBox = document.createElement("div"); //tworzymy diva z nazwą danego commandera
    commanderNameBox.setAttribute("class", "cmdname");
    if (Array.isArray(item[0]) == true) {
      commanderNameBox.innerHTML = `<p><a href="" class="mtgcard">${item[0][0]}</a></p>
      <p><a href="" class="mtgcard">${item[0][1]}</a></p>`;
    } else {
      commanderNameBox.innerHTML = `<p><a href="" class="mtgcard">${item[0]}</a></p>`;
    }
    winsLineBox.appendChild(commanderNameBox);
    let winsNumberBox = document.createElement("div"); //tworzymy diva z ilością winów danego commandera
    winsNumberBox.setAttribute("class", "wins");
    winsNumberBox.innerHTML = `<p>${item[1]} ${inflection(item[1])} <span>(${(Math.round(item[1] / totalWins * 1000) / 10)}%)</span></p>`;
    winsLineBox.appendChild(winsNumberBox);
    commanderBox.appendChild(winsLineBox);
  });
  return commanderBox;
};

const zydImg = `<img src="./resources/images/Krzesełko.png" alt="zydelion">`; //kod obrazka
var createZydelionImages = zydNum =>
  zydNum <= 3 ? zydImg.repeat(zydNum) : `<p>` + zydNum + `x</p>` + zydImg; //funkcja która liczy, ile ma być obrazków - jak mało to tyle obrazków, jak dużo to liczba i obrazek

function createRanking(players) {
  let playersForRanking = [...players];
  let fullRanking = document.getElementById("ranklist"); //właściwy ranking
  let rankBoxes = document.createDocumentFragment(); //fragment do złożenia pełnego rankingu w całość
  playersForRanking.map(function(item, index) {
    let rankBox = document.createElement("div"); //konfigurujemy pojedynczy div rankingu
    rankBox.setAttribute("class", "rank");
    let numberBox = document.createElement("div"); //dodajemy div z numerem miejsca
    numberBox.setAttribute("class", "number");
    numberBox.innerHTML = `<p>${item.rank}</p>`;
    rankBox.appendChild(numberBox);
    let nameBox = document.createElement("div"); //dodajemy div z imieniem gracza
    nameBox.setAttribute("class", "name");
    nameBox.innerHTML = `<div><p>${playersForRanking[index].name}</p></div>`;
    let zydelionBox = document.createElement("div"); //do diva z imieniem dodajemy div z obrazkami zydeliona
    zydelionBox.setAttribute("class", "zydnum");
    zydelionBox.innerHTML = `${createZydelionImages(playersForRanking[index].zydelion)}`;
    nameBox.appendChild(zydelionBox);
    rankBox.appendChild(nameBox);
    let expandBox = document.createElement("button"); //dodajemy przycisk do rozwijania listy rozwijanej commanderów
    expandBox.setAttribute("class", "collapsible");
    expandBox.innerHTML = '<p class="expand">▼</p>';
    rankBox.appendChild(expandBox);
    rankBox.appendChild(createCommanderInfo(players[index].commander, totalWin(index, playersForRanking))); //dodajemy rozwijaną listę commanderów
    rankBoxes.appendChild(rankBox); //wszystko wsadzamy w ranking
  });
  fullRanking.appendChild(rankBoxes); //dodajemy fragment zawierający pełny ranking do własciwego rankingu (performance!)
}
createRanking(rankedPlayers);

var collapsible = document.getElementsByClassName("collapsible"); //kod listy rozwijanej
for (let i = 0; i < collapsible.length; i++) {
  collapsible[i].addEventListener("click", function() {
    let activeCollapsible = document.querySelector(".active");
    if (activeCollapsible !== null && activeCollapsible != this) { //resetujemy już rozwiniętą listę (żeby tylko 1 była rozwinięta na raz)
      activeCollapsible.nextElementSibling.style.display = "none";
      activeCollapsible.firstElementChild.textContent = "▼";
      activeCollapsible.classList.remove("active");
    }
    let content = this.nextElementSibling;
    if (content.style.display === "flex") { //jeśli lista jest rozwinięta to zwijamy
      content.style.display = "none";
      this.firstElementChild.textContent = "▼";
      this.classList.remove("active");
    } else { // jeśli lista jest zwinięta, to rozwijamy
      content.style.display = "flex";
      this.firstElementChild.textContent = "▲";
      this.classList.add("active");
    }
  });
};
