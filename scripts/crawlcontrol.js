var swCrawlEnd = document.querySelector("#lastparagraph"); //znajduje pusty paragraf na końcu przewijanego tekstu na stronie głównej
var afterCrawl = document.querySelector(".aftercrawl"); //znajduje div, który ma być wyświetlony po przewinięcu się tekstu

var animationWatch = setInterval(function() { //funkcja która sprawdza co pewien czas, gdzie znajduje się (oś y) osatni paragraf w tekście przewijanym
  let crawlPosition = swCrawlEnd.getBoundingClientRect();
  if (crawlPosition.y < 250 && crawlPosition.y > 0) { //jeśli jest odpowiednio wysoko (poza obszarem widocznym), to włączamy animację po przewinięciu się tekstu i przestajemy liczyć
    afterCrawl.style.animation = "show 2s ease-in 0s 1 normal forwards";
    clearInterval(animationWatch);
  }
}, 500);

var swCrawl = document.querySelector(".crawl"); //znajduje tekst przewijany
var skipButton = document.querySelector(".skip"); //znajduje guzik pominięcia
skipButton.addEventListener("click", function() { //funkcja, która kończy tekst przewijany i wyświetla animację po przewinięciu, kiedy klikniemy na przycisk
  swCrawl.style.display = "none";
  clearInterval(animationWatch);
  skipButton.style.display = "none";
  afterCrawl.style.animation = "show 2s ease-in 0s 1 normal forwards";
});
