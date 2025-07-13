const apiKey = import.meta.env.VITE_HUGGINGFACE_KEY, apiUrl = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0', modelInfoUrl = 'https://huggingface.co/api/models/stabilityai/stable-diffusion-xl-base-1.0'
const generateBtn = document.getElementById('generate-btn'), imgList = document.querySelector('.generated-images-list'), desc = document.getElementById('desc'), limit = 3, imgUrlList = [], alertText = document.querySelector('.alert')
let selectedImgNumber = null

window.onload = () => {
    desc.value = 'Black hole of the Milky Way, realistic, best quality'
    generateImages(desc.value)
}

/* Se verifica si el modelo ya esta cargado y listo para usarse */
async function checkModelStatus() {
    try {
        const res = await fetch(modelInfoUrl)
        const json = await res.json()
        //* Si 'pipeline_tag' es del tipo 'text-to-image', el campo 'sha' está definido y el campo 'config' esta inicializado, devuelve true
        return json?.pipeline_tag === "text-to-image" && json?.sha && json?.config
    } catch (err) {
        console.error("Error al verificar el modelo:", err)
        return false
    }
}

/* Genera un número aleatorio (1 - 10000), esto para evitar que genere una misma imagen 3 veces */
const generateRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* Permite descargar la imagen seleccionada al dar clic sobre ella */
const downloadSelectedImg = (url, number) => {
    const imageUrl = document.createElement('a')
    imageUrl.href = url
    imageUrl.download = `Imagen-#${number + 1}.jpg`
    imageUrl.click()
}

/* Función principal para generar imágenes */
async function generateImages(text) {
    imgList.innerHTML = '',  alertText.textContent = ''
    generateBtn.disabled = true, generateBtn.textContent = 'Generando imágenes, por favor espere...'
    desc.disabled = true, selectedImgNumber = null

    /* Se verifica si el modelo ya está listo para usarse */
    const isReady = await checkModelStatus()
    if (!isReady) {
        alertText.textContent = 'El modelo aún no está cargado. Por favor, inténtalo de nuevo más tarde.'
        generateBtn.disabled = false, generateBtn.textContent = 'Generar imágenes'
        desc.disabled = false
        return
    }

    const infoTxt = document.createElement('span')
    infoTxt.textContent = 'Da clic sobre cualquier imagen para descargarla \u{f019}'

    for (let i = 0; i < limit; i++) {
        const randomNum = generateRandomNumber(1, 10000)
        const description = `${text} ${randomNum}`
        try {
            const apiResponse = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({ inputs: description }),
            });
            if (!apiResponse.ok) throw new Error(`Error en la respuesta: ${apiResponse.status}`)

            const blob = await apiResponse.blob()
            const url = URL.createObjectURL(blob)
            imgUrlList.push(url)

            const imagesContainer = document.createElement('div')
            const imgElement = document.createElement('img')
            imgElement.src = url
            imagesContainer.classList.add('images-list-container')
            imagesContainer.appendChild(imgElement)
            imgList.append(imagesContainer)

            imgElement.addEventListener('click', () => {
                downloadSelectedImg(url, i)
            })

        } catch (err) {
            console.error(`Error al generar la imagen ${i + 1}:`, err)
            alertText.textContent = '\u{f071} Ocurrió un error al generar algunas imágenes \u{f071}' 
        }
    }
    imgList.appendChild(infoTxt)
    generateBtn.disabled = false
    generateBtn.textContent = 'Generar imágenes'
    desc.disabled = false
    desc.focus()
}

generateBtn.addEventListener('click', () => {
    desc.value !== '' ? generateImages(desc.value) : desc.focus()    
})