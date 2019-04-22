//https://disqus.com/ jako system komentarzy?

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

function getExtraCards () {
  let cardLinks = document.getElementsByClassName("mtgcard"); //lista wszystkich kart na stronie
  let extraCards = [];
  for (let i = 0; i < cardLinks.length; i++) {
    if (deck.filter(x => x.name == cardLinks[i].textContent).length == 0) {
      extraCards.push({name: cardLinks[i].textContent});
    }
  }
  return extraCards;
}

function createApiRequestURL(deckForUrl, extraCards) { //funkcja, która tworzy URL zapytania do API z listą kart w talii
  let apiRequestUrl = [`https://api.scryfall.com/cards/search?q=`, `https://api.scryfall.com/cards/search?q=`]; //początek URLa do zapytania do API
  allCardsOnPage = deckForUrl.concat(extraCards);
  allCardsOnPage.forEach(function(item) {
    if (apiRequestUrl[0].length < 1025) { //niestety długość requesta jest limitowana, więc jak jest dużo kart, to trzeba dwóch :)
      apiRequestUrl[0] += `!"` + item.name + `"or`;
    } else {
      apiRequestUrl[1] += `!"` + item.name + `"or`;
    }
  })
  return apiRequestUrl;
};

var returnedCards = [];
var wrapperSidebar = document.querySelector(".wrappersidebar"); //znajdujemy wrapper do dodawania podglądu kart
var decklistBox = document.getElementById("decklistbox");
var listOfCards = document.createElement("ul");
listOfCards.setAttribute("class", "deck");
decklistBox.appendChild(listOfCards);
var loader = document.createElement("div"); //obracające się kółko kiedy lista jeszcze się ładuje
loader.setAttribute("class", "loader");
listOfCards.appendChild(loader);

var currentGrouping = ""; //tutaj przechowuję informację o obecnym grupowaniu kart
var currentSort = ""; //tutaj przechowuję informację o obecnym sortowaniu kart

let request = new XMLHttpRequest(); //zapytanie do API
request.open(
  "GET",
  createApiRequestURL(deck, getExtraCards())[0], //pierwszy URL wygenerowany wyżej
  true
);
request.send();
request.onload = function() { //kiedy mamy dane, to robimy rzeczy
  var data = JSON.parse(this.response);
  if (request.status >= 200 && request.status < 400) {
    returnedCards = returnedCards.concat(data.data); //podpisujemy pobrane dane o kartach pod zmienną
    if (createApiRequestURL(deck, getExtraCards())[1].length > 40) { //jeśli trzeba było stworzyć drugi URL, to trzeba zrobić drugie zapytanie z drugim URLem
      let request2 = new XMLHttpRequest(); // drugie zapytanie do API
      request2.open(
        "GET",
        createApiRequestURL(deck, getExtraCards())[1], // drugi URL wygenerowany wyżej
        true
      );
      request2.send();
      request2.onload = function() { //kiedy mamy dane, to robimy rzeczy
        var data = JSON.parse(this.response);
        if (request2.status >= 200 && request.status < 400) {
          returnedCards = returnedCards.concat(data.data); //podpisujemy pobrane dane o kartach pod zmienną
          updateDeckData(); //dodajemy pobrane dane do obiektów w decku
          createDeck("type"); //tworzymy deck na stronie
          createButtons(); //tworzymy przyciski do grupowania i sortowania
        } else {
          console.log("error"); //jak się request nie powiedzie, to zwraca błąd
        }
      };
    } else {
      updateDeckData(); //dodajemy pobrane dane do obiektów w decku
      createDeck("type"); //tworzymy deck na stronie
      createButtons(); //tworzymy przyciski do grupowania i sortowania
    }
  } else {
    console.log("error"); //jak się request nie powiedzie, to zwraca błąd
  }
};

function updateDeckData() { //funkcja która dodaje właściwości z listy pobranej przez API do kart w decku
  deck.forEach(function(card) {
    returnedCards.forEach(function(returnedCard) {
      if (returnedCard.name == card.name) {
        card.type = returnedCard.type_line; //pobieramy createListByProperty
        card.cmc = returnedCard.cmc; // pobieramy converted mana cost
        if (returnedCard.hasOwnProperty("card_faces") == true) { //czasami karta ma dwie połówki albo drugą stronę - wtedy chcemy multiverse id pierwszej
          card.colors = returnedCard.card_faces[0].colors;
        } else {
          card.colors = returnedCard.colors; //pobieramy kolory
        }
        if (card.commander == true) {
          card.identity = returnedCard.color_identity;
        }
      }
    })
  })
};

