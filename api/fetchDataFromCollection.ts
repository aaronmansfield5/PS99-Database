import axios, { AxiosResponse } from 'axios';
import { HEADERS, BASE_URL } from '../constants/index.ts';
import { Entry } from '../types';

export async function fetchDataFromCollection(collection: string): Promise<Entry[]> {
    if (!collection) throw new Error("Collection ID not provided.");
    try {
        const response: AxiosResponse<{ data: Entry[] }> = await axios.get(`${BASE_URL}collection/${collection}`, { headers: HEADERS });
        if (response.status !== 200) throw new Error(response.statusText);
        return response.data.data;
    } catch (error) {
        throw new Error(`Failed to fetch data for collection '${collection}': ${(error as Error).message}`);
    }
}