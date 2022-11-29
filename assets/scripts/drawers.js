import Helpers from "./helpers";
export function SideDrawer() {
    const elements = {
        drawer: "",
        toggleButtonOuter: "",
        toggleButtonInner: "",
    };
    function cacheDrawerElements(data) {
        for (let prop in data) {
            elements[prop] = data;
        }
    }
    function addDrawerListeners() {}
}
function toggleSidebar(event) {
    let el = event.currentTarget;
    let span = el.querySelector("span");
    let buttonWrapper = el.closest(".button-wrapper");
    buttonWrapper.classList.toggle("minimize");
    let hasMinimize = buttonWrapper.classList.contains("minimize");
    hasMinimize ? (span.textContent = "chevron_right") : (span.textContent = "chevron_left");
}
