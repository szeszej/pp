//https://disqus.com/ jako system komentarzy?
//przerobić zgodnie z wytycznymi functional programming/clean code
//pozbyć się jakoś globalnych zmiennych currentSort i currentGrouping
//zrobić tak, żeby transformujące się karty pobierały dane także dla obu stron i wyświetlały albo dwa obrazki albo jeden zależnie od tego, która strona karty jest dodana

function parseDecklist(decklist) {
  let matchLines = /.+/g; //regex, który dzieli mi decklistę na linijki
  let cardName = /\s.+/; //regex, który znajduje mi nazwę karty
  let cardLines = decklist.match(matchLines).map(a => a.trim()); //dzielę decklistę na linijki i każdą linijkę zapisuję jako jeden item w tablicy, dodatkowo usuwam whitespace
  let cardQuantities = cardLines.map(a => parseInt(a)); //jako że liczba danej karty jest zawsze na początku, mogę w ten sposób wydzielić ilość danej karty
  let cardNames = cardLines //znajduję same nazwy kart i usuwam whitespace
    .map(a => a.match(cardName))
    .flat()
    .map(a => a.trim());

  let parsedDeck = mergeQuantityAndName(cardQuantities, cardNames); //tablica obiektów, każdy obiekt to jedna karta
  return parsedDeck;
}

function mergeQuantityAndName(quantities, names) {
  let mergedDeck = [];
  let findCommander = /CMDR/; //regex, który znajduje mi commandera
  if (quantities.length == names.length) {
    quantities.map(function(item, index) { //dodaję po kolei karty do decku
      if (findCommander.test(names[index]) == true) { //sprawdzam czy karta jest oznaczona jako commander i usuwam oznaczenie commandera z nazwy
        mergedDeck.push(new Card(names[index].slice(0, -7), item, true));
      } else { //w pozostałych przypadkach po prostu dodaję kartę z właściwościami ilość i nazwa
        mergedDeck.push(new Card(names[index], item, false));
      }
    });
  } else {
    console.log("Parsing error");
  }
  return mergedDeck;
}

function Card(name, quantity, commander) {
  this.name = name;
  this.quantity = quantity;
  this.commander = commander;
}
Card.prototype.multiverseId = "unavailable";

var parsedDecklist = parseDecklist(unparsedDecklist);

function getExtraCards(deck) {
  let cardLinks = document.getElementsByClassName("mtgcard"); //lista wszystkich kart na stronie
  let extraCards = [];
  for (let i = 0; i < cardLinks.length; i++) {
    if (deck.filter(x => x.name == cardLinks[i].textContent).length == 0) {
      extraCards.push(new Card(cardLinks[i].textContent));
    }
  }
  return extraCards;
}

function createApiRequestURL(deckForUrl, extraCards) { //funkcja, która tworzy URL zapytania do API z listą kart w talii
  let apiRequestUrl = [`https://api.scryfall.com/cards/search?q=game:paper (`]; //początek URLa do zapytania do API
  allCardsOnPage = deckForUrl.concat(extraCards);
  let urlIndex = 0;
  allCardsOnPage.forEach(function(item) {
    if (apiRequestUrl[urlIndex].length < 1000) { //niestety długość requesta jest limitowana, więc jak jest dużo kart, to trzeba dwóch :)
      apiRequestUrl[urlIndex] += `!"` + item.name + `"or`;
    } else {
      apiRequestUrl[urlIndex] += ")";
      apiRequestUrl.push(`https://api.scryfall.com/cards/search?q=game:paper (`);
      urlIndex += 1;
      apiRequestUrl[urlIndex] += `!"` + item.name + `"or`;
    }
  })
  apiRequestUrl[apiRequestUrl.length - 1] += ")";
  return apiRequestUrl;
};

function createLoader() {
  let listOfCards = document.querySelector(".deck");
  let loader = document.createElement("div"); //obracające się kółko kiedy lista jeszcze się ładuje
  loader.setAttribute("class", "loader");
  listOfCards.appendChild(loader);
};
createLoader();

