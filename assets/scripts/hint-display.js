import { fadeIn, fadeOut } from "./animation-helpers.js";
import Helpers from "./helpers.js";
export default function Hint() {
    const hints = {
        hintElement: "",
        buttonElement: "",
        hintText: {},
    };
    function toggleDisplay(element) {
        Helpers.toggleClassOnAction(hints.buttonElement, hints.element, {
            toggleButtonActive: true,
            toggleClass: "hidden",
        });
    }
    const actions = {
        click: {
            toggleDisplay: {
                handler: (event, element) => {
                    toggleDisplay(element);
                },
                hotkey: 72,
            },
        },
    };
    /**
     * Initialize the hints' elements, cache the elements, etc.
     * @param {Object} params - the parameters
     * @param {String} params.elementSelector - the string selector for the hint element
     */
    function initializeHints(params) {
        const { elementSelector, hintText } = params;
        hints.element = document.querySelector(elementSelector);
        hints.buttonElement = document.querySelector(".hint-toggle");
        hints.hintText = hintText;
        updateHintText("default");
        // addListeners();
    }
    function getActions() {
        return actions;
    }
    //for replacing certain text with icons/letters

    function updateHintText(context) {
        fadeOut(hints.element);
        const text = `<p>` + Helpers.symbolReplacer(hints.hintText[context]) + `</p>`;
        Helpers.removeChildren(hints.element);
        hints.element.appendChild(Helpers.htmlToElement(text));
    }

    return { initializeHints, updateHintText, getActions };
}
