import { db } from "../config/firebase.config.js";
import { chatbot } from "./chatbot.js";

// Firebase configuration
const firebaseConfig = {
  // Add your Firebase config here
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// DOM Elements
const dashboardSection = document.getElementById("dashboard-section");
const addRecipeSection = document.getElementById("add-recipe-section");
const favoritesSection = document.getElementById("favorites-section");
const categoriesSection = document.getElementById("categories-section");
const navItems = document.querySelectorAll(".nav-item");
const addIngredientBtn = document.getElementById("add-ingredient");
const ingredientsContainer = document.getElementById("ingredients-container");
const aiAssistant = document.getElementById("ai-assistant");
const aiToggle = document.getElementById("ai-toggle");
const recipeForm = document.getElementById("add-recipe-form");
const recipesContainer = document.getElementById("recipes-container");
const searchInput = document.getElementById("search-recipe");
const categoryFilter = document.getElementById("category-filter");
const biometricLogin = document.getElementById("biometric-login");
const chatInput = document.getElementById("chat-input");
const sendMessage = document.getElementById("send-message");
const chatMessages = document.getElementById("chat-messages");

// UI Navigation
const recipesTab = document.getElementById("recipes-tab");
const addRecipeTab = document.getElementById("add-recipe-tab");
const favoritesTab = document.getElementById("favorites-tab");
const recipesGrid = document.getElementById("recipes-grid");

// Chat Widget
const chatWidget = document.getElementById("chat-widget");
const chatToggle = document.getElementById("chat-toggle");

// Initialize Firebase collection
const recipesCollection = firebase.firestore().collection("recipes");

// Ingredients Management
function createIngredientRow() {
  const rowCount = ingredientsContainer.children.length + 1;
  const row = document.createElement("div");
  row.className = "ingredient-row";
  row.innerHTML = `
        <span class="ingredient-number">${rowCount}.</span>
        <input type="text" class="ingredient-name" placeholder="Ingredient name">
        <input type="text" class="ingredient-quantity" placeholder="Quantity">
        <button type="button" class="btn-danger remove-ingredient">
            <i class="fas fa-trash"></i>
        </button>
    `;

  // Remove button functionality
  row.querySelector(".remove-ingredient").addEventListener("click", () => {
    row.remove();
    updateIngredientNumbers();
  });

  return row;
}

function updateIngredientNumbers() {
  const rows = ingredientsContainer.querySelectorAll(".ingredient-row");
  rows.forEach((row, index) => {
    row.querySelector(".ingredient-number").textContent = `${index + 1}.`;
  });
}

// Add ingredient button click handler
addIngredientBtn.addEventListener("click", () => {
  const newRow = createIngredientRow();
  ingredientsContainer.appendChild(newRow);
});

// Recipe Form Submission
recipeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get all ingredients
  const ingredientRows =
    ingredientsContainer.querySelectorAll(".ingredient-row");
  const ingredients = Array.from(ingredientRows)
    .map((row) => ({
      name: row.querySelector(".ingredient-name").value,
      quantity: row.querySelector(".ingredient-quantity").value,
    }))
    .filter((ing) => ing.name && ing.quantity);

  // Create recipe object
  const recipe = {
    name: document.getElementById("recipe-name").value,
    category: document.getElementById("recipe-category").value,
    ingredients: ingredients,
    instructions: document.getElementById("recipe-instructions").value,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  };

  try {
    // Save to Firebase
    await recipesCollection.add(recipe);

    // Show success message
    showNotification("Recipe saved successfully!", "success");

    // Reset form
    recipeForm.reset();
    ingredientsContainer.innerHTML = "";
    addInitialIngredientRow();

    // Switch to dashboard
    switchTab("dashboard");
    loadRecipes();
  } catch (error) {
    console.error("Error saving recipe:", error);
    showNotification("Failed to save recipe", "error");
  }
});

// AI Assistant Toggle
aiToggle.addEventListener("click", () => {
  aiAssistant.classList.toggle("collapsed");
  const icon = aiToggle.querySelector("i");
  icon.classList.toggle("fa-chevron-up");
  icon.classList.toggle("fa-chevron-down");
});

// Biometric Authentication
async function authenticateWithBiometrics() {
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
      showNotification("Biometric authentication successful!", "success");
    }
  } catch (error) {
    showNotification("Biometric authentication failed", "error");
    console.error("Biometric Error:", error);
  }
}

biometricLogin.addEventListener("click", authenticateWithBiometrics);

