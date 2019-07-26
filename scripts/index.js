function createApiRequestURL() { //funkcja, która tworzy URL zapytania do API z listą kart w talii
  let apiRequestUrl = `https://www.boardgameatlas.com/api/search?name=`; //początek URLa do zapytania do API
  let apiRequestUrls = [];
  let allCardsOnPage = document.getElementsByClassName("mtgcard");
  for (let i = 0; i < allCardsOnPage.length; i++) {
    if (apiRequestUrls.indexOf(apiRequestUrl + allCardsOnPage[i].textContent + '&limit=1&client_id=9ctNxCCxTj') == -1) {
      apiRequestUrls.push(apiRequestUrl + allCardsOnPage[i].textContent + '&limit=1&client_id=9ctNxCCxTj');
    }
  }
  return apiRequestUrls;
};

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
        returnedCards = returnedCards.concat(data.games[0]); //podpisujemy pobrane dane o kartach pod zmienną
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
  addLinksAndPreviews(returnedCards);
}, function() {});

function addLinksAndPreviews(cardsFromApi = []) { //funkcja, która dodaje linki i podglądy do kart
  let returnedCards = [...cardsFromApi];
  let cardLinks = document.getElementsByClassName("mtgcard");
  for (let i = 0; i < cardLinks.length; i++) {
    let game = returnedCards.filter(x => x.name.includes(cardLinks[i].textContent))[0];
    getCardImage(cardLinks[i], game.image_url); //tworzymy podgląd kart przy najechaniu na kartę
    cardLinks[i].setAttribute("href", game.official_url);
    cardLinks[i].setAttribute("target", "_blank"); //tworzymy link do gatherera dla każdej karty
  };
};

function getCardImage(cardLink, image) { //funkcja, która tworzy divy z podglądem kart po najechaniu na nie i usuwa je po odjechaniu z nich :)
  let cardPreview = document.createElement("div");
  cardPreview.setAttribute("class", "cardpreview");
  cardPreview.innerHTML = `<img src="${image}">`;
  cardLink.addEventListener("mouseenter", function() {
    cardLink.appendChild(cardPreview);
  });
  cardLink.addEventListener("mouseleave", function() {
    cardLink.removeChild(cardPreview);
  });
  cardLink.addEventListener("touchstart", function() {
    event.preventDefault();
    window.oncontextmenu = function(event) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    };
    cardLink.appendChild(cardPreview);
  });
  cardLink.addEventListener("touchend", function() {
    cardLink.removeChild(cardPreview);
  });
};
