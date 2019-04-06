var bannedCards = []; //tutaj będą przechowywane zbanowane karty pobrane z API
var bannedCardsList = document.querySelector(".banned"); //znajdujemy miejsce na stronie do wyświetlenia kart zbanowanych
var wrapperSidebar = document.querySelector(".wrappersidebar"); //znajdujemy wrapper do dodawania podglądu kart

function getCardImage(cardLink, cardName) { //funkcja, która tworzy divy z podglądem kart po najechaniu na nie. Divy są zagnieżdżone w body, bo brzydko wyglądały jako elementy listy, więc trzeba je ładnie wypozycjonować
  let cardLocation = cardLink.getBoundingClientRect(); //sprawdzamy koordynaty relatywne do viewportu
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop; //sprawdzamy przesunięcie viewportu w dół
  let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft; //sprawdzamy przesunięcie viewportu w lewo
  let cardPreview = document.createElement("div");
  cardPreview.setAttribute("class", "cardpreview");
  cardPreview.innerHTML = `<img src="http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=` + checkMultiverseId(cardName) + `&type=card">`;
  cardPreview.style.left = cardLocation.width + cardLocation.left + scrollLeft + 7 + "px"; //pozycjonujemy podgląd od lewej
  cardPreview.style.top = cardLocation.top + scrollTop - 3 + "px"; //pozycjonujemy podgląd od góry
  cardLink.addEventListener("mouseenter", function() {
    wrapperSidebar.appendChild(cardPreview);
  });
  cardLink.addEventListener("mouseleave", function() {
    wrapperSidebar.removeChild(cardPreview);
  });
};

function checkMultiverseId(cardName) { //funkcja, która sprawdza multiverseid danej karty
  let multiverseId = ""
  bannedCards.forEach(function(item) {
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
  `https://api.scryfall.com/cards/search?q=banned:commander%20legal:vintage`, //URL kart zbanowanych w commanderze
  true
);
request.onload = function() { //kiedy mamy dane, to robimy rzeczy
  var data = JSON.parse(this.response);
  if (request.status >= 200 && request.status < 400) {
    bannedCards = data.data; //podpisujemy pobrane dane o zbanowanych kartach pod zmienną

    var cardLinks = document.getElementsByClassName("mtgcard"); //lista wszystkich kart na stronie
    for (let i = 0; i < cardLinks.length; i++) { //po stworzeniu listy kart, możemy dodać do nich podgląd i linki
      getCardImage(cardLinks[i], cardLinks[i].textContent); //tworzymy podgląd kart
      cardLinks[i].setAttribute("href", `http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=` + checkMultiverseId(cardLinks[i].textContent));
      cardLinks[i].setAttribute("target", "_blank"); //tworzymy link do gatherera dla każdej karty
    };
  } else {
    console.log("error"); //jak się request nie powiedzie, to zwraca błąd
  }
};
request.send();
