import { connection } from './config/database';
import { fetchCollections, fetchDataFromCollection, fetchAmounts, fetchRap } from './api';
import { insertCategory, insertItem } from './db';
import { constructItemName } from './utils/constructItemName';
import { Items, Item, Entry } from './types';

async function syncdb() {
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

            const amountData = amountsData.find(amount => 
                amount.category === category &&
                amount.configData.id === entry.configData.id &&
                amount.configData.pt === entry.configData.pt &&
                amount.configData.sh === entry.configData.sh
            );

            if (amountData) {
                item.amountExists = amountData.value;
            }

            try {
                const categoryId = await insertCategory(category);
                await insertItem(item, categoryId, connection);
                items[category].push(item);
            } catch (error) {
                console.error(`Error inserting item: ${(error as Error).message}`);
            }
        }

        console.log(`Database sync completed at ${new Date().toLocaleString()}`);
    } catch (error) {
        console.error((error as Error).message);
    } finally {
        connection.end();
    }
}

function main() {
    syncdb();
    setInterval(syncdb, 15 * 60 * 1000); // 15 Minutes
}

main();