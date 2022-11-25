"use strict";
import { Modal } from "./modal.js";
import { LocationHelpers } from "./location-functions.js";
import { LocationUIFactory } from "./create-ui.js";
import { populateLocations } from "./hex-grid-generator.js";
import { TabsHandler } from "./tabs.js";
import hoverHandler from "./hover-handler.js";
import Helpers from "./helpers.js";

export const regionViewerModule = (function () {
    const previousLocationData = {};
    let rootLocationData = {};
    let locationHeirarchyStack = []; // for parents/ancstors specifically
    let lightbox;
    const uiHandlers = {
        selectedLocationUI: "",
        hoveredLocationUI: "",
        tabsHandler: "",
        hoverHandler: "",
    };
    const state = {};
    let normalizedLocations;
    let locationIDs;
    let locationData;
    let globalData;
    const directionElements = {
        up: {
            parent: "",
            children: [],
        },
        down: {
            parent: "",
            children: [],
        },
        left: {
            parent: "",
            children: [],
        },
        right: {
            parent: "",
            children: [],
        },
    };
    const locationActionsData = {
        selectedLocationContainer: "",
        actions: {
            click: {
                fold: {
                    handler: (event) => {
                        //TODO: Refactor this so that the element's being cached
                        const btnElement = event.currentTarget;
                        Helpers.toggleButtonActive(btnElement);
                        let infoCard = document.querySelector(".location-info__content");
                        infoCard.classList.toggle("flat");
                    },
                },
                switchTab: {
                    handler: (event) => {
                        const tab = event.currentTarget;
                        const target = tab.dataset.target;
                        switchTabWrapper(target);
                        // uiHandlers.tabsHandler.switchTab(target);
                    },
                },
                toggle: {
                    handler: (event) => {
                        let currentTarget = event.currentTarget;
                        selectedLocationElements.imageContainer.classList.toggle("hidden");
                        selectedLocationElements.imageContainer.classList.toggle("image-mode");
                        // Helpers.toggleButtonText(currentTarget, "Hide Image", "Show Image");
                        // hide the children
                        selectedLocationElements.hexChildren.forEach((hex) => {
                            Helpers.toggleClassOnAction(currentTarget, hex, { action: "remove" });
                        });
                    },
                },
                reset: {
                    handler: () => {
                        // backOne()
                        resetZoom();
                    },
                },
                backOne: {
                    handler: () => {
                        backToParent();
                    },
                },
                expand: {
                    handler: (event) => {
                        //TODO: refactor to keep track of these elsewhere
                        let nav = document.querySelector(".location-info");
                        let main = document.querySelector(".location-map .location-map");
                        if (nav.classList.contains("expanded")) {
                            Helpers.closeNav(nav, main);
                        } else {
                            Helpers.openNav(nav, main);
                        }
                    },
                },
                open: {
                    handler: (event) => {
                        let collapsibleElement = event.currentTarget;
                        Helpers.toggleCollapsible(collapsibleElement);
                    },
                },
                selectLocation: {
                    handler: (event) => {
                        event.preventDefault();
                        const locationEl = event.currentTarget;
                        selectLocation(locationEl, "", "fromParent");
                    },
                },
                navigate: {
                    handler: (event) => {
                        const current = event.currentTarget;
                        const targetId = current.dataset.guidLink;
                        const locationEl = document.querySelector(`[data-guid='${targetId}']`);
                        if (!locationEl) {
                            locationData = getLocationsByProperty("guid", targetId)[0];
                        }
                        let method = "fromParent";
                        console.log(current.classList);
                        if (current.classList.contains("connection-hex")) {
                            method = "fromConnection";
                        }
                        selectLocation(locationEl, locationData, method);
                    },
                },
                showTooltip: {
                    handler: (event) => {
                        const current = event.currentTarget;
                        const parentElement = current.parentNode;
                        let id = current.dataset.id;
                        Helpers.togglePopover(id, parentElement);
                    },
                },
            },
            hover: {
                displayInfo: {
                    handler: (event) => {
                        uiHandlers.hoverHandler.updateHoverData(event);
                        let locationEl = event.currentTarget;
                        let shouldHide = event.type === "mouseleave";
                        displayInfo(locationEl, shouldHide);
                    },
                },
                highlightHex: {
                    handler: (event) => {
                        const actionElement = event.currentTarget;
                        const targetId = actionElement.dataset.guidLink;
                        const hex = document.querySelector(`[data-guid='${targetId}']`);
                        Helpers.toggleClassOnAction(actionElement, hex, { action: "highlight" });
                        displayInfo(hex, false);
                    },
                },
            },
            press: {
                handleHotkey: {
                    handler: (event) => {
                        //if we're hovering a hex, select that location first
                        const current = uiHandlers.hoverHandler.getHoverDataProperty("current");
                        if (current) {
                            // const locationEl = getLocationDataFromElement(current);
                            selectLocation(current, "", "fromParent");
                        }
                        uiHandlers.tabsHandler.handleHotkey(event);
                        if (!uiHandlers.selectedLocationUI.getContainer().classList.contains("expanded")) {
                            expandSidebar();
                        }
                    },
                },
            },
            release: {
                handleKeyRelease: {
                    handler: (event) => {
                        // let shouldHide = uiHandlers.hoverHandler.updateHoverData(event);
                        // // let locationEl = event.currentTarget
                        // displayInfo("", shouldHide);
                    },
                },
            },
        },
    };

    const selectedLocationElements = {
        element: "", // the hex element containing data for current location
        container: "", // the container of all the hex elements
        imageContainer: "", //the container for the main "image" represnting the selected location
        hexChildren: "",
        currentLocationData: "",
    };
    const locationDataPath = document.querySelector(".location-map .location-map").dataset.path;
    fetch(`/assets/data/${locationDataPath}`)
        .then((response) => response.json())
        .then((data) => {
            processData(data);
        });
    function addChildren() {
        locationData = locationData.map((loc) => {
            // let connections = [];
            let connectedElement;
            for (let connection of loc.connections) {
                connectedElement = locationData.find((conLoc) => conLoc.guid === connection.destinationId);
                connection.element = connectedElement;
                // debugger;
            }
            const children = locationData.filter((childLoc) => childLoc.parent === loc.guid);
            const parentName = locationData.find((parentLoc) => parentLoc.guid === loc.parent)?.id || "";

            return {
                ...loc,
                children,
                parentName,
                // connections: connections,
            };
        });
    }

    function processData(data) {
        locationData = data.sheets[0].lines;
        const baseAssetPath = data.sheets.find((sheet) => sheet.name === "ourMetadata").lines[0].baseAssetPath;
        locationData = locationData.map((loc) => {
            let oldImage = loc.imageData.mainImage;
            const newImage = oldImage
                ? baseAssetPath + "/" + oldImage.split("\\").pop()
                : "https://source.boringavatars.com/marble/160";
            return { ...loc, imageData: { ...loc.imageData, mainImage: newImage } };
        });

        addChildren();

        normalizedLocations = locationData.reduce((data, item) => {
            data[item.id] = item;
            return data;
        }, {});
        locationIDs = locationData.map((location) => location.id);
        state.locations = { byId: normalizedLocations, allIds: locationIDs };

        globalData = getLocationsByProperty("type", "global")[0];
        globalData.baseAssetPath = data.sheets.find((sheet) => sheet.name === "ourMetadata").lines[0].baseAssetPath;

        createUIElements(locationData);
        uiHandlers.tabsHandler = new TabsHandler({
            lore: {
                hotkey: 76, // l key
                target: "Lore",
            },
            geography: {
                hotkey: 71, // g key
                target: "Geography",
            },
            cast: {
                hotkey: 67, // c key
                target: "Cast",
            },
        });
        uiHandlers.tabsHandler.initializeTabs();
    }
    /**
     * initialize the UI elements for our map
     */
    function createUIElements(locationData) {
        const { id, guid, imageData } = globalData;
        const container = document.querySelector(".location__container.parent-list"),
            image = imageData.mainImage;

        addAccentColor(container, locationData);
        //TODO: cache this somewhere
        document.querySelector(".decor.bottom-card h3").textContent = locationData.id;

        const children = getLocationsByProperty("parent", guid);
        initializeConnectionAreas();
        createImageDisplay(globalData, container);

        createLocationGrid(
            "",
            { parentName: id, image, children, rowsAndColumns: { rows: 5, columns: 5 } },
            { svgContainer: container }
        );

        cacheLocationElements("", container, globalData); //store the current location information once it's all created
        rootLocationData = { ...selectedLocationElements };

        // document.querySelector(".decor.bottom-card img").src = locationData.imageData.mainImage;
        // document.querySelector(".decor.bottom-card h3").textContent = locationData.id;
        uiHandlers.selectedLocationUI = new LocationUIFactory(
            "location-info",
            globalData,
            document.querySelector(".location-info"),
            state,
            true,
            document.querySelector(".decor.bottom-card")
        );

        uiHandlers.selectedLocationUI.initializeUIData();

        uiHandlers.hoveredLocationUI = new LocationUIFactory(
            "child-location-info",
            globalData,
            document.querySelector(".location-hover-info"),
            state,
            false,
            document.querySelector(".top-card")
        );
        uiHandlers.hoveredLocationUI.initializeUIData();

        uiHandlers.hoverHandler = new hoverHandler(selectedLocationElements.hexChildren);
        uiHandlers.hoverHandler.initializeHoverData();

        setDefaultVisibilityState();
        addListeners();
    }

    function getLocationDataFromElement(locationEl) {
        const id = locationEl.dataset.id;
        return state.locations.byId[id];
    }

    function getAllLocations() {
        return state.locations.allIds.map((id) => state.locations.byId[id]);
    }

    function getLocationsByProperty(propertyName, propertyValue) {
        return getAllLocations().filter((location) => location[propertyName] === propertyValue);
    }

    function displayInfo(locationEl, shouldHide = false) {
        // const locationEl = _locationEl ? _locationEl : event.currentTarget;
        const dependentElement = document.querySelector(".location-hover-info .top-card"); //TODO: refactor this to be cached

        if (!shouldHide) {
            let location = getLocationDataFromElement(locationEl);
            uiHandlers.hoveredLocationUI.updateUIData(location, false, false);
            dependentElement.classList.add("highlighted");
        } else {
            // hoveredLocationUI.updateUIData(location, false, true);
            dependentElement.classList.remove("highlighted");
        }
    }

    function switchTabWrapper(key) {
        uiHandlers.tabsHandler.switchTab(key);

        //Also if it's closed, expand the toggle
    }

    function getExtraImagesFromString(baseFilePath, stringNames) {
        // if (!stringNames && !stringNames.trim() && !stringNames === "") {
        const stringNameArray = stringNames.split(",");
        if (stringNameArray[0] === "") {
            return [];
        }
        const filePaths = stringNameArray.map((string) => {
            return baseFilePath + "/" + string.trim();
        });
        return filePaths;
        // }
    }

    function setDefaultVisibilityState() {
        let hidableElements = Array.from(document.querySelectorAll("[data-default-visibility]"));
        hidableElements.forEach((el) => {
            let defaultVisiblity = el.dataset.defaultVisibility;
            if (defaultVisiblity === "hidden") {
                el.classList.add("hidden");
            } else if (defaultVisiblity === "visible") {
                el.classList.remove("hidden");
            }
        });
        //hex children should have "default-visible"
        // ui elements should have "default-hidden"
        //image elements should have "default-hidden"
    }

    function expandSidebar() {
        let nav = document.querySelector(".location-info");
        let main = document.querySelector(".location-map .location-map");
        if (nav.classList.contains("expanded")) {
            Helpers.closeNav(nav, main);
        } else {
            Helpers.openNav(nav, main);
        }
    }

    function populateHeirarchyFromData(childData) {
        let current = { ...childData };
        let heirarchyData = [current];
        while (current.parent) {
            const parentData = getLocationsByProperty("guid", current.parent)[0];
            heirarchyData.push(parentData);
            current = parentData;
        }
        heirarchyData.reverse();
        console.log(heirarchyData);
        heirarchyData.forEach((data) => {
            if (data.type === "global") {
                restorePreviousMap(true);
            } else {
                selectLocation("", data, "fromParent");
            }
        });
    }

    function clearAndStorePreviousLocation(method, childData) {
        if (method === "fromConnection") {
            console.log("From connection");
            //if we're jumping to a connection, we need to handle its parents somehow
            //first clear the heirarchy, reseting things to root
            clearHeirarchy();
            //then add the parent data?
            populateHeirarchyFromData(childData);
            return;
        }

        previousLocationData.container = selectedLocationElements.container;
        previousLocationData.imageContainer = selectedLocationElements.imageContainer;
        previousLocationData.currentLocationData = selectedLocationElements.currentLocationData;
        selectedLocationElements.container.remove();
        selectedLocationElements.imageContainer.remove();

        if (method === "fromParent") {
            //if it is specifically from the parent, store the parent so we can zoom out as needed
            const { container, imageContainer, currentLocationData } = previousLocationData;
            locationHeirarchyStack.push({ container, imageContainer, currentLocationData });
        }
    }

    /**
     * Restore a parent map, or zoom out to the root
     * @param {Boolean} restoreRoot - are we zooming all the way out, or just jumping up to parent
     */
    function restorePreviousMap(restoreRoot = false) {
        let previousMap;
        if (locationHeirarchyStack.length === 0) {
            previousMap = rootLocationData;
        } else {
            previousMap = restoreRoot ? locationHeirarchyStack.shift() : locationHeirarchyStack.pop();
        }
        const atRoot = restoreRoot || locationHeirarchyStack.length == 0; //we've popped the final item in the stack, or we were reseting to root anyway
        const { container, imageContainer, currentLocationData } = previousMap;

        document.querySelector(".location-map .location-map").appendChild(container);
        document.querySelector(".location-map .location-map").appendChild(imageContainer);
        if (atRoot) {
            //if going back to root, remove everything in the stack, and recache our location elements
            clearHeirarchy();
        } else {
            restoreUIData(false, currentLocationData);
        }
    }

    function clearHeirarchy() {
        locationHeirarchyStack = [];
        let { container, currentLocationData } = rootLocationData;
        //if we're at root, recache the location elements once again
        cacheLocationElements("", container, currentLocationData);
        restoreUIData(true, currentLocationData);
    }
    function restoreUIData(restoreRoot, data) {
        if (restoreRoot) uiHandlers.selectedLocationUI.resetToDefault(true);
        else uiHandlers.selectedLocationUI.updateUIData(data, false, true);
        clearConnectionAreas();
        setDefaultVisibilityState();
        resetGradient();
    }

    /**
     *
     * @param {HTMLorSVGElement} locationEl - the element we clicked upon that we're 'zooming in' to
     * @param {Object} locationData  - the location data of the particular location
     * @param {String} method - the method we're using, to determine if we need to build a new map, or restore a previous one
     */
    function selectLocation(locationEl, locationData, method) {
        if (!locationData) locationData = getLocationDataFromElement(locationEl);
        if (method !== "rebuild") {
            clearAndStorePreviousLocation(method, locationData);
        }

        const childContainer = createChildGrid(locationData);

        addAccentColor(childContainer, locationData);
        clearConnectionAreas(); //clear the arrays and remove the connection button children

        const { connections } = locationData;
        if (connections) {
            addConnectionButtons(connections, childContainer);
        }

        cacheLocationElements(locationEl, childContainer, locationData);

        if (!locationData) locationData = globalData;
        uiHandlers.selectedLocationUI.updateUIData(locationData, false, true);

        const dependentElement = document.querySelector(".location-hover-info");
        dependentElement.classList.add("hidden");

        setDefaultVisibilityState();
        Object.values(directionElements)
            .map((obj) => obj.parent)
            .forEach((p) => addListeners(p));
        addListeners(selectedLocationElements.container);
        addListeners(uiHandlers.selectedLocationUI.getContainer());
    }

    /**
     * update our current location
     * @param {HTMLorSVGElement} selectedElement - the element with the location data
     * @param {HTMLOrSVGElement} newContainer - the container for the child objects
     */
    function cacheLocationElements(selectedElement, newContainer, locationData) {
        // add copy of the previous data onto stack for puposes of going back
        selectedLocationElements.container = newContainer;
        selectedLocationElements.element = selectedElement;
        selectedLocationElements.imageContainer = Array.from(document.querySelectorAll(".lightbox")).pop();
        selectedLocationElements.hexChildren = Array.from(newContainer.querySelectorAll(".hex"));
        selectedLocationElements.currentLocationData = locationData;

        //TODO: this should be placed elsewhere. Single Responsibility Principle
        if (selectedLocationElements.hexChildren.length === 0) {
            selectedLocationElements.imageContainer.classList.remove("hidden");
            selectedLocationElements.imageContainer.querySelector("img").classList.add("view-mode");
        }
    }

    /**
     * add event listeners to parent container
     * @param {HTMLOrSVGElement} parentElement - the element within which we want add new actions
     */
    function addListeners(parentElement = document) {
        const clickElements = Array.from(parentElement.querySelectorAll("[data-click-action]"));
        const hoverElements = Array.from(parentElement.querySelectorAll("[data-hover-action]"));
        const pressElements = [document.documentElement];
        // const releaseElements = [document.documentElement];
        document.documentElement.dataset.pressAction = "handleHotkey";
        // document.documentElement.dataset.releaseAction = "handleKeyRelease";

        const elementSets = {
            click: { elements: clickElements, eventNames: "click" },
            hover: { elements: hoverElements, eventNames: "mouseenter mouseleave" },
            press: { elements: pressElements, eventNames: "keydown" },
            // release: { elements: releaseElements, eventNames: "keyup" },
        };

        for (const key in elementSets) {
            let datasetProperty = key + "Action";
            const { elements, eventNames } = elementSets[key];

            Helpers.clearEventListenersFromAll(elements, eventNames);
            Helpers.addEventListenerToAll(elements, eventNames, (event) => {
                let action = event.currentTarget.dataset[datasetProperty];
                handleAction(event, key, action);
            });
        }
    }
    function handleAction(event, actionType, action) {
        const currentTarget = event.currentTarget;
        const actionData = locationActionsData.actions[actionType][action];
        if (actionData.hasOwnProperty("handler")) {
            const options = { currentTarget };
            actionData["handler"](event, options);
        }
    }

    function createImageDisplay(locationData, parentContainer) {
        const img = locationData.imageData.mainImage;
        const extraImages = locationData.imageData.otherImages;
        const otherImages = extraImages ? getExtraImagesFromString(globalData.baseAssetPath, extraImages) : [];

        const modal = new Modal();
        const otherImageSrcArray = otherImages.length > 0 ? [...otherImages, img] : [];

        const modalData = { mainImageSrc: img, otherImageSrcArray };
        const imageHolder = createForeignObject(parentContainer);
        const insetParent = document.querySelector(".location-map .location-map"); //imageHolder.querySelector("foreignObject");

        const lightboxHTML = modal.initialize("imageGallery", modalData, insetParent);
        let classes = ["inset", "hidden", "can-be-hidden"];
        classes.forEach((className) => {
            lightboxHTML.classList.add(className);
        });
    }

    function createForeignObject(
        parentContainer,
        classString = "image-display can-be-hidden hidden",
        defaultVisiblity = "hidden"
    ) {
        let html = `<svg
    viewBox="0 0 100 100"
    width="100%"
    height="100%"
    class="${classString}"
    data-default-visibility="${defaultVisiblity}"
    >
    <foreignobject>
    </foreignobject>
    </svg>
        `;

        let element = Helpers.htmlToElement(html);
        parentContainer.appendChild(element);
        return element;
    }

    /**
     * Creates a child container w/ data from the clicked parent
     * @param {SVGElement} parentData - the parent 'region' for an area or 'area' for a site
     * @returns the container for the new child elements
     */
    function createChildGrid(parentData) {
        const { id, type, imageData, children } = parentData;
        let childType = "region";
        if (type === "region") childType = "area";
        else if (type === "area") childType = "site";
        const svgContainer = createSVG(id, type, imageData.mainImage);

        createImageDisplay(parentData, svgContainer);

        let rowsAndColumns = { rows: 3, columns: 3 };
        let locationGrid = createLocationGrid(
            parentData,
            { id, childType, rowsAndColumns, children },
            { svgContainer }
        );

        return locationGrid;
        // return createLocationGrid(parentElement, { parentName, childType, rowsAndColumns }, { svgContainer })
    }

    //create the parent image, populate the locations, and update the ui data
    /**
     * @param {HTMLOrSVGElement} parentElement - the parent element w/ the data
     * @param {object} parentData - data holding things like the name, type, etc.
     * @param {String} parentData.parentName - the parent object's name
     * @param {String} parentData.image - the parent object's image
     * @param {String} parentData.childType - the the type of the child
     * @param {Array} parentData.children - An array of child objects; if undefined, filter them from location data based upon the parent name and child type
     * @param {Object} parentData.rowsAndColumns- the number of rows and columns to creae
     * @param {object} elementData - data holding information about elements, like the container
     * @param {HTMLOrSVGElement} elementData.svgContainer - the container that the hex children will be added to
     */
    function createLocationGrid(parentElement = "", parentData = {}, elementData = {}) {
        let { children, rowsAndColumns, connections } = parentData;
        let { svgContainer } = elementData;

        populateLocations(children, rowsAndColumns, svgContainer, globalData.baseAssetPath);
        createConnections(children, svgContainer);

        // if (!parentData) parentData = globalData;

        if (parentElement) {
            uiHandlers.selectedLocationUI.updateUIData(parentElement);
        }
        return svgContainer;
    }
    function addAccentColor(svgContainer, locationData) {
        let ourData = locationData.imageData ? { ...locationData } : { ...globalData };
        const { color, gradient, titleColor } = ourData.imageData;
        // let color = ourData.imageData.color;
        // let gradient = ourData.imageData.gradient;
        if (color) {
            svgContainer.style.setProperty("--accent-color", color);
        }
        let outerMap = document.querySelector(".location-map .location-map");
        if (gradient) {
            outerMap.style.setProperty("--ui-gradient", gradient);
        }
        if (titleColor) {
            outerMap.style.setProperty("--title-color", titleColor);
        }
    }

    function initializeConnectionAreas() {
        let directions = ["up", "down", "left", "right"];
        directions.forEach((direction) => {
            let html = `<section class="connection-button__container ${direction}" data-direction="${direction}"></section>`;
            const el = Helpers.htmlToElement(html);
            directionElements[direction].parent = el;
        });
    }

    function clearConnectionAreas() {
        for (const key in directionElements) {
            const { parent, children } = directionElements[key];
            Helpers.removeChildren(parent);
            children.length = 0;
        }
    }

    function addConnectionButtons(connections, childContainer) {
        let elements = connections.map((con) => {
            return {
                ...con.element,
                direction: con.direction,
                dataset: {
                    direction: con.direction,
                },
            };
        });
        let connectionButtons = Helpers.dataToButtons(elements);

        const outerContainerElement = childContainer;

        const containerElement = document.querySelector(".location-map .location-map");

        connectionButtons.forEach((btnEl) => {
            directionElements[btnEl.dataset.direction].children.push(btnEl);
            btnEl.classList.add("connection-hex");
        });

        for (let key in directionElements) {
            const { parent, children } = directionElements[key];
            directionElements[key].fragment = Helpers.buildDocumentFragment(parent, children);
        }
        let fragments = Object.values(directionElements).map((el) => el.fragment);
        let shadow = Helpers.buildDocumentFragment("", fragments);
        containerElement.appendChild(shadow);
    }

    function createConnections(childLocations, container) {
        childLocations.forEach((data) => {
            if (data.connections) {
                const destinationIds = data.connections.map((con) => con.destinationId);
                const sourceElement = document.querySelector(`[data-guid='${data.guid}']`);
                destinationIds.forEach((guid) => {
                    const destinationElement = document.querySelector(`[data-guid='${guid}']`);
                    // drawPaths(sourceElement, destinationElement, container);
                });
            }
        });
    }

    function createSVG(parentName, type, img) {
        if (!parentName.trim()) return;
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        const viewboxValues = type === "region" ? "0 0 100 100" : "0 0 100 100";
        svg.setAttribute("viewBox", viewboxValues);
        svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
        const trimmedParent = parentName.replace(/\s/g, "_");
        svg.classList.add(trimmedParent + "_container");
        svg.classList.add("location__container");
        svg.dataset.parent = parentName;
        svg.dataset.type = type;
        svg.style.setProperty("--bg-img", `url(${Helpers.encodeURI(img)})`);
        document.querySelector(".location-map .location-map").appendChild(svg);

        return svg;
    }

    function resetGradient() {
        const mapElement = document.querySelector(".location-map .location-map");

        mapElement.style.setProperty("--ui-gradient", globalData.imageData.gradient);
        mapElement.style.setProperty("--title-color", globalData.imageData.titleColor);
    }

    function resetZoom() {
        restorePreviousMap(true);
    }

    function backToParent() {
        restorePreviousMap(false);
    }

    return {
        locationData,
        getLocationsByProperty,
    };
})();
console.log(regionViewerModule);
