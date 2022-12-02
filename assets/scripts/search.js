import { SideDrawer } from "./drawers.js";
import Helpers from "./helpers.js";

let galleryCards;
let activeFilterList;
let expandButton;
let filterSection;
let deceasedFilter;
let deceasedPeople;
var SearchData = {};

SearchData.currentQueries = [];
SearchData.checkedFilters = [];
const searchActions = {
    change: {
        filterAll: {
            handler: () => {
                filterAll();
            },
        },
    },
    input: {
        filterSearch: {
            handler: (event) => {
                filterSearch(event);
            },
        },
    },
};

document.addEventListener("DOMContentLoaded", () => {
    console.log("Search has been loaded");

    let filterDrawer = new SideDrawer();
    filterDrawer.cacheDrawerElements({
        drawer: ".drawer.filter-section__wrapper",
        toggleButtonOuter: ".drawer__toggle-button",
    });

    // filterSectionWrapper = document.querySelector(".filter-section--wrapper");
    // filterSection = document.querySelector(".filter-section");
    galleryCards = document.querySelectorAll(".card");
    deceasedFilter = document.querySelector("#Deceased");
    activeFilterList = document.querySelector(".active-filters");

    deceasedPeople = Array.from(galleryCards).filter((card) =>
        card.innerText.toLowerCase().includes("condition/deceased")
    );

    // hide all of the "deceased" people by default
    deceasedPeople.forEach((card) => {
        card.classList.add("is-hidden-deceased");
    });

    if (deceasedFilter) deceasedFilter.disabled = true;

    Helpers.addListeners(searchActions);
    // disable the status filter
});

function initializeElements(parentElement) {}

function doesMatchFilter(filter, className) {
    galleryCards.forEach((card) => {
        if (card.innerText.toLowerCase().includes(filter)) {
            card.classList.remove(className);
        }
    });
}

function toggleAll(event) {
    let toggle = event.currentTarget;
    // let deceasedFilter = document.querySelector("#Condition/Deceased");
    deceasedPeople.forEach((card) => {
        if (toggle.checked) {
            card.classList.remove("is-hidden-deceased");
            deceasedFilter.disabled = false;
        } else {
            card.classList.add("is-hidden-deceased");
            if (deceasedFilter.checked) {
                deceasedFilter.click();
            }
            // deceasedFilter.checked = false;
            deceasedFilter.disabled = true;
        }
    });
}
function convert(text) {
    return text.toLowerCase().replace(/-/, " ");
}
function trim(text) {
    return text.replace(/[\n\r]+|[\s]{2,}/g, " ").trim();
}
function filterSearch(event) {
    let searchBox = event.currentTarget;
    let query = searchBox.value.toLowerCase(); // get the search box's value
    let filterText = [...SearchData.currentQueries];
    galleryCards.forEach((card) => {
        let match = true;

        if (filterText.length > 0) {
            console.log(card.innerText.toLowerCase().replace(/-/g, " "), query);

            match = filterText.some((text) => convert(card.innerText).includes(text));
        }
        console.log(card.innerText.toLowerCase().replace(/-/g, " "), query);
        let meetsQuery = convert(card.innerText).includes(query);
        if (match && meetsQuery) {
            card.classList.remove("is-hidden");
        } else {
            card.classList.add("is-hidden");
        }
    });
}

function filterAll() {
    let noFilters = false;
    // let filterChip = event.currentTarget;
    let searchBoxQuery = document.querySelector("#search-box").value.toLowerCase();

    let checkboxes = Array.from(
        document.querySelectorAll("input[type='checkbox']:checked:not(#show-deceased):not(.active-filter)")
    );

    let filterChipIDs = checkboxes.map((box) => box.getAttribute("id"));

    let filterText = checkboxes.map((box) => {
        return trim(box.parentNode.querySelector("label").textContent.toLowerCase());
        // if (getCheckboxLabel !== undefined) {
        //     console.log("Checkbox label", getCheckboxLabel)
        //     return getCheckboxLabel(box).toLowerCase()
        // } else {

        //     return " ";
        // }
    });
    // let filterText = Array.from(document.querySelectorAll("input[type='checkbox']:checked:not(#show-deceased)")).map(
    //     (box) => getCheckboxLabel(box).toLowerCase()
    // );
    //.textContent.toLowerCase());

    SearchData.currentQueries = [...filterText];
    SearchData.checkedFilters = [...filterChipIDs];

    if (SearchData.currentQueries.length === 0) {
        noFilters = true;
    }

    // go through the cards and filter the ones that match the current queries

    updateActiveFilterList();
    // if there are no filters
    if (noFilters) {
        let meetsQuery = true;

        // toggle all of our cards to be visible, if they meet the search query too, if
        // there is one
        galleryCards.forEach((card) => {
            if (searchBoxQuery) {
                meetsQuery = convert(card.innerText).includes(searchBoxQuery);
            }
            if (meetsQuery) {
                card.classList.remove("is-hidden");
            }
        });
    } else {
        galleryCards.forEach((card) => {
            let meetsQuery = true; // default value in case there isn't a query
            let match = filterText.some((text) => convert(card.innerText).includes(text));
            if (searchBoxQuery) {
                meetsQuery = convert(card.innerText).includes(searchBoxQuery);
            }
            if (match && meetsQuery) {
                // if the filter is mattched
                card.classList.remove("is-hidden");
            } else {
                card.classList.add("is-hidden");
            }
        });
    }
}

function htmlToElement(html) {
    var template = document.createElement("template");
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

function createFilterSpanFromString(text) {
    let string = `
  <span class="filter-span">
<input
                    class="active-filter"
                    id="${text}-active"
                    name="${text}"
                    checked
                    type="checkbox" />
                <label for="${text}-active">${text}</label>
                </span>
    `;
    return htmlToElement(string);
}
function removeAllChildNodes(parent) {
    while (parent.firstChild && parent.firstChild.classList.has("filter-span")) {
        parent.removeChild(parent.firstChild);
    }
}
function removeAllFilterSpans(parent) {
    Array.from(parent.querySelectorAll(".filter-span")).forEach((el) => {
        el.remove();
    });
}
function updateActiveFilterList() {
    removeAllFilterSpans(activeFilterList);
    SearchData.checkedFilters.forEach((id) => {
        let filterChip = document.querySelector(`#${id}`);
        let query = getCheckboxLabel(filterChip);
        let newFilterSpan = createFilterSpanFromString(query);
        activeFilterList.append(newFilterSpan);
        newFilterSpan.querySelector("input").addEventListener("change", () => {
            filterChip.click();
        });
    });
    if (SearchData.checkedFilters.length === 0) {
        activeFilterList.classList.add("hidden");
    } else {
        activeFilterList.classList.remove("hidden");
    }
}
function capitalize(text) {
    return text.charAt;
}
// https : //
// stackoverflow.com/questions/19434241/how-i-can-get-the-text-of-a-checkbox
function getCheckboxLabel(checkbox) {
    if (checkbox.parentNode.tagName === "LABEL") {
        return checkbox.parentNode;
    }
    if (checkbox.id) {
        return document.querySelector('label[for="' + checkbox.id + '"]').dataset.name;
    }
}
