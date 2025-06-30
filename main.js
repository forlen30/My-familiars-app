// -- Supabase Client Setup --
const { createClient } = supabase; // <-- บรรทัดนี้ตอนนี้จะทำงานได้แล้ว เพราะเรา Import มาใน index.html
const SUPABASE_URL = 'https://zrllfifabegzzoeelqpp.supabase.co'; // <-- ใส่ URL ของคุณ
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpybGxmaWZhYmVnenpvZWVscXBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMTY3NDQsImV4cCI6MjA2NjY5Mjc0NH0.aEveB1EPedeV4_30CqKls0HiTGr2dGx85kSgxk-mr8s'; // <-- ใส่ Key ของคุณ

// เราจะใช้ตัวแปร supabaseClient ในการทำงานทั้งหมด เพื่อไม่ให้สับสนกับตัวแปร supabase หลัก
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// =======================================
//   ระบบแจ้งเตือนอัปเดต
// =======================================
let waitingWorker;
let countdownInterval = null; 

window.addEventListener('load', checkForUpdates);

function checkForUpdates() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            if (registration.waiting) {
                waitingWorker = registration.waiting;
                showUpdateNotification();
                return;
            }
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        waitingWorker = newWorker;
                        showUpdateNotification();
                    }
                });
            });
        }).catch(error => {
            console.error('Service Worker registration failed:', error);
        });

        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
    }
}

async function showUpdateNotification() {
    try {
        const response = await fetch('/update-info.json?v=' + new Date().getTime());
        const data = await response.json();
        const { version, notes } = data;
        const notificationContainer = document.createElement('div');
        notificationContainer.className = 'update-notification-container';
        let notesHtml = notes.map(note => `<li>${note}</li>`).join('');
        notificationContainer.innerHTML = `
      <div class="update-box">
        <h2>มีเวอร์ชันใหม่อัปเดต! ✨</h2>
        <p>เวอร์ชัน: <strong>${version}</strong></p>
        <p>มีอะไรใหม่:</p>
        <ul class="update-notes">${notesHtml}</ul>
        <button id="update-now-button" class="button">อัปเดตทันที</button>
      </div>
    `;
        document.body.appendChild(notificationContainer);
        document.getElementById('update-now-button').addEventListener('click', () => {
            const updateButton = document.getElementById('update-now-button');
            updateButton.disabled = true;
            updateButton.textContent = 'กำลังอัปเดต...';
            if (waitingWorker) {
                waitingWorker.postMessage({ type: 'SKIP_WAITING' });
            }
        });
    } catch (error) {
        console.error('ไม่สามารถแสดงกล่องอัปเดตได้:', error);
    }
}

// -- PWA Install Prompt --
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log("Install prompt available");
});

// -- Sound Preloads --
const sfxPop = new Audio("sound/pop.MP3?v=60");
const sfxSwipe = new Audio("sound/Swipe-card.MP3?v=60");
const sfxCollect = new Audio("sound/collect.MP3?v=60"); 
const sfxProgressBar = new Audio("sound/progress-bar.MP3?v=60"); 

