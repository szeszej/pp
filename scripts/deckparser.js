//https://disqus.com/ jako system komentarzy?
//przerobić zgodnie z wytycznymi functional programming/clean code
function parseDecklist(decklist) {
  let matchLines = /.+/g; //regex, który dzieli mi decklistę na linijki
  let cardName = /\s.+/; //regex, który znajduje mi nazwę karty
  let findCommander = /CMDR/; //regex, który znajduje mi commandera

  let cardLines = decklist.match(matchLines).map(a => a.trim()); //dzielę decklistę na linijki i każdą linijkę zapisuję jako jeden item w tablicy, dodatkowo usuwam whitespace
  let cardQuantity = cardLines.map(a => parseInt(a)); //jako że liczba danej karty jest zawsze na początku, mogę w ten sposób wydzielić ilość danej karty
  let cardNames = cardLines //znajduję same nazwy kart i usuwam whitespace
    .map(a => a.match(cardName))
    .flat()
    .map(a => a.trim());

  let parsedDeck = []; //tablica obiektów, każdy obiekt to jedna karta

  if (cardQuantity.length == cardNames.length) {
    cardQuantity.map(function(item, index) { //dodaję po kolei karty do decku
      if (findCommander.test(cardNames[index]) == true) { //sprawdzam czy karta jest oznaczona jako commander i usuwam oznaczenie commandera z nazwy
        parsedDeck.push(new Card(cardNames[index].slice(0, -7), item, true));
      } else { //w pozostałych przypadkach po prostu dodaję kartę z właściwościami ilość i nazwa
        parsedDeck.push(new Card(cardNames[index], item, false));
      }
    });
  } else {
    console.log("Parsing error");
  }
  return parsedDeck;
}

function Card(name, quantity, commander) {
  this.name = name;
  this.quantity = quantity;
  this.commander = commander;
}

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
  let apiRequestUrl = [`https://api.scryfall.com/cards/search?q=`]; //początek URLa do zapytania do API
  allCardsOnPage = deckForUrl.concat(extraCards);
  let urlIndex = 0;
  allCardsOnPage.forEach(function(item) {
    if (apiRequestUrl[urlIndex].length < 1025) { //niestety długość requesta jest limitowana, więc jak jest dużo kart, to trzeba dwóch :)
      apiRequestUrl[urlIndex] += `!"` + item.name + `"or`;
    } else {
      apiRequestUrl.push(`https://api.scryfall.com/cards/search?q=`);
      urlIndex += 1;
      apiRequestUrl[urlIndex] += `!"` + item.name + `"or`;
    }
  })
  return apiRequestUrl;
};

var decklistBox = document.getElementById("decklistbox");
var listOfCards = document.createElement("ul");
listOfCards.setAttribute("class", "deck");
decklistBox.appendChild(listOfCards);


function createLoader(boxForDecklist) {
  let loader = document.createElement("div"); //obracające się kółko kiedy lista jeszcze się ładuje
  loader.setAttribute("class", "loader");
  boxForDecklist.appendChild(loader);
};
createLoader(listOfCards);

var currentGrouping = ""; //tutaj przechowuję informację o obecnym grupowaniu kart
var currentSort = ""; //tutaj przechowuję informację o obecnym sortowaniu kart

// function getCardData(deckToUpdate) {
//   let deck = [...deckToUpdate];
//   let apiRequestUrls = createApiRequestURL(deck, getExtraCards(deck));
//   apiRequest(apiRequestUrls, 0, []);
// };

// function apiRequest(urls, iteration, cardsReturnedPreviously) {
//   let returnedCards = [...cardsReturnedPreviously]
//   let request = new XMLHttpRequest(); //zapytanie do API
//   request.open(
//     "GET",
//     urls[iteration], //pierwszy URL wygenerowany wyżej
//     true
//   );
//   request.send();
//   request.onload = function() { //kiedy mamy dane, to robimy rzeczy
//     var data = JSON.parse(this.response);
//     if (request.status >= 200 && request.status < 400) {
//       returnedCards = returnedCards.concat(data.data); //podpisujemy pobrane dane o kartach pod zmienną
//       iteration += 1;
//       if (iteration < urls.length) {
//         apiRequest(urls, iteration, returnedCards);
//       } else {
//         updateDeckData(parsedDecklist, returnedCards);
//         return returnedCards;
//       }
//     } else {
//       console.log("error"); //jak się request nie powiedzie, to zwraca błąd
//     }
//   }
// };

// getCardData(parsedDecklist);

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
  var decklistWithAdditionalData = updateDeckData(parsedDecklist, cardsFromApi);
  console.log(decklistWithAdditionalData);
});

