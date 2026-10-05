import intlTelInput from 'intl-tel-input';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form');
    const inputPhone = document.querySelector('#phone');
    const submitBtn = form.querySelector('button[type="submit"]');

    const iti = intlTelInput(inputPhone, {
        initialCountry: 'ua',
        strictMode: true,
        separateDialCode: true,
        utilsScript: '../utils/utils.js',
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const phone = iti.getNumber();
        const email = document.getElementById('email').value;
        const siteUrl = window.location.href;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            const response = await fetch('/api/lead', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, phone, email, siteUrl }),
            });

            const data = await response.json();

            submitBtn.disabled = false;
            submitBtn.textContent = 'Register for free';

            if (response.ok && data.ok) {
                alert('Successfully sent your request!');
                form.reset();
            } else {
                alert('Failed to send message. Please try again.');
            }
        } catch (error) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register for free';
            console.error('Error:', error);
            alert('Network error. Please try again later.');
        }
    });
});