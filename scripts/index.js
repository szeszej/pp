//dla 1v1 commandera:
//https://api.scryfall.com/cards/search?q=restricted:duel - zbanowani commanderzy
//https://api.scryfall.com/cards/search?q=banned:duel%20legal:vintage - zbanowane karty
//ulepszyć wiadomość o błędzie w przypadku braku odpowiedzi od API, dodać info o braku podglądów

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
    bannedCardsList.innerHTML = `<p class="errormessage">API się zessrało :( Spróbuj odświeżyć stronę</p>`
  };
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
    cardLinks[i].setAttribute("href", `http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=` + checkMultiverseId(cardLinks[i].textContent, returnedCards));
    cardLinks[i].setAttribute("target", "_blank"); //tworzymy link do gatherera dla każdej karty
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
  cardPreview.setAttribute("class", "cardpreview");
  cardPreview.innerHTML = `<img src="http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=` + checkMultiverseId(cardName, returnedCards) + `&type=card">`;
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
