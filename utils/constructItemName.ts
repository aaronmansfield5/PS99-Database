import { Entry } from '../types';

export function constructItemName(entry: Entry): string {
    const { id, pt, sh } = entry.configData;
    let name = '';

    if (sh) name += 'Shiny ';
    if (pt === 1) name += 'Golden ';
    if (pt === 2) name += 'Rainbow ';

    name += id;
    return name;
}