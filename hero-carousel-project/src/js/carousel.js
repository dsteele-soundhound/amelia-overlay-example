// JavaScript code for implementing a simple image carousel functionality

const carousel = document.querySelector('.tm-carousel');
const slides = document.querySelectorAll('.tm-slide');
let currentSlide = 0;

function showSlide(index) {
    requestAnimationFrame(() => {
        slides.forEach((slide, i) => {
            if (i === index) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
}

// Initialize the carousel
showSlide(currentSlide);