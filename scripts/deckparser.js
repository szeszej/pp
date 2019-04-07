matchLines = /.+/g; //regex, który dzieli mi decklistę na linijki
cardName = /\s.+/; //regex, który znajduje mi nazwę karty
commanderTest = /CMDR/; //regex, który znajduje mi commandera

var deckLines = deckList.match(matchLines).map(a => a.trim()); //dzielę decklistę na linijki i każdą linijkę zapisuję jako jeden item w tablicy, dodatkowo usuwam whitespace
var cardNumbers = deckLines.map(a => parseInt(a)); //jako że liczba danej karty jest zawsze na początku, mogę w ten sposób wydzielić ilość danej karty
var cardNames = deckLines //znajduję same nazwy kart i usuwam whitespace
  .map(a => a.match(cardName))
  .flat()
  .map(a => a.trim());

var deck = []; //tablica obiektów, każdy obiekt to jedna karta

cardNumbers.map(function(item, index) { //dodaję po kolei karty do decku
  if (commanderTest.test(cardNames[index]) == true) { //sprawdzam czy karta jest oznaczona jako commander i usuwam oznaczenie commandera z nazwy
    deck.push({
      quantity: item,
      name: cardNames[index].slice(0, -7),
      commander: true
    });
  } else { //w pozostałych przypadkach po prostu dodaję kartę z właściwościami ilość i nazwa
    deck.push({
      quantity: item,
      name: cardNames[index],
      commander: false
    });
  }
});

var apiRequestUrl = [`https://api.scryfall.com/cards/search?q=`, `https://api.scryfall.com/cards/search?q=`]; //początek URLa do zapytania do API
function createApiRequestURL() { //funkcja, która tworzy URL zapytania do API z listą kart w talii
  deck.forEach(function(item) {
    if (apiRequestUrl[0].length < 1024) { //niestety długość requesta jest limitowana, więc jak jest dużo kart, to trzeba dwóch :)
      apiRequestUrl[0] += `!"` + item.name + `"or`;
    } else {
      apiRequestUrl[1] += `!"` + item.name + `"or`;
    }
  })
};
createApiRequestURL();

var returnedCards = [];
var wrapperSidebar = document.querySelector(".wrappersidebar"); //znajdujemy wrapper do dodawania podglądu kart
var decklistBox = document.getElementById("decklistbox");
var listOfCards = document.createElement("ul");
listOfCards.setAttribute("class", "deck");
decklistBox.appendChild(listOfCards);

let request = new XMLHttpRequest(); //zapytanie do API
request.open(
  "GET",
  apiRequestUrl[0], //pierwszy URL wygenerowany wyżej
  true
);
request.send();
request.onload = function() { //kiedy mamy dane, to robimy rzeczy
  var data = JSON.parse(this.response);
  if (request.status >= 200 && request.status < 400) {
    returnedCards = returnedCards.concat(data.data); //podpisujemy pobrane dane o kartach pod zmienną
    if (apiRequestUrl[1].length > 40) { //jeśli trzeba było stworzyć drugi URL, to trzeba zrobić drugie zapytanie z drugim URLem
      let request2 = new XMLHttpRequest(); // drugie zapytanie do API
      request2.open(
        "GET",
        apiRequestUrl[1], // drugi URL wygenerowany wyżej
        true
      );
      request2.send();
      request2.onload = function() { //kiedy mamy dane, to robimy rzeczy
        var data = JSON.parse(this.response);
        if (request2.status >= 200 && request.status < 400) {
          returnedCards = returnedCards.concat(data.data); //podpisujemy pobrane dane o kartach pod zmienną
          updateDeckData(); //dodajemy pobrane dane do obiektów w decku
          createDeck(); //tworzymy deck na stronie
          addLinksAndPreviews(); //do kart w decku dodajemy linki i obrazki
        } else {
          console.log("error"); //jak się request nie powiedzie, to zwraca błąd
        }
      };
    } else {
      updateDeckData(); //dodajemy pobrane dane do obiektów w decku
      createDeck(); //tworzymy deck na stronie
      addLinksAndPreviews(); //do kart w decku dodajemy linki i obrazki
    }
  } else {
    console.log("error"); //jak się request nie powiedzie, to zwraca błąd
  }
};

function updateDeckData() { //funkcja która dodaje właściwości z listy pobranej przez API do kart w decku
  deck.forEach(function(card) {
    returnedCards.forEach(function(returnedCard) {
      if (returnedCard.name == card.name) {
        card.type = returnedCard.type_line; //na razie potrzebujemy tylko typu
      }
    })
  })
};

