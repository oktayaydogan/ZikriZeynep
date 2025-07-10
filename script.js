const zikirTranslations = [
    "Ellerine sağlık Zeynep, teşekkür ederiz.",
    "Harika bir yemekti! Adeta göklere yükseldim!",
    "Dünyada iki tane gül olsun biri kırmızı biri beyaz olsun, sen ölürsen kırmızı güller solsun, ben ölürsem beyaz güller kefenim olsun. Afiyet olsun.",
    "Bu ne be kardeşim !? Bunları daha az lezzetli yapta başka yemeklerden de zevk alabilelim.",
    "Ben az önce ne yedim ya !? Cennetten bir meyve mi yedim ne yedim !?"
];

// Ses dosyaları
const zikirSounds = [
    document.getElementById('zikir1'),
    document.getElementById('zikir2'),
    document.getElementById('zikir3'),
    document.getElementById('zikir4'),
    document.getElementById('zikir5')
];

// Uygulama durumu
let isBackgroundPlaying = false;
let todayCount = 0;
let totalCount = 0;
let currentZikirIndex = 0;

// DOM elementleri
const zikirButton = document.getElementById('zikirButton');
const backgroundToggle = document.getElementById('backgroundToggle');
const backgroundAudio = document.getElementById('backgroundAudio');
const todayCounter = document.getElementById('todayCounter');
const totalCounter = document.getElementById('totalCounter');
const currentZikirText = document.getElementById('currentZikirText');
const bgIcon = document.getElementById('bgIcon');
const clickSound = document.getElementById('clickSound');

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

    updateCounters();
}

async function fetchClickCounts() {
    try {
        const todayClicks = await getTodayClicks();
        const totalClicks = await getTotalClicks();
        todayCount = todayClicks;
        totalCount = totalClicks;
        updateCounters();
    } catch (error) {
        console.error('Tıklama sayıları alınamadı:', error);
        // Varsayılan değerler kullan
        todayCount = 0;
        totalCount = 0;
        updateCounters();
    }
}

// Veri kaydetme
function saveData() {
    localStorage.setItem('todayCount', todayCount.toString());
    localStorage.setItem('totalCount', totalCount.toString());
    localStorage.setItem('zikirDate', new Date().toDateString());
}

// Sayaçları güncelleme
function updateCounters() {
    todayCounter.textContent = todayCount;
    totalCounter.textContent = totalCount;
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

// Click sesi çalma
function playClickSound() {
    if (clickSound) {
        clickSound.currentTime = 0; // Sesi baştan başlat
        clickSound.play().catch(error => {
            console.log('Click sesi çalınamadı:', error);
        });
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
    incrementClicks();

    // Titreşim
    vibrate();

    // Buton animasyonu
    zikirButton.classList.add('success-pulse');
    setTimeout(() => {
        zikirButton.classList.remove('success-pulse');
    }, 500);

    // Dinamik yıldız ekle
    addDynamicStar();
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

// Sayfa yüklendiğinde çalışacak fonksiyonlar
function initializeApp() {
    // loadData();
    fetchClickCounts(); // API'den tıklama sayısını al

    // Ses dosyalarının volume ayarları
    backgroundAudio.volume = 0.1;
    zikirSounds.forEach(sound => {
        if (sound) {
            sound.volume = 0.7;
        }
    });

    // Click sesinin volume ayarı
    if (clickSound) {
        clickSound.volume = 0.5;
    }

    // Başlangıç mesajı
    setTimeout(() => {
        currentZikirText.textContent = "Her dokunuş bir minnet";
    }, 1000);
}

// Event listeners
zikirButton.addEventListener('click', (e) => {
    playClickSound(); // Click sesi çal
    createRipple(e);
    playZikir();
});

backgroundToggle.addEventListener('click', toggleBackgroundMusic);

// Touch events for mobile
zikirButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    playClickSound(); // Click sesi çal
    // Touch event için özel ripple oluşturma
    const touch = e.touches[0];
    const mockEvent = {
        currentTarget: e.currentTarget,
        clientX: touch.clientX,
        clientY: touch.clientY
    };
    createRipple(mockEvent);
    playZikir();
});

// Klavye desteği
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        playClickSound(); // Click sesi çal
        playZikir();
    }
    if (e.code === 'KeyB') {
        toggleBackgroundMusic();
    }
});

