window.onload = function () {
    // splitByHeading(2);

};
document.addEventListener("DOMContentLoaded", function (event) {
    console.log("Timeline has been loaded");
    splitByHeading(2);
    // onLoad(event);
});

function splitByHeading(headingLevel = 2) {
    let mainArea = document.querySelector("main");
    let content = document.querySelector("content content");
    let allChildren = Array.from(content.children);
    let headings = document.querySelectorAll(`content h${headingLevel}`);
    headings = Array.from(headings);
    let indexes = headings.map((heading) => {
        return allChildren.indexOf(heading);
    });
    console.log(content, indexes);
    let sections = [];
    let sectionHeaders = [];
    indexes.forEach((headingIndex, index) => {
        let start = headingIndex;
        let end = indexes[index + 1];
        if (end > allChildren.length) {
            //if for some reason the next heading's index goes beyond the end of the array,
            //just have it be the last index in the array instead
            end = allChildren.length - 1;
        }
        sectionHeaders.push(allChildren[start]);
        sections.push(allChildren.slice(start + 1, end));
    });
    // sections = sections.filter((el)=> el.tagName === "p" || el.tagName === `h3`)
    // let sectionsObject = Object.fromEntries(sections);
    let periods = sections.map((array) =>
        array
            .filter((el) => el.textContent && !(el.textContent.includes("#event") || el.textContent.includes("#scene")))
            .map((el) => {
                return { tagName: el.tagName.toLowerCase(), content: el.textContent };
            })
    );
    let timelineSection = document.createElement("section");
    timelineSection.classList.add("timeline-section");
    mainArea.prepend(timelineSection);

    periods.forEach((period, index) => {
        let periodElement = document.createElement("div");
        periodElement.classList.add("period");
        timelineSection.appendChild(periodElement);

        let periodHeader = document.createElement("header");
        periodElement.appendChild(periodHeader);

        let periodTitle = document.createElement("h2");
        periodHeader.appendChild(periodTitle);
        periodHeader.classList.add("period--title");
        periodTitle.insertAdjacentHTML("afterbegin", sectionHeaders[index].textContent);

        let previousContainer;
        let previousTooltip;
        period.forEach((item) => {
            const headingRegex = /h\d/g;
            const contentRegex = /p|ul/g;

            let itemElement = document.createElement(item.tagName);
            itemElement.insertAdjacentHTML("beforeend", item.content);
            if (headingRegex.test(item.tagName)) {
                let itemContainer = document.createElement("div");
                itemContainer.classList.add("timeline-item--wrapper");
                periodElement.appendChild(itemContainer);

                itemElement.classList.add("timeline-item--heading");
                previousContainer = itemContainer;
                previousContainer.appendChild(itemElement);

                let tooltipDiv = document.createElement("div");
                tooltipDiv.classList.add("timeline-item--tooltip");
                previousContainer.appendChild(tooltipDiv);

                previousTooltip = tooltipDiv;
            }

            if (contentRegex.test(item.tagName)) {
                if (!previousTooltip) {
                    let tooltipDiv = document.createElement("div");
                    tooltipDiv.classList.add("timeline-item--tooltip");
                    previousContainer.appendChild(tooltipDiv);
                    previousTooltip = tooltipDiv;
                }
                itemElement.classList.add("timeline-item--content");
                previousTooltip.appendChild(itemElement);
            }
        });
    });
}

function splitByParagraph() {}
