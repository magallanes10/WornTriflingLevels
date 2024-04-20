const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

app.get('/geode', async (req, res) => {
    const searchTerm = req.query.mods;

    try {
        const mods = await scrapeMods(searchTerm);
        res.json(mods);
    } catch (error) {
        res.status(500).json({ error: 'Error scraping mods' });
    }
});

async function scrapeMods(searchTerm = '') {
    const url = 'https://geode-sdk.org/mods/';

    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const mods = [];

        $('.mod-card').each((index, element) => {
            const name = $(element).data('name');
            const developer = $(element).data('developer');
            const description = $(element).data('description');
            const about = $(element).data('about');
            const tags = $(element).data('tags').split(' ');
            const defaultScore = $(element).data('default-score');
            const imageUrl = $(element).find('.img img').attr('src');
            const version = $(element).find('.author').next().text().trim();

            mods.push({
                name,
                developer,
                description,
                about,
                tags,
                defaultScore,
                imageUrl,
                version
            });
        });

        const filteredMods = mods.filter(mod => {
            return mod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   mod.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   mod.developer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   mod.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        });

        return filteredMods;
    } catch (error) {
        throw new Error('Error scraping mods ❌');
    }
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
