// js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('product-form');
    const adminProductListDiv = document.getElementById('admin-product-list');
    const noAdminProductsMessage = document.getElementById('no-admin-products-message');
    const adminFormMessage = document.getElementById('adminFormMessage');

    const adminSearchInput = document.getElementById('adminSearchInput');
    const adminSearchButton = document.getElementById('adminSearchButton');

    const editProductModal = document.getElementById('editProductModal');
    const closeEditModalBtn = document.getElementById('closeEditModal');
    const editProductForm = document.getElementById('editProductForm');
    const editFormMessage = document.getElementById('editFormMessage');
    const editProductIdInput = document.getElementById('editProductId');
    const editProductNameInput = document.getElementById('editProductName');
    const editProductDescriptionInput = document.getElementById('editProductDescription');
    const editProductPriceInput = document.getElementById('editProductPrice');
    const editProductOriginalPriceInput = document.getElementById('editProductOriginalPrice');
    const editProductQuantityInput = document.getElementById('editProductQuantity');
    const editProductCategoryInput = document.getElementById('editProductCategory');
    const editProductSubCategoryInput = document.getElementById('editProductSubCategory');

    // config.js

    const API_BASE_URL = 'https://confidence-vrrz.onrender.com/api';
    

    // Helper function to show alerts
    const showAlert = window.showAlert;

    // Helper function to calculate discount
    function calculateDiscount(price, originalPrice) {
        if (!originalPrice || originalPrice <= price) return 0;
        const discount = ((originalPrice - price) / originalPrice) * 100;
        return Math.round(discount);
    }
    
    // Function to render products in the admin panel
    const renderAdminProducts = async (query = '') => {
        try {
            let url = `${API_BASE_URL}/products`;
            if (query) {
                url += `?search=${encodeURIComponent(query)}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await response.json();
            const products = data.products;

            adminProductListDiv.innerHTML = '';
            if (products.length === 0) {
                noAdminProductsMessage.style.display = 'block';
            } else {
                noAdminProductsMessage.style.display = 'none';
                products.forEach(product => {
                    const productDiv = document.createElement('div');
                    productDiv.classList.add('admin-product-item');
                    const discountPercent = product.original_price && product.original_price > product.price ? calculateDiscount(product.price, product.original_price) : 0;
                    
                    productDiv.innerHTML = `
                        <img src="${product.image}" alt="${product.name}" class="admin-product-image">
                        <div class="admin-product-info">
                            <h4 class="admin-product-name">${product.name}</h4>
                            <p class="admin-product-price">Ksh ${product.price.toLocaleString()}</p>
                            ${discountPercent > 0 ? `<p class="admin-product-original-price">Original: Ksh ${product.original_price.toLocaleString()}</p>` : ''}
                            <p class="admin-product-stock">In Stock: ${product.quantity}</p>
                        </div>
                        <div class="admin-product-actions">
                            <button class="edit-btn" data-id="${product._id}">Edit</button>
                            <button class="delete-btn" data-id="${product._id}">Delete</button>
                        </div>
                    `;
                    adminProductListDiv.appendChild(productDiv);
                });
            }
        } catch (error) {
            console.error('Error rendering admin products:', error);
            showAlert(`Failed to load products: ${error.message}`, 'error', 'adminFormMessage');
        }
    };
    
    // Search functionality
    if (adminSearchButton && adminSearchInput) {
        adminSearchButton.addEventListener('click', () => {
            const query = adminSearchInput.value.trim();
            renderAdminProducts(query);
        });
        adminSearchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                adminSearchButton.click();
            }
        });
    }

    // Handle add/edit product form submission
    if (productForm) {
        productForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            showAlert('Adding product...', 'info', 'adminFormMessage');

            const formData = new FormData();
            
            // admin.js
            formData.append('name', document.getElementById('name').value);
            formData.append('description', document.getElementById('description').value);
            formData.append('price', document.getElementById('price').value);
            formData.append('originalPrice', document.getElementById('originalPrice').value);
            formData.append('quantity', document.getElementById('quantity').value);
            formData.append('category', document.getElementById('category').value);
            formData.append('subCategory', document.getElementById('subCategory').value);
            const imageFile = document.getElementById('image').files[0];
            if (imageFile) {
                formData.append('image', imageFile);
            }
            formData.append('specs', JSON.stringify(document.getElementById('specs').value.split(',').map(s => s.trim())));

            try {
                const token = localStorage.getItem('jwtToken');
                if (!token) {
                    throw new Error('Authentication token not found. Please log in again.');
                }

                const response = await fetch(`${API_BASE_URL}/products`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to add product: ${response.status} ${response.statusText}. Server response: ${errorText}`);
                }

                const newProduct = await response.json();
                showAlert(`Product "${newProduct.name}" added successfully!`, 'success', 'adminFormMessage');
                productForm.reset();
                renderAdminProducts();
            } catch (error) {
                console.error('Error adding product:', error);
                showAlert(`Network error: ${error.message}`, 'error', 'adminFormMessage');
            }
        });
    }

    // Handle edit modal submission
    if (editProductForm) {
        editProductForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            showAlert('Updating product...', 'info', 'editFormMessage');

            const productId = editProductIdInput.value;
            const formData = new FormData();
            formData.append('name', editProductNameInput.value);
            formData.append('description', editProductDescriptionInput.value);
            formData.append('price', editProductPriceInput.value);
            formData.append('originalPrice', editProductOriginalPriceInput.value);
            formData.append('quantity', editProductQuantityInput.value);
            formData.append('category', editProductCategoryInput.value);
            formData.append('subCategory', editProductSubCategoryInput.value);
            const newImageFile = document.getElementById('editProductImage').files[0];
            if (newImageFile) {
                formData.append('image', newImageFile);
            } else {
                formData.append('imageUrl', document.getElementById('currentImageUrl').value);
            }
            formData.append('specs', JSON.stringify(document.getElementById('editProductSpecs').value.split(',').map(s => s.trim())));

            try {
                const token = localStorage.getItem('jwtToken');
                if (!token) {
                    throw new Error('Authentication token not found. Please log in again.');
                }

                const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to update product: ${response.status} ${response.statusText}. Server response: ${errorText}`);
                }

                const updatedProduct = await response.json();
                showAlert(`Product "${updatedProduct.name}" updated successfully!`, 'success', 'editFormMessage');
                editProductModal.style.display = 'none';
                renderAdminProducts();
            } catch (error) {
                console.error('Error updating product:', error);
                showAlert(`Network error: ${error.message}`, 'error', 'editFormMessage');
            }
        });
    }

    // Handle edit/delete button clicks
    if (adminProductListDiv) {
        adminProductListDiv.addEventListener('click', async (event) => {
            if (event.target.classList.contains('edit-btn')) {
                const productId = event.target.dataset.id;
                try {
                    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch product for editing');
                    }
                    const product = await response.json();
                    
                    // Populate modal with product data
                    editProductIdInput.value = product._id;
                    editProductNameInput.value = product.name;
                    editProductDescriptionInput.value = product.description;
                    editProductPriceInput.value = product.price;
                    editProductOriginalPriceInput.value = product.original_price || '';
                    editProductQuantityInput.value = product.quantity;
                    editProductCategoryInput.value = product.category;
                    editProductSubCategoryInput.value = product.subcategory;
                    editProductSpecsInput.value = product.specs ? product.specs.join(', ') : '';
                    document.getElementById('currentProductImage').src = product.image;
                    document.getElementById('currentImageUrl').value = product.image;

                    editProductModal.style.display = 'block';

                } catch (error) {
                    console.error('Error fetching product for edit:', error);
                    showAlert(`Failed to load product for editing: ${error.message}`, 'error', 'adminFormMessage');
                }

            } else if (event.target.classList.contains('delete-btn')) {
                const productId = event.target.dataset.id;
                if (confirm('Are you sure you want to delete this product?')) {
                    try {
                        const token = localStorage.getItem('jwtToken');
                        if (!token) {
                            throw new Error('Authentication token not found. Please log in again.');
                        }

                        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            },
                        });

                        if (!response.ok) {
                            const errorText = await response.text();
                            throw new Error(`Failed to delete product: ${response.status} ${response.statusText}. Server response: ${errorText}`);
                        }
                        const data = await response.json();
                        showAlert(data.message || 'Product deleted successfully!', 'success', 'adminFormMessage');
                        renderAdminProducts();
                    } catch (error) {
                        console.error('Error deleting product:', error);
                        showAlert(`Network error: ${error.message}`, 'error', 'adminFormMessage');
                    }
                }
            }
        });
    }

    closeEditModalBtn.addEventListener('click', () => {
        editProductModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === editProductModal) {
            editProductModal.style.display = 'none';
        }
    });

    renderAdminProducts();
});