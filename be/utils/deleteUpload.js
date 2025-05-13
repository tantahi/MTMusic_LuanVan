const fs = require('fs');

function deleteUpload(filePath) {

    if (fs.existsSync(filePath)) {
        try {
            //delete file
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
        } catch (err) {
            console.error(`Error deleting file: ${filePath}`, err);
        }
    } else {
        console.warn(`File not found: ${filePath}`);
    }
}

module.exports = deleteUpload;