// Load Recipes
async function loadRecipes() {
  try {
    const snapshot = await recipesCollection.orderBy("timestamp", "desc").get();
    const recipesContainer = document.getElementById("recipes-container");
    recipesContainer.innerHTML = "";

    snapshot.forEach((doc) => {
      const recipe = doc.data();
      const card = createRecipeCard(recipe, doc.id);
      recipesContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading recipes:", error);
    showNotification("Error loading recipes", "error");
  }
}

// Helper Functions
function showNotification(message, type) {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
        <i class="fas ${
          type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
        }"></i>
        <span>${message}</span>
    `;
  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add("show"), 100);
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function addInitialIngredientRow() {
  const initialRow = createIngredientRow();
  ingredientsContainer.appendChild(initialRow);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  addInitialIngredientRow();
  loadRecipes();
});

// Navigation
function switchTab(tabName) {
  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.tab === tabName);
  });

  // Hide all sections
  [
    dashboardSection,
    addRecipeSection,
    favoritesSection,
    categoriesSection,
  ].forEach((section) => {
    section.classList.add("hidden");
  });

  // Show selected section
  switch (tabName) {
    case "dashboard":
      dashboardSection.classList.remove("hidden");
      loadRecipes();
      break;
    case "add-recipe":
      addRecipeSection.classList.remove("hidden");
      break;
    case "favorites":
      favoritesSection.classList.remove("hidden");
      loadFavorites();
      break;
    case "categories":
      categoriesSection.classList.remove("hidden");
      loadCategories();
      break;
  }
}

// Create Recipe Card with improved UI
function createRecipeCard(recipe, id) {
  const div = document.createElement("div");
  div.className = "recipe-card";
  div.innerHTML = `
        <div class="recipe-image" style="background-image: url(${
          recipe.imageUrl || "assets/images/default-recipe.jpg"
        })"></div>
        <div class="recipe-content">
            <h3>${recipe.name}</h3>
            <div class="recipe-category">
                <i class="fas fa-tag"></i>
                <span>${recipe.category}</span>
            </div>
            <div class="recipe-ingredients">
                <h4><i class="fas fa-list"></i> Ingredients</h4>
                <ul>
                    ${recipe.ingredients
                      .map((ing) => `<li>${ing.name} - ${ing.quantity}</li>`)
                      .join("")}
                </ul>
            </div>
            <div class="recipe-actions">
                <button onclick="editRecipe('${id}')" class="edit-btn">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="deleteRecipe('${id}')" class="delete-btn">
                    <i class="fas fa-trash"></i> Delete
                </button>
                <button onclick="toggleFavorite('${id}')" class="favorite-btn">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        </div>
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
searchInput.addEventListener("input", loadRecipes);
categoryFilter.addEventListener("change", loadRecipes);

// Chat Widget Toggle
chatToggle.addEventListener("click", () => {
  chatWidget.classList.toggle("collapsed");
  chatToggle.classList.toggle("fa-chevron-up");
  chatToggle.classList.toggle("fa-chevron-down");
});

// Event Listeners
recipesTab.addEventListener("click", (e) => {
  e.preventDefault();
  switchTab(recipesTab);
});

addRecipeTab.addEventListener("click", (e) => {
  e.preventDefault();
  switchTab(addRecipeTab);
});

favoritesTab.addEventListener("click", (e) => {
  e.preventDefault();
  switchTab(favoritesTab);
});

// Add this to handle favorites
async function toggleFavorite(recipeId) {
  try {
    const recipeRef = recipesCollection.doc(recipeId);
    const doc = await recipeRef.get();
    const currentFavorite = doc.data().isFavorite;

    await recipeRef.update({
      isFavorite: !currentFavorite,
    });

    showNotification(
      currentFavorite ? "Removed from favorites" : "Added to favorites",
      "success"
    );
    loadRecipes();
    if (document.querySelector('[data-tab="favorites"].active')) {
      loadFavorites();
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    showNotification("Error updating favorite status", "error");
  }
}

// Add these functions for favorites and categories
async function loadFavorites() {
  try {
    const snapshot = await recipesCollection
      .where("isFavorite", "==", true)
      .get();
    const favoritesContainer = document.getElementById("favorites-container");
    favoritesContainer.innerHTML = "";

    snapshot.forEach((doc) => {
      const recipe = { id: doc.id, ...doc.data() };
      const card = createRecipeCard(recipe);
      favoritesContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading favorites:", error);
    showNotification("Error loading favorites", "error");
  }
}

async function loadCategories() {
  try {
    const snapshot = await recipesCollection.get();
    const categories = {};

    snapshot.forEach((doc) => {
      const recipe = doc.data();
      if (!categories[recipe.category]) {
        categories[recipe.category] = [];
      }
      categories[recipe.category].push({ id: doc.id, ...recipe });
    });

    const categoriesContainer = document.getElementById("categories-container");
    categoriesContainer.innerHTML = "";

    Object.entries(categories).forEach(([category, recipes]) => {
      const categorySection = document.createElement("div");
      categorySection.className = "category-section";
      categorySection.innerHTML = `
        <h2>${category}</h2>
        <div class="category-recipes"></div>
      `;

      const recipesContainer =
        categorySection.querySelector(".category-recipes");
      recipes.forEach((recipe) => {
        const card = createRecipeCard(recipe);
        recipesContainer.appendChild(card);
      });

      categoriesContainer.appendChild(categorySection);
    });
  } catch (error) {
    console.error("Error loading categories:", error);
    showNotification("Error loading categories", "error");
  }
}
