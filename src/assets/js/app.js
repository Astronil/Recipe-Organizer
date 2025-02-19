// Firebase configuration
const firebaseConfig = {
  // Add your Firebase config here
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM Elements
const addRecipeForm = document.getElementById("add-recipe-form");
const recipesContainer = document.getElementById("recipes-container");
const searchInput = document.getElementById("search-recipe");
const categoryFilter = document.getElementById("category-filter");
const biometricLogin = document.getElementById("biometric-login");
const chatInput = document.getElementById("chat-input");
const sendMessage = document.getElementById("send-message");
const chatMessages = document.getElementById("chat-messages");

// Biometric Authentication
async function authenticateWithBiometrics() {
  if (!window.PublicKeyCredential) {
    alert("Biometric authentication is not supported in this browser");
    return;
  }

  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: new Uint8Array(32),
        rp: { name: "Recipe Checker" },
        user: {
          id: new Uint8Array(16),
          name: "user@example.com",
          displayName: "User",
        },
        pubKeyCredParams: [
          {
            type: "public-key",
            alg: -7,
          },
        ],
      },
    });

    if (credential) {
      alert("Biometric authentication successful!");
    }
  } catch (error) {
    console.error("Biometric authentication failed:", error);
    alert("Biometric authentication failed");
  }
}

// Recipe Management
function addRecipe(e) {
  e.preventDefault();

  const recipe = {
    name: document.getElementById("recipe-name").value,
    category: document.getElementById("recipe-category").value,
    ingredients: document
      .getElementById("recipe-ingredients")
      .value.split("\n"),
    instructions: document.getElementById("recipe-instructions").value,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  };

  db.collection("recipes")
    .add(recipe)
    .then(() => {
      addRecipeForm.reset();
      loadRecipes();
    })
    .catch((error) => console.error("Error adding recipe:", error));
}

function loadRecipes() {
  recipesContainer.innerHTML = "";

  db.collection("recipes")
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        const recipe = doc.data();
        const recipeCard = createRecipeCard(recipe, doc.id);
        recipesContainer.appendChild(recipeCard);
      });
    })
    .catch((error) => console.error("Error loading recipes:", error));
}

function createRecipeCard(recipe, id) {
  const div = document.createElement("div");
  div.className = "recipe-card";
  div.innerHTML = `
        <h3>${recipe.name}</h3>
        <p><strong>Category:</strong> ${recipe.category}</p>
        <p><strong>Ingredients:</strong></p>
        <ul>${recipe.ingredients.map((ing) => `<li>${ing}</li>`).join("")}</ul>
        <p><strong>Instructions:</strong></p>
        <p>${recipe.instructions}</p>
        <button onclick="deleteRecipe('${id}')">Delete</button>
        <button onclick="editRecipe('${id}')">Edit</button>
    `;
  return div;
}

function deleteRecipe(id) {
  if (confirm("Are you sure you want to delete this recipe?")) {
    db.collection("recipes")
      .doc(id)
      .delete()
      .then(() => loadRecipes())
      .catch((error) => console.error("Error deleting recipe:", error));
  }
}

function editRecipe(id) {
  // Implement edit functionality
}

// Event Listeners
addRecipeForm.addEventListener("submit", addRecipe);
biometricLogin.addEventListener("click", authenticateWithBiometrics);
searchInput.addEventListener("input", loadRecipes);
categoryFilter.addEventListener("change", loadRecipes);

// Initial load
loadRecipes();
