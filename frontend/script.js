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
    const bookId = book.id;

    const el = document.createElement("div");
    el.innerHTML = `
  <h3>${title}</h3>
  <p>Författare: ${author}</p>
  <p>Antal sidor: ${pages}</p>
  <p>Utgivningsdatum: ${new Date(releaseDate).toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}</p>
  ${image ? `<img src="${API_BASE}${image}" width="150" alt="${title}" />` : ""}

  <div>
    <label>Betyg (1–10):</label>
    <input type="number" min="1" max="10" id="rating-${bookId}" />
    <button onclick="submitRating(${bookId})">Spara betyg</button>
  </div>

  <div>
    <button onclick="saveBook(${bookId})">Spara bok</button>
  </div>

  <hr/>
`;

    list.appendChild(el);
  });
}

// HÄMTA ANVÄNDARENS SPARADE BÖCKER
async function saveBook(bookId) {
  const jwt = localStorage.getItem("jwt");
  const storedUser = localStorage.getItem("user");

  if (!jwt || !storedUser) {
    alert("Du måste vara inloggad för att spara böcker.");
    return;
  }

  const user = JSON.parse(storedUser);

  try {
    const res = await axios.post(
      `${API_BASE}/api/saved-books`,
      {
        data: {
          book: bookId,
          users_permissions_user: user.id,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    alert("Boken sparades!");
    fetchSavedBooks();
  } catch (err) {
    alert("Kunde inte spara boken.");
    console.error(err.response?.data || err);
  }
}

function renderSavedBooks(savedBooks) {
  const list = document.getElementById("saved-book-list");
  list.innerHTML = "";

  savedBooks.forEach((book) => {
    const el = document.createElement("div");
    el.innerHTML = `
        <h4>${book.title}</h4>
        <p>Författare: ${book.author}</p>
        <hr/>
      `;
    list.appendChild(el);
  });
}

// DUMMY DATA
function fetchSavedBooks() {
  const savedBooks = [
    {
      title: "The Glass Harbor",
      author: "Amaya Linde",
    },
    {
      title: "Whispering Pines",
      author: "Clara M. Grey",
    },
  ];
  renderSavedBooks(savedBooks);
}

// HÄMTA OCH APPLICERA TEMA
async function fetchAndApplyTheme() {
  try {
    const res = await axios.get(`${API_BASE}/api/themes`);
    const themes = res.data.data;

    if (!Array.isArray(themes) || themes.length === 0) {
      throw new Error("Inget tema hittades");
    }

    const theme = themes[0]?.attributes;

    if (!theme?.backgroundColor || !theme?.primaryColor) {
      throw new Error("Temat saknar färgvärden");
    }

    document.documentElement.style.setProperty(
      "--bg-color",
      theme.backgroundColor
    );
    document.documentElement.style.setProperty(
      "--primary-color",
      theme.primaryColor
    );

    console.log("Tema applicerat:", theme);
  } catch (err) {
    console.error("Kunde inte hämta tema:", err.message);
  }
}
async function submitRating(bookId) {
  const jwt = localStorage.getItem("jwt");
  const storedUser = localStorage.getItem("user");

  if (!jwt || !storedUser) {
    alert("Du måste vara inloggad för att betygsätta.");
    return;
  }

  const user = JSON.parse(storedUser);
  const input = document.getElementById(`rating-${bookId}`);
  const value = parseInt(input.value);

  if (!value || value < 1 || value > 10) {
    alert("Ange ett betyg mellan 1 och 10");
    return;
  }

  try {
    const res = await axios.post(
      `${API_BASE}/api/ratings`,
      {
        data: {
          value,
          user: { connect: [user.id] },
          book: { connect: [bookId] },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    alert("Betyg sparat!");
    console.log(res.data);
  } catch (err) {
    alert("Kunde inte spara betyget.");
    console.error(err.response?.data || err);
  }
}

fetchBooks();
fetchSavedBooks();
