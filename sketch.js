// Game state management
let gameState = 'START_SCREEN'; // START_SCREEN, INTRO_STORY, MOVING, PROMPT, SCENE_INTRO, ASKING, ANSWERED, FINALE_PRELUDE, FINALE, SCENE_DIALOGUE
let finaleCatchCount = 0; // 結局抓捕計數
let screenShake = 0; // 畫面震動計時器
let projectiles = []; // 儲存發射物
let clones = []; // 儲存分身
let playerAmmo = 5; // 玩家彈藥
let lastAmmoReloadTime = 0; // 彈藥裝填計時
let currentDialogueLines = []; // 對話內容
let currentDialogueIndex = 0; // 對話進度
let dialogueCharIndex = 0; // 新增：打字機效果索引
let lastDialogueTypeTime = 0; // 新增：上次打字時間
let optionButtons = []; // 存放選項按鈕區域
let showHowToPlay = false; // 是否顯示玩法介紹
let showAbout = false; // 是否顯示遊戲主旨
let showFinaleInstructions = false; // 新增：結局玩法提示開關
let startScreenParticles = []; // 開始畫面粒子
let swapParticles = []; // 交換特效粒子
let bgMusic;      // 新增：背景音樂變數 (檔案載入用)
let answerMusic;  // 新增：問答音樂
let fightMusic;   // 新增：戰鬥音樂
let correctSound; // 新增：答對音效
let wrongSound;   // 新增：答錯音效
let switchSound;  // 新增：交換音效
let dropSound;    // 新增：掉落音效
let zzzSound;     // 新增：電流音效
let alarmSound;   // 新增：警報音效
let mjMusic;      // 新增：MJ.mp3
let tfSound;      // 新增：TF.mp3
let ydSound;      // 新增：YD.mp3
let volumeLevel = 0.2; // 音量控制變數 (預設 20%，讓滑桿有空間可調低)
let usaBg, twBg, btcBg; // 新增：對話場景背景
let shockwaves = []; // 新增：衝擊波特效陣列
let isForcedReturn = false; // 新增：是否處於強制返回狀態
let returnTargetQ = null; // 新增：強制返回的目標提問者
let isChasingPlayer = false; // 新增：是否處於夢幻追逐玩家狀態
let bgAspectRatio = 0; // 優化：快取背景長寬比
let bgDrawWidth = 0;   // 優化：快取背景繪製寬度
let finaleQuestionsPool = []; // 新增：儲存本局已出現(答對)的題目

// --- 新增：結局問答與血條變數 ---
let finaleQuizActive = false;
let finaleQuizTimer = 0;
let finaleQuizEndTime = 0;
let finaleQuestion = null;
let finaleQuizOptions = [];
let playerMaxHealth = 5;
let playerCurrentHealth = 5;
let mewMaxHealth = 3;
let showFinaleBurst = false; // 新增：控制結局爆發階段
let finaleBurstData = {
  dialogueIndex: 0,
  charIndex: 0,
  lastTypeTime: 0,
  lines: [
    { speaker: "Pikachu", name: "皮卡丘", text: "終於...要抓到你了" },
    { speaker: "Mew", name: "夢幻(幕後黑手)", text: "可惡 我準備了這麼久...怎麼能就此失敗" },
    { speaker: "System", name: "", text: "夢幻暴發了驚人的能量 出現了許多分身" },
    { speaker: "Mew", name: "夢幻群", text: "哈哈 來試試看打倒我吧" }
  ]
};

let introData = {
  startTime: 0,
  dialogueIndex: 0,
  playedFalling: false,
  playedShatter: false,
  playedAlarm: false, // 新增：警報播放標記
  charIndex: 0, // 當前打字進度
  lastTypeTime: 0, // 上次打字時間
  showSkip: false, // 是否顯示跳過按鈕
  lines: [
    { speaker: "Mew", name: "夢幻(管家)", text: "不好了 冷錢包被破壞了" },
    { speaker: "Pikachu", name: "皮卡丘", text: "有看到是誰嗎" },
    { speaker: "Mew", name: "夢幻(管家)", text: "我只看到一個黑影閃過" },
    { speaker: "Pikachu", name: "皮卡丘", text: "資產還好嗎" },
    { speaker: "Mew", name: "夢幻(管家)", text: "應該沒事 竊賊肯定是沒有找到助記詞也沒有私鑰 無法轉移資產 所以把他給毀了" },
    { speaker: "Pikachu", name: "皮卡丘", text: "那還好 只要用助記詞重新取回控制權就好" },
    { speaker: "Mew", name: "夢幻(管家)", text: "我記得你為了安全把助記詞分別放在三位守護者那裏 這裡有新的冷錢包 快去拿回助記詞並重新掌控吧 我會在旁邊幫你的" }
  ]
};

let preludeData = {
  startTime: 0,
  dialogueIndex: 0,
  charIndex: 0,
  lastTypeTime: 0,
  playedAttack: false,
  lines: [
    { speaker: "Pikachu", name: "皮卡丘", text: "終於集齊了所有碎片..." },
    { speaker: "Pikachu", name: "皮卡丘", text: "只要輸入到這個新的冷錢包，資產就能回來了！" },
    { speaker: "System", name: "系統", text: "(正在驗證助記詞...)" },
    { speaker: "Unknown", name: "???", text: "這個冷錢包我就收下了！" }, 
    { speaker: "Pikachu", name: "皮卡丘", text: "嗚哇！(冷錢包被奪走了)" },
    { speaker: "Mew", name: "夢幻(幕後黑手)", text: "嘻嘻嘻... 真是辛苦你了。" },
    { speaker: "Pikachu", name: "皮卡丘", text: "夢幻？ 為什麼是你？" },
    { speaker: "Mew", name: "夢幻(幕後黑手)", text: "我花了這麼多時間接近你就是為了這一天。" },
    { speaker: "Mew", name: "夢幻(幕後黑手)", text: "本還想要偷偷拿走註記詞沒想到你交給了守護者 沒辦法 只好把原本的冷錢包毀了逼你拿回註記詞"},
    { speaker: "Mew", name: "夢幻(幕後黑手)", text: "現在跟你的資產說再見吧！" },
    { speaker: "Pikachu", name: "皮卡丘", text: "我絕對不會讓你得逞的！" }
  ]
};

let finaleData = {
  dialogueIndex: 0,
  charIndex: 0,
  lastTypeTime: 0,
  lines: [
    { speaker: "Pikachu", name: "皮卡丘", text: "終於... 抓到你了！" },
    { speaker: "Mew", name: "夢幻(幕後黑手)", text: "沒想到還是打不過... 你的知識太充裕了..." },
    { speaker: "Pikachu", name: "皮卡丘", text: "快把冷錢包還來！" },
    { speaker: "System", name: "系統", text: "(檢測到完整的助記詞... 正在恢復權限...)" },
    { speaker: "System", name: "系統", text: "權限恢復成功！資產已安全。" },
    { speaker: "Pikachu", name: "皮卡丘", text: "太好了！之後得好好小心了任何人只要有註記詞就能奪走你我的資產。" }
  ]
};

let badEndingData = {
  dialogueIndex: 0,
  charIndex: 0,
  lastTypeTime: 0,
  lines: [
    { speaker: "Mew", name: "夢幻(幕後黑手)", text: "哼哼哼... 真是太弱了。" },
    { speaker: "Mew", name: "夢幻(幕後黑手)", text: "既然你沒有能力守護，這些資產我就全部收下了！" },
    { speaker: "Pikachu", name: "皮卡丘", text: "不...！我的一切..." },
    { speaker: "System", name: "系統", text: "(警告：資產正在被強制轉移...)" },
    { speaker: "System", name: "系統", text: "(轉移完成。錢包餘額：0)" },
    { speaker: "Mew", name: "夢幻(幕後黑手)", text: "這就是弱肉強食的世界。永別了。" }
  ]
};

let transition = {
  active: false,
  state: 'IN', // 'IN', 'HOLD', 'OUT'
  progress: 0,
  speed: 0.02,
  holdTimer: 0,
  nextState: null // 用於儲存轉場後的目標狀態
};
let recoveryState = 'NONE'; // NONE, DIALOGUE, DONE
let recoveryStartTime = 0;

// 角色物件
let player;
let savedMapPos = { x: 0, y: 0 }; // 儲存玩家在進入房間前的地圖位置
let questioners = [];
let hintGiver;
let playerSpeech = null; // 用於儲存玩家的對話
let hintGiverSpeech = null;
let questionPrompt = null;// 用於儲存提示者的對話
// 圖片資源
let playerStandSprite;
let playerMoveSprite;
let playerRightSprite;
let playerWrongSprite;
let q1Sprite;
let q2Sprite;
let q3Sprite;
let hintGiverSprite;
let bgImage; // 背景圖片

// 角色縮放比例
const playerScale = 2.5;
const questionerScale = 4.0; // 將提問者放大

// 互動與問答相關變數
let activeQuestioner = null;
let currentQuestion = null;
let feedbackMessage = '';
let feedbackTimer = 0;
let hintTimer = 0; // 提示顯示計時器
let closeButton = {}; // 用於存放關閉按鈕的屬性
let hintButton = {}; // 用於存放提示按鈕的屬性
let yesButton = {}; // 存放 '是' 按鈕屬性
let noButton = {}; // 存放 '否' 按鈕屬性
let playAgainYesButton = {}; // 存放 '再玩一次' 的 '是' 按鈕
let playAgainNoButton = {}; // 存放 '再玩一次' 的 '否' 按鈕

// 攝影機/視角 物件
let camera = { x: 0, y: 0 };
let moonwalkMode = false; // 預設為一般模式，按下 M 鍵切換

// 提問者反應文字
const correctPhrases = ["！", "很好"];
const wrongPhrases = ["行不行啊。", "菜就多練。", "真失望。"];

// --- 新增：星空效果物件 ---
let celestialEffect = {
  isActive: false,
  particles: [],
  x: 0, y: 0, radius: 250,
  finaleStartTime: 0, // 用於結局動畫計時
  isFrozen: false, // 用於結局靜止
  isExpanding: false // 用於控制黑色擴散轉場
};
/**
 * p5.js 的 preload 函數，在 setup() 之前執行
 * 用於預先載入所有外部資源 (例如圖片、聲音、字體)
 * 確保資源在程式開始時就已準備就緒
 */
function preload() {
  // 載入玩家圖片
  playerStandSprite = loadImage('stand/00.png'); // 靜止 (79x39, 2幀)
  playerMoveSprite = loadImage('move/00.png');   // 移動 (163x39, 4幀)
  playerRightSprite = loadImage('right/00.png'); // 答對 (81x40, 2幀)
  playerWrongSprite = loadImage('roung/00.png'); // 答錯 (85x38, 2幀)

  // 載入提問者圖片
  q1Sprite = loadImage('Q1/00.png'); // 91x23, 4幀
  q2Sprite = loadImage('Q2/00.png'); // 83x20, 4幀
  q3Sprite = loadImage('Q3/00.png'); // 175x24, 6幀
  hintGiverSprite = loadImage('AN/00.png'); // 提示者 (291x31, 8幀)

  // 載入背景圖片
  bgImage = loadImage('origbig.png');
  usaBg = loadImage('USA.png');   // 伊布背景
  twBg = loadImage('TW.png');      // 小火龍背景
  btcBg = loadImage('BTC.png');   // 傑尼龜背景

  // --- 新增：聲音載入框架 (請將檔案放入 assets 資料夾並修改檔名) ---
  // 請確認您的資料夾內有 assets 資料夾，且裡面有對應的檔案
  bgMusic = loadSound('assets01/bgm.mp3'); // 背景音樂，請將檔案命名為 bgm.mp3
  answerMusic = loadSound('assets01/answer.mp3'); // 問答音樂
  fightMusic = loadSound('assets04/fight.mp3');   // 戰鬥音樂
  correctSound = loadSound('assets01/correct.mp3'); // 答對音效
  wrongSound = loadSound('assets04/incorrect.mp3'); // 答錯音效
  switchSound = loadSound('assets03/switch.mp3');   // 交換音效
  dropSound = loadSound('assets02/drop.mp3');       // 掉落音效
  zzzSound = loadSound('assets03/zzz.mp3');         // 電流音效
  alarmSound = loadSound('assets01/alarm.mp3');     // 警報音效
  mjMusic = loadSound('assets04/MJ.mp3');           // MJ.mp3
  tfSound = loadSound('assets03/TF.mp3');           // TF.mp3
  ydSound = loadSound('assets03/YD.mp3');           // YD.mp3
  // -------------------------------------------------------
}

/**
 * p5.js 的 setup 函數，只會在程式開始時執行一次
 * 用於初始化設定，例如畫布大小、物件初始狀態等
 */
function setup() {
  createCanvas(windowWidth, windowHeight); // 創建全螢幕畫布

  // 禁用右鍵選單，以便使用右鍵功能
  document.oncontextmenu = () => false;

  // 初始化提示者物件
  hintGiver = {
    x: 150, // 固定在螢幕左側 150px 的位置
    y: height - 80, // 固定在螢幕下方 80px 的位置
    img: hintGiverSprite,
    w: 291 / 8,
    h: 31,
    totalFrames: 8,
    currentFrame: 0,
    frameDelay: 10,
    scale: 3.0
    ,
    speedX: 2.0, // 再次提高夢幻的基礎速度
    speedY: 1.5 // 再次提高夢幻的基礎速度
  };


  // 初始化提問者物件陣列
  questioners.push({
    id: 'q1', // 傑尼龜 (台股)
    x: -1200,
    y: height * 0.8, // 調整至草地附近
    reaction: null, // 'correct' 或 'wrong'
    reactionText: '', // 儲存反應文字
    correctAnswersCount: 0, // 追蹤此提問者被答對的次數
    cooldownUntil: 0, // 互動冷卻計時器
    img: q1Sprite,
    w: 91 / 4,
    h: 23,
    totalFrames: 4,
    currentFrame: 0,
    frameDelay: 15,
    questions: [...twStockQuestions] // 分配台股題庫
  });
  questioners.push({
    id: 'q2', // 小火龍 (加密貨幣)
    x: 1300,
    y: height * 0.8, // 調整至草地附近
    reaction: null,
    reactionText: '',
    correctAnswersCount: 0,
    cooldownUntil: 0,
    img: q2Sprite,
    w: 83 / 4,
    h: 20,
    totalFrames: 4,
    currentFrame: 0,
    frameDelay: 15,
    questions: [...cryptoQuestions] // 分配加密貨幣題庫
  });
  questioners.push({
    id: 'q3', // 伊布 (美股)
    x: 100,
    y: height * 0.85, // 移到畫面更下方
    reaction: null,
    reactionText: '',
    correctAnswersCount: 0,
    cooldownUntil: 0,
    img: q3Sprite,
    w: 175 / 6,
    h: 24,
    totalFrames: 6,
    currentFrame: 0,
    frameDelay: 12,
    questions: [...usStockQuestions] // 分配美股題庫
  });

  // --- 計算提問者的中心點來設定玩家初始位置 ---
  let centerX = 0;
  let centerY = 0;
  for (let q of questioners) {
    centerX += q.x;
    centerY += q.y;
  }
  centerX /= questioners.length;
  centerY /= questioners.length;

  // 初始化玩家物件
  player = {
    x: centerX,
    y: centerY - 100, 
    speed: 4, // 稍微降低玩家移動速度
    isMoving: false,
    direction: -1, // -1 表示向左, 1 表示向右 (預設朝左)
    feedbackState: null, // 'correct' 或 'wrong'
    // 動畫相關屬性
    animation: {
      stand: {
        img: playerStandSprite,
        w: 79 / 2,  // 39.5
        h: 39,
        totalFrames: 2
      },
      move: {
        img: playerMoveSprite,
        w: 163 / 4, // 40.75
        h: 39,
        totalFrames: 4
      },
      right: {
        img: playerRightSprite,
        w: 81 / 2,
        h: 40,
        totalFrames: 2
      },
      wrong: {
        img: playerWrongSprite,
        w: 85 / 2,
        h: 38,
        totalFrames: 2
      },
      currentFrame: 0,
      frameDelay: 10 // 每 10 個繪圖幀更新一次動畫
    }
  };

  // --- 優化：初始化背景尺寸快取 ---
  bgAspectRatio = bgImage.width / bgImage.height;
  bgDrawWidth = height * bgAspectRatio;

  // --- 優化：預先初始化開始畫面粒子 ---
  for (let i = 0; i < 50; i++) {
    startScreenParticles.push({
      x: random(width),
      y: random(height),
      size: random(2, 8),
      speed: random(0.5, 2),
      alpha: random(50, 150)
    });
  }
}

/**
 * p5.js 的 draw 函數，會以每秒約 60 次的頻率不斷重複執行
 * 所有動畫、互動和繪圖都發生在這裡
 */