var additionalCardData = new Promise(function(resolve, reject) {
  function apiRequest(urls, iteration, cardsReturnedPreviously) {
    let returnedCards = [...cardsReturnedPreviously]
    let request = new XMLHttpRequest(); //zapytanie do API
    request.open(
      "GET",
      urls[iteration], //pierwszy URL wygenerowany wyżej
      true
    );
    request.send();
    request.onload = function() { //kiedy mamy dane, to robimy rzeczy
      var data = JSON.parse(this.response);
      if (request.status >= 200 && request.status < 400) {
        returnedCards = returnedCards.concat(data.data); //podpisujemy pobrane dane o kartach pod zmienną
        iteration += 1;
        if (iteration < urls.length) {
          apiRequest(urls, iteration, returnedCards);
        } else {
          resolve(returnedCards);
        }
      } else {
        reject("error"); //jak się request nie powiedzie, to zwraca błąd
      }
    }
  };
  let apiRequestUrls = createApiRequestURL(parsedDecklist, getExtraCards(parsedDecklist));
  apiRequest(apiRequestUrls, 0, []);
})

additionalCardData.then(function(cardsFromApi) {
  var decklistWithFullData = updateDeckData(parsedDecklist, cardsFromApi);
  var extraCardsWithFullData = updateDeckData(getExtraCards(parsedDecklist), cardsFromApi);
  addLinksAndPreviews(extraCardsWithFullData);
  createDeck(groupDeck(decklistWithFullData, "type"));
  createButtons(decklistWithFullData);
}, function() {
  createDeck(groupDeck(sortDeck(parsedDecklist, "name"), "ugly"));
});

function updateDeckData(listOfCards, returnedCards) { //funkcja która dodaje właściwości z listy pobranej przez API do kart w decku
  deck = [...listOfCards];
  deck.forEach(function(card) {
    returnedCards.forEach(function(returnedCard) {
      if (returnedCard.name == card.name) {
        if (Number.isInteger(returnedCard.multiverse_ids[0]) && returnedCard.hasOwnProperty("multiverse_ids")) {
          card.multiverseId = returnedCard.multiverse_ids[0];
        }
        card.cmc = returnedCard.cmc; // pobieramy converted mana cost
        if (returnedCard.hasOwnProperty("colors") == true) {
          card.colors = returnedCard.colors; //pobieramy kolory
        } else if (returnedCard.hasOwnProperty("card_faces") == true) { //czasami karta ma dwie połówki albo drugą stronę - wtedy chcemy dane pierwszej
          card.colors = returnedCard.card_faces[0].colors;
        };
        if (returnedCard.hasOwnProperty("card_faces") == true) { //czasami karta ma dwie połówki albo drugą stronę - wtedy chcemy dane pierwszej
          card.type = returnedCard.card_faces[0].type_line;
        } else {
          card.type = returnedCard.type_line; //pobieramy typy
        };
        if (card.commander == true) {
          card.identity = returnedCard.color_identity;
        };
      }
    })
  })
  return deck;
};

var currentGrouping = ""; //tutaj przechowuję informację o obecnym grupowaniu kart
var currentSort = ""; //tutaj przechowuję informację o obecnym sortowaniu kart

function sortDeck(listOfCards, sorting) {
  let deck = [...listOfCards];
  if (sorting == "name") { //sortowanie po nazwie
    deck = sortDeckByName(deck);
    currentSort = "name";
  } else if (sorting == "cmc") { //sortowanie po cmc
    deck = sortDeckByCmc(deck);
    currentSort = "cmc";
  } else if (sorting == "type") { //sortowanie po typie
    deck = sortDeckByType(deck);
    currentSort = "type";
  }
  return deck;
};

function sortDeckByName(listOfCards) {
  let deck = [...listOfCards];
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
  return deck;
}

function sortDeckByCmc(listOfCards) {
  let deck = [...listOfCards];
  deck = deck.sort((a, b) => a.cmc - b.cmc);
  return deck;
}

function sortDeckByType(listOfCards) {
  let deck = [...listOfCards];
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
  return deck;
}

