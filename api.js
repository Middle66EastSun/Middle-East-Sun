const EIA_API_KEY = "YOUR_EIA_API_KEY";
const EXCHANGE_RATE = 61000; // فرض نرخ دلار به تومان

async function fetchEIA() {
  const url = `https://api.eia.gov/v2/petroleum/pri/spt/data/?frequency=daily&data[0]=value&facets[product][]=EPCWTI&facets[area][]=US&sort[0][column]=period&sort[0][direction]=desc&length=1&api_key=${EIA_API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  return json.response.data[0].value;
}

async function fetchGoldUSD() {
  const res = await fetch("https://api.metals.live/v1/spot");
  const data = await res.json();
  return data[0].gold; // قیمت طلا به دلار
}

async function refreshData() {
  const container = document.getElementById("cards-container");
  container.innerHTML = "<div>⏳ در حال دریافت داده‌ها...</div>";
  try {
    const [wti, goldUsd] = await Promise.all([
      fetchEIA(),
      fetchGoldUSD()
    ]);

    const goldToman = Math.round(goldUsd * EXCHANGE_RATE);

    const data = [
      { title: "قیمت نفت WTI", value: `$${wti.toFixed(2)}`, change: "زنده" },
      { title: "قیمت طلا (تومان)", value: `${goldToman.toLocaleString('fa-IR')} تومان`, change: "زنده" }
    ];

    container.innerHTML = "";
    data.forEach(item => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<strong>${item.title}</strong><br>${item.value}<br><small>${item.change}</small>`;
      container.appendChild(card);
    });
  } catch (e) {
    container.innerHTML = "<div style='color:red'>❌ خطا در دریافت داده‌ها</div>";
    console.error(e);
  }
}
refreshData();