function sortDeck(sorting) {
  if (sorting == "name") { //sortowanie po nazwie
    deck = deck.sort(function(a, b) {
      //ignorujemy wielkość liter
      let nameA = a.name.toUpperCase();
      let nameB = b.name.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
    currentSort = "name";
  } else if (sorting == "cmc") { //sortowanie po cmc
    deck = deck.sort((a, b) => a.cmc - b.cmc);
    currentSort = "cmc";
  } else if (sorting == "type") { //sortowanie po typie
    deck = deck.sort(function(a, b) {
      //ignorujemy wielkość liter
      let typeA = a.type.toUpperCase();
      let typeB = b.type.toUpperCase();
      if (typeA < typeB) {
        return -1;
      }
      if (typeA > typeB) {
        return 1;
      }
      return 0;
    });
    currentSort = "type";
  }
};

function createDeck(grouping) { //funkcja która tworzy widoczną na stronie talię
  let filteredCards = [];
  if (grouping == "type") {
    //poniżej regexy potrzebne do filtrowania
    let landRegex = /Land/;
    let creatureRegex = /Creature/;
    let artifactRegex = /Artifact/;
    let enchantmentRegex = /Enchantment/;
    let planeswalkerRegex = /Planeswalker/;
    let instantRegex = /Instant/;
    let sorceryRegex = /Sorcery/;
    //poniżej tworzymy obiekty z listą kart o danym typie i nazwą listy
    let commander = new constructListsByProperty("Commander", deck.filter(card => card.commander == true));
    filteredCards.push(commander);
    let lands = new constructListsByProperty("Lands", deck.filter(card => landRegex.test(card.type) == true));
    filteredCards.push(lands);
    let creatures = new constructListsByProperty("Creatures", deck.filter(card => creatureRegex.test(card.type) == true && card.commander == false && landRegex.test(card.type) == false));
    filteredCards.push(creatures);
    let artifacts = new constructListsByProperty("Artifacts", deck.filter(card => artifactRegex.test(card.type) == true && creatureRegex.test(card.type) == false));
    filteredCards.push(artifacts);
    let enchantments = new constructListsByProperty("Enchantments", deck.filter(card => enchantmentRegex.test(card.type) == true && creatureRegex.test(card.type) == false));
    filteredCards.push(enchantments);
    let planeswalkers = new constructListsByProperty("Planeswalkers", deck.filter(card => planeswalkerRegex.test(card.type) == true && card.commander == false));
    filteredCards.push(planeswalkers);
    let instants = new constructListsByProperty("Instants", deck.filter(card => instantRegex.test(card.type) == true));
    filteredCards.push(instants);
    let sorceries = new constructListsByProperty("Sorceries", deck.filter(card => sorceryRegex.test(card.type) == true));
    filteredCards.push(sorceries);
    currentGrouping = "type";
  } else if (grouping == "cmc") {
    //poniżej tworzymy obiekty z listą kart o danym cmc i nazwą listy
    let commander = new constructListsByProperty("Commander", deck.filter(card => card.commander == true));
    filteredCards.push(commander);
    let cmc0 = new constructListsByProperty("CMC 0", deck.filter(card => card.cmc == 0 && card.commander == false));
    filteredCards.push(cmc0);
    let cmc1 = new constructListsByProperty("CMC 1", deck.filter(card => card.cmc == 1 && card.commander == false));
    filteredCards.push(cmc1);
    let cmc2 = new constructListsByProperty("CMC 2", deck.filter(card => card.cmc == 2 && card.commander == false));
    filteredCards.push(cmc2);
    let cmc3 = new constructListsByProperty("CMC 3", deck.filter(card => card.cmc == 3 && card.commander == false));
    filteredCards.push(cmc3);
    let cmc4 = new constructListsByProperty("CMC 4", deck.filter(card => card.cmc == 4 && card.commander == false));
    filteredCards.push(cmc4);
    let cmc5 = new constructListsByProperty("CMC 5", deck.filter(card => card.cmc == 5 && card.commander == false));
    filteredCards.push(cmc5);
    let cmc6More = new constructListsByProperty("CMC 6+", deck.filter(card => card.cmc > 5 && card.commander == false));
    filteredCards.push(cmc6More);
    currentGrouping = "cmc";
  } else if (grouping == "color") {
    //poniżej tworzymy obiekty z listą kart o danym kolorze i nazwą listy
    let commander = new constructListsByProperty("Commander", deck.filter(card => card.commander == true));
    filteredCards.push(commander);
    let white = new constructListsByProperty("White", deck.filter(card => card.colors.length == 1 && card.colors[0] == "W" && card.commander == false));
    filteredCards.push(white);
    let blue = new constructListsByProperty("Blue", deck.filter(card => card.colors.length == 1 && card.colors[0] == "U" && card.commander == false));
    filteredCards.push(blue);
    let black = new constructListsByProperty("Black", deck.filter(card => card.colors.length == 1 && card.colors[0] == "B" && card.commander == false));
    filteredCards.push(black);
    let red = new constructListsByProperty("Red", deck.filter(card => card.colors.length == 1 && card.colors[0] == "R" && card.commander == false));
    filteredCards.push(red);
    let green = new constructListsByProperty("Green", deck.filter(card => card.colors.length == 1 && card.colors[0] == "G" && card.commander == false));
    filteredCards.push(green);
    let multicolor = new constructListsByProperty("Multicolor", deck.filter(card => card.colors.length > 1 && card.commander == false));
    filteredCards.push(multicolor);
    let colorless = new constructListsByProperty("Colorless", deck.filter(card => card.colors.length == 0 && card.commander == false));
    filteredCards.push(colorless);
    currentGrouping = "color";
  }
  listOfCards.innerHTML = ""; //czyścimy widoczną decklistę
  filteredCards.forEach(item => createListByProperty.call(item)); //tworzymy podlisty kart do wyświetlania na stronie
  addLinksAndPreviews(); //do kart w decku dodajemy linki i obrazki
};

function constructListsByProperty(name, list) { //konstruktor, który tworzy listy kart po typie
  this.name = name;
  this.list = list;
}

function createListByProperty() { //funkcja, która tworzy podlisty kart do wyświetlania na stronie
  if (this.list.length > 0) { //chcemy dodać podlistę tylko wtedy, kiedy jest niepusta
    let listName = document.createElement("li"); //box na nazwę podlisty
    listName.innerHTML = this.name + ` (` + this.list.reduce((total, item) => total + item.quantity, 0) + `)`; //oprócz nazwy chcę mieć jeszcze info, ile kart zawiera dana podlista
    let listByType = document.createElement("ul"); //właściwa podlista kart
    this.list.forEach(function(item) { //tworzymy podlistę kart poprzez dodanie ilości danej karty + jej nazwy
      let cardInList = document.createElement("li");
      // if (item.commander == true) {
      //   cardInList.innerHTML = `<a target="_blank" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=` + item.multiverseId + `">` + `<img src="http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=` + item.multiverseId + `&type=card"></a>`;
      // } else {
      cardInList.innerHTML = item.quantity + "x " + `<a class="mtgcard" href="">` + item.name + `</a>`;
      // };
      listByType.appendChild(cardInList)
    });
    listName.appendChild(listByType); //dodajemy nazwę podlisty do głównej listy
    listOfCards.appendChild(listName); //dodajemy podlistę do jej nazwy
  };
};

function createButtons() {
  //div na przyciski
  let buttons = document.createElement("div");
  buttons.setAttribute("class", "buttons");
  //tworzymy przycisk do grupowania
  let dropdownGroup = document.createElement("div");
  dropdownGroup.setAttribute("class", "dropdown");
  let dropdownGroupButton = document.createElement("button");
  dropdownGroupButton.setAttribute("class", "dropdownbutton");
  dropdownGroupButton.textContent = "Grupuj po...";
  let dropdownGroupButtonContent = document.createElement("div");
  dropdownGroupButtonContent.setAttribute("class", "dropdowncontent");
  let groupByType = document.createElement("p");
  groupByType.textContent = "Typie";
  let groupByCmc = document.createElement("p");
  groupByCmc.textContent = "CMC";
  let groupByColor = document.createElement("p");
  groupByColor.textContent = "Kolorze";
  dropdownGroupButtonContent.appendChild(groupByType);
  dropdownGroupButtonContent.appendChild(groupByCmc);
  dropdownGroupButtonContent.appendChild(groupByColor);
  dropdownGroupButton.appendChild(dropdownGroupButtonContent);
  dropdownGroup.appendChild(dropdownGroupButton);
  buttons.appendChild(dropdownGroup);
  //tworzymy przycisk do sortowania
  let dropdownSort = document.createElement("div");
  dropdownSort.setAttribute("class", "dropdown");
  let dropdownSortButton = document.createElement("button");
  dropdownSortButton.setAttribute("class", "dropdownbutton");
  dropdownSortButton.textContent = "Sortuj po...";
  let dropdownSortButtonContent = document.createElement("div");
  dropdownSortButtonContent.setAttribute("class", "dropdowncontent")
  let sortByName = document.createElement("p");
  sortByName.textContent = "Nazwie";
  let sortByType = document.createElement("p");
  sortByType.textContent = "Typie";
  let sortByCmc = document.createElement("p");
  sortByCmc.textContent = "CMC";
  dropdownSortButtonContent.appendChild(sortByName);
  dropdownSortButtonContent.appendChild(sortByType);
  dropdownSortButtonContent.appendChild(sortByCmc);
  dropdownSortButton.appendChild(dropdownSortButtonContent);
  dropdownSort.appendChild(dropdownSortButton);
  buttons.appendChild(dropdownSort);
  //dodajemy przyciski do listy kart
  decklistBox.insertBefore(buttons, listOfCards);
  //tworzymy eventy do przycisków grupowania
  groupByType.addEventListener("click", function() {
    sortDeck(currentSort);
    createDeck("type");
  });
  groupByCmc.addEventListener("click", function() {
    sortDeck(currentSort);
    createDeck("cmc")
  });
  groupByColor.addEventListener("click", function() {
    sortDeck(currentSort);
    createDeck("color")
  });
  //tworzymy eventy do przycisków sortowania
  sortByName.addEventListener("click", function() {
    sortDeck("name");
    createDeck(currentGrouping);
  });
  sortByCmc.addEventListener("click", function() {
    sortDeck("cmc");
    createDeck(currentGrouping);
  });
  sortByType.addEventListener("click", function() {
    sortDeck("type");
    createDeck(currentGrouping);
  });
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
  returnedCards.forEach(function(item) {
    if (item.name == cardName) {
      multiverseId = item.multiverse_ids[0];
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