// ============ Data: ไพ่ทั้งหมด =============
const cards = [
  { name: "Capybara", image: "images/Capybara.png", message: "ผ่อนคลาย พักผ่อน หยุดอยู่กับที่", advice: "คำแนะนำสำหรับวันนี้: วันนี้คือวันที่คุณควรปล่อยวางจากความวุ่นวายและหน้าที่ที่หนักอึ้ง ลองใช้ชีวิตให้ช้าลงเหมือนคาปิบาราที่กำลังแช่น้ำอย่างสบายใจ ไม่จำเป็นต้องเร่งรีบหรือกดดันตัวเองให้ต้องทำอะไรอยู่ตลอดเวลา การหยุดพักไม่ใช่ความขี้เกียจ แต่คือการให้เกียรติร่างกายและจิตใจของคุณ หาความสุขจากความสงบและความเรียบง่ายตรงหน้า แล้วคุณจะพบพลังงานใหม่ๆ ที่ซ่อนอยู่ในการพักผ่อนอย่างแท้จริง" },
  { name: "Alicorn", image: "images/Alicorn.png", message: "พลังศักดิ์สิทธิ์ การเยียวยา ความบริสุทธ์", advice: "คำแนะนำสำหรับวันนี้: คุณกำลังเชื่อมต่อกับพลังงานอันศักดิ์สิทธิ์ที่อยู่รอบตัวและภายในใจคุณ วันนี้เป็นโอกาสดีที่จะเยียวยาบาดแผลเก่าๆ ทั้งทางกายและทางใจ ปลดปล่อยความรู้สึกผิดหรือความเศร้าหมองออกไป เปิดรับความบริสุทธิ์และความดีงามที่จักรวาลมอบให้ จงเชื่อมั่นในแสงสว่างที่นำทางคุณ และให้พลังแห่งการเยียวยาชำระล้างทุกสิ่งให้กลับมาสดใสอีกครั้ง" },
  { name: "Pigeon", image: "images/Pigeon.png", message: "ความรัก ความสงบ สันติ", advice: "คำแนะนำสำหรับวันนี้: สาสน์จากนกพิราบคือการกลับคืนสู่ความสงบสุขและความรักที่เรียบง่าย มองไปรอบๆ ตัว แล้วคุณจะเห็นความรักปรากฏอยู่ในทุกที่ ไม่ว่าจะเป็นจากครอบครัว เพื่อน หรือแม้แต่คนแปลกหน้า วันนี้ลองมอบสันติสุขให้แก่ตนเองและผู้อื่น อาจเป็นการให้อภัยใครสักคน หรือเพียงแค่ยิ้มให้กับเรื่องเล็กๆ น้อยๆ สันติภาพที่ยิ่งใหญ่เริ่มต้นจากความสงบในใจคุณ" },
  { name: "Dog", image: "images/Dog.png", message: "ความศรัทธา ความช่วยเหลือ รักไร้เงื่อนไข", advice: "คำแนะนำสำหรับวันนี้: วันนี้คือวันแห่งมิตรภาพและความภักดี จงเชื่อมั่นในคนรอบข้างและเปิดใจรับความช่วยเหลือเมื่อคุณต้องการ ในขณะเดียวกัน ก็อย่าลังเลที่จะหยิบยื่นความช่วยเหลือและกำลังใจให้ผู้อื่นเช่นกัน สุนัขคือสัญลักษณ์ของความรักที่ไม่มีเงื่อนไข ลองถามใจตัวเองดูว่าคุณได้มอบความรักแบบนั้นให้ใคร หรือได้รับจากใครบ้างหรือไม่ นี่คือเวลาที่จะซาบซึ้งในความสัมพันธ์อันล้ำค่า" },
  { name: "Chipmunk", image: "images/chipmunk.png", message: "การเดินทาง ศิลปะ ใส่ใจรายละเอียดเล็ก ๆ น้อย ๆ ", advice: "คำแนะนำสำหรับวันนี้: ชีวิตคือการเดินทางที่เต็มไปด้วยรายละเอียดอันงดงาม วันนี้ชิปมังก์กระตุ้นให้คุณใส่ใจกับสิ่งเล็กๆ น้อยๆ ที่คุณอาจมองข้ามไป ไม่ว่าจะเป็นลวดลายของใบไม้ กลิ่นกาแฟยามเช้า หรือบทเพลงที่ได้ยินโดยบังเอิญ ความสุขมักซ่อนอยู่ในรายละเอียดเหล่านั้น นอกจากนี้ ยังเป็นวันที่ดีในการเริ่มต้นโปรเจกต์ที่ต้องใช้ความคิดสร้างสรรค์หรืองานศิลปะอีกด้วย" },
  { name: "Snake", image: "images/Snake.png", message: "ความไม่แน่นอน เปลี่ยนแปลงตัวตน พลังงานไม่ทราบที่มา", advice: "คำแนะนำสำหรับวันนี้: งูกำลังบอกคุณว่าถึงเวลา ลอกคราบ แล้ว จงยอมรับความเปลี่ยนแปลงที่กำลังจะเกิดขึ้น แม้ว่ามันจะมาพร้อมกับความไม่แน่นอนก็ตาม การเติบโตที่แท้จริงมักเกิดจากการก้าวออกจากพื้นที่ปลอดภัย อย่ากลัวที่จะสลัดตัวตนเก่าๆ ที่ไม่ใช่ออกไป เพื่อเปิดทางให้พลังงานใหม่และตัวตนที่แข็งแกร่งกว่าเดิมได้ถือกำเนิดขึ้น" },
  { name: "Lion", image: "images/Lion.png", message: "ความแข็งแกร่ง อัตตา เชื่อใจตัวเองเท่านั้น", advice: "คำแนะนำสำหรับวันนี้: วันนี้คือวันที่คุณต้องเชื่อมั่นในสัญชาตญาณและความสามารถของตัวเองอย่างเต็มเปี่ยม สิงโตคือราชาแห่งสัตว์ป่า และคุณเองก็มีพลังอำนาจและความเป็นผู้นำซ่อนอยู่ภายใน จงกล้าหาญที่จะยืนหยัดเพื่อสิ่งที่คุณเชื่อมั่น และนำทางด้วยความมั่นใจ แต่อย่าลืมใช้พลังนั้นด้วยความเมตตาและสติปัญญา ควบคุมอัตตาของคุณให้ดี แล้วความสำเร็จจะเป็นของคุณ" },
  { name: "Cat", image: "images/Cat.png", message: "ความมั่นใจ เสน่ห์แรง มีคนคอยเอาใจใส่", advice: "คำแนะนำสำหรับวันนี้: จงเดินอย่างสง่างามและมั่นใจในแบบฉบับของตัวเองเหมือนแมว วันนี้คุณมีเสน่ห์ดึงดูดเป็นพิเศษ จะมีคนคอยให้ความสนใจและเอาใจใส่คุณ แต่ในขณะเดียวกัน ก็จงรักษาความเป็นอิสระและรู้จักคุณค่าในตัวเอง ไม่จำเป็นต้องพึ่งพาใครเพื่อทำให้รู้สึกดี คุณสมบูรณ์พร้อมในตัวเองอยู่แล้ว" },
  { name: "JellyFish", image: "images/Jellyfish.png", message: "ฝืนไหลไปตามกระแส ยอมจำนน", advice: "คำแนะนำสำหรับวันนี้: บางครั้งการควบคุมทุกสิ่งทุกอย่างก็ทำให้เราเหนื่อยล้าเกินไป วันนี้แมงกะพรุนแนะนำให้คุณลองปล่อยวางและไหลไปตามกระแสของชีวิตดูบ้าง หยุดต่อต้านหรือฝืนความเป็นไป การยอมจำนนในที่นี้ไม่ใช่การยอมแพ้ แต่คือการไว้วางใจในกระบวนการของจักรวาล แล้วคุณจะพบกับอิสระและความสงบอย่างไม่น่าเชื่อ" },
  { name: "Frog", image: "images/Frog.png", message: "ความอุดมสมบูรณ์ เงินทอง ความมั่งคั่ง", advice: "คำแนะนำสำหรับวันนี้: กบคือสัญลักษณ์แห่งความอุดมสมบูรณ์และการชำระล้าง วันนี้เป็นวันที่ดีเยี่ยมสำหรับการเปิดรับความมั่งคั่งในทุกรูปแบบ ไม่ว่าจะเป็นโอกาสทางการเงิน ความสุขใจ หรือสุขภาพที่แข็งแรง จงทำจิตใจให้สะอาดบริสุทธิ์เพื่อต้อนรับสิ่งดีๆ ที่กำลังจะหลั่งไหลเข้ามาเหมือนสายฝนที่ชุ่มฉ่ำ" },
  { name: "Unicorn", image: "images/Unicorn.png", message: "ฝันเป็นจริง สมปรารถนา สิ่งที่คาดหวังไว้จะเกิดขึ้น", advice: "คำแนะนำสำหรับวันนี้: วันนี้คือวันแห่งเวทมนตร์และความมหัศจรรย์! ยูนิคอร์นปรากฏตัวเพื่อบอกคุณว่าความฝันอันบริสุทธิ์ของคุณกำลังจะกลายเป็นจริง สิ่งที่คุณหวังและอธิษฐานไว้กำลังจะเกิดขึ้น จงรักษาความเชื่อและความหวังในใจไว้ให้มั่นคง อย่าให้ความสงสัยมาบั่นทอนพลังบวกของคุณ เพราะปาฏิหาริย์อยู่ใกล้แค่เอื้อม" },
  { name: "Ant", image: "images/ant.png", message: "ความขยัน ความอดทน ทำงานหนัก", advice: "คำแนะนำสำหรับวันนี้: ความสำเร็จที่ยิ่งใหญ่ไม่ได้สร้างเสร็จในวันเดียว แต่มันเกิดจากการลงมือทำอย่างสม่ำเสมอและอดทน วันนี้มดมาเตือนให้คุณเห็นคุณค่าของความขยันหมั่นเพียร แม้ว่าผลลัพธ์อาจจะยังไม่ปรากฏชัดเจนในตอนนี้ แต่จงเชื่อเถอะว่าทุกย่างก้าวเล็กๆ ของคุณกำลังสร้างรากฐานที่มั่นคงสำหรับอนาคต" },
  { name: "Crocodile", image: "images/crocodile.png", message: "บรรพบุรุษ อาณาเขต การรอคอย", advice: "คำแนะนำสำหรับวันนี้: จระเข้คือผู้ถือครองสติปัญญาแห่งบรรพกาล วันนี้อาจเป็นวันที่คุณต้องเชื่อมต่อกับรากเหง้าหรือภูมิปัญญาเก่าแก่ นอกจากนี้ยังเป็นช่วงเวลาของการรอคอยอย่างอดทนเพื่อจังหวะที่เหมาะสม จงกำหนดขอบเขตและพื้นที่ส่วนตัวของคุณให้ชัดเจน และใช้สัญชาตญาณอันเฉียบคมในการตัดสินใจ อย่ารีบร้อน แต่จงเคลื่อนไหวเมื่อถึงเวลาที่ใช่เท่านั้น" },
  { name: "Rat", image: "images/rat.png", message: "มีทักษะมาก ร่ำรวยจากการลงทุน การรีไซเคิล", advice: "คำแนะนำสำหรับวันนี้: หนูคือตัวแทนของความสามารถในการปรับตัวและความฉลาดในการใช้ทรัพยากร วันนี้จงมองหาวิธีใช้ทักษะที่คุณมีให้เกิดประโยชน์สูงสุด อาจมีโอกาสในการลงทุนหรือการสร้างรายได้จากสิ่งของที่คนอื่นมองว่าไร้ค่า จงเป็นคนช่างสังเกตและมองเห็นคุณค่าในสิ่งที่ถูกมองข้าม แล้วความมั่งคั่งจะตามมา" },
  { name: "Fox", image: "images/fox.png", message: "คนใกล้ตัวไว้ใจไม่ได้ อย่าทำตัวเด่น ระวังตัวเสมอ", advice: "คำแนะนำสำหรับวันนี้: วันนี้สุนัขจิ้งจอกมาพร้อมกับคำเตือนให้คุณใช้ความเฉลียวฉลาดและสัญชาตญาณในการดำเนินชีวิต อาจมีบางสิ่งบางอย่างที่ไม่เป็นอย่างที่เห็น จงสังเกตคนรอบข้างและสถานการณ์ให้ดี อย่าเพิ่งไว้วางใจใครง่ายๆ และพยายามอย่าทำตัวให้เป็นเป้าสายตามากเกินไป นี่คือเวลาของการใช้ไหวพริบ ไม่ใช่การเปิดเผยทุกอย่าง" },
  { name: "Phoenix", image: "images/phoenix.png", message: "กำเนิดใหม่ ก้าวสู่จุดสูงสุด ความลึกลับ", advice: "คำแนะนำสำหรับวันนี้: หากคุณเพิ่งผ่านช่วงเวลาที่ยากลำบากมา นกฟีนิกซ์คือสัญลักษณ์ที่ทรงพลังที่สุดของการเกิดใหม่ คุณกำลังจะผงาดขึ้นมาจากเถ้าถ่านของอดีตและก้าวเข้าสู่ช่วงชีวิตใหม่ที่รุ่งโรจน์และแข็งแกร่งกว่าเดิม จงโอบรับการเปลี่ยนแปลงครั้งใหญ่นี้ เพราะมันจะนำพาคุณไปสู่จุดสูงสุดที่คุณไม่เคยคาดคิด" },
  { name: "Chinchilla", image: "images/chinchilla.png", message: "ความกระตือรือร้น การสำรวจ ซุกซน", advice: "คำแนะนำสำหรับวันนี้: ปลุกความเป็นเด็กในตัวคุณให้ตื่นขึ้น! วันนี้ชินชิลล่าชวนให้คุณเต็มไปด้วยความกระตือรือร้นและสนุกสนานกับการสำรวจสิ่งใหม่ๆ ลองทำอะไรที่แตกต่างไปจากเดิม ออกไปผจญภัยในที่ที่ไม่เคยไป หรือเรียนรู้ทักษะใหม่ๆ ด้วยความอยากรู้อยากเห็น ปล่อยให้ความซุกซนนำทาง แล้วคุณจะพบกับความสุขที่คาดไม่ถึง" },
  { name: "Beaver", image: "images/beaver.png", message: "ครอบครัว คนรัก บ้านเรือน", advice: "คำแนะนำสำหรับวันนี้: วันนี้เป็นวันที่คุณควรให้ความสำคัญกับ บ้าน และ ครอบครัว ไม่ว่าจะเป็นบ้านที่เป็นสถานที่หรือบ้านที่อยู่ในใจคุณ ใช้เวลากับคนที่คุณรัก สร้างความอบอุ่นและความมั่นคงในความสัมพันธ์ อาจถึงเวลาซ่อมแซมหรือตกแต่งบ้านให้เป็นพื้นที่แห่งความสุขอย่างแท้จริง การสร้างรากฐานที่แข็งแกร่งในวันนี้จะส่งผลดีในระยะยาว" },
  { name: "Snow Leopard", image: "images/snow-leopard.png", message: "ทำงานให้สำเร็จ ได้รับงานใหญ่ ได้ของหายาก", advice: "คำแนะนำสำหรับวันนี้: คุณมีความสามารถที่จะทำภารกิจที่ท้าทายให้สำเร็จลุล่วงได้ วันนี้เสือดาวหิมะนำสาสน์แห่งความสำเร็จมาให้ อาจมีโอกาสได้รับมอบหมายงานชิ้นสำคัญ หรือได้ครอบครองสิ่งของหายากที่ปรารถนา จงเชื่อมั่นในศักยภาพของตัวเองและทำงานอย่างเงียบๆ แต่เฉียบคม ความสำเร็จที่ได้มาจะน่าภาคภูมิใจอย่างยิ่ง" },
  { name: "Weasel", image: "images/weasel.png", message: "ระวังคนใกล้ตัว ปกป้องตัวเอง ปกป้องครอบครัว", advice: "คำแนะนำสำหรับวันนี้: เพียงพอนเตือนให้คุณมีสติและสังเกตการณ์อย่างใกล้ชิด อาจมีคนที่คุณไว้ใจกำลังกระทำการบางอย่างที่ไม่น่าไว้วางใจ จงใช้สัญชาตญาณอันเฉียบแหลมของคุณเพื่อมองทะลุสิ่งต่างๆ นี่คือเวลาที่ต้องปกป้องตัวเองและคนที่คุณรัก ตั้งการ์ดให้สูงและอย่าปล่อยให้ใครมาเอาเปรียบได้ง่ายๆ" },
  { name: "Hawk", image: "images/hawk.png", message: "ไม่เปลี่ยนแปลง เฝ้าดู อยู่เหนือปัญหา", advice: "คำแนะนำสำหรับวันนี้: จงมองปัญหาจากมุมสูงเหมือนเหยี่ยวที่บินอยู่บนท้องฟ้า วันนี้คุณมีความสามารถที่จะมองเห็นภาพรวมและอยู่เหนือความขัดแย้งเล็กๆ น้อยๆ ได้ อย่าเพิ่งรีบร้อนเข้าไปแก้ไขหรือเปลี่ยนแปลงอะไร แต่จงเฝ้าดูสถานการณ์อย่างสงบและรอจังหวะที่เหมาะสม การมองการณ์ไกลจะทำให้คุณตัดสินใจได้อย่างเฉียบคมและถูกต้อง" },
  { name: "Loris", image: "images/loris.png", message: "เก็บตัว ไม่เข้าสังคม อ่อนไหวง่าย", advice: "คำแนะนำสำหรับวันนี้: วันนี้อาจเป็นวันที่คุณรู้สึกอ่อนไหวเป็นพิเศษและต้องการเวลาอยู่กับตัวเองเงียบๆ ไม่ใช่เรื่องผิดที่คุณจะปลีกตัวออกจากสังคมชั่วคราวเพื่อชาร์จพลังงาน การเก็บตัวในวันนี้คือการดูแลจิตใจที่บอบบางของคุณ ให้เวลาตัวเองได้พักและประมวลผลความรู้สึกต่างๆ แล้วคุณจะกลับมาเข้มแข็งได้อีกครั้ง" },
  { name: "Butterfly", image: "images/butterfly.png", message: "ความเปลี่ยนแปลงกระทันหัน การพัฒนาทางจิตวิญญาณ", advice: "คำแนะนำสำหรับวันนี้: จงเตรียมพร้อมรับการเปลี่ยนแปลงที่สวยงาม! ผีเสื้อคือสัญลักษณ์ของการแปรเปลี่ยนจากหนอนผีเสื้อไปสู่สิ่งที่งดงามและโบยบินได้อย่างอิสระ ชีวิตคุณกำลังจะเกิดการเปลี่ยนแปลงครั้งสำคัญในเร็วๆ นี้ ซึ่งจะนำไปสู่การเติบโตทางจิตวิญญาณอย่างก้าวกระโดด จงเปิดใจรับสิ่งใหม่ๆ ที่กำลังเข้ามา" },
  { name: "Deer", image: "images/deer.png", message: "ความเมตตา การเดินทาง ความท้าทาย", advice: "คำแนะนำสำหรับวันนี้: จงก้าวเดินไปข้างหน้าด้วยหัวใจที่เปี่ยมด้วยความเมตตาเหมือนกวาง วันนี้คุณอาจต้องเผชิญกับความท้าทายบางอย่าง แต่จงรับมือกับมันด้วยความอ่อนโยนและสง่างาม ไม่ว่าจะเกิดอะไรขึ้น จงปฏิบัติต่อตนเองและผู้อื่นด้วยความกรุณา ความเมตตาคือเข็มทิศที่จะนำทางคุณผ่านพ้นทุกอุปสรรคไปได้" },
  { name: "Puma", image: "images/puma.png", message: "ขัดแย้งกับอำนาจ มองการณ์ไกล ก้าวต่อไปอย่าหยุด", advice: "คำแนะนำสำหรับวันนี้: พูม่าคือสัญลักษณ์ของพลังและความเป็นผู้นำที่กล้าจะท้าทายอำนาจเก่าๆ วันนี้คุณอาจรู้สึกขัดแย้งกับผู้มีอำนาจหรือระบบเดิมๆ จงเชื่อในวิสัยทัศน์ที่มองการณ์ไกลของคุณและก้าวต่อไปข้างหน้าอย่างไม่หยุดยั้ง คุณมีพลังที่จะสร้างเส้นทางใหม่ด้วยตัวของคุณเอง อย่าปล่อยให้ใครมาขวางกั้นศักยภาพที่แท้จริงของคุณ" },
  { name: "Goat", image: "images/goat.png", message: "มุ่งไปข้างหน้า ลงมือทำทันที ทำตามความฝัน", advice: "คำแนะนำสำหรับวันนี้: หยุดลังเลและลงมือทำได้แล้ว! แพะคือสัตว์ที่มุ่งมั่นปีนป่ายไปสู่ยอดเขาเสมอ วันนี้คือวันที่คุณต้องมีความทะเยอทะยานและลงมือทำตามความฝันทันที อย่ารอให้ทุกอย่างสมบูรณ์แบบ แต่จงเริ่มจากจุดที่คุณยืนอยู่ พลังงานแห่งการเริ่มต้นจะนำพาคุณไปสู่ความสำเร็จที่ตั้งใจไว้" },
  { name: "Red Panda", image: "images/red-panda.png", message: "อย่ารีบตัดสินใจ เหรียญมีสองด้าน อย่าพึ่งลงมือ", advice: "คำแนะนำสำหรับวันนี้: วันนี้แพนด้าแดงแนะนำให้คุณชะลอการตัดสินใจที่สำคัญเอาไว้ก่อน ทุกเรื่องราวมักมีสองด้านเสมอ จงใช้เวลาพิจารณาข้อมูลให้รอบด้าน มองในมุมที่แตกต่าง และอย่าเพิ่งด่วนสรุป นี่ไม่ใช่เวลาของการลงมือทำอย่างหุนหันพลันแล่น แต่เป็นเวลาของการไตร่ตรองอย่างสุขุมรอบคอบ" },
  { name: "Sugar Glider", image: "images/sugar-glider.png", message: "ตารางการนอนแปรปรวน สุขภาพย่ำแย่ สังคมกลางคืน", advice: "คำแนะนำสำหรับวันนี้: ร่างกายของคุณกำลังส่งสัญญาณเตือนบางอย่าง วันนี้คุณอาจรู้สึกอ่อนเพลียจากการพักผ่อนที่ไม่เพียงพอ หรือตารางชีวิตที่วุ่นวายเกินไป จงใส่ใจสุขภาพให้มากขึ้นเป็นพิเศษ พยายามปรับเวลาการนอนให้สมดุล และหลีกเลี่ยงกิจกรรมที่จะทำให้ร่างกายเหนื่อยล้าจนเกินไป การดูแลตัวเองคือสิ่งสำคัญที่สุดในวันนี้" },
  { name: "Koala", image: "images/koala.png", message: "เอาแน่เอานอนไม่ได้ แปรปรวน ความกลัว", advice: "คำแนะนำสำหรับวันนี้: วันนี้คุณอาจรู้สึกถึงความไม่แน่นอนและอารมณ์ที่แปรปรวนได้ง่าย ความกลัวบางอย่างอาจก่อตัวขึ้นในใจ โคอาล่าแนะนำให้คุณใจเย็นๆ และเกาะติดกับสิ่งที่ทำให้คุณรู้สึกปลอดภัยและมั่นคง ไม่จำเป็นต้องรีบร้อนตัดสินใจหรือทำอะไรที่เสี่ยงเกินไปในสภาวะที่จิตใจไม่มั่นคง ให้เวลาตัวเองได้พักและหาจุดสมดุล" },
  { name: "Tortoise", image: "images/tortoise.png", message: "ความล่าช้า อดทน การรอคอยที่น่าอึดอัด", advice: "คำแนะนำสำหรับวันนี้: ช้าๆ ได้พร้าเล่มงาม คือคำแนะนำสำหรับคุณในวันนี้ ทุกอย่างอาจดูเหมือนเคลื่อนตัวไปอย่างเชื่องช้าจนน่าอึดอัดใจ แต่เต่าบกสอนให้เรารู้จักคุณค่าของความอดทนและความมั่นคง จงเชื่อมั่นในกระบวนการและก้าวต่อไปอย่างช้าๆ แต่มั่นคง ความสำเร็จที่ยั่งยืนต้องการเวลาในการบ่มเพาะ" },
  { name: "Ferret", image: "images/ferret.png", message: "โอกาส เชื่อใจตัวเอง ทำตามหัวใจ", advice: "คำแนะนำสำหรับวันนี้: จงเปิดตาให้กว้าง เพราะโอกาสดีๆ กำลังจะปรากฏขึ้นในไม่ช้า! เฟอร์เร็ตคือตัวแทนของความอยากรู้อยากเห็นและการคว้าโอกาส วันนี้จงเชื่อในสัญชาตญาณและทำตามเสียงเรียกร้องของหัวใจ อย่าลังเลที่จะสำรวจเส้นทางใหม่ๆ ที่น่าสนใจ ความกล้าที่จะทำตามใจตัวเองจะนำคุณไปสู่การค้นพบที่น่าตื่นเต้น" },
  { name: "Penguin", image: "images/penguin.png", message: "ชีวิตที่ดี ความเพรียบพร้อม ลูซิดดรีม", advice: "คำแนะนำสำหรับวันนี้: วันนี้คือวันที่คุณจะได้สัมผัสกับความสุขและความสมบูรณ์ในชีวิต เพนกวินคือสัญลักษณ์ของการปรับตัวเข้ากับสังคมได้อย่างดีเยี่ยมและความเพียบพร้อมในชีวิตครอบครัว นอกจากนี้ยังอาจเป็นคืนที่คุณจะได้สัมผัสกับ ลูซิดดรีม หรือความฝันที่รู้ตัวว่ากำลังฝันอยู่ จงเปิดรับความสุขและความมหัศจรรย์ที่เข้ามาในวันนี้" },
  { name: "Bison", image: "images/bison.png", message: "ได้รับในสิ่งที่คาดหวัง มีศรัทธา การรอคอย", advice: "คำแนะนำสำหรับวันนี้: คำอธิษฐานของคุณกำลังจะได้รับการตอบรับ ไบซันคือสัญลักษณ์อันศักดิ์สิทธิ์ของความอุดมสมบูรณ์และศรัทธา สิ่งที่คุณได้ร้องขอและรอคอยอย่างมีความหวังกำลังจะมาถึงในไม่ช้า จงรักษาศรัทธาของคุณให้มั่นคงและแสดงความขอบคุณต่อจักรวาลสำหรับพรที่กำลังจะได้รับ" },
  { name: "Hedgehog", image: "images/hedgehog.png", message: "มีความสุขกับปัจจุบัน ใส่ใจธรรมชาติ พลังงานเทพี", advice: "คำแนะนำสำหรับวันนี้: จงมีความสุขกับสิ่งเล็กๆ น้อยๆ ในปัจจุบัน เม่นน้อยเตือนให้เรากลับมาเชื่อมต่อกับธรรมชาติและโลกใบนี้ ลองเดินเท้าเปล่าบนพื้นหญ้า สูดอากาศบริสุทธิ์ หรือชื่นชมดอกไม้ข้างทาง วันนี้คุณอาจสัมผัสได้ถึงพลังงานของเพศหญิงหรือพลังงานของเทพี ที่อ่อนโยนแต่แข็งแกร่ง" },
  { name: "Boar", image: "images/boar.png", message: "ผลัดวันประกันพรุ่ง ขี้เกียจ กักตุนเงินหรือสิ่งของ", advice: "คำแนะนำสำหรับวันนี้: หมูป่ากำลังสะท้อนให้เห็นถึงแนวโน้มที่จะผัดวันประกันพรุ่งหรือความรู้สึกขี้เกียจที่อาจครอบงำคุณในวันนี้ ลองสำรวจดูว่ามีอะไรที่คุณเลื่อนเวลาทำมานานแล้วหรือยัง และพยายามลงมือทำสักเล็กน้อย นอกจากนี้ยังเป็นสัญญาณเตือนให้ระวังการกักตุนสิ่งของหรือเงินทองมากเกินความจำเป็น ลองปล่อยวางและแบ่งปันดูบ้าง" },
  { name: "Seal", image: "images/seal.png", message: "ความสนุกสนาน ความไม่รอบครอบ เด็ก", advice: "คำแนะนำสำหรับวันนี้: วันนี้คือวันแห่งการปลดปล่อยความเป็นเด็กในตัวคุณและสนุกสนานไปกับชีวิต! แมวน้ำเชิญชวนให้คุณหัวเราะ เล่น และทำในสิ่งที่ทำให้คุณมีความสุข อย่างไรก็ตาม จงระวังสักนิดในเรื่องความไม่รอบคอบที่อาจเกิดขึ้นจากความสนุกจนเกินพอดี จงเล่นอย่างมีสติและมีความสุขอย่างเต็มที่" },
  { name: "Parrot", image: "images/parrot.png", message: "การสื่อสาร การเข้าสังคม งานสังสรรค์", advice: "คำแนะนำสำหรับวันนี้: วันนี้เป็นวันที่เหมาะอย่างยิ่งกับการสื่อสารและการเข้าสังคม นกแก้วกระตุ้นให้คุณแสดงความคิดเห็นและพูดคุยกับผู้คน อาจมีข่าวดีที่มาจากการติดต่อสื่อสาร หรือคุณอาจได้รับเชิญไปร่วมงานสังสรรค์ อย่าเก็บตัวเงียบคนเดียว จงออกไปพบปะผู้คนและแบ่งปันเรื่องราวของคุณ" },
  { name: "Wolf", image: "images/wolf.png", message: "ครอบครัว การทำงานเป็นทีม ความสามัคคี", advice: "คำแนะนำสำหรับวันนี้: ไม่มีใครแข็งแกร่งเท่าเราทุกคน คือสาสน์จากหมาป่าในวันนี้ จงให้ความสำคัญกับ ฝูง ของคุณ ไม่ว่าจะเป็นครอบครัว เพื่อน หรือทีมงาน ความสำเร็จจะเกิดขึ้นได้จากการร่วมมือร่วมใจและความสามัคคี จงรับฟังและสนับสนุนซึ่งกันและกัน แล้วคุณจะก้าวผ่านทุกอุปสรรคไปได้อย่างแข็งแกร่ง" },
  { name: "Elephant", image: "images/elephant.png", message: "ความท้าทาย ความดื้อดึง ความฉลาด", advice: "คำแนะนำสำหรับวันนี้: คุณอาจกำลังเผชิญหน้ากับอุปสรรคหรือความท้าทายที่ยิ่งใหญ่ แต่ช้างคือสัญลักษณ์ของพลัง สติปัญญา และความอดทนที่ไม่ยอมแพ้ จงใช้ความฉลาดของคุณในการวางแผนและแก้ไขปัญหา แม้อาจต้องใช้ความมุ่งมั่นที่ดื้อดึงอยู่บ้าง แต่จงเชื่อมั่นว่าคุณมีพลังมากพอที่จะขจัดอุปสรรคนี้ให้พ้นทางได้" },
  { name: "Polar Bear", image: "images/polar-bear.png", message: "การพึ่งพาตัวเอง ความทรหด ความยากลำบาก", advice: "คำแนะนำสำหรับวันนี้: วันนี้คุณอาจรู้สึกโดดเดี่ยวหรือต้องเผชิญกับสถานการณ์ที่ยากลำบากเพียงลำพัง หมีขั้วโลกคือบททดสอบของความแข็งแกร่งและความสามารถในการพึ่งพาตนเอง จงเชื่อมั่นในความทรหดอดทนที่คุณมี คุณสามารถผ่านพ้นช่วงเวลาที่ท้าทายนี้ไปได้ด้วยกำลังของตัวคุณเอง และจะเติบโตขึ้นอย่างแข็งแกร่งกว่าเดิม" },
  { name: "Swan", image: "images/swan.png", message: "เรื่องดราม่า ความอ่อนไหว ความงดงาม", advice: "คำแนะนำสำหรับวันนี้: หงส์คือสัญลักษณ์ของความงดงามและความอ่อนไหว แต่มันก็อาจนำมาซึ่งเรื่องราวดราม่าทางอารมณ์ได้เช่นกัน วันนี้จงตระหนักถึงความรู้สึกที่เปราะบางของตัวเองและผู้อื่น พยายามหลีกเลี่ยงสถานการณ์ที่จะนำไปสู่ความขัดแย้งที่ไม่จำเป็น และหันมามองหาความงดงามที่ซ่อนอยู่ในตัวคุณและโลกรอบข้าง" },
  { name: "Raccoon", image: "images/raccoon.png", message: "ความวุ่นวาย ความไม่มั่นคง หัวขโมย", advice: "คำแนะนำสำหรับวันนี้: วันนี้อาจมีความวุ่นวายหรือสถานการณ์ที่ไม่คาดคิดเกิดขึ้น แรคคูนเตือนให้คุณระมัดระวังทรัพย์สินและข้อมูลส่วนตัว อาจมีใครบางคนพยายามเอาเปรียบหรือ ขโมย อะไรบางอย่างไปจากคุณ ไม่ว่าจะเป็นสิ่งของ เวลา หรือพลังงาน จงมีสติรอบคอบและอย่าไว้ใจใครง่ายๆ จัดการความวุ่นวายด้วยความสงบ แล้วทุกอย่างจะเข้าที่เข้าทาง" },
  { name: "White Head Eagle", image: "images/white-head-eagle.png", message: "การติดต่อจากเทพ มองการณ์ไกล ใส่ใจรายละเอียด", advice: "คำแนะนำสำหรับวันนี้: จงเงยหน้ามองฟ้าและเปิดใจรับสาสน์จากเบื้องบน นกอินทรีคือผู้ส่งสารจากสรวงสวรรค์ วันนี้คุณอาจได้รับแรงบันดาลใจหรือคำชี้แนะที่สำคัญ จงมองการณ์ไกลเหมือนสายตาของนกอินทรี แต่ในขณะเดียวกันก็อย่าลืมใส่ใจในรายละเอียดเล็กๆ น้อยๆ ที่จะนำไปสู่ความสำเร็จที่ยิ่งใหญ่" },
  { name: "Bat", image: "images/bat.png", message: "เผชิญหน้ากับความกลัว เลิกนิสัยไม่ดี การเข้าสังคม", advice: "คำแนะนำสำหรับวันนี้: ค้างคาวคือสัญลักษณ์ของการเกิดใหม่ในความมืด วันนี้คือโอกาสที่คุณจะได้เผชิญหน้ากับความกลัวที่ซ่อนอยู่ในใจและก้าวข้ามมันไป นอกจากนี้ยังเป็นช่วงเวลาที่ดีที่จะเริ่มต้นเลิกนิสัยที่ไม่ดีบางอย่างและเปิดรับการเปลี่ยนแปลง การออกจากถ้ำแห่งความกลัวจะนำคุณไปสู่สังคมและโอกาสใหม่ๆ" },
  { name: "Crow", image: "images/crow.png", message: "ลางบอกเหตุ การติดต่อจากโลกวิญญาณ บรรพบุรุษ", advice: "คำแนะนำสำหรับวันนี้: วันนี้เป็นวันที่มีมนต์ขลังและลึกลับ อีกาคือผู้ส่งสารระหว่างโลกมนุษย์และโลกวิญญาณ จงสังเกตสัญญาณหรือลางบอกเหตุต่างๆ ที่ปรากฏขึ้นรอบตัวคุณ อาจเป็นการติดต่อจากบรรพบุรุษหรือผู้พิทักษ์ทางจิตวิญญาณที่ต้องการจะบอกอะไรบางอย่างกับคุณ จงเปิดประสาทสัมผัสและรับฟังเสียงกระซิบจากอีกฟากฝั่ง" },
  { name: "Owl", image: "images/owl.png", message: "ไหวพริบ เก็บความลับ เชื่อใจตัวเอง", advice: "คำแนะนำสำหรับวันนี้: นกฮูกมองเห็นได้ในความมืดฉันใด คุณก็มีสติปัญญาและไหวพริบที่จะมองทะลุสถานการณ์ที่ซับซ้อนได้ฉันนั้น วันนี้จงเชื่อมั่นในสัญชาตญาณและปัญญาภายในของคุณ อาจมีบางเรื่องที่คุณจำเป็นต้องเก็บไว้เป็นความลับ อย่าเพิ่งเปิดเผยให้ใครรู้ จงเคลื่อนไหวอย่างเงียบเชียบและชาญฉลาด" },
  { name: "Moth", image: "images/moth.png", message: "การเปลี่ยนแปลง ข่าวสาร การติดต่อจากสปิริต", advice: "คำแนะนำสำหรับวันนี้: เช่นเดียวกับผีเสื้อกลางคืนที่ถูกดึงดูดเข้าหาแสงสว่าง คุณเองก็กำลังถูกนำทางไปสู่การเปลี่ยนแปลงที่สำคัญ จงเปิดรับข่าวสารหรือข้อมูลใหม่ๆ ที่เข้ามา เพราะมันอาจเป็นกุญแจสำคัญในการเติบโตของคุณ นอกจากนี้ยังเป็นสัญญาณของการติดต่อจากโลกวิญญาณที่ต้องการจะนำทางคุณไปสู่แสงสว่าง" },
  { name: "Rabbit", image: "images/rabbit.png", message: "ความคิดสร้างสรรค์ ความรวดเร็ว อุดมสมบูรณ์", advice: "คำแนะนำสำหรับวันนี้: พลังงานแห่งความคิดสร้างสรรค์กำลังพรั่งพรู! วันนี้กระต่ายนำสาสน์แห่งความอุดมสมบูรณ์และความรวดเร็วมาให้ ไอเดียใหม่ๆ จะผุดขึ้นมาอย่างรวดเร็ว จงรีบคว้าและลงมือทำ อย่าปล่อยให้โอกาสทองหลุดลอยไป นี่คือช่วงเวลาที่เหมาะอย่างยิ่งสำหรับการเริ่มต้นโปรเจกต์ใหม่ๆ ที่จะนำความสำเร็จและความมั่งคั่งมาให้" },
  { name: "Grizzly Bear", image: "images/grizzly-bear.png", message: "ทำตามความฝัน ลางสังหรณ์ ยึดมั่นในความเชื่อ", advice: "คำแนะนำสำหรับวันนี้: หมีกริซลีคือพลังอันยิ่งใหญ่ที่กระตุ้นให้คุณลุกขึ้นมาปกป้องความฝันของตัวเอง จงฟังเสียงลางสังหรณ์ที่ดังอยู่ในใจและยึดมั่นในความเชื่อของคุณอย่างไม่สั่นคลอน แม้เส้นทางอาจจะดูน่าเกรงขาม แต่คุณมีความแข็งแกร่งและความกล้าหาญมากพอที่จะทำความฝันให้เป็นจริงได้" },
  { name: "Cheetah", image: "images/cheetah.png", message: "ตัดสินใจทันที ลงมือทำ รอดพ้นอย่างหวุดหวิด", advice: "คำแนะนำสำหรับวันนี้: เวลาแห่งการลังเลได้หมดลงแล้ว! เสือชีตาห์คือความเร็วและการตัดสินใจที่เฉียบขาด วันนี้คุณต้องเคลื่อนไหวอย่างรวดเร็วและเด็ดขาดเพื่อคว้าโอกาสที่ผ่านเข้ามา หากมีสถานการณ์คับขัน คุณจะสามารถเอาตัวรอดไปได้อย่างหวุดหวิดด้วยสัญชาตญาณและความเร็วของคุณ จงเชื่อมั่นและพุ่งทะยานไปข้างหน้า" },
  { name: "Duck", image: "images/duck.png", message: "ภาวะเจริญพันธุ์ มีทักษะหลากหลาย การลงมือทำ", advice: "คำแนะนำสำหรับวันนี้: เป็ดสามารถทำได้ทั้งว่ายน้ำ เดิน และบิน เป็นสัญลักษณ์ของการมีทักษะที่หลากหลาย วันนี้จงใช้ความสามารถรอบด้านของคุณให้เป็นประโยชน์ นอกจากนี้ยังเป็นสัญลักษณ์ของภาวะเจริญพันธุ์ ซึ่งอาจหมายถึงการให้กำเนิดไอเดียใหม่ๆ โปรเจกต์ใหม่ๆ หรือแม้แต่การเริ่มต้นครอบครัว จงลงมือทำแล้วคุณจะเห็นผลลัพธ์ที่งอกงาม" },
  { name: "Dragon", image: "images/dragon.png", message: "ได้รับการปกป้องจากสิ่งศักดิ์สิทธิ์ พลิกชีวิต อำนาจ", advice: "คำแนะนำสำหรับวันนี้: คุณกำลังอยู่ภายใต้การคุ้มครองของพลังอันยิ่งใหญ่และศักดิ์สิทธิ์ มังกรคือสัญลักษณ์แห่งอำนาจ โชคลาภ และการเปลี่ยนแปลงชีวิตครั้งสำคัญ วันนี้คือวันที่คุณจะได้สัมผัสกับพลังอำนาจในตัวเองและสามารถพลิกชะตาชีวิตจากร้ายให้กลายเป็นดีได้อย่างน่าอัศจรรย์ จงกล้าหาญและเชื่อมั่น เพราะจักรวาลกำลังหนุนหลังคุณอยู่" }
];

