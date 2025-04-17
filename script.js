document.addEventListener('DOMContentLoaded', () => {
    // عناصر DOM
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const cardsGrid = document.getElementById('cards-grid');
    const timeDisplay = document.getElementById('time');
    const attemptsDisplay = document.getElementById('attempts');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    
    // إعدادات اللعبة
    const cardSymbols = {
        easy: ['🍎', '🍌', '🍒', '🍓', '🍊', '🍋', '🍉', '🍇'],
        medium: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🦁', '🐮', '🐷', '🐸'],
        hard: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛴', '🚲', '🛵']
    };
    
    // حالة اللعبة
    let gameState = {
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        attempts: 0,
        time: 0,
        timer: null,
        difficulty: 'easy',
        totalPairs: 8
    };
    
    // أحداث الصعوبة
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.difficulty = btn.dataset.level;
        });
    });
    
    // حدث بدء اللعبة
    startBtn.addEventListener('click', () => {
        startScreen.style.display = 'none';
        gameScreen.style.display = 'block';
        initGame();
    });
    
    // حدث إعادة التشغيل
    restartBtn.addEventListener('click', initGame);
    
    // تهيئة اللعبة
    function initGame() {
        // إعادة تعيين الحالة
        clearInterval(gameState.timer);
        gameState = {
            ...gameState,
            cards: [],
            flippedCards: [],
            matchedPairs: 0,
            attempts: 0,
            time: 0,
            timer: null
        };
        
        // تحديد عدد الأزواج حسب الصعوبة
        switch(gameState.difficulty) {
            case 'easy':
                gameState.totalPairs = 8;
                break;
            case 'medium':
                gameState.totalPairs = 12;
                break;
            case 'hard':
                gameState.totalPairs = 16;
                break;
        }
        
        // تحديث العرض
        updateDisplay();
        
        // إنشاء البطاقات
        createCards();
    }
    
    // إنشاء البطاقات
    function createCards() {
        cardsGrid.innerHTML = '';
        
        // تحديد حجم الشبكة حسب الصعوبة
        let gridColumns;
        switch(gameState.difficulty) {
            case 'easy':
                gridColumns = 'repeat(4, 1fr)';
                break;
            case 'medium':
                gridColumns = 'repeat(6, 1fr)';
                break;
            case 'hard':
                gridColumns = 'repeat(8, 1fr)';
                break;
        }
        cardsGrid.style.gridTemplateColumns = gridColumns;
        
        // إنشاء البطاقات
        const symbols = cardSymbols[gameState.difficulty].slice(0, gameState.totalPairs);
        const gameCards = [...symbols, ...symbols];
        const shuffledCards = shuffleArray(gameCards);
        
        shuffledCards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.index = index;
            card.dataset.symbol = symbol;
            
            const front = document.createElement('div');
            front.className = 'front';
            front.textContent = symbol;
            
            const back = document.createElement('div');
            back.className = 'back';
            
            card.appendChild(front);
            card.appendChild(back);
            
            card.addEventListener('click', () => flipCard(card));
            cardsGrid.appendChild(card);
            gameState.cards.push(card);
        });
    }
    
    // خلط البطاقات
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    // قلب البطاقة
    function flipCard(card) {
        // لا تفعل شيئا إذا كانت البطاقة مقلوبة أو مطابقة
        if (card.classList.contains('flipped') || 
            card.classList.contains('matched') || 
            gameState.flippedCards.length >= 2) {
            return;
        }
        
        // بدء المؤقت إذا كانت هذه هي المحاولة الأولى
        if (!gameState.timer) {
            startTimer();
        }
        
        // قلب البطاقة
        card.classList.add('flipped');
        gameState.flippedCards.push(card);
        
        // إذا كان هناك بطاقتين مقلوبتين
        if (gameState.flippedCards.length === 2) {
            gameState.attempts++;
            updateDisplay();
            checkForMatch();
        }
    }
    
    // التحقق من التطابق
    function checkForMatch() {
        const [card1, card2] = gameState.flippedCards;
        const isMatch = card1.dataset.symbol === card2.dataset.symbol;
        
        if (isMatch) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            gameState.matchedPairs++;
            gameState.flippedCards = [];
            
            // تحقق إذا انتهت اللعبة
            if (gameState.matchedPairs === gameState.totalPairs) {
                endGame();
            }
        } else {
            // إخفاء البطاقات بعد ثانية
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                gameState.flippedCards = [];
            }, 1000);
        }
    }
    
    // بدء المؤقت
    function startTimer() {
        gameState.timer = setInterval(() => {
            gameState.time++;
            updateDisplay();
        }, 1000);
    }
    
    // تحديث العرض
    function updateDisplay() {
        const minutes = Math.floor(gameState.time / 60).toString().padStart(2, '0');
        const seconds = (gameState.time % 60).toString().padStart(2, '0');
        timeDisplay.textContent = `${minutes}:${seconds}`;
        attemptsDisplay.textContent = gameState.attempts;
    }
    
    // إنهاء اللعبة
    function endGame() {
        clearInterval(gameState.timer);
        setTimeout(() => {
            alert(`تهانينا! لقد أكملت اللعبة في ${timeDisplay.textContent} وبـ ${gameState.attempts} محاولة.`);
        }, 500);
    }
    
    // بدء اللعبة عند التحميل
    initGame();
});