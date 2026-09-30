(() => {
  const cards = [...document.querySelectorAll('div[data-asin]')].map((d) => {
    const asin = d.getAttribute('data-asin');
    if (!asin) return null;
    const lines = (d.innerText || '').split('\n').map((t) => t.trim()).filter(Boolean);
    const rank = lines.find((l) => /^#\d+$/.test(l)) || null;
    const rating = lines.find((l) => /out of 5 stars/.test(l)) || null;
    const reviews = lines.find((l) => /^[\d,]+$/.test(l)) || null;
    const price = lines.find((l) => /^₹/.test(l)) || null;
    const title =
      lines.find((l) => l !== rank && l !== rating && l !== reviews && l !== price) || null;
    const imgEl = d.querySelector('img');
    const img = imgEl?.getAttribute('data-old-hires') || imgEl?.src || null;
    if (!title) return null;
    return { asin, rank, title, img, rating, reviews, price };
  }).filter(Boolean);
  const captcha = /Enter the characters|Robot Check|api-services-support@amazon/i.test(document.body.innerText);
  return JSON.stringify({ captcha, url: location.pathname, cards });
})()
