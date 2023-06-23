const apiKey = 'GOptyKGJSDj9eNbFr3R5oG22LzSXM0vCnCxVVjkLnWldlIewz7KeJw7i'
const BASE_URL = 'https://api.pexels.com'
const perPage = 15
let currentPage = 1
let searchTerm = null

const imagesWrapper = document.querySelector('.images')
const loadMore = document.querySelector('.load-more')
const searchInput = document.querySelector('.search-box input')
const lightBox = document.querySelector('.lightbox')
const downloadBtn = document.querySelector('#lightbox-download')
let closeLightBoxBtn = null

const closeLightBox = () => {
  lightBox.classList.remove('show')
  closeLightBoxBtn?.removeEventListener('click', closeLightBox)
  document.body.style.overflow = 'auto'
}

const closeByWrapperClick = (e) => {
  if(e.target.classList.contains('lightbox')) {
    closeLightBox()
  }
}

const setBoxData = (imgUrl, photographer) => {
  const img = lightBox.querySelector('.preview-img img')
  img.src = imgUrl

  const person = lightBox.querySelector('#photographer-name')
  person.innerText = photographer

  downloadBtn.setAttribute('data-img', imgUrl)
}

const showLightBox = () => {
  lightBox.classList.add('show')
  closeLightBoxBtn = lightBox.querySelector('#close')
  closeLightBoxBtn.addEventListener('click', closeLightBox)
  lightBox.addEventListener('click', closeByWrapperClick)
  document.body.style.overflow = 'hidden'
}

const showLightBoxWithData = (imgUrl, photographer) => {
  showLightBox()
  setBoxData(imgUrl, photographer)
}

const downloadImg = (imgUrl) => {
  console.log({ imgUrl })
  fetch(imgUrl)
    .then(res => res.blob())
    .then(file => {
      console.log(file)
      const a = document.createElement('a')
      a.href = URL.createObjectURL(file)
      a.download = new Date().getTime()

      console.log({ href: a.href, down: a.download })
      a.click()
      URL.revokeObjectURL(a.href)
    })
    .catch(() => alert('Failed to fetch image'))
}

const onDetailsDownload = (e, imgUrl) => {
  console.log({ e })
  e.stopPropagation()

  downloadImg(imgUrl)

}

const generateHTML = (images) => {
  let data = ''
   images.forEach(({src, photographer}) => {
     data += `
    <li class="card" onclick="showLightBoxWithData('${src.large2x}', '${photographer}')">
       <img src="${src.large2x}" alt="img">
       <div class="details">
         <div class="photographer">
           <span>
             <svg>
             <use xlink:href="assets/svg-sprite.svg#camera"></use>
           </svg>
           </span>

           <span>${photographer}</span>
         </div>
         <button class="download" onclick="onDetailsDownload(event, '${src.large2x}')">
           <svg>
             <use xlink:href="assets/svg-sprite.svg#download"></use>
            </svg>
         </button>
       </div>
     </li>
    `
   })
  imagesWrapper.innerHTML += data
}

const loadMoreImages = () => {
  currentPage++
  let url  = `${BASE_URL}/v1/curated?page=${currentPage}&per_page=${perPage}`
  url  = searchTerm ? `${BASE_URL}/v1/curated?page=${currentPage}&per_page=${perPage}` : url
  getImages(url)
}

const getImages = (url) => {
  loadMore.innerText = 'Loading...'
  loadMore.classList.add('disable')
  fetch(url, {
    headers: {
      Authorization: apiKey
    }
  }).then(res => res.json())
    .then(res => {
      generateHTML(res.photos)
      loadMore.innerText = 'Load more'
      loadMore.classList.remove('disable')
    })
    .catch(() => alert('Failed to load images'))
}

const loadSearchImages = (e) => {
  if(!e.target.value) return

  if (e.key === 'Enter') {
    currentPage = 1
    searchTerm = e.target.value

    imagesWrapper.innerHTML = ''
    getImages(`${BASE_URL}/v1/search?query=${searchTerm}&page=${currentPage}&per_page=${perPage}`)
  }
}

getImages(`${BASE_URL}/v1/curated?page=${currentPage}&per_page=${perPage}`)
loadMore.addEventListener('click', loadMoreImages)
searchInput.addEventListener('keyup', loadSearchImages)
downloadBtn.addEventListener('click', (e) =>  downloadImg(e.currentTarget.dataset.img))
