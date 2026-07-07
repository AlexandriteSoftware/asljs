export interface LocationFilter {
    name: string;
}

export interface Location {
    patterns: string[];
    exclude?: string[];
    filters?: LocationFilter[];
}
