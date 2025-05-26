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
    const user = res.data.user;

    localStorage.setItem("jwt", jwt);
    localStorage.setItem("user", JSON.stringify(user));

    alert("Inloggning lyckades!");
    location.reload();
  } catch (err) {
    alert("Inloggning misslyckades!");
    console.error(err.response.data.error.message);
  }
});

// VISA INLOGGAD ANVÄNDARE + LOGGA UT
const storedUser = localStorage.getItem("user");
const loggedInText = document.getElementById("logged-in-user");
const logoutBtn = document.getElementById("logout-btn");

if (storedUser) {
  const user = JSON.parse(storedUser);
  loggedInText.textContent = `Inloggad som: ${user.username}`;
  logoutBtn.style.display = "inline";

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    location.reload();
  });
}

// HÄMTA BÖCKER
async function fetchBooks() {
  try {
    const res = await axios.get(`${API_BASE}/api/books?populate=cover`);
    const books = res.data.data;
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
    const pages = attrs.pages;
    const releaseDate = attrs.releaseDate;
    const image = attrs.cover?.[0]?.url;

    const el = document.createElement("div");
    el.innerHTML = `
        <h3>${title}</h3>
        <p>Författare: ${author}</p>
        <p>Antal sidor: ${pages}</p>
        <p>Utgivningsdatum: ${new Date(releaseDate).toLocaleDateString(
          "sv-SE",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        )}</p>
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
