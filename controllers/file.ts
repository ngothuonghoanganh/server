import { Files } from "../models/file";
import { bucket } from "../models/firebase/firebase"
class FileController {
    public async upload(req: any, res: any, next: any) {

        try {
            if (!req.file) {
                return res.status(400).send("Error: No files found")
            }

            const newFileName = `${Date.now()}`
            const blob = bucket.file(newFileName)

            const blobWriter = blob.createWriteStream({
                metadata: {
                    contentType: req.file.mimetype
                }
            })

            blobWriter.on('error', (err) => {
                console.log(err)
            })

            blobWriter.on('finish', async () => {
                const fileLocation: string = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${blob.name}?alt=media`;
                return  res.status(200).send({url: fileLocation, fileName: newFileName})
            })

            blobWriter.end(req.file.buffer)
        } catch (error) {
            console.log(error)
        }
    }
}

export const fileController = new FileController()