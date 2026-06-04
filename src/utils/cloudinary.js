import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

(async function() {

    // Configuration
    cloudinary.config({ 
        cloud_name: Process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: Process.env.CLOUDINARY_API_KEY, 
        api_secret: Process.env.CLOUDINARY_API_SECRET
    });

    // Function to upload a file to Cloudinary
    const uploadOnCloudinary = async (localFilePath) => {
        try {
            if(!localFilePath) return null;
        const resposnse =  await cloudinary.uploader.upload(localFilePath,
            {
                resource_type : 'auto',
            }
        );
        //file uploaded successfully
        console.log('File uploaded successfully: ' + response.url);
        return response;
    } catch (error) {
        fs.unlink(localFilePath);
        // Removes the file from the local storage
        console.error('Error uploading file: ' + error);
        return null;
    }
};
})();

export { uploadOnCloudinary };