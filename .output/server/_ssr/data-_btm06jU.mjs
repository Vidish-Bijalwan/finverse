//#region node_modules/.nitro/vite/services/ssr/assets/data-_btm06jU.js
/** Market-cap bands used by the screener (₹ crore). */
var MCAP_BANDS = {
	large: {
		label: "Large cap",
		min: 2e4,
		hint: "> ₹20,000 Cr"
	},
	mid: {
		label: "Mid cap",
		min: 5e3,
		max: 2e4,
		hint: "₹5,000–20,000 Cr"
	},
	small: {
		label: "Small cap",
		max: 5e3,
		hint: "< ₹5,000 Cr"
	}
};
function mcapBandOf(marketCapCr) {
	if (marketCapCr > 2e4) return "large";
	if (marketCapCr >= 5e3) return "mid";
	return "small";
}
var L = (symbol, name, sector, pricePaise, pe, marketCapCr, divYield, roe, debtEquity, epsPaise, high52wPaise, low52wPaise, oneYReturnPct) => ({
	symbol,
	name,
	sector,
	pricePaise,
	pe,
	marketCapCr,
	divYield,
	roe,
	debtEquity,
	epsPaise,
	high52wPaise,
	low52wPaise,
	oneYReturnPct
});
var STOCKS = [
	L("RELIANCE", "Reliance Industries", "Energy", 158e3, 24.2, 215e4, .6, 9.2, .35, 6530, 167e3, 111500, 18.4),
	L("HDFCBANK", "HDFC Bank", "Banking", 99e3, 20.5, 152e4, 1.1, 14.6, null, 4830, 104e3, 8e4, 22.1),
	L("INFY", "Infosys", "IT", 152e3, 24, 631e3, 2.4, 31.2, 0, 6330, 163e3, 115e3, 8.3),
	L("TCS", "Tata Consultancy Services", "IT", 315e3, 26.5, 114e4, 2.1, 51.4, 0, 11890, 354e3, 27e4, -6.2),
	L("SBIN", "State Bank of India", "Banking", 82e3, 11.8, 732e3, 1.9, 16.5, null, 6950, 88500, 54500, 32.6),
	L("TITAN", "Titan Company", "Consumer Durables", 332e3, 62.4, 295e3, .35, 25.1, .08, 5320, 352e3, 264e3, 12.8),
	L("ASIANPAINT", "Asian Paints", "FMCG", 241e3, 48.1, 231e3, 1.35, 26.3, .05, 5010, 294e3, 215e3, -15.4),
	L("KOTAKBANK", "Kotak Mahindra Bank", "Banking", 195e3, 19, 388e3, .1, 14.1, null, 10260, 208e3, 145e3, 26.3),
	L("LT", "Larsen & Toubro", "Infrastructure", 378e3, 34.1, 52e4, .9, 15.2, 1.18, 11090, 396e3, 287e3, 19.5),
	L("MARUTI", "Maruti Suzuki India", "Auto", 1385e3, 28, 435e3, .95, 15.4, .02, 49460, 1455e3, 102e4, 21.7),
	L("NESTLEIND", "Nestlé India", "FMCG", 224e3, 68.1, 216e3, .85, 110.5, .15, 3290, 236e3, 184e3, 9.2),
	L("ULTRACEMCO", "UltraTech Cement", "Cement", 1215e3, 40, 35e4, .6, 12.1, .28, 30380, 1288e3, 925e3, 24.6),
	L("AXISBANK", "Axis Bank", "Banking", 112e3, 13.5, 346e3, .9, 17.2, null, 8300, 12e4, 83e3, 25.9),
	L("ICICIBANK", "ICICI Bank", "Banking", 128e3, 19.5, 9e5, .85, 17.6, null, 6560, 136e3, 96e3, 24.4),
	L("ITC", "ITC", "FMCG", 48500, 26, 606e3, 2.85, 27.4, 0, 1870, 54e3, 39800, 3.1),
	L("HINDUNILVR", "Hindustan Unilever", "FMCG", 235e3, 54, 552e3, 1.9, 20.2, 0, 4350, 262e3, 215e3, -8.1),
	L("BHARTIARTL", "Bharti Airtel", "Telecom", 179e3, 88.2, 108e4, .45, 10.6, 1.02, 2030, 186e3, 118e3, 34.8),
	L("SUNPHARMA", "Sun Pharmaceutical", "Pharma", 183e3, 36, 439e3, .9, 14.2, .03, 5080, 192e3, 141e3, 21.2),
	L("HCLTECH", "HCL Technologies", "IT", 154e3, 24.5, 418e3, 3.7, 24.3, .08, 6290, 169e3, 121e3, 16.4),
	L("TATAMOTORS", "Tata Motors", "Auto", 72e3, 16, 267e3, .85, 19.3, .62, 4500, 106e3, 58500, -28.6),
	L("TATASTEEL", "Tata Steel", "Metals", 16500, 14, 206e3, 2.2, 10.1, .75, 1180, 17800, 12500, 22.9),
	L("POWERGRID", "Power Grid Corporation", "Power", 33500, 18, 312e3, 3.4, 18.3, 1.35, 1860, 36e3, 25800, 24.1),
	L("NTPC", "NTPC", "Power", 37500, 15, 364e3, 2.7, 12.4, 1.25, 2500, 4e4, 26800, 30.2),
	L("ONGC", "Oil & Natural Gas Corporation", "Oil & Gas", 24500, 8, 308e3, 5.1, 12.6, .45, 3060, 29e3, 17500, 28.5),
	L("COALINDIA", "Coal India", "Energy", 48500, 9, 299e3, 5.5, 42.3, .25, 5390, 54e3, 31800, 42.7),
	L("ADANIPORTS", "Adani Ports & SEZ", "Infrastructure", 142e3, 30, 307e3, .45, 16.1, .92, 4730, 162e3, 101e3, 33.5),
	L("JSWSTEEL", "JSW Steel", "Metals", 102e3, 32, 249e3, .7, 8.2, 1.12, 3190, 11e4, 73e3, 27.8),
	L("BAJFINANCE", "Bajaj Finance", "NBFC", 945e3, 32.1, 585e3, .45, 22.4, 3.82, 29440, 99e4, 645e3, 38.9),
	L("M&M", "Mahindra & Mahindra", "Auto", 342e3, 30, 425e3, .6, 16.3, .42, 11400, 368e3, 228e3, 42.3),
	L("ADANIENT", "Adani Enterprises", "Energy", 245e3, 52, 28e4, .05, 11.2, 1.92, 4710, 344e3, 181e3, 29.4),
	L("AARTIIND", "Aarti Industries", "Chemicals", 54800, 38.2, 19800, .5, 9.1, .62, 1430, 69e3, 38e3, -12.3),
	L("JYOTHYLAB", "Jyothy Labs", "FMCG", 35200, 36, 6460, 1.7, 16.2, .05, 980, 44500, 28500, 8.6),
	L("CYIENT", "Cyient", "IT", 115e3, 28.4, 12700, 2.3, 16.4, .1, 4050, 148e3, 88e3, -6.8),
	L("LAURUSLABS", "Laurus Labs", "Pharma", 54500, 48, 19200, .7, 11.3, .52, 1140, 72e3, 39e3, 24.2),
	L("ZENSARTECH", "Zensar Technologies", "IT", 78500, 29.5, 17900, 1.1, 15.8, .06, 2660, 94e3, 56200, 19.7),
	L("KEC", "KEC International", "Power", 86e3, 42, 18600, .5, 9.4, 1.21, 2050, 108e3, 62e3, 26.9),
	L("TRIDENT", "Trident", "Textiles", 3850, 24.1, 1970, 1.9, 8.3, .92, 160, 5200, 2800, 18.9),
	L("RAYMOND", "Raymond", "Apparel", 64800, 22, 4320, .5, 12.4, .71, 2950, 78e3, 43e3, 35.6),
	L("ALEMBICLTD", "Alembic", "Pharma", 10800, 20, 2120, 1.9, 10.2, .31, 540, 13500, 7800, 14.4),
	L("SURYAROSNI", "Surya Roshni", "Metals", 62e3, 18, 3340, 1.2, 13.1, .41, 3440, 74500, 41e3, 31.8),
	L("NIFTYBEES", "Nippon India Nifty 50 ETF", "ETF", 29500, 22.4, 45e3, 1.1, null, null, 1320, 31500, 22800, 16.2)
];
var BY_SYMBOL = new Map(STOCKS.map((s) => [s.symbol, s]));
function getStock(symbol) {
	return BY_SYMBOL.get(symbol.toUpperCase());
}
var SECTORS = Array.from(new Set(STOCKS.map((s) => s.sector))).sort();
/** Median P/E of a sector — used for valuation comparisons in AI analysis. */
function sectorMedianPE(sector) {
	const pes = STOCKS.filter((s) => s.sector === sector).map((s) => s.pe).sort((a, b) => a - b);
	if (pes.length === 0) return 0;
	const mid = Math.floor(pes.length / 2);
	return pes.length % 2 === 1 ? pes[mid] : (pes[mid - 1] + pes[mid]) / 2;
}
/** Median 1Y return of a sector — used for momentum comparison. */
function sectorMedianReturn(sector) {
	const rs = STOCKS.filter((s) => s.sector === sector).map((s) => s.oneYReturnPct).sort((a, b) => a - b);
	if (rs.length === 0) return 0;
	const mid = Math.floor(rs.length / 2);
	return rs.length % 2 === 1 ? rs[mid] : (rs[mid - 1] + rs[mid]) / 2;
}
//#endregion
export { mcapBandOf as a, getStock as i, SECTORS as n, sectorMedianPE as o, STOCKS as r, sectorMedianReturn as s, MCAP_BANDS as t };
