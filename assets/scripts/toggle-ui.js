import { SideDrawer } from "./drawers.js";
import { Snackbar } from "./snackbar.js";
import Card from "./cards.js";
import Helpers from "./helpers.js";
//https://www.w3schools.com/howto/howto_js_image_comparison.asp
function initComparisons() {
    console.log("initializing comparisons");
    var x, i;
    /* Find all elements with an "overlay" class: */
    x = document.getElementsByClassName("overlay");
    console.log(x);
    for (i = 0; i < x.length; i++) {
        /* Once for each "overlay" element:
    pass the "overlay" element as a parameter when executing the compareImages function: */
        compareImages(x[i]);
    }
    function compareImages(img) {
        var slider,
            img,
            clicked = 0,
            w,
            h;
        /* Get the width and height of the img element */
        w = img.offsetWidth;
        h = img.offsetHeight;
        /* Set the width of the img element to 50%: */
        img.style.width = w / 2 + "vw";
        /* Create slider: */
        slider = document.createElement("DIV");
        slider.setAttribute("class", "img-comp-slider");
        /* Insert slider */
        img.parentElement.insertBefore(slider, img);
        /* Position the slider in the middle: */
        // slider.style.top = h / 2 - slider.offsetHeight / 2 + "vh";
        slider.style.left = w / 2 - slider.offsetWidth / 2 + "vw";
        /* Execute a function when the mouse button is pressed: */
        slider.addEventListener("mousedown", slideReady);
        /* And another function when the mouse button is released: */
        window.addEventListener("mouseup", slideFinish);
        /* Or touched (for touch screens: */
        slider.addEventListener("touchstart", slideReady);
        /* And released (for touch screens: */
        window.addEventListener("touchend", slideFinish);
        function slideReady(e) {
            /* Prevent any other actions that may occur when moving over the image: */
            e.preventDefault();
            /* The slider is now clicked and ready to move: */
            clicked = 1;
            /* Execute a function when the slider is moved: */
            window.addEventListener("mousemove", slideMove);
            window.addEventListener("touchmove", slideMove);
        }
        function slideFinish() {
            /* The slider is no longer clicked: */
            clicked = 0;
        }
        function slideMove(e) {
            var pos;
            /* If the slider is no longer clicked, exit this function: */
            if (clicked == 0) return false;
            /* Get the cursor's x position: */
            pos = getCursorPos(e);
            /* Prevent the slider from being positioned outside the image: */
            if (pos < 0) pos = 0;
            if (pos > w) pos = w;
            /* Execute a function that will resize the overlay image according to the cursor: */
            slide(pos);
        }
        function getCursorPos(e) {
            var a,
                x = 0;
            e = e.changedTouches ? e.changedTouches[0] : e;
            /* Get the x positions of the image: */
            a = img.getBoundingClientRect();
            /* Calculate the cursor's x coordinate, relative to the image: */
            x = e.pageX - a.left;
            /* Consider any page scrolling: */
            x = x - window.pageXOffset;
            return x;
        }
        function slide(x) {
            /* Resize the image: */
            img.style.width = x + "vw";
            /* Position the slider: */
            slider.style.left = img.offsetWidth - slider.offsetWidth / 2 + "vw";
        }
    }
}
function handleLoad() {
    let layout = document.querySelector("main").dataset.layout;
    switch (layout) {
        case "locations_map":
        case "family-tree":
        case "search-page":
            console.log("Family tree or map");
            break;
        case "landing-page":
            setupScrollButton();
            setUpObserver();
            Helpers.dispatchLoadEvent();
            break;
        default:
            Helpers.dispatchLoadEvent();
            break;
    }
}
function setupScrollButton() {
    document.querySelector("[data-click-action='scroll']").addEventListener("click", () => {
        let scrollEl = document.querySelector(".story-bar");
        scrollEl.scrollIntoView({ block: "center" });
    });
}
function setUpObserver() {
    function callback(entries, observer) {
        const storyBarItems = Array.from(document.querySelectorAll(".story-bar-item"));
        const scrollButton = document.querySelector("[data-click-action='scroll']");
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                storyBarItems.forEach((el) => el.classList.add("visible"));
                scrollButton.classList.remove("visible");
            } else {
                storyBarItems.forEach((el) => el.classList.remove("visible"));
                scrollButton.classList.add("visible");
            }
        });
    }
    let options = {
        //   root: document.querySelector('#scrollArea'),
        rootMargin: "0px",
        threshold: 0.25,
    };

    let observer = new IntersectionObserver(callback, options);

    let target = document.querySelector(".section-1");
    observer.observe(target);

    // the callback we setup for the observer will be executed now for the first time
    // it waits until we assign a target to our observer (even if the target is currently not visible)
}

document.addEventListener("DOMContentLoaded", function (event) {
    handleLoad();

    console.log("Toggle UI Has been loaded");
    registerSideViewGalleryListeners();
    const mobileNav = new SideDrawer();
    mobileNav.cacheDrawerElements({
        drawer: ".drawer.main-nav-mobile",
        toggleButtonOuter: ".main-nav-toggle.outer",
        toggleButtonInner: ".main-nav-toggle.inner",
    });
    if (document.querySelector("main").dataset.layout === "note") {
        const button = Helpers.createElement(
            "button",
            "circle-button, cards-drawer-toggle",
            "",
            { variant: "fab" },
            "chevron_left"
        );
        document.querySelector("main")?.appendChild(button);

        const mobileCardView = new SideDrawer();
        mobileCardView.cacheDrawerElements({
            drawer: ".drawer.mobile-cards",
            toggleButtonOuter: ".cards-drawer-toggle",
            toggleButtonInner: ".drawer.mobile-cards .drawer__toggle-button.inner",
        });
    }

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