function draw() {
  manageBackgroundMusic(); // 管理背景音樂播放狀態

  // 如果是開始畫面
  if (gameState === 'START_SCREEN') {
    drawStartScreen();
    if (transition.active) drawTransition();
    drawVolumeControl();
    return;
  }

  // --- 新增：前導故事動畫 ---
  if (gameState === 'INTRO_STORY') {
    drawIntroStory();
    if (transition.active) drawTransition();
    return;
  }

  // --- 新增：結局前導動畫 (幕後黑手現身) ---
  if (gameState === 'FINALE_PRELUDE') {
    drawFinalePrelude();
    return;
  }

  // 如果是結局狀態，執行獨立的繪圖邏輯
  if (gameState === 'FINALE') {
    drawFinale();
    return;
  }

  // --- 新增：壞結局對話 ---
  if (gameState === 'BAD_ENDING') {
      drawBadEnding();
      return;
  }

  // --- 新增：Game Over ---
  if (gameState === 'GAME_OVER') {
      drawGameOver();
      return;
  }
  
  // 如果是室內場景狀態 (問答或對話)
  if (gameState === 'SCENE_DIALOGUE' || gameState === 'SCENE_INTRO' || gameState === 'ASKING' || gameState === 'ANSWERED') {
    drawRoomEnvironment(); // 繪製背景和角色

    if (gameState === 'SCENE_DIALOGUE' || gameState === 'SCENE_INTRO') {
      // 確保索引在範圍內才繪製對話框，避免 undefined
      if (currentDialogueIndex < currentDialogueLines.length) {
        drawDialogueBox();
      }
    } else if (gameState === 'ASKING') {
      displayQuestion();
      displayTimedHint();
    } else if (gameState === 'ANSWERED') {
      displayFeedback();
    }
    // 確保在此狀態下也能執行並繪製轉場動畫，否則對話結束後會卡住
    if (transition.active) drawTransition();
    return;
  }

  // --- 更新攝影機 ---
  // 讓攝影機的 x 位置平滑地跟隨玩家，創造出玩家在畫面中央，背景移動的效果
  // lerp(start, stop, amt) 計算兩點之間的線性內插值
  camera.x = lerp(camera.x, player.x - width / 2, 0.1);

  // --- 繪製世界 (會隨攝影機移動的物件) ---
  background(210, 240, 255); // 先畫一個底色，以防圖片沒填滿
  push();
  translate(-camera.x, 0); // 將整個畫布根據攝影機位置進行平移
  
  // --- 繪製背景 ---
  // --- 實現無限滾動背景 ---
  // 1. 計算攝影機在一個背景寬度內的相對偏移量
  const offsetX = camera.x % bgDrawWidth;
  // 2. 根據偏移量，計算第一個背景圖的起始繪製位置
  const startX = camera.x - offsetX;
  
  // 3. 繪製多張背景圖以填滿畫面，並確保無縫銜接
  imageMode(CORNER);
  image(bgImage, startX - bgDrawWidth, 0, bgDrawWidth, height); // 繪製在當前畫面左側的圖
  image(bgImage, startX, 0, bgDrawWidth, height);               // 繪製在當前畫面的圖
  image(bgImage, startX + bgDrawWidth, 0, bgDrawWidth, height); // 繪製在當前畫面右側的圖

  // 繪製所有角色 (他們的位置是世界座標，會被 translate 影響)
  drawPlayer();
  drawQuestioners();

  // --- 新增：繪製星空效果 ---
  // 修改：只有在非擴散狀態下，才在世界層繪製 (擴散時移到 UI 層以覆蓋夢幻)
  if (celestialEffect.isActive && !celestialEffect.isExpanding) {
    drawCelestialEffect();
  }

  pop(); // 恢復畫布，讓接下來的 UI 不會被攝影機移動影響

  // --- 繪製 UI (固定在螢幕上的物件) ---

  // 將提示者移到 UI 層繪製，使其固定在螢幕上
  moveHintGiver(); // 更新提示者的位置
  drawHintGiver();

  // --- 新增：擴散時的星空效果 (覆蓋夢幻) ---
  if (celestialEffect.isActive && celestialEffect.isExpanding) {
    push();
    translate(-camera.x, 0); // 配合世界座標
    drawCelestialEffect();
    pop();
  }

  // 根據遊戲狀態執行不同邏輯
  if (gameState === 'MOVING') {
    movePlayer();
    checkInteractions();
    drawHUD(); // 繪製寶石蒐集介面
  } else if (gameState === 'PROMPT') {
    // 在地圖上顯示詢問框，停止玩家移動
    drawHUD();
    displayPrompt();
  }

  // --- 檢查是否在星雲內並顯示勝利畫面 ---
  if (celestialEffect.isActive) {
    const playerDist = dist(player.x, player.y, celestialEffect.x, celestialEffect.y);
    // 當玩家進入圈圈時，觸發擴散
    if (playerDist < celestialEffect.radius && !celestialEffect.isExpanding) {
      celestialEffect.isExpanding = true;
    }

    // 處理黑色擴散轉場
    if (celestialEffect.isExpanding) {
      celestialEffect.radius += 30; // 擴散速度
      if (celestialEffect.radius > width * 2) { // 確保覆蓋全螢幕
        startFinalePrelude();
        celestialEffect.isActive = false;
      }
    }
  }

  // 如果轉場動畫正在進行，繪製轉場
  if (transition.active) drawTransition();

  // --- 繪製音量控制 (最上層) ---
  drawVolumeControl();
}

/**
 * --- 優化：通用動畫幀更新函式 ---
 */
function updateFrame(obj, totalFrames) {
  if (frameCount % obj.frameDelay === 0) {
    obj.currentFrame = (obj.currentFrame + 1) % totalFrames;
  }
}

/**
 * 繪製玩家角色
 */
function drawPlayer() {
  let anim;
  // 1. 優先檢查玩家是否有回饋狀態 (無論遊戲狀態為何)
  if (player.feedbackState) {
    if (player.feedbackState === 'correct') {
      anim = player.animation.right;
    } else {
      anim = player.animation.wrong;
    }
  // 2. 檢查是否在左右移動 (且不在問答中)
  } else if (gameState === 'MOVING' && (keyIsDown(65) || keyIsDown(68))) { // A or D
    anim = player.animation.move;
  // 3. 最後才是靜止狀態
  } else { 
    anim = player.animation.stand;
  }

  // 更新動畫幀 (只有在移動或站立動畫有多幀時才有效果)
  updateFrame(player.animation, anim.totalFrames);

  // 計算目前要顯示的影格在圖片中的 x 座標
  let frameX = player.animation.currentFrame * anim.w;

  // 使用 image() 的裁切功能來繪製單一影格
  imageMode(CENTER); // 這裡的模式只影響這個函式內部
  
  push(); // 保存當前的繪圖狀態
  translate(player.x, player.y); // 將座標原點移動到玩家中心
  
  // 只有在使用側面行走動畫時，才需要根據方向翻轉圖片
  if (player.direction !== 0) { 
    let scaleX = player.direction;
    if (moonwalkMode) {
      scaleX *= -1; // 按下 M 時圖片交換 (反轉)
    }
    scale(scaleX, 1); 
  }

  image(anim.img, 0, 0, anim.w * playerScale, anim.h * playerScale, frameX, 0, anim.w, anim.h);
  pop(); // 恢復繪圖狀態

  // --- 繪製玩家對話框 ---
  if (playerSpeech && gameState === 'MOVING') {
    fill(255);
    stroke(0);
    strokeWeight(2);
    rectMode(CENTER);
    textAlign(CENTER, CENTER);
    textSize(16);

    let textW = textWidth(playerSpeech) + 20;
    let textH = 40;
    // 將對話框放在玩家頭頂
    let bubbleX = player.x;
    let bubbleY = player.y - (anim.h * playerScale / 2) - 30;

    rect(bubbleX, bubbleY, textW, textH, 10);

    noStroke();
    fill(0);
    text(playerSpeech, bubbleX, bubbleY);
  }
}

/**
 * 繪製所有提問者
 */
function drawQuestioners() {
  imageMode(CENTER);
  rectMode(CENTER); // 確保告示牌繪製正確
  textAlign(CENTER, CENTER);

  for (let q of questioners) {
    // 更新每個提問者自己的動畫幀
    updateFrame(q, q.totalFrames);

    let frameX = q.currentFrame * q.w;
    let drawX = q.x;
    let drawY = q.y;

    // --- 繪製角色頭頂標籤 (特效版) ---
    push();
    textAlign(CENTER, BOTTOM);
    textSize(22);
    textStyle(BOLD);
    
    let label = "";
    let labelColor;
    let glowColor;

    if (q.id === 'q1') {
        label = "台股森林捍衛者";
        labelColor = color(50, 205, 50); // 森林綠
        glowColor = 'rgba(50, 205, 50, 0.8)';
    } else if (q.id === 'q2') {
        label = "加密裂縫主宰者";
        labelColor = color(255, 215, 0); // 龐克金
        glowColor = 'rgba(255, 215, 0, 0.8)';
    } else if (q.id === 'q3') {
        label = "美股藍洞守護者";
        labelColor = color(0, 191, 255); // 深海藍
        glowColor = 'rgba(0, 191, 255, 0.8)';
    }

    // 浮動特效
    let floatOffset = sin(frameCount * 0.05 + q.x) * 5;

    // 發光特效
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = glowColor;

    fill(labelColor);
    stroke(0, 150); // 增加深色邊框以確保可讀性
    strokeWeight(3);
    
    text(label, q.x, q.y - (q.h * questionerScale / 2) - 20 + floatOffset);
    
    drawingContext.shadowBlur = 0; // 重置
    pop();

    // --- 提問者反應動畫 ---
    // 只有在答題回饋階段，且是當前的提問者，才執行反應動畫
    if (q.reaction) { // 只要有反應狀態就執行
      if (q.reaction === 'correct') {
        // 開心反應：上下跳動
        drawY += sin(frameCount * 0.5) * 5;
      } else if (q.reaction === 'wrong') {
        // 失望反應：左右搖晃
        drawX += sin(frameCount * 0.8) * 5;
      }
    }

    // 如果此提問者已被答對三次，就將它變灰
    if (q.correctAnswersCount >= 3) {
      push();
      tint(150, 150); // 套用灰色濾鏡
      image(q.img, drawX, drawY, q.w * questionerScale, q.h * questionerScale, frameX, 0, q.w, q.h);
      pop();
    } else {
      image(q.img, drawX, drawY, q.w * questionerScale, q.h * questionerScale, frameX, 0, q.w, q.h);
    }

    // --- 繪製反應文字對話框 ---
    drawReactionText(q);

  }
}

/**
 * 繪製提問者的反應文字
 * @param {object} q - The questioner object.
 */
function drawReactionText(q) {
  if (!q.reactionText) return;

  const bubbleX = q.x;
  const bubbleY = q.y - (q.h * questionerScale / 2) - 40; // 統一放在頭頂
  const textContent = q.reactionText;
  
  push(); // 隔離樣式設定

  // 如果是答對的反應，使用新的、更華麗的對話框
  if (q.reaction === 'correct') {
    textSize(18);
    textStyle(BOLD);
    const textW = textWidth(textContent) + 30;
    const textH = 50;

    // 繪製外框
    fill(255, 250, 205); // 檸檬雪紡色
    stroke(255, 215, 0); // 金色
    strokeWeight(3);
    rectMode(CENTER);
    rect(bubbleX, bubbleY, textW, textH, 15);

    // 繪製文字
    noStroke();
    fill(50); // 深灰色文字
    textAlign(CENTER, CENTER); // 確保文字置中
    text(textContent, bubbleX, bubbleY);
  } else { // 其他反應 (例如答錯、放棄) 使用原本的普通對話框
    textSize(16);
    const textW = textWidth(textContent) + 30;
    const textH = 50;

    fill(255);
    stroke(0);
    strokeWeight(2);
    rectMode(CENTER);
    rect(bubbleX, bubbleY, textW, textH - 10, 10);
    noStroke();
    fill(0);
    textAlign(CENTER, CENTER); // 確保文字置中
    text(textContent, bubbleX, bubbleY);
  }
  pop();
}
/**
 * 繪製提示者
 */
function drawHintGiver() {
  imageMode(CENTER);
  // 更新動畫幀
  updateFrame(hintGiver, hintGiver.totalFrames);

  let frameX = hintGiver.currentFrame * hintGiver.w;
  image(hintGiver.img, hintGiver.x, hintGiver.y, hintGiver.w * hintGiver.scale, hintGiver.h * hintGiver.scale, frameX, 0, hintGiver.w, hintGiver.h);

  // --- 繪製提示者對話框 ---
  if (hintGiverSpeech) {
    fill(255);
    stroke(0);
    strokeWeight(2);
    rectMode(CENTER);
    textAlign(CENTER, CENTER);
    textSize(16);

    let textW = textWidth(hintGiverSpeech) + 20;
    let textH = 40;
    // 將對話框放在夢幻頭頂
    let bubbleX = hintGiver.x;
    let bubbleY = hintGiver.y - (hintGiver.h * hintGiver.scale / 2) - 30;
    let buffer = 10;

    // 確保不超出左右邊界
    if (bubbleX - textW / 2 < buffer) {
      bubbleX = buffer + textW / 2;
    } else if (bubbleX + textW / 2 > width - buffer) {
      bubbleX = width - buffer - textW / 2;
    }
    // 確保不超出上邊界
    if (bubbleY - textH / 2 < buffer) {
      bubbleY = hintGiver.y + (hintGiver.h * hintGiver.scale / 2) + 30;
    }

    rect(bubbleX, bubbleY, textW, textH, 10);

    noStroke();
    fill(0);
    text(hintGiverSpeech, bubbleX, bubbleY);
  }
}

/**
 * 處理提示者的移動邏輯
 */
function moveHintGiver() {
  // --- 新增：強制返回時，夢幻在玩家頭上 ---
  if (isForcedReturn) {
      let pScreenX = player.x - camera.x;
      let pScreenY = player.y;
      hintGiver.x = pScreenX;
      hintGiver.y = pScreenY - 120; // 位於頭頂上方
      return;
  }

  // --- 新增：追逐模式 (超過距離時靠近玩家) ---
  if (isChasingPlayer) {
      let pScreenX = player.x - camera.x;
      let pScreenY = player.y;
      
      let dx = pScreenX - hintGiver.x;
      let dy = pScreenY - hintGiver.y;
      let d = sqrt(dx*dx + dy*dy);
      
      if (d > 5) {
          hintGiver.x += (dx/d) * 8; // 追逐速度
          hintGiver.y += (dy/d) * 8;
      }
      return;
  }

  // 更新提示者的位置
  hintGiver.x += hintGiver.speedX;
  hintGiver.y += hintGiver.speedY;

  // 計算提示者的繪製尺寸
  const halfW = (hintGiver.w * hintGiver.scale) / 2;
  const halfH = (hintGiver.h * hintGiver.scale) / 2;

  // 檢查並反轉水平方向
  if (hintGiver.x < halfW) {
    hintGiver.x = halfW; // 將位置拉回邊界內，避免卡住
    hintGiver.speedX *= -1;
  } else if (hintGiver.x > width - halfW) {
    hintGiver.x = width - halfW; // 將位置拉回邊界內
    hintGiver.speedX *= -1;
  }
  // 檢查並反轉垂直方向
  if (hintGiver.y < halfH) {
    hintGiver.y = halfH; // 將位置拉回邊界內
    hintGiver.speedY *= -1;
  } else if (hintGiver.y > height - halfH) {
    hintGiver.y = height - halfH; // 將位置拉回邊界內
    hintGiver.speedY *= -1;
  }
}

/**
 * 處理玩家的移動邏輯
 */
function movePlayer() {
  // --- 新增：強制返回邏輯 ---
  if (isForcedReturn && returnTargetQ) {
      player.isMoving = true;
      let dx = returnTargetQ.x - player.x;
      
      // 自動往目標移動
      if (dx > 0) {
          player.x += player.speed;
          player.direction = -1; // 向右 (參考 D鍵邏輯)
      } else {
          player.x -= player.speed;
          player.direction = 1; // 向左 (參考 A鍵邏輯)
      }

      // 檢查是否到達目標距離 (1/4 地圖寬度)
      // 優化：使用全域快取變數
      let d = dist(player.x, player.y, returnTargetQ.x, returnTargetQ.y);
      
      if (d <= bgDrawWidth * 0.25) {
          isForcedReturn = false;
          returnTargetQ = null;
          hintGiverSpeech = null;
          // 停止播放 TF.mp3
          if (tfSound && tfSound.isPlaying()) {
              tfSound.stop();
          }
          // 讓夢幻恢復隨機移動
          hintGiver.speedX = random() > 0.5 ? 2.0 : -2.0;
          hintGiver.speedY = random() > 0.5 ? 1.5 : -1.5;
      }
      return; // 忽略玩家輸入
  }

  // 檢查是否有任何方向鍵被按下
  player.isMoving = keyIsDown(65) || keyIsDown(68) || keyIsDown(87) || keyIsDown(83); // A, D, W, S

  if ((keyIsDown(65) || keyIsDown(68)) && moonwalkMode) { // A or D
    playerSpeech = "我是Michael Jackson";
  } else {
    playerSpeech = null;
  }

  if (keyIsDown(65)) { // A
    player.x -= player.speed;
    player.direction = 1; // 更新方向為向右 (圖像交換)
  }
  if (keyIsDown(68)) { // D
    player.x += player.speed;
    player.direction = -1; // 更新方向為向左 (圖像交換)
  }
  if (keyIsDown(87)) { player.y -= player.speed; } // W
  if (keyIsDown(83)) { player.y += player.speed; } // S

  // 限制玩家的垂直移動範圍
  let playerHeight = player.animation.stand.h * playerScale;
  // 限制移動範圍在螢幕下半部 (草地與山間)，避免進入天空 (height * 0.55 為地平線估計值)
  player.y = constrain(player.y, height * 0.55, height - playerHeight / 2);
}

/**
 * 當瀏覽器視窗大小改變時，p5.js 會自動呼叫此函數
 */
function windowResized() {
  // 重新設定畫布大小
  resizeCanvas(windowWidth, windowHeight);
  
  // --- 優化：視窗改變時重新計算背景尺寸 ---
  bgAspectRatio = bgImage.width / bgImage.height;
  bgDrawWidth = height * bgAspectRatio;
}

/**
 * 檢查玩家與提問者的互動
 */
