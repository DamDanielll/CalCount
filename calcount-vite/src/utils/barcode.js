export async function lookupBarcode(barcode) {
  const url = `https://world.openfoodfacts.net/api/v2/product/${barcode}?fields=product_name,nutriments,serving_size,serving_quantity`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Network error ${res.status}`);

  const data = await res.json();
  if (data.status === 0 || !data.product) {
    const err = new Error('Product not found in Open Food Facts database');
    err.notFound = true;
    throw err;
  }

  const { product: p } = data;
  const n = p.nutriments || {};
  const servingQty = parseFloat(p.serving_quantity) || 100;
  const scale = servingQty / 100;

  function get(key) {
    const perServing = n[`${key}_serving`];
    if (perServing != null && !isNaN(perServing)) return parseFloat(perServing);
    const per100 = n[`${key}_100g`];
    if (per100 != null && !isNaN(per100)) return Math.round(parseFloat(per100) * scale * 10) / 10;
    return 0;
  }

  // energy-kcal is preferred; fall back to kJ → kcal conversion
  const kcal = get('energy-kcal') || Math.round(get('energy') / 4.184);

  return {
    name: (p.product_name || 'Scanned Product').trim(),
    calories: Math.round(kcal) || 0,
    protein: get('proteins'),
    carbs: get('carbohydrates'),
    fat: get('fat'),
    fiber: get('fiber'),
    servingSize: p.serving_size || null,
    barcode,
  };
}
