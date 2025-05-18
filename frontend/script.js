const API_BASE = "http://localhost:1337";

// REGISTRERA NY ANVÄNDARE
document
  .getElementById("register-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    const username = form.username.value;
    const email = form.email.value;
    const password = form.password.value;

    try {
      const res = await axios.post(`${API_BASE}/api/auth/local/register`, {
        username,
        email,
        password,
      });
      alert("Registrering lyckades!");
      console.log(res.data);
    } catch (err) {
      alert("Registrering misslyckades!");
      console.error(err.response.data.error.message);
    }
  });

// LOGGA IN
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const identifier = form.identifier.value;
  const password = form.password.value;

  try {
    const res = await axios.post(`${API_BASE}/api/auth/local`, {
      identifier,
      password,
    });

    const jwt = res.data.jwt;
    alert("Inloggning lyckades!");
    console.log("JWT-token:", jwt);
  } catch (err) {
    alert("Inloggning misslyckades!");
    console.error(err.response.data.error.message);
  }
});

// HÄMTA PRODUKTER
async function fetchProducts() {
  try {
    const res = await axios.get(`${API_BASE}/api/products?populate=image`);
    console.log("Produkter från API:", res.data);
    const products = res.data.data;
    renderProducts(products);
  } catch (err) {
    console.error("Kunde inte hämta produkter:", err);
  }
}

// VISA PRODUKTER
function renderProducts(products) {
  const list = document.getElementById("product-list");
  list.innerHTML = "";

  products.forEach((product) => {
    const name = product.name || product.attributes?.name;
    const price = product.price || product.attributes?.price;
    const image = product.image || product.attributes?.image;
    const imgUrl = image?.url ? `${API_BASE}${image.url}` : null;

    const el = document.createElement("div");
    el.innerHTML = `
        <h3>${name}</h3>
        <p>Pris: ${price} kr</p>
        ${imgUrl ? `<img src="${imgUrl}" width="150" alt="${name}" />` : ""}
        <hr/>
      `;
    list.appendChild(el);
  });
}

fetchProducts();
