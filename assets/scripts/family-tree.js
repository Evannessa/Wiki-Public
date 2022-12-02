import { setZoomEventListeners, reset, setTransformString, toggleSidebar } from "./zoom.js";
import Hint from "./hint-display.js";

import { SideDrawer } from "./drawers.js";
import Helpers from "./helpers.js";
// import { setTransformString } from "./zoom.js";

export let defaultTransform;
export let svgElement;
export let toggleButton;
export let resetButton;
let memberElements;
let membersObject = {};
let toggles = {
    siblingHighlight: true,
    siblingLines: false,
    showUnions: true,
};
let childlessUnions = [];
let charactersByGeneration = [];
let genPositions = [2, 25, 50, 75, 90];
let unions = [];
let horizontalPositions = [];
let hint;
const actions = {
    click: {
        resetView: {
            handler: (event) => {
                reset();
            },
        },
        jumpGen: {
            handler: (event) => {
                jumpToGeneration(event);
            },
        },
    },
};

window.onload = function (event) {
    svgElement = document.querySelector(`.family-tree`);
    svgElement.closest("main").classList.add("hidden-overflow-wide-main");

    let drawer = new SideDrawer();
    let drawerID = ".family-tree-controls"; //determine the specific drawer so it isn't confused with the nav
    drawer.cacheDrawerElements({
        drawer: `.drawer${drawerID}`,
        toggleButtonOuter: ".help-button.drawer__toggle-button.outer",
        toggleButtonInner: `${drawerID} .drawer__toggle-button.inner`,
    });

    hint = new Hint();
    hint.initializeHints({
        elementSelector: ".hint-container .hint-text",
        hintText: {
            default: `
                    To <strong>Pan</strong> Use
                    [[🠕]] [[🠔]] [[🠗]] [[🠖]]
                    or
                        [[W]][[A]][[S]][[D]]
                        <br/>
                    To <strong>Zoom</strong> Use
                        [[+]]
                    or
                        [[-]]
                        <br/>
                        <strong>Hover</strong> over portrait to highlight family
                `,
            hoverPortrait: `
                    <strong>Click</strong> portrait to open character's article
                    <br/>
                    The highlighted individuals are immediate-family members.
            `,
        },
    });

    Helpers.addListeners(actions, document);

    // resetButton = document.querySelector(`#reset-button`);

    membersObject = {};
    //get each element

    memberElements = Array.from(document.querySelectorAll("svg .family-member-group"));

    svgElement.style.transform = `scale(${svgElement.dataset.startingScale || 0.8}) translateX(${
        svgElement.dataset.offsetX || "10%"
    }) translateY(${svgElement.dataset.offsetY || "-30%"})`;
    defaultTransform = svgElement.style.transform;

    addMembers();
    addChildren();
    addSiblings();
    distributeIntoGenerations();
    positionInGenerations();

    //toggle hides
    connectMembers("children");
    connectMembers("partners");
    // connectMembers("siblings");

    //toggle hides
    formUnions();
    connectToUnions();
    registerMemberListeners();

    setZoomEventListeners();

    window.membersObject = membersObject;
};

/**
 *
 * @param {Array} array1 - the array whose items we're checking
 * @param {Array array2  - the array who we're checking to see if it includes the items
 * @returns whether or not array2 contains everything in array1
 */

function containsAll(array1, array2) {
    let match = true;
    array1.forEach((item) => {
        if (!array2.includes(item)) {
            match = false;
        }
    });
    return match;
}

function getUnionIfExists(parentArray) {
    let union = unions.find((union) => containsAll(union.parents, parentArray));
    return union;
}

function addNewUnion(parentArray, childKey) {
    //only get parents that exist
    let unionName = parentArray.join("");
    //if the union already exists, just add the child to the union
    let union = getUnionIfExists(parentArray);
    if (union) {
        union.children.push(childKey);
    } else {
        //if it doesn't exist, create a new one and add it, adding both child, parents, and name
        let newUnion = {
            name: unionName,
            children: [childKey],
            parents: parentArray,
        };
        unions.push(newUnion);
    }
}
/**
 *
 * @param {String} key - the string name of the object we're looking for
 * @returns the object itself assigned to the key
 */
function getMemberObject(key) {
    return membersObject[key];
}