function createDeck() { //funkcja która tworzy widoczną na stronie talię
  function constructListsByType(name, list) { //konstruktor, który tworzy listy kart po typie
    this.name = name;
    this.list = list;
  }
  //poniżej regexy potrzebne do filtrowania
  let landRegex = /Land/;
  let creatureRegex = /Creature/;
  let artifactRegex = /Artifact/;
  let enchantmentRegex = /Enchantment/;
  let planeswalkerRegex = /Planeswalker/;
  let instantRegex = /Instant/;
  let sorceryRegex = /Sorcery/;
  //poniżej tworzymy obiekty z listą kart o danym typie i nazwą listy
  let commander = new constructListsByType("Commander", deck.filter(card => card.commander == true));
  let lands = new constructListsByType("Lands", deck.filter(card => landRegex.test(card.type) == true));
  let creatures = new constructListsByType("Creatures", deck.filter(card => creatureRegex.test(card.type) == true && card.commander == false && landRegex.test(card.type) == false));
  let artifacts = new constructListsByType("Artifacts", deck.filter(card => artifactRegex.test(card.type) == true && creatureRegex.test(card.type) == false));
  let enchantments = new constructListsByType("Enchantments", deck.filter(card => enchantmentRegex.test(card.type) == true && creatureRegex.test(card.type) == false))
  let planeswalkers = new constructListsByType("Planeswalkers", deck.filter(card => planeswalkerRegex.test(card.type) == true && card.commander == false));
  let instants = new constructListsByType("Instants", deck.filter(card => instantRegex.test(card.type) == true));
  let sorceries = new constructListsByType("Sorceries", deck.filter(card => sorceryRegex.test(card.type) == true));
  //poniżej tworzymy podlisty kart do wyświetlania na stronie. używam call, ponieważ w przyszłości będę chciał grupować karty po innych właściwościach, np. kolorze
  createListByProperty.call(commander);
  createListByProperty.call(lands);
  createListByProperty.call(creatures);
  createListByProperty.call(artifacts);
  createListByProperty.call(enchantments);
  createListByProperty.call(planeswalkers);
  createListByProperty.call(instants);
  createListByProperty.call(sorceries);
};

function createListByProperty() { //funkcja, która tworzy podlisty kart do wyświetlania na stronie
  if (this.list.length > 0) { //chcemy dodać podlistę tylko wtedy, kiedy jest niepusta
    let listName = document.createElement("li"); //box na nazwę podlisty
    listName.innerHTML = this.name + ` (` + this.list.reduce((total, item) => total + item.quantity, 0) + `)`; //oprócz nazwy chcę mieć jeszcze info, ile kart zawiera dana podlista
    let listByType = document.createElement("ul"); //właściwa podlista kart
    this.list.forEach(function (item) { //tworzymy podlistę kart poprzez dodanie ilości danej karty + jej nazwy
      let cardInList = document.createElement("li");
      cardInList.innerHTML = item.quantity + "x " + `<a class="mtgcard" href="">` + item.name + `</a>`;
      listByType.appendChild(cardInList)
    });
    listName.appendChild(listByType); //dodajemy nazwę podlisty do głównej listy
    listOfCards.appendChild(listName); //dodajemy podlistę do jej nazwy
  };
};

function addLinksAndPreviews() { //funkcja, która dodaje linki i podglądy do kart
  let cardLinks = document.getElementsByClassName("mtgcard"); //sprawdzamy listę kart na stronie
  for (let i = 0; i < cardLinks.length; i++) {
    getCardImage(cardLinks[i], cardLinks[i].textContent); //tworzymy podgląd kart przy najechaniu na kartę
    cardLinks[i].setAttribute("href", `http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=` + checkMultiverseId(cardLinks[i].textContent));
    cardLinks[i].setAttribute("target", "_blank"); //tworzymy link do gatherera dla każdej karty
  };
};

function checkMultiverseId(cardName) { //funkcja, która sprawdza multiverseid danej karty
  let multiverseId = ""
  returnedCards.forEach(function(item) {
    if (item.name == cardName) {
      multiverseId = item.multiverse_ids[0];
    } else if (item.hasOwnProperty("card_faces") == true) { //czasami karta ma dwie połówki albo drugą stronę - wtedy chcemy multiverse id pierwszej
      if (item.card_faces[0].name == cardName) {
        multiverseId = item.multiverse_ids[0];
      }
    }
  });
  return multiverseId;
};

function getCardImage(cardLink, cardName) { //funkcja, która tworzy divy z podglądem kart po najechaniu na nie i usuwa je po odjechaniu z nich :)
  let cardPreview = document.createElement("div");
  cardPreview.setAttribute("class", "cardpreview");
  cardPreview.innerHTML = `<img src="http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=` + checkMultiverseId(cardName) + `&type=card">`;
  cardLink.addEventListener("mouseenter", function() {
    let cardLocation = cardLink.getBoundingClientRect(); //sprawdzamy koordynaty relatywne do viewportu
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop; //sprawdzamy przesunięcie viewportu w dół
    let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft; //sprawdzamy przesunięcie viewportu w lewo
    cardPreview.style.left = cardLocation.width + cardLocation.left + scrollLeft + 7 + "px"; //pozycjonujemy podgląd od lewej
    cardPreview.style.top = cardLocation.top + scrollTop - 3 + "px"; //pozycjonujemy podgląd od góry
    wrapperSidebar.appendChild(cardPreview);
  });
  cardLink.addEventListener("mouseleave", function() {
    wrapperSidebar.removeChild(cardPreview);
  });
};
