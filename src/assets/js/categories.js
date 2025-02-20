// Initialize Firebase (make sure this matches your config)
const db = firebase.firestore();
const recipesCollection = db.collection("recipes");

// Load categories
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

// Create a recipe card
function createRecipeCard(recipe) {
  const card = document.createElement("div");
  card.className = "recipe-card";
  card.innerHTML = `
        <div class="recipe-content">
            <h3>${recipe.name}</h3>
            <p>${recipe.category}</p>
            <button onclick="toggleFavorite('${
              recipe.id
            }')" class="btn-favorite">
                <i class="fas ${
                  recipe.isFavorite ? "fa-heart" : "fa-heart-broken"
                }"></i>
            </button>
        </div>
    `;
  return card;
}

// Toggle favorite status
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
    loadCategories();
  } catch (error) {
    console.error("Error toggling favorite:", error);
    showNotification("Error updating favorite status", "error");
  }
}

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

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
});
