# Collaborative Story Wiki



While working on a collaborative fiction project with friends, I realized there wasn't an easy way for us to keep track of all of the characters and settings we had built.

Using static site generator [Jekyll](https://jekyllrb.com/), I designed and developed a personal "wiki" website, which I later deployed using [Netlify](https://www.netlify.com/). This "wiki" was developed initially with the intention for it simply to be a mostly static collection of articles to be referenced and occasionally added to by myself and my group, with most of the pages initially written in Markdown with additional structure and formatting added using templating engine [LiquidJS](https://liquidjs.com/index.html).

However, as our project expanded and grew in complexity, I realized there was a need to develop additional functionality to help ease the process of adding and editing new settings and characters and how these settings and characters were interrelated.

Therefore the wiki site contains three main 'sub-projects'.

1.  Character Search
2.  Location Map
3.  Family Tree

## Character Search

[Live Site Character Search Page](https://fastidious-smakager-702620.netlify.app/character-search)

![Video Preview of Character Search](https://raw.githubusercontent.com/Evannessa/portfolio-private/master/public/project%20demo%20images/wiki%20videos/CharacterSearchDemo.mp4?token=GHSAT0AAAAAAB4UPIBTCVVFSQ2LAA5YIDISZCMJGAQ)

In order to keep track of an ever-expanding cast of characters, via JavaScript I developed that collects every 'character' page on the site by parsing their distinct metadata, then formats their image and title into a clickable card, and allows you to search for and filter these individuals by various characteristics, such as their age, gender, and location.

## Location Map

[Live Site Map Page](https://fastidious-smakager-702620.netlify.app/starshead-map)

![Video Preview of Location Map](https://raw.githubusercontent.com/Evannessa/portfolio-private/master/public/project%20demo%20images/wiki%20videos/LocationMapDisplay.mp4?token=GHSAT0AAAAAAB4UPIBTRHNLNF7S73PWAXOGZCMJJAA)

The setting of the story we were co-authoring expanded among multiple connected and nested locations.

While this could've perhaps been solved by an illustration of a map, the dynamic nature of our collaborative process and the geographical complexities of the landscape required a level of flexibility that a flat pre-drawn map wouldn't satisfy.

In order to solve this, I developed an interactive hex-map that would keep track of each location and stylistically fit the themes and moods of the story.

### Description of Functionality

Each "hex" represents an individual location.

You can hover over it to get a summary view of the location, or click upon the location to 'zoom in' to the sub-location and get a more detailed view.

The detailed view displaying lore descriptions, lists of inner locations, connected locations that could be traveled to or from, and characters or factions present in the location.

## Family Tree

[Live Site Family Tree Page](https://fastidious-smakager-702620.netlify.app/trees-ruto)

![Video Preview of Family Tree](https://raw.githubusercontent.com/Evannessa/portfolio-private/master/public/project%20demo%20images/wiki%20videos/FamilyTreeDisplay.mp4?token=GHSAT0AAAAAAB4UPIBSZ74JTLDT25JQEEUWZCMJIBQ)

Keeping track of familial relations among our cast of characters also proved difficult. Knowing new characters could be added at any time, constantly recreating and rearranging the cast's family tree in flow-chart software like I'd been doing before proved too much of a hassle.

To solve this, I developed a 'dynamic' family tree that draws from YAML front matter metadata written in each individual's character's article, and leverages that data to connect each character with their immediate family members and distribute them evenly across an SVG viewport.{" "}

## Description of Functionality


Hovering over a portrait magnifies the individual in question and highlights their connections with their immediate family members, fading out any non-immediately-related individuals.

Clicking upon the individual's portrait will take you to their individual article page so you can read about them in-depth.



![Preview Image of Location Map Page - Main Illustration](https://user-images.githubusercontent.com/13098820/235264971-ec214cc0-bcc6-4fbe-b356-73f9ddf02a44.png)
