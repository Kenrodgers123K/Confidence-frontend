// js/products.js

const API_BASE_URL = 'https://confidence-vrrz.onrender.com/api'; // Base URL for your backend API

let currentPage = 1;
const productsPerPage = 20; // Display  products per page as requested
let currentSearchQuery = '';
let currentCategoryFilter = '';

document.addEventListener('DOMContentLoaded', async () => {
    const productListDiv = document.getElementById('product-list');
    const noProductsMessage = document.getElementById('no-products-message');
    const productsSectionTitle = document.getElementById('products-section-title');
    const productPaginationControls = document.getElementById('productPaginationControls');
    const productCategoryMenu = document.getElementById('productCategoryMenu'); // For the dropdown menu
    const allCategoriesContainer = document.getElementById('all-categories-container'); // Container for categorized products on index.html

    // Search elements in header (from index.html)
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    // --- Helper function to calculate discount percentage ---
    function calculateDiscount(price, originalPrice) {
        if (!originalPrice || originalPrice <= price) return 0;
        const discount = ((originalPrice - price) / originalPrice) * 100;
        return Math.round(discount);
    }

    // --- Function to render product card HTML ---
    function createProductCard(product) {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        // Check if product has a discount
        const hasDiscount = product.originalPrice && product.originalPrice > product.price;

        // Use the corrected 'image' property from the product object
        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${product.image || 'https://placehold.co/300x200?text=No+Image'}" alt="${product.name}" class="product-image">
                ${hasDiscount ? `<span class="discount-badge">${calculateDiscount(product.price, product.originalPrice)}% OFF</span>` : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                
                
                <a href="product-details.html?id=${product._id}" style="display: block; width: 100%; text-align: center; background-color: #eb7608; color: #fff; padding: 0.75rem; border-radius: 9999px; font-weight: 600; text-decoration: none; transition: all 0.3s ease; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" onmouseover="this.style.backgroundColor='#d86907'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 10px rgba(0,0,0,0.15);'" onmouseout="this.style.backgroundColor='#eb7608'; this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(0,0,0,0.1);'"> View Details </a>
            </div>
        `;
        return productCard;
    }
        // --- Helper function to create a full category section for index.html ---
    function createCategorySection(category, products) {
        const section = document.createElement('section');
        section.className = 'product-section my-12';
        section.innerHTML = `
            <div class="container mx-auto px-4">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-3xl font-bold text-gray-800">${category}</h2>
                    <a href="products.html?category=${encodeURIComponent(category)}" class="text-teal-600 hover:text-teal-800 font-semibold transition-colors">
                        View All
                        <i class="fas fa-arrow-right ml-1"></i>
                    </a>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                </div>
            </div>
        `;
        const grid = section.querySelector('.grid');
        products.forEach(product => {
            grid.appendChild(createProductCard(product));
        });
        return section;
    }

    // --- Function to fetch and display products by category (for index.html) ---
    async function fetchAndDisplayProductsByCategory() {
        try {
            if (allCategoriesContainer) {
                allCategoriesContainer.innerHTML = ''; // Clear the container
            }

            // Fetch all products (or a large enough number) to group them
            const response = await fetch(`${API_BASE_URL}/products?limit=999`);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await response.json();
            const products = data.products;

            if (products.length === 0) {
                // If there's no products, the section just won't show anything.
                return;
            }

            // Group products by category
            const productsByCategory = products.reduce((acc, product) => {
                const category = product.category || 'Uncategorized';
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push(product);
                return acc;
            }, {});

            // Render each category with up to 8 products
            for (const category in productsByCategory) {
                const categorySection = document.createElement('div');
                categorySection.classList.add('category-section', 'mb-5', 'pb-4', 'border-b');

                const categoryHeader = document.createElement('div');
                categoryHeader.classList.add('flex', 'justify-between', 'items-center', 'mb-4');
                
                const categoryTitle = document.createElement('h3');
                categoryTitle.classList.add('category-title', 'text-2xl', 'font-bold');
                categoryTitle.textContent = category;

                const productsToDisplay = productsByCategory[category].slice(0, 8);
                
                categoryHeader.appendChild(categoryTitle);
                
                if (productsByCategory[category].length > 8) {
                    const viewAllLink = document.createElement('a');
                    viewAllLink.href = `products.html?category=${encodeURIComponent(category)}`;
                    viewAllLink.classList.add('btn', 'btn-secondary', 'view-all-button');
                    viewAllLink.textContent = 'View All';
                    categoryHeader.appendChild(viewAllLink);
                }

                categorySection.appendChild(categoryHeader);

                const productGrid = document.createElement('div');
                productGrid.classList.add('product-grid');

                productsToDisplay.forEach(product => {
                    const productCard = createProductCard(product);
                    productGrid.appendChild(productCard);
                });

                categorySection.appendChild(productGrid);
                if (allCategoriesContainer) {
                    allCategoriesContainer.appendChild(categorySection);
                }
            }
        } catch (error) {
            console.error('Error fetching and displaying products by category:', error);
            if (window.showAlert && productsSectionTitle) {
                showAlert('Failed to load products. Please try again later.', 'error', 'productsSectionTitle');
            }
        }
    }

    // --- Function to fetch and display products (for products.html) ---
    async function fetchAndDisplayProducts(page = 1, searchQuery = '', categoryFilter = '') {
        try {
            // Clear previous products and messages
            if (productListDiv) productListDiv.innerHTML = '';
            if (noProductsMessage) noProductsMessage.style.display = 'none';
            if (productPaginationControls) productPaginationControls.innerHTML = ''; // Clear pagination controls

            if (window.showAlert && productsSectionTitle) {
                showAlert('Loading products...', 'info', 'productsSectionTitle'); // Use showAlert from main.js
            }

            let url = `${API_BASE_URL}/products?page=${page}&limit=${productsPerPage}&category=${encodeURIComponent(categoryFilter)}`;
            if (searchQuery) {
                url += `&search=${encodeURIComponent(searchQuery)}`;
            }
            if (categoryFilter && categoryFilter !== 'All') { // 'All' means no category filter
                url += `&category=${encodeURIComponent(categoryFilter)}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch products');
            }
            const data = await response.json(); // Contains products, currentPage, totalPages, totalProducts

            const products = data.products;
            const totalPages = data.totalPages;

            if (window.showAlert && productsSectionTitle) {
                showAlert('', 'info', 'productsSectionTitle'); // Clear loading message
            }

            if (products.length === 0) {
                if (noProductsMessage) {
                    noProductsMessage.textContent = `No products found ${searchQuery ? `for "${searchQuery}"` : ''}${categoryFilter && categoryFilter !== 'All' ? ` in ${categoryFilter}` : ''}.`;
                    noProductsMessage.style.display = 'block';
                }
                return;
            }

            products.forEach(product => {
                const productCard = createProductCard(product);
                if (productListDiv) productListDiv.appendChild(productCard);
            });

            // --- Pagination Controls ---
            if (totalPages > 1 && productPaginationControls) {
                for (let i = 1; i <= totalPages; i++) {
                    const pageButton = document.createElement('button');
                    pageButton.textContent = i;
                    pageButton.classList.add('pagination-button');
                    if (i === data.currentPage) {
                        pageButton.classList.add('active');
                    }
                    pageButton.addEventListener('click', () => {
                        currentPage = i;
                        fetchAndDisplayProducts(currentPage, currentSearchQuery, currentCategoryFilter);
                        if (productsSectionTitle) {
                            window.scrollTo({ top: productsSectionTitle.offsetTop - 100, behavior: 'smooth' }); // Scroll to top of products section
                        }
                    });
                    productPaginationControls.appendChild(pageButton);
                }
            }

            // Update section title
            if (productsSectionTitle) {
                if (categoryFilter && categoryFilter !== 'All') {
                    productsSectionTitle.textContent = `${categoryFilter} Products`;
                } else if (searchQuery) {
                    productsSectionTitle.textContent = `Search Results for "${searchQuery}"`;
                } else {
                    productsSectionTitle.textContent = 'All Products';
                }
            }

        } catch (error) {
            console.error('Error fetching and displaying products:', error);
            if (noProductsMessage) {
                noProductsMessage.textContent = `Error loading products: ${error.message}. Please try again later.`;
                noProductsMessage.style.display = 'block';
            }
            if (window.showAlert && productsSectionTitle) {
                showAlert(`Failed to load products: ${error.message}.`, 'error', 'productsSectionTitle');
            }
        }
    }

    // --- Populate Category Dropdown ---
    async function populateCategoryMenu() {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`);
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            const categories = await response.json();

            if (productCategoryMenu) {
                // Clear existing and add 'All Products' option first
                productCategoryMenu.innerHTML = '<a href="#" data-category="All">All Products</a>';

                categories.forEach(category => {
                    const categoryLink = document.createElement('a');
                    categoryLink.href = '#';
                    categoryLink.textContent = category;
                    categoryLink.setAttribute('data-category', category);
                    productCategoryMenu.appendChild(categoryLink);
                });

                // Add event listeners to category links
                productCategoryMenu.addEventListener('click', (event) => {
                    event.preventDefault(); // Prevent default link behavior
                    const target = event.target;
                    if (target.tagName === 'A' && target.hasAttribute('data-category')) {
                        currentCategoryFilter = target.getAttribute('data-category');
                        currentSearchQuery = ''; // Clear search when category is selected
                        if (searchInput) searchInput.value = ''; // Clear search input
                        currentPage = 1; // Reset to first page
                        fetchAndDisplayProducts(currentPage, currentSearchQuery, currentCategoryFilter);

                        // Optional: Close dropdown after selection
                        const dropdownContent = target.closest('.dropdown-content');
                        if (dropdownContent) dropdownContent.style.display = 'none';
                    }
                });
            }

            // Toggle dropdown visibility when "Products" link is clicked
            const productsDropdownBtn = document.querySelector('.dropdown .dropbtn');
            if (productsDropdownBtn && productCategoryMenu) {
                productsDropdownBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    productCategoryMenu.style.display = productCategoryMenu.style.display === 'block' ? 'none' : 'block';
                });
            }

            // Close dropdown if clicked outside
            window.addEventListener('click', (event) => {
                if (productCategoryMenu && !event.target.matches('.dropbtn') && !event.target.matches('#productCategoryMenu') && !productCategoryMenu.contains(event.target)) {
                    productCategoryMenu.style.display = 'none';
                }
            });

        } catch (error) {
            console.error('Error populating category menu:', error);
        }
    }

    // --- Initial Load ---
    // This checks which page we are on and calls the appropriate function
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        fetchAndDisplayProductsByCategory();
        populateCategoryMenu(); // Still populate the menu for the header
    } else if (window.location.pathname.endsWith('products.html')) {
        populateCategoryMenu(); // Populate categories on products page load
        const urlParams = new URLSearchParams(window.location.search);
        currentCategoryFilter = urlParams.get('category') || '';
        currentSearchQuery = urlParams.get('search') || '';
        fetchAndDisplayProducts(currentPage, currentSearchQuery, currentCategoryFilter); // Load initial products based on URL
    }


    // --- Search Functionality ---
    
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                // Redirect to the products page with the search query
                window.location.href = `products.html?search=${encodeURIComponent(query)}`;
            } else {
                // If search is empty, just go to the products page
                window.location.href = `index.html`;
            }
        });

        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                searchButton.click(); // Simulate click on search button
            }
        });
    }

});