function checkInteractions() {
  if (transition.active) return; // 如果正在轉場，不進行互動檢查
  // --- 檢查是否所有提問者都已完成 ---
  const allSatisfied = questioners.every(q => q.correctAnswersCount >= 3);
  if (allSatisfied && !celestialEffect.isActive) {
    activateCelestialEffect(); // 如果全部完成且效果尚未啟動，則啟動效果
  }

  for (let q of questioners) {
    // 計算碰撞距離
    let playerSize = (player.animation.stand.w * playerScale) / 2;
    let questionerSize = (q.w * questionerScale) / 2;
    let d = dist(player.x, player.y, q.x, q.y);

    // 根據提問者狀態決定互動
    if (q.correctAnswersCount >= 3) {
      // 如果提問者已完成，靠近時顯示提示
      if (d < playerSize + questionerSize) {
        q.reactionText = "按.按..按M";
      } else if (q.reactionText === "按.按..按M") {
        // 離開時清除提示
        q.reactionText = null;
      }
    } else {
      // 如果提問者未完成，靠近時觸發提問
      if (d < playerSize + questionerSize && millis() > q.cooldownUntil && q.questions.length > 0) {
        activeQuestioner = q;
        savedMapPos = { x: player.x, y: player.y }; // 記錄當前地圖位置
        
        // 在地圖上顯示簡單的詢問 (改為陣列以支援逐句顯示)
        if (q.hasRefused) {
             currentDialogueLines = ["準備好接受挑戰了嗎？"];
        } else if (q.id === 'q1') currentDialogueLines = ["我是台股森林守護者。", "好久不見了。", "我確實受你所託，守護這八個單字。", "但你該明白，我從不看交情，只看實力。", "準備好回答我的問題了嗎？"];
        else if (q.id === 'q2') currentDialogueLines = ["我是加密裂縫主宰者。", "你終於來了。", "雖然我們曾經簽定過共識合約。", "但在這混亂的空間，唯一能證明的就是你的知識。", "準備好回答我的問題了嗎？"];
        else if (q.id === 'q3') currentDialogueLines = ["我是美股藍洞守護者。", "雖然資料庫顯示你就是資產的擁有者。", "但我依然要對你的金融知識進行確認。", "除非你通過考驗，不然我是不會給你的。", "準備好回答我的問題了嗎？"];
        else currentDialogueLines = ["是否要接受挑戰？"];

        currentDialogueIndex = 0;
        dialogueCharIndex = 0;
        lastDialogueTypeTime = millis();

        let randomIndex = floor(random(q.questions.length));
        currentQuestion = q.questions[randomIndex];

        gameState = 'PROMPT'; // 直接切換狀態，不轉場 (保持在地圖上)
        return; // 觸發一個後就停止檢查
      }
    }
  }

  // --- 修改：距離檢查與強制返回邏輯 ---
  // 尋找最近的提問者
  let minDistance = Infinity;
  let nearestQ = null;
  for (let q of questioners) {
    let d = dist(player.x, player.y, q.x, q.y);
    if (d < minDistance) {
      minDistance = d;
      nearestQ = q;
    }
  }

  if (isForcedReturn) {
      hintGiverSpeech = "前面的區域以後再來探索吧";
      if (!returnTargetQ) returnTargetQ = nearestQ;
  } else if (isChasingPlayer) {
      // 追逐中
      hintGiverSpeech = "前面的區域以後再來探索吧";
      
      // 檢查是否抓到 (碰到玩家)
      let playerSize = (player.animation.stand.w * playerScale) / 2;
      let hintGiverSize = (hintGiver.w * hintGiver.scale) / 2;
      let playerScreenX = player.x - camera.x;
      let playerScreenY = player.y;
      let dToHintGiver = dist(playerScreenX, playerScreenY, hintGiver.x, hintGiver.y);

      if (dToHintGiver < playerSize + hintGiverSize) {
          isChasingPlayer = false;
          isForcedReturn = true; // 開始控制
          // 播放 TF.mp3
          if (tfSound && tfSound.isLoaded()) {
              tfSound.setVolume(min(volumeLevel * 5, 1.0)); // 調高音量
              tfSound.play();
          }
      }
      
      // 如果玩家自己跑回來了 (小於 2 張圖距離)，停止追逐
      if (minDistance <= bgDrawWidth * 2) {
          isChasingPlayer = false;
          hintGiverSpeech = null;
      }
  } else {
    if (minDistance > bgDrawWidth * 2) {
      // 超過兩張地圖距離：觸發追逐
      isChasingPlayer = true;
      returnTargetQ = nearestQ;
      hintGiverSpeech = "前面的區域以後再來探索吧";
    } else if (minDistance > bgDrawWidth) {
      // 超過一張地圖距離：提示往回找
      hintGiverSpeech = "太遠了,往回找找吧";
    } else {
      // 距離適中：檢查與夢幻的互動
      let playerSize = (player.animation.stand.w * playerScale) / 2;
      let hintGiverSize = (hintGiver.w * hintGiver.scale) / 2;
      let playerScreenX = player.x - camera.x;
      let playerScreenY = player.y;
      let dToHintGiver = dist(playerScreenX, playerScreenY, hintGiver.x, hintGiver.y);

      if (dToHintGiver < playerSize + hintGiverSize) {
        hintGiverSpeech = "瞅啥 是我 你爹";
        // 播放 YD.mp3 的最後幾秒 (我是你爹片段)
        if (ydSound && ydSound.isLoaded() && !ydSound.isPlaying()) {
            ydSound.setVolume(volumeLevel);
            let cueStart = max(0, ydSound.duration() - 3); // 取最後 3 秒
            ydSound.play(0, 1, volumeLevel, cueStart, 3);
        }
      } else {
        hintGiverSpeech = null;
      }
    }
  }
}

/**
 * --- 新增：啟動星空效果 ---
 */
function activateCelestialEffect() {
  celestialEffect.isActive = true;

  // 計算效果中心點 (所有提問者的中心上方)
  let centerX = 0;
  questioners.forEach(q => centerX += q.x);
  celestialEffect.x = centerX / questioners.length;
  celestialEffect.y = height * 0.3; // 固定在天空較高的位置

  // 在圓形區域內生成 150 個粒子
  for (let i = 0; i < 150; i++) {
    let angle = random(TWO_PI);
    let r = celestialEffect.radius * sqrt(random()); // 使用 sqrt 讓粒子分佈更均勻
    let pX = celestialEffect.x + r * cos(angle);
    let pY = celestialEffect.y + r * sin(angle);
    celestialEffect.particles.push({
      pos: createVector(pX, pY),
      vel: p5.Vector.random2D().mult(random(0.2, 0.8)) // 降低粒子速度
    });
  }
}

/**
 * --- 優化：通用電影式對話繪製函式 ---
 * 取代多個函式中重複的打字機與繪圖邏輯
 */
function drawCinematicDialogue(data, style) {
  let line = data.lines[data.dialogueIndex];
  if (!line) return;

  // 打字機效果
  if (millis() - data.lastTypeTime > (style.typeSpeed || 30)) {
      if (data.charIndex < line.text.length) {
          data.charIndex++;
          data.lastTypeTime = millis();
      }
  }
  let currentText = line.text.substring(0, data.charIndex);

  // 對話框
  rectMode(CENTER);
  fill(style.bgColor || color(0, 0, 0, 200));
  stroke(style.strokeColor || 255);
  strokeWeight(style.strokeWeight || 2);
  
  let boxW = style.boxW || (width - 60);
  let boxH = style.boxH || 200;
  let boxY = style.boxY || (height - 120);
  
  rect(width/2, boxY, boxW, boxH, 20);
  
  // 名字
  textAlign(LEFT, TOP);
  textSize(style.nameSize || 26);
  textStyle(BOLD);
  noStroke();
  fill(style.nameColor || 255);
  text(line.name, width/2 - boxW/2 + 40, boxY - boxH/2 + 30);
  
  // 內容
  textSize(style.textSize || 24);
  fill(style.textColor || 255);
  text(currentText, width/2 - boxW/2 + 40, boxY - boxH/2 + (style.textOffsetY || 70));
  
  // 提示
  textSize(14);
  fill(150);
  textAlign(RIGHT, BOTTOM);
  text("點擊繼續...", width/2 + boxW/2 - 30, boxY + boxH/2 - 20);
}

/**
 * --- 新增：啟動結局前導動畫 ---
 */
function startFinalePrelude() {
  gameState = 'FINALE_PRELUDE';
  preludeData.startTime = millis();
  preludeData.dialogueIndex = 0;
  preludeData.charIndex = 0;
  preludeData.playedAttack = false;
  
  // 停止背景音樂，營造緊張感
  if (bgMusic && bgMusic.isPlaying()) bgMusic.stop();
  if (answerMusic && answerMusic.isPlaying()) answerMusic.stop();
}

/**
 * --- 新增：繪製結局前導動畫 ---
 */
function drawFinalePrelude() {
  background(0);
  
  // 震動效果 (繼承全域變數)
  push();
  if (screenShake > 0) {
    translate(random(-8, 8), random(-8, 8));
    screenShake--;
  }

  // 繪製場景
  push();
  translate(width/2, height/2);
  scale(1.5); // 稍微放大鏡頭
  
  let idx = preludeData.dialogueIndex;
  
  if (idx <= 2) {
    // 階段一：皮卡丘開心拿出錢包
    // 繪製皮卡丘
    let anim = player.animation.stand;
    imageMode(CENTER);
    image(anim.img, -40, 50, anim.w * playerScale, anim.h * playerScale, 0, 0, anim.w, anim.h);
    
    // 繪製冷錢包
    fill(30); stroke(100); strokeWeight(1);
    rectMode(CENTER);
    rect(40, 40, 50, 30, 4);
    fill(0, 255, 0); noStroke();
    rect(40, 40, 30, 15); // 螢幕
    
    // 發光特效
    if (frameCount % 60 < 30) {
       noFill(); stroke(255, 215, 0); strokeWeight(2);
       circle(40, 40, 60);
    }
  } else if (idx === 3) {
    // 階段二：遭到偷襲
    if (!preludeData.playedAttack) {
       preludeData.playedAttack = true;
       preludeData.flashTimer = 1; // 設定閃光持續時間
       screenShake = 30; // 觸發震動
       if (dropSound) dropSound.play(); // 播放撞擊聲
    }
    
    // 閃光效果
    if (preludeData.flashTimer > 0) {
       background(255);
       preludeData.flashTimer--;
    }
    
    // 皮卡丘受傷/驚訝
    let anim = player.animation.wrong;
    imageMode(CENTER);
    image(anim.img, 0, 50, anim.w * playerScale, anim.h * playerScale, 0, 0, anim.w, anim.h);
    
    // 暗影能量球
    fill(100, 0, 100); noStroke();
    circle(100, -50, 100);
  } else {
    // 階段三：對峙
    // 皮卡丘生氣
    let anim = player.animation.stand;
    imageMode(CENTER);
    image(anim.img, -100, 100, anim.w * playerScale, anim.h * playerScale, 0, 0, anim.w, anim.h);
    
    // 夢幻現身 (漂浮)
    let mFrame = 0;
    // 簡單計算幀數
    if (frameCount % 10 === 0) mFrame = floor(frameCount / 10) % 8;
    let mw = 291/8;
    let mh = 31;
    let mScale = 3.0;
    // 使用 hintGiverSprite 繪製第一幀
    image(hintGiverSprite, 100, -50 + sin(frameCount*0.1)*10, mw*mScale, mh*mScale, 0, 0, mw, mh);
  }
  pop();
  pop(); // 結束震動
  
  // 繪製對話框
  drawPreludeDialogue();
}

/**
 * --- 新增：啟動結局動畫 ---
 */
function startFinale() {
  gameState = 'FINALE';
  showFinaleInstructions = true; // 進入結局時，開啟提示
  finaleCatchCount = 0; // 重置計數
  
  // --- 新增：重置血量與問答狀態 ---
  playerCurrentHealth = playerMaxHealth;
  finaleQuizActive = false;
  // ------------------------------

  hintGiverSpeech = null; // 清除之前的對話
  playerSpeech = null; // 清除玩家對話
  // 將玩家放置在螢幕中央，準備在結局場景中移動
  player.x = width / 2;
  player.y = height / 2;
  
  // 設定夢幻初始位置 (避免一開始就碰到)
  hintGiver.x = width / 2;
  hintGiver.y = 100;

  player.speed = 3; // 結局時降低皮卡丘速度
  player.animation.frameDelay = 15; // 結局時減慢動畫速度
  
  projectiles = []; // 重置發射物
  clones = []; // 重置分身
  hintGiver.stunEndTime = 0; // 重置暈眩時間
  player.stunEndTime = 0; // 重置玩家暈眩
  playerAmmo = 5; // 重置彈藥
  lastAmmoReloadTime = millis(); // 重置裝填時間
  recoveryState = 'NONE'; // 重置狀態

  celestialEffect.finaleStartTime = millis(); // 重新啟用結局計時器
  celestialEffect.particles = []; // 清空舊粒子
  shockwaves = []; // 清空衝擊波
  swapParticles = []; // 清空交換粒子

  // 移除初始粒子生成，改在 drawFinale 中漸進生成

  // 結局開始時，讓夢幻的速度更難預測
  if (random(1) > 0.5) {
    hintGiver.speedX *= -1;
  }

  // 初始化擊退狀態
  player.knockback = { active: false, targetX: 0, targetY: 0 };
}

/**
 * --- 新增：繪製星空效果 ---
 */
function drawCelestialEffect() {
  const particles = celestialEffect.particles;
  // 在 FINALE 狀態下，效果範圍是整個螢幕
  const isFinale = gameState === 'FINALE';

  const centerX = celestialEffect.x;
  const centerY = celestialEffect.y;
  const radius = celestialEffect.radius;
  const radiusSq = radius * radius; // 優化：預先計算半徑平方
  const connectionThreshold = 80; // 粒子間開始連線的最大距離
  const thresholdSq = connectionThreshold * connectionThreshold; // 優化：預先計算閾值平方

  // --- 繪製黑色背景圓 ---
  if (!isFinale) { // 結局模式下不繪製背景圓 (因為背景已經是黑的)
    if (celestialEffect.isExpanding) {
      fill(0); // 擴散時變成實心黑色
    } else {
      fill(0, 0, 0, 150); // 平常是半透明黑色
    }
    noStroke();
    circle(centerX, centerY, radius * 2);
  }

  // --- 更新粒子位置並處理反彈 ---
  for (let p of particles) {
    if (celestialEffect.isExpanding) {
      // 擴散時，粒子快速向外散開
      let dir = createVector(p.pos.x - centerX, p.pos.y - centerY);
      if (dir.mag() === 0) dir = p5.Vector.random2D();
      dir.normalize();
      dir.mult(35); // 速度略快於圓圈擴散速度 (30)，讓粒子看起來是被推著走
      p.pos.add(dir);
    } else {
      p.pos.add(p.vel);
    }
    
    if (isFinale) {
      // 在結局模式下，處理矩形螢幕邊界反彈
      if (p.pos.x < 0 || p.pos.x > width) p.vel.x *= -1;
      if (p.pos.y < 0 || p.pos.y > height) p.vel.y *= -1;
    } else {
      // 在遊戲中，處理圓形邊界反彈
      if (!celestialEffect.isExpanding) { // 只有在不擴散時才限制在圓內
        const d = dist(p.pos.x, p.pos.y, centerX, centerY);
        if (d > radius) {
          p.pos.set(
            centerX + (p.pos.x - centerX) * radius / d,
            centerY + (p.pos.y - centerY) * radius / d
          );
          const normal = createVector(p.pos.x - centerX, p.pos.y - centerY).normalize();
          p.vel.reflect(normal);
        }
      }
    }
  }
  
  // 優化：預先計算每個粒子是否在圓內 (O(N))
  // 避免在雙重迴圈中重複計算 (O(N^2))
  for (let p of particles) {
      p.isInside = isFinale || ((p.pos.x - centerX)**2 + (p.pos.y - centerY)**2 < radiusSq);
  }

  // 繪製粒子間的連線
  strokeWeight(0.5);
  for (let i = 0; i < particles.length; i++) {
    const p1 = particles[i];
    for (let j = i + 1; j < particles.length; j++) {
      const p2 = particles[j];
      
      // 優化：快速邊界框檢查 (Bounding Box Check)
      const dx = p1.pos.x - p2.pos.x;
      const dy = p1.pos.y - p2.pos.y;
      if (Math.abs(dx) > connectionThreshold || Math.abs(dy) > connectionThreshold) continue;

      // 優化：使用距離平方比較，避免開根號
      const dSq = dx*dx + dy*dy;
      
      if (dSq < thresholdSq) {
        const d = Math.sqrt(dSq); // 只有在需要繪製時才開根號計算 alpha
        // 距離越近，線條越不透明
        const lineAlpha = map(d, connectionThreshold, 0, 0, 150);
        stroke(255, 255, 255, lineAlpha);
        // 在 FINALE 狀態下，線條在整個螢幕繪製
        // 在 MOVING 狀態下，線條只在圓內繪製
        if (p1.isInside && p2.isInside) {
          line(p1.pos.x, p1.pos.y, p2.pos.x, p2.pos.y);
        }
      }
    }
  }

  // 只在遊戲中繪製圓形邊界
  if (!isFinale) {
    noFill();
    stroke(255, 255, 255, 50); // 非常淡的白色邊界
    strokeWeight(2);
    circle(centerX, centerY, radius * 2);
  }

  // 繪製粒子點
  noStroke();
  for (let p of particles) {
    // 讓粒子有輕微的閃爍效果
    const particleAlpha = 150 + sin(frameCount * 0.1 + p.pos.x) * 100;
    fill(255, 255, 255, particleAlpha);
    circle(p.pos.x, p.pos.y, 2);
  }
}

/**
 * --- 新增：繪製結局畫面 ---
 */