/**
 * Looks into the membersObject to find the generation of the person by name
 * @param {Array} arrayOfKeys - an array of Strings representing names of people
 * @returns the index of the person's generation, if it's found
 */
function getGenerationOfGroup(arrayOfKeys) {
    let generationIndex;
    let generationIndexes = Array.from(new Set(arrayOfKeys.map((key) => getMemberGeneration(key)))).filter(
        (item) => item !== undefined
    );

    if (generationIndexes.length > 0) {
        generationIndex = generationIndexes[0];
    }
    return generationIndex;
}

function getMemberGeneration(key) {
    return membersObject[key]?.generation;
}

/**
 * Set the position of the heart symbol images representing each union
 * @param {Object} union - a union object
 */
function setUnionSymbolPositions(union) {
    //get every parent and child element from their keys in the union, and combine them

    let childGenerationIndex = getGenerationOfGroup(union.children);
    let parentGenerationIndex = getGenerationOfGroup(union.parents);

    let childElements = union.children.map((childKey) => getElementByTitle(childKey));
    let parentElements = union.parents.map((parentKey) => getElementByTitle(parentKey));

    let allElements = [...childElements, ...parentElements].filter((el) => el !== null && el !== undefined);

    //get the averages of their positions
    if (allElements.length > 0) {
        let xAverage = getAveragePositions(allElements, "x");

        let yAverage;
        let childGenPosition;
        let parentGenPosition;
        if (
            (childGenerationIndex || childGenerationIndex == 0) &&
            (parentGenerationIndex || parentGenerationIndex == 0)
        ) {
            childGenPosition = genPositions[childGenerationIndex];
            parentGenPosition = genPositions[parentGenerationIndex];
            yAverage = (childGenPosition + parentGenPosition) / 2;
        }

        //you want to get the average from ALL of them
        union.xAverage = xAverage + 5;
        union.yAverage = yAverage + 5;
    }
}

export function jumpToGeneration(event) {
    let el = event.currentTarget;
    let generationIndex = el.dataset.gen;
    let generationYValue = genPositions[generationIndex];
    let transformString = `scale(1.0) translateX(0) translateY(-${generationYValue}%)`;
    setTransformString(transformString);
    // svgElement.style.transform = `scale(1.0) translateX(0) translateY(-${generationYValue}%)`;
}

/**
 *
 * @param {String} key - name of person
 * @param {Object} include - the include data
 */
function createPlaceholderMember(key, include) {
    let imagePath = `/assets/clans/${include.clan}/${include.name}`;
    let placeholder = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    let aspectRatio = "xMinYMid slice";
    if (include.imagePosition === "center") {
        aspectRatio = "xMidYMid slice";
    } else if (include.imagePosition === "left") {
        aspectRatio = "xMinYMid slice";
    }
    let person = include.person;
    let name = include.ourTitle;
    let ourClan;
    placeholder.outerHTML = `<svg class="family-member-group" data-title="${key}" data-first-gen="${include.firstGen}"" viewbox="0 0 100 100" preserveaspectratio="xMinYMin meet" width="5%" height="5%">
        <defs>
            <filter id="solid">
                <feFlood flood-color="#262b59" result="bg" />
                <feMerge>
                    <feMergeNode in="bg" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
        <clipPath id="myClip">
         <rect height="100" rx="15" width="100" />
        </clipPath>

        <svg class="hidden-info" height="0" width="0">
            <text class="parents">${include.parents}"</text>
            <text class="partners">${include.partners}"</text>
            <text class="title" x="50" y="-10">${include.ourTitle}"</text>
        </svg>
            <rect height="100" rx="15" width="100" />
        <image class="family-member" xlink:href="${imagePath}"" clip-path="url(#myClip)" preserveaspectratio="${aspectRatio}"" />


        <text class="visible-title" filter="url(#solid)" x="50" y="110">${name}"</text>

    </svg>`;
}

//find the membersObject sub object that matches this particular element
function getObjectFromElement(element) {
    let title = element.dataset.title;
    return membersObject[title];
}

