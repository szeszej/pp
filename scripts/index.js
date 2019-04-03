var swCrawl = document.querySelector("#lastparagraph");
var afterCrawl = document.querySelector(".aftercrawl");

setInterval(function () {
  let crawlPosition = swCrawl.getBoundingClientRect();
  if (crawlPosition.y < 120 && crawlPosition.y > 0) {
    afterCrawl.style.animation = "show 2s ease-in 0s 1 normal forwards";
  }
  console.log(swCrawl.getBoundingClientRect());
}, 1000);



var cardLinks = document.getElementsByClassName("mtgcard"); //lista wszystkich kart na stronie
var apiRequestUrl = `https://api.scryfall.com/cards/search?q=`; //początek URLa do zapytania do API
var returnedCards = []; //tutaj będą przechowywane karty pobrane z API

function createApiRequestURL() { //funkcja, która tworzy URL zapytania do API z nazwa kart na stronie
  for (let i = 0; i < cardLinks.length; i++) {
    apiRequestUrl += `!"` + cardLinks[i].textContent + `" or `;
  }
}

createApiRequestURL();

function getCardImage(cardLink, cardName) { //funkcja, która tworzy divy z podglądem kart po najechaniu na nie
  let cardPreview = document.createElement("div");
  cardPreview.setAttribute("class", "cardpreview");
  cardPreview.innerHTML = `<img src="http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=` + checkMultiverseId(cardName) + `&type=card">`;
  cardLink.appendChild(cardPreview);
};

function checkMultiverseId(cardName) { //funkcja, która sprawdza multiverseid danej karty
  let multiverseId = ""
  returnedCards.forEach(function(item) {
    if (item.name == cardName) {
      multiverseId = item.multiverse_ids[0];
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
