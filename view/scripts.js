document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const verifyOtpForm = document.getElementById('verifyOtpForm');
  const enableMfaForm = document.getElementById('enableMfaForm');
  const disableMfaForm = document.getElementById('disableMfaForm');

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        address: document.getElementById('address').value,
        phone_number: document.getElementById('phone_number').value,
      };
      const response = await fetch('http://localhost:3000/api/org/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      document.getElementById('registerMessage').textContent = result.msg;
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        org_id: document.getElementById('org_id').value,
        password: document.getElementById('password').value,
      };
      const response = await fetch('http://localhost:3000/api/org/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      document.getElementById('loginMessage').textContent = result.msg;
      if (result.msg.includes('OTP')) {
        window.location.href = 'verify-otp.html';
      }
    });
  }

  if (verifyOtpForm) {
    verifyOtpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        org_id: document.getElementById('org_id').value,
        otp: document.getElementById('otp').value,
      };
      const response = await fetch('http://localhost:3000/api/org/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      document.getElementById('otpMessage').textContent = result.msg;
      if (result.msg === 'Login successful') {
        // Redirect or handle successful login
      }
    });
  }

  if (enableMfaForm) {
    enableMfaForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        org_id: document.getElementById('org_id').value,
      };
      const response = await fetch('http://localhost:3000/api/org/enable-mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      document.getElementById('mfaMessage').textContent = result.msg;
    });
  }

  if (disableMfaForm) {
    disableMfaForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        org_id: document.getElementById('org_id').value,
      };
      const response = await fetch('http://localhost:3000/api/org/disable-mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      document.getElementById('disableMfaMessage').textContent = result.msg;
    });
  }
});
