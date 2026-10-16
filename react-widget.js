import React, { useState, useEffect } from "https://esm.sh/react@18";
import { createRoot } from "https://esm.sh/react-dom@18/client";
import htm from "https://esm.sh/htm@3";

const html = htm.bind(React.createElement);

// Tek component, props ile hem tarif hem seyahat için çalışır
function Suggester({ title, buttonText, url, getLink, getSubtitle }) {
  const [items, setItems] = useState([]);
  const [pick, setPick] = useState(null);

  useEffect(() => {
    fetch(url)
      .then((r) => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, [url]);

  const choose = () => {
    // art arda aynı öğe gelmesin
    const pool = items.length > 1 ? items.filter((x) => x.id !== pick?.id) : items;
    setPick(pool[Math.floor(Math.random() * pool.length)]);
  };

  return html`
    <div class="h-100 p-4 bg-white rounded shadow-sm">
      <h3 class="mb-3">${title}</h3>
      <button class="btn btn-primary" onClick=${choose} disabled=${!items.length}>
        ${buttonText}
      </button>
      ${pick && html`
        <div class="mt-4">
          <img src=${pick.resim} alt=${pick.ad} class="img-fluid rounded"
               style=${{ maxHeight: 200, objectFit: "cover" }} />
          <h4 class="mt-2">${pick.ad}</h4>
          <p class="text-muted mb-2">${getSubtitle(pick)}</p>
          <a href=${getLink(pick)}>Detaya git →</a>
        </div>
      `}
    </div>`;
}

function App() {
  return html`
    <div class="row g-4">
      <div class="col-md-6">
        <${Suggester}
          title="Bugün ne pişirsem?"
          buttonText="Bana tarif öner"
          url="data/tarifler.json"
          getSubtitle=${(x) => x.hazirlamaSuresi}
          getLink=${(x) => "tarif.html#" + x.kategori}
        />
      </div>
      <div class="col-md-6">
        <${Suggester}
          title="Nereye gitsem?"
          buttonText="Bana seyahat öner"
          url="data/seyahatler.json"
          getSubtitle=${(x) => x.yer}
          getLink=${(x) => "destination.html#" + (x.slug || "")}
        />
      </div>
    </div>`;
}

createRoot(document.getElementById("react-root")).render(html`<${App} />`);