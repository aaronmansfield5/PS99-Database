export interface ConfigData {
    id: string;
    pt?: number;
    sh?: boolean;
    titanic?: boolean;
    huge?: boolean;
    exclusiveLevel?: number;
    name?: string;
}

export interface Entry {
    category: string;
    configData: ConfigData;
    value: number;
}

export interface Item {
    name: string;
    rap: number;
    previousRap?: number;
    titanic?: boolean;
    huge?: boolean;
    exclusive?: boolean;
    amountExists?: number;
    lastModified: number;
}

export interface Items {
    [key: string]: Item[];
}