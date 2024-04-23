const generateButton = document.getElementById('generate-btn'), imagesList = document.querySelector('.generated-images-list'),
    userDescription = document.getElementById('desc')

const imageLimit = 6, imagesUrlList = []
let selectedImageNumber = null
const apiKey = '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', apiUrl = 'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5'

window.onload = () => {
    userDescription.value = ''
}

/* Genera un número aleatorio (1 - 10000) cada que se genera una imagen */
const generateRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* Permite descargar la imagen seleccionada al dar clic sobre ella */
const downloadSelectedImg = (url, number) => {
    const imageUrl = document.createElement('a')
    imageUrl.href = url
    imageUrl.download = `generated image ${number + 1}.jpg`
    imageUrl.click()
}

/* Función que genera las imágenes de acuerdo a la descripción */
async function generateImages(text) {
    imagesList.innerHTML = ''
    generateButton.disabled = true, generateButton.textContent = 'Generando imágenes, por favor espere...', userDescription.disabled = true
    const listText = document.createElement('span')
    listText.textContent = 'Da clic sobre cualquier imagen para descargarla \u{f019}'
   
    for (let i = 0; i < imageLimit; i++) {
        const randomNum = generateRandomNumber(1, 10000)
        const description = `${text} ${randomNum}`     
        /* Al agregar el número aleatorio permite que se muestren diferentes resultados cada que se vuelve a consultar */
        const apiResponse = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({ inputs: description }),
            }
        );
        apiResponse.ok ? imagesList.prepend(listText) : alert('Error al generar la imagen no. ' + (i + 1))     

        const blob = await apiResponse.blob()
        const url = URL.createObjectURL(blob)
        imagesUrlList.push(url)

        const imagesContainer = document.createElement('div'), imgElement = document.createElement('img')
        imgElement.src = url, imgElement.alt = `img ${i + 1}`
        imagesContainer.classList.add('images-list-container')
        imagesContainer.appendChild(imgElement)
        imagesList.appendChild(imagesContainer)

        imgElement.addEventListener('click', () => {
            downloadSelectedImg(url, i)
        })
    }
    generateButton.disabled = false, generateButton.textContent = 'Generar imágenes'
    userDescription.disabled = false, userDescription.focus()
    selectedImageNumber = null
}

generateButton.addEventListener('click', () => {    
    userDescription.value != '' ? generateImages(userDescription.value) : userDescription.focus()
})