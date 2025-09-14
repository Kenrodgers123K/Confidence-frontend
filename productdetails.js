// js/productDetails.js

document.addEventListener('DOMContentLoaded', async () => {
    const productDetailContent = document.getElementById('product-detail-content');
    const productNotFoundMessage = document.getElementById('product-not-found-message');

    const detailProductName = document.getElementById('detail-product-name');
    const detailProductCategory = document.getElementById('detail-product-category');
    const detailProductSubCategory = document.getElementById('detail-product-subcategory');
    const detailProductDescription = document.getElementById('detail-product-description');
    const detailProductPrice = document.getElementById('detail-product-price');
    const detailProductOriginalPrice = document.getElementById('detail-product-original-price');
    const detailProductDiscount = document.getElementById('detail-product-discount');
    const detailProductQuantity = document.getElementById('detail-product-quantity');
    const detailProductImage = document.getElementById('detail-product-image');
    const detailProductSpecs = document.getElementById('detail-product-specs');

    // config.js

    const API_BASE_URL = 'https://confidence-vrrz.onrender.com/api';                                            // products.js

    
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        if (productNotFoundMessage) productNotFoundMessage.textContent = 'No product ID specified.';
        if (productNotFoundMessage) productNotFoundMessage.style.display = 'block';
        if (productDetailContent) productDetailContent.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        if (!response.ok) {
            if (response.status === 404) {
                if (productNotFoundMessage) productNotFoundMessage.textContent = 'Product not found.';
                if (productNotFoundMessage) productNotFoundMessage.style.display = 'block';
                if (productDetailContent) productDetailContent.style.display = 'none';
            }
            throw new Error('Network response was not ok');
        }
        const product = await response.json();

        // Calculate discount percentage
        let discountPercent = 0;
        if (product.original_price && product.original_price > product.price) {
            discountPercent = Math.round(((product.original_price - product.price) / product.original_price) * 100);
        }

        // Populate the details
        detailProductName.textContent = product.name;
        detailProductCategory.textContent = product.category;
        detailProductSubCategory.textContent = product.subcategory;
        detailProductDescription.textContent = product.description;
        detailProductPrice.textContent = `Ksh ${product.price.toLocaleString()}`;

        if (product.original_price && product.original_price > product.price) {
            detailProductOriginalPrice.textContent = `Ksh ${product.original_price.toLocaleString()}`;
            detailProductOriginalPrice.style.display = 'inline';
            detailProductDiscount.textContent = `(${discountPercent}% OFF)`;
            detailProductDiscount.style.display = 'inline';
        } else {
            detailProductOriginalPrice.style.display = 'none';
            detailProductDiscount.style.display = 'none';
        }
        detailProductQuantity.textContent = product.quantity;
        
        // Update product image
        detailProductImage.src = product.image || 'https://placehold.co/600x400?text=No+Image';
        detailProductImage.alt = product.name;

        // Populate specifications
        detailProductSpecs.innerHTML = '';
        if (product.specs && product.specs.length > 0) {
            product.specs.forEach(spec => {
                const li = document.createElement('li');
                li.textContent = spec;
                detailProductSpecs.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'No specific features listed.';
            detailProductSpecs.appendChild(li);
        }

        if (productDetailContent) productDetailContent.style.display = 'flex';
        if (productNotFoundMessage) productNotFoundMessage.style.display = 'none';

        if (detailProductImage) {
            detailProductImage.addEventListener('click', function() {
                this.classList.toggle('zoomed');
            });
        }

    } catch (error) {
        console.error('Error fetching product details:', error);
        if (productNotFoundMessage) productNotFoundMessage.textContent = `Error loading product details: ${error.message}`;
        if (productNotFoundMessage) productNotFoundMessage.style.display = 'block';
        if (productDetailContent) productDetailContent.style.display = 'none';
    }
});