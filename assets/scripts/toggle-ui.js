import { SideDrawer } from "./drawers.js";
import { Snackbar } from "./snackbar.js";
import Card from "./cards.js";

document.addEventListener("DOMContentLoaded", function (event) {
    console.log("Toggle UI Has been loaded");
    registerSideViewGalleryListeners();
    let mobileNav = new SideDrawer();
    mobileNav.cacheDrawerElements({
        drawer: ".drawer.main-nav-mobile",
        toggleButtonOuter: ".main-nav-toggle.outer",
        toggleButtonInner: ".main-nav-toggle.inner",
    });

    let ourSnackbar = new Snackbar();
    ourSnackbar.initializeSnackbar();

    handleCards();
});
function handleCards() {
    let cards = Array.from(document.querySelectorAll(".card"));
    cards.forEach((cardEl) => {
        let card = new Card();
        card.initializeCard(cardEl);
    });
}

function registerSideViewGalleryListeners() {
    let sideView = document.querySelector(".side-view");
    let allGalleries = Array.from(document.querySelectorAll(".img-gallery"));
    allGalleries.forEach((gal) =>
        Array.from(gal.children).forEach((child) => {
            child.addEventListener("click", (event) => {
                console.log("Clicked image");
                const clickedImage = event.currentTarget;
                const galleryImages = Array.from(gal.children);
                const mainImageSrc = clickedImage.getAttribute("src");
                const otherImageSrcArray = galleryImages.map((img) => img.getAttribute("src"));
                document.querySelector("body").append(createLightboxHTML(mainImageSrc, otherImageSrcArray));
                lightbox && lightbox.focus();
            });
            child.addEventListener("mouseenter", (event) => {
                let img = event.currentTarget;
                let src = img.getAttribute("src");
                sideView.querySelector("img").setAttribute("src", src);
                let captionText = img.getAttribute("title") || img.getAttribute("alt");

                if (captionText) {
                    sideView.querySelector(".caption").textContent = captionText;
                }
            });
            child.addEventListener("mouseleave", (event) => {
                sideView.querySelector("img").setAttribute("src", "");
                sideView.querySelector(".caption").textContent = "";
            });
        })
    );
}

// let mainImage;
let closeButton;
let lightbox;

function htmlToElement(html) {
    var template = document.createElement("template");
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

/**
 * Returns an HTML element created with image soures from the gallery interacted with
 * @param {String} mainImageSrc - string of image source
 * @param {Array} otherImageSrcArray = string array of image sources
 * @returns an HTML Element created with data from images in clicked gallery
 */
function createLightboxHTML(mainImageSrc, otherImageSrcArray) {
    const lightboxHTML = `
<div class="lightbox">
    <button class="lightbox-close-button">X</button>
	<div class="spotlight-image-container">
		<img class="spotlight-image" src="${mainImageSrc}" />
	</div>
	<div class="other-images">

	</div>
`;
    const lightbox = htmlToElement(lightboxHTML);
    let otherImages = createImageList(otherImageSrcArray, mainImageSrc);
    otherImages.forEach((img) => {
        lightbox.querySelector(".other-images").append(img);
    });
    if (lightbox) {
        mainImage = lightbox.querySelector(".spotlight-image");
        closeButton = lightbox.querySelector(".lightbox-close-button");
        closeButton.addEventListener("click", (event) => {
            lightbox.remove();
        });
    }

    return lightbox;
}

function createImageList(imgSrcArray = [], currentMainSrc) {
    let imgArray = imgSrcArray.map((src) => {
        return htmlToElement(`<img class="thumbnail-image" src="${src}" />`);
    });
    imgArray.forEach((item) => {
        item.addEventListener("click", (event) => {
            let currentTarget = event.currentTarget;
            let src = currentTarget.getAttribute("src");
            mainImage.setAttribute("src", src);
            currentMainSrc = mainImage.getAttribute("src");
            imgArray.forEach((img) => img.classList.remove("current"));
            if (currentMainSrc === src) {
                item.classList.add("current");
            }
        });
    });
    return imgArray;
}