function drawFinale() {
  // --- 新增：顯示結局玩法提示 ---
  if (showFinaleInstructions) {
    background(0);
    drawOverlay("最終決戰說明", "幕後黑手出現了！\n\n靠近夢幻以抓住她，削減她的體力！\n\n按滑鼠左鍵發射電擊球，\n可以暫時麻痺夢幻，阻止他的移動。");
    return; // 暫停後續的遊戲邏輯更新
  }

  // --- 新增：結局爆發階段 (黑畫面對話) ---
  if (showFinaleBurst) {
      drawFinaleBurst();
      return;
  }

  // --- 新增：勝利畫面 (全黑背景 + 對話) ---
  if (celestialEffect.isFrozen) {
      background(0);
      if (recoveryState === 'NONE') {
          recoveryState = 'DIALOGUE';
          finaleData.dialogueIndex = 0;
          finaleData.charIndex = 0;
          finaleData.lastTypeTime = millis();
      }
      
      if (recoveryState === 'DIALOGUE') {
          drawFinaleDialogue();
      } else if (recoveryState === 'DONE') {
          drawFinaleResult();
      }
      return;
  }

  // --- 新增：繪製血條 (戰鬥中常駐) ---
  drawHealthBars();

  background(0); // 全黑背景

  const playerPikaSize = (player.animation.stand.w * playerScale) / 2;
  const hintGiverSize = (hintGiver.w * hintGiver.scale) / 2;

  // --- 震動效果 ---
  push();
  if (screenShake > 0) {
    translate(random(-8, 8), random(-8, 8));
    screenShake--;
  }

  // --- 1. 狀態更新 ---

  // 檢查玩家是否暈眩
  let isPlayerStunned = millis() < (player.stunEndTime || 0);

  // --- 處理擊退動畫 ---
  if (player.knockback && player.knockback.active) {
    // 使用 lerp 平滑移動到目標位置 (模擬被擊飛)
    player.x = lerp(player.x, player.knockback.targetX, 0.15);
    player.y = lerp(player.y, player.knockback.targetY, 0.15);
    
    // 如果接近目標點，停止擊退
    if (dist(player.x, player.y, player.knockback.targetX, player.knockback.targetY) < 10) {
      player.knockback.active = false;
    }
  }
  else if (!celestialEffect.isFrozen && !isPlayerStunned && !finaleQuizActive) { // 修改：直接允許移動
    movePlayerInFinale();
  } else {
    player.isMoving = false; // 確保在恢復期間，玩家處於非移動狀態
  }

  // --- 2. 繪製背景元素 ---
  // 漸進式生成粒子：隨著時間 (皮卡丘變亮) 增加粒子數量
  const maxParticles = 400; // 增加粒子數量
  while (celestialEffect.particles.length < maxParticles) {
    celestialEffect.particles.push({
      pos: createVector(random(width), random(height)),
      vel: p5.Vector.random2D().mult(random(4, 10)) // 大幅提高移動速度
    });
  }

  drawCelestialEffect();

  // --- 彈藥裝填邏輯 ---
  if (playerAmmo < 5 && millis() - lastAmmoReloadTime > 2000 && !finaleQuizActive) { // 修改：問答時暫停裝填
    playerAmmo++;
    lastAmmoReloadTime = millis();
  }

  // --- 新增：右上角提示 ---
  fill(255);
  textAlign(RIGHT, TOP);
  textSize(20);
  text(`按 '滑鼠左鍵' 發射電擊讓夢幻停下！ 靠近夢幻來攻擊 (彈藥: ${playerAmmo}/5)`, width - 20, 20);

  // --- 新增：處理發射物 ---
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let p = projectiles[i];
    if (!finaleQuizActive) { // 修改：問答時暫停發射物移動
        p.x += p.vx;
        p.y += p.vy;
    }
    
    // 繪製發射物 (黃色圓球)
    fill(255, 255, 0);
    noStroke();
    circle(p.x, p.y, p.size);
    
    // 檢查是否擊中分身 (噴到分身會麻痺)
    let hitClone = false;
    if (!finaleQuizActive) { // 修改：問答時暫停碰撞檢測
        for (let clone of clones) {
            if (dist(p.x, p.y, clone.x, clone.y) < hintGiverSize + p.size / 2) {
                player.stunEndTime = millis() + 500; // 玩家暈眩 0.5 秒
                projectiles.splice(i, 1);
                hitClone = true;
                break;
            }
        }
    }
    if (hitClone) continue;

    // 檢查是否擊中夢幻
    let d = dist(p.x, p.y, hintGiver.x, hintGiver.y);
    if (!finaleQuizActive && d < hintGiverSize + p.size / 2) { // 修改：問答時暫停碰撞
      hintGiver.stunEndTime = millis() + 500; // 暈眩 0.5 秒
      projectiles.splice(i, 1); // 移除發射物
      continue;
    }
    
    // 移除超出畫面的發射物
    if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
      projectiles.splice(i, 1);
    }
  }

  // --- 繪製分身 ---
  for (let clone of clones) {
      if (!celestialEffect.isFrozen && !finaleQuizActive) { // 修改：問答時暫停分身移動
          // --- 分身移動邏輯 (仿照本體) ---
          // 隨機擾動
          if (frameCount % 10 === 0) {
             clone.vx += random(-3, 3);
             clone.vy += random(-3, 3);
          }

          // 限制分身最大速度，避免速度無限疊加
          clone.vx = constrain(clone.vx, -8, 8);
          clone.vy = constrain(clone.vy, -8, 8);

          // 更新位置
          clone.x += clone.vx;
          clone.y += clone.vy;

          // 4. 邊界反彈
          if (clone.x < hintGiverSize) { clone.x = hintGiverSize; clone.vx *= -1; }
          else if (clone.x > width - hintGiverSize) { clone.x = width - hintGiverSize; clone.vx *= -1; }
          
          if (clone.y < hintGiverSize) { clone.y = hintGiverSize; clone.vy *= -1; }
          else if (clone.y > height - hintGiverSize) { clone.y = height - hintGiverSize; clone.vy *= -1; }
      }
      let frameX = hintGiver.currentFrame * hintGiver.w;
      image(hintGiver.img, clone.x, clone.y, hintGiver.w * hintGiver.scale, hintGiver.h * hintGiver.scale, frameX, 0, hintGiver.w, hintGiver.h);
      
      // 碰到分身也會暈眩
      if (!finaleQuizActive && dist(player.x, player.y, clone.x, clone.y) < playerPikaSize + hintGiverSize) { // 修改：問答時暫停碰撞
          player.stunEndTime = millis() + 500; // 玩家暈眩 0.5 秒
          triggerKnockback(clone.x, clone.y); // 觸發擊退
          
          // --- 新增：分身碰撞扣血 (1%) ---
          playerCurrentHealth -= playerMaxHealth * 0.01;
          if (playerCurrentHealth <= 0) {
              playerCurrentHealth = 0;
              startBadEnding(); // 觸發壞結局
              return;
          }
      }

      // 分身也要說話 (跟隨本尊)
      if (hintGiverSpeech) {
        fill(255);
        stroke(0);
        strokeWeight(2);
        rectMode(CENTER);
        textAlign(CENTER, CENTER);
        textSize(16);

        let textW = textWidth(hintGiverSpeech) + 20;
        let textH = 40;
        let bubbleX = clone.x;
        let bubbleY = clone.y - 60;

        rect(bubbleX, bubbleY, textW, textH, 10);

        noStroke();
        fill(0);
        text(hintGiverSpeech, bubbleX, bubbleY);
      }
  }

  // --- 3. 繪製夢幻 ---
  // 檢查是否暈眩
  let isStunned = millis() < (hintGiver.stunEndTime || 0);

  // --- 4. 檢查互動與碰撞 ---
  const dToHintGiver = dist(player.x, player.y, hintGiver.x, hintGiver.y);

  // 當皮卡丘靠近時，夢幻會主動遠離
  const fleeRadius = playerPikaSize + hintGiverSize + 150; // 夢幻開始逃跑的感應範圍
  if (dToHintGiver < fleeRadius && !celestialEffect.isFrozen && !isStunned && !finaleQuizActive) { // 修改：問答時暫停逃跑
    // 計算逃跑方向 (從皮卡丘指向夢幻)
    let fleeVec = createVector(hintGiver.x - player.x, hintGiver.y - player.y);
    fleeVec.normalize();
    // 將夢幻的速度方向設定為逃跑方向
    // 距離越近，速度越快
    const minDist = playerPikaSize + hintGiverSize;
    const distClamped = constrain(dToHintGiver, minDist, fleeRadius);
    const fleeSpeed = map(distClamped, minDist, fleeRadius, 15.0, 5.0); // 提高速度：近距離 15，遠距離 5
    hintGiver.speedX = fleeVec.x * fleeSpeed;
    hintGiver.speedY = fleeVec.y * fleeSpeed;
  }

  // 額外的隨機擾動，讓軌跡更不規則
  if (!celestialEffect.isFrozen && frameCount % 10 === 0 && !isStunned && !finaleQuizActive) { // 修改：問答時暫停擾動
    hintGiver.speedX += random(-3, 3);
    hintGiver.speedY += random(-3, 3);
  }

  // 只有在畫面未靜止時才更新夢幻的位置
  if (!celestialEffect.isFrozen && !isStunned && !finaleQuizActive) { // 修改：問答時暫停移動
    moveHintGiver();
  }
  
  // 暈眩時變色提示
  if (isStunned) {
    tint(255, 100, 100); // 變紅
  }
  // 只有在未通關時才繪製夢幻 (抓到後消失)
  if (!celestialEffect.isFrozen) {
    drawHintGiver();
  }
  noTint(); // 恢復顏色

  // --- 繪製交換特效粒子 ---
  for (let i = swapParticles.length - 1; i >= 0; i--) {
    let p = swapParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 5; // 減慢消失速度，讓特效更持久
    if (p.life <= 0) {
      swapParticles.splice(i, 1);
      continue;
    }
    if (p.color) {
      fill(p.color[0], p.color[1], p.color[2], p.life);
    } else {
      fill(255, 255, 255, p.life);
    }
    noStroke();
    circle(p.x, p.y, p.size);
  }

  // --- 繪製衝擊波特效 ---
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    let sw = shockwaves[i];
    sw.radius += 20; // 擴散速度
    sw.alpha -= 8;   // 消失速度
    
    if (sw.alpha <= 0) {
      shockwaves.splice(i, 1);
    } else {
      noFill();
      stroke(255, 255, 255, sw.alpha);
      strokeWeight(8);
      circle(sw.x, sw.y, sw.radius);
    }
  }

  // --- 5. 繪製皮卡丘 ---

  push();
  translate(player.x, player.y);
  
  scale(player.direction, 1); // 使用玩家自身的 direction

  let anim;
  if (player.isMoving) {
    anim = player.animation.move;
  } else {
    anim = player.animation.stand;
  }

  // 更新動畫幀
  if (!celestialEffect.isFrozen) updateFrame(player.animation, anim.totalFrames);
  
  let frameX = player.animation.currentFrame * anim.w;
  imageMode(CENTER);
  image(anim.img, 0, 0, anim.w * playerScale, anim.h * playerScale, frameX, 0, anim.w, anim.h);
  pop();

  // 繪製皮卡丘的對話框 (結局專用)
  if (playerSpeech) {
    fill(255);
    stroke(0);
    strokeWeight(2);
    rectMode(CENTER);
    textAlign(CENTER, CENTER);
    textSize(16);

    let textW = textWidth(playerSpeech) + 20;
    let textH = 40;
    let bubbleX = player.x;
    let bubbleY = player.y - 60;

    rect(bubbleX, bubbleY, textW, textH, 10);

    noStroke();
    fill(0);
    text(playerSpeech, bubbleX, bubbleY);
  }

  // 繪製玩家暈眩提示
  if (isPlayerStunned) {
    fill(255, 0, 0);
    textSize(24);
    textAlign(CENTER, CENTER);
    text("麻痺", player.x, player.y - 90);
  }

  pop(); // 結束震動效果範圍

  // --- 6. 檢查勝利條件並顯示 UI ---
  if (dToHintGiver < playerPikaSize + hintGiverSize) {
    // --- 修改：每次碰到夢幻都觸發問答 ---
    if (!finaleQuizActive) {
        startFinaleQuiz();
    }
    // ----------------------------------
  } else {
    cursor(ARROW);
  }

  // --- 新增：繪製問答介面 (最上層) ---
  if (finaleQuizActive) {
      drawFinaleQuiz();
  }
  // --- 新增：繪製血條 (最上層) ---
  drawHealthBars();
}

/**
 * --- 新增：在結局場景中處理玩家移動 ---
 */
function movePlayerInFinale() {
  // 檢查是否有任何方向鍵被按下
  player.isMoving = keyIsDown(65) || keyIsDown(68) || keyIsDown(87) || keyIsDown(83); // A, D, W, S

  if (keyIsDown(65)) { // A
    player.x -= player.speed;
    player.direction = 1; // 更新方向為向右 (圖像交換)
  }
  if (keyIsDown(68)) { // D
    player.x += player.speed;
    player.direction = -1; // 更新方向為向左 (圖像交換)
  }
  if (keyIsDown(87)) { // W
    player.y -= player.speed;
  }
  if (keyIsDown(83)) { // S
    player.y += player.speed;
  }

  // 限制玩家不出螢幕邊界
  player.x = constrain(player.x, 0, width);
  player.y = constrain(player.y, 0, height);
}

/**
 * 顯示詢問介面
 */
function displayPrompt() {
  // --- 改用對話框風格 (仿照前導動畫) ---
  
  let boxH = 220; // 調整對話框高度，不用太大
  let boxY = height - 140;
  
  // 對話框背景 (金融風格)
  rectMode(CENTER);
  
  // 發光效果
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = 'rgba(255, 215, 0, 0.5)';

  fill(10, 20, 30, 245); // 深藍黑底
  stroke(255, 215, 0); // 金色邊框
  strokeWeight(3);
  rect(width / 2, boxY, width * 0.7, boxH, 5);

  drawingContext.shadowBlur = 0; // 重置

  // 裝飾線
  stroke(255, 215, 0, 50);
  strokeWeight(1);
  line(width / 2 - width * 0.35 + 20, boxY - boxH / 2 + 15, width / 2 + width * 0.35 - 20, boxY - boxH / 2 + 15);
  line(width / 2 - width * 0.35 + 20, boxY + boxH / 2 - 15, width / 2 + width * 0.35 - 20, boxY + boxH / 2 - 15);

  // 繪製頭像 (右上角)
  let portraitX = width / 2 + width * 0.35 - 80;
  let portraitY = boxY;
  
  if (activeQuestioner) {
      let q = activeQuestioner;
      imageMode(CENTER);
      // 繪製提問者頭像 (放大顯示)
      let pScale = 3; 
      image(q.img, portraitX, portraitY, q.w * pScale, q.h * pScale, 0, 0, q.w, q.h);
  }

  // 名字
  let name = "";
  if (activeQuestioner.id === 'q1') name = "台股森林捍衛者";
  else if (activeQuestioner.id === 'q2') name = "加密裂縫主宰者";
  else if (activeQuestioner.id === 'q3') name = "美股藍洞守護者";

  textAlign(LEFT, TOP);
  textSize(26);
  textStyle(BOLD);
  fill(255, 215, 0);
  noStroke();
  text(name, width / 2 - width * 0.35 + 30, boxY - 85); // 名字往上移

  // 對話內容
  textAlign(LEFT, TOP);
  textSize(24);
  fill(240); // 亮白色文字
  noStroke(); // 文字不描邊

  // 打字機效果
  let currentLine = currentDialogueLines[currentDialogueIndex];
  if (millis() - lastDialogueTypeTime > 30) {
      if (dialogueCharIndex < currentLine.length) {
          dialogueCharIndex++;
          lastDialogueTypeTime = millis();
      }
  }
  let textToDisplay = currentLine.substring(0, dialogueCharIndex);
  text(textToDisplay, width / 2 - width * 0.35 + 40, boxY - 40); // 內容往下移，避免與名字重疊

  // 檢查是否為最後一句且顯示完畢
  let isLastLine = currentDialogueIndex === currentDialogueLines.length - 1;
  let isTextFinished = dialogueCharIndex === currentLine.length;

  if (isLastLine && isTextFinished) {
      // --- 定義並繪製按鈕 (放在對話框內下方) ---
      const buttonW = 120;
      const buttonH = 50;
      const buttonY = boxY + 50; // 調整按鈕位置

      yesButton = {
        x: width / 2 - buttonW - 30,
        y: buttonY,
        w: buttonW,
        h: buttonH
      };

      noButton = {
        x: width / 2 + 30,
        y: buttonY,
        w: buttonW,
        h: buttonH
      };

      // 檢查滑鼠懸停 (互動邏輯)
      const onYes = mouseX > yesButton.x && mouseX < yesButton.x + yesButton.w &&
                    mouseY > yesButton.y && mouseY < yesButton.y + yesButton.h;
      const onNo = mouseX > noButton.x && mouseX < noButton.x + noButton.w &&
                   mouseY > noButton.y && mouseY < noButton.y + noButton.h;

      if (onYes || onNo) {
        cursor(HAND);
      } else if (gameState === 'PROMPT') { // 只有在 PROMPT 狀態才重設為箭頭
        cursor(ARROW);
      }

      // 繪製 '是' 按鈕
      rectMode(CORNER);
      strokeWeight(2);
      if (onYes) {
        fill(255, 215, 0); // 懸停變金色
        stroke(255, 215, 0);
      } else {
        fill(0, 0, 0, 150); // 預設黑底透明
        stroke(255, 215, 0);
      }
      rect(yesButton.x, yesButton.y, yesButton.w, yesButton.h, 5);
      
      if (onYes) fill(0); else fill(255, 215, 0); // 文字顏色反轉
      noStroke();
      textSize(22);
      textStyle(BOLD);
      textAlign(CENTER, CENTER);
      text("來啊", yesButton.x + yesButton.w / 2, yesButton.y + yesButton.h / 2);

      // 繪製 '否' 按鈕
      if (onNo) {
        fill(255, 50, 50); // 懸停變紅
        stroke(255, 50, 50);
      } else {
        fill(0, 0, 0, 150);
        stroke(255, 50, 50);
      }
      rect(noButton.x, noButton.y, noButton.w, noButton.h, 5);
      
      if (onNo) fill(255); else fill(255, 50, 50);
      noStroke();
      textStyle(BOLD);
      text("不要", noButton.x + noButton.w / 2, noButton.y + noButton.h / 2);
  } else {
      // 顯示繼續提示
      if (frameCount % 60 < 30) {
        fill(255, 215, 0);
        textAlign(RIGHT, BOTTOM);
        textSize(20);
        text("▼", width / 2 + width * 0.35 - 40, boxY + boxH / 2 - 20);
      }
  }
}



/**
 * 處理詢問狀態下的按鍵事件
 */
function promptKeyPressed() {
  if (transition.active) return; // 防止轉場中重複觸發
  if (gameState === 'PROMPT') {
    // 檢查是否對話結束
    let isLastLine = currentDialogueIndex === currentDialogueLines.length - 1;
    let currentLine = currentDialogueLines[currentDialogueIndex];
    let isTextFinished = dialogueCharIndex === currentLine.length;
    
    if (!isLastLine || !isTextFinished) return; // 對話未結束不接受 Y/N

    // 玩家選擇 "是"
    if (key.toUpperCase() === 'Y') {
      
      // 觸發轉場進入介紹狀態 (SCENE_INTRO)
      transition.active = true;
      transition.state = 'IN';
      transition.nextState = 'SCENE_INTRO';
      
      // 設定進入房間後的介紹對話 (暫存於 transition，待轉場完成後切換)
      if (activeQuestioner) {
        if (activeQuestioner.id === 'q1') {
             transition.nextDialogueLines = ["(你被帶入了台股森林...)", "股市如戰場。", "稍有誤判便是萬丈深淵。", "就算你是當初那個委託人。","若你現在的心智已變得遲鈍、無法洞悉市場的規律。","我也絕不會把這份財富交還給你。","通過考驗，否則這註記詞將永遠埋藏在森林的塵土之中。"];
        } else if (activeQuestioner.id === 'q2') {
             transition.nextDialogueLines = ["(你進入了加密裂縫...)", "我是這裡的主宰。", "如果你連這點試煉都過不了。", "代表你已經失去了掌控資產的資格。","來吧！向我證明這份主權依然屬於你。","不然，這些單字我就自己拿去『銷毀』囉！"];
        } else if (activeQuestioner.id === 'q3') {
             transition.nextDialogueLines = ["(你來到了美股藍洞...)", "在這個資本匯集的藍洞。", "我只相信正確的數據與判斷。", "即使你曾是我的夥伴。","若你無法應對全球市場的複雜性。","那我就有責任將資產繼續封鎖。","現在挑戰開始!", ];
        }
      }

    // 玩家選擇 "否"
    } else if (key.toUpperCase() === 'N') {
      gameState = 'MOVING';
      let q = activeQuestioner;
      if (q) {
        q.hasRefused = true; // 標記已拒絕，下次對話變短
        q.reactionText = "孬種，有種回答！";
        q.reaction = 'wrong'; // 顯示失望動畫
        q.cooldownUntil = millis() + 3000; // 提問者冷卻 3 秒

        // 3 秒後清除提問者的反應
        setTimeout(() => {
          q.reaction = null;
          q.reactionText = null;
        }, 3000);
      }
      questionPrompt = null;
    }
  }
}

