export const compressToWebP = (file: File, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        // Preserve aspect ratio while ensuring max width/height limits if necessary.
        // Let's just keep original dimensions for now to be safe, but we could scale down.
        // For a photo album, maybe max 1920x1920 is a good idea to save a lot of space.
        let width = img.width
        let height = img.height
        const maxDimension = 1920

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension
            width = maxDimension
          } else {
            width = (width / height) * maxDimension
            height = maxDimension
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas context not available'))

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Blob conversion failed'))
            
            // Replace original extension with .webp
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
            const newName = `${baseName}.webp`
            
            const webpFile = new File([blob], newName, {
              type: 'image/webp',
              lastModified: Date.now(),
            })
            resolve(webpFile)
          },
          'image/webp',
          quality
        )
      }
      img.onerror = (error) => reject(error)
    }
    reader.onerror = (error) => reject(error)
  })
}
