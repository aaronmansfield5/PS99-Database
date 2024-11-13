import axios, { AxiosResponse } from 'axios';
import { HEADERS, BASE_URL } from '../config';
import { Entry } from '../types';

export async function fetchAmounts(): Promise<Entry[]> {
    try {
        const response: AxiosResponse<{ data: Entry[] }> = await axios.get(`${BASE_URL}exists`, { headers: HEADERS });
        if (response.status !== 200) throw new Error(response.statusText);
        return response.data.data;
    } catch (error) {
        throw new Error(`Failed to fetch amounts: ${(error as Error).message}`);
    }
}