// Arka plan müziği otomatik başlatma (kullanıcı etkileşimi sonrası)
let userInteracted = false;
function handleFirstInteraction() {
    if (!userInteracted) {
        userInteracted = true;

        // Mobil tarayıcılar için ses dosyalarını hazırla
        backgroundAudio.load();

        // Arka plan müziğini otomatik başlat
        setTimeout(() => {
            if (!isBackgroundPlaying) {
                // Mobil için arka plan sesini zorla başlat
                const playPromise = backgroundAudio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        bgIcon.textContent = '🔊';
                        isBackgroundPlaying = true;
                        console.log('Arka plan müziği başlatıldı');
                    }).catch(error => {
                        console.log('Arka plan müziği başlatılamadı:', error);
                        // Kullanıcıya manuel başlatma seçeneği sun
                        showBackgroundMusicPrompt();
                    });
                }
            }
        }, 100);
    }
}

// Arka plan müziği başlatma prompt'u
function showBackgroundMusicPrompt() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--primary-green);
        color: white;
        padding: 20px;
        border-radius: 15px;
        z-index: 1000;
        font-size: 16px;
        text-align: center;
        box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        max-width: 300px;
    `;
    message.innerHTML = `
        <p style="margin-bottom: 15px;">Arka plan müziği için izin gerekli</p>
        <button id="enableMusic" style="
            background: var(--gold);
            color: var(--primary-green);
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            margin-right: 10px;
        ">Müziği Başlat</button>
        <button id="skipMusic" style="
            background: transparent;
            color: white;
            border: 1px solid white;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
        ">Sessiz Devam Et</button>
    `;

    document.body.appendChild(message);

    document.getElementById('enableMusic').addEventListener('click', () => {
        backgroundAudio.play().then(() => {
            bgIcon.textContent = '🔊';
            isBackgroundPlaying = true;
            document.body.removeChild(message);
        }).catch(error => {
            console.log('Manuel başlatma da başarısız:', error);
        });
    });

    document.getElementById('skipMusic').addEventListener('click', () => {
        document.body.removeChild(message);
    });
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

// Yıldızlar oluşturma
function createStars() {
    const starsContainer = document.getElementById('starsContainer');
    const numberOfStars = 20;

    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.innerHTML = '✨';

        // Rastgele pozisyon
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';

        // Rastgele animasyon tipi
        const animations = ['', 'floating', 'pulse'];
        const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
        if (randomAnimation) {
            star.classList.add(randomAnimation);
        }

        // Rastgele gecikme
        star.style.animationDelay = Math.random() * 3 + 's';

        starsContainer.appendChild(star);
    }
}

// Dinamik yıldız ekleme (zikir yapıldığında)
function addDynamicStar() {
    const starsContainer = document.getElementById('starsContainer');
    const star = document.createElement('div');
    star.className = 'star floating';
    star.innerHTML = '⭐';

    // Butonun etrafında rastgele pozisyon
    const zikirBtn = document.getElementById('zikirButton');
    const rect = zikirBtn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Buton etrafında 150px yarıçapında rastgele pozisyon
    const angle = Math.random() * 2 * Math.PI;
    const radius = 100 + Math.random() * 100;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    star.style.left = x + 'px';
    star.style.top = y + 'px';
    star.style.position = 'fixed';
    star.style.fontSize = '16px';
    star.style.zIndex = '5';

    // Özel animasyon
    star.style.animation = 'float-twinkle 2s ease-out forwards';

    starsContainer.appendChild(star);

    // 2 saniye sonra yıldızı kaldır
    setTimeout(() => {
        if (starsContainer.contains(star)) {
            starsContainer.removeChild(star);
        }
    }, 2000);
}

// PWA Install Prompt
let deferredPrompt;
let installButton;

// PWA install prompt'u yakalama
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA install prompt yakalandı');
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
});

// Install button gösterme
function showInstallButton() {
    // Eğer zaten install button yoksa oluştur
    if (!installButton) {
        installButton = document.createElement('button');
        installButton.innerHTML = '<span style="filter: invert(1);">📱</span>';
        installButton.className = 'control-btn install-btn';
        installButton.title = 'Uygulamayı Yükle';

        installButton.addEventListener('click', installPWA);
        document.getElementById('pwaInstallButton').appendChild(installButton);

        // 10 saniye sonra gizle
        setTimeout(() => {
            if (installButton && installButton.parentNode) {
                installButton.style.opacity = '0.6';
            }
        }, 10000);
    }
}

// PWA yükleme fonksiyonu
async function installPWA() {
    if (!deferredPrompt) {
        console.log('Install prompt mevcut değil');
        return;
    }

    // Install prompt'u göster
    const result = await deferredPrompt.prompt();
    console.log('Install prompt sonucu:', result);

    if (result.outcome === 'accepted') {
        console.log('Kullanıcı PWA yüklemeyi kabul etti');
        hideInstallButton();
    } else {
        console.log('Kullanıcı PWA yüklemeyi reddetti');
    }

    deferredPrompt = null;
}

// Install button'u gizleme
function hideInstallButton() {
    if (installButton && installButton.parentNode) {
        installButton.style.animation = 'fadeOut 0.5s ease-out forwards';
        setTimeout(() => {
            if (installButton && installButton.parentNode) {
                document.body.removeChild(installButton);
                installButton = null;
            }
        }, 500);
    }
}

// PWA yüklendiğinde
window.addEventListener('appinstalled', (evt) => {
    console.log('PWA başarıyla yüklendi');
    hideInstallButton();

    // Teşekkür mesajı göster
    showInstallSuccessMessage();
});

// Install başarı mesajı
function showInstallSuccessMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--primary-green);
        color: var(--gold);
        padding: 20px 30px;
        border-radius: 15px;
        z-index: 1000;
        font-size: 16px;
        text-align: center;
        box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        animation: slideInUp 0.5s ease-out;
    `;
    message.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 10px;">🎉</div>
        <div>Zikr-i Zeynep ana ekrana eklendi!</div>
        <div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">Artık offline da kullanabilirsiniz</div>
    `;

    document.body.appendChild(message);

    setTimeout(() => {
        message.style.animation = 'fadeOut 0.5s ease-out forwards';
        setTimeout(() => {
            if (document.body.contains(message)) {
                document.body.removeChild(message);
            }
        }, 500);
    }, 3000);
}

// CSS animasyonları
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.8); }
    }
    
    @keyframes slideInUp {
        from { 
            opacity: 0; 
            transform: translate(-50%, -50%) translateY(20px); 
        }
        to { 
            opacity: 1; 
            transform: translate(-50%, -50%) translateY(0); 
        }
    }
    
    .install-btn {
        transition: all 0.3s ease !important;
    }
    
    .install-btn:hover {
        transform: scale(1.1) !important;
        background: var(--gold) !important;
        color: var(--primary-green) !important;
    }
`;
document.head.appendChild(style);

