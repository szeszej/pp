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

var slideIndex = 1; // zaczynamy od slajdu nr 1
var automaticSlideChange = setInterval(function() { //zmieniamy slajd automatycznie co 8 sekund
  slideIndex += 1;
  showSlides(slideIndex);
}, 8000);
showSlides(slideIndex);

function changeSlides(slideChange) { //po kliknięciu na przycisk next/prev zmieniamy slajd na kolejny lub poprzedni
  showSlides(slideIndex += slideChange);
};

function currentSlide(goToSlide) { //po kliknięciu na kropkę zmieniamy slajd na odpowiedni
  showSlides(slideIndex = goToSlide);
};

function showSlides(n) {
  clearInterval(automaticSlideChange); //resetujemy timer zmiany slajdu
  automaticSlideChange = setInterval(function() { //i ustawiamy go ponownie na 8 sekund
    slideIndex += 1;
    showSlides(slideIndex);
  }, 8000);
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) {
    slideIndex = 1
  } //jeśli przechodzimy do następnego slajdu, którego nie ma, wracamy do pierwszego
  if (n < 1) {
    slideIndex = slides.length
  } //jeśli cofamy się do slajdu, którego nie ma, idzimy do ostatniego
  for (let i = 0; i < slides.length; i++) { //ustawiamy wszystkim slajdom brak widoczności
    slides[i].style.display = "none";
  }
  for (let i = 0; i < dots.length; i++) { //zmieiamy kropki na nieaktywne
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex - 1].style.display = "flex"; //tylko jeden slajd ma być widoczny
  dots[slideIndex - 1].className += " active"; //odpowiednia kropka ma być aktywna
};
