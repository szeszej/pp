var swCrawlEnd = document.querySelector("#lastparagraph"); //znajduje pusty paragraf na końcu przewijanego tekstu na stronie głównej
var afterCrawl = document.querySelector(".aftercrawl"); //znajduje div, który ma być wyświetlony po przewinięcu się tekstu
var swCrawl = document.querySelector(".crawl"); //znajduje tekst przewijany
var skipButton = document.querySelector(".skip"); //znajduje guzik pominięcia

var header = document.querySelector("header"); //znajduje header
var nav = document.querySelector("nav"); //znajduje nawigację
var fade = document.querySelector(".fade"); //znajduje div, który "znika" animację

var menuHeight = parseInt(window.getComputedStyle(header).height) + parseInt(window.getComputedStyle(nav).height) + parseInt(window.getComputedStyle(fade).height); //oblicza łączną wysokość elementów, żeby wyłączyć animację, kiedy jest poza obszarem widocznym

var animationWatch = setInterval(function() { //funkcja która sprawdza co pewien czas, gdzie znajduje się (oś y) osatni paragraf w tekście przewijanym
  let crawlPosition = swCrawlEnd.getBoundingClientRect();
  if (crawlPosition.y < menuHeight - 50 && crawlPosition.y > 0) { //jeśli jest odpowiednio wysoko (poza obszarem widocznym), to włączamy animację po przewinięciu się tekstu i przestajemy liczyć
    afterCrawl.style.animation = "show 2s ease-in 0s 1 normal forwards";
    fade.style.display = "none";
    skipButton.style.display = "none";
    clearInterval(animationWatch);
  }
}, 500);

skipButton.addEventListener("click", function() { //funkcja, która kończy tekst przewijany i wyświetla animację po przewinięciu, kiedy klikniemy na przycisk
  swCrawl.style.display = "none";
  clearInterval(animationWatch);
  fade.style.display = "none";
  skipButton.style.display = "none";
  afterCrawl.style.animation = "show 2s ease-in 0s 1 normal forwards";
});

var slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "flex";
  dots[slideIndex-1].className += " active";
}
