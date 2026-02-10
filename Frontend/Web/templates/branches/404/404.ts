import '/templates/roots/base.ts';
import './404.scss';

document.addEventListener('DOMContentLoaded', () => {
    const backButton = document.querySelector('.btn-404');
    if (backButton) {
        backButton.addEventListener('click', (e) => {
            if (window.history.length > 1) {
                e.preventDefault();
                window.history.back();
            }
        });
    }
});