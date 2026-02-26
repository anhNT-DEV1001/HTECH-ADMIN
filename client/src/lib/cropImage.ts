// Hàm hỗ trợ load ảnh dạng HTMLImageElement
export const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.setAttribute('crossOrigin', 'anonymous') // Khắc phục lỗi CORS nếu ảnh lấy từ link ngoài
        image.src = url
    })

// Hàm Core: Tính toán tọa độ và vẽ lại ảnh trên Canvas, xuất ra đối tượng `File`
export default async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    fileName: string = 'cropped-thumbnail.jpg'
): Promise<{ file: File; url: string }> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        throw new Error('Canvas 2d context not available')
    }

    // Đặt size Canvas bằng đúng size Crop người dùng chọn
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // Vẽ hình ảnh phần được cắt lên Canvas
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    )

    // Đóng gói Canvas lại thay một đối tượng File để gửi cho Backend
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'))
                return
            }
            const newFile = new File([blob], fileName, { type: 'image/jpeg' })
            const url = URL.createObjectURL(blob) // url dùng để preview
            resolve({ file: newFile, url })
        }, 'image/jpeg')
    })
}
