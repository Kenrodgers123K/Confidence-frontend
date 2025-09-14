// js/main.js

document.addEventListener('DOMContentLoaded', function() {
    // --- Global showAlert Function ---
    // This function is crucial for displaying consistent messages across your frontend.
    // It uses the .submission-message CSS classes for styling.
    window.showAlert = function(message, type, elementId) {
        const messageElement = document.getElementById(elementId);
        if (messageElement) {
            messageElement.classList.remove('success', 'info', 'error'); // Clear previous states
            messageElement.classList.add(type); // Add current state class
            messageElement.textContent = message;
            messageElement.style.opacity = 1; // Make visible

            // Automatically hide after 5 seconds, unless it's an 'info' message (for redirects)
            if (type !== 'info') {
                setTimeout(() => {
                    messageElement.style.opacity = 0;
                    messageElement.textContent = ''; // Clear text after fading
                }, 5000);
            }
        } else {
            console.warn(`showAlert: Element with ID '${elementId}' not found.`);
            // Fallback to a simple alert if the target element doesn't exist (shouldn't happen with correct IDs)
            // alert(message); // Replaced with console.warn as alerts are discouraged
        }
    };

    // --- Dynamic Year in Footer ---
    const currentYearSpan = document.getElementById('current-year');
    const currentYearAdminSpan = document.getElementById('current-year-admin'); // For admin.html
    const currentYear = new Date().getFullYear();
    if (currentYearSpan) {
        currentYearSpan.textContent = currentYear;
    }
    if (currentYearAdminSpan) {
        currentYearAdminSpan.textContent = currentYear;
    }

    // --- Product Suggestions (Search) Logic for index.html ---
    const productsSearchList = [
        "Steam Products", "Pipes & Fittings", "Bearings & V-Belts", "Electrical Products",
        "Laboratory Equipment", "Safety Equipment", "Bolts & Nuts", "Industrial Gaskets",
        "Water Pumps", "Lighting Accessories", "Steam Installations", "Technical Services",
        "Plumbing Solutions", "Custom Fabrication", "Industrial Machinery Maintenance"
    ];

    const searchInput = document.getElementById('searchInput');
    const productSuggestions = document.getElementById('productSuggestions');

    if (searchInput && productSuggestions) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            productSuggestions.innerHTML = ''; // Clear previous suggestions
            if (query.length > 0) {
                const filteredProducts = productsSearchList.filter(product =>
                    product.toLowerCase().includes(query)
                );
                filteredProducts.forEach(product => {
                    const div = document.createElement('div');
                    div.textContent = product;
                    div.addEventListener('click', function() {
                        searchInput.value = this.textContent;
                        productSuggestions.style.display = 'none';
                    });
                    productSuggestions.appendChild(div);
                });
                productSuggestions.style.display = filteredProducts.length > 0 ? 'block' : 'none';
            } else {
                productSuggestions.style.display = 'none';
            }
        });

        // Hide suggestions when clicking outside search input or suggestions box
        document.addEventListener('click', function(event) {
            if (event.target !== searchInput && !productSuggestions.contains(event.target)) {
                productSuggestions.style.display = 'none';
            }
        });
    }

    // --- Fade-in Animations (Intersection Observer) ---
    const fadeInElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .fade-in-up');

    const observerOptions = {
        root: null, // viewport as root
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    }, observerOptions);

    fadeInElements.forEach(el => {
        observer.observe(el);
    });

    // --- Quote Form Submission Logic (from index.html) ---
    const quoteForm = document.getElementById('quoteForm');
    const quoteFormMessage = document.getElementById('quoteFormMessage');

    if (quoteForm) {
        quoteForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission

            const selectedMethod = document.querySelector('input[name="quoteMethod"]:checked').value;
            const quoteDetails = {
                name: document.getElementById('quoteName').value,
                email: document.getElementById('quoteEmail').value,
                phone: document.getElementById('quotenumber').value,
                location: document.getElementById('quoteLocation').value,
                message: document.getElementById('quoteMessage').value
            };

            console.log('Quote Request Submitted:', quoteDetails);

            let messageBody = `Name: ${quoteDetails.name}\n`;
            messageBody += `Email: ${quoteDetails.email}\n`;
            messageBody += `Phone: ${quoteDetails.phone}\n`;
            messageBody += `Location: ${quoteDetails.location}\n\n`;
            messageBody += `Product/Service Needs:\n${quoteDetails.message}`;

            let url = '';
            const targetPhoneNumber = '2547113231007'; // Your WhatsApp/SMS number

            if (selectedMethod === 'whatsapp') {
                const whatsappMessage = `Hello, I'd like a quote.\n${messageBody}`;
                url = `https://wa.me/${targetPhoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
                showAlert('Redirecting to WhatsApp for your quote request...', 'info', 'quoteFormMessage');
                setTimeout(() => {
                    window.open(url, '_blank');
                    showAlert('Your WhatsApp quote request is ready to send!', 'success', 'quoteFormMessage');
                    quoteForm.reset(); // Clear form
                }, 1000);
            } else if (selectedMethod === 'email') {
                const emailSubject = `Quote Request from ${quoteDetails.name}`;
                url = `mailto:kenrodgers970@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(messageBody)}`;
                showAlert('Opening your email client for your quote request...', 'info', 'quoteFormMessage');
                setTimeout(() => {
                    window.open(url, '_blank');
                    showAlert('Your email quote request is ready to send!', 'success', 'quoteFormMessage');
                    quoteForm.reset(); // Clear form
                }, 1000);
            } else if (selectedMethod === 'sms') {
                const smsMessage = `Quote Request from ${quoteDetails.name} (Loc: ${quoteDetails.location}). Needs: ${quoteDetails.message.substring(0, 120)}... (Full details by email/WhatsApp)`;
                url = `sms:${targetPhoneNumber}?body=${encodeURIComponent(smsMessage)}`;
                showAlert('Opening your SMS app for your quote request...', 'info', 'quoteFormMessage');
                setTimeout(() => {
                    window.open(url, '_blank');
                    showAlert('Your SMS quote request is ready to send!', 'success', 'quoteFormMessage');
                    quoteForm.reset(); // Clear form
                }, 1000);
            } else {
                showAlert('Please select a contact method.', 'error', 'quoteFormMessage');
            }
        });
    }

    // --- Contact Form Submission Logic (from index.html) ---
    const contactForm = document.getElementById('contactForm');
    const contactFormMessage = document.getElementById('contactFormMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log('Contact Form Submitted:', {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            });
            showAlert('Your message has been sent successfully!', 'success', 'contactFormMessage');
            contactForm.reset(); // Clear the form
        });
    }
});
