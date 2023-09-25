import axios from 'axios';
import { program } from 'commander';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

program.option('-r').option('-l <n>');

program.parse(process.argv);

const url = 'http://sites.google.com/42adel.org.au/webscraping/home';

axios
  .get(url)
  .then(function (response) {
    const $ = cheerio.load(response.data);
    const imageUrls = [];

    // Find all image elements and extract the source URL
    $('img').each((index, element) => {
      const imageUrl = $(element).attr('src');
      if (imageUrl) {
        // If the URL is relative, construct the full URL
        const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : url + imageUrl;
        imageUrls.push(absoluteImageUrl);
      }
    });

    // Create a directory to save the images
    const downloadPath = path.join(process.cwd(), 'downloaded_images');
    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath);
    }

    // Download the images
    imageUrls.forEach((imageUrl, index) => {
      const imageName = `image${index + 1}.jpg`; // Modify the naming convention if needed
      const imagePath = path.join(downloadPath, imageName);

      axios
        .get(imageUrl, { responseType: 'stream' })
        .then((response) => {
          response.data.pipe(fs.createWriteStream(imagePath));
          console.log(`Downloaded image ${index + 1} to: ${imagePath}`);
        })
        .catch((error) => {
          console.error('Error downloading image:', error);
        });
    });
  })
  .catch(function (error) {
    console.log('Error:', error);
  });
