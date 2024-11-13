import { connection } from './config/database';
import { fetchCollections, fetchDataFromCollection, fetchAmounts, fetchRap } from './api';
import { insertCategory, insertItem } from './db';
import { constructItemName } from './utils/constructItemName';
import { Items, Item, Entry } from './types';

async function main() {
    const items: Items = {};

    try {
        const collections = await fetchCollections();
        const collectionDataCache: { [category: string]: Entry[] } = {};

        for (const collection of collections) {
            const collectionData = await fetchDataFromCollection(collection);
            collectionDataCache[collection] = collectionData;
        }

        const rapData = await fetchRap();
        const amountsData = await fetchAmounts();

        for (const entry of rapData) {
            const category = entry.category;
            if (!items[category]) items[category] = [];

            const name = constructItemName(entry);
            const item: Item = { name, rap: entry.value, lastModified: Math.floor(Date.now() / 1000) };

            try {
                const categoryId = await insertCategory(category);
                await insertItem(item, categoryId);
                items[category].push(item);
            } catch (error) {
                console.error(`Error inserting item: ${(error as Error).message}`);
            }
        }

        console.log("Data has been saved to the database.");
    } catch (error) {
        console.error((error as Error).message);
    } finally {
        connection.end();
    }
}

main();