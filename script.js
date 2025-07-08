const zikirTranslations = [
    "Zeynep'e yaptığı yemekler için teşekkür ederim",
    "Zeynep'in sağlığı için şükürler olsun",
    "Zeynep'in başarısı için Allah'a hamd olsun",
    "Zeynep'in hayatında huzur ve mutluluk dilerim",
    "Zeynep'in geçmişi için af dilerim",
    "Zeynep'in üzerine Allah'ın rahmeti ve bereketi olsun"
];

// Ses dosyaları
const zikirSounds = [
    document.getElementById('zikir1'),
    document.getElementById('zikir2'),
    document.getElementById('zikir3'),
    document.getElementById('zikir4'),
    document.getElementById('zikir5'),
    document.getElementById('zikir6')
];

// Uygulama durumu
let isBackgroundPlaying = false;
let todayCount = 0;
let totalCount = 0;
let isDarkTheme = false;
let currentZikirIndex = 0;

// DOM elementleri
const zikirButton = document.getElementById('zikirButton');
const backgroundToggle = document.getElementById('backgroundToggle');
const themeToggle = document.getElementById('themeToggle');
const backgroundAudio = document.getElementById('backgroundAudio');
const todayCounter = document.getElementById('todayCounter');
const totalCounter = document.getElementById('totalCounter');
const currentZikirText = document.getElementById('currentZikirText');
const bgIcon = document.getElementById('bgIcon');
const themeIcon = document.getElementById('themeIcon');

// LocalStorage'dan veri yükleme
function loadData() {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('zikirDate');

    if (savedDate === today) {
        todayCount = parseInt(localStorage.getItem('todayCount')) || 0;
    } else {
        todayCount = 0;
        localStorage.setItem('zikirDate', today);
    }

    totalCount = parseInt(localStorage.getItem('totalCount')) || 0;
    isDarkTheme = localStorage.getItem('darkTheme') === 'true';

    updateCounters();
    updateTheme();
}

// Veri kaydetme
function saveData() {
    localStorage.setItem('todayCount', todayCount.toString());
    localStorage.setItem('totalCount', totalCount.toString());
    localStorage.setItem('darkTheme', isDarkTheme.toString());
    localStorage.setItem('zikirDate', new Date().toDateString());
}

// Sayaçları güncelleme
function updateCounters() {
    todayCounter.textContent = todayCount;
    totalCounter.textContent = totalCount;
}

// Tema güncelleme
function updateTheme() {
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        themeIcon.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-theme');
        themeIcon.textContent = '🌙';
    }
}

// Ripple efekti oluşturma
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = button.querySelector('.ripple');

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    ripple.style.transform = 'scale(0)';
    ripple.style.opacity = '1';

    setTimeout(() => {
        ripple.style.transform = 'scale(4)';
        ripple.style.opacity = '0';
    }, 10);
}

// Titreşim desteği
function vibrate() {
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// Zikir çalma
function playZikir() {
    // Rastgele zikir seçme
    const randomIndex = Math.floor(Math.random() * zikirSounds.length);
    currentZikirIndex = randomIndex;

    // Önceki sesleri durdur
    zikirSounds.forEach(sound => {
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
        }
    });

    // Yeni zikir ses dosyası varsa çal
    const currentSound = zikirSounds[randomIndex];
    if (currentSound) {
        currentSound.play().catch(error => {
            console.log('Ses çalınamadı:', error);
        });
    }

    // Zikir metnini güncelle
    currentZikirText.textContent = zikirTranslations[randomIndex];

    // Sayaçları artır
    todayCount++;
    totalCount++;
    updateCounters();
    saveData();

    // Titreşim
    vibrate();

    // Buton animasyonu
    zikirButton.classList.add('success-pulse');
    setTimeout(() => {
        zikirButton.classList.remove('success-pulse');
    }, 500);
}

// Arka plan müziği toggle
function toggleBackgroundMusic() {
    if (isBackgroundPlaying) {
        backgroundAudio.pause();
        bgIcon.textContent = '🔇';
        isBackgroundPlaying = false;
    } else {
        backgroundAudio.play().catch(error => {
            console.log('Arka plan müziği çalınamadı:', error);
            // Kullanıcı etkileşimi gerekliyse
            showAudioPermissionMessage();
        });
        bgIcon.textContent = '🔊';
        isBackgroundPlaying = true;
    }
}

// Ses izni mesajı
function showAudioPermissionMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--primary-green);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 1000;
        font-size: 14px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    message.textContent = 'Ses çalmak için sayfayla etkileşim gerekli';
    document.body.appendChild(message);

    setTimeout(() => {
        document.body.removeChild(message);
    }, 3000);
}

// Tema değiştirme
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    updateTheme();
    saveData();
}

// Sayfa yüklendiğinde çalışacak fonksiyonlar
function initializeApp() {
    loadData();

    // Ses dosyalarının volume ayarları
    backgroundAudio.volume = 0.3;
    zikirSounds.forEach(sound => {
        if (sound) {
            sound.volume = 0.7;
        }
    });

    // Başlangıç mesajı
    setTimeout(() => {
        currentZikirText.textContent = "Her dokunuş bir minnet";
    }, 1000);
}

// Event listeners
zikirButton.addEventListener('click', (e) => {
    createRipple(e);
    playZikir();
});

backgroundToggle.addEventListener('click', toggleBackgroundMusic);
themeToggle.addEventListener('click', toggleTheme);

// Touch events for mobile
zikirButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    createRipple(e.touches[0]);
    playZikir();
});

// Klavye desteği
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        playZikir();
    }
    if (e.code === 'KeyB') {
        toggleBackgroundMusic();
    }
    if (e.code === 'KeyT') {
        toggleTheme();
    }
});

// Arka plan müziği otomatik başlatma (kullanıcı etkileşimi sonrası)
let userInteracted = false;
function handleFirstInteraction() {
    if (!userInteracted) {
        userInteracted = true;

        // Arka plan müziğini otomatik başlat
        setTimeout(() => {
            if (!isBackgroundPlaying) {
                toggleBackgroundMusic();
            }
        }, 500);
    }
}

// İlk etkileşim dinleyicileri
document.addEventListener('click', handleFirstInteraction);
document.addEventListener('touchstart', handleFirstInteraction);

// Sayfa görünürlüğü değiştiğinde
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Sayfa gizlendiğinde sesleri duraklat
        zikirSounds.forEach(sound => {
            if (sound && !sound.paused) {
                sound.pause();
            }
        });
    }
});

// Sayfa kapatılırken veri kaydetme
window.addEventListener('beforeunload', saveData);

// Uygulama başlatma
document.addEventListener('DOMContentLoaded', initializeApp);

// Hata yakalama
window.addEventListener('error', (e) => {
    console.log('Hata:', e.error);
});

// Service Worker kaydı (gelecekte offline kullanım için)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
