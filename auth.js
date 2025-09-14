// js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');
    // config.js

     const API_BASE_URL = 'https://confidence-vrrz.onrender.com/api'; 
    
    const showAlert = window.showAlert;

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                showAlert('Logging in...', 'info', 'loginMessage');

                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('jwtToken', data.token);
                    localStorage.setItem('userRole', data.role);
                    showAlert('Login successful! Redirecting...', 'success', 'loginMessage');
                    setTimeout(() => {
                        window.location.href = 'admin.html';
                    }, 1500);
                } else {
                    showAlert(data.message || 'Login failed. Please check your credentials.', 'error', 'loginMessage');
                }
            } catch (error) {
                console.error('Error during login:', error);
                showAlert('Network error. Could not connect to server. Ensure backend is running.', 'error', 'loginMessage');
            }
        });
    }

    if (window.location.pathname.endsWith('/admin.html')) {
        const token = localStorage.getItem('jwtToken');
        const userRole = localStorage.getItem('userRole');

        if (!token || userRole !== 'admin') {
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 500);
        } else {
            console.log('Admin authenticated. Token:', token.substring(0, 10) + '...');
        }

        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('userRole');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 500);
            });
        }
    }
});