/**
 * 觸發交換位置的特效
 */
function triggerSwapEffect(x, y) {
  for (let i = 0; i < 60; i++) { // 增加粒子數量
    swapParticles.push({
      x: x,
      y: y,
      vx: random(-10, 10), // 增加擴散速度
      vy: random(-10, 10),
      size: random(10, 30), // 增加粒子大小
      life: 255,
      color: [random(200, 255), random(100, 255), random(200, 255)] // 加入隨機亮色系
    });
  }
}

/**
 * --- 新增：繪製前導故事動畫 ---
 */
function drawIntroStory() {
  let t = millis() - introData.startTime;
  
  // --- 音效控制 ---
  // 只有在非轉場狀態下才觸發新音效，避免跳過後還播放
  if (!transition.active) {
      // 1. 掉落聲 (2.0s) - 雲朵散去後約 1 秒
      if (t > 2000 && !introData.playedFalling) {
          introData.playedFalling = true;
          if (dropSound && dropSound.isLoaded()) {
              dropSound.setVolume(min(volumeLevel * 200, 1.0)); // 大幅放大音量
              dropSound.play();
          }
      }

      // 2. Zzz聲/破碎聲 (3.5s)
      if (t > 3500 && !introData.playedShatter) {
          introData.playedShatter = true;
          if (zzzSound && zzzSound.isLoaded()) {
              zzzSound.setVolume(min(volumeLevel * 200, 1.0)); // 大幅放大音量
              zzzSound.play();
          }
      }

      // 3. 警報聲 (3.5s) - 破碎後馬上出現
      if (t > 3500 && !introData.playedAlarm) {
          introData.playedAlarm = true;
          if (alarmSound && alarmSound.isLoaded()) {
              alarmSound.setVolume(min(volumeLevel * 100, 1.0)); // 提高警報音量
              alarmSound.rate(2.0); // 加快警報重複速度
              alarmSound.loop();
          }
      }
      
      // 警報聲停止 (8.0s 後，對話框出現)
      if (t > 8000 && introData.playedAlarm) {
           if (alarmSound && alarmSound.isPlaying()) {
               alarmSound.stop();
           }
      }
  }

  // Phase 1: 0-3.5s (黑畫面 + 掉落)
  if (t < 3500) {
    background(0);
    // 這裡可以加入 playSound() 如果有音效檔
    // 視覺模擬聲音 (電流茲滋聲)
    if (t > 2500 && random() < 0.3) {
        stroke(255, 255, 0, 150);
        strokeWeight(2);
        let x = random(width);
        let y = random(height);
        line(x, y, x + random(-20, 20), y + random(-20, 20));
    }
  }
  // Phase 2: 3.5s-8.0s (冷錢包出現 + 警報紅光)
  else if (t < 8000) {
    let flash = cos((t - 3500) * 0.015); // 閃爍頻率適中
    // 漸層紅光：中間深一點
    let rCenter = map(flash, -1, 1, 50, 100);
    let rEdge = map(flash, -1, 1, 100, 200);
    drawAlarmBackground(rCenter, rEdge);
    
    // 冷錢包顯示
    drawBrokenWallet(width / 2, height * 0.35);
  }
  // Phase 3: 8.0s+ (對話)
  else {
    background(20, 0, 0); // 殘留暗紅色
    drawBrokenWallet(width / 2, height * 0.35);
    drawIntroDialogue();
  }

  // 繪製 SKIP 按鈕 (右上角，無框，呼吸燈效果)
  if (introData.showSkip) {
    push();
    textAlign(RIGHT, TOP);
    textSize(24);
    textStyle(NORMAL); // 確保樣式正常
    noStroke(); // 移除描邊，避免繼承對話框的樣式
    // 呼吸燈效果
    let alpha = map(sin(frameCount * 0.1), -1, 1, 50, 255);
    fill(255, 255, 255, alpha);
    text("SKIP >>", width - 30, 30);
    pop();
  }
}

/**
 * 繪製警報背景 (漸層)
 */
