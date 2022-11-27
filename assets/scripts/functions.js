var dialog;
let modalImg;
let allHeaders;
let pageNav;
let parentsHeader;
let childrenHeader;
let siblingsHeader;
let partnersHeader;
let title;
let mainImage;
let anchors;
//stackoverflow.com/questions/36532307/rem-px-in-javascript
// https:
function convertRemToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}
//stackoverflow.com/questions/12009367/javascript-event-handling-scroll-event-with-a-delay
function debounce(method, delay) {
    clearTimeout(method._tId);
    method._tId = setTimeout(function () {
        method();
    }, delay);
}

//codepen.io/malsu/pen/VwKzoPG
function navHighlighter() {
    // Get current scroll position
    let scrollY = window.pageYOffset;

    // Now we loop through sections to get height, top and ID values for each
    Array.from(allHeaders).forEach((current, index) => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - convertRemToPixels(5);
        let nextSectionHeight = document.offsetHeight;
        let nextSectionTop;
        sectionId = current.getAttribute("id");
        if (allHeaders[index + 1]) {
            //if there is a next heading
            nextSectionHeight = allHeaders[index + 1].offsetHeight;
            nextSectionTop = allHeaders[index + 1].offsetTop - convertRemToPixels(5);
        }

        /*
    - If our current scroll position enters the space where current section on screen is, add .active class to corresponding navigation link, else remove it
    - To know which link needs an active class, we use sectionId variable we are getting while looping through sections as an selector
    */
        //-- My addition -- for our purposes, find the next heading and use that
        if (scrollY > sectionTop && scrollY <= nextSectionHeight + nextSectionTop) {
            document.querySelector(".page-nav a[href*=" + sectionId + "]").classList.add("active");
        } else {
            document.querySelector(".page-nav a[href*=" + sectionId + "]").classList.remove("active");
        }
    });
}
document.addEventListener("load", function (event) {});

document.addEventListener("DOMContentLoaded", function (event) {
    if (document.querySelector("main").dataset.layout !== "locations_map") {
        console.log("Functions.js fully loaded");
        onLoad(event);
    }
});

function onLoad(event) {
    dialog = document.querySelector("dialog");
    modalImg = dialog?.querySelector("img");
    parentsHeader = document.querySelector("#parents");
    childrenHeader = document.querySelector("#children");
    siblingsHeader = document.querySelector("#siblings");
    partnersHeader = document.querySelector("#partnersspouses");
    anchors = Array.from(document.querySelectorAll("article a"));
    anchors.forEach((anchor) => {
        if (anchor.target == "_blank") {
            anchor.target = "_self";
        }
    });
    //if a paragraph has multiple images inside of it
    Array.from(document.querySelectorAll("p")).forEach((p) => {
        if (Array.from(p.querySelectorAll("img")).length > 1) {
            p.classList.add("gallery-wrapper");
        }
    });

    pageNav = document.querySelector(".page-nav");
    if (pageNav && pageNav.dataset.headingLevel == 2) {
        allHeaders = document.querySelectorAll("h2");
    } else if (pageNav && pageNav.dataset.headingLevel == 3) {
        allHeaders = document.querySelectorAll("h2, h3");
    } else if (pageNav && pageNav.dataset.headingLevel == 4) {
        allHeaders = document.querySelectorAll("h2, h3, h4");
    } else {
        allHeaders = [];
    }

    // modalImg = document.querySelector("#modal-img");

    let mainImage = document.querySelector(".featured-image img");

    // add dividers (horizontal rules) after each ul after the headers
    title = document.querySelector("h1");

    // Array.from(allHeaders).forEach((heading) => {
    //     let sectionGroups = nextUntil(heading, "h2");
    //     let section = document.createElement("section");
    //     wrapAll(sectionGroups, section);
    // });

    let firstParagraphs = [];
    if (title) {
        firstParagraphs = nextUntil(title, "h2", "p");
    }

    firstParagraphs?.forEach((element) => {
        // find hashtags
        let tags = findTags(element.textContent);
        if (tags) {
            element.innerHTML = tags;
        }
    });

    let familyHeaders = [parentsHeader, childrenHeader, siblingsHeader, partnersHeader];
    let familyLists = [];
    familyHeaders.forEach((item) => {
        if (item !== null) {
            const divider = document.createElement("hr");
            item.nextElementSibling.insertAdjacentElement("afterend", divider);
            // add the uls to an array so we can add stuff to their li's later
            familyLists.push(item.nextElementSibling);
        }
    });

    // put divider (hr) after title
    title?.insertAdjacentElement("afterend", document.createElement("hr"));

    // make all body images clickable to show a modal. Exclude the modal image
    // itself.
    let bodyImages = document.querySelectorAll(".wrapper img:not(#modal-img, .card-img__wrapper)");
    Array.from(bodyImages).forEach((element) => {
        element.addEventListener("click", show);
    });

    Array.from(allHeaders).forEach((element) => {
        //create anchor and list items
        let newAnchor = document.createElement("a");
        let newListItem = document.createElement("li");
        if (pageNav.dataset.headingLevel == 4) {
            if (element.tagName == "H3") {
                newAnchor.classList.add("anchor-three");
            } else if (element.tagName == "H4") {
                newAnchor.classList.add("anchor-four");
            } else if (element.tagName === "H2") {
                newAnchor.classList.add("anchor-two");
            }
        } else if (pageNav.dataset.headingLevel == 3) {
            if (element.tagName == "H2") {
                newAnchor.classList.add("anchor-three");
            } else if (element.tagName === "H3") {
                newAnchor.classList.add("anchor-four");
            }
        }

        //set href, inner text, and event listener
        let hash = `#${element.id}`;
        newAnchor.href = hash;
        newAnchor.addEventListener("click", (event) => {
            //remove active styling from any other ones
            Array.from(pageNav.querySelectorAll("a")).forEach((element) => element.classList.remove("active"));
            //add active styling to this one
            event.currentTarget.classList.add("active");
        });

        //get rid of the dashes
        let pattern = /-+/g;
        let innerText = element.id.replace(pattern, " ");

        //get rid of the digits generated at the end of the ids for ids w/ same name
        let pattern2 = /\d$/g;
        innerText = innerText.replace(pattern2, "");
        newAnchor.innerText = element.innerText; //innerText;

        //add them to dom
        newListItem.appendChild(newAnchor);
        pageNav.querySelector("ul").appendChild(newListItem);
        if (document.location.hash == hash) {
            newAnchor.classList.add("active");
        }
    });
}

