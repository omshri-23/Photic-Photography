
// =======================
// Scroll to Top on Reload
// =======================
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};

// =======================
// Image Slider
// =======================
let index = 0;

function moveSlide(step) {
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slide');
    index += step;

    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;

    slider.style.transform = `translateX(-${index * 100}%)`;
}

setInterval(() => moveSlide(1), 3000);

// =======================
// Menu Icon Toggle
// =======================
const menuIcon = document.getElementById("menuIcon");
const navLinks = document.getElementById("navLinks");
const dropdownParent = document.querySelector(".dropdown-parent");

// Toggle nav menu on mobile
menuIcon.addEventListener("click", () => {
    menuIcon.classList.toggle("active");
    navLinks.classList.toggle("active");
});

// Toggle dropdown on mobile only
dropdownParent.addEventListener("click", (e) => {
    if (window.innerWidth <= 768) {
        e.preventDefault();
        dropdownParent.classList.toggle("active");
    }
});


// Toggle dropdown on mobile
dropdownParent.addEventListener("click", (e) => {
    if (window.innerWidth <= 768) {
        e.preventDefault();
        dropdownParent.classList.toggle("active");
    }
});

// =======================
// Lightbox Viewer
// =======================
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-image');
const closeBtn = document.querySelector('.close');

document.querySelectorAll('.lightbox-img').forEach(img => {
    img.addEventListener('click', () => {
        lightbox.style.display = 'flex';
        lightboxImg.src = img.src;
    });
});

closeBtn.addEventListener('click', () => {
    lightbox.style.display = 'none';
});

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        lightbox.style.display = 'none';
    }
});

// =======================
// Scroll Reveal Animations
// =======================
ScrollReveal().reveal('.hero', { delay: 200, distance: '30px', origin: 'top', duration: 1000 });
ScrollReveal().reveal('.gallery', { delay: 400, distance: '30px', origin: 'bottom', duration: 1000 });
ScrollReveal().reveal('.about', { delay: 600, distance: '30px', origin: 'left', duration: 1000 });
ScrollReveal().reveal('.categories', { delay: 800, distance: '30px', origin: 'right', duration: 1000 });
ScrollReveal().reveal('.testimonials', { delay: 1000, distance: '30px', origin: 'bottom', duration: 1000 });
ScrollReveal().reveal('.contact', { delay: 1200, distance: '30px', origin: 'top', duration: 1000 });
ScrollReveal().reveal('.side-section', { interval: 200 });
ScrollReveal().reveal('.testimonial-card', { interval: 200, origin: 'bottom', distance: '20px' });

// =======================
// Contact Form Submit
// =======================
const contactForm = document.querySelector(".contact-form");
if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
        e.preventDefault();
        alert("Thanks for reaching out! I'll get back to you soon.");
    });
}

// =======================
// Before / After Slider
// =======================
document.querySelectorAll('.comparison-wrapper').forEach(wrapper => {
    const slider = wrapper.querySelector('.ba-slider');
    const resize = wrapper.querySelector('.ba-resize');

    slider.addEventListener('input', () => {
        resize.style.width = `${slider.value}%`;
    });
});

// =======================
// Video Section
// =======================
document.querySelectorAll('.video-wrapper').forEach(wrapper => {
    const video = wrapper.querySelector('video');
    const btn = wrapper.querySelector('.mute-btn');

    // Autoplay on hover
    wrapper.addEventListener('mouseenter', () => {
        video.play();
    });

    wrapper.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0;
    });

    // Toggle mute/unmute
    btn.addEventListener('click', () => {
        video.muted = !video.muted;
        btn.textContent = video.muted ? '🔇' : '🔊';
    });
});
