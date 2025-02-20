// Initialize Firebase (make sure this matches your config)
const db = firebase.firestore();
const recipesCollection = db.collection("recipes");

// Load favorite recipes
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
    loadFavorites();
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
  loadFavorites();
});
