document.addEventListener('DOMContentLoaded', function () {
    const btn = document.querySelector('.button-download-profile button');
    if (!btn) return;

    btn.onclick = function () {
        const target = document.querySelector('.profile-header');
        if (!target) return;

        const originalText = btn.innerText;
        btn.innerText = "⌛ СОХРАНЕНИЕ...";
        btn.style.opacity = "0.7";

        html2canvas(target, {
            useCORS: true,
            allowTaint: true,
            scale: 2,
            backgroundColor: null
        }).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL("image/png");
            
            // Получаем никнейм из заголовка h4 внутри .profile-header
            const nicknameElement = target.querySelector('h4');
            const nickname = nicknameElement ? nicknameElement.innerText.trim() : 'Player';
            
            link.download = `Profile_${nickname}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            btn.innerText = originalText;
            btn.style.opacity = "1";
        }).catch(err => {
            console.error("Ошибка:", err);
            btn.innerText = "❌ ОШИБКА";
            btn.style.opacity = "1";
        });
    };
});
