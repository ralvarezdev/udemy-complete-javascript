'use strict';

///////////////////////////////////////
// Modal window

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
const btnScrollTo = document.querySelector('.btn--scroll-to');
const sections = document.querySelectorAll('.section');
const section1 = document.getElementById('section--1');
const navLinks = document.querySelector('.nav__links');
const nav = document.querySelector('.nav');
const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');
const lazyImgs = document.querySelectorAll('img[data-src]');
const slides = document.querySelectorAll('.slide');
const sliderBtnLeft = document.querySelector('.slider__btn--left');
const sliderBtnRight = document.querySelector('.slider__btn--right');
const dotContainer = document.querySelector('.dots');
const header = document.querySelector('.header');

const navHeight = nav.getBoundingClientRect().height;

let currSlide, maxSlides = slides.length;
let section1Coords;

const openModal = function () {
    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
};

const closeModal = function () {
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
};

btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.classList.contains('hidden'))
        closeModal();
});

const smoothScrolling = element => {
    /*
    const elementCoords = element.getBoundingClientRect();

    const [left, top] = [elementCoords.left, elementCoords.top];

    console.log(left, top);

    window.scrollBy({
      left: left,
      top: top,
      behavior: 'smooth'
    });
    */

    element.scrollIntoView({behavior: 'smooth'});
};

btnScrollTo.addEventListener('click', () => smoothScrolling(section1));

navLinks.addEventListener('click', event => {
    event.preventDefault();

    console.log(event.target);

    if (event.target.classList.contains('nav__link')) {
        console.log(event.target);
        const id = event.target.getAttribute('href');

        const element = document.getElementById(id.slice(1));

        smoothScrolling(element);
    }
});

tabsContainer.addEventListener('click', event => {
    const clicked = event.target.closest('.operations__tab');

    if (!clicked) return;

    tabs.forEach(tab => tab.classList.remove('operations__tab--active'));
    tabsContent.forEach(content => content.classList.remove('operations__content--active'));

    clicked.classList.add('operations__tab--active');

    const content = document.querySelector(`.operations__content--${clicked.dataset.tab}`);
    content.classList.add('operations__content--active');
});

const fadeNav = (event, opacity) => {
    const element = event.target;

    if (!element.classList.contains('nav__link')) return;

    const nav = element.closest('.nav');
    const siblings = nav.querySelectorAll('.nav__link');
    const logo = nav.querySelector('img');

    siblings.forEach(sibling => {
        if (sibling != element) sibling.style.opacity = opacity;
    });
    logo.style.opacity = opacity;
};

nav.addEventListener('mouseover', event => fadeNav(event, 0.5));
nav.addEventListener('mouseout', event => fadeNav(event, 1));

window.addEventListener('resize', () => section1Coords = section1.getBoundingClientRect());
window.dispatchEvent(new Event('resize'));

const stickyNav = entries => {
    const [entry] = entries;

    if (!entry.isIntersecting) nav.classList.add('sticky');
    else nav.classList.remove('sticky');
};

const headerObersever = new IntersectionObserver(stickyNav, {
    root: null,
    threshold: 0,
    rootMargin: `-${navHeight}px`
});
headerObersever.observe(header);

const revealSection = (entries, observer) => {
    const [entry] = entries;

    if (!entry.isIntersecting) return;

    entry.target.classList.remove('section--hidden');
    observer.unobserve(entry.target);
};

const sectionObserver = new IntersectionObserver(revealSection, {
    root: null,
    threshold: 0.15
});

sections.forEach(section => {
    sectionObserver.observe(section);
    section.classList.add('section--hidden');
});

const loadImg = (entries, observer) => {
    const [entry] = entries;

    if (!entry.isIntersecting) return;

    entry.target.src = entry.target.dataset.src;
    entry.target.addEventListener('load', event => event.target.classList.remove('lazy-img'));

    observer.unobserve(entry.target);
};

const imgObserver = new IntersectionObserver(loadImg, {
    root: null,
    threshold: 0,
    rootMargin: '200px'
});
console.log(lazyImgs);
lazyImgs.forEach(lazyImg => imgObserver.observe(lazyImg));

const slider = () => {
    slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${100 * i}%)`;
        dotContainer.insertAdjacentHTML('beforeend', `<button class="dots__dot" data-slide="${i}"></button>`);
    });
};
const dots = document.querySelectorAll('.dots__dot');

const activateDot = () => {
    dots.forEach(dot => dot.classList.remove('dots__dot--active'));

    const currDot = document.querySelector(`.dots__dot[data-slide="${currSlide}"]`);
    currDot.classList.add('dots__dot--active');
};

const moveSlide = () => {
    slides.forEach((slide, i) => slide.style.transform = `translateX(${100 * (i - currSlide)}%)`);
    activateDot();
};

const nextSlide = () => {
    currSlide++;
    if (currSlide === maxSlides) currSlide = 0;

    moveSlide();
};

const prevSlide = () => {
    currSlide--;
    if (currSlide < 0) currSlide = maxSlides - 1;

    moveSlide();
};

sliderBtnLeft.addEventListener('click', prevSlide);
sliderBtnRight.addEventListener('click', nextSlide);

document.addEventListener('keydown', event => {
    event.key === 'ArrowLeft' && prevSlide();
    event.key === 'ArrowRight' && nextSlide();
});

dotContainer.addEventListener('click', event => {
    if (!event.target.classList.contains('dots__dot')) return;

    const {slide} = event.target.dataset;
    currSlide = slide;

    moveSlide(slide);
    activateDot();
});
slider();

const init = () => {
    currSlide = 0;
    activateDot();
};
init();