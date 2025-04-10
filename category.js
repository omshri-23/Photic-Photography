// =======================
// Scroll to Top on Reload
// =======================
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
  };
  
  // =======================
  // Lightbox Functionality
  // =======================
  document.addEventListener("DOMContentLoaded", () => {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-image");
    const closeBtn = document.querySelector("#lightbox .close");
    const galleryImages = document.querySelectorAll(".lightbox-img");
  
    // Open lightbox when image is clicked
    galleryImages.forEach((img) => {
      img.addEventListener("click", () => {
        lightbox.style.display = "flex";
        lightboxImg.src = img.src;
      });
    });
  
    // Close button click
    closeBtn.addEventListener("click", () => {
      lightbox.style.display = "none";
      lightboxImg.src = "";
    });
  
    // Close lightbox when clicking outside the image
    lightbox.addEventListener("click", (e) => {
      if (e.target !== lightboxImg && e.target !== closeBtn) {
        lightbox.style.display = "none";
        lightboxImg.src = "";
      }
    });
  
    // =======================
    // Smooth Image Load Fade-In
    // =======================
    document.querySelectorAll(".gallery img").forEach((img) => {
      img.addEventListener("load", () => {
        img.classList.add("loaded"); // CSS transition will fade it in
      });
    });
  
    // =======================
    // Scroll Reveal Animations
    // =======================
    ScrollReveal().reveal(".hero", {
      delay: 200,
      distance: "30px",
      origin: "top",
      duration: 800,
    });
  
    ScrollReveal().reveal(".gallery", {
      delay: 400,
      distance: "30px",
      origin: "bottom",
      duration: 900,
      interval: 100,
    });
  
    ScrollReveal().reveal(".footer-content", {
      delay: 500,
      distance: "20px",
      origin: "bottom",
      duration: 800,
    });
  
    // =======================
    // Mobile Menu Toggle
    // =======================
    const menuIcon = document.getElementById("menuIcon");
    const navLinks = document.getElementById("navLinks");
    const dropdownParent = document.querySelector(".dropdown-parent");
  
    if (menuIcon && navLinks && dropdownParent) {
      // Toggle mobile menu
      menuIcon.addEventListener("click", () => {
        menuIcon.classList.toggle("active");
        navLinks.classList.toggle("active");
      });
  
      // Toggle dropdown (only on mobile)
      dropdownParent.addEventListener("click", (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          dropdownParent.classList.toggle("active");
        }
      });
    }
  });

  