function groupDeck(deck, grouping) { //funkcja która tworzy widoczną na stronie talię
  let groupedDeck = [];
  if (grouping == "type") {
    groupedDeck = groupDeckByType(deck);
    currentGrouping = "type";
  } else if (grouping == "cmc") {
    groupedDeck = groupDeckByCmc(deck);
    currentGrouping = "cmc";
  } else if (grouping == "color") {
    groupedDeck = groupDeckByColor(deck);
    currentGrouping = "color";
  } else if (grouping == "ugly") {
    groupedDeck = groupDeckIfUgly(deck);
  }
  return groupedDeck;
};

function groupDeckByType(listOfCards) {
  let deck = [...listOfCards];
  let groupedCards = [];
  //poniżej regexy potrzebne do filtrowania
  let landRegex = /Land/;
  let creatureRegex = /Creature/;
  let artifactRegex = /Artifact/;
  let enchantmentRegex = /Enchantment/;
  let planeswalkerRegex = /Planeswalker/;
  let instantRegex = /Instant/;
  let sorceryRegex = /Sorcery/;
  //poniżej tworzymy obiekty z listą kart o danym typie i nazwą listy
  let commander = new ListByProperty("Commander", deck.filter(card => card.commander == true));
  groupedCards.push(commander);
  let lands = new ListByProperty("Lands", deck.filter(card => landRegex.test(card.type) == true));
  groupedCards.push(lands);
  let creatures = new ListByProperty("Creatures", deck.filter(card => creatureRegex.test(card.type) == true && card.commander == false && landRegex.test(card.type) == false));
  groupedCards.push(creatures);
  let artifacts = new ListByProperty("Artifacts", deck.filter(card => artifactRegex.test(card.type) == true && creatureRegex.test(card.type) == false && landRegex.test(card.type) == false));
  groupedCards.push(artifacts);
  let enchantments = new ListByProperty("Enchantments", deck.filter(card => enchantmentRegex.test(card.type) == true && creatureRegex.test(card.type) == false));
  groupedCards.push(enchantments);
  let planeswalkers = new ListByProperty("Planeswalkers", deck.filter(card => planeswalkerRegex.test(card.type) == true && card.commander == false));
  groupedCards.push(planeswalkers);
  let instants = new ListByProperty("Instants", deck.filter(card => instantRegex.test(card.type) == true));
  groupedCards.push(instants);
  let sorceries = new ListByProperty("Sorceries", deck.filter(card => sorceryRegex.test(card.type) == true));
  groupedCards.push(sorceries);
  return groupedCards;
};

function groupDeckByCmc(listOfCards) {
  let deck = [...listOfCards];
  let groupedCards = [];
  //poniżej tworzymy obiekty z listą kart o danym cmc i nazwą listy
  let commander = new ListByProperty("Commander", deck.filter(card => card.commander == true));
  groupedCards.push(commander);
  let cmc0 = new ListByProperty("CMC 0", deck.filter(card => card.cmc == 0 && card.commander == false));
  groupedCards.push(cmc0);
  let cmc1 = new ListByProperty("CMC 1", deck.filter(card => card.cmc == 1 && card.commander == false));
  groupedCards.push(cmc1);
  let cmc2 = new ListByProperty("CMC 2", deck.filter(card => card.cmc == 2 && card.commander == false));
  groupedCards.push(cmc2);
  let cmc3 = new ListByProperty("CMC 3", deck.filter(card => card.cmc == 3 && card.commander == false));
  groupedCards.push(cmc3);
  let cmc4 = new ListByProperty("CMC 4", deck.filter(card => card.cmc == 4 && card.commander == false));
  groupedCards.push(cmc4);
  let cmc5 = new ListByProperty("CMC 5", deck.filter(card => card.cmc == 5 && card.commander == false));
  groupedCards.push(cmc5);
  let cmc6More = new ListByProperty("CMC 6+", deck.filter(card => card.cmc > 5 && card.commander == false));
  groupedCards.push(cmc6More);
  return groupedCards;
};

