"use strict";
import { LocationHelpers as LH } from "./location-functions.js";

import Helpers from "./helpers.js";

export const LocationUIFactory = function (
    prefix,
    defaultData,
    containerElement,
    allLocations,
    fullStringTitle = true
) {
    // let containerElement = containerElement;

    function getContainer() {
        return containerElement;
    }
    const uiData = {
        title: {
            contentCallback: (locationData) => {
                const { id: name, type } = locationData;
                if (!fullStringTitle) {
                    return name;
                }

                let grandparent = " ";
                if (type === "area" || type === "site") {
                    grandparent = locationData.parentName;
                }
                if (grandparent.trim()) grandparent = "| " + grandparent;
                let value = `${defaultData.id} ${grandparent} | ${name}`;
                return value;
            },
            defaultValue: defaultData.id,
            contentFormat: "text",
        },
        "card-title": {
            contentCallback: (locationData) => {
                const { id: name } = locationData;
                return name;
            },
            defaultValue: defaultData.id,
            contentFormat: "text",
        },
        portrait: {
            contentCallback: (locationData) => {
                return dataToImage(locationData.imageData?.mainImage, locationData.id);
            },
            defaultValue: dataToImage(defaultData.imageData?.mainImage, defaultData.id),
            contentFormat: "singleElement",
        },
        tags: {
            contentCallback: (locationData) => {
                return locationData.flavorData?.tags;
            },
            defaultValue: "none",
            contentFormat: "text",
        },
        description: {
            contentCallback: (locationData) => {
                return locationData.flavorData?.description || Helpers.returnFillerText();
            },
            defaultValue: defaultData.flavorData.description || Helpers.returnFillerText(),
            contentFormat: "text",
        },
        "connections-title": {
            contentCallback: (locationData) => {
                const { id: name, type } = locationData;
                // return `${type}s connected to ${name}`;
                return `Connected ${type}s`;
            },
            contentFormat: "text",
            defaultValue: `Connected places`,
            // defaultValue: `Places connected to ${defaultData.id}`,
        },
        connections: {
            contentCallback: (locationData) => {
                let connections = locationData.connections.map((loc) => loc.element);
                if (connections.length > 0) connections = dataToButtons(connections);
                //also create connection buttons
                //refactor this to be placed elsewhere
                return connections;
            },
            contentFormat: "elementArray",
            defaultValue: dataToButtons(defaultData.connections),
            hideOnEmpty: ["connections-title"],
        },
        "children-title": {
            contentCallback: (locationData) => {
                const { id: name, type } = locationData;
                const childType = LH.getChildType(type);
                return `Inner ${childType}s`;
                // return `${childType}s in ${name}`;
            },
            contentFormat: "text",
            // defaultValue: `Regions within ${defaultData.name}`,
            defaultValue: `Inner Regions`,
        },
        children: {
            contentCallback: (locationData) => {
                let childLocations = locationData.children;
                if (childLocations.length > 0) childLocations = dataToButtons(childLocations);
                return childLocations;
            },
            hideOnEmpty: ["children-title"],
            contentFormat: "elementArray",
            defaultValue: dataToButtons(defaultData.children),
        },
        "cast-title": {
            contentCallback: (locationData) => {
                const propertyName = "People";
                return generateTitle(propertyName, locationData);
            },
            contentFormat: "text",
            defaultValue: `People`,
            // defaultValue: `People in ${defaultData.name}`,
        },
        cast: {
            contentCallback: (locationData) => {
                return dataToLinks(locationData.encounterData.cast) || "none";
            },
            hideOnEmpty: ["cast-title"],
            contentFormat: "elementArray",
            defaultValue: dataToLinks(defaultData.cast),
        },
        "factions-title": {
            contentCallback: (locationData) => {
                const propertyName = "Factions";
                return generateTitle(propertyName, locationData);
            },
            contentFormat: "text",
            defaultValue: `Factions`,
        },
        factions: {
            contentCallback: (locationData) => {
                return dataToLinks(locationData.encounterData.factions) || "none";
            },
            hideOnEmpty: ["factions-title"],
            contentFormat: "elementArray",
            defaultValue: dataToLinks(defaultData.factions),
        },
    };

    function generateTitle(propertyName, locationData) {
        if (!locationData) {
            return "none";
        }
        const parentName = locationData.id;
        return `${propertyName}`;
        // return `${propertyName} in ${parentName}`;
    }
    const resetToDefault = () => {
        updateUIData(defaultData, true);
    };
    function dataToLinks(dataArray = []) {
        dataArray = dataArray
            .map((child) => {
                if (child.hasPage) {
                    let path = `/assets/clans/${child.clan}/${child.imageUrl}.webp`;
                    return `<div class="map-cast-card"><a class="map-link" href='/${child.pageUrl}'>
                            ${Helpers.returnImage(path, child.id)}
                            ${child.id}
                        </a></div>`;
                } else {
                    return Helpers.createPopover(child.id, child.id, child.description, { classes: ["map-link"] });
                }
            })
            .map((child) => Helpers.htmlToElement(child));
        return dataArray;
    }
    function dataToImage(imagePath, alt) {
        return Helpers.htmlToElement(`<img class="card-portrait__img"
                            src="${imagePath}"
                            alt="${alt}"/>`);
    }
    function dataToButtons(dataArray = []) {
        function returnImage(child) {
            let string = child.imageData
                ? `<img class="btn-img"
                            src="${child.imageData?.mainImage}"
                            alt="${child.id}"/>`
                : ``;
            return string;
        }
        dataArray = dataArray
            .map((child) => {
                return `
                <button
                    class='${child.direction ? child.direction : ""}'
                    data-variant='color-hover'
                    data-link='${child.id}'
                    data-guid-link='${child.guid}'
                    data-click-action="navigate"
                    data-hover-action="highlightHex">
                    ${returnImage(child)}
                            <span class="btn-text">${child.id}</span>
                </button>`;
            })
            .map((child) => Helpers.htmlToElement(child));
        return dataArray;
    }

    const getUIData = (property) => {
        return uiData[property];
    };
    const initializeUIData = () => {
        const suffixes = Object.keys(uiData);
        suffixes.forEach((suffix) => {
            uiData[suffix].element = document.querySelector(`.${prefix}__${suffix}`);
        });
        resetToDefault();
    };

    const updateUIData = (locationData, reset = false) => {
        const suffixes = Object.keys(uiData);
        suffixes.forEach((suffix) => {
            const uiElement = uiData[suffix].element;
            if (!uiElement) return;
            if (uiElement.classList.contains("removed")) {
                uiElement.classList.remove("removed");
            }
            if (uiElement.parentNode.classList.contains("removed")) {
                uiElement.parentNode.classList.remove("removed");
            }
        });

        suffixes.forEach((suffix) => {
            const uiElement = uiData[suffix].element;
            if (!uiElement) return;

            const uiContentFormat = uiData[suffix].contentFormat;
            Helpers.removeChildren(uiElement);
            const content = reset ? uiData[suffix].defaultValue : uiData[suffix].contentCallback(locationData);

            if (content === "none" || content === "..." || !content || content.length === 0) {
                const hideOnEmpty = uiData[suffix].hideOnEmpty;
                if (hideOnEmpty && hideOnEmpty.length > 0) {
                    hideOnEmpty.forEach((objKey) => {
                        const obj = uiData[objKey];
                        obj.element.classList.add("removed");
                        obj.element.parentNode.classList.add("removed");
                        uiElement.classList.add("removed");
                    });
                }
                return;
            }
            if (uiContentFormat === "text") {
                uiElement.textContent = content;
            } else if (uiContentFormat === "elementArray") {
                content.forEach((el) => {
                    if (typeof el === "object" && el instanceof Element) uiElement.appendChild(el);
                });
            } else if (uiContentFormat === "singleElement") {
                if (typeof content === "object" && content instanceof Element) uiElement.appendChild(content);
            }
        });
    };
    return { updateUIData, initializeUIData, getUIData, resetToDefault, getContainer };
};
