let mainImage;



function createLightboxHTML(mainImageSrc, otherImageSrc) {
const lightboxHTML = `
<div class="lightbox">
	<div class="spotlight-image-container">
		<img class="spotlight-image" src="${mainImageSrc}" />
	</div>
	<div class="other-images">
		<img src="https://images.unsplash.com/photo-1664988081337-e937102c4674?crop=entropy&cs=tinysrgb&fm=jpg&ixid=MnwzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NjY5ODQzMjk&ixlib=rb-4.0.3&q=80" alt="">
		<img src="https://images.unsplash.com/photo-1665250563202-bf1bb9e3c0c0?crop=entropy&cs=tinysrgb&fm=jpg&ixid=MnwzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NjY5ODQzMjk&ixlib=rb-4.0.3&q=80" alt="">
		<img src="https://images.unsplash.com/photo-1665473053008-22379b19ab4a?crop=entropy&cs=tinysrgb&fm=jpg&ixid=MnwzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NjY5ODQzMjk&ixlib=rb-4.0.3&q=80" alt="">
		<img src="https://images.unsplash.com/photo-1665742489345-eaf84e8bf600?crop=entropy&cs=tinysrgb&fm=jpg&ixid=MnwzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NjY5ODQzMjk&ixlib=rb-4.0.3&q=80" alt="">
		<img src="https://images.unsplash.com/photo-1665991947192-a63451f34c90?crop=entropy&cs=tinysrgb&fm=jpg&ixid=MnwzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE2NjY5ODQzMjk&ixlib=rb-4.0.3&q=80" alt="">
	</div>
`
}
function handleLightboxImageClick(){
let otherImages = document.querySelectorAll(".other-images img")

Array.from(otherImages).forEach((img) => {
	img.addEventListener("click", (event)=> {
        let src = event.currentTarget.getAttribute("src")
        mainImage.setAttribute("src", src) 
	})
})
}