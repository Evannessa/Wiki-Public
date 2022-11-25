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
     * Toggle a button's text content, and hide an element
     * @param {HTMLOrSVGElement} actionElement - the element we're adding an event listener to
     * @param {HTMLOrSVGElement} dependentElement - the element that's being manipulated
     */
    static toggleClassOnAction(actionElement, dependentElement, options = { action: "hide" }) {
        const { content1, content2, toggleButtonText, action } = options;
        if (toggleButtonText) {
            Helpers.toggleButtonText(actionElement, content1, content2);
        }

        if (action === "hide") {
            dependentElement.classList.add("hidden");
            // Helpers.toggleHiddenClass(dependentElement)
        } else if (action === "show") {
            dependentElement.classList.remove("hidden");
        } else if (action === "expand") {
            Helpers.toggleExpandClass(dependentElement);
        } else if (action === "remove") {
            Helpers.toggleHiddenClass(dependentElement);
            // dependentElement.classList.toggle("removed")
        } else if (action === "highlight") {
            dependentElement.classList.toggle("highlighted");
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
    static toggleHiddenClass(element) {
        element.classList.toggle("hidden");
    }

    static toggleExpandClass(element) {
        element.classList.toggle("expanded");
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
                    data-direction='${child.direction ? child.direction : ""}'

                    >
                    ${returnImage(child)}
                            <span class="btn-text">${child.id}</span>
                </button>`;
        });
        if (!returnHtml) {
            dataArray = dataArray.map((child) => Helpers.htmlToElement(child));
        }
        return dataArray;
    }
    /* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
    static openNav(nav, main) {
        nav.classList.add("expanded");
        // nav.style.width = "30vw";
        // main.style.marginLeft = "30vw";
    }

    /* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
    static closeNav(nav, main) {
        nav.classList.remove("expanded");
        // nav.style.width = "0";
        // main.style.marginLeft = "0";
    }
}
