import Helpers from "./helpers.js";
export function SideDrawer() {
    const elements = {
        drawer: "",
        toggleButtonOuter: "",
        toggleButtonInner: "",
    };
    function cacheDrawerElements(selectorData) {
        const defaultData = { drawer: ".drawer", toggleButtonOuter: ".drawer__toggle-button" };
        selectorData = { ...defaultData, ...selectorData };
        for (let element in selectorData) {
            elements[element] = document.querySelector(selectorData[element]);
        }
        console.log(elements);
        addDrawerListeners();
    }
    function addDrawerListeners() {
        const { toggleButtonOuter, toggleButtonInner, drawer } = elements;
        function toggleExpand(event) {
            const button = event.currentTarget;
            console.log(button);
            Helpers.toggleClassOnAction(button, drawer, { toggleClass: "expanded" });
        }
        if (toggleButtonOuter) toggleButtonOuter.addEventListener("click", (event) => toggleExpand(event));
        if (toggleButtonInner) toggleButtonInner.addEventListener("click", (event) => toggleExpand(event));
    }
    return { cacheDrawerElements };
}
