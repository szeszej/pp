var bannedCards = []; //tutaj będą przechowywane zbanowane karty pobrane z API
var bannedCardsList = document.querySelector(".banned");

function getCardImage(cardLink, cardName) { //funkcja, która tworzy divy z podglądem kart po najechaniu na nie
  let cardPreview = document.createElement("div");
  cardPreview.setAttribute("class", "cardpreview");
  cardPreview.innerHTML = `<img src="http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=` + checkMultiverseId(cardName) + `&type=card">`;
  cardLink.appendChild(cardPreview);
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
    for (var i = 0; i < bannedCards.length; i++) { //tworzymy listę kart zbanowanych na stronie
      let bannedCard = document.createElement("li");
      bannedCard.innerHTML = `<a class="mtgcard" href="">` + bannedCards[i].name + `</a>`
      bannedCardsList.appendChild(bannedCard);
    }
    var cardLinks = document.getElementsByClassName("mtgcard"); //lista wszystkich kart na stronie
    for (let i = 0; i < cardLinks.length; i++) { //po stworzeniu listy kart, możemy dodać do nich podgląd i linki
      getCardImage(cardLinks[i], cardLinks[i].textContent); //tworzymy podgląd kart przy najechaniu na kartę
      cardLinks[i].setAttribute("href", `http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=` + checkMultiverseId(cardLinks[i].textContent));
      cardLinks[i].setAttribute("target", "_blank"); //tworzymy link do gatherera dla każdej karty
    };
  } else {
    console.log("error"); //jak się request nie powiedzie, to zwraca błąd
  }
};
request.send();