//get the parents, children, and spouses
function getImmediateFamily(object) {
    let parents = object.parents || [];
    let children = object.children || [];
    let spouses = object.partners || [];
    let siblings = [];
    if (toggles.siblingHighlight) {
        siblings = object.siblings || [];
    }
    return [...parents, ...children, ...spouses, ...siblings];
}

// add event listeners to the member elements
function registerMemberListeners() {
    //get all of the lines
    let allLines = Array.from(document.querySelectorAll("path"));
    allLines = [...allLines, ...Array.from(document.querySelectorAll("line"))];
    let unionSymbols = Array.from(document.querySelectorAll(`image.union`));

    //for all of the member elements, add a mouse-enter listener
    memberElements.forEach((memberElement) => {
        let title = memberElement.dataset.title;

        let unionLinks = [...getParentUnions(title), ...getResultingUnions(title)].map((union) => union.name);

        //filter this so it's only showing unions we're in
        let otherUnions = childlessUnions
            .filter((unionArray) => unionArray.includes(title))
            .map((unionArray) => unionArray.join(""));

        unionLinks = [...unionLinks, ...otherUnions];

        let unionElements = unionLinks.map((unionName) => {
            return Array.from(document.querySelectorAll(`.union[data-union-name="${unionName}"]`));
        });

        unionElements = unionElements.flat();

        //get the lines linking us and family members, and remove fade, and add highlight
        let lineLinks = [
            ...document.querySelectorAll(`[data-child-name='${title}']`),
            ...document.querySelectorAll(`[data-source-name='${title}']`),
        ];

        //add unions if we're toggled to show them
        if (toggles.showUnions) {
            lineLinks = [...lineLinks, unionElements].flat();
        }

        let family = getImmediateFamily(getObjectFromElement(memberElement)); //( this should return the family names)

        //get the elements of family members, and add ourselves as well
        let familyElements = [
            ...family.map((name) => getElementByTitle(name)).filter((el) => el != null),
            memberElement,
        ];

        //actual event listener ================================================
        memberElement.addEventListener("mouseenter", (event) => {
            hint.updateHintText("hoverPortrait");
            //add the fade class to vade out when hovered
            memberElements.forEach((member) => {
                if (!member.textContent.includes(title)) {
                    member.classList.add("fade");
                }
            }); //add fade to all member elements and lines
            unionSymbols.forEach((img) => img.classList.add("fade"));

            //remove the fade class
            familyElements.forEach((el) => el.classList.remove("fade"));

            //add fade to all lines
            allLines.forEach((line) => line.classList.add("fade"));

            lineLinks.forEach((link) => {
                link.classList?.remove("fade");
                link.classList?.add("highlight");
            });
        });
        memberElement.addEventListener("mouseleave", () => {
            hint.updateHintText("default");
            memberElements.forEach((member) => member.classList.remove("fade")); //add fade to all members
            allLines.forEach((line) => line.classList.remove("fade"));

            unionSymbols.forEach((img) => img.classList.remove("fade"));

            lineLinks.forEach((link) => {
                link.classList.remove("highlight");
            });
        });
    });
}

// find unions that WE'RE the parents of
function getResultingUnions(characterKey) {
    return unions.filter((union) => union.parents.includes(characterKey));
}

// find unions that WE'RE the children of
function getParentUnions(characterKey) {
    return unions.filter((union) => union.children.includes(characterKey));
}

/**
 * add each member element to the membersObject based on the pages that exist
 */
function addMembers() {
    memberElements.forEach((member) => {
        let parents = JSON.parse(member.querySelector(".parents").textContent);
        let partners = JSON.parse(member.querySelector(".partners").textContent);
        let title = member.querySelector(".title").textContent;
        if (!membersObject[title]) {
            membersObject[title] = { name: title };
        }
        if (parents) {
            membersObject[title].parents = parents;
        }
        if (partners) {
            membersObject[title].partners = partners;
        }
        if (member.dataset.firstGen === "true") {
            membersObject[title].firstGen = true;
        }
        if (member.dataset.generationIndex) {
            membersObject[title].generationIndex = parseInt(member.dataset.generationIndex);
        }
    });
}

/**
 * find each elements' children, then add them to the members object
 */
function addChildren() {
    Object.keys(membersObject).forEach((obj) => {
        membersObject[obj].children = findMyChildren(obj);
    });
}

