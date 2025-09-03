const axios = require('axios');
const cheerio = require('cheerio');
const WEB_URL = 'https://www.autocarindia.com/cars';

// GET /api/brands
const getAllBrandsName = async (req, res) => {
    try {
        const response = await axios.get(WEB_URL);
        const $ = cheerio.load(response.data);

        let brands = [];

        const brands_section = $('#all-brand-section');
        brands_section.find('a').each(function () {
            const title = $(this).attr('title')?.trim();
            const page = $(this).attr('href')?.trim().slice(6);
            if (title && page) {
                brands.push({ title, page });
            }
        });

        if (brands.length === 0) {
            return res.status(404).json({ error: "No brands found" });
        }

        res.json({ brands });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Failed to fetch brands" });
    }
};

module.exports = { getAllBrandsName };
