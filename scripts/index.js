function getCardImage(cardLink, multiverseId) {
          let cardPreview = document.createElement("div");
          cardPreview.setAttribute("class", "cardpreview");
          cardPreview.innerHTML = `<img src="http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=` + multiverseId + `&type=card">`;
          cardLink.appendChild(cardPreview);
};

var cardLinks = document.getElementsByClassName("mtgcard");
var multiverseIds = [];
var apiRequestUrl = `https://api.magicthegathering.io/v1/cards?name=`;

function createApiRequestURL () {
  for (let i = 0; i < cardLinks.length; i++) {
    apiRequestUrl += `"` + cardLinks[i].textContent + `"|`;
  }
}

createApiRequestURL();
console.log(apiRequestUrl);

for (let i = 0; i < cardLinks.length; i++) {
  let request = new XMLHttpRequest();
  request.open(
    "GET",
    `https://api.magicthegathering.io/v1/cards?name=` + cardLinks[i].textContent,
    true
  );
  request.onload = function() {
    var data = JSON.parse(this.response);
    if (request.status >= 200 && request.status < 400) {
      for (let j = 0; j < data.cards.length; j++) {
        if (data.cards[j].name == cardLinks[i].textContent) {
          // console.log(data.cards[j].multiverseid);
          multiverseIds.push(data.cards[j].multiverseid);
          break;
        }
      }
      cardLinks[i].addEventListener("pointerover", getCardImage(cardLinks[i], multiverseIds[i]));
      cardLinks[i].setAttribute("href", `http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=` + multiverseIds[i]);
      cardLinks[i].setAttribute("target", "_blank");
    } else {
      console.log("error");
    }
  };
  request.send();
};