/**
 *
 * @param {String} sourceCharacter - the character who is checking to see if others have THEM listed as a partner
 * @returns other characters who have [SourceCharacter] listed as a partners
 */
function checkIfPartner(sourceCharacter) {
    return Object.keys(membersObject).filter((name) => {
        membersObject[name].partners?.includes(sourceCharacter);
    });
}

function checkIfSiblings(siblingArray, ourParents) {
    let match = false;
    if (ourParents && siblingArray) {
        ourParents.forEach((parent) => {
            if (siblingArray.includes(parent)) {
                match = true;
            }
        });
    }
    return match;
}

function findMySiblings(ourParents) {
    if (!ourParents) {
        return;
    }
    let siblings = Object.keys(membersObject).filter((memberKey) => {
        let siblingObject = membersObject[memberKey];
        return checkIfSiblings(siblingObject.parents || [], ourParents);
    });
    return siblings;
}

function toggleInput(event) {
    let element = event.currentTarget;
    let name = element.name;
    toggles[name] = !toggles[name];
    if (name == "siblingLines") {
        let siblingPaths = Array.from(document.querySelectorAll("path.sibling"));
        if (toggles.siblingLines) {
            siblingPaths.forEach((element) => {
                element.classList.remove("hide");
            });
        } else {
            siblingPaths.forEach((element) => {
                element.classList.add("hide");
            });
        }
    }
    if (name == "showUnions") {
        let unionObjects = [...Array.from(document.querySelectorAll(".union"))];
        let others = [...Array.from(document.querySelectorAll("path:not(.union)"))];
        if (toggles.showUnions) {
            unionObjects.forEach((element) => {
                element.classList.remove("hide");
            });
            others.forEach((element) => {
                element.classList.add("hide");
            });
        } else {
            unionObjects.forEach((element) => {
                element.classList.add("hide");
            });
            others.forEach((element) => {
                element.classList.remove("hide");
            });
        }
    }
    // toggles.siblingHighlight = !toggles.siblingHighlight;
}

function addSiblings() {
    Object.keys(membersObject).forEach((memberName) => {
        let ourObject = membersObject[memberName];
        let ourSiblings = findMySiblings(ourObject.parents);
        if (ourSiblings) {
            ourSiblings = ourSiblings.filter((name) => name != memberName);
            membersObject[memberName].siblings = ourSiblings;
        }
    });
}

/**
 *
 * @param {string} parentKey - find the string name of the parent,
 * and search for other objects that have this name in their array of parents
 * @returns any object that has the parentKey included in their list of parents
 */
function findMyChildren(parentKey) {
    let children = Object.keys(membersObject).filter((memberKey) => {
        let childObject = membersObject[memberKey];
        return childObject.parents?.includes(parentKey);
    });
    return children;
}

// find the children objects of each parent; add them to
// array of next generation
function groupChildGeneration(parentArray, childArray) {
    parentArray.forEach((peepName) => {
        let children = membersObject[peepName]?.children;
        //if we have children
        if (children && children.length > 0) {
            childArray.push([...children]);
        }
    });

    return childArray.flat();
}

/**
 * Find everyone who hasn't been assigned a generation
 * @param {integer} generationIndex - the index of the generation they're being added to
 * @returns a list of all people who don't have generations
 */
function addLeftovers(generationIndex) {
    let extras = Object.values(membersObject)
        .filter((memberObj) => memberObj.generationIndex == generationIndex)
        .map((obj) => obj.name);
    return extras;
}

function insert(array, index, items) {
    return [...array.slice(0, index), ...items, ...array.slice(index)];
}

/**
 * add the spouses, who don't have a direct parent in this tree
 * @param {Array} childArray - the array of children in a generation that
 * we want to add spouses to
 */
function addSpouses(childArray) {
    let mappedArray = childArray.map((childName, index) => {
        let partners = membersObject[childName].partners;
        //replace the child's name with an array of them AND their partners
        if (partners) {
            return [childName, ...partners];
        } else {
            return [childName];
        }
    });
    //flatten them into the same depth array, remove duplicates with set, filter out ones that don't exist on this page
    mappedArray = Array.from(new Set(mappedArray.flat())).filter((obj) => Object.keys(membersObject).includes(obj));
    return mappedArray;
}

