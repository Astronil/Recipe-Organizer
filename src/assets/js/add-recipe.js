import { db } from "../..config/firebase.config.js"; // Import the initialized Firestore database

const recipesCollection = db.collection("recipes");

// DOM Elements
const ingredientsContainer = document.getElementById("ingredients-container");
const addIngredientBtn = document.getElementById("add-ingredient");
const recipeForm = document.getElementById("add-recipe-form");

// Create a new ingredient row
function createIngredientRow() {
  const row = document.createElement("div");
  row.className = "ingredient-row";
  row.innerHTML = `
        <input type="text" class="ingredient-name" placeholder="Ingredient name" required>
        <input type="text" class="ingredient-quantity" placeholder="Quantity" required>
        <button type="button" class="btn-remove-ingredient">
            <i class="fas fa-trash"></i>
        </button>
    `;

  // Add remove functionality
  const removeBtn = row.querySelector(".btn-remove-ingredient");
  removeBtn.addEventListener("click", () => {
    row.remove();
  });

  return row;
}

// Add ingredient button click handler
addIngredientBtn.addEventListener("click", () => {
  const newRow = createIngredientRow();
  ingredientsContainer.appendChild(newRow);
});

// Form submission
recipeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const ingredients = [];
  const ingredientRows =
    ingredientsContainer.querySelectorAll(".ingredient-row");

  ingredientRows.forEach((row) => {
    const name = row.querySelector(".ingredient-name").value.trim();
    const quantity = row.querySelector(".ingredient-quantity").value.trim();
    if (name && quantity) {
      ingredients.push({ name, quantity });
    }
  });

  if (ingredients.length === 0) {
    showNotification("Please add at least one ingredient", "error");
    return;
  }

  const recipe = {
    name: document.getElementById("recipe-name").value,
    category: document.getElementById("recipe-category").value,
    ingredients,
    instructions: document.getElementById("recipe-instructions").value,
    isFavorite: document.getElementById("recipe-favorite").checked,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await recipesCollection.add(recipe);
    showNotification("Recipe saved successfully!", "success");
    recipeForm.reset();
    ingredientsContainer.innerHTML = "";
    addIngredientBtn.click(); // Add initial ingredient row
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1500);
  } catch (error) {
    console.error("Error saving recipe:", error);
    showNotification("Failed to save recipe", "error");
  }
});

// Notification function
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

// Initialize with one ingredient row
document.addEventListener("DOMContentLoaded", () => {
  addIngredientBtn.click(); // Add initial ingredient row
});
