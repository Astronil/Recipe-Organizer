export function loadSidebar() {
  const currentPage = window.location.pathname;

  return `
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="logo">
                    <i class="fas fa-utensils"></i>
                    <span>RecipeHub</span>
                </div>
            </div>
            
            <nav class="sidebar-nav">
                <a href="${
                  currentPage.includes("/pages/")
                    ? "../index.html"
                    : "index.html"
                }" 
                   class="nav-item ${
                     currentPage.endsWith("index.html") ? "active" : ""
                   }">
                    <i class="fas fa-home"></i>
                    <span>Dashboard</span>
                </a>
                <a href="${
                  currentPage.includes("/pages/")
                    ? "add-recipe.html"
                    : "pages/add-recipe.html"
                }" 
                   class="nav-item ${
                     currentPage.includes("add-recipe.html") ? "active" : ""
                   }">
                    <i class="fas fa-plus-circle"></i>
                    <span>New Recipe</span>
                </a>
                <a href="${
                  currentPage.includes("/pages/")
                    ? "favorites.html"
                    : "pages/favorites.html"
                }" 
                   class="nav-item ${
                     currentPage.includes("favorites.html") ? "active" : ""
                   }">
                    <i class="fas fa-heart"></i>
                    <span>Favorites</span>
                </a>
                <a href="${
                  currentPage.includes("/pages/")
                    ? "categories.html"
                    : "pages/categories.html"
                }" 
                   class="nav-item ${
                     currentPage.includes("categories.html") ? "active" : ""
                   }">
                    <i class="fas fa-tags"></i>
                    <span>Categories</span>
                </a>
            </nav>

            <div class="sidebar-footer">
                <button id="biometric-login" class="btn-biometric">
                    <i class="fas fa-fingerprint"></i>
                    <span>Secure Login</span>
                </button>
            </div>
        </aside>
    `;
}
