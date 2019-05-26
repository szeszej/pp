//dla 1v1 commandera:
//https://api.scryfall.com/cards/search?q=restricted:duel - zbanowani commanderzy
//https://api.scryfall.com/cards/search?q=banned:duel%20legal:vintage - zbanowane karty

function createApiRequestURL() { //funkcja, która tworzy URL zapytania do API z listą kart w talii
  let apiRequestUrl = [`https://api.scryfall.com/cards/search?q=`]; //początek URLa do zapytania do API
  let bannedCardsList = document.querySelector(".banned");
  if (bannedCardsList == null) {
    let allCardsOnPage = document.getElementsByClassName("mtgcard");
    let urlIndex = 0;
    for (let i = 0; i < allCardsOnPage.length; i++) {
      if (apiRequestUrl[urlIndex].length < 1025) { //niestety długość requesta jest limitowana, więc jak jest dużo kart, to trzeba dwóch :)
        apiRequestUrl[urlIndex] += `!"` + allCardsOnPage[i].textContent + `"or`;
      } else {
        apiRequestUrl.push(`https://api.scryfall.com/cards/search?q=`);
        urlIndex += 1;
        apiRequestUrl[urlIndex] += `!"` + allCardsOnPage[i].textContent + `"or`;
      }
    }
  } else {
    apiRequestUrl[0] = `https://api.scryfall.com/cards/search?q=banned:commander%20legal:vintage`; //jak jesteśmy na stronie kart zbanowanych, to chcemy po prostu pobrać listę kart zbanowanych
  }
  return apiRequestUrl;
};

function createLoader() {
  let bannedCardsList = document.querySelector(".banned");
  if (bannedCardsList != null) {
    let loader = document.createElement("div"); //obracające się kółko kiedy lista jeszcze się ładuje
    loader.setAttribute("class", "loader");
    bannedCardsList.appendChild(loader);
  }
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
  let apiRequestUrls = createApiRequestURL();
  apiRequest(apiRequestUrls, 0, []);
});

additionalCardData.then(function(cardsFromApi) {
  let returnedCards = [...cardsFromApi]
  let bannedCardsList = document.querySelector(".banned");
  if (bannedCardsList != null) { //jeśli isnieje lista kart zbanowanych, to trzeba do niej dodać karty
    createBanlist(returnedCards);
  };
  addLinksAndPreviews(returnedCards);
}, function() {
  let bannedCardsList = document.querySelector(".banned");
  if (bannedCardsList != null) { //jeśli isnieje lista kart zbanowanych, to trzeba do niej dodać karty
    bannedCardsList.innerHTML = `<li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=382841" target="_blank">Ancestral Recall</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=413544" target="_blank">Balance</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=83531" target="_blank">Biorhythm</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=382866" target="_blank">Black Lotus</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=413624" target="_blank">Braids, Cabal Minion</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=438723" target="_blank">Channel</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=109718" target="_blank">Coalition Victory</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=456600" target="_blank">Emrakul, the Aeons Torn</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=87599" target="_blank">Erayo, Soratami Ascendant // Erayo's Essence</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=382934" target="_blank">Fastbond</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=425865" target="_blank">Gifts Ungiven</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=425897" target="_blank">Griselbrand</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=456840" target="_blank">Karakas</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=456798" target="_blank">Leovold, Emissary of Trest</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=382997" target="_blank">Library of Alexandria</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=6049" target="_blank">Limited Resources</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=383019" target="_blank">Mox Emerald</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=383020" target="_blank">Mox Jet</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=383021" target="_blank">Mox Pearl</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=383022" target="_blank">Mox Ruby</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=383023" target="_blank">Mox Sapphire</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=146022" target="_blank">Painter's Servant</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=47930" target="_blank">Panoptic Mirror</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=438749" target="_blank">Primeval Titan</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=373635" target="_blank">Prophet of Kruphix</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=397441" target="_blank">Recurring Nightmare</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=383074" target="_blank">Rofellos, Llanowar Emissary</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=442222" target="_blank">Sundering Titan</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=74034" target="_blank">Sway of the Stars</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=366282" target="_blank">Sylvan Primordial</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=383130" target="_blank">Time Vault</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=383131" target="_blank">Time Walk</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=12383" target="_blank">Tinker</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=383133" target="_blank">Tolarian Academy</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=247356" target="_blank">Trade Secrets</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=383143" target="_blank">Upheaval</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=278195" target="_blank">Worldfire</a></li><li><a class="mtgcard" href="http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=383157" target="_blank">Yawgmoth's Bargain</a></li>`
  };
  addLinksAndPreviews([]);
});