function updateDeckData(deck, returnedCards) { //funkcja która dodaje właściwości z listy pobranej przez API do kart w decku
  console.log("hello");
  deck.forEach(function(card) {
    returnedCards.forEach(function(returnedCard) {
      if (returnedCard.name == card.name) {
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

function createDeck(deck, grouping) { //funkcja która tworzy widoczną na stronie talię
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
    let commander = new ConstructListsByProperty("Commander", deck.filter(card => card.commander == true));
    filteredCards.push(commander);
    let lands = new ConstructListsByProperty("Lands", deck.filter(card => landRegex.test(card.type) == true));
    filteredCards.push(lands);
    let creatures = new ConstructListsByProperty("Creatures", deck.filter(card => creatureRegex.test(card.type) == true && card.commander == false && landRegex.test(card.type) == false));
    filteredCards.push(creatures);
    let artifacts = new ConstructListsByProperty("Artifacts", deck.filter(card => artifactRegex.test(card.type) == true && creatureRegex.test(card.type) == false));
    filteredCards.push(artifacts);
    let enchantments = new ConstructListsByProperty("Enchantments", deck.filter(card => enchantmentRegex.test(card.type) == true && creatureRegex.test(card.type) == false));
    filteredCards.push(enchantments);
    let planeswalkers = new ConstructListsByProperty("Planeswalkers", deck.filter(card => planeswalkerRegex.test(card.type) == true && card.commander == false));
    filteredCards.push(planeswalkers);
    let instants = new ConstructListsByProperty("Instants", deck.filter(card => instantRegex.test(card.type) == true));
    filteredCards.push(instants);
    let sorceries = new ConstructListsByProperty("Sorceries", deck.filter(card => sorceryRegex.test(card.type) == true));
    filteredCards.push(sorceries);
    currentGrouping = "type";
  } else if (grouping == "cmc") {
    //poniżej tworzymy obiekty z listą kart o danym cmc i nazwą listy
    let commander = new ConstructListsByProperty("Commander", deck.filter(card => card.commander == true));
    filteredCards.push(commander);
    let cmc0 = new ConstructListsByProperty("CMC 0", deck.filter(card => card.cmc == 0 && card.commander == false));
    filteredCards.push(cmc0);
    let cmc1 = new ConstructListsByProperty("CMC 1", deck.filter(card => card.cmc == 1 && card.commander == false));
    filteredCards.push(cmc1);
    let cmc2 = new ConstructListsByProperty("CMC 2", deck.filter(card => card.cmc == 2 && card.commander == false));
    filteredCards.push(cmc2);
    let cmc3 = new ConstructListsByProperty("CMC 3", deck.filter(card => card.cmc == 3 && card.commander == false));
    filteredCards.push(cmc3);
    let cmc4 = new ConstructListsByProperty("CMC 4", deck.filter(card => card.cmc == 4 && card.commander == false));
    filteredCards.push(cmc4);
    let cmc5 = new ConstructListsByProperty("CMC 5", deck.filter(card => card.cmc == 5 && card.commander == false));
    filteredCards.push(cmc5);
    let cmc6More = new ConstructListsByProperty("CMC 6+", deck.filter(card => card.cmc > 5 && card.commander == false));
    filteredCards.push(cmc6More);
    currentGrouping = "cmc";
  } else if (grouping == "color") {
    //poniżej tworzymy obiekty z listą kart o danym kolorze i nazwą listy
    let commander = new ConstructListsByProperty("Commander", deck.filter(card => card.commander == true));
    filteredCards.push(commander);
    let colorless = new ConstructListsByProperty("Colorless", deck.filter(card => card.colors.length == 0 && card.commander == false));
    filteredCards.push(colorless);
    let white = new ConstructListsByProperty("White", deck.filter(card => card.colors.length == 1 && card.colors[0] == "W" && card.commander == false));
    filteredCards.push(white);
    let blue = new ConstructListsByProperty("Blue", deck.filter(card => card.colors.length == 1 && card.colors[0] == "U" && card.commander == false));
    filteredCards.push(blue);
    let black = new ConstructListsByProperty("Black", deck.filter(card => card.colors.length == 1 && card.colors[0] == "B" && card.commander == false));
    filteredCards.push(black);
    let red = new ConstructListsByProperty("Red", deck.filter(card => card.colors.length == 1 && card.colors[0] == "R" && card.commander == false));
    filteredCards.push(red);
    let green = new ConstructListsByProperty("Green", deck.filter(card => card.colors.length == 1 && card.colors[0] == "G" && card.commander == false));
    filteredCards.push(green);
    let multicolor = new ConstructListsByProperty("Multicolor", deck.filter(card => card.colors.length > 1 && card.commander == false));
    filteredCards.push(multicolor);
    currentGrouping = "color";
  }
  listOfCards.innerHTML = ""; //czyścimy widoczną decklistę
  filteredCards.forEach(item => createListByProperty.call(item)); //tworzymy podlisty kart do wyświetlania na stronie
  addLinksAndPreviews(); //do kart w decku dodajemy linki i obrazki
};

function ConstructListsByProperty(name, list) { //konstruktor, który tworzy listy kart po typie
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
  let multiverseId = "";
  returnedCards.forEach(function(item) {
    if (item.name == cardName) {
      multiverseId = item.multiverse_ids[0];
    }
  });
  return multiverseId;
};

function getCardImage(cardLink, cardName) { //funkcja, która tworzy divy z podglądem kart po najechaniu na nie i usuwa je po odjechaniu z nich :)
  let wrapperSidebar = document.querySelector(".wrappersidebar"); //znajdujemy wrapper do dodawania podglądu kart
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
