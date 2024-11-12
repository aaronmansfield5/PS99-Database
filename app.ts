import axios, { AxiosResponse } from 'axios';
import { promises as fs } from 'fs';
import { createConnection, Connection, ResultSetHeader } from 'mysql2';

const BASE_URL = "https://ps99.biggamesapi.io/api/";
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en',
    'Connection': 'keep-alive',
    'Content-Type': 'application/json'
};

const connection: Connection = createConnection({
    host: 'localhost',
    user: 'root',
    database: 'ps99_rap',
});

interface ConfigData {
    id: string;
    pt?: number;
    sh?: boolean;
    huge?: boolean;
    exclusiveLevel?: number;
    name?: string;
}

interface Entry {
    category: string;
    configData: ConfigData;
    value: number;
}

interface Item {
    name: string;
    rap: number;
    previousRap?: number;
    huge?: boolean;
    exclusive?: boolean;
    amountExists?: number;
    lastModified: number;
}

interface Items {
    [key: string]: Item[];
}

async function fetchCollections(): Promise<string[]> {
    try {
        const response: AxiosResponse<{ data: string[] }> = await axios.get(`${BASE_URL}collections`, { headers: HEADERS });
        if (response.status !== 200) throw new Error(response.statusText);
        return response.data.data;
    } catch (error) {
        throw new Error(`Failed to fetch collections: ${(error as Error).message}`);
    }
}

async function fetchDataFromCollection(collection: string): Promise<Entry[]> {
    if (!collection) throw new Error("Collection ID not provided.");
    try {
        const response: AxiosResponse<{ data: Entry[] }> = await axios.get(`${BASE_URL}collection/${collection}`, { headers: HEADERS });
        if (response.status !== 200) throw new Error(response.statusText);
        return response.data.data;
    } catch (error) {
        throw new Error(`Failed to fetch data for collection '${collection}': ${(error as Error).message}`);
    }
}

async function fetchAmounts(): Promise<Entry[]> {
    try {
        const response: AxiosResponse<{ data: Entry[] }> = await axios.get(`${BASE_URL}exists`, { headers: HEADERS });
        if (response.status !== 200) throw new Error(response.statusText);
        return response.data.data;
    } catch (error) {
        throw new Error(`Failed to fetch amounts: ${(error as Error).message}`);
    }
}

async function fetchRap(): Promise<Entry[]> {
    try {
        const response: AxiosResponse<{ data: Entry[] }> = await axios.get(`${BASE_URL}rap`, { headers: HEADERS });
        if (response.status !== 200) throw new Error(response.statusText);
        return response.data.data;
    } catch (error) {
        throw new Error(`Failed to fetch rap: ${(error as Error).message}`);
    }
}

function constructItemName(entry: Entry): string {
    const { id, pt, sh } = entry.configData;
    let name = '';

    if (sh) name += 'Shiny ';
    if (pt === 1) name += 'Golden ';
    if (pt === 2) name += 'Rainbow ';

    name += id;
    return name;
}

async function insertCategory(category: string): Promise<number> {
    return new Promise((resolve, reject) => {
        const checkQuery = `SELECT id FROM categories WHERE category_name = ?`;

        connection.query(checkQuery, [category], (error, results: any) => {
            if (error) {
                console.error("Query Error: ", error);
                reject(error);
                return;
            }

            // Check if the results are valid and not empty
            if (results && Array.isArray(results) && results.length > 0) {
                // Category already exists, return its id
                const categoryId = results[0].id;
                resolve(categoryId);
            } else {
                // Insert the new category if it doesn't exist
                const insertQuery = `INSERT INTO categories (category_name) VALUES (?)`;

                connection.query(insertQuery, [category], (insertError, insertResults) => {
                    if (insertError) {
                        console.error("Insert Error: ", insertError);
                        reject(insertError);
                        return;
                    }

                    const insertId = (insertResults as ResultSetHeader).insertId;
                    resolve(insertId);
                });
            }
        });
    });
}

async function insertItem(item: Item, categoryId: number): Promise<void> {
    return new Promise((resolve, reject) => {
        const checkQuery = `SELECT id, rap, previous_rap FROM items WHERE name = ?`;

        connection.query(checkQuery, [item.name], (error, results: any) => {
            if (error) {
                reject(error);
                return;
            }

            if (results && results.length > 0) {
                const existingItem = results[0];
                const updateQuery = `
                    UPDATE items
                    SET 
                        rap = ?, 
                        previous_rap = ?, 
                        last_modified = ?, 
                        amount_exists = ?
                    WHERE id = ?`;

                connection.query(updateQuery, [
                    item.rap,
                    existingItem.rap,
                    item.lastModified,
                    item.amountExists ?? null,
                    existingItem.id
                ], (updateError) => {
                    if (updateError) {
                        reject(updateError);
                    } else {
                        resolve();
                    }
                });
            } else {
                const insertQuery = `
                    INSERT INTO items (name, rap, previous_rap, last_modified, category_id, huge, exclusive, amount_exists)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

                connection.query(insertQuery, [
                    item.name,
                    item.rap,
                    item.rap,
                    item.lastModified,
                    categoryId,
                    item.huge ? 1 : 0,
                    item.exclusive ? 1 : 0,
                    item.amountExists ?? null
                ], (insertError) => {
                    if (insertError) {
                        reject(insertError);
                    } else {
                        resolve();
                    }
                });
            }
        });
    });
}

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

            const item: Item = { 
                name, 
                rap: entry.value,
                lastModified: Math.floor(Date.now() / 1000)
            };

            if (item.rap !== undefined) {
                if (item.previousRap !== undefined) {
                    item.previousRap = item.rap;
                } else {
                    item.previousRap = item.rap;
                }
            }

            let categoryId: number;

            try {
                const result = await insertCategory(category);
                categoryId = result as number;
            } catch (error) {
                console.error(`Failed to insert category '${category}': ${error}`);
                categoryId = 0;
            }

            if (category === 'Pet') {
                const collectionData = collectionDataCache['Pets'];
                if (collectionData) {
                    const petData = collectionData.find((pet) => pet.configData.name === entry.configData.id);

                    item.huge = petData?.configData.huge ?? false;
                    item.exclusive = petData?.configData.exclusiveLevel !== undefined ? true : false;

                    const amountData = amountsData.find(amount => 
                        amount.category === 'Pet' && 
                        amount.configData.id === entry.configData.id &&
                        amount.configData.pt === entry.configData.pt &&
                        amount.configData.sh === entry.configData.sh
                    );

                    if (amountData) {
                        item.amountExists = amountData.value;
                    }
                }
            }

            await insertItem(item, categoryId);
            items[category].push(item);
        }

        console.log("Data has been saved to the database.");

    } catch (error) {
        console.error((error as Error).message);
    } finally {
        connection.end();
    }
}

main();