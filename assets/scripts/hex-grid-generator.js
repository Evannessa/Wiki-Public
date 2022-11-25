"use strict";

const iconBasePath = "/assets/locations/CityOfMyth/icons_and_symbols/generated-icons/constellation";
import Helpers from "./helpers.js";

/**
 * Generate grids, update hexes with corners, hide hexes to make more appealing "hex flower" shape
 * @param {Object} locationData - an array of objects with all the data for a particular location type (area, region, site)
 * @param {*} gridData
 * @param {*} svgContainer
 */
export function populateLocations(locationData, gridData = { rows: 5, columns: 5 }, svgContainer, baseAssetPath) {
    const { rows, columns } = gridData;
    generateHexGrid(columns, rows, "main", svgContainer);
    // generateHexGrid(columns, rows, "overlay", svgContainer);
    injectLocationData(locationData, svgContainer, baseAssetPath);
    cutCorners(rows, columns, svgContainer);
    const hexes = Array.from(svgContainer.querySelectorAll(".hex:not(.keyedLocation):not(.blank):not(.overlay)"));
    addIconsToHex(hexes);
    // addAccentColor(svgContainer, locationData);
}

function generateHexGrid(columns, rows, className, svgContainer) {
    let columnCounter = 0;
    let rowCounter = 0;
    // let gapNumberX = columns === 5 ? 18 : 30;
    // let gapNumberY = columns === 5 ? 20 : 35;
    let gapNumberX = columns === 5 ? 20 : 30;
    let gapNumberY = columns === 5 ? 22 : 35;
    while (rowCounter < rows) {
        let xOffset = columnCounter * gapNumberX;
        let yOffset = rowCounter * gapNumberY;
        createHex(xOffset, yOffset, columnCounter, rowCounter, className, svgContainer, columns);

        columnCounter++;
        if (columnCounter == columns) {
            columnCounter = 0;
            rowCounter++;
        }
    }
    console.log(gapNumberX, gapNumberY);
    adjustHexOffset(gapNumberX, gapNumberY, svgContainer);
}

/**
 * Translate each position
 * @param {Integer} xPosition - the x position to be translated
 * @param {*} yPosition
 * @param {*} columnNumber
 * @param {*} rowNumber
 * @param {*} className
 * @param {*} svgContainer
 * @returns
 */