function drawAlarmBackground(rCenter, rEdge) {
  let ctx = drawingContext;
  let grad = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
  grad.addColorStop(0, `rgb(${rCenter}, 0, 0)`);
  grad.addColorStop(1, `rgb(${rEdge}, 0, 0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
}

/**
 * 繪製破碎的冷錢包
 */
function drawBrokenWallet(x, y) {
  push();
  translate(x, y);
  scale(3.5); // 放大顯示
  rectMode(CENTER);
  
  let ctx = drawingContext;

  // --- 1. 機身 (黑色磨砂質感) ---
  fill(25, 25, 25);
  stroke(60);
  strokeWeight(1);
  // 圓角矩形機身
  rect(0, 0, 200, 60, 8);

  // --- 3. 螢幕 (OLED 破碎風格) ---
  // 螢幕邊框
  fill(0);
  stroke(30);
  rect(0, 0, 140, 32, 2);
  
  // 螢幕內容 (故障雜訊)
  if (random() > 0.1) {
      noStroke();
      // 隨機色塊模擬壞掉的像素
      fill(0, 255, 0, 150);
      rect(random(-60, 60), random(-10, 10), random(5, 20), 2);
      fill(255, 0, 0, 150);
      rect(random(-60, 60), random(-10, 10), random(5, 20), 2);
  }

  // --- 4. 內部電路外露 (破損處) ---
  // 在機身左側畫一個破洞
  fill(10);
  stroke(0);
  beginShape();
  vertex(-80, 10);
  vertex(-60, 25);
  vertex(-40, 15);
  vertex(-50, 0);
  endShape(CLOSE);
  
  // 畫一點綠色 PCB 和銅線
  strokeWeight(1);
  stroke(0, 100, 0); // PCB 綠
  fill(0, 150, 0);
  rect(-60, 15, 15, 8);
  
  stroke(200, 150, 50); // 銅線
  noFill();
  line(-65, 12, -55, 20);
  line(-60, 10, -50, 18);

  // --- 5. 表面裂痕 ---
  stroke(255, 255, 255, 180);
  strokeWeight(1.5);
  noFill();
  
  // 橫跨螢幕的大裂痕
  beginShape();
  vertex(-30, -15);
  vertex(-10, 5);
  vertex(20, -5);
  vertex(50, 15);
  endShape();
  
  // 輻射狀細紋
  strokeWeight(0.5);
  line(-10, 5, -15, 15);
  line(-10, 5, 0, 15);
  
  // --- 6. 電火花特效 ---
  if (random() < 0.3) { 
      stroke(100, 200, 255); // 藍白電光
      strokeWeight(2);
      let sx = random(-40, 40);
      let sy = random(-10, 10);
      line(sx, sy, sx + random(-15, 15), sy + random(-15, 15));
      
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ffff';
      point(sx, sy);
      ctx.shadowBlur = 0;
  }
  
  // --- 7. 按鈕 (移到蓋子之前繪製) ---
  fill(40);
  stroke(20);
  strokeWeight(1);
  rect(-85, -32, 12, 4); // 左按鈕
  rect(85, -32, 12, 4);  // 右按鈕

  // --- 2. 金屬旋轉蓋 (Ledger 風格) [移到這裡繪製以覆蓋螢幕] ---
  push();
  rotate(PI / 16); // 微微打開
  
  // 金屬漸層
  let gradCover = ctx.createLinearGradient(-105, -35, 105, 35);
  gradCover.addColorStop(0, '#bdc3c7'); // 銀灰
  gradCover.addColorStop(0.4, '#f5f6fa'); // 亮銀
  gradCover.addColorStop(0.6, '#dcdde1');
  gradCover.addColorStop(1, '#7f8c8d'); // 深灰
  ctx.fillStyle = gradCover;
  
  // 陰影
  ctx.shadowBlur = 10;
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  
  noStroke();
  rect(0, -35, 210, 65, 8); 
  
  // 樞紐孔
  fill(20);
  circle(90, -35, 10);
  
  ctx.shadowBlur = 0;
  pop();

  pop();
}

/**
 * 繪製前導對話框
 */
function drawIntroDialogue() {
  let line = introData.lines[introData.dialogueIndex];
  if (!line) return;

  // --- 打字機效果邏輯 ---
  if (millis() - introData.lastTypeTime > 50) { // 打字速度 (每 50ms 一個字)
      if (introData.charIndex < line.text.length) {
          introData.charIndex++;
          introData.lastTypeTime = millis();
      }
  }
  let currentText = line.text.substring(0, introData.charIndex);

  // 對話框背景
  rectMode(CENTER);
  fill(0, 0, 0, 200);
  stroke(255);
  strokeWeight(2);
  let boxW = width - 60;
  let boxH = 250;
  let boxY = height - 150;
  rect(width/2, boxY, boxW, boxH, 20);
  
  // 繪製頭像 (右上角)
  let portraitX = width/2 + boxW/2 - 100;
  let portraitY = boxY;
  
  imageMode(CENTER);
  if (line.speaker === 'Mew') {
      // 顯示夢幻 (取第一幀)
      image(hintGiverSprite, portraitX, portraitY, 291/8 * 3, 31 * 3, 0, 0, 291/8, 31);
  } else {
      // 顯示皮卡丘 (取第一幀)
      image(playerStandSprite, portraitX, portraitY, 79/2 * 2.5, 39 * 2.5, 0, 0, 79/2, 39);
  }
  
  // 文字內容
  rectMode(CENTER);
  
  // 名字
  textAlign(LEFT, TOP); // 改為左上對齊
  textSize(26); // 加大
  textStyle(BOLD); // 加粗
  stroke(0); // 黑色描邊
  strokeWeight(4); // 描邊厚度
  fill(255, 215, 0);
  text(line.name, width/2 - boxW/2 + 40, boxY - boxH/2 + 30); // 放在左上部分並留白
  
  // 對話
  rectMode(CORNER); // 改為 CORNER 模式，確保文字框定位正確 (強制固定在框內)
  textAlign(LEFT, TOP); // 改為左上對齊
  textSize(24); // 加大
  fill(255);
  // 樣式已在上方設定 (Bold, Stroke)
  text(currentText, width/2 - boxW/2 + 40, boxY - boxH/2 + 80, boxW - 200, boxH - 100);
  
  // 提示
  textSize(14);
  fill(150);
  textAlign(RIGHT, BOTTOM);
  text("點擊繼續...", width/2 + boxW/2 - 30, boxY + boxH/2 - 20);
}

/**
 * 繪製結局前導對話框 (與 Intro 類似)
 */
function drawPreludeDialogue() {
  // 優化：使用通用函式
  drawCinematicDialogue(preludeData, {
    strokeColor: color(255, 0, 0), // 紅色邊框
    nameColor: color(255, 50, 50), // 紅色名字
    boxY: height - 120,
    boxH: 200
  });
}

/**
 * 繪製抬頭顯示器 (HUD) - 顯示寶石蒐集進度
 */
function drawHUD() {
  // 繪製背景
  fill(0, 0, 0, 150);
  noStroke();
  rectMode(CORNER);
  rect(20, 20, 220, 50, 15);
  
  // 繪製文字
  fill(255, 215, 0); // 金色
  textSize(20);
  textAlign(LEFT, CENTER);
  text("助記詞:", 40, 45);
  
  // 繪製碎片圖示
  // q1: Crypto (Blue), q2: TW (Green), q3: US (Red)
  let startX = 130;
  let gap = 40;
  
  rectMode(CENTER);
  questioners.forEach((q, index) => {
      if (q.correctAnswersCount >= 3) {
          if (q.id === 'q1') fill(50, 205, 50); // 綠色 (台股)
          else if (q.id === 'q2') fill(0, 191, 255); // 藍色 (加密)
          else fill(255, 69, 0); // 紅色 (美股)
          
          drawingContext.shadowBlur = 10;
          drawingContext.shadowColor = 'white';
      } else {
          fill(80); // 未獲得 (灰色)
          drawingContext.shadowBlur = 0;
      }
      rect(startX + index * gap, 45, 20, 30, 4);
  });
  drawingContext.shadowBlur = 0;
}



/**
 * 繪製結局對話框
 */
function drawFinaleDialogue() {
  // 優化：使用通用函式
  drawCinematicDialogue(finaleData, {
    strokeColor: color(255, 215, 0), // 金色邊框
    nameColor: color(255, 215, 0),   // 金色名字
    boxY: height - 120,
    boxH: 200
  });
}

/**
 * 繪製結局結算畫面 (按鈕)
 */
function drawFinaleResult() {
    // 顯示通關文字
    fill(255, 215, 0);
    textSize(40);
    textAlign(CENTER, CENTER);
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'rgba(255, 215, 0, 0.8)';
    text("恭喜成功守護你的資產", width/2, height/2 - 50);
    drawingContext.shadowBlur = 0;
    
    // 繪製 '再玩一次' 按鈕
    const buttonW = 200;
    const buttonH = 60;
    const buttonY = height/2 + 50;

    playAgainYesButton = {
      x: width/2 - buttonW / 2,
      y: buttonY,
      w: buttonW,
      h: buttonH
    };

    const onYes = mouseX > playAgainYesButton.x && mouseX < playAgainYesButton.x + playAgainYesButton.w &&
                  mouseY > playAgainYesButton.y && mouseY < playAgainYesButton.y + playAgainYesButton.h;

    rectMode(CORNER);
    fill(onYes ? '#4CAF50' : '#8BC34A');
    rect(playAgainYesButton.x, playAgainYesButton.y, playAgainYesButton.w, playAgainYesButton.h, 10);
    fill(255);
    textSize(22);
    textAlign(CENTER, CENTER);
    text("再玩一次", playAgainYesButton.x + playAgainYesButton.w / 2, playAgainYesButton.y + playAgainYesButton.h / 2);
    
    if (onYes) cursor(HAND);
}

/**
 * 顯示問題介面
 */
function displayQuestion() {
  // 計算中間區域 (兩位角色之間)
  let panelW = width * 0.55; // 稍微加寬一點
  let panelX = (width - panelW) / 2;
  let panelH = 340; // 增加高度以容納提示按鈕
  let panelY = height - panelH - 15; // 往下一點，減少底部留白

  // 繪製中間對話框背景 (精緻透明風格)
  
  // 發光效果
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = 'rgba(255, 215, 0, 0.4)';

  fill(10, 20, 30, 220); // 深藍黑底，稍微提高不透明度以增加質感
  stroke(255, 215, 0); // 金色邊框
  strokeWeight(3);
  rectMode(CORNER);
  rect(panelX, panelY, panelW, panelH, 10);
  
  drawingContext.shadowBlur = 0; // 重置發光

  // 內層裝飾線 (增加精緻感)
  noFill();
  stroke(255, 215, 0, 80); // 淡金色
  strokeWeight(1);
  rect(panelX + 8, panelY + 8, panelW - 16, panelH - 16, 5);

  // 繪製問題文字
  fill(255); // 白色文字
  noStroke(); // 確保文字沒有邊框，看起來會比較細
  textAlign(CENTER, TOP); // 文字置中
  textSize(26);
  // 加上文字陰影增加可讀性
  drawingContext.shadowBlur = 4;
  drawingContext.shadowColor = 'black';
  text("問題：" + currentQuestion.question, panelX + 30, panelY + 25, panelW - 60, 70); // 調整文字區域，留出下方空間
  drawingContext.shadowBlur = 0;
  
  // 繪製選項按鈕
  optionButtons = [];
  let startY = panelY + 150; // 選項往下移
  let btnH = 50;
  let gap = 12;
  
  textSize(22);
  textAlign(LEFT, CENTER);
  let isAnyOptionHover = false;

  for (let i = 0; i < currentQuestion.options.length; i++) {
    let btnW = panelW - 80; // 按鈕寬度適應面板 (稍微內縮)
    let btnX = panelX + 40; // 按鈕置中於面板
    let btnY = startY + i * (btnH + gap);

    // 檢查滑鼠懸停
    let isHover = mouseX > btnX && mouseX < btnX + btnW &&
                  mouseY > btnY && mouseY < btnY + btnH;
    
    stroke(255, 215, 0); // 金色邊框
    strokeWeight(2);
    if (isHover) {
      fill(255, 215, 0); // 懸停變金
      isAnyOptionHover = true;
    } else {
      fill(0, 0, 0, 180); // 黑底 (稍微深一點以凸顯文字)
    }
    
    rect(btnX, btnY, btnW, btnH, 5);
    
    if (isHover) fill(0); else fill(255, 215, 0); // 文字變色
    noStroke();
    textStyle(BOLD);
    textAlign(CENTER, CENTER); // 選項文字置中
    text(currentQuestion.options[i], btnX + btnW / 2, btnY + btnH / 2);

    // 儲存按鈕區域供點擊偵測
    optionButtons.push({
      x: btnX, y: btnY, w: btnW, h: btnH, index: i + 1
    });
  }
  
  // --- 定義提示按鈕 (放在面板右上角) ---
  hintButton = {
    w: 80,
    h: 40,
    x: panelX + panelW - 80 - 40, // 放在最右邊，但保留邊距 (40px)
    y: panelY + 100, // 放在問題與選項之間
  };

  // 檢查滑鼠是否懸停在按鈕上
  const onHint = mouseX > hintButton.x && mouseX < hintButton.x + hintButton.w &&
                 mouseY > hintButton.y && mouseY < hintButton.y + hintButton.h;

  // --- 統一處理滑鼠指標 ---
  if (onHint || isAnyOptionHover) {
    cursor(HAND);
  } else if (gameState === 'ASKING') { // 只有在 ASKING 狀態才重設為箭頭
    cursor(ARROW);
  }

  // --- 繪製提示按鈕 ---
  stroke(255, 215, 0);
  strokeWeight(2);
  if (onHint) {
    fill(255, 215, 0); 
  } else {
    fill(0, 0, 0, 150); 
  }
  rectMode(CORNER);
  rect(hintButton.x, hintButton.y, hintButton.w, hintButton.h, 5);
  
  if (onHint) fill(0); else fill(255, 215, 0);
  noStroke();
  textSize(18);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text("提示", hintButton.x + hintButton.w / 2, hintButton.y + hintButton.h / 2);

}

/**
 * 處理滑鼠點擊事件
 */
function mousePressed() {
  // 確保音訊環境啟動 (針對瀏覽器自動播放策略，點擊任意處時啟動)
  if (typeof userStartAudio !== 'undefined' && getAudioContext().state !== 'running') {
    userStartAudio();
  }

  // --- 檢查是否點擊音量控制區 ---
  // 如果點擊了音量控制區域，則不觸發其他遊戲邏輯
  // 但在前導故事(INTRO_STORY)中，右上角是 SKIP 按鈕，不應該被這裡攔截
  // 轉場時(transition.active)音量控制已隱藏，不需攔截
  if (!transition.active && gameState !== 'INTRO_STORY' && mouseX > width - 160 && mouseX < width && mouseY >= 0 && mouseY < 60) {
    return;
  }

  // 處理開始畫面的點擊
  if (gameState === 'START_SCREEN') {
    handleStartScreenClick();
    return;
  }

  // --- 新增：壞結局對話點擊 ---
  if (gameState === 'BAD_ENDING') {
    let line = badEndingData.lines[badEndingData.dialogueIndex];
    if (badEndingData.charIndex < line.text.length) {
        badEndingData.charIndex = line.text.length;
    } else {
        badEndingData.dialogueIndex++;
        badEndingData.charIndex = 0;
        badEndingData.lastTypeTime = millis();
        if (badEndingData.dialogueIndex >= badEndingData.lines.length) {
            gameState = 'GAME_OVER'; // 對話結束後進入 Game Over
        }
    }
    return;
  }

  // 處理 Game Over 點擊
  if (gameState === 'GAME_OVER') {
      gameState = 'START_SCREEN';
      return;
  }

  // --- 新增：處理前導故事點擊 ---
  if (gameState === 'INTRO_STORY') {
    // 如果 SKIP 按鈕還沒出現，點擊任意處顯示它
    if (!introData.showSkip) {
        introData.showSkip = true;
        return; // 第一次點擊只顯示按鈕，防止誤觸
    }

    // 檢查是否點擊 SKIP (右上角區域)
    if (introData.showSkip && mouseX > width - 150 && mouseY < 80) {
        // 停止前導音效
        if (dropSound) dropSound.stop();
        if (zzzSound) zzzSound.stop();
        if (alarmSound) alarmSound.stop();

        transition.active = true;
        transition.state = 'IN';
        transition.nextState = 'MOVING';
        return;
    }

    // 只有在對話階段 (8秒後) 才允許點擊推進 (配合動畫調整)
    if (millis() - introData.startTime > 8000) {
        let currentLine = introData.lines[introData.dialogueIndex];
        // 如果還沒打完字，直接顯示全部
        if (introData.charIndex < currentLine.text.length) {
            introData.charIndex = currentLine.text.length;
        } else {
            introData.dialogueIndex++;
            introData.charIndex = 0; // 重置打字進度
            if (introData.dialogueIndex >= introData.lines.length) {
                // 確保進入遊戲時停止警報聲
                if (alarmSound) alarmSound.stop();

                transition.active = true;
                transition.state = 'IN';
                transition.nextState = 'MOVING';
            }
        }
    }
    return;
  }

  // --- 新增：處理結局前導動畫點擊 ---
  if (gameState === 'FINALE_PRELUDE') {
    let currentLine = preludeData.lines[preludeData.dialogueIndex];
    if (preludeData.charIndex < currentLine.text.length) {
      preludeData.charIndex = currentLine.text.length; // 瞬間顯示
    } else {
      preludeData.dialogueIndex++;
      preludeData.charIndex = 0;
      preludeData.lastTypeTime = millis();
      if (preludeData.dialogueIndex >= preludeData.lines.length) {
        startFinale(); // 對話結束，進入戰鬥
      }
    }
    return;
  }

  // 處理詢問介面的按鈕點擊
  if (gameState === 'PROMPT') {
    let isLastLine = currentDialogueIndex === currentDialogueLines.length - 1;
    let currentLine = currentDialogueLines[currentDialogueIndex];
    let isTextFinished = dialogueCharIndex === currentLine.length;

    // 如果還沒說完，點擊推進對話
    if (!isLastLine || !isTextFinished) {
        if (!isTextFinished) {
            dialogueCharIndex = currentLine.length; // 瞬間顯示
        } else {
            currentDialogueIndex++;
            dialogueCharIndex = 0;
            lastDialogueTypeTime = millis();
        }
        return;
    }

    // 只有說完後才檢查按鈕
    const onYes = mouseX > yesButton.x && mouseX < yesButton.x + yesButton.w &&
                  mouseY > yesButton.y && mouseY < yesButton.y + yesButton.h;
    const onNo = mouseX > noButton.x && mouseX < noButton.x + noButton.w &&
                 mouseY > noButton.y && mouseY < noButton.y + noButton.h;

    if (onYes) {
      // 模擬按下 'Y'
      key = 'Y';
      promptKeyPressed();
    } else if (onNo) {
      // 模擬按下 'N'
      key = 'N';
      promptKeyPressed();
    }
    return; // 處理完畢，直接返回
  }
  
  // 新增：處理場景對話點擊
  if (gameState === 'SCENE_DIALOGUE' || gameState === 'SCENE_INTRO') {
    let currentLine = currentDialogueLines[currentDialogueIndex];
    if (currentLine && dialogueCharIndex < currentLine.length) {
        dialogueCharIndex = currentLine.length; // 瞬間顯示完成
    } else {
        currentDialogueIndex++;
        dialogueCharIndex = 0; // 重置打字
        lastDialogueTypeTime = millis();
        if (currentDialogueIndex >= currentDialogueLines.length) {
          if (gameState === 'SCENE_INTRO') {
              // 介紹結束，開始問答
              gameState = 'ASKING';
          } else {
              // 答對後的對話結束，回到移動模式
              transition.active = true;
              transition.state = 'IN';
              transition.nextState = 'MOVING';
          }
        }
    }
    return;
  }

  // 檢查是否在勝利畫面點擊 '再玩一次'
  if (gameState === 'FINALE') {
    // --- 新增：點擊關閉結局提示 ---
    if (showFinaleInstructions) {
        showFinaleInstructions = false;
        celestialEffect.finaleStartTime = millis(); // 重置計時器，讓淡入動畫從現在開始
        return;
    }

    // --- 新增：結局爆發對話點擊 ---
    if (showFinaleBurst) {
        let line = finaleBurstData.lines[finaleBurstData.dialogueIndex];
        if (finaleBurstData.charIndex < line.text.length) {
            finaleBurstData.charIndex = line.text.length;
        } else {
            finaleBurstData.dialogueIndex++;
            finaleBurstData.charIndex = 0;
            finaleBurstData.lastTypeTime = millis();
        }
        return;
    }

    // --- 新增：結局問答點擊處理 ---
    if (finaleQuizActive) {
        for (let btn of finaleQuizOptions) {
            if (mouseX > btn.x && mouseX < btn.x + btn.w &&
                mouseY > btn.y && mouseY < btn.y + btn.h) {
                handleFinaleQuizAnswer(btn.isCorrect);
                return;
            }
        }
        return; // 問答中不允許射擊
    }
    // ---------------------------

    // 只有當勝利畫面顯示時 (isFrozen 為真)，才檢查按鈕點擊
    if (celestialEffect.isFrozen) {
        if (recoveryState === 'DIALOGUE') {
            // 推進結局對話
            let line = finaleData.lines[finaleData.dialogueIndex];
            if (finaleData.charIndex < line.text.length) {
                finaleData.charIndex = line.text.length;
            } else {
                finaleData.dialogueIndex++;
                finaleData.charIndex = 0;
                finaleData.lastTypeTime = millis();
                if (finaleData.dialogueIndex >= finaleData.lines.length) {
                    recoveryState = 'DONE';
                }
            }
            return;
        } else if (recoveryState === 'DONE') {
            const onYes = mouseX > playAgainYesButton.x && mouseX < playAgainYesButton.x + playAgainYesButton.w &&
                          mouseY > playAgainYesButton.y && mouseY < playAgainYesButton.y + playAgainYesButton.h;
            if (onYes) {
              resetGame();
            }
            return;
        }
    } else if (mouseButton === LEFT) {
        // 結局模式下，按滑鼠左鍵發射
        if (playerAmmo > 0) {
          playerAmmo--;

          // 計算朝向滑鼠的向量
          let v = createVector(mouseX - player.x, mouseY - player.y);
          v.normalize();
          v.mult(15); // 設定速度

          projectiles.push({
            x: player.x,
            y: player.y,
            vx: v.x,
            vy: v.y,
            size: 20
          });
        }
    }
  }

  // 只有在提問狀態下才檢查按鈕點擊
  if (gameState === 'ASKING') {
    // 檢查選項按鈕
    for (let btn of optionButtons) {
      if (mouseX > btn.x && mouseX < btn.x + btn.w &&
          mouseY > btn.y && mouseY < btn.y + btn.h) {
        handleAnswer(btn.index);
        return;
      }
    }

    const onHint = mouseX > hintButton.x && mouseX < hintButton.x + hintButton.w &&
                   mouseY > hintButton.y && mouseY < hintButton.y + hintButton.h;

    if (onHint) {
      hintTimer = millis() + 2000; // 點擊提示按鈕時，設定提示計時器為 2 秒
    }
  }
}

/**
 * --- 新增：管理背景音樂 ---
 * 根據遊戲狀態切換輕鬆或緊張的音樂
 */
function manageBackgroundMusic() {
  let targetMusic = null;

  // 根據遊戲狀態決定要播放的音樂
  if (gameState === 'INTRO_STORY') {
    targetMusic = null; // 動畫時不播背景音
  } else if (gameState === 'MOVING' || gameState === 'START_SCREEN') {
    if (isForcedReturn) {
      targetMusic = null; // 被控制時不播背景音樂 (TF.mp3 播放中)
    } else if (gameState === 'MOVING' && moonwalkMode && player.isMoving) {
      targetMusic = mjMusic; // Moonwalk 模式且移動時播放 MJ
    } else {
      targetMusic = bgMusic; // 否則播放背景音樂
    }
  } else if (gameState === 'SCENE_INTRO' || gameState === 'ASKING' || gameState === 'ANSWERED' || gameState === 'SCENE_DIALOGUE') {
    targetMusic = answerMusic; // 問答時播放 answer.mp3
  } else if (gameState === 'PROMPT') {
    targetMusic = bgMusic; // 在地圖上詢問時，維持背景音樂
  } else if (gameState === 'FINALE_PRELUDE') {
    targetMusic = null; // 前導動畫時靜音或播放音效
  } else if (gameState === 'FINALE') {
    targetMusic = fightMusic; // 結局戰鬥時播放 fight.mp3
  }

  if (targetMusic) {
    // 計算特定音樂的音量 (問答時調高)
    let currentVol = volumeLevel;
    if (targetMusic === answerMusic) {
        currentVol = min(volumeLevel * 5, 1.0);
    }
    if (targetMusic === mjMusic) {
        currentVol = volumeLevel; // MJ 音樂音量降低
    }

    // 如果目標音樂沒有在播放，則切換
    if (!targetMusic.isPlaying()) {
      // 停止其他所有音樂
      if (bgMusic && bgMusic !== targetMusic) bgMusic.stop();
      if (answerMusic && answerMusic !== targetMusic) answerMusic.stop();
      if (fightMusic && fightMusic !== targetMusic) fightMusic.stop();
      if (mjMusic && mjMusic !== targetMusic) mjMusic.stop();
      
      // 播放目標音樂
      if (targetMusic.isLoaded()) {
        targetMusic.setVolume(currentVol);
        
        if (targetMusic === bgMusic) {
            // 剪掉最後 3 秒空白，實現無縫循環
            // loop(startTime, rate, amp, cueLoopStart, duration)
            let playDuration = max(0, targetMusic.duration() - 3);
            targetMusic.loop(0, 1, currentVol, 0, playDuration);
        } else {
            targetMusic.loop();
        }
      }
    } else {
      // 如果正在播放，確保音量正確 (即時調整)
      targetMusic.setVolume(currentVol);
    }
  } else {
    // 如果目標是靜音 (null)，停止所有音樂
    if (bgMusic) bgMusic.stop();
    if (answerMusic) answerMusic.stop();
    if (fightMusic) fightMusic.stop();
    if (mjMusic) mjMusic.stop();
  }
}

/**
 * --- 新增：繪製開始畫面 ---
 */
function drawStartScreen() {
  // 繪製背景圖片
  imageMode(CORNER);
  for (let x = 0; x < width; x += bgDrawWidth) {
    image(bgImage, x, 0, bgDrawWidth, height);
  }

  // --- 1. 背景粒子特效 (已在 setup 初始化) ---
  noStroke();
  for (let p of startScreenParticles) {
    fill(255, 215, 0, p.alpha); // 金色粒子
    circle(p.x, p.y, p.size);
    p.y -= p.speed; // 向上飄
    if (p.y < -10) {
      p.y = height + 10;
      p.x = random(width);
    }
  }

  // --- 2. 標題特效 (上下浮動 + 發光) ---
  let titleY = height * 0.2 + sin(frameCount * 0.05) * 10;

  fill(255, 215, 0); // 金色
  textAlign(CENTER, CENTER);
  textSize(60);
  
  // 簡單發光效果
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = 'rgba(255, 215, 0, 0.5)';
  text("金融試煉:幕後黑手", width / 2, titleY);
  drawingContext.shadowBlur = 0; // 重置

  // 按鈕參數
  let btnW = 300;
  let btnH = 60;
  let startY = height * 0.4;
  let gap = 80;

  rectMode(CENTER);
  strokeWeight(2);
  cursor(ARROW); // 預設游標

  // 繪製按鈕的輔助函式
  function drawAnimatedButton(label, x, y) {
    let isHover = mouseX > x - btnW / 2 && mouseX < x + btnW / 2 &&
                  mouseY > y - btnH / 2 && mouseY < y + btnH / 2;
    
    let scaleVal = isHover ? 1.05 : 1.0;
    
    push();
    translate(x, y);
    scale(scaleVal);
    
    // 金融風格按鈕
    stroke(255, 215, 0); // 金色邊框
    strokeWeight(2);
    
    if (isHover) {
        fill(255, 215, 0); // 懸停變金
        drawingContext.shadowBlur = 15;
        drawingContext.shadowColor = 'rgba(255, 215, 0, 0.5)';
    } else {
        fill(10, 20, 30, 200); // 預設深色底
        drawingContext.shadowBlur = 0;
    }
    
    rect(0, 0, btnW, btnH, 5);
    
    // 文字顏色
    if (isHover) fill(0); else fill(255, 215, 0);
    noStroke();
    textSize(24);
    textStyle(BOLD);
    text(label, 0, 0);
    
    pop();
    
    if (isHover) cursor(HAND);
  }

  drawAnimatedButton("開始遊戲", width / 2, startY);
  drawAnimatedButton("玩法介紹", width / 2, startY + gap);
  drawAnimatedButton("遊戲主旨", width / 2, startY + gap * 2);

  // 繪製彈窗 (如果開啟)
  if (showHowToPlay) {
    drawOverlay("玩法介紹", "【探索模式】\nWASD移動角色，尋找三位守護者。\n滑鼠左鍵回答問題，答對三次可獲得助記詞碎片。\n\n【結局模式】\n集齊碎片後，幕後黑手現身！\n滑鼠左鍵發射電擊麻痺對手，趁機靠近抓捕。\n小心躲避攻擊，找出真身並完成三次抓捕！");
  } else if (showAbout) {
    drawOverlay("遊戲主旨", "皮卡丘的冷錢包被神秘黑影破壞了！\n雖然資產還在鏈上，但沒有助記詞無法存取。\n\n由於為了安全，曾經把助記詞分散到在三位守護者手中。\n\n現在必須通過台股、美股、加密貨幣三者的金融試煉，\n才能拿回所有的註記詞，啟動新的冷錢包，\n並找揭露事件背後的兇手！");
  }
}

function drawOverlay(title, content) {
  fill(0, 0, 0, 200);
  rectMode(CORNER);
  rect(0, 0, width, height);

  fill(255);
  rectMode(CENTER);
  
  // 金融風格彈窗
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = 'rgba(255, 215, 0, 0.5)';
  
  stroke(255, 215, 0);
  strokeWeight(3);
  fill(10, 20, 30, 250);
  
  // 調整框框大小 (適中大小，確保文字容納)
  let boxW = 540;
  let boxH = 400;
  rect(width / 2, height / 2, boxW, boxH, 10);
  
  drawingContext.shadowBlur = 0;

  noStroke();
  fill(255, 215, 0);
  textStyle(BOLD);
  textSize(32);
  textAlign(CENTER, TOP); // 標題置中靠上
  text(title, width / 2, height / 2 - boxH/2 + 30);

  fill(255);
  textSize(18);
  textStyle(NORMAL);
  textLeading(28); // 行距
  rectMode(CORNER); // 重要修正：切換回 CORNER 模式，確保文字框以左上角定位，解決文字偏左上的問題
  textAlign(LEFT, TOP); // 內文靠左對齊，排版較整齊
  // 計算文字框位置 (置中於框框內)
  let textPadding = 40;
  let textW = boxW - textPadding * 2;
  let textH = boxH - 110; // 預留底部空間
  text(content, width / 2 - textW / 2, height / 2 - boxH/2 + 80, textW, textH);

  fill(255, 215, 0, 150);
  textSize(16);
  textAlign(CENTER, BOTTOM); // 底部提示置中靠下
  text("點擊任意處關閉", width / 2, height / 2 + boxH/2 - 20);
}

function handleStartScreenClick() {
  if (showHowToPlay || showAbout) {
    showHowToPlay = false;
    showAbout = false;
    return;
  }

  let btnW = 300;
  let btnH = 60;
  let startY = height * 0.4;
  let gap = 80;

  // 檢查 開始遊戲
  if (mouseX > width / 2 - btnW / 2 && mouseX < width / 2 + btnW / 2 &&
      mouseY > startY - btnH / 2 && mouseY < startY + btnH / 2) {
    
    // 啟動音訊環境 (瀏覽器通常要求使用者互動後才能播放聲音)
    if (typeof userStartAudio !== 'undefined') {
      userStartAudio();
    }

    // 啟動轉場動畫
    transition.active = true;
    transition.state = 'IN';
    transition.nextState = 'INTRO_STORY'; // 改為進入前導故事
  }

  // 檢查 玩法介紹
  if (mouseX > width / 2 - btnW / 2 && mouseX < width / 2 + btnW / 2 &&
      mouseY > startY + gap - btnH / 2 && mouseY < startY + gap + btnH / 2) {
    showHowToPlay = true;
  }

  // 檢查 遊戲主旨
  if (mouseX > width / 2 - btnW / 2 && mouseX < width / 2 + btnW / 2 &&
      mouseY > startY + gap * 2 - btnH / 2 && mouseY < startY + gap * 2 + btnH / 2) {
    showAbout = true;
  }
}

/**
 * --- 新增：重置遊戲 ---
 */
function resetGame() {
  // 重置遊戲狀態
  gameState = 'MOVING';
  activeQuestioner = null;
  currentQuestion = null;
  player.feedbackState = null;
  finaleCatchCount = 0;
  player.speed = 4; // 重置速度
  player.animation.frameDelay = 10; // 重置動畫速度
  clones = []; // 重置分身
  player.stunEndTime = 0; // 重置玩家暈眩
  playerCurrentHealth = playerMaxHealth; // 重置血量
  showFinaleBurst = false; // 重置爆發狀態
  isForcedReturn = false; // 重置強制返回
  returnTargetQ = null;
  isChasingPlayer = false; // 重置追逐狀態
  finaleQuestionsPool = []; // 重置題目池
  if (tfSound && tfSound.isPlaying()) tfSound.stop(); // 停止 TF 音效
  if (ydSound && ydSound.isPlaying()) ydSound.stop(); // 停止 YD 音效

  // 重置夢幻狀態 (恢復原本的移動機制)
  hintGiver.x = 150;
  hintGiver.y = height - 80;
  hintGiver.speedX = 2.0;
  hintGiver.speedY = 1.5;
  hintGiver.stunEndTime = 0;

  // --- 重置玩家位置到初始點 ---
  let centerX = 0;
  let centerY = 0;
  for (let q of questioners) {
    centerX += q.x;
    centerY += q.y;
  }
  centerX /= questioners.length;
  centerY /= questioners.length;
  player.x = centerX;
  player.y = centerY - 100;

  // 重置所有提問者
  for (let q of questioners) {
    q.correctAnswersCount = 0;
    q.reaction = null;
    q.reactionText = null;
    q.cooldownUntil = 0;
    q.hasRefused = false; // 重置拒絕狀態
    // 根據 ID 重新分配題庫
    if (q.id === 'q1') {
      q.questions = [...twStockQuestions];
    } else if (q.id === 'q2') {
      q.questions = [...cryptoQuestions];
    } else if (q.id === 'q3') {
      q.questions = [...usStockQuestions];
    }
  }

  // 停用星空效果
  celestialEffect.isActive = false;
  celestialEffect.particles = [];
  celestialEffect.isFrozen = false; // 重置靜止狀態
  celestialEffect.isExpanding = false; // 重置擴散狀態
  celestialEffect.radius = 250; // 重置半徑

  cursor(ARROW); // 恢復滑鼠指標
}

/**
 * 處理按鍵事件 (答題)
 */
function keyPressed() {
  // 檢查 'M' 鍵來切換移動模式
  if (key.toUpperCase() === 'M') {
    moonwalkMode = !moonwalkMode;
  }
  

  // --- 除錯用：按下 'P' 鍵直接完成所有問題 ---
  if (key.toUpperCase() === 'P') {
    for (let q of questioners) {
      q.correctAnswersCount = 3;
    }
    console.log("DEBUG: All questions completed.");
  }

  if (gameState === 'PROMPT') {
    promptKeyPressed(); //如果再prompt狀態 就會到這邊
    return;
  }

  if (gameState === 'ASKING') {
    let choice = parseInt(key);
    handleAnswer(choice);
  }
}

/**
 * 顯示提示介面
 */
function displayTimedHint() {
  if (millis() < hintTimer) {
    // 夢幻的位置 (參考 drawRoomEnvironment)
    const mewX = width * 0.1;
    const mewY = height * 0.55;

    // 對話框位置 (夢幻右側)
    const boxW = 320;
    const boxH = 120;
    const boxX = mewX + boxW / 2 + 50; 
    const boxY = mewY - 30;

    push();
    translate(boxX, boxY);

    // 繪製對話框 (漫畫風格氣泡)
    fill(255);
    stroke(0);
    strokeWeight(2);
    rectMode(CENTER);
    
    // 氣泡本體
    rect(0, 0, boxW, boxH, 15);
    
    // 氣泡尾巴 (指向左側的夢幻)
    // 先用白色無邊框矩形蓋住左側邊框的一小段
    noStroke();
    fill(255);
    rect(-boxW / 2, 30, 10, 40); 
    
    // 再畫尾巴的線條
    stroke(0);
    strokeWeight(2);
    line(-boxW / 2, 10, -boxW / 2 - 30, 40); // 上邊
    line(-boxW / 2 - 30, 40, -boxW / 2, 50); // 下邊

    // 繪製提示文字
    noStroke();
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(22);
    textStyle(BOLD);
    text("提示：\n" + currentQuestion.hint, 0, 0, boxW - 20, boxH - 20);
    
    pop();
  }
}

/**
 * 顯示答題回饋
 */
function displayFeedback() {
  // 移除原本在畫面中央顯示文字的程式碼，改由提問者氣泡顯示

  // 倒數計時後返回移動狀態
  if (millis() > feedbackTimer) {
    // 如果是按 'X' 離開 (此時玩家沒有回饋狀態)，才設定冷卻時間
    if (player.feedbackState === null && activeQuestioner) {
      activeQuestioner.cooldownUntil = millis() + 3000;
    }

    if (player.feedbackState === 'correct') {
      // 如果玩家答對了，但還沒滿足三題的條件
      if (activeQuestioner.correctAnswersCount < 3) {
        // 立刻進入下一個問題
        gameState = 'ASKING';
        let randomIndex = floor(random(activeQuestioner.questions.length));
        currentQuestion = activeQuestioner.questions[randomIndex];
        // 清除反應，準備下一題
        activeQuestioner.reaction = null;
        activeQuestioner.reactionText = '';
      } else { // 如果已經答對三題，則進入新場景對話
        gameState = 'SCENE_DIALOGUE';
        currentDialogueIndex = 0;
        dialogueCharIndex = 0; // 重置打字索引
        lastDialogueTypeTime = millis();
        
        // 根據提問者設定不同的對話內容
        if (activeQuestioner.id === 'q1') {
             currentDialogueLines = ["​你身後的這座宏偉建築。", "就是全球半導體的頂點——台積電 (TSMC)。", "在台股市場，它被稱為『護國神山』，因為它一家公司佔台股的權重就高達40%。", "撐起了整片森林。","這是你給我保管的助記詞現在，還給你"];
        } else if (activeQuestioner.id === 'q2') {
             currentDialogueLines = ["這道裂縫是區塊鏈的具象化。", "無數的節點與算力在此構築成去中心化的信仰。", "你展現了對加密世界的理解。這是你當初委託給我保管的助記詞，拿回去吧。"];
        } else {
             currentDialogueLines = ["這個藍洞代表著華爾街的深不可測。", "在你背後的那頭華爾街銅牛，象徵著牛市的樂觀與景氣，更是華爾街金融區的象徵。", "你證明了你有駕馭資本的資格。這是你當初交給我守護的助記詞，現在物歸原主。"];
        }
        
        player.feedbackState = null; // 清除玩家的反應狀態
        // 注意：這裡不清除 activeQuestioner，因為對話場景需要用到它
      }
    } else if (player.feedbackState === null) { // 按 'X' 離開
      // 觸發轉場回到移動模式
      if (!transition.active) {
        transition.active = true;
        transition.state = 'IN';
        transition.nextState = 'MOVING';
      }
    } else { // 如果答錯了，就返回問題介面並顯示提示
      hintTimer = millis() + 2000; // 答錯時，自動顯示提示 2 秒
      gameState = 'ASKING'; // 返回問題介面
      // 清除反應，讓玩家和提問者恢復正常狀態
      if (activeQuestioner) {
        activeQuestioner.reaction = null;
        activeQuestioner.reactionText = '';
      }
      player.feedbackState = null;
    }
  }
}

/**
 * --- 新增：繪製轉場動畫 ---
 */
function drawTransition() {
  // 更新進度
  if (transition.state === 'IN') {
    transition.progress += transition.speed;
    if (transition.progress >= 1) {
      transition.progress = 1;
      transition.state = 'HOLD';
      transition.holdTimer = 30; // 停留約 0.5 秒，確保完全遮蓋
      
      // 當完全蓋住時，切換到目標狀態
      if (transition.nextState) {
        // 如果是回到移動模式，執行清理工作
        if (transition.nextState === 'INTRO_STORY') {
             introData.startTime = millis();
             introData.dialogueIndex = 0;
             introData.playedFalling = false;
             introData.playedShatter = false;
             introData.charIndex = 0;
             introData.playedAlarm = false;
             introData.showSkip = false;
        }
        if (transition.nextState === 'SCENE_INTRO') {
             // 應用暫存的對話內容
             if (transition.nextDialogueLines) {
                 currentDialogueLines = transition.nextDialogueLines;
                 currentDialogueIndex = 0;
                 dialogueCharIndex = 0;
                 lastDialogueTypeTime = millis();
                 transition.nextDialogueLines = null;
             }
        }
        if (transition.nextState === 'MOVING') {
           // 如果是從房間相關狀態回來，恢復玩家在地圖上的位置
           if (gameState === 'SCENE_DIALOGUE' || gameState === 'ANSWERED' || gameState === 'ASKING' || gameState === 'SCENE_INTRO') {
               player.x = savedMapPos.x;
               player.y = savedMapPos.y;
           }
           if (activeQuestioner) {
             activeQuestioner.reaction = null;
             activeQuestioner.reactionText = '';
           }
           activeQuestioner = null;
           currentQuestion = null;
           player.feedbackState = null;
        }
        gameState = transition.nextState;
        transition.nextState = null;
      }
    }
  } else if (transition.state === 'HOLD') {
    transition.holdTimer--;
    if (transition.holdTimer <= 0) {
      transition.state = 'OUT';
    }
  } else {
    transition.progress -= transition.speed;
    if (transition.progress <= 0) {
      transition.progress = 0;
      transition.active = false;
      transition.speed = 0.02; // 重置回預設速度
    }
  }

  if (transition.progress <= 0) return;

  // 繪製雲朵般的遮罩
  noStroke();
  rectMode(CORNER); // 確保使用 CORNER 模式繪製，以覆蓋全螢幕
  
  let maxW = width / 2 + 150; // 增加額外寬度以確保重疊
  let offset = maxW * transition.progress;
  
  let ctx = drawingContext;

  // 左側漸層 (白雲)
  let gradL = ctx.createLinearGradient(0, 0, offset, 0);
  gradL.addColorStop(0, 'rgb(255, 255, 255)');  
  gradL.addColorStop(1, 'rgb(255, 255, 255)');
  ctx.fillStyle = gradL;
  ctx.fillRect(0, 0, offset, height);
  
  // 右側漸層 (白雲)
  let gradR = ctx.createLinearGradient(width, 0, width - offset, 0);
  gradR.addColorStop(0, 'rgb(255, 255, 255)');
  gradR.addColorStop(1, 'rgb(255, 255, 255)');
  ctx.fillStyle = gradR;
  ctx.fillRect(width - offset, 0, offset, height);
  
  // 邊緣圓形 (使用漸層末端的顏色)
  fill(255, 255, 255);

  // 在邊緣繪製圓形，模擬雲朵形狀
  for (let y = 0; y <= height; y += 30) {
      let r = 80 + (y % 40); // 讓圓形大小有變化
      // 左側邊緣雲朵 (多層次)
      circle(offset, y, r); 
      circle(offset - 20, y + 15, r * 0.8);
      // 右側邊緣雲朵 (多層次)
      circle(width - offset, y, r); 
      circle(width - offset + 20, y + 15, r * 0.8);
  }
}

/**
 * --- 新增：繪製室內場景背景與角色 ---
 */
function drawRoomEnvironment() {
  // 根據當前互動的角色決定背景
  let currentBg = null;
  if (activeQuestioner) {
    if (activeQuestioner.id === 'q1') currentBg = twBg;       // 小火龍 (台股)
    else if (activeQuestioner.id === 'q2') currentBg = btcBg; // 傑尼龜 (加密)
    else if (activeQuestioner.id === 'q3') currentBg = usaBg; // 伊布 (美股)
  }

  if (currentBg) {
    imageMode(CORNER);
    image(currentBg, 0, 0, width, height);
  } else {
    // 預設背景 (如果沒有圖片)
    background(60, 40, 70); 
    noStroke();
    fill(100, 80, 110);
    rect(0, height * 0.4, width, height * 0.6);
    fill(150, 200, 255, 100);
    rect(width * 0.2, height * 0.1, 150, 200);
    rect(width * 0.7, height * 0.1, 150, 200);
  }

  // 只有在非介紹或對話狀態下才繪製角色 (介紹時只顯示背景與對話框)
  if (gameState !== 'SCENE_INTRO' && gameState !== 'SCENE_DIALOGUE') {
    // 繪製玩家 (左側，面向右)
    push();
    translate(width * 0.1, height * 0.85); // 改至更左下方角落
    scale(-1, 1); // 翻轉面向右
    let anim = player.animation.stand;
    // 更新動畫
    updateFrame(player.animation, anim.totalFrames);
    
    let frameX = player.animation.currentFrame * anim.w;
    imageMode(CENTER);
    image(anim.img, 0, 0, anim.w * playerScale * 2.0, anim.h * playerScale * 2.0, frameX, 0, anim.w, anim.h); // 稍微放大
    pop();

    // 繪製夢幻 (皮卡丘上方)
    push();
    translate(width * 0.1, height * 0.55); // 改至更左邊，皮卡丘上方
    // 更新動畫
    updateFrame(hintGiver, hintGiver.totalFrames);
    
    let hFrameX = hintGiver.currentFrame * hintGiver.w;
    imageMode(CENTER);
    // 稍微放大一點
    image(hintGiver.img, 0, 0, hintGiver.w * hintGiver.scale * 1.5, hintGiver.h * hintGiver.scale * 1.5, hFrameX, 0, hintGiver.w, hintGiver.h);
    pop();

    // 繪製提問者 (右側)
    if (activeQuestioner) {
      let q = activeQuestioner;
      push();
      translate(width * 0.9, height * 0.85); // 改至更右下方角落
      // 更新動畫
      updateFrame(q, q.totalFrames);
      
      let qFrameX = q.currentFrame * q.w;
      imageMode(CENTER);
      image(q.img, 0, 0, q.w * questionerScale * 2.0, q.h * questionerScale * 2.0, qFrameX, 0, q.w, q.h); // 稍微放大
      pop();

      // --- 新增：顯示提問者反應 (答對/答錯) ---
      if (q.reactionText) {
          push();
          let bubbleX = width * 0.9;
          let bubbleY = height * 0.85 - 120; // 放在頭頂上方
          let textContent = q.reactionText;
          
          if (q.reaction === 'correct') {
            textSize(24); // 放大字體
            textStyle(BOLD);
            const textW = textWidth(textContent) + 40;
            const textH = 60;

            // 繪製外框
            fill(255, 250, 205); // 檸檬雪紡色
            stroke(255, 215, 0); // 金色
            strokeWeight(3);
            rectMode(CENTER);
            rect(bubbleX, bubbleY, textW, textH, 15);

            // 繪製文字
            noStroke();
            fill(50); // 深灰色文字
            textAlign(CENTER, CENTER);
            text(textContent, bubbleX, bubbleY);
          } else {
            textSize(22);
            const textW = textWidth(textContent) + 40;
            const textH = 60;

            fill(255);
            stroke(0);
            strokeWeight(2);
            rectMode(CENTER);
            rect(bubbleX, bubbleY, textW, textH, 10);
            noStroke();
            fill(0);
            textAlign(CENTER, CENTER);
            text(textContent, bubbleX, bubbleY);
          }
          pop();
      }
    }
  }
}

function drawDialogueBox() {
  // 繪製對話框 (金融風格)
  let boxH = 200;
  let margin = 20;

  // 發光效果
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = 'rgba(255, 215, 0, 0.4)';

  fill(10, 20, 30, 245); // 深色底
  stroke(255, 215, 0); // 金色邊框
  strokeWeight(3);
  rectMode(CORNER);
  rect(margin, height - boxH - margin, width - margin * 2, boxH, 5);
  
  drawingContext.shadowBlur = 0;

  // --- 新增：繪製提問者頭像與稱號 ---
  let textStartX = margin + 40;
  let textStartY = height - boxH - margin + 40;
  let textWidth = width - margin * 2 - 80;

  if (activeQuestioner) {
      // 稱號 (左上角)
      let name = "";
      if (activeQuestioner.id === 'q1') name = "台股森林捍衛者";
      else if (activeQuestioner.id === 'q2') name = "加密裂縫主宰者";
      else if (activeQuestioner.id === 'q3') name = "美股藍洞守護者";

      fill(255, 215, 0); // 金色
      noStroke();
      textSize(24);
      textStyle(BOLD);
      textAlign(LEFT, TOP);
      text(name, margin + 40, height - boxH - margin + 25);

      // 頭像 (右側)
      let q = activeQuestioner;
      let pScale = 3;
      imageMode(CENTER);
      let portraitX = width - margin - 100;
      let portraitY = height - margin - boxH / 2;
      image(q.img, portraitX, portraitY, q.w * pScale, q.h * pScale, 0, 0, q.w, q.h);

      // 調整文字區域 (避開頭像與稱號)
      textStartY += 30; 
      textWidth -= 150; 
  }

  // 繪製文字
  let currentLine = currentDialogueLines[currentDialogueIndex];
  if (currentLine) {
      if (millis() - lastDialogueTypeTime > 30) {
        if (dialogueCharIndex < currentLine.length) {
            dialogueCharIndex++;
            lastDialogueTypeTime = millis();
        }
      }
  }
  let textToDisplay = currentLine ? currentLine.substring(0, dialogueCharIndex) : "";

  fill(255); // 白字
  noStroke();
  textAlign(LEFT, TOP);
  textStyle(NORMAL); // 確保對話文字為一般粗細
  textSize(28);
  text(textToDisplay, textStartX, textStartY, textWidth, boxH - 80);
  
  // 繼續提示 (紅色倒三角)
  if (frameCount % 60 < 30) {
    fill(255, 0, 0);
    textAlign(RIGHT, BOTTOM);
    textSize(20);
    text("▼", width - margin - 30, height - margin - 20);
  }
}

/**
 * 處理回答邏輯
 */
function handleAnswer(choice) {
  if (choice >= 1 && choice <= 3) {
    gameState = 'ANSWERED';
    feedbackTimer = millis() + 1500; // 顯示回饋 1.5 秒
    if (choice === currentQuestion.answer) {
      feedbackMessage = "答對了！";
      activeQuestioner.correctAnswersCount++; // 為當前的提問者增加答對次數
      finaleQuestionsPool.push(currentQuestion); // 加入題目池
      playCorrectSound(); // 播放答對音效
      activeQuestioner.reaction = 'correct';
      activeQuestioner.reactionText = "答對了！ " + random(correctPhrases); // 由提問者說出結果
      player.feedbackState = 'correct';
      // 從未問問題列表中移除剛剛答對的問題
      const index = activeQuestioner.questions.indexOf(currentQuestion);
      if (index > -1) {
        activeQuestioner.questions.splice(index, 1);
      }
    } else {
      // --- 答錯時的邏輯 (恢復原狀) ---
      feedbackMessage = "答錯了！";
      playWrongSound(); // 播放答錯音效
      activeQuestioner.reaction = 'wrong';
      activeQuestioner.reactionText = "答錯了！ " + random(wrongPhrases); // 由提問者說出結果
      player.feedbackState = 'wrong';
      // 答錯時，將回饋時間延長，讓玩家有時間看提示
      feedbackTimer = millis() + 1500; // 將答錯的回饋時間也改為 1.5 秒
    }
  }
}

/**
 * 播放答對音效
 */
function playCorrectSound() {
  if (correctSound && correctSound.isLoaded()) {
    correctSound.setVolume(min(volumeLevel * 5, 1.0)); // 答對音效調高
    correctSound.play();
  }
}

/**
 * 播放答錯音效
 */
function playWrongSound() {
  if (wrongSound && wrongSound.isLoaded()) {
    wrongSound.setVolume(min(volumeLevel * 5, 1.0)); // 答錯音效調高
    wrongSound.play();
  }
}

/**
 * --- 新增：繪製音量控制 ---
 */
function drawVolumeControl() {
  // 轉場動畫進行時，隱藏音量控制
  if (transition.active) return;

  let iconX = width - 30;
  let iconY = 30;
  
  // 定義感應區域 (包含圖示與滑桿展開的區域)
  let areaX = width - 160;
  let areaY = 0;
  let areaW = 160;
  let areaH = 60;
  
  let isHovering = mouseX > areaX && mouseX < width && mouseY > areaY && mouseY < areaY + areaH;
  
  // 繪製喇叭圖示
  push();
  translate(iconX, iconY);
  noStroke();
  fill(255);
  
  // 喇叭主體
  beginShape();
  vertex(-6, -6);
  vertex(-12, -6);
  vertex(-12, 6);
  vertex(-6, 6);
  vertex(6, 12);
  vertex(6, -12);
  endShape(CLOSE);
  
  // 聲波 (根據音量顯示)
  stroke(255);
  strokeWeight(2);
  noFill();
  if (volumeLevel > 0) arc(8, 0, 10, 10, -PI/3, PI/3);
  if (volumeLevel > 0.5) arc(14, 0, 16, 16, -PI/3, PI/3);
  pop();

  // 滑鼠懸停時顯示滑桿
  if (isHovering) {
      let sliderX = width - 150;
      let sliderY = 30;
      let sliderW = 100;
      let sliderH = 6;

      // 背景底色
      noStroke();
      fill(0, 0, 0, 150);
      rectMode(CORNER);
      rect(sliderX - 10, sliderY - 15, sliderW + 20, 30, 15);

      // 滑桿軌道
      fill(100);
      rect(sliderX, sliderY - sliderH/2, sliderW, sliderH, 3);

      // 滑桿進度
      fill(255, 215, 0); // 金色
      let currentW = map(volumeLevel, 0, 1, 0, sliderW);
      rect(sliderX, sliderY - sliderH/2, currentW, sliderH, 3);

      // 滑桿圓鈕
      fill(255);
      circle(sliderX + currentW, sliderY, 14);

      // 互動邏輯 (拖曳)
      if (mouseIsPressed) {
          // 限制在滑桿範圍內調整
          if (mouseX >= sliderX - 10 && mouseX <= sliderX + sliderW + 10) {
             volumeLevel = map(mouseX, sliderX, sliderX + sliderW, 0, 1, true);
             if (bgMusic) bgMusic.setVolume(volumeLevel);
             if (answerMusic) answerMusic.setVolume(volumeLevel);
             if (fightMusic) fightMusic.setVolume(volumeLevel);
             if (correctSound) correctSound.setVolume(volumeLevel);
             if (wrongSound) wrongSound.setVolume(volumeLevel);
             if (switchSound) switchSound.setVolume(volumeLevel);
             if (dropSound) dropSound.setVolume(volumeLevel);
             if (zzzSound) zzzSound.setVolume(volumeLevel);
             if (alarmSound) alarmSound.setVolume(volumeLevel);
             if (mjMusic) mjMusic.setVolume(volumeLevel);
             if (tfSound) tfSound.setVolume(min(volumeLevel * 5, 1.0)); // 調高音量
             if (ydSound) ydSound.setVolume(volumeLevel);
          }
      }
  }
}

/**
 * --- 新增：觸發擊退效果 ---
 */
function triggerKnockback(sourceX, sourceY) {
  // 計算衝擊波方向 (來源 -> 皮卡丘)
  let dx = player.x - sourceX;
  let dy = player.y - sourceY;
  
  // 避免重疊時除以零
  if (dx === 0 && dy === 0) {
      dx = random(-1, 1);
      dy = random(-1, 1);
  }

  // 計算射線與螢幕邊界的交點，將玩家推到最旁邊
  // Ray: P = M + t * D
  let t = Infinity;
  
  // 檢查垂直邊界
  if (dx > 0) { // 向右，檢查 x = width
       let tCandidate = (width - sourceX) / dx;
       if (tCandidate < t) t = tCandidate;
  } else if (dx < 0) { // 向左，檢查 x = 0
       let tCandidate = (0 - sourceX) / dx;
       if (tCandidate < t) t = tCandidate;
  }
  
  // 檢查水平邊界
  if (dy > 0) { // 向下，檢查 y = height
       let tCandidate = (height - sourceY) / dy;
       if (tCandidate < t) t = tCandidate;
  } else if (dy < 0) { // 向上，檢查 y = 0
       let tCandidate = (0 - sourceY) / dy;
       if (tCandidate < t) t = tCandidate;
  }
  
  // 設定擊退目標位置
  let targetX = sourceX + dx * t;
  let targetY = sourceY + dy * t;
  
  // 稍微往內縮一點，避免完全卡在邊緣外
  let margin = 30; 
  player.knockback.targetX = constrain(targetX, margin, width - margin);
  player.knockback.targetY = constrain(targetY, margin, height - margin);
  player.knockback.active = true;

  // 觸發衝擊波特效 (以來源為中心)
  shockwaves.push({ x: sourceX, y: sourceY, radius: 50, alpha: 255 });
  
  screenShake = 20; // 觸發震動
}

/**
 * --- 新增：啟動結局問答 ---
 */
function startFinaleQuiz() {
    finaleQuizActive = true;
    finaleQuizEndTime = millis() + 5000; // 5秒倒數
    
    // 從本局出現過的題目中隨機選一題
    let allQuestions = finaleQuestionsPool;
    // 防呆：如果為空(例如使用 debug 跳過)，則使用全部題目
    if (!allQuestions || allQuestions.length === 0) {
        allQuestions = [...twStockQuestions, ...cryptoQuestions, ...usStockQuestions];
    }
    finaleQuestion = random(allQuestions);
    
    // 設定選項按鈕位置
    finaleQuizOptions = [];
    let panelW = 600;
    let panelH = 400;
    let startY = height/2 + 20;
    let btnH = 50;
    let gap = 15;
    
    for (let i = 0; i < finaleQuestion.options.length; i++) {
        let btnW = panelW - 100;
        let btnX = width/2 - btnW/2;
        let btnY = startY + i * (btnH + gap);
        
        finaleQuizOptions.push({
            x: btnX, y: btnY, w: btnW, h: btnH,
            text: finaleQuestion.options[i],
            isCorrect: (i + 1) === finaleQuestion.answer
        });
    }
}

/**
 * --- 新增：繪製結局問答介面 ---
 */
function drawFinaleQuiz() {
    // 半透明黑底遮罩
    fill(0, 0, 0, 200);
    rectMode(CORNER);
    rect(0, 0, width, height);
    
    // 檢查時間
    let remainingTime = finaleQuizEndTime - millis();
    if (remainingTime <= 0) {
        handleFinaleQuizAnswer(false); // 時間到算答錯
        return;
    }
    
    // 繪製面板
    rectMode(CENTER);
    fill(20, 20, 30);
    stroke(255, 50, 50); // 紅色緊張感邊框
    strokeWeight(4);
    rect(width/2, height/2, 600, 450, 10);
    
    // 倒數計時條
    let timeRatio = remainingTime / 5000;
    noStroke();
    fill(255, 0, 0);
    rectMode(CORNER);
    rect(width/2 - 290, height/2 - 215, 580 * timeRatio, 10);
    
    // 問題文字
    fill(255);
    textAlign(CENTER, TOP);
    textSize(24);
    textStyle(BOLD);
    text("快速回答！ " + finaleQuestion.question, width/2 - 280, height/2 - 180, 560, 100);
    
    // 選項按鈕
    textSize(20);
    textAlign(CENTER, CENTER);
    for (let btn of finaleQuizOptions) {
        let isHover = mouseX > btn.x && mouseX < btn.x + btn.w &&
                      mouseY > btn.y && mouseY < btn.y + btn.h;
        
        if (isHover) {
            fill(255, 215, 0);
            cursor(HAND);
        } else {
            fill(50);
        }
        stroke(255);
        strokeWeight(2);
        rectMode(CORNER);
        rect(btn.x, btn.y, btn.w, btn.h, 5);
        
        if (isHover) fill(0); else fill(255);
        noStroke();
        text(btn.text, btn.x + btn.w/2, btn.y + btn.h/2);
    }
    
    // 剩餘時間 (放在選項上面，明顯一點)
    fill(255, 50, 50);
    textAlign(CENTER, BOTTOM);
    textSize(32);
    textStyle(BOLD);
    text(`剩餘時間: ${(remainingTime/1000).toFixed(1)} 秒`, width/2, height/2 + 10);
}

/**
 * --- 新增：處理結局問答結果 ---
 */
function handleFinaleQuizAnswer(isCorrect) {
    finaleQuizActive = false;
    cursor(ARROW);
    
    if (isCorrect) {
        // 答對：夢幻扣血 (增加抓捕計數)
        finaleCatchCount++; 
        playCorrectSound();
        
        // --- 修改：第三次抓到時觸發爆發劇情 (進入分身階段) ---
        if (finaleCatchCount === 3) {
            startFinaleBurst();
            // 這裡不觸發擊退，等待劇情結束後再處理
        } 
        // --- 新增：後續抓到時處理分身交換 ---
        else if (finaleCatchCount > 3 && clones.length > 0) {
            handleCloneHit();
        }
        // --- 新增：分身清空後勝利 ---
        else if (finaleCatchCount > 3 && clones.length === 0) {
            celestialEffect.isFrozen = true; // 勝利
        }
        // --- 一般抓捕 (前兩次) ---
        else {
            triggerKnockback(hintGiver.x, hintGiver.y); // 擊退玩家
            // 顯示短暫提示
            hintGiverSpeech = "可惡...";
            setTimeout(() => { hintGiverSpeech = null; }, 1000);
        }
    } else {
        // 答錯：皮卡丘扣血
        playerCurrentHealth -= playerMaxHealth * 0.1; // 扣除 10% 血量
        playWrongSound();
        triggerKnockback(hintGiver.x, hintGiver.y); // 擊退玩家
        
        // 顯示短暫提示
        hintGiverSpeech = "太慢了！";
        setTimeout(() => { hintGiverSpeech = null; }, 1000);
        
        // 檢查是否死亡
        if (playerCurrentHealth <= 0) {
            startBadEnding(); // 改為觸發壞結局對話
        }
    }
}

/**
 * --- 新增：繪製血條 ---
 */
function drawHealthBars() {
    let barW = 300;
    let barH = 20;
    let centerX = width / 2;
    let topY = 40;
    let gap = 15; // 中間間隔
    
    rectMode(CORNER);
    
    // --- 皮卡丘血條 (Player) - 左側 ---
    // 位置：從中間往左延伸
    let pikaX = centerX - gap - barW;

    // 背景
    noStroke();
    fill(50);
    rect(pikaX, topY, barW, barH);
    
    // 血量 (黃色) - 為了對稱，從右向左填滿 (鏡像效果)
    let pikaW = map(playerCurrentHealth, 0, playerMaxHealth, 0, barW);
    fill(255, 215, 0);
    // x 座標 = (中心點 - 間隔) - 當前血量寬度
    rect(centerX - gap - pikaW, topY, pikaW, barH);
    
    // 邊框與文字
    stroke(255);
    strokeWeight(2);
    noFill();
    rect(pikaX, topY, barW, barH);
    
    fill(255);
    noStroke();
    textAlign(RIGHT, BOTTOM); // 文字靠右對齊 (靠近中間)
    text("皮卡丘 (Player)", centerX - gap, topY - 5);


    // --- 夢幻血條 (Boss) - 右側 ---
    // 位置：從中間往右延伸
    let mewX = centerX + gap;

    // 背景
    noStroke();
    fill(50);
    rect(mewX, topY, barW, barH);
    
    // 血量邏輯
    let mewW;
    if (finaleCatchCount >= 3) {
        // 分身階段：顯示深紅色，總共 4 格血 (對應 4 次抓捕: 3個分身 + 1個本體)
        // finaleCatchCount: 3(滿), 4(75%), 5(50%), 6(25%), 7(0%)
        let hp = max(0, 4 - (finaleCatchCount - 3));
        mewW = map(hp, 0, 4, 0, barW);
        fill(178, 34, 34); // 深紅色 (FireBrick)
    } else {
        // 初始階段 (前三次抓捕，每次扣 1/3)
        // finaleCatchCount: 0(3/3), 1(2/3), 2(1/3)
        let mewHealth = 3 - finaleCatchCount;
        mewW = map(max(0, mewHealth), 0, 3, 0, barW);
        fill(255, 50, 50);
    }
    
    rect(mewX, topY, mewW, barH);
    
    // 邊框與文字
    stroke(255);
    strokeWeight(2);
    noFill();
    rect(mewX, topY, barW, barH);
    
    fill(255);
    noStroke();
    textAlign(LEFT, BOTTOM); // 文字靠左對齊 (靠近中間)
    textSize(16);
    textStyle(BOLD);
    text("夢幻 (Mew)", centerX + gap, topY - 5);
}

/**
 * --- 新增：啟動結局爆發階段 ---
 */
function startFinaleBurst() {
    showFinaleBurst = true;
    finaleBurstData.dialogueIndex = 0;
    finaleBurstData.charIndex = 0;
    finaleBurstData.lastTypeTime = millis();
}

/**
 * --- 新增：繪製結局爆發畫面 ---
 */
function drawFinaleBurst() {
    background(0); // 全黑背景
    if (!finaleBurstData.lines[finaleBurstData.dialogueIndex]) {
        showFinaleBurst = false;
        spawnClones(); // 產生分身
        triggerKnockback(hintGiver.x, hintGiver.y); // 擊退玩家，開始新階段
        return;
    }
    
    // 優化：使用通用函式
    drawCinematicDialogue(finaleBurstData, {
        bgColor: 0,
        strokeColor: 255,
        nameColor: color(255, 215, 0),
        boxW: width * 0.8,
        boxH: 200,
        boxY: height/2, // 置中
        textSize: 26,
        textOffsetY: 80
    });
}

/**
 * --- 新增：產生分身邏輯 ---
 */
function spawnClones() {
    // 產生 3 個分身
    for(let k=0; k<3; k++) {
        clones.push({
            x: 0, y: 0, // 稍後分配位置
            vx: random(-6, 6),
            vy: random(-6, 6)
        });
    }
    
    // 準備 4 個隨機位置並打亂 (1 本尊 + 3 分身)
    let positions = [];
    for(let k=0; k<4; k++) {
        positions.push({ x: random(100, width - 100), y: random(100, height - 100) });
    }
    positions = shuffle(positions);
    
    // 分配位置給本尊
    hintGiver.x = positions[0].x;
    hintGiver.y = positions[0].y;
    hintGiver.speedX = random(-6, 6);
    hintGiver.speedY = random(-6, 6);
    
    // 分配位置給分身
    for(let k=0; k<3; k++) {
        clones[k].x = positions[k+1].x;
        clones[k].y = positions[k+1].y;
    }
}

/**
 * --- 新增：處理分身交換邏輯 ---
 */
function handleCloneHit() {
    let swapIndex = floor(random(clones.length));
    let clone = clones[swapIndex];
    
    triggerSwapEffect(hintGiver.x, hintGiver.y);
    for (let c of clones) triggerSwapEffect(c.x, c.y);
    if (switchSound) switchSound.play();

    hintGiver.x = clone.x;
    hintGiver.y = clone.y;
    clones.splice(swapIndex, 1); // 移除一個分身
    
    triggerKnockback(hintGiver.x, hintGiver.y);
    hintGiverSpeech = "switch";
    setTimeout(() => { hintGiverSpeech = null; }, 1000);
}

/**
 * --- 新增：啟動壞結局 ---
 */
function startBadEnding() {
    gameState = 'BAD_ENDING';
    badEndingData.dialogueIndex = 0;
    badEndingData.charIndex = 0;
    badEndingData.lastTypeTime = millis();
    
    // 停止戰鬥音樂，可播放失敗音效或靜音
    if (fightMusic && fightMusic.isPlaying()) fightMusic.stop();
}

/**
 * --- 新增：繪製壞結局對話 ---
 */
function drawBadEnding() {
    background(0); // 全黑背景
    // 優化：使用通用函式
    drawCinematicDialogue(badEndingData, {
        bgColor: color(20, 0, 0), // 深紅色背景
        strokeColor: color(255, 0, 0), // 紅色邊框
        nameColor: color(255, 50, 50),
        boxW: width * 0.8,
        boxH: 200,
        boxY: height/2, // 置中
        textSize: 26,
        textOffsetY: 80
    });
}

/**
 * --- 新增：Game Over 畫面 ---
 */
function drawGameOver() {
    background(0);
    
    fill(255, 0, 0);
    textSize(80);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'red';
    text("GAME OVER", width/2, height/2 - 50);
    drawingContext.shadowBlur = 0;
    
    fill(255);
    textSize(24);
    textStyle(NORMAL);
    
    if (frameCount % 60 < 30) {
        text("點擊返回標題畫面", width/2, height/2 + 60);
    }
}