// Uygulama başlatma
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    createStars();
});

// Hata yakalama
window.addEventListener('error', (e) => {
    console.log('Hata:', e.error);
});

// Service Worker kaydı (gelecekte offline kullanım için)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// API URL'ini tanımla
const API_URL = 'https://zikr-i-zeynep-api.vercel.app';

// Bugünün tıklama sayısını getir
async function getTodayClicks() {
    try {
        const response = await fetch(`${API_URL}/clicks/today`);
        const data = await response.json();
        console.log(`Bugünün tıklama sayısı: ${data.count}`);
        return data.count;
    } catch (error) {
        console.error('Tıklama sayısı alınamadı:', error);
        return 0;
    }
}

// Tıklama sayısını artır
async function incrementClicks() {
    try {
        const response = await fetch(`${API_URL}/clicks/increment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        console.log(`Yeni tıklama sayısı: ${data.count}`);
        return data.count;
    } catch (error) {
        console.error('Tıklama artırılamadı:', error);
        return null;
    }
}

// Belirli tarihin tıklama sayısını getir
async function getTotalClicks() {
    try {
        const response = await fetch(`${API_URL}/clicks/total`);
        const data = await response.json();
        console.log(`Toplam tıklama sayısı: ${data.total}`);
        return data.total;
    } catch (error) {
        console.error('Tıklama sayısı alınamadı:', error);
        return 0;
    }
}
