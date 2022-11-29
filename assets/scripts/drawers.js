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
        console.log(selectorData);
        for (let element in selectorData) {
            elements[element] = document.querySelector(selectorData[element]);
        }
        addDrawerListeners();
    }
    function addDrawerListeners() {
        const { toggleButtonOuter, toggleButtonInner, drawer } = elements;
        console.log(elements);
        function toggleExpand() {
            Helpers.toggleClassOnAction(toggleButtonOuter, drawer, { action: "expand" });
        }
        if (toggleButtonOuter) toggleButtonOuter.addEventListener("click", (event) => toggleExpand(event));
        if (toggleButtonInner) toggleButtonInner.addEventListener("click", (event) => toggleExpand(event));
    }
    return { cacheDrawerElements };
}
