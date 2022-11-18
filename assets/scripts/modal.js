import Helpers from "./helpers.js";
export class Modal {

    constructor() {

    }
    initialize(modalType = "information", data = {}, insetParent) {
        const { mainImageSrc, otherImageSrcArray = [] } = data;
        console.log(data)
        if (modalType === "imageGallery") {
            this.lightbox = this.createLightboxHTML(mainImageSrc, otherImageSrcArray, data, modalType, insetParent)
        } else {
            console.log("Creating information modal")
            this.lightbox = this.createLightboxHTML(mainImageSrc, otherImageSrcArray, data, modalType)
        }
        if (this.lightbox) {
            if (!insetParent) insetParent = document.querySelector("main")
            insetParent.append(this.lightbox)
            console.log(insetParent, this.lightbox)
            insetParent.querySelector(".loading-image").addEventListener("load", (event) => {
                let img = event.currentTarget;
                if (img.complete) {

                    console.log("Loading Image finished loading")
                    this.lightbox.querySelector(".spotlight-image").setAttribute("src", img.getAttribute("src"))

                }
            })
            return this.lightbox;
        }
    }

    returnInfoData(data) {
        const { type, name, description, tags, connections } = data;
        return `
            <header class="info-modal__header">
           <${name.tag} class="info-modal__title">${name.value}</${name.tag}>
           <${type.tag} class="info-modal__subtitle">${type.value}</${type.tag}>
           </header>
           <div class="info-modal__content">
           <${description.tag} class="info-modal__description">${description.value}</${description.tag}>
           <${tags.tag} class="info-modal__tags">${tags.value}</${tags.tag}j
           <${connections.wrapper} class="info-modal__connections">${connections.value}</${connections.wrapper}>
           </div>
            `
    }


    htmlToElement(html) {
        let template = document.createElement('template');
        html = html.trim(); // Never return a text node of whitespace as the result
        template.innerHTML = html;
        return template.content.firstChild;
    }



    /**
     * Returns an HTML element created with image soures from the gallery interacted with
     * @param {String} mainImageSrc - string of image source
     * @param {Array} otherImageSrcArray = string array of image sources
     * @returns an HTML Element created with data from images in clicked gallery
     */
    createLightboxHTML(mainImageSrc, otherImageSrcArray = [], data, modalType) {

        const hasOtherImages = otherImageSrcArray.length > 0
        function returnOtherImageDiv() {
            if (hasOtherImages) {
                return `	<div class="other-images">
	</div>`
            }
            return ` `;
        }


        const lightboxHTML = `
<div class="lightbox ${modalType}">
    <button class="lightbox-close-button">X</button>
	<div class="spotlight-image-container">
		<img class="spotlight-image" src="/assets/svg/Rolling-1s-200px.svg" />
		<img class="loading-image" src="${mainImageSrc}" style="opacity: 0%;"/>
	</div>
    ${returnOtherImageDiv()}
`
        const lightbox = htmlToElement(lightboxHTML)
        let otherImages;
        if (hasOtherImages) {
            this.mainImage = lightbox.querySelector(".spotlight-image")
            otherImages = this.createImageList(otherImageSrcArray, mainImageSrc)
            otherImages.forEach((img) => {
                lightbox.querySelector(".other-images").append(img)
            })
        }
        if (lightbox) {
            this.mainImage = lightbox.querySelector(".spotlight-image")
            this.closeButton = lightbox.querySelector(".lightbox-close-button");
            this.closeButton.addEventListener("click", (event) => {
                lightbox.remove()
            })
        }

        return lightbox
    }

    createImageList(imgSrcArray = [], currentMainSrc) {
        let imgArray = imgSrcArray.map((src) => {
            return htmlToElement(`<img class="thumbnail-image" src="${src}" />`)
        })
        imgArray.forEach((item) => {

            item.addEventListener("click", (event) => {
                let currentTarget = event.currentTarget;
                let src = currentTarget.getAttribute("src")
                this.mainImage.setAttribute("src", src)
                currentMainSrc = this.mainImage.getAttribute("src");
                imgArray.forEach((img) => img.classList.remove("current"))
                if (currentMainSrc === src) {
                    item.classList.add("current")
                }

            })
        })
        return imgArray
    }
}

