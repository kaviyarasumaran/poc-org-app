document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const otpForm = document.getElementById('otpForm');
    const logoutButton = document.getElementById('logoutButton');

    // Helper Functions
    const navigateTo = (path) => {
        window.location.href = path;
    };

    const isAuthenticated = () => {
        return localStorage.getItem('token') !== null;
    };

    const requireAuth = () => {
        if (!isAuthenticated()) {
            navigateTo('login.html');
        }
    };

    const showMessage = (message) => {
        alert(message);
    };

    // Event Listeners
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const address = document.getElementById('address').value;
            const phone_number = document.getElementById('phone_number').value;

            try {
                const response = await fetch('http://localhost:3000/api/org/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, address, phone_number })
                });

                const data = await response.json();
                showMessage(data.msg);
                if (data.msg.includes('Registration successful')) {
                    navigateTo('login.html');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Error registering organization');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const org_id = document.getElementById('org_id').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:3000/api/org/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ org_id, password })
                });

                const data = await response.json();
                showMessage(data.msg);
                if (data.msg === 'OTP sent to your email') {
                    navigateTo('otp.html');
                } else if (data.token) {
                    localStorage.setItem('token', data.token);
                    navigateTo('dashboard.html');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Error logging in');
            }
        });
    }

    if (otpForm) {
        otpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const org_id = document.getElementById('org_id').value;
            const otp = document.getElementById('otp').value;

            try {
                const response = await fetch('http://localhost:3000/api/org/verify-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ org_id, otp })
                });

                const data = await response.json();
                showMessage(data.msg);
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    navigateTo('dashboard.html');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Error verifying OTP');
            }
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            navigateTo('login.html');
        });
    }

    // Protect routes
    if (window.location.pathname === '/dashboard.html') {
        requireAuth();
    }
});
