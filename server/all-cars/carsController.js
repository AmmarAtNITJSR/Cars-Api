const axios = require('axios');
const cheerio = require('cheerio');

const WEB_URL = 'https://www.autocarindia.com/cars';

// GET /api/brands/:brand/cars
const getCarsByBrand = async (req, res) => {
    try {
        const { brand } = req.params;
        const response = await axios.get(`${WEB_URL}/${brand}`);
        const $ = cheerio.load(response.data);

        let cars = [];

        const cars_section = $('.ac-col-sec.ac-nd-col-1.mob-pad-col.bg-gray .row.mob-pad-col');
        cars_section.find('.car-lis-sec1').each(function () {
            const name = $(this).find('.car-lis-name .heading-h4 a').text().trim();
            const page = $(this).find('.car-lis-name .heading-h4 a').attr('href')?.trim().slice(6);
            const brand_page = page?.split('/')[0];
            const img = $(this).find('.car-lis-img a img').attr('src')?.trim().split('?n=').pop().split('&w=')[0];
            const on_road = $(this).find('.ac-price1.ac-mr-right h4').text().trim();

            let colours = [];
            $(this).find('.car-lis-img .car-color .color-item').each(function () {
                const colorName = $(this).attr('title');
                const code = $(this).attr('style')?.slice(11);
                if (colorName && code) colours.push({ name: colorName, code });
            });

            let spec_map = [];
            $(this).parent().find('.car-lis-sec2 .car-dis-sec').each(function () {
                spec_map.push($(this).find('p').text());
            });

            const specs = {
                engine: spec_map[0]?.slice(6) || null,
                fuel: spec_map[1]?.slice(9) || null,
                transmission: spec_map[2]?.slice(12) || null,
                mileage: spec_map[3]?.slice(7) || null
            };

            cars.push({ name, brand_page, page, img, colours, on_road, specs });
        });

        if (cars.length === 0) {
            return res.status(404).json({ error: `No cars found for brand: ${brand}` });
        }

        res.json({ cars });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Failed to fetch cars for this brand" });
    }
};

// GET /api/brands/:brand/cars/:carName
const getCarDetails = async (req, res) => {
    try {
        const { brand, carName } = req.params;
        const response = await axios.get(`${WEB_URL}/${brand}/${carName}`);
        const $ = cheerio.load(response.data);

        const variants_section = $('#Varient-more .car-co-tab .tabs .tabPanel');
        let variants = [];

        variants_section.find('.mod-var-detail').each(function () {
            const variant_url = $(this).find('.var-det-sec1 a').attr('href')?.trim().slice(6);
            const variant = $(this).find('.var-det-sec1 a h6').text().trim();
            const variant_price = $(this).find('.var-det-sec2 p').text().trim().split(' *')[0];
            variants.push({ variant, variant_url, variant_price, variant_specs: [] });
        });

        // Fetch variant specs
        for (let i = 0; i < variants.length; i++) {
            if (variants[i].variant_url) {
                variants[i].variant_specs = await getSpecifications(variants[i].variant_url);
            }
        }

        // Fetch images
        let images = [];
        $('.more-about-car-se #Images-more .news-deail-img .item img').each(function () {
            const image_url = $(this).attr('src')?.split('?n=').pop().split('&w=')[0];
            if (image_url) images.push(image_url);
        });

        const carTitle = $('.heading-h4').text().trim() || carName;

        if (!variants.length && !images.length) {
            return res.status(404).json({ error: `No details found for ${brand} ${carName}` });
        }

        res.json({
            name: carTitle,
            variants,
            images
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Failed to fetch car details" });
    }
};

// Helper for fetching specifications
async function getSpecifications(url) {
    try {
        const response = await axios.get(`${WEB_URL}/${url}`);
        const $ = cheerio.load(response.data);

        let specs = [];
        $('#specificationssection .com-car-tab').each(function () {
            const key = $(this).find('.com-car-sec-1 p').text();
            const value = $(this).find('.com-car-sec-2 p').text();
            if (key && value) specs.push({ key, value });
        });

        return specs;
    } catch (error) {
        console.error("Failed to fetch specifications:", error.message);
        return [];
    }
}

module.exports = { getCarsByBrand, getCarDetails };
