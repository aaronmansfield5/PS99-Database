import axios, { AxiosResponse } from 'axios';
import { HEADERS, BASE_URL } from '../config';

export async function fetchCollections(): Promise<string[]> {
    try {
        const response: AxiosResponse<{ data: string[] }> = await axios.get(`${BASE_URL}collections`, { headers: HEADERS });
        if (response.status !== 200) throw new Error(response.statusText);
        return response.data.data;
    } catch (error) {
        throw new Error(`Failed to fetch collections: ${(error as Error).message}`);
    }
}