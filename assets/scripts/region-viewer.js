"use strict";
import { Modal } from "./modal.js";
import { LocationHelpers } from "./location-functions.js";
import { LocationUIFactory } from "./create-ui.js";
import { populateLocations } from "./hex-grid-generator.js";
import Helpers from "./helpers.js";

export const regionViewerModule = (function () {
    const hexHoverData = {
        hovering: false,
        keydown: false,
        current: "",
    };
    let previousLocationData = [];
    let locationHeirarchyStack = [];
    let lightbox;
    let selectedLocationUI;
    let hoveredLocationUI;
    const state = {};
    let normalizedLocations;
    let locationIDs;
    let locationData;
    let globalData;
    let hoveredHexes = [];
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

    function updateHexHoverData() {}

    const selectedLocationElements = {
        element: "", // the hex element containing data for current location
        container: "", // the container of all the hex elements
        imageContainer: "", //the container for the main "image" represnting the selected location
        hexChildren: "",
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
    }
    /**
     * initialize the UI elements for our map
     */
    function createUIElements(locationData) {
        const { id, guid, imageData } = globalData;
        const container = document.querySelector(".location__container.parent-list"),
            image = imageData.mainImage;

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

        cacheLocationElements("", container); //store the current location information once it's all created

        // document.querySelector(".decor.bottom-card img").src = locationData.imageData.mainImage;
        // document.querySelector(".decor.bottom-card h3").textContent = locationData.id;
        selectedLocationUI = new LocationUIFactory(
            "location-info",
            globalData,
            document.querySelector(".location-info"),
            state,
            true,
            document.querySelector(".decor.bottom-card")
        );
        console.log(selectedLocationUI);

        selectedLocationUI.initializeUIData();

        hoveredLocationUI = new LocationUIFactory(
            "child-location-info",
            globalData,
            document.querySelector(".location-hover-info"),
            state,
            false,
            document.querySelector(".top-card")
        );
        hoveredLocationUI.initializeUIData();

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

    function displayInfo(event, _locationEl = "") {
        const locationEl = _locationEl ? _locationEl : event.currentTarget;
        const dependentElement = document.querySelector(".location-hover-info .top-card");
        const isLeave = event.type === "mouseout" || event.type === "mouseleave";
        let location = getLocationDataFromElement(locationEl);
        if (!isLeave) {
            hoveredLocationUI.updateUIData(location, false, false);
            dependentElement.classList.add("highlighted");
        } else {
            // hoveredLocationUI.updateUIData(location, false, true);
            dependentElement.classList.remove("highlighted");
        }
    }

    function getExtraImagesFromString(baseFilePath, stringNames) {
        // if (!stringNames && !stringNames.trim() && !stringNames === "") {
        const stringNameArray = stringNames.split(",");
        console.log(stringNames, stringNameArray);
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

    function selectLocation(locationEl, locationData, fromParent) {
        if (!locationData) locationData = getLocationDataFromElement(locationEl);
        const childContainer = createChildGrid(locationData);

        clearConnectionAreas(); //clear the arrays and remove the connection button children
        previousLocationData.push({ ...selectedLocationElements }); // push the previous elements
        let locationAncestors = [...previousLocationData];
        if (locationData.parent === locationAncestors.pop()?.element?.dataset?.guid) {
            //if the previous element is also our parent, push it to the location heirarchy stack
            locationHeirarchyStack.push({ ...selectedLocationElements });
        }
        const { connections } = locationData;
        if (connections) {
            addConnectionButtons(connections, childContainer);
        }

        cacheLocationElements(locationEl, childContainer);

        if (!locationData) locationData = globalData;
        selectedLocationUI.updateUIData(locationData, false, true);

        const dependentElement = document.querySelector(".location-hover-info");
        dependentElement.classList.add("hidden");

        setDefaultVisibilityState();
        Object.values(directionElements)
            .map((obj) => obj.parent)
            .forEach((p) => addListeners(p));
        addListeners(selectedLocationElements.container);
        addListeners(selectedLocationUI.getContainer());
    }
    const locationActionsData = {
        selectedLocationContainer: "",
        actions: {
            click: {
                switchTab: {
                    handler: (event) => {
                        //TODO: Refactor this so that the tabs are being cached

                        const tab = event.currentTarget;
                        const target = tab.dataset.target;
                        const tabs = Array.from(document.querySelectorAll(".tab"));
                        const contentSections = Array.from(document.querySelectorAll(".tab-content"));
                        tabs.forEach((tab) => {
                            tab.classList.remove("active");
                        });
                        contentSections.forEach((section) => {
                            section.classList.remove("active");
                            section.classList.add("removed");
                        });
                        tab.classList.add("active");
                        const contentSection = document.getElementById(target);
                        // contentSection.style.setProperty("--bg-img", value);
                        contentSection.classList.add("active");
                        contentSection.classList.remove("removed");

                        //Also if it's closed, expand the toggle
                        if (!selectedLocationUI.getContainer().classList.contains("expanded")) {
                            expandSidebar();
                        }
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
                        backOne();
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
                        // Helpers.toggleClassOnAction(event.currentTarget, document.querySelector(".location-info"), {
                        // action: "expand",
                        // });
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
                        selectLocation(locationEl);
                    },
                },
                navigate: {
                    handler: (event) => {
                        console.log("Navigate button clicked");
                        const current = event.currentTarget;
                        // const targetName = current.dataset.link;
                        const targetId = current.dataset.guidLink;
                        // const locationEl = document.querySelector(`[data-id='${targetName}']`);
                        const locationEl = document.querySelector(`[data-guid='${targetId}']`);
                        selectLocation(locationEl);
                    },
                },
                showTooltip: {
                    handler: (event) => {
                        const current = event.currentTarget;
                        const parentElement = current.parentNode;
                        let id = current.dataset.id;
                        Helpers.togglePopover(id, parentElement);
                        // showTooltip(tooltip)
                    },
                },
            },
            hover: {
                displayInfo: {
                    handler: (event) => {
                        displayInfo(event);
                    },
                },
                highlightHex: {
                    handler: (event) => {
                        const isLeave = event.type === "mouseout" || event.type === "mouseleave";
                        // if (!isLeave) {
                        const actionElement = event.currentTarget;
                        // const targetName = actionElement.dataset.link;
                        const targetId = actionElement.dataset.guidLink;
                        // const hex = document.querySelector(`[data-id='${targetName}']`);
                        const hex = document.querySelector(`[data-guid='${targetId}']`);
                        Helpers.toggleClassOnAction(actionElement, hex, { action: "highlight" });
                        displayInfo(event, hex);
                        // Helpers.highlightAnotherElement(actionElement, hex)
                    },
                },
            },
        },
    };

    let establishedPaths = [];

    //if it's a sibling, replace. If it's a child, overlay it on top of the parent
    function replaceOrOverlayNewGrid(locationData, newGrid, svgAncestor) {
        let { parent, type } = locationData;
        const previousGridElement = previousLocationData[previousLocationData.length - 1].element;
        if (locationData.parent && previousGridElement.dataset.guid === locationData.parent) {
            //it's our parent. overlay us on top.
            svgAncestor.append(newGrid);
        } else {
            //otherwise, remove the previous element first
            previousGridElement.remove();
            svgAncestor.append(newGrid);
        }
    }
    /**
     * update our current location
     * @param {HTMLorSVGElement} selectedElement - the element with the location data
     * @param {HTMLOrSVGElement} newContainer - the container for the child objects
     */
    function cacheLocationElements(selectedElement, newContainer) {
        // add copy of the previous data onto stack for puposes of going back
        selectedLocationElements.container = newContainer;
        selectedLocationElements.element = selectedElement;
        selectedLocationElements.imageContainer = newContainer.querySelector(".image-display");
        selectedLocationElements.hexChildren = Array.from(newContainer.querySelectorAll(".hex"));
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
        const elementSets = {
            click: { elements: clickElements, eventNames: "click" },
            hover: { elements: hoverElements, eventNames: "mouseenter mouseleave" },
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

    function createImageBackground(locationData, parentContainer) {
        const img = locationData.imageData.mainImage;
    }

    function createImageDisplay(locationData, parentContainer) {
        const img = locationData.imageData.mainImage;
        const extraImages = locationData.imageData.otherImages;
        const otherImages = extraImages ? getExtraImagesFromString(globalData.baseAssetPath, extraImages) : [];

        const modal = new Modal();
        const otherImageSrcArray = otherImages.length > 0 ? [...otherImages, img] : [];

        const modalData = { mainImageSrc: img, otherImageSrcArray };
        const imageHolder = createForeignObject(parentContainer);
        const insetParent = imageHolder.querySelector("foreignObject");
        const lightboxHTML = modal.initialize("imageGallery", modalData, insetParent);
        lightboxHTML.classList.add("inset");
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

    function filterChildLocations(parentName, type) {
        return locationData[`${type}s`].filter((item) => item.parent == parentName);
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

        //TODO refactor this to go elsewhere and follow the SRP

        populateLocations(children, rowsAndColumns, svgContainer, globalData.baseAssetPath);
        createConnections(children, svgContainer);

        if (parentElement) {
            selectedLocationUI.updateUIData(parentElement);
        }
        return svgContainer;
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
        // const containerElement = createForeignObject(
        //     outerContainerElement,
        //     "connections-wrapper",
        //     "visible"
        // ).querySelector("foreignObject");
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

    /**
     * If connected one way, connect the other way
     * @param {SVGElement} place - the place whose connections we want to generate "backlinks" from
     */
    function intializeReverseConnections(place) {
        const connectedElements = returnConnectedElements(place);

        const ourName = place.dataset.name;
        connectedElements.forEach((element) => {
            //get comma-separated string of
            let currentConnections = returnConnectionsAsArray(element);
            currentConnections.push(ourName);
            currentConnections = currentConnections.join(", "); //add our name and join back into string
            element.dataset.connections = currentConnections;
            // element.dataset.connections =
        });
    }

    /**
     * Draw SVG Paths between the Source and the Destination elements
     * @param {SVGElement} source
     * @param {SVGElement} destination
     */
    function drawPaths(source, destination, container) {
        let svgElement = container; //document.querySelector(".parent-list");

        let sourceY = parseFloat(source.getAttribute("y")) + 5;
        let sourceX = parseFloat(source.getAttribute("x")) + 5; //+ parseFloat(pointa.getAttribute("cx"));
        let destinationY = parseFloat(destination.getAttribute("y")) + 5; //+ parseFloat(pointb.getAttribute("cy"));
        let destinationX = parseFloat(destination.getAttribute("x")) + 5; //+ parseFloat(pointb.getAttribute("cx"));
        let newLine = document.createElementNS("http://www.w3.org/2000/svg", "path");

        console.log(source.getBBox(), destination.getBBox());
        console.log(source.getBoundingClientRect(), destination.getBoundingClientRect());
        //newLine.setAttribute('id', 'line2');
        newLine.setAttribute("stroke", "white");
        newLine.setAttribute("vector-effect", "non-scaling-stroke");
        //Q x, y (first x and y are control point), second x y are next coordinate
        sourceY = parseFloat(sourceY) + source.getBoundingClientRect().height / 2;
        sourceX = parseFloat(sourceX) + source.getBoundingClientRect().width / 2;
        destinationX = parseFloat(destinationX);
        destinationY = parseFloat(destinationY);

        let midpointX = (sourceX + destinationX) / 2;
        let midpointY = (sourceY + destinationY) / 2;
        newLine.setAttribute(
            "d",
            `M ${sourceX} ${sourceY}
		${midpointX} ${midpointY}
		${destinationX} ${destinationY}`
        );
        newLine.classList.add("passage");

        svgElement.append(newLine);

        const connectionName = intializeConnectionName(source, destination);
        establishedPaths.push(connectionName);
        newLine.dataset.passageName = connectionName;
    }

    /**
     * Get all of the connections this element has to other locations
     * @param {SVGElement} source - the SVG Element whose passages we want to get
     * @returns an arrray of "path" elements representing the connections this element has
     */
    function getConnectedPassageElements(source) {
        const placeName = source.dataset.name;
        let passageElements = Array.from(document.querySelectorAll(`.passage`));
        passageElements = passageElements.filter((element) => {
            return element.dataset.passageName.includes(placeName);
        });
        return passageElements;
    }

    /**
     * return a string name combining the two locations
     * @param {SVGElement} source - the source svg element
     * @param {SVGElement} destination - the destination svg element
     * @returns a String determining the combined name of our connections
     */
    function intializeConnectionName(source, destination) {
        return source.id + " to " + destination.id;
    }

    /**
     * Return true or false depending on if a connection already exists between these two elements
     * @param {HTMLOrSVGElement} source - the element that started the connection
     * @param {SVGElement} destination - the element at the end of the connection
     * @returns a {Boolean} determining whether or not a connection exists between these two elements
     */
    function connectionExists(source, destination) {
        const pathExists = establishedPaths.some((path) => {
            return path.includes(source.id) && path.includes(destination.id);
        });
        return pathExists;
    }

    function resetZoom() {
        let childLists = Array.from(document.querySelectorAll(".location__container:not(.parent-list)"));
        childLists.forEach((list) => {
            list.remove();
        });
        selectedLocationUI.resetToDefault(true);
        clearConnectionAreas();
        setDefaultVisibilityState();
    }
    //remove just the last list, going up the heirarchy
    function backOne() {
        let childLists = Array.from(document.querySelectorAll(".location__container:not(.parent-list)"));
        childLists[childLists.length - 1].remove();
        let previous = previousLocationData.pop();
        selectLocation(previous.element);
        // selectedLocationUI.resetToDefault()//updateUIData(parentElement)
    }

    function hideAllLocationsAndPassages() {
        console.log("hiding?");
        const elements = Array.from(document.querySelectorAll(".area, .site, .region, .passage"));
        elements.forEach((el) => {
            el.classList.add("hidden");
        });
    }

    function getDescendantPassages(descendants) {
        let allPassages = [];
        descendants.forEach((descendant) => {
            allPassages = [...allPassages, ...getConnectedPassageElements(descendant)];
        });
        return allPassages;
    }

    return {
        locationData,
        getLocationsByProperty,
    };
})();
console.log(regionViewerModule);
