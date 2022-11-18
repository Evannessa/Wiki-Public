export default class Helpers {
    static htmlToElement(html) {
        let template = document.createElement('template');
        html = html.trim(); // Never return a text node of whitespace as the result
        template.innerHTML = html;
        return template.content.firstChild;
    }
    static removeChildren(parentElement) {
        while (parentElement.firstChild) {
            parentElement.removeChild(parentElement.firstChild)
        }
    }

    static getChildFromParent(parent, childSelector) {
        return parent.querySelector(childSelector)
    }

    /**
     *
     * @param {Array} elementUpdateDataArray - array of objects holding update data
     */
    static updateMultipleProperties(elementUpdateDataArray) {
        for (const updateData of elementUpdateDataArray) {
            const { element, property, value, options } = updateData;
            Helpers.updateElementProperty(element, property, value, options)
        }
    }
    /**
     *
     */
    static updateElementProperty(element, property, value = "", options = {}) {
        const { useSetAttribute } = options;
        if (useSetAttribute) {
            element.setAttribute(property, value)
        } else {
            element[property] = value
        }
    }

    static highlightAnotherElement(actionElement, dependentElement) {
        dependentElement.classList.toggle("highlighted")
    }

    /**
     * Toggle a button's text content, and hide an element
     * @param {HTMLOrSVGElement} actionElement - the element we're adding an event listener to
     * @param {HTMLOrSVGElement} dependentElement - the element that's being manipulated
     */
    static toggleClassOnAction(actionElement, dependentElement, options = { action: "hide" }) {
        const { content1, content2, toggleButtonText, action } = options
        if (toggleButtonText) {
            Helpers.toggleButtonText(actionElement, content1, content2)
        }

        if (action === "hide") {
            dependentElement.classList.add("hidden")
            // Helpers.toggleHiddenClass(dependentElement)
        } else if (action === "show") {
            dependentElement.classList.remove("hidden")
        }
        else if (action === "expand") {
            Helpers.toggleExpandClass(dependentElement)
        } else if (action === "remove") {
            Helpers.toggleHiddenClass(dependentElement)
            // dependentElement.classList.toggle("removed")
        } else if (action === "highlight") {
            dependentElement.classList.toggle("highlighted")
        }


    }
    /**
       * Toggle a button between different content states
       * @param {DOMElement} button - the button we want to toggle
       * @param {String} content1 - the first content
       * @param {String} content2 - the second content
       */
    static toggleButtonText(button, content1, content2) {
        const currentContent = button.textContent
        button.textContent = currentContent === content1 ? content2 : content1
    }
    static toggleHiddenClass(element) {
        element.classList.toggle("hidden")
    }

    static toggleExpandClass(element) {
        element.classList.toggle("expanded")
    }
    static clearEventListenersFromAll(elementArray, eventNames) {
        elementArray.forEach((element) => {
            Helpers.clearEventListener(element, eventNames)
        })

    }
    static clearEventListener(element, eventNames) {
        let eventArray = eventNames.split(" ")
        eventArray.forEach((eventName) => {
            let event = element["added" + eventName + "Event"]
            element.removeEventListener(eventName, event)
        })
    }
    static addEventListenerToOne(element, eventNames, callback) {
        let eventArray = eventNames.split(" ")
        eventArray.forEach((eventName) => {
            element.addEventListener(eventName, callback)
            element["added" + eventName + "Event"] = callback
        })
    }

    static addEventListenerToAll(elementArray, eventNames, callback) {
        elementArray.forEach((element) => {
            Helpers.addEventListenerToOne(element, eventNames, callback)
        })
    }
    static propertyFromAction(action) {
        let propertyName;
        switch (action) {
            case "hoverAction":
                propertyName = "hover"
                break;
            default:
                propertyName = "click"
                break;
        }
        return propertyName;
    }

    static createPopover(id, outerText, innerText, options) {
        const { classes } = options;
        let classString = classes.join(" ")
        const html = `<div
            class="popupWrapper ${classString}"
            data-click-action="showTooltip"
            data-id="${id}"
            >
               <span> ${outerText}</span>
            <span class="popover can-be-hidden hidden" data-id="${id}" data-variant="left">${innerText}</span>
        </div>`
        return html
    }
    static togglePopover(id, parentElement) {
        let popover = parentElement.querySelector(`.popover[data-id='${id}']`)
        popover.classList.toggle("hidden")
    }
}