// == ระบบบัญชีผู้ใช้ (Player Account System) ==

// ฟังก์ชันสำหรับดึงข้อมูลผู้เล่นจาก localStorage
function loadPlayerData() {
    const data = localStorage.getItem('playerData');
    return data ? JSON.parse(data) : null;
}

function savePlayerData(data) {
    localStorage.setItem('playerData', JSON.stringify(data));
}

// ฟังก์ชันสำหรับคำนวณ Rank จาก EXP ตามระบบ Tier และ Division
function getRankFromExp(exp) {
  const roman = ['V', 'IV', 'III', 'II', 'I'];

  // Tier 1: Neophytus (0-499 EXP | 100 EXP ต่อ Division)
  if (exp < 500) {
    const divisionIndex = Math.min(4, Math.floor(exp / 100));
    return `Neophytus ${roman[divisionIndex]}`;
  }
  // Tier 2: Magus (500-1499 EXP | 200 EXP ต่อ Division)
  if (exp < 1500) {
    const divisionIndex = Math.min(4, Math.floor((exp - 500) / 200));
    return `Magus ${roman[divisionIndex]}`;
  }
  // Tier 3: Magister (1500-2999 EXP | 300 EXP ต่อ Division)
  if (exp < 3000) {
    const divisionIndex = Math.min(4, Math.floor((exp - 1500) / 300));
    return `Magister ${roman[divisionIndex]}`;
  }
  // Tier 4: Dominus (3000-4999 EXP | 400 EXP ต่อ Division)
  if (exp < 5000) {
    const divisionIndex = Math.min(4, Math.floor((exp - 3000) / 400));
    return `Dominus ${roman[divisionIndex]}`;
  }
  // Tier 5: Majores (5000+ EXP | 500 EXP ต่อ Division)
  const divisionIndex = Math.min(4, Math.floor((exp - 5000) / 500));
  return `Majores ${roman[divisionIndex]}`;
}


