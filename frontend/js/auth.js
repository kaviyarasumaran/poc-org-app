document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const otpForm = document.getElementById('otpForm');
    const mfaForm = document.getElementById('mfaForm');
    const tfaForm = document.getElementById('tfaForm');
    const verificationChoiceForm = document.getElementById('verificationChoiceForm');
    const logoutButton = document.getElementById('logoutButton');

    const showMessage = (message) => {
        alert(message);
    };

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
                    window.location.href = 'login.html';
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
                console.log("msg", data.msg)
                if (data.msg === 'OTP sent to your email') {
                    window.location.href = 'otp.html';
                } else if (data.token) {
                    localStorage.setItem('token', data.token);

                    // Check if MFA or TFA is required
                    if (data.mfaRequired || data.tfaRequired) {
                        window.location.href = 'verification.html';
                    } else {
                        // window.location.href = 'dashboard.html';
                        window.location.href = 'verification.html';
                    }
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

                if (data.mfaRequired || data.tfaRequired) {
                    window.location.href = 'verification.html';
                } else if (data.token) {
                    localStorage.setItem('token', data.token);
                    window.location.href = 'verification.html';
                    // window.location.href = 'dashboard.html';
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Error verifying OTP');
            }
        });
    }

    if (verificationChoiceForm) {
        verificationChoiceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const verificationMethod = document.querySelector('input[name="verification"]:checked').value;

            if (verificationMethod) {
                localStorage.setItem('verificationMethod', verificationMethod);

                if (verificationMethod === 'mfa') {
                    window.location.href = 'mfa.html';
                } else if (verificationMethod === 'tfa') {
                    window.location.href = 'tfa.html';
                }
            } else {
                showMessage('Please select a verification method.');
            }
        });
    }

    if (mfaForm) {
        mfaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const mfa_code = document.getElementById('mfa_code').value;

            try {
                const response = await fetch('http://localhost:3000/api/org/verify-mfa', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mfa_code })
                });

                const data = await response.json();
                showMessage(data.msg);

                if (data.token) {
                    localStorage.setItem('token', data.token);
                    window.location.href = 'dashboard.html';
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Error verifying MFA');
            }
        });
    }

    if (tfaForm) {
        tfaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tfa_code = document.getElementById('tfa_code').value;

            try {
                const response = await fetch('http://localhost:3000/api/org/verify-tfa', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tfa_code })
                });

                const data = await response.json();
                showMessage(data.msg);

                if (data.token) {
                    localStorage.setItem('token', data.token);
                    window.location.href = 'dashboard.html';
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Error verifying TFA');
            }
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        });
    }
});
