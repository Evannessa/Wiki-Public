import { fadeIn, fadeOut } from "./animation-helpers.js";
import Helpers from "./helpers.js";
export default function Hint() {
    const hints = {
        hintElement: "",
        hintText: {},
    };
    /**
     * Initialize the hints' elements, cache the elements, etc.
     * @param {Object} params - the parameters
     * @param {String} params.elementSelector - the string selector for the hint element
     */
    function initializeHints(params) {
        const { elementSelector, hintText } = params;
        hints.element = document.querySelector(elementSelector);
        hints.hintText = hintText;
        updateHintText("default");
    }
    //for replacing certain text with icons/letters

    function updateHintText(context) {
        fadeOut(hints.element);
        const text = `<p>` + Helpers.symbolReplacer(hints.hintText[context]) + `</p>`;
        Helpers.removeChildren(hints.element);
        hints.element.appendChild(Helpers.htmlToElement(text));
    }

    return { initializeHints, updateHintText };
}
