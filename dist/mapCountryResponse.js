function formatCurrency(currency) {
    const name = currency.name ?? currency.code ?? '—';
    const details = [currency.symbol, currency.code].filter((part) => Boolean(part));
    return details.length > 0 ? `${name} (${details.join(', ')})` : name;
}
export function mapCountryResponse(raw) {
    const languages = raw.languages ?? [];
    const currencies = raw.currencies ?? [];
    const borders = raw.borders ?? [];
    const timezones = raw.timezones ?? [];
    return {
        id: raw.alpha3Code ?? raw.alpha2Code ?? '',
        name: raw.name,
        flagUrl: raw.flags?.svg ?? raw.flags?.png ?? '',
        capital: raw.capital ?? '',
        region: raw.region ?? '',
        population: raw.population ?? 0,
        languages: languages.map((language) => language.name),
        nativeName: raw.nativeName ?? raw.name,
        subregion: raw.subregion ?? '',
        demonym: raw.demonym ?? '',
        area: raw.area ?? null,
        borders: [...borders],
        currencies: currencies.map(formatCurrency),
        timezones: [...timezones],
    };
}
//# sourceMappingURL=mapCountryResponse.js.map