function groupDeckByColor(listOfCards) {
  let deck = [...listOfCards];
  let groupedCards = [];
  //poniżej tworzymy obiekty z listą kart o danym kolorze i nazwą listy
  let commander = new ListByProperty("Commander", deck.filter(card => card.commander == true));
  groupedCards.push(commander);
  let colorless = new ListByProperty("Colorless", deck.filter(card => card.colors.length == 0 && card.commander == false));
  groupedCards.push(colorless);
  let white = new ListByProperty("White", deck.filter(card => card.colors.length == 1 && card.colors[0] == "W" && card.commander == false));
  groupedCards.push(white);
  let blue = new ListByProperty("Blue", deck.filter(card => card.colors.length == 1 && card.colors[0] == "U" && card.commander == false));
  groupedCards.push(blue);
  let black = new ListByProperty("Black", deck.filter(card => card.colors.length == 1 && card.colors[0] == "B" && card.commander == false));
  groupedCards.push(black);
  let red = new ListByProperty("Red", deck.filter(card => card.colors.length == 1 && card.colors[0] == "R" && card.commander == false));
  groupedCards.push(red);
  let green = new ListByProperty("Green", deck.filter(card => card.colors.length == 1 && card.colors[0] == "G" && card.commander == false));
  groupedCards.push(green);
  let multicolor = new ListByProperty("Multicolor", deck.filter(card => card.colors.length > 1 && card.commander == false));
  groupedCards.push(multicolor);
  return groupedCards;
};

function groupDeckIfUgly(listOfCards) {
  let deck = [...listOfCards];
  let groupedCards = [];
  let commander = new ListByProperty("Commander", deck.filter(card => card.commander == true));
  groupedCards.push(commander);
  let notCommander = new ListByProperty("Karty", deck.filter(card => card.commander == false));
  groupedCards.push(notCommander);
  return groupedCards;
}

function createDeck(listOfCards) {
  let deck = [...listOfCards];
  let deckOnPage = document.querySelector(".deck");
  deckOnPage.innerHTML = ""; //czyścimy widoczną decklistę
  deck.forEach(item => createListByProperty.call(item)); //tworzymy podlisty kart do wyświetlania na stronie
  let deckForLinksAndPreviews = deck.reduce((total, item) => total.concat(item.list), []);
  addLinksAndPreviews(deckForLinksAndPreviews); //do kart w decku dodajemy linki i obrazki
};

function ListByProperty(name, list) { //konstruktor, który tworzy listy kart po typie
  this.name = name;
  this.list = list;
};

function createListByProperty() { //funkcja, która tworzy podlisty kart do wyświetlania na stronie
  if (this.list.length > 0) { //chcemy dodać podlistę tylko wtedy, kiedy jest niepusta
    let listName = document.createElement("li"); //box na nazwę podlisty
    listName.innerHTML = this.name + ` (` + this.list.reduce((total, item) => total + item.quantity, 0) + `)`; //oprócz nazwy chcę mieć jeszcze info, ile kart zawiera dana podlista
    let listByType = document.createElement("ul"); //właściwa podlista kart
    this.list.forEach(function(item) { //tworzymy podlistę kart poprzez dodanie ilości danej karty + jej nazwy
      let cardInList = document.createElement("li");
      cardInList.innerHTML = item.quantity + "x " + `<a class="mtgcard" href="">` + item.name + `</a>`;
      listByType.appendChild(cardInList)
    });
    listName.appendChild(listByType); //dodajemy nazwę podlisty do głównej listy
    let listOfCards = document.querySelector(".deck");
    listOfCards.appendChild(listName); //dodajemy podlistę do jej nazwy
  };
};