function createBanlist(cardsFromApi) { //tworzy listę karty zbanowanych
  let returnedCards = [...cardsFromApi];
  let bannedCardsList = document.querySelector(".banned");
  bannedCardsList.innerHTML = "";
  returnedCards.forEach(function(returnedCard) {
    let bannedCard = document.createElement("li");
    bannedCard.innerHTML = `<a class="mtgcard" href="">` + returnedCard.name + `</a>`
    bannedCardsList.appendChild(bannedCard);
  }); //tworzymy listę kart zbanowanych na stronie
}

function addLinksAndPreviews(cardsFromApi) { //funkcja, która dodaje linki i podglądy do kart
  let returnedCards = [...cardsFromApi];
  let cardLinks = document.getElementsByClassName("mtgcard");
  for (let i = 0; i < cardLinks.length; i++) {
    getCardImage(cardLinks[i], cardLinks[i].textContent, returnedCards); //tworzymy podgląd kart przy najechaniu na kartę
    let multiverseId = checkMultiverseId(cardLinks[i].textContent, returnedCards);
    if (multiverseId != "") {
      cardLinks[i].setAttribute("href", `http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=` + multiverseId);
      cardLinks[i].setAttribute("target", "_blank"); //tworzymy link do gatherera dla każdej karty
    } else {
      cardLinks[i].setAttribute("href", `https://gatherer.wizards.com/Pages/Search/Default.aspx?name=[` + cardLinks[i].textContent + `]`);
      cardLinks[i].setAttribute("target", "_blank"); //tworzymy link do gatherera dla każdej karty
    }
  };
};

function checkMultiverseId(cardName, cardsFromApi) { //funkcja, która sprawdza multiverseid danej karty
  let returnedCards = [...cardsFromApi];
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

function getCardImage(cardLink, cardName, cardsFromApi) { //funkcja, która tworzy divy z podglądem kart po najechaniu na nie i usuwa je po odjechaniu z nich :)
  let returnedCards = [...cardsFromApi];
  let ranking = document.querySelector("#ranklist"); //znajdujemy ranking
  let wrapperSidebar = document.querySelector(".wrappersidebar"); //znajdujemy wrapper do dodawania podglądu kart
  let cardPreview = document.createElement("div");
  let multiverseId = checkMultiverseId(cardName, returnedCards);
  cardPreview.setAttribute("class", "cardpreview");
  if (multiverseId != "") {
    cardPreview.innerHTML = `<img src="http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=` + multiverseId + `&type=card">`;
  } else {
    cardPreview.innerHTML = `<p>Podgląd chwilowo niedostępny. Spróbuj odświeżyć stronę.</p>`;
    cardPreview.style.border = "1px solid #ffe919";
  }
  if (ranking != null) { //w rankingu karty mają display: none, więc getBoundingClientRect() nie działa, ale na szczęście nie są w liście, więc możemy podpiąć podgląd bezpośrednio pod kartę
    cardLink.addEventListener("mouseenter", function() {
      cardLink.appendChild(cardPreview);
    });
    cardLink.addEventListener("mouseleave", function() {
      cardLink.removeChild(cardPreview);
    });
  } else { //poza rankingiem działa getBoundingClientRect(), więc możemy po prostu przypiąć podgląd karty do wrappera
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
  }
};
