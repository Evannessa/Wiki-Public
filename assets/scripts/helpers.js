export default class Helpers {
    static returnFillerText() {
        return `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. At quis risus sed vulputate odio ut enim. Habitant morbi tristique senectus et netus et. Ornare massa eget egestas purus viverra. Lorem donec massa sapien faucibus et. Aliquet risus feugiat in ante. Ut enim blandit volutpat maecenas volutpat blandit aliquam. Adipiscing enim eu turpis egestas.`;
    }
    static htmlToElement(html) {
        let template = document.createElement("template");
        html = html.trim(); // Never return a text node of whitespace as the result
        template.innerHTML = html;
        return template.content.firstChild;
    }
    static removeChildren(parentElement) {
        while (parentElement.firstChild) {
            parentElement.removeChild(parentElement.firstChild);
        }
    }

    static getChildFromParent(parent, childSelector) {
        return parent.querySelector(childSelector);
    }

    /**
     *
     * @param {Array} elementUpdateDataArray - array of objects holding update data
     */
    static updateMultipleProperties(elementUpdateDataArray) {
        for (const updateData of elementUpdateDataArray) {
            const { element, property, value, options } = updateData;
            Helpers.updateElementProperty(element, property, value, options);
        }
    }
    /**
     *
     */
    static updateElementProperty(element, property, value = "", options = {}) {
        const { useSetAttribute } = options;
        if (useSetAttribute) {
            element.setAttribute(property, value);
        } else {
            element[property] = value;
        }
    }

    static buildDocumentFragment(container = "", children = []) {
        let documentFragment = document.createDocumentFragment();
        let parent = documentFragment;
        if (container) {
            documentFragment.appendChild(container);
            parent = container;
        }
        if (children.length > 0) {
            children.forEach((child) => parent.appendChild(child));
        }
        return documentFragment;
        // ancestor.appendChild(documentFragment);
    }

    static highlightAnotherElement(actionElement, dependentElement) {
        dependentElement.classList.toggle("highlighted");
    }

    static toggleCollapsible(collapsibleElement) {
        collapsibleElement.classList.toggle("active");
        var content = collapsibleElement.nextElementSibling;
        content.classList.toggle("active");
        // if (content.style.maxHeight) {
        //     content.style.maxHeight = null;
        // } else {
        //     content.style.maxHeight = content.scrollHeight + "px";
        // }
    }

    /**
     * Swap the icon for the alternate icon, store other as data attribute
     * @param {Button} buttonElement - an HTML button element
     */
    static toggleButtonIcon(buttonElement) {
        const altIcon = buttonElement.dataset.altIcon;
        let temp = "";
        const currentIcon = buttonElement.querySelector(".material-symbols-outlined").textContent;
        temp = buttonElement.dataset.altIcon;
        buttonElement.dataset.altIcon = currentIcon;
        buttonElement.querySelector(".material-symbols-outlined").textContent = altIcon;
    }

    /**
     * Toggle a button's text content, and hide an element
     * @param {HTMLOrSVGElement} actionElement - the element we're adding an event listener to
     * @param {HTMLOrSVGElement} dependentElement - the element that's being manipulated
     * @param {Object} options -  options to customize method
     * @param {Boolean} options.addClass - class to add to the dependent element
     * @param {Boolean} options.removeClass - class to remove from the dependent element
     * @param {Boolean} options.toggleButtonText - should we toggle the button's text?
     * @param {Boolean} options.toggleButtonActive - should we toggle the button's active class?
     * @param {Boolean} options.toggleButtonActive - should we toggle the button's active class?
     * @param {Boolean} options.toggleButtonIcon - should we toggle the button's icon?
     */
    static toggleClassOnAction(
        actionElement,
        dependentElement,
        options = {
            addClass: "hidden",
            removeClass: "",
            toggleClass: "",
            toggleButtonText: false,
            toggleButtonActive: false,
            toggleButtonIcon: false,
        }
    ) {
        const { addClass, removeClass, toggleClass, toggleButtonText, toggleButtonActive, toggleButtonIcon } = options;
        if (toggleButtonText) {
            Helpers.toggleButtonText(actionElement, content1, content2);
        }
        if (toggleButtonActive) {
            Helpers.toggleButtonActive(actionElement);
        }
        if (toggleButtonIcon) {
            Helpers.toggleButtonIcon(actionElement);
        }
        if (addClass) {
            dependentElement.classList.add(addClass);
        } else if (removeClass) {
            dependentElement.classList.remove(removeClass);
        } else if (toggleClass) {
            dependentElement.classList.toggle(toggleClass);
        }
    }
    /**
     * Toggle a button between different content states
     * @param {DOMElement} button - the button we want to toggle
     * @param {String} content1 - the first content
     * @param {String} content2 - the second content
     */
    static toggleButtonText(button, content1, content2) {
        const currentContent = button.textContent;
        button.textContent = currentContent === content1 ? content2 : content1;
    }

    static clearEventListenersFromAll(elementArray, eventNames) {
        elementArray.forEach((element) => {
            Helpers.clearEventListener(element, eventNames);
        });
    }
    static clearEventListener(element, eventNames) {
        let eventArray = eventNames.split(" ");
        eventArray.forEach((eventName) => {
            let event = element["added" + eventName + "Event"];
            element.removeEventListener(eventName, event);
        });
    }

    static toggleButtonActive(btnElement) {
        btnElement.classList.toggle("active");
    }
    static encodeURI(str) {
        return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
            return "%" + c.charCodeAt(0).toString(16);
        });
    }
    static addEventListenerToOne(element, eventNames, callback) {
        let eventArray = eventNames.split(" ");
        eventArray.forEach((eventName) => {
            element.addEventListener(eventName, callback);
            element["added" + eventName + "Event"] = callback;
        });
    }

    static addEventListenerToAll(elementArray, eventNames, callback) {
        elementArray.forEach((element) => {
            Helpers.addEventListenerToOne(element, eventNames, callback);
        });
    }
    static propertyFromAction(action) {
        let propertyName;
        switch (action) {
            case "hoverAction":
                propertyName = "hover";
                break;
            default:
                propertyName = "click";
                break;
        }
        return propertyName;
    }

    static createPopover(id, outerText, innerText, options) {
        const { classes } = options;
        let classString = classes.join(" ");
        const html = `<div
            class="popupWrapper ${classString}"
            data-click-action="showTooltip"
            data-id="${id}"
            >
               <span> ${outerText}</span>
            <span class="popover can-be-hidden hidden" data-id="${id}" data-variant="left">${innerText}</span>
        </div>`;
        return html;
    }
    static togglePopover(id, parentElement) {
        let popover = parentElement.querySelector(`.popover[data-id='${id}']`);
        popover.classList.toggle("hidden");
    }
    static returnImage(imagePath, alt) {
        let string = imagePath
            ? `<img class="btn-img"
                            src="${imagePath}"
                            alt="${alt}"/>`
            : ``;
        return string;
    }
    static dataToButtons(dataArray = [], returnHtml = false) {
        function returnImage(child) {
            let string = child.imageData
                ? `<img class="btn-img"
                            src="${child.imageData?.mainImage}"
                            alt="${child.id}"/>`
                : ``;
            return string;
        }
        dataArray = dataArray.map((child) => {
            return `
                <button
                    class='${child.direction ? child.direction : ""}'
                    data-variant='color-hover'
                    data-link='${child.id}'
                    data-guid-link='${child.guid}'
                    data-click-action="navigate"
                    data-hover-action="highlightHex"
                    data-direction='${child.direction ? child.direction : ""}'

                    >
                    ${returnImage(child)}
                            <span class="btn-text dark-background" data-variant='on-hover'>${child.id}</span>
                </button>`;
        });
        if (!returnHtml) {
            dataArray = dataArray.map((child) => Helpers.htmlToElement(child));
        }
        return dataArray;
    }
    static combineActions(actionsData, otherActionsData = [], actionTypes = ["click", "press"]) {
        actionTypes.forEach((type) => {
            actionsData[type] = {
                ...actionsData[type],
                ...otherActionsData[type],
            };
        });
        console.log(actionsData);
    }

    static addListeners(actionsData, parentElement = document) {
        const clickElements = Array.from(parentElement.querySelectorAll("[data-click-action]"));
        const hoverElements = Array.from(parentElement.querySelectorAll("[data-hover-action]"));
        const changeElements = Array.from(parentElement.querySelectorAll("[data-change-action]"));
        const inputElements = Array.from(parentElement.querySelectorAll("[data-input-action]"));
        const pressElements = [document.documentElement];
        // const releaseElements = [document.documentElement];
        document.documentElement.dataset.pressAction = "handleHotkey";

        const elementSets = {
            click: { elements: clickElements, eventNames: "click" },
            change: { elements: changeElements, eventNames: "change" },
            hover: { elements: hoverElements, eventNames: "mouseenter mouseleave" },
            input: { elements: inputElements, eventNames: "input" },
            press: { elements: pressElements, eventNames: "keydown" },
        };

        for (const key in elementSets) {
            let datasetProperty = key + "Action";
            const { elements, eventNames } = elementSets[key];

            Helpers.clearEventListenersFromAll(elements, eventNames);
            Helpers.addEventListenerToAll(elements, eventNames, (event) => {
                if (event.currentTarget.dataset && event.currentTarget.dataset[datasetProperty]) {
                    let action = event.currentTarget.dataset[datasetProperty];

                    Helpers.handleAction(event, key, action, actionsData);
                }
            });
            elements.forEach((el) => {
                if (el.dataset && el.dataset[datasetProperty] && actionsData[key]) {
                    let action = el.dataset[datasetProperty];
                    if (action) {
                        actionsData[key][action].element = el;
                    }
                    // console.log(actionsData[key][action]);
                }
            });
        }
        return actionsData;
    }
    static handleAction(event, actionType, action, actionsData) {
        const currentTarget = event.currentTarget;
        if (actionsData[actionType] && actionsData[actionType][action]) {
            const actionData = actionsData[actionType][action];
            if (actionData.hasOwnProperty("handler")) {
                // const options = { currentTarget };
                actionData["handler"](event, currentTarget);
            }
        }
    }
    static symbolReplacer(text) {
        return text
            .replaceAll(/\[\[/g, "<kbd class='keyboard-key'>")
            .replaceAll(/]]/g, "</kbd>")
            .replaceAll(/"Click"/g, `<span class="material-symbols-outlined">mouse</span> Click`);
    }
    //stackoverflow.com/questions/36532307/rem-px-in-javascript
    // https:
    static convertRemToPixels(rem) {
        return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
    }
    //stackoverflow.com/questions/12009367/javascript-event-handling-scroll-event-with-a-delay
    static debounce(method, delay) {
        clearTimeout(method._tId);
        method._tId = setTimeout(function () {
            method();
        }, delay);
    }

    static dispatchLoadEvent() {
        let event = new CustomEvent("generatedElementsLoaded", {
            // detail: {backgroundColor: 'yellow'}
        });
        document.dispatchEvent(event);
    }
    static waitForImages(parentElement, selector = "image") {
        Array.from(parentElement.querySelectorAll(selector)).addEventListener("load", (event) => {
            let img = event.currentTarget;
            if (img.complete) {
                // this.lightbox.querySelector(".spotlight-image").setAttribute("src", img.getAttribute("src"));
            }
        });
    }

    static notify() {}

    /**
     * @author Yong Wang
     * @link https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
     * @param {String} selector  - selector for the element we're waiting for
     */
    static async waitForElm(selector) {
        return new Promise((resolve) => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver((mutations) => {
                if (document.querySelector(selector)) {
                    resolve(document.querySelector(selector));
                    observer.disconnect();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
            });
        });
    }
}
