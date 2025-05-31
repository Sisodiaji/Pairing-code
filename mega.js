import * as fs from 'fs';
import * as mega from 'megajs';

// Mega authentication credentials
const auth = {
    email: '', // Sonusisodia375@gmail.com 
    password: '.',        // SISODIA JI@#
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246'
};

// Function to upload a file to Mega and return the URL
export const upload = (filePath, fileName) => {
    return new Promise((resolve, reject) => {
        try {
            const storage = new mega.Storage(auth, () => {
                const uploadStream = storage.upload({ name: fileName, allowUploadBuffering: true });
                fs.createReadStream(filePath).pipe(uploadStream);

                uploadStream.on('complete', (file) => {
                    file.link((err, url) => {
                        storage.close();
                        if (err) return reject(err);
                        resolve(url);
                    });
                });

                uploadStream.on('error', (err) => {
                    storage.close();
                    reject(err);
                });
            });

            storage.on('error', (err) => {
                storage.close();
                reject(err);
            });
        } catch (err) {
            reject(err);
        }
    });
};

// Function to download a file from Mega using a URL
export const download = (megaUrl, outputPath) => {
    return new Promise((resolve, reject) => {
        try {
            const file = mega.File.fromURL(megaUrl);

            file.loadAttributes((err) => {
                if (err) return reject(err);

                const writeStream = fs.createWriteStream(outputPath);
                const downloadStream = file.download();

                downloadStream.pipe(writeStream);

                downloadStream.on('end', () => {
                    resolve('Download complete: ' + outputPath);
                });

                downloadStream.on('error', (err) => {
                    reject(err);
                });
            });
        } catch (err) {
            reject(err);
        }
    });
};

// Example usage:
if (require.main === module) {
    // Upload example
    upload('./test.txt', 'uploaded_test.txt')
        .then(url => {
            console.log('Upload successful! File URL:', url);

            // Download example
            return download(url, './downloaded_test.txt');
        })
        .then(msg => {
            console.log(msg);
        })
        .catch(err => {
            console.error('Error:', err);
        });
}
