//gist.github.com/fabrizzio-gz/8458bb13418e5bb6ea49133ba122930c
//https://developer.mozilla.org/en-US/docs/Web/API/Element/scroll_event
// import { FamilyTreeModule.svgElement, jumpToGeneration, toggleButton, resetButton, FamilyTreeModule.defaultTransform } from "./family-tree.js";
import { FamilyTreeModule } from "./family-tree.js";

/**
 * set the event listeners for all of the controls
 */
export function setZoomEventListeners() {
    // resetButton.onclick = () => reset();
    document
        .querySelectorAll(".jump-gen")
        .forEach((element) => element.addEventListener("click", FamilyTreeModule.jumpToGeneration));
    document.addEventListener("keydown", (event) => {
        event.preventDefault();
        const { code } = event;
        switch (code) {
            case "KeyA":
            case "ArrowLeft":
                pan("left");
                // Left pressed
                break;
            case "KeyD":
            case "ArrowRight":
                // Right pressed
                pan("right");
                break;
            case "KeyW":
            case "ArrowUp":
                // Up pressed
                pan("up");
                break;
            case "KeyS":
            case "ArrowDown":
                // Down pressed
                pan("down");
                break;
            case "Equal":
                zoom("in");
                break;
            case "Minus":
                zoom("out");
                break;
        }
    });
}

// Zoom and Pan Functions
// code from here: https://onestepcode.com/zoom-pan-effect-FamilyTreeModule.svgElement/
const zoom = (direction) => {
    const { scale, x, y } = getTransformParameters(FamilyTreeModule.svgElement);
    let dScale = 0.1;
    if (direction == "out") dScale *= -1;
    if (scale == 0.1 && direction == "out") dScale = 0;
    FamilyTreeModule.svgElement.style.transform = getTransformString(scale + dScale, x, y);
};
const getTransformParameters = (element) => {
    const transform = element.style.transform;
    let scale = 1,
        x = 0,
        y = 0;
    if (transform.includes("scale")) scale = parseFloat(transform.slice(transform.indexOf("scale") + 6));
    if (transform.includes("translateX")) x = parseInt(transform.slice(transform.indexOf("translateX") + 11));
    if (transform.includes("translateY")) y = parseInt(transform.slice(transform.indexOf("translateY") + 11));
    return { scale, x, y };
};
//reset back to default transform
export function reset() {
    FamilyTreeModule.svgElement.style.transform = FamilyTreeModule.defaultTransform;
}
const getTransformString = (scale, x, y) => `scale(${scale}) translateX(${x}%) translateY(${y}%)`;

const pan = (direction) => {
    const { scale, x, y } = getTransformParameters(FamilyTreeModule.svgElement);
    let dx = 0,
        dy = 0;
    switch (direction) {
        case "left":
            dx = 10;
            break;
        case "right":
            dx = -10;
            break;
        case "up":
            dy = 10;
            break;
        case "down":
            dy = -10;
            break;
    }
    FamilyTreeModule.svgElement.style.transform = getTransformString(scale, x + dx, y + dy);
};

export const setTransformString = (transformString) => {
    FamilyTreeModule.svgElement.style.transform = transformString;
};

export function toggleSidebar(event) {
    let el = event.currentTarget;
    let span = el.querySelector("span");
    let buttonWrapper = el.closest(".button-wrapper");
    buttonWrapper.classList.toggle("minimize");
    let hasMinimize = buttonWrapper.classList.contains("minimize");
    hasMinimize ? (span.textContent = "chevron_right") : (span.textContent = "chevron_left");
}