function createButtons(deck) {
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
  let listOfCards = document.querySelector(".deck");
  let decklistBox = document.getElementById("decklistbox");
  decklistBox.insertBefore(buttons, listOfCards);
  //tworzymy eventy do przycisków grupowania
  groupByType.addEventListener("click", function() {
    createDeck(groupDeck(sortDeck(deck, currentSort), "type"));
  });
  groupByCmc.addEventListener("click", function() {
    createDeck(groupDeck(sortDeck(deck, currentSort), "cmc"));
  });
  groupByColor.addEventListener("click", function() {
    createDeck(groupDeck(sortDeck(deck, currentSort), "color"));
  });
  //tworzymy eventy do przycisków sortowania
  sortByName.addEventListener("click", function() {
    createDeck(groupDeck(sortDeck(deck, "name"), currentGrouping));
    //checkGrouping(deck);
  });
  sortByCmc.addEventListener("click", function() {
    createDeck(groupDeck(sortDeck(deck, "cmc"), currentGrouping));
  });
  sortByType.addEventListener("click", function() {
    createDeck(groupDeck(sortDeck(deck, "type"), currentGrouping));
  });
};

function addLinksAndPreviews(listOfCards) { //funkcja, która dodaje linki i podglądy do kart
  let cardLinks = document.getElementsByClassName("mtgcard"); //sprawdzamy listę kart na stronie
  for (let i = 0; i < cardLinks.length; i++) {
    if (listOfCards.filter(x => x.name == cardLinks[i].textContent).length > 0 && cardLinks[i].getAttribute("href") == "") {
      getCardImage(cardLinks[i], cardLinks[i].textContent, listOfCards); //tworzymy podgląd kart przy najechaniu na kartę
      let multiverseId = checkMultiverseId(cardLinks[i].textContent, listOfCards);
      if (multiverseId != "unavailable") {
        cardLinks[i].setAttribute("href", `http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=` + multiverseId);
        cardLinks[i].setAttribute("target", "_blank"); //tworzymy link do gatherera dla każdej karty
      } else {
        cardLinks[i].setAttribute("href", `https://gatherer.wizards.com/Pages/Search/Default.aspx?name=[` + cardLinks[i].textContent + `]`);
        cardLinks[i].setAttribute("target", "_blank"); //tworzymy link do gatherera dla każdej karty
      }
    }
  };
};

function checkMultiverseId(cardName, listOfCards) { //funkcja, która sprawdza multiverseid danej karty
  let multiverseId = "";
  listOfCards.forEach(function(item) {
    if (item.name == cardName) {
      multiverseId = item.multiverseId;
    }
  });
  return multiverseId;
};

function getCardImage(cardLink, cardName, listOfCards) { //funkcja, która tworzy divy z podglądem kart po najechaniu na nie i usuwa je po odjechaniu z nich :)
  let wrapperSidebar = document.querySelector(".wrappersidebar"); //znajdujemy wrapper do dodawania podglądu kart
  let cardPreview = document.createElement("div");
  let multiverseId = checkMultiverseId(cardName, listOfCards);
  cardPreview.setAttribute("class", "cardpreview");
  if (multiverseId != "unavailable") {
    cardPreview.innerHTML = `<img src="http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=` + multiverseId + `&type=card">`;
  } else {
    cardPreview.innerHTML = `<p>Podgląd chwilowo niedostępny. Spróbuj odświeżyć stronę.</p>`;
    cardPreview.style.border = "1px solid #ffe919";
    cardPreview.style.backgroundColor = "black";
  }
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
  cardLink.addEventListener("touchstart", function() {
    event.preventDefault();
    window.oncontextmenu = function(event) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    };
    let cardLocation = cardLink.getBoundingClientRect(); //sprawdzamy koordynaty relatywne do viewportu
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop; //sprawdzamy przesunięcie viewportu w dół
    let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft; //sprawdzamy przesunięcie viewportu w lewo
    cardPreview.style.left = cardLocation.width + cardLocation.left + scrollLeft + 7 + "px"; //pozycjonujemy podgląd od lewej
    cardPreview.style.top = cardLocation.top + scrollTop - 3 + "px"; //pozycjonujemy podgląd od góry
    wrapperSidebar.appendChild(cardPreview);
  });
  cardLink.addEventListener("touchend", function() {
    wrapperSidebar.removeChild(cardPreview);
  });
};

// function checkGrouping() {
//   let deckOnPage = document.querySelector(".deck");
//
// }