/**
 * determine each generation by parents and children, and put them in lists
 */
function distributeIntoGenerations() {
    //get all characters in first gen
    let firstGen = addSpouses(Object.keys(membersObject).filter((name) => membersObject[name].firstGen));
    firstGen.push(...addLeftovers(0));

    let secondGen = []; //getFromPreviousGeneration(firstGen);

    let thirdGen = []; //getFromPreviousGeneration(secondGen);

    let fourthGen = []; //getFromPreviousGeneration(thirdGen);

    let fifthGen = []; //getFromPreviousGeneration(fourthGen);

    //find those tagged as being in the first generation
    // get their children, and push them into the second generation
    // but cluster them by parent so siblings are near each other

    secondGen = addSpouses(groupChildGeneration(firstGen, secondGen));
    secondGen.push(...addLeftovers(1));

    thirdGen = addSpouses(groupChildGeneration(secondGen, thirdGen));
    thirdGen.push(...addLeftovers(2));

    fourthGen = addSpouses(groupChildGeneration(thirdGen, fourthGen));
    fourthGen.push(...addLeftovers(3));

    fifthGen = addSpouses(groupChildGeneration(fourthGen, fifthGen));
    fifthGen.push(...addLeftovers(4));

    //gather each generation into an array so we can double loop through them
    charactersByGeneration = [firstGen, secondGen, thirdGen, fourthGen, fifthGen];
}

/**
 * position the characters within each generation, applying X and Y attributes accordingly
 */
function positionInGenerations() {
    charactersByGeneration.forEach((gen) => {
        //for each generation, add an array of available positions
        if (gen.length > 0) {
            horizontalPositions.push(Array.from(Array(gen.length)));
        }
    });

    //? This is how they'll be distributed along each generation
    //for each index in the position array, divide each array into equal segments
    // based on how many individuals in each generation
    horizontalPositions.forEach((positionArray, index) => {
        if (positionArray.length <= 2) {
            //center if there's only one, and evenly space out if there are two
            if (positionArray.length == 2) {
                positionArray[0] = 25;
                positionArray[1] = 75;
            } else if (positionArray.length === 1) {
                positionArray[0] = 50;
            }
        } else {
            // let currentNumber = 0.5;
            let currentNumber = 1.5;
            let svgSize = document.querySelector(".family-tree").getBoundingClientRect().width * 0.01;
            let incrementBy = 100 / positionArray.length; // + svgSize;
            //divide the length of the child array into equal segments to be turned into percentages
            for (let i = 0; i < positionArray.length; i++) {
                console.log(currentNumber, incrementBy);
                positionArray[i] = currentNumber;
                currentNumber += incrementBy;
            }
        }
    });
    //group children by parents, then spread them into the same array
    charactersByGeneration.forEach((characters, genIndex) => {
        //go through each child in each generation
        characters.forEach((characterKey, index) => {
            let memberObj = membersObject[characterKey];

            memberObj.generation = genIndex; //set the generation

            //set our position based on the position stored in the horizontalPositions array
            // (a parallel array)
            let ourElement = getElementByTitle(characterKey);

            //set our y position based on our generation
            let ourXPosition = horizontalPositions[genIndex][index];
            let ourYPosition = genPositions[genIndex];
            ourElement.setAttribute("y", `${ourYPosition}%`);

            //set our x position based on where we are in the horizontalPositions array for our generation
            ourElement.setAttribute("x", `${ourXPosition}%`);

            ourElement.dataset.generation = genIndex;
        });
    });
}

function assignGenerations() {
    let leftovers = Object.keys(membersObject).filter(
        (characterKey) => !membersObject[characterKey].hasOwnProperty("generation")
    ); //get all the leftovers, which should mostly be spouses

    leftovers.forEach((characterKey) => {
        //grab partner names, and then grab the partner objects from those names
        let partners = membersObject[characterKey].partners?.map((partner) => membersObject[partner]);
        if (!partners) {
            partners = checkIfPartner(characterKey)?.map((partner) => membersObject[partner]);
        }
        if (partners) {
            //if we have partners, find partner with generation, then find their generation

            let generation = partners.filter((partner) => partner.generation)[0].generation;

            membersObject[characterKey].generation = generation;
        }
    });
}