// ฟังก์ชันสำหรับคำนวณข้อมูลหลอด EXP
function getExpProgress(exp) {
  let tierStartExp = 0;
  let expPerDivision = 100;

  if (exp >= 5000) { // Majores
    tierStartExp = 5000;
    expPerDivision = 500;
  } else if (exp >= 3000) { // Dominus
    tierStartExp = 3000;
    expPerDivision = 400;
  } else if (exp >= 1500) { // Magister
    tierStartExp = 1500;
    expPerDivision = 300;
  } else if (exp >= 500) { // Magus
    tierStartExp = 500;
    expPerDivision = 200;
  } else { // Neophytus
    tierStartExp = 0;
    expPerDivision = 100;
  }

  const expIntoTier = exp - tierStartExp;
  const currentExpInDivision = expIntoTier % expPerDivision;
  const percentage = (currentExpInDivision / expPerDivision) * 100;

  return {
    current: currentExpInDivision,
    required: expPerDivision,
    percentage: percentage
  };
}



// ฟังก์ชันเริ่มต้นแอปทั้งหมด
function initializeApp() {
    const playerData = loadPlayerData();
    if (playerData) {
        showHome();
    } else {
        showRegistrationPage();
    }
}

// ฟังก์ชันสำหรับแสดงหน้าลงทะเบียน
function showRegistrationPage() {
    const root = document.getElementById("spa-root");
    if (!root) return;
    root.innerHTML = `
    <div class="window registration-window">
      <h1>ยินดีต้อนรับสู่โลกเวทมนตร์!</h1>
      <p>ก่อนจะเริ่มการเดินทาง โปรดตั้งชื่อของคุณ</p>
      <input type="text" id="username-input" placeholder="ใส่ชื่อของคุณที่นี่..." maxlength="20">
      <div class="registration-notice">
        <span class="notice-icon">⚠️</span>
        <span class="notice-text">ตั้งชื่อได้ครั้งเดียว เลือกดี ๆ น้า</span>
      </div>
      <button id="start-journey-button" class="button">เริ่มต้นการเดินทาง</button>
    </div>
  `;
    const startButton = document.getElementById('start-journey-button');
    const usernameInput = document.getElementById('username-input');
    startButton.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        if (username) {
            const newPlayerData = {
                username: username,
                exp: 0,
                rank: getRankFromExp(0), // <-- แก้ไขให้เรียกใช้ฟังก์ชัน
                collectedCards: [],
                answeredQuestions: [],
                lastCardDrawDate: null,
                lastQuestionAnsweredDate: null
            };
            savePlayerData(newPlayerData);
            sfxPop.play();
            playSlideTransition(showHome);
        } else {
            alert('กรุณาตั้งชื่อก่อนเริ่มการเดินทาง');
        }
    });
}

