var cardLinks = document.getElementsByClassName("mtgcard"); //lista wszystkich kart na stronie
var apiRequestUrl = `https://api.scryfall.com/cards/search?q=`; //początek URLa do zapytania do API
var returnedCards = []; //tutaj będą przechowywane karty pobrane z API
var bannedCardsList = document.querySelector(".banned"); //znajdujemy miejsce na stronie do wyświetlenia kart zbanowanych
var ranking = document.querySelector("#ranklist"); //znajdujemy ranking
var wrapperSidebar = document.querySelector(".wrappersidebar"); //znajdujemy wrapper do dodawania podglądu kart

function createApiRequestURL() { //funkcja, która tworzy URL zapytania do API z nazwa kart na stronie
  if (bannedCardsList == null) { //jeśli nie jesteśmy na stronie z listą zbanowanych kart, to chcemy pobrać przez API dane kart ze strony
    for (let i = 0; i < cardLinks.length; i++) {
      apiRequestUrl += `!"` + cardLinks[i].textContent + `" or `;
    }
  } else {
    apiRequestUrl = `https://api.scryfall.com/cards/search?q=banned:commander%20legal:vintage`; //jak jesteśmy na stronie kart zbanowanych, to chcemy po prostu pobrać listę kart zbanowanych
  }
  console.log(apiRequestUrl);
};

createApiRequestURL();

function getCardImage(cardLink, cardName) { //funkcja, która tworzy divy z podglądem kart po najechaniu na nie i usuwa je po odjechaniu z nich :)

  let cardPreview = document.createElement("div");
  cardPreview.setAttribute("class", "cardpreview");
  cardPreview.innerHTML = `<img src="http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=` + checkMultiverseId(cardName) + `&type=card">`;
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

function checkMultiverseId(cardName) { //funkcja, która sprawdza multiverseid danej karty
  let multiverseId = ""
  returnedCards.forEach(function(item) {
    if (item.name == cardName) {
      multiverseId = item.multiverse_ids[0];
    } else if (item.hasOwnProperty("card_faces") == true) {
      if (item.card_faces[0].name == cardName) {
        multiverseId = item.multiverse_ids[0];
      }
    }
  });
  return multiverseId;
}

let request = new XMLHttpRequest(); //zapytanie do API
request.open(
  "GET",
  apiRequestUrl, //URL wygenerowany wyżej
  true
);
request.onload = function() { //kiedy mamy dane, to robimy rzeczy
  var data = JSON.parse(this.response);
  if (request.status >= 200 && request.status < 400) {
    returnedCards = data.data; //podpisujemy pobrane dane o kartach pod zmienną
    console.log(returnedCards);
    if (bannedCardsList != null) { //jeśli isnieje lista kart zbanowanych, to trzeba do niej dodać karty
      for (var i = 0; i < returnedCards.length; i++) { //tworzymy listę kart zbanowanych na stronie
        let bannedCard = document.createElement("li");
        bannedCard.innerHTML = `<a class="mtgcard" href="">` + returnedCards[i].name + `</a>`
        bannedCardsList.appendChild(bannedCard);
      }
      cardLinks = document.getElementsByClassName("mtgcard"); //jako że lista kart została dopiero stworzona, trzeba zaktualizować zmienną z listą kart
    }
    for (let i = 0; i < cardLinks.length; i++) { //jak już mamy te dane, to:
      getCardImage(cardLinks[i], cardLinks[i].textContent); //tworzymy podgląd kart przy najechaniu na kartę
      cardLinks[i].setAttribute("href", `http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=` + checkMultiverseId(cardLinks[i].textContent));
      cardLinks[i].setAttribute("target", "_blank"); //tworzymy link do gatherera dla każdej karty
    };
  } else {
    console.log("error"); //jak się request nie powiedzie, to zwraca błąd
  }
};
request.send();
