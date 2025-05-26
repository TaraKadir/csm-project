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

// HÄMTA BÖCKER
async function fetchBooks() {
  try {
    const res = await axios.get(`${API_BASE}/api/books?populate=cover`);
    const books = res.data.data;
    console.log("Böcker från API:", books); // <-- lägg till denna rad
    renderBooks(books);
  } catch (err) {
    console.error("Kunde inte hämta böcker:", err);
  }
}

// VISA BÖCKER
function renderBooks(books) {
  const list = document.getElementById("book-list");
  list.innerHTML = "";

  books.forEach((book) => {
    const attrs = book.attributes ?? book;

    const title = attrs.title;
    const author = attrs.author;
    const image = attrs.cover?.[0]?.url;

    console.log("Titel:", title, "Bild-url:", image);

    const el = document.createElement("div");
    el.innerHTML = `
        <h3>${title}</h3>
        <p>Författare: ${author}</p>
        ${
          image
            ? `<img src="${API_BASE}${image}" width="150" alt="${title}" />`
            : ""
        }
        <hr/>
      `;

    list.appendChild(el);
  });
}

fetchBooks();