// ============ SPA Main =============
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('touchend', function(e) {
      if (e.target.classList.contains('button') || e.target.tagName === 'BUTTON') {
        e.target.blur();
      }
    });
    initializeApp();
});

function playSlideTransition(cb) {
    const slide = document.getElementById("slide-screen");
    if (slide) {
        slide.classList.add("active");
        setTimeout(() => { cb && cb(); slide.classList.remove("active"); }, 500);
    } else {
        cb && cb();
    }
}

// ================================================================
// 1. วางโค้ดส่วนนี้ทับฟังก์ชัน showHome ของเดิม
// ================================================================
let lastKnownExp = 0; // Global variable
function showHome(triggerCollectionAnimation = false) { 
    const playerData = loadPlayerData();
    if (!playerData) {
        showRegistrationPage();
        return;
    }
    
    let initialExpForDisplay = triggerCollectionAnimation ? lastKnownExp : playerData.exp;
    lastKnownExp = playerData.exp; 

    trackPageView('/', 'Home Page');
    const expProgress = getExpProgress(initialExpForDisplay); 
    const root = document.getElementById("spa-root");
    if (!root) return;

    root.innerHTML = `
     <div class="player-profile-box">
      <div id="player-rank-container">
        <div class="player-rank-title">Ranking : ${playerData.rank}</div>
      </div>
      <div class="player-username">${playerData.username}</div>
      <div class="exp-bar-container">
        <div class="exp-bar-fill" style="width: ${expProgress.percentage}%;"></div>
        <span class="exp-text">EXP: ${expProgress.current} / ${expProgress.required}</span>
      </div>
      <button id="collection-button" class="button collection-btn">📖 กรีมัวร์ของฉัน</button>
    </div>
    <div class="window menu-box">
      <h1>นุ่มฟู ออราเคิล</h1>
      <p>สุ่มไพ่พยากรณ์ประจำวันของคุณ</p>
      <button class="button" id="btn-draw">คลิกเพื่อเริ่มสุ่มไพ่</button>
      <img src="images/card-in-box.png" class="card-in-box" alt="สุ่มไพ่รายวัน" />
    </div>
    <div class="encyclopedia-box menu-box clickable-box" onclick="return false;" tabindex="0">
      <strong>สารานุกรม สมุนไพรเวท</strong><br>
      <span style="font-size:1em;color:#8ec9ff;">Coming Soon ...</span>
      <img src="images/leaf.png" class="herb-leaf" alt="ใบไม้" />
    </div>
    <div class="wheel-box menu-box clickable-box" onclick="return false;" tabindex="0">
      <strong>กงล้อแห่งปี</strong><br>
      <span style="font-size:1em;color:#8ec9ff;">Coming Soon ...</span>
      <img src="images/wheel-of-the-year.png" class="wheel-of-the-year" alt="กงล้อแห่งปี" />
    </div>
    <div class="my-familiars menu-box clickable-box" onclick="return false;" tabindex="0">
      <strong>ภูติรับใช้</strong><br>
      <span style="font-size:1em;color:#8ec9ff;">Coming Soon ...</span>
      <img src="images/egg.png" class="egg" alt="ภูติรับใช้" />
    </div>
    <div class="supporter-box menu-box clickable-box" id="supporter-box">
      <strong>ผู้สนับสนุนของเรา</strong><br>
      <span>💖 กดเพื่อดูรายชื่อ 💖</span>
      <img src="images/love.png" class="love" alt="รัก" />
    </div>
  `;
  
    window.scrollTo(0, 0); 

    setTimeout(() => {
        const expDisplayElement = root.querySelector('.exp-text'); 
        const expFillElement = root.querySelector('.exp-bar-fill'); 

        if (expDisplayElement && expFillElement) {
            const initialExpProgress = getExpProgress(initialExpForDisplay);
            expDisplayElement.textContent = `EXP: ${initialExpProgress.current.toFixed(0)} / ${initialExpProgress.required}`;
            expFillElement.style.width = `${initialExpProgress.percentage}%`;
        }

        document.getElementById("btn-draw").onclick = () => { sfxPop.play(); playSlideTransition(showCardPage); };
        document.getElementById("supporter-box").onclick = () => { sfxPop.play(); playSlideTransition(showSupporterPage); };
        
        const collectionButton = document.getElementById("collection-button");
        collectionButton.onclick = () => { sfxPop.play(); playSlideTransition(showCollectionPage); };

        if (triggerCollectionAnimation) {
            setTimeout(() => {
                const expBarContainer = root.querySelector('.exp-bar-container');
                if (!expBarContainer || !collectionButton) return;
                const collectionBtnRect = collectionButton.getBoundingClientRect();
                const startY_fly = window.innerHeight / 2; 
                const startX_fly = window.innerWidth / 2; 
                const targetY_fly = collectionBtnRect.top + collectionBtnRect.height / 2;
                const targetX_fly = collectionBtnRect.left + collectionBtnRect.width / 2;
                const flyingCard = document.createElement('div');
                flyingCard.className = 'flying-card';
                flyingCard.style.setProperty('--start-y', `${startY_fly}px`);
                flyingCard.style.setProperty('--start-x', `${startX_fly}px`);
                flyingCard.style.setProperty('--target-y', `${targetY_fly}px`);
                flyingCard.style.setProperty('--target-x', `${targetX_fly}px`);
                document.body.appendChild(flyingCard);
                
                setTimeout(() => {
                    if (document.body.contains(flyingCard)) {
                      document.body.removeChild(flyingCard);
                    }
                    collectionButton.classList.add('pop-effect');
                    if (typeof sfxCollect !== 'undefined') {
                        sfxCollect.currentTime = 0; 
                        sfxCollect.play(); 
                    }
                    
                    setTimeout(() => {
                        collectionButton.classList.remove('pop-effect'); 
                        const finalExp = playerData.exp; 
                        
                        if (finalExp > initialExpForDisplay) { 
                            sfxProgressBar.currentTime = 0; 
                            sfxProgressBar.play(); 
                            const expAnimationDuration = 1000;
                            const expChangePerMs = (finalExp - initialExpForDisplay) / expAnimationDuration;
                            let currentAnimatedValue = initialExpForDisplay;
                            const animateExp = (startTime) => {
                                const currentTime = performance.now();
                                const elapsed = currentTime - startTime;
                                if (elapsed < expAnimationDuration) {
                                    currentAnimatedValue = initialExpForDisplay + (expChangePerMs * elapsed); 
                                    if (currentAnimatedValue > finalExp) currentAnimatedValue = finalExp; 
                                    const animatedExpProgress = getExpProgress(currentAnimatedValue);
                                    expDisplayElement.textContent = `EXP: ${animatedExpProgress.current.toFixed(0)} / ${animatedExpProgress.required}`;
                                    expFillElement.style.width = `${animatedExpProgress.percentage}%`;
                                    requestAnimationFrame(() => animateExp(startTime));
                                } else {
                                    const animatedExpProgress = getExpProgress(finalExp);
                                    expDisplayElement.textContent = `EXP: ${animatedExpProgress.current.toFixed(0)} / ${animatedExpProgress.required}`;
                                    expFillElement.style.width = `${animatedExpProgress.percentage}%`;
                                    sfxProgressBar.pause(); 

                                    const oldRank = getRankFromExp(initialExpForDisplay);
                                    const newRank = getRankFromExp(playerData.exp);

                                  if (oldRank !== newRank) {
                                      console.log(`Rank Up! From ${oldRank} to ${newRank}`);
                                      const rankContainer = document.getElementById('player-rank-container');
                                      const rankTitle = rankContainer.querySelector('.player-rank-title');
                                      
                                      if (rankTitle) {
                                          rankTitle.classList.add('rank-out');
                                          setTimeout(() => {
                                              rankTitle.textContent = `Ranking : ${newRank}`;
                                              rankTitle.classList.remove('rank-out');
                                              rankTitle.classList.add('rank-in');
                                          }, 500);
                                      }
                                  }
                                }
                            };
                            requestAnimationFrame((timestamp) => animateExp(timestamp)); 
                        } else {
                            const animatedExpProgress = getExpProgress(finalExp);
                            expDisplayElement.textContent = `EXP: ${animatedExpProgress.current.toFixed(0)} / ${animatedExpProgress.required}`;
                            expFillElement.style.width = `${animatedExpProgress.percentage}%`;
                        }
                    }, 400); 
                }, 1500);
            }, 800);
        }
    }, 50);
}

