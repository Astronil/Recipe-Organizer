import { db } from "../config/firebase.config.js";
import { chatbot } from "./chatbot.js";

// Firebase configuration
const firebaseConfig = {
  // Add your Firebase config here
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

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

function handleIngredientInputs() {
  const container = document.getElementById("ingredients-container");

  // Monitor all ingredient inputs
  container.addEventListener("input", (e) => {
    if (
      e.target.classList.contains("ingredient-name") ||
      e.target.classList.contains("ingredient-quantity")
    ) {
      const currentRow = e.target.closest(".ingredient-row");
      const isLastRow = currentRow === container.lastElementChild;

      // If the current row is the last one and has input, add a new row
      if (isLastRow && e.target.value.trim() !== "") {
        addNewIngredientRow();
      }

      // Update row numbers
      updateIngredientNumbers();
    }
  });
}

function addNewIngredientRow() {
  const container = document.getElementById("ingredients-container");
  const newRow = document.createElement("div");
  newRow.className = "ingredient-row";
  newRow.innerHTML = `
        <span class="ingredient-number">${container.children.length + 1}.</span>
        <input type="text" class="ingredient-name" placeholder="Ingredient" required>
        <input type="text" class="ingredient-quantity" placeholder="Quantity" required>
    `;
  container.appendChild(newRow);
}

function updateIngredientNumbers() {
  const rows = document.querySelectorAll(".ingredient-row");
  rows.forEach((row, index) => {
    row.querySelector(".ingredient-number").textContent = `${index + 1}.`;
  });
}

// Modified addRecipe function to handle new ingredient format
function addRecipe(e) {
  e.preventDefault();

  const ingredients = [];
  const ingredientRows = document.querySelectorAll(".ingredient-row");

  ingredientRows.forEach((row) => {
    const name = row.querySelector(".ingredient-name").value.trim();
    const quantity = row.querySelector(".ingredient-quantity").value.trim();
    if (name && quantity) {
      ingredients.push({ name, quantity });
    }
  });

  const recipe = {
    name: document.getElementById("recipe-name").value,
    category: document.getElementById("recipe-category").value,
    ingredients,
    instructions: document.getElementById("recipe-instructions").value,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  };

  db.collection("recipes")
    .add(recipe)
    .then(() => {
      addRecipeForm.reset();
      document.getElementById("ingredients-container").innerHTML = "";
      addNewIngredientRow(); // Add initial ingredient row
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
        <ul>${recipe.ingredients
          .map((ing) => `<li>${ing.name} - ${ing.quantity}</li>`)
          .join("")}</ul>
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

// Initialize the form with one ingredient row
document.addEventListener("DOMContentLoaded", () => {
  addNewIngredientRow();
  handleIngredientInputs();
});