function findTags(paragraphText) {
    let regex = new RegExp(/(^|\s)(#[\w\/\d-]+)/g);
    let newText = paragraphText;
    if (regex.test(newText)) {
        newText = newText.replace(regex, "$1<span class='tag'>$2</span>");
    } else {
        newText = null;
    }
    return newText;
    // paragraphText.replace(regex, "$1<span class='tag'>$2</span>"); return
    // paragraphText.match(regex);
}
// https://stackoverflow.com/questions/3337587/wrapping-a-set-of-dom-elements-using-javascript
// Wrap an HTMLElement around each element in an HTMLElement array.
const wrapEach = function (elms, wrapper) {
    // Convert `elms` to an array, if necessary.
    if (!elms.length) {
        elms = [elms];
    }

    // Loops backwards to prevent having to clone the wrapper on the first element
    // (see `child` below).
    for (var i = elms.length - 1; i >= 0; i = i - 1) {
        var child = i > 0 ? wrapper.cloneNode(true) : wrapper;
        var el = elms[i];

        // Cache the current parent and sibling.
        var parent = el.parentNode;
        var sibling = el.nextSibling;

        // Wrap the element (is automatically removed from its current parent).
        child.appendChild(el);

        // If the element had a sibling, insert the wrapper before the sibling to
        // maintain the HTML structure; otherwise, just append it to the parent.
        if (sibling) {
            parent.insertBefore(child, sibling);
        } else {
            parent.appendChild(child);
        }
    }
};

// Wrap an HTMLElement around ALL elements in an HTMLElement array.
const wrapAll = function (elms, wrapper) {
    var el = elms.length ? elms[0] : elms;

    // Cache the current parent and sibling of the first element.
    var parent = el.parentNode;
    var sibling = el.nextSibling;

    // Wrap the first element (is automatically removed from its current parent).
    wrapper.appendChild(el);

    // Wrap all other elements (if applicable). Each element is automatically
    // removed from its current parent and from the elms array.
    while (elms.length) {
        wrapper.appendChild(elms[0]);
    }

    // If the first element had a sibling, insert the wrapper before the sibling to
    // maintain the HTML structure; otherwise, just append it to the parent.
    if (sibling) {
        parent.insertBefore(wrapper, sibling);
    } else {
        parent.appendChild(wrapper);
    }
};
/*!
 * Get all following siblings of each element up to but not including the element matched by the selector
 * (c) 2017 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {Node}   elem     The element
 * @param  {String} selector The selector to stop at
 * @param  {String} filter   The selector to match siblings against [optional]
 * @return {Array}           The siblings
 */
var nextUntil = function (elem, selector, filter) {
    // Setup siblings array
    var siblings = [];

    // Get the next sibling element
    elem = elem.nextElementSibling;

    // As long as a sibling exists
    while (elem) {
        // If we've reached our match, bail
        if (elem.matches(selector)) {
            break;
        }

        // If filtering by a selector, check if the sibling matches
        if (filter && !elem.matches(filter)) {
            elem = elem.nextElementSibling;
            continue;
        }

        // Otherwise, push it to the siblings array
        siblings.push(elem);

        // Get the next sibling element
        elem = elem.nextElementSibling;
    }

    return siblings;
};

function cardClick(event) {
    let card = event.currentTarget;
    card.querySelector("a").click();
}

/**
 *  Display which filters are active and allow users to toggle them without opening the filter bar
 * @param {String} filter : the name of the filter we want to display;
 */
function showActiveFilters(filter) {
    //TODO:
}
function show(event) {
    dialog.showModal();
    let element = event.currentTarget;
    modalImg.src = element.src;
    modalImg.alt = element.alt;
    modalImg.classList.remove("fade");
}

function hideModal() {
    dialog.close();
    modalImg.classList.add("fade");
}