// ========== CARD PAGE ==========
function updateCountdownTimer() {
    const timerBox = document.getElementById("countdown-timer");
    const backButton = document.getElementById("btn-back");

    // [แก้ไข] ถ้าไม่มีกล่องนับเวลา หรือ ไม่มีปุ่มกลับ ให้หยุดทำงานทันที
    if (!timerBox || !backButton) {
        if (countdownInterval) {
            clearInterval(countdownInterval); // ถือโอกาสเคลียร์ทิ้งเลยถ้าหาไม่เจอ
            countdownInterval = null;
        }
        return;
    }

    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const diff = tomorrow - now;

    if (diff <= 0) {
        timerBox.innerHTML = `🎉 <span style="color:#4caf50;">คุณสามารถสุ่มใหม่ได้แล้ว!</span>`;
        // ไม่ต้องซ่อนปุ่มแล้ว เพราะเมื่อเวลาหมด หน้านี้จะถูกโหลดใหม่เป็นการ์ดที่ให้สุ่มได้
    } else {
        timerBox.style.display = "inline-block";
        backButton.style.display = "inline-block";
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        timerBox.innerHTML = `🕒 <span style="color:#444;">พร้อมสุ่มใหม่ในอีก <b>${hours}</b> ชั่วโมง <b>${minutes}</b> นาที <b>${seconds}</b> วินาที</span>`;
    }
}

