//to do: animacja rozwijania??, zmienić stringi na .createElement() etc

const PLAYERS = [
  // Tabela graczy
  {
    name: "Bartosz Kłak", //imię
    zydelion: 3, //ilość wygranych dni
    commander: [
      //nazwa generała plus ilość wygranych gier danym generałem
      ["Riku of Two Reflections", 2],
      ["Muldrotha, the Gravetide", 3],
      ["Breya, Etherium Shaper", 2]
    ]
  },
  {
    name: "Mateusz Kobielski",
    zydelion: 3,
    commander: [
      ["Cromat", 4],
      ["Rafiq of the Many", 1],
      ["The Locust God", 1],
      ["Atraxa, Praetors' Voice", 1]
    ]
  },
  {
    name: "Waldemar Piekarz",
    zydelion: 3,
    commander: [
      ["Thrasios, Triton Hero<br>Ikra Shidiqi, the Usurper", 5], //podwójny generał
      ["Lord Windgrace", 3]
    ]
  },
  {
    name: "Krzysztof Brygała",
    zydelion: 2,
    commander: [
      ["The Gitrog Monster ", 1],
      ["Rashmi, Eternities Crafter ", 1],
      ["Inalla, Archmage Ritualist", 2]
    ]
  },
  {
    name: "Sebastian Piłat",
    zydelion: 2,
    commander: [
      ["Jeleva, Nephalia's Scourge", 6]
    ]
  },
  {
    name: "Eryk Małecki",
    zydelion: 2,
    commander: [
      ["Grand Arbiter Augustin IV", 1],
      ["Anafenza, the Foremost", 3]
    ]
  },
  {
    name: "Jakub Grela",
    zydelion: 2,
    commander: [
      ["Derevi, Empyrial Tactician", 5],
      ["Nicol Bolas, the Ravager", 1]
    ]
  },
  {
    name: "Krzysztof Guz",
    zydelion: 1,
    commander: [
      ["Karlov of the Ghost Council", 3]
    ]
  },
  {
    name: "Jarosław Mroziński",
    zydelion: 1,
    commander: [
      ["Brago, King Eternal", 2]
    ]
  },
  {
    name: "Michał Kowalczyk",
    zydelion: 1,
    commander: [
      ["Thrasios, Triton Hero<br>Tymna the Weaver", 4]
    ]
  }
];

const SORTED_PLAYERS = PLAYERS.sort((a, b) => b.zydelion - a.zydelion); //sortujemy graczy po ilości wygranych zydelionów

function inflection(num) {
  //funckja która odmienia mi słówka "wygrana"
  if (num == 1) {
    return ` wygrany mecz `;
  } else if (num > 1 && num <= 4) {
    return ` wygrane mecze `;
  } else {
    return ` wygranych meczy `;
  }
}

function playerCommanders(playerNumber) {
  return SORTED_PLAYERS[playerNumber].commander;
} // funkcja która zwraca samą podtablicę commanderów danego gracza

const COMMANDER_WINS = commandersArray => commandersArray.map(a => a[1]); //funkcja, która wycina mi same ilości wygranych każdego commandera

function totalWin(playerNumber) {
  let sumOfWins = COMMANDER_WINS(playerCommanders(playerNumber));
  return sumOfWins.reduce((a, b) => a + b, 0); // funkcja, która podaje mi łączną liczbę wygranych meczy danego gracza
}

const CMD_INFO = function(commandersArray, totalWins) {
  //funkcja, która tworzy linijki w liście rozwijanej commanderów
  let commanderBox = document.createElement("div"); //tworzymy diva z listą rozwijaną commnaderów
  commanderBox.setAttribute("class", "info");
  commandersArray.map(function (item) {
    let winsLineBox = document.createElement("div"); //tworzymy diva z pojedynczą linią w liście
    winsLineBox.setAttribute("class", "winsline");
    let commanderNameBox = document.createElement("div"); //tworzymy diva z nazwą danego commandera
    commanderNameBox.setAttribute("class", "cmdname");
    commanderNameBox.innerHTML = `<p>${item[0]}</p>`;
    winsLineBox.appendChild(commanderNameBox);
    let winsNumberBox = document.createElement("div"); //tworzymy diva z ilością winów danego commandera
    winsNumberBox.setAttribute("class", "wins");
    winsNumberBox.innerHTML = `<p>${item[1]} ${inflection(item[1])} <span>(${Math.round(item[1] / totalWins * 100)}%)</span></p>`;
    winsLineBox.appendChild(winsNumberBox);
    commanderBox.appendChild(winsLineBox);
  });
  return commanderBox;
};

let zydImg = `<img src="./resources/images/Krzesełko.png" alt="zydelion">`; //kod obrazka
const ZYD_IMG = zydNum =>
  zydNum <= 3 ? zydImg.repeat(zydNum) : `<p>` + zydNum + `x</p>` + zydImg; //funkcja która liczy, ile ma być obrazków - jak mało to tyle obrazków, jak dużo to liczba i obrazek

const TIE = function() {
  // jeśli gracze mają tyle samo zydelionów, to chcemy żeby mieli to samo miejsce w rankingu
  let rankCounter = 1;
  let rankIfTie = [];
  SORTED_PLAYERS.forEach(function(item, index, arr) {
    if (index === 0) {
      rankIfTie.push(1); //pierwszy na liście ma zawsze 1 miejsce
    } else if (item.zydelion == arr[index - 1].zydelion) {
      rankIfTie.push(rankCounter); //jak kolejny ma tyle samo zydelionów, to ma być ta sama liczba
    } else if (item.zydelion < arr[index - 1].zydelion) {
      rankCounter++; //jak kolejny ma mniej zydelionów, to zwiększamy miejsce
      rankIfTie.push(rankCounter);
    }
  });
  return rankIfTie;
};

var fullRanking = document.getElementById("ranklist"); //właściwy ranking
var rankBoxes = document.createDocumentFragment(); //fragment do złożenia pełnego rankingu w całość
SORTED_PLAYERS.map(function(item, index) {
  let rankBox = document.createElement("div"); //konfigurujemy pojedynczy div rankingu
  rankBox.setAttribute("class", "rank");
  let numberBox = document.createElement("div"); //dodajemy div z numerem miejsca
  numberBox.setAttribute("class", "number");
  numberBox.innerHTML = `<p>${TIE()[index]}</p>`;
  rankBox.appendChild(numberBox);
  let nameBox = document.createElement("div"); //dodajemy div z imieniem gracza
  nameBox.setAttribute("class", "name");
  nameBox.innerHTML = `<div><p>${SORTED_PLAYERS[index].name}</p></div>`;
  let zydelionBox = document.createElement("div"); //do diva z imieniem dodajemy div z obrazkami zydeliona
  zydelionBox.setAttribute("class", "zydnum");
  zydelionBox.innerHTML = `${ZYD_IMG(SORTED_PLAYERS[index].zydelion)}`;
  nameBox.appendChild(zydelionBox);
  rankBox.appendChild(nameBox);
  let expandBox = document.createElement("button"); //dodajemy przycisk do rozwijania listy rozwijanej commanderów
  expandBox.setAttribute("class", "collapsible");
  expandBox.innerHTML = '<p class="expand">▼</p>';
  rankBox.appendChild(expandBox);
  rankBox.appendChild(CMD_INFO(playerCommanders(index), totalWin(index))); //dodajemy rozwijaną listę commanderów
  rankBoxes.appendChild(rankBox); //wszystko wsadzamy w ranking
});
fullRanking.appendChild(rankBoxes); //dodajemy fragment zawierający pełny ranking do własciwego rankingu (performance!)

// zrefaktoryzować poniżej żeby odwoływało się do jednej oddzielnej funkcji. stwrzyć funkcję, która zamiast this będzie używała event.target

var coll = document.getElementsByClassName("collapsible"); //kod listy rozwijanej
for (let i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
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
}