/**
 * for creating new unions
 */
function formUnions() {
    //create each union
    Object.keys(membersObject).forEach((memberKey) => {
        let obj = membersObject[memberKey];
        let parents = obj.parents;
        if (parents) {
            // if a union doesn't exist, create a new one
            addNewUnion(parents, memberKey);
        }
    });
    for (let memberKey in membersObject) {
        let memberObject = membersObject[memberKey];
        let partners = memberObject.partners;
        if (partners) {
            partners.forEach((partner) => {
                let existingUnion = getUnionIfExists([memberKey, partner]); //see if this airing of partners is already part of a union
                if (!existingUnion) {
                    childlessUnions.push([memberKey, partner]);
                }
            });
        }
    }
    childlessUnions.forEach((union) => {
        drawLine(getElementByTitle(union[0]), getElementByTitle(union[1]));
    });
    //once they're all set, position the unions, and create the symbols for them
    unions.forEach((union) => {
        setUnionSymbolPositions(union);
        createUnionSymbol(union);
    });
}

/**
 *  Draw a line between romantic partners without any children
 * @param {SVGElement} partner1 - the first partner
 * @param {SVGAElement} partner2 - the second partner
 * @returns
 */
function drawLine(partner1, partner2) {
    if (!partner1 || !partner2) {
        return;
    }
    let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", partner1.getAttribute("x"));
    line.setAttribute("x2", partner2.getAttribute("x"));

    line.setAttribute("y1", parseFloat(partner1.getAttribute("y")) + parseFloat(partner1.getAttribute("height")) / 2);
    line.setAttribute("y2", parseFloat(partner2.getAttribute("y")) + parseFloat(partner2.getAttribute("height")) / 2);
    line.setAttribute("stroke", "#CC3366");
    line.setAttribute("stroke-width", "0.1px");
    line.classList.add("partner");
    line.classList.add("union");
    line.dataset.unionName = partner1.dataset.title + partner2.dataset.title;

    svgElement.prepend(line);
}

/**
 * get the average position between elements
 * @param {Array} elementArray - the elements between which we want to get the average
 * @param {*} type - if we're trying to get the average X or average Y position
 * @returns the average position
 */
function getAveragePositions(elementArray, type) {
    let accumulator = 0;
    elementArray.forEach((element) => {
        let value;
        if (type == "x") {
            value = parseFloat(element.getAttribute("x"));
        } else if (type == "y") {
            value = parseFloat(element.getAttribute("y"));
        }
        accumulator += value;
    });
    return accumulator / elementArray.length;
}

function createUnionSymbol(union) {
    if (!union.xAverage || !union.yAverage) {
        return;
    }
    let heartObject = document.createElementNS("http://www.w3.org/2000/svg", "image");
    heartObject.setAttribute("href", "/assets/symbols/heart.png");
    heartObject.setAttribute("width", "2");
    heartObject.setAttribute("height", "2");
    heartObject.setAttribute("x", union.xAverage + "%");
    heartObject.setAttribute("y", union.yAverage + "%");
    heartObject.dataset.unionName = union.name;
    heartObject.dataset.title = union.name;
    heartObject.classList.add("union");
    svgElement.prepend(heartObject);
}

/**
 * draw lines between unions
 */
function connectToUnions() {
    unions.forEach((union) => {
        let unionElement = svgElement.querySelector(`[data-union-name="${union.name}"]`);
        if (!unionElement) return;

        let parentElements = union.parents.map((parentKey) => getElementByTitle(parentKey));
        let childElements = union.children.map((childKey) => getElementByTitle(childKey));
        childElements.forEach((childEl) => {
            drawConnections(unionElement, childEl, "children", union.name);
        });
        parentElements.forEach((parentEl) => {
            drawConnections(unionElement, parentEl, "parents", union.name);
        });
    });
}
/**
 *
 * @param {String} relationType - go through each person in our family and connect them to their parents, children, siblings and spouses
 */
function connectMembers(relationType) {
    Object.keys(membersObject).forEach((peep) => {
        let obj = membersObject[peep];
        let element = getElementByTitle(peep);
        let relations = obj[relationType];
        if (relations) {
            let childElements = relations.map((childName) => {
                return getElementByTitle(childName);
            });
            childElements.forEach((childEl) => {
                drawConnections(element, childEl, relationType);
            });
        }
    });
}