function createHex(xPosition, yPosition, columnNumber, rowNumber, className, svgContainer, size) {
    let locationType = "region";
    let parentName = "";
    const emptyTileUnderlayImg =
        className === "main" ? "/assets/locations/DarkHillsOcean.jpg" : "/assets/locations/DarkHillsOcean.jpg";
    if (!svgContainer.classList.contains("parent-list")) {
        locationType = svgContainer.dataset?.type;
        parentName = svgContainer.dataset?.parent;
        parentName = parentName.replace(/\s/g, "_");
    }
    function replaceIllegalCharacters(dirtyString) {
        var cleanString = dirtyString.replace(/[|&;$%@"<>()+,'\s]/g, "");
        return cleanString;
    }
    className = replaceIllegalCharacters(className);
    parentName = replaceIllegalCharacters(parentName);
    const uniqueID = `${columnNumber.toString()}${rowNumber.toString()}${className}${parentName}`;
    let svgHex = createSVGHex(emptyTileUnderlayImg, uniqueID, className, locationType, size);

    svgContainer.appendChild(svgHex);

    svgHex.setAttribute("x", xPosition);
    svgHex.setAttribute("y", yPosition); // = yPosition
    svgHex.classList.add("hex");
    svgHex.classList.add("can-be-hidden");
    svgHex.classList.add(className);
    svgHex.dataset.defaultVisibility = "visible";
    svgHex.dataset.row = rowNumber;
    svgHex.dataset.column = columnNumber;
    return svgHex;
}
function addIconsToHex(hexes) {
    const iconHTMLArrays = generateIcons();
    hexes.forEach((tile) => {
        const iconBlurHTML = iconHTMLArrays.pop();

        const mainPath = tile.querySelector("path.main");

        const iconObjectBlur = Helpers.htmlToElement(iconBlurHTML);
        insert(iconObjectBlur, mainPath);
    });
}

/**
 * Adjust the hexes in even columns so that they're offset to make a better grid
 */
function adjustHexOffset(offsetX, offsetY, container) {
    Array.from(container.querySelectorAll(".hex")).forEach((hex) => {
        if (parseInt(hex.dataset.column) % 2 == 0) {
            hex.setAttribute("x", hex.dataset.column * offsetX);
            hex.setAttribute("y", hex.dataset.row * offsetY - offsetY / 2);
        }
    });
}

function insert(newNode, referenceNode, isAfter = false) {
    const ref = isAfter ? referenceNode.nextSibling : referenceNode;
    referenceNode.parentNode.insertBefore(newNode, ref);
}

/**
 * Fill the indicated tiles on the grid with a pattern holding the image we want to use.
 * !If there are none, will fill empty hexes with pattern of parent location's image
 * @param {Object} locationData - the object with all of our location data
 * @param {String} locationType - string representing the type (regions, areas, sites) of location
 */
function injectLocationData(locationData, svgContainer, baseAssetPath) {
    // console.log(locationData)
    locationData.forEach((dataObject) => {
        const { row, column, guid, id, imageData } = dataObject;
        const rcSelector = `[data-row='${row - 1}'][data-column='${column - 1}']`;

        if (!svgContainer) svgContainer = document;

        const ourSVG = svgContainer.querySelector(`.main${rcSelector}`);

        ourSVG.querySelector("pattern image").setAttribute("href", imageData.mainImage);

        ourSVG.classList.add("keyedLocation");

        ourSVG.querySelector("pattern image").setAttribute("preserveAspectRatio", "xMidYMid slice");
        ourSVG.dataset.id = id;
        ourSVG.dataset.guid = guid;
        ourSVG.dataset.hoverAction = "displayInfo";
        ourSVG.dataset.clickAction = "selectLocation";
        ourSVG.dataset.pressAction = "handleHoverHotkey";

        ourSVG.querySelector("foreignObject .popover").classList.remove("removed");
        ourSVG.querySelector("foreignObject .popover p").textContent = id.trim();
    });
}

function createSVGHex(img, id, className, locationType, size) {
    let width = size === 3 ? "35.33%" : "24%";
    let height = size === 3 ? "35.33%" : "23%";
    // let width = "24%";
    // let height = "23%";
    const xOffset = locationType === "region" ? "0" : "8%";
    const svgData = `
<svg class="svgChild ${locationType}" viewBox="0 0 100 100" width="${width}" height="${height}" y="10" x="${xOffset}" data-type="${locationType}">
	<defs>
		<pattern id="fill${id}" width="1" height="1" x="0" y="0" patternUnits="objectBoundingBox" viewBox="0 0 100 100">
			<image class="pattern-image pattern-${className}" width="200" height="100" x="-50" y="0" href="${img}" preserveAspectRatio="xMidYMid meet" />
		</pattern>
	</defs>
	<path  class="main" d="M3.000000000000001 48.49742261192856Q0 43.30127018922193 3.000000000000001 38.1051177665153L22 5.196152422706632Q25 0 31 0L69 0Q75 0 78 5.196152422706632L97 38.1051177665153Q100 43.30127018922193 97 48.49742261192856L78 81.40638795573723Q75 86.60254037844386 69 86.60254037844386L31 86.60254037844386Q25 86.60254037844386 22 81.40638795573723Z" fill="url(#fill${id})"></path>
	<path class="overlay" d="M3.000000000000001 48.49742261192856Q0 43.30127018922193 3.000000000000001 38.1051177665153L22 5.196152422706632Q25 0 31 0L69 0Q75 0 78 5.196152422706632L97 38.1051177665153Q100 43.30127018922193 97 48.49742261192856L78 81.40638795573723Q75 86.60254037844386 69 86.60254037844386L31 86.60254037844386Q25 86.60254037844386 22 81.40638795573723Z" fill="url(#fill${id})"></path>
    <foreignObject class="popover-wrapper">
    <div class="popover can-be-hidden hidden removed"><p>Hello World</p></div>
    </foreignObject>
</svg>
`;
    return htmlToElement(svgData);
}

function htmlToElement(html) {
    let template = document.createElement("template");
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function cutCorners(maxColumn, maxRow, svgContainer = document) {
    const size = maxColumn;
    maxColumn = maxColumn - 1;
    maxRow = maxRow - 1;
    const size3by3 = [
        [0, 0],
        [0, maxRow],
    ];
    const size5by5 = [...size3by3, [maxColumn, 1], [maxColumn, 0], [maxColumn, maxRow], [maxColumn, maxRow - 1]];
    const coordinates = size === 3 ? size3by3 : size5by5;
    let tiles = coordinates.map((coord) => getTileAtCoordinates(coord[0], coord[1], ".main", svgContainer));

    // let overlayTiles = coordinates.map(coord => getTileAtCoordinates(coord[0], coord[1], ".overlay", svgContainer))
    tiles = [...tiles];
    tiles.forEach((tile) => {
        setTileStyle(tile);
    });
}

function getTileAtCoordinates(row, column, mainOrOverlay = ".main", svgContainer = document) {
    return svgContainer.querySelector(`${mainOrOverlay}[data-row='${row}'][data-column='${column}']`);
}

function setTileStyle(tile, style = "blank") {
    tile.classList.add(style);
}
function generateIcons() {
    const iconBasePath = "/assets/locations/maps/icons_and_symbols/icons/conversions/constellation";
    function returnIconHTML(suffix, index, className = "main", icon) {
        return `
        <svg class="icon-container icon-container__${className}">
        <defs>
        <clipPath id="${suffix}${index}${className}">
        <path  class="main" d="M3.000000000000001 48.49742261192856Q0 43.30127018922193 3.000000000000001 38.1051177665153L22 5.196152422706632Q25 0 31 0L69 0Q75 0 78 5.196152422706632L97 38.1051177665153Q100 43.30127018922193 97 48.49742261192856L78 81.40638795573723Q75 86.60254037844386 69 86.60254037844386L31 86.60254037844386Q25 86.60254037844386 22 81.40638795573723Z"></path>
        </clipPath>
        </defs>
        <foreignObject width="100%" height="100%">
        <div class="bg-blur" width="100%" height="100%" style="clip-path: url(#${suffix}${index}${className})">
        &nbsp;
        <span class="material-symbols-outlined">
            ${icon}
        </span>
        </div>
        </foreignObject>
        </svg>
        `;
    }
    let iconNames = [
        "brightness_1",
        "brightness_2",
        "brightness_3",
        "brightness_4",
        "brightness_5",
        "brightness_6",
        "brightness_7",
        "clear_night",
        "dark_mode",
        "nightlight",
        "mode_night",
        "auto_awesome",
        "wb_sunny",
        "wb_twilight",
        "brightness_medium",
        "sunny_snowing",
        "flare",
        "brightness_low",
        "weather_snowy",
        "cyclone",
        "cloudy_snowing",
        "air",
        "water",
        "thunderstorm",
        "rainy",
        "looks",
        "airwave",
        "partly_cloudy_day",
    ];
    let iconsArray = [];
    iconsArray = iconNames.map((iconName, index) => returnIconHTML("blur", index, "main", iconName));
    // for (let i = 1; i <= 30; i++) {
    //     const iconHTMLBlur = returnIconHTML("blur", i);
    //     const iconHTMLDark = returnIconHTML("dark", i, "overlay");
    //     const innerArray = [iconHTMLBlur, iconHTMLDark];
    //     iconsArray.push(innerArray);
    // }
    return iconsArray;
}
