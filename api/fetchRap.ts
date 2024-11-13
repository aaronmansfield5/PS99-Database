import axios, { AxiosResponse } from 'axios';
import { Entry } from '../types';
import { BASE_URL, HEADERS } from '../config';

export async function fetchRap(): Promise<Entry[]> {
    try {
        const response: AxiosResponse<{ data: Entry[] }> = await axios.get(`${BASE_URL}rap`, { headers: HEADERS });
        if (response.status !== 200) throw new Error(response.statusText);
        return response.data.data;
    } catch (error) {
        throw new Error(`Failed to fetch rap: ${(error as Error).message}`);
    }
}