// ================================================================
// 2. จากนั้น วางโค้ดส่วนนี้ทับฟังก์ชัน showCardPage ของเดิม
// ================================================================
// วางทับฟังก์ชัน showCardPage เดิมทั้งหมด
function showCardPage() {
    trackPageView('/card', 'Card Page');
    const root = document.getElementById("spa-root");
    if (!root) return;
    root.innerHTML = `
    <div class="window">
      <h1>ไพ่ของคุณ คือ</h1>
      <div class="card-flip" id="flip-card">
        <div class="card-inner">
          <div class="card-front" id="card-front"></div>
          <div class="card-back"></div>
        </div>
      </div>
      <h2 id="card-title"></h2>
      <p id="card-message"></p>
      <p id="card-advice" class="card-advice-text"></p> 
    </div>
    <div class="center-wrapper"><p id="countdown-timer" class="countdown-timer cute-timer" style="display:none;"></p></div>
    <div class="button-group"><button id="btn-back">🔙 กลับ</button>
    <button id="btn-share-facebook">🔗 แชร์</button> </div>
  `;

    const flipCard = document.getElementById("flip-card");
    const dailyCardData = JSON.parse(localStorage.getItem("dailyCard"));

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayForExp = `${year}-${month}-${day}`;

    let playerData = loadPlayerData();
    let isDailyRewardGrantedOnFlip = false; 

    const handleCardFlip = () => { 
        sfxSwipe.play();
        flipCard.classList.add("flipped");

        const currentPlayerData = loadPlayerData();
        
        if (currentPlayerData.lastCardDrawDate !== todayForExp) {
            currentPlayerData.exp += 25;
            currentPlayerData.rank = getRankFromExp(currentPlayerData.exp);
            currentPlayerData.lastCardDrawDate = todayForExp;
            isDailyRewardGrantedOnFlip = true;
        }
        
        const card = cards[Math.floor(Math.random() * cards.length)];
        localStorage.setItem("dailyCard", JSON.stringify(card));
        
        if (!currentPlayerData.collectedCards.includes(card.name)) {
            currentPlayerData.collectedCards.push(card.name);
        }
        savePlayerData(currentPlayerData);

        showCard(card);
        flipCard.style.pointerEvents = "none"; 
        flipCard.removeEventListener("click", handleCardFlip); 

        // [แก้ไข] เมื่อสุ่มเสร็จ ให้เริ่มนับถอยหลังและเก็บ ID ของ interval ไว้
        if (countdownInterval) clearInterval(countdownInterval); // เคลียร์ของเก่าก่อนเริ่มใหม่
        countdownInterval = setInterval(updateCountdownTimer, 1000);
        updateCountdownTimer(); // เรียกครั้งแรกทันที
    };

    if (playerData && playerData.lastCardDrawDate === todayForExp && dailyCardData) {
        flipCard.classList.add("flipped"); 
        showCard(dailyCardData); 
        flipCard.style.pointerEvents = "none";

        // [แก้ไข] เมื่อแสดงไพ่เก่า ก็ให้เริ่มนับถอยหลังเช่นกัน
        if (countdownInterval) clearInterval(countdownInterval); // เคลียร์ของเก่าก่อนเริ่มใหม่
        countdownInterval = setInterval(updateCountdownTimer, 1000);
        updateCountdownTimer(); // เรียกครั้งแรกทันที

    } else {
        flipCard.removeEventListener("click", handleCardFlip); 
        flipCard.addEventListener("click", handleCardFlip); 
        flipCard.style.pointerEvents = "auto";
    }

    // [แก้ไข] ส่วนสำคัญที่สุด: เพิ่มการเคลียร์ interval ตอนกดปุ่ม "กลับ"
    setTimeout(() => {
        document.getElementById("btn-back").onclick = () => {
            sfxPop.play();
            
            // สั่งให้ตัวนับเวลาหยุดทำงานก่อนเปลี่ยนหน้า
            if (countdownInterval) {
                clearInterval(countdownInterval);
                countdownInterval = null; // ตั้งค่ากลับเป็น null
            }

            playSlideTransition(() => showHome(isDailyRewardGrantedOnFlip)); 
        };
        const shareButton = document.getElementById("btn-share-facebook");
if (shareButton) {
    shareButton.onclick = () => {
        sfxPop.play();
        const cardToShare = JSON.parse(localStorage.getItem("dailyCard"));
        if (!cardToShare) return alert("ไม่พบข้อมูลการ์ดที่จะแชร์ครับ");

        // **** แก้ไข URL ตรงนี้ให้เป็น URL ของเว็บ V2 คุณ ****
        const appUrl = 'https://my-familiars-v2.netlify.app'; 
        
        // สร้าง URL สำหรับแชร์ที่มีชื่อการ์ดต่อท้าย
        const cardShareUrl = `${appUrl}/.netlify/functions/share-card?name=${encodeURIComponent(cardToShare.name)}`;
        const shareText = `วันนี้ฉันได้ไพ่ "${cardToShare.name}" จาก My Familiars!`;

        // ใช้ Web Share API เหมือนเดิม แต่ส่ง URL ใหม่เข้าไป
        if (navigator.share) {
            navigator.share({
                title: 'ไพ่ประจำวันของฉัน - My Familiars',
                text: shareText,
                url: cardShareUrl // <-- ใช้ URL ใหม่
            });
        } else {
            const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cardShareUrl)}&quote=${encodeURIComponent(shareText)}`;
            window.open(facebookShareUrl, 'facebook-share-dialog', 'width=800,height=600');
        }
    };
}
    }, 30);
}


// ============ DRAW CARD ============
function drawCard(viewOnly = false) {
  const today = new Date().toLocaleDateString();
  const lastDrawDate = localStorage.getItem("lastDrawDate");

  if (viewOnly) {
    if (lastDrawDate !== today) return;

    const card = JSON.parse(localStorage.getItem("dailyCard"));
    if (!card) return;
    showCard(card);
    return;
  }

  const card = cards[Math.floor(Math.random() * cards.length)];
  localStorage.setItem("lastDrawDate", today);
  localStorage.setItem("dailyCard", JSON.stringify(card));
  showCard(card);
}

function showCard(card) {
    const cardFront = document.getElementById("card-front");
    const cardTitle = document.getElementById("card-title");
    const messageBox = document.getElementById("card-message");
    const adviceBox = document.getElementById("card-advice");
    
    cardFront.style.backgroundImage = `url(${card.image})`;
    cardTitle.textContent = card.name;
    messageBox.textContent = card.message;
    adviceBox.innerHTML = '';
    
    if (card.advice) {
        const formattedAdvice = card.advice.replace('คำแนะนำสำหรับวันนี้:', '<strong>คำแนะนำสำหรับวันนี้:</strong>');
        adviceBox.innerHTML = formattedAdvice;
    }
}




// ============ SUPPORTER PAGE ============
function showSupporterPage() {
  trackPageView('/supporters', 'Supporters Page');

  const root = document.getElementById("spa-root");
  if (!root) return;

  root.innerHTML = `
    <div class="window">
      <h1>ขอบคุณผู้สนับสนุน</h1>
      <p style="margin-top:1em;">แอพนี้เกิดขึ้นได้ด้วยพลังแห่งความรักจากทุกท่าน 💖💖💖 </p>
      <ul class="supporter-list">
        <li>🌟 Aikankankorn Wongthanaphum</li>
        <li>🌟 anuthida chuayrueang</li>
        <li>🌟 Aranya Lindroos</li>
        <li>🌟 คุณ พัชราภรณ์</li>
        <li>🌟 และอีกหลายท่านที่ร่วมสนับสนุน ✨</li>
      </ul>
    </div>
    <div class="button-group">
      <button id="btn-back">🔙 กลับ</button>
    </div>
  `;

  setTimeout(() => {
    document.getElementById("btn-back").onclick = () => {
      sfxPop.currentTime = 0;
      sfxPop.play();
      playSlideTransition(showHome);
    };
  }, 30);
}

// ... โค้ดที่มีอยู่แล้ว ...

// == Global Variables for Collection Pagination ==
let currentPage = 1;
const cardsPerPage = 4; // แสดง 4 ใบต่อหน้า

// ... โค้ดที่มีอยู่แล้ว ...

// ============ COLLECTION PAGE ============
function showCollectionPage() {
  trackPageView('/collection', 'Card Collection');

  const root = document.getElementById("spa-root");
  const playerData = loadPlayerData();
  const collected = playerData ? playerData.collectedCards : [];

  // คำนวณจำนวนหน้าทั้งหมด
  const totalPages = Math.ceil(collected.length / cardsPerPage);
  
  // ตรวจสอบให้แน่ใจว่า currentPage ไม่เกินขอบเขต
  if (currentPage > totalPages && totalPages > 0) {
      currentPage = totalPages;
  } else if (totalPages === 0) {
      currentPage = 1;
  }

  // ดึงการ์ดสำหรับหน้าปัจจุบัน
  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const cardsToShow = collected.slice(startIndex, endIndex);

  let collectionGridHtml = '';
  if (cardsToShow.length === 0) { // เปลี่ยนจาก collected.length === 0 เป็น cardsToShow.length === 0
    collectionGridHtml = `<p class="empty-collection-text">ยังไม่มีการ์ดในคอลเลคชัน<br>ลองเปิดไพ่รายวันเพื่อเริ่มสะสมสิ!</p>`;
  } else {
    // สร้างการ์ดแต่ละใบในคอลเลคชันสำหรับหน้าปัจจุบัน
    collectionGridHtml = cardsToShow.map(cardName => { // เปลี่ยนจาก collected.map เป็น cardsToShow.map
      const cardData = cards.find(c => c.name === cardName);
      if (!cardData) return '';
      return `
        <div class="collection-card" data-card-name="${cardData.name}">
          <img src="${cardData.image}" alt="${cardData.name}" loading="lazy">
          <span>${cardData.name}</span>
        </div>
      `;
    }).join('');
  }

  root.innerHTML = `
    <div class="window">
      <h1>กรีมัวร์ของฉัน</h1>
      <p>การ์ดที่สะสมได้ทั้งหมด: ${collected.length} / ${cards.length} ใบ</p>
      <div class="collection-grid">
        ${collectionGridHtml}
      </div>
       <div class="pagination-controls" ${totalPages <= 1 ? 'style="display: none;"' : ''}>
        <button id="prev-page-btn" ${currentPage === 1 ? 'disabled style="display: none;"' : ''}>&lt; หน้าก่อนหน้า</button>
        <span class="page-info">หน้า ${currentPage} / ${totalPages > 0 ? totalPages : 1}</span>
        <button id="next-page-btn" ${currentPage === totalPages || totalPages === 0 ? 'disabled style="display: none;"' : ''}>หน้าถัดไป &gt;</button>
      </div>
    </div>
    <div class="button-group">
      <button id="btn-back">🔙 กลับ</button>
    </div>
  `;

  setTimeout(() => {
    // Event listener สำหรับปุ่มกลับ
    document.getElementById("btn-back").onclick = () => {
      sfxPop.currentTime = 0;
      sfxPop.play();
      playSlideTransition(showHome);
    };

    // Event listeners สำหรับปุ่ม Pagination
     const prevBtn = document.getElementById("prev-page-btn");
    const nextBtn = document.getElementById("next-page-btn");

    if (prevBtn) { // ตรวจสอบว่าปุ่มมีอยู่จริงก่อนเพิ่ม event listener
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                sfxPop.currentTime = 0;
                sfxPop.play();
                currentPage--;
                showCollectionPage(); // ไม่ใช้ playSlideTransition ที่นี่
            }
        };
    }

    if (nextBtn) { // ตรวจสอบว่าปุ่มมีอยู่จริงก่อนเพิ่ม event listener
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                sfxPop.currentTime = 0;
                sfxPop.play();
                currentPage++;
                showCollectionPage(); // ไม่ใช้ playSlideTransition ที่นี่
            }
        };
    }


    // Event listener สำหรับการ์ดแต่ละใบ (ไม่มีการเปลี่ยนแปลง)
    document.querySelector('.collection-grid').addEventListener('click', (event) => {
      const cardElement = event.target.closest('.collection-card');
      if (cardElement) {
        // --- เพิ่มโค้ดเล่นเสียงตรงนี้ ---
        sfxPop.currentTime = 0;
        sfxPop.play();
        // -----------------------------

        const cardName = cardElement.dataset.cardName;
        const cardData = cards.find(c => c.name === cardName);
        if (cardData) {
          showCardDetailModal(cardData);
        }
      }
    });
  }, 50);
}

// ฟังก์ชันสำหรับแสดง Modal รายละเอียดการ์ด
function showCardDetailModal(card) {
  // สร้าง Modal ขึ้นมา
  const modalContainer = document.createElement('div');
  modalContainer.className = 'modal-container';
  modalContainer.innerHTML = `
    <div class="modal-content">
      <span class="modal-close">&times;</span>
      <img src="${card.image}" alt="${card.name}">
      <h2>${card.name}</h2>
      <p class="modal-message">${card.message}</p>
      <div class="modal-advice-container">
        <p class="modal-advice">${card.advice.replace('คำแนะนำสำหรับวันนี้:', '<strong>คำแนะนำสำหรับวันนี้:</strong>')}</p>
      </div>
    </div>
  `;
  document.body.appendChild(modalContainer);

  // ทำให้พื้นหลังเลื่อนไม่ได้
  document.body.style.overflow = 'hidden';

  // Event listener สำหรับปิด Modal
  const closeModal = () => {
    document.body.removeChild(modalContainer);
    document.body.style.overflow = 'auto';
  };

  modalContainer.querySelector('.modal-close').onclick = closeModal;
  modalContainer.onclick = (event) => {
    if (event.target === modalContainer) {
      closeModal();
    }
  };
}

// ฟังก์ชันสำหรับส่งข้อมูลการดูหน้าเว็บไปให้ Google Analytics โดยเฉพาะ
function trackPageView(pagePath, pageTitle) {
    if (typeof gtag === 'function') {
        gtag('event', 'page_view', { page_title: pageTitle, page_path: pagePath });
    }
}

// ===========================================
//  วางโค้ดส่วนนี้ไว้ล่างสุดของไฟล์ main.js (เวอร์ชันแก้ไขแล้ว)
// ===========================================

// --- ระบบเปิดเมนูสำหรับผู้พัฒนา ---
let clickCounter = 0;
let clickTimer = null;

document.addEventListener('click', function(event) {
    const appInfo = document.getElementById('app-info');
    if (appInfo && appInfo.contains(event.target)) {
        clickCounter++;
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => { clickCounter = 0; }, 2000);
        if (clickCounter >= 15) {
            const debugMenu = document.getElementById('debug-menu');
            if (debugMenu) { debugMenu.style.display = 'block'; console.log('Debug Menu Activated!'); }
            clickCounter = 0;
        }
    }
});

// --- การทำงานของปุ่มในเมนูผู้พัฒนา ---
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const btnResetDraw = document.getElementById('debug-reset-draw');
        const btnNextDay = document.getElementById('debug-next-day');
        const btnAddExp = document.getElementById('debug-add-exp');
        const btnHardReset = document.getElementById('debug-hard-reset');

        if (btnResetDraw) {
            btnResetDraw.onclick = () => {
                const pd = JSON.parse(localStorage.getItem("playerData"));
                if (pd) {
                    pd.lastCardDrawDate = null;
                    localStorage.setItem("playerData", JSON.stringify(pd));
                    localStorage.removeItem("dailyCard");
                    alert("รีเซ็ตสถานะการสุ่มไพ่สำเร็จ!");
                    location.reload();
                }
            };
        }

        if (btnNextDay) {
            btnNextDay.onclick = () => {
                const pd = JSON.parse(localStorage.getItem("playerData"));
                if (pd) {
                    // [แก้ไข] ตั้งวันที่สุ่มล่าสุดให้เป็นเมื่อวานตามเวลาท้องถิ่น
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const y_year = yesterday.getFullYear();
                    const y_month = String(yesterday.getMonth() + 1).padStart(2, '0');
                    const y_day = String(yesterday.getDate()).padStart(2, '0');
                    pd.lastCardDrawDate = `${y_year}-${y_month}-${y_day}`;
                    
                    localStorage.setItem("playerData", JSON.stringify(pd));
                    alert("จำลองเป็นวันถัดไปสำเร็จ! คุณสามารถสุ่มไพ่ใหม่ได้เลย");
                    location.reload();
                }
            };
        }

        if (btnAddExp) {
            btnAddExp.onclick = () => {
                const pd = JSON.parse(localStorage.getItem("playerData"));
                if (pd) {
                    pd.exp += 100;
                    pd.rank = getRankFromExp(pd.exp);
                    localStorage.setItem("playerData", JSON.stringify(pd));
                    alert("+100 EXP สำเร็จ!");
                    location.reload();
                }
            };
        }

        if (btnHardReset) {
            btnHardReset.onclick = () => {
                if (confirm("คุณแน่ใจนะว่าจะล้างข้อมูลทั้งหมด? จะกลับไปหน้าตั้งชื่อเลยนะ!")) {
                    localStorage.clear();
                    alert("ล้างข้อมูลทั้งหมดเรียบร้อย");
                    location.reload();
                }
            };
        }
    }, 1000);
});