function calculatePointY(imageElement, fromBottom, relationType = "") {
    let y = imageElement.getAttribute("y");
    if (shouldParseFloat || shouldDivide) {
        y = parseFloat(y);
        if (shouldDivide) {
            y = y / 10;
        }
    }
    if (fromBottom) {
        y += imageElement.height.baseVal.value;
    }
    if (shouldConcatPercentage) {
        y += "%";
    }
    return y;
}

function drawConnections(topElement, bottomElement, relationType, unionName = "", divide = false) {
    if (unionName && relationType === "parents") {
        var tempElement = bottomElement;
        bottomElement = topElement;
        topElement = tempElement;
    }
    let bottomEl = bottomElement;
    let topEl = topElement;
    if (topEl === null || bottomEl === null) {
        return;
    }
    let percentageWidth = topEl.width.baseVal.value;
    let halfPercentageWidth = percentageWidth / 2;

    let bottomPercentageWidth = bottomEl.width.baseVal.value;
    let halfBottomPercentageWidth = bottomPercentageWidth / 2;

    if (bottomElement && topElement) {
        let bottomX =
            parseFloat(bottomEl.getAttribute("x")) +
            (unionName ? halfBottomPercentageWidth : halfPercentageWidth) +
            `%`;

        // let childY = childEl.getAttribute("y");
        //we want the line to go to the bottom of the parent rather than the top
        let bottomY = divide ? parseFloat(bottomEl.getAttribute("y")) / 10 : bottomEl.getAttribute("y");

        if (relationType == "partners") {
            bottomY += 10;
            bottomY += "%";
        }
        let topX = parseFloat(topEl.getAttribute("x")) + halfPercentageWidth + `%`;
        let topY = parseFloat(topEl.getAttribute("y")) + topEl.height.baseVal.value + `%`;
        createLine(
            topX,
            topY,
            bottomX,
            bottomY,
            topElement.dataset.title,
            bottomEl.dataset.title,
            relationType,
            unionName,
            bottomEl.dataset.generation
        );
    }
}

function getElementByTitle(memberTitle) {
    return document.querySelector(`svg[data-title='${memberTitle}']`);
}

function createLine(
    sourceX,
    sourceY,
    destinationX,
    destinationY,
    sourceName,
    childName,
    relationType,
    unionName = "",
    generation
) {
    let newLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
    //newLine.setAttribute('id', 'line2');
    newLine.setAttribute("stroke", "white");
    newLine.setAttribute("vector-effect", "non-scaling-stroke");
    // newLine.setAttribute("marker-start", "url(#dot)");
    // newLine.setAttribute("marker-end", "url(#dot)");
    //Q x, y (first x and y are control point), second x y are next coordinate
    sourceY = parseFloat(sourceY);
    sourceX = parseFloat(sourceX);
    destinationX = parseFloat(destinationX);
    destinationY = parseFloat(destinationY);

    let midpointX = (sourceX + destinationX) / 2;
    let midpointY = (sourceY + destinationY) / 2;
    newLine.setAttribute(
        "d",
        `M ${sourceX} ${sourceY}
        Q ${sourceX} ${midpointY}
		${midpointX} ${midpointY}
		Q ${destinationX} ${midpointY}
		${destinationX} ${destinationY}`
    );
    newLine.dataset.generation = generation;

    if (unionName) {
        newLine.dataset.unionName = unionName;
    } else {
        newLine.dataset.sourceName = sourceName;
    }
    newLine.dataset.childName = childName;
    if (!unionName && toggles.showUnions) {
        newLine.classList.add("hide");
    } else if (unionName && toggles.showUnions) {
        newLine.classList.add("union");
    }
    if (relationType === "partners") {
        newLine.classList.add("partner");
    } else if (relationType === "siblings") {
        newLine.classList.add("sibling");
        //if the sibling lines are hidden
        if (!toggles.siblingLines) {
            newLine.classList.add("hide");
        }
    } else if (relationType === "parents") {
        newLine.classList.add("parent");
    } else if (relationType === "children") {
        newLine.classList.add("child");
    }
    svgElement.prepend(newLine);
}
