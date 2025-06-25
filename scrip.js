//slider de texto 
const slider = document.getElementById("slider");
let index = 0;

setInterval(() => {
  index = (index + 1) % 3;
  slider.style.transform = `translateX(-${index * 100}vw)`;
}, 10000);
//menu hamburguesa
  function toggleMenu() {
    document.querySelector('.nav-menu').classList.toggle('active');
  }

let sliderInner = document.querySelector(".slider1--inner");

let images = sliderInner.querySelectorAll("img");

let index1 = 1;

setInterval(function(){
  let percentage = index1 * -100;
  sliderInner.style.transform = "translateX(" + percentage + "%)";
  index1++;
  if(index1 > images.length - 1){
    index1 = 0;
  }
}, 30000);
