// ไฟล์: netlify/functions/share-card.js

// เราต้องเอาข้อมูลการ์ดทั้งหมดมาไว้ในนี้ด้วย
const cards = [
  { name: "Capybara", image: "images/Capybara.png", message: "ผ่อนคลาย พักผ่อน หยุดอยู่กับที่" },
  { name: "Alicorn", image: "images/Alicorn.png", message: "พลังศักดิ์สิทธิ์ การเยียวยา ความบริสุทธ์" },
  { name: "Pigeon", image: "images/Pigeon.png", message: "ความรัก ความสงบ สันติ" },
  { name: "Dog", image: "images/Dog.png", message: "ความศรัทธา ความช่วยเหลือ รักไร้เงื่อนไข" },
  { name: "Chipmunk", image: "images/chipmunk.png", message: "การเดินทาง ศิลปะ ใส่ใจรายละเอียดเล็ก ๆ น้อย ๆ " },
  { name: "Snake", image: "images/Snake.png", message: "ความไม่แน่นอน เปลี่ยนแปลงตัวตน พลังงานไม่ทราบที่มา" },
  { name: "Lion", image: "images/Lion.png", message: "ความแข็งแกร่ง อัตตา เชื่อใจตัวเองเท่านั้น" },
  { name: "Cat", image: "images/Cat.png", message: "ความมั่นใจ เสน่ห์แรง มีคนคอยเอาใจใส่" },
  { name: "JellyFish", image: "images/Jellyfish.png", message: "ฝืนไหลไปตามกระแส ยอมจำนน" },
  { name: "Frog", image: "images/Frog.png", message: "ความอุดมสมบูรณ์ เงินทอง ความมั่งคั่ง" },
  { name: "Unicorn", image: "images/Unicorn.png", message: "ฝันเป็นจริง สมปรารถนา สิ่งที่คาดหวังไว้จะเกิดขึ้น" },
  { name: "Ant", image: "images/ant.png", message: "ความขยัน ความอดทน ทำงานหนัก" },
  { name: "Crocodile", image: "images/crocodile.png", message: "บรรพบุรุษ อาณาเขต การรอคอย" },
  { name: "Rat", image: "images/rat.png", message: "มีทักษะมาก ร่ำรวยจากการลงทุน การรีไซเคิล" },
  { name: "Fox", image: "images/fox.png", message: "คนใกล้ตัวไว้ใจไม่ได้ อย่าทำตัวเด่น ระวังตัวเสมอ" },
  { name: "Phoenix", image: "images/phoenix.png", message: "กำเนิดใหม่ ก้าวสู่จุดสูงสุด ความลึกลับ" },
  { name: "Chinchilla", image: "images/chinchilla.png", message: "ความกระตือรือร้น การสำรวจ ซุกซน" },
  { name: "Beaver", image: "images/beaver.png", message: "ครอบครัว คนรัก บ้านเรือน" },
  { name: "Snow Leopard", image: "images/snow-leopard.png", message: "ทำงานให้สำเร็จ ได้รับงานใหญ่ ได้ของหายาก" },
  { name: "Weasel", image: "images/weasel.png", message: "ระวังคนใกล้ตัว ปกป้องตัวเอง ปกป้องครอบครัว" },
  { name: "Hawk", image: "images/hawk.png", message: "ไม่เปลี่ยนแปลง เฝ้าดู อยู่เหนือปัญหา" },
  { name: "Loris", image: "images/loris.png", message: "เก็บตัว ไม่เข้าสังคม อ่อนไหวง่าย" },
  { name: "Butterfly", image: "images/butterfly.png", message: "ความเปลี่ยนแปลงกระทันหัน การพัฒนาทางจิตวิญญาณ" },
  { name: "Deer", image: "images/deer.png", message: "ความเมตตา การเดินทาง ความท้าทาย" },
  { name: "Puma", image: "images/puma.png", message: "ขัดแย้งกับอำนาจ มองการณ์ไกล ก้าวต่อไปอย่าหยุด" },
  { name: "Goat", image: "images/goat.png", message: "มุ่งไปข้างหน้า ลงมือทำทันที ทำตามความฝัน" },
  { name: "Red Panda", image: "images/red-panda.png", message: "อย่ารีบตัดสินใจ เหรียญมีสองด้าน อย่าพึ่งลงมือ" },
  { name: "Sugar Glider", image: "images/sugar-glider.png", message: "ตารางการนอนแปรปรวน สุขภาพย่ำแย่ สังคมกลางคืน" },
  { name: "Koala", image: "images/koala.png", message: "เอาแน่เอานอนไม่ได้ แปรปรวน ความกลัว" },
  { name: "Tortoise", image: "images/tortoise.png", message: "ความล่าช้า อดทน การรอคอยที่น่าอึดอัด" },
  { name: "Ferret", image: "images/ferret.png", message: "โอกาส เชื่อใจตัวเอง ทำตามหัวใจ" },
  { name: "Penguin", image: "images/penguin.png", message: "ชีวิตที่ดี ความเพรียบพร้อม ลูซิดดรีม" },
  { name: "Bison", image: "images/bison.png", message: "ได้รับในสิ่งที่คาดหวัง มีศรัทธา การรอคอย" },
  { name: "Hedgehog", image: "images/hedgehog.png", message: "มีความสุขกับปัจจุบัน ใส่ใจธรรมชาติ พลังงานเทพี" },
  { name: "Boar", image: "images/boar.png", message: "ผลัดวันประกันพรุ่ง ขี้เกียจ กักตุนเงินหรือสิ่งของ" },
  { name: "Seal", image: "images/seal.png", message: "ความสนุกสนาน ความไม่รอบครอบ เด็ก" },
  { name: "Parrot", image: "images/parrot.png", message: "การสื่อสาร การเข้าสังคม งานสังสรรค์" },
  { name: "Wolf", image: "images/wolf.png", message: "ครอบครัว การทำงานเป็นทีม ความสามัคคี" },
  { name: "Elephant", image: "images/elephant.png", message: "ความท้าทาย ความดื้อดึง ความฉลาด" },
  { name: "Polar Bear", image: "images/polar-bear.png", message: "การพึ่งพาตัวเอง ความทรหด ความยากลำบาก" },
  { name: "Swan", image: "images/swan.png", message: "เรื่องดราม่า ความอ่อนไหว ความงดงาม" },
  { name: "Raccoon", image: "images/raccoon.png", message: "ความวุ่นวาย ความไม่มั่นคง หัวขโมย" },
  { name: "White Head Eagle", image: "images/white-head-eagle.png", message: "การติดต่อจากเทพ มองการณ์ไกล ใส่ใจรายละเอียด" },
  { name: "Bat", image: "images/bat.png", message: "เผชิญหน้ากับความกลัว เลิกนิสัยไม่ดี การเข้าสังคม" },
  { name: "Crow", image: "images/crow.png", message: "ลางบอกเหตุ การติดต่อจากโลกวิญญาณ บรรพบุรุษ" },
  { name: "Owl", image: "images/owl.png", message: "ไหวพริบ เก็บความลับ เชื่อใจตัวเอง" },
  { name: "Moth", image: "images/moth.png", message: "การเปลี่ยนแปลง ข่าวสาร การติดต่อจากสปิริต" },
  { name: "Rabbit", image: "images/rabbit.png", message: "ความคิดสร้างสรรค์ ความรวดเร็ว อุดมสมบูรณ์" },
  { name: "Grizzly Bear", image: "images/grizzly-bear.png", message: "ทำตามความฝัน ลางสังหรณ์ ยึดมั่นในความเชื่อ" },
  { name: "Cheetah", image: "images/cheetah.png", message: "ตัดสินใจทันที ลงมือทำ รอดพ้นอย่างหวุดหวิด" },
  { name: "Duck", image: "images/duck.png", message: "ภาวะเจริญพันธุ์ มีทักษะหลากหลาย การลงมือทำ" },
  { name: "Dragon", image: "images/dragon.png", message: "ได้รับการปกป้องจากสิ่งศักดิ์สิทธิ์ พลิกชีวิต อำนาจ" }
];

exports.handler = async function(event, context) {
  // ===== เครื่องดักฟังจุดที่ 1: ฟังก์ชันเริ่มทำงานหรือยัง? =====
  console.log("--- Share function triggered! ---");

  try {
    const cardName = decodeURIComponent(event.queryStringParameters.name || "Default");
    // ===== เครื่องดักฟังจุดที่ 2: ได้รับชื่อการ์ดอะไรมา? =====
    console.log(`Received card name: "${cardName}"`);

    const card = cards.find(c => c.name.toLowerCase() === cardName.toLowerCase());
    
    // ===== เครื่องดักฟังจุดที่ 3: หาการ์ดเจอหรือไม่? =====
    if (card) {
      console.log(`Card found: ${card.name}`);
    } else {
      console.log(`Card NOT FOUND: "${cardName}"`);
    }

    const siteUrl = "https://my-familiars-v2.netlify.app";
    const pageTitle = card ? `${card.name} | My Familiars` : "My Familiars";
    const pageDescription = card ? card.message : "สุ่มไพ่พยากรณ์ประจำวันของคุณ";
    const imageUrl = card ? `${siteUrl}/${card.image}` : `${siteUrl}/images/icon-512.png`;

    // ===== เครื่องดักฟังจุดที่ 4: สร้าง URL รูปภาพว่าอะไร? =====
    console.log(`Generated image URL: ${imageUrl}`);
    console.log("--- Generating HTML... ---");

    const html = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <title>${pageTitle}</title>
        <meta property="og:title" content="${pageTitle}">
        <meta property="og:description" content="${pageDescription}">
        <meta property="og:image" content="${imageUrl}">
        <meta property="og:url" content="${siteUrl}/card/${cardName}">
        <script>
          window.location.href = '${siteUrl}';
        </script>
      </head>
      <body>Redirecting...</body>
      </html>
    `;

    console.log("--- HTML generation complete. Sending response. ---");
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: html,
    };
  } catch (error) {
    // ===== เครื่องดักฟังจุดที่ 5: เกิดข้อผิดพลาดอะไร? =====
    console.error("!!! CRITICAL ERROR in share function !!!", error);
    return {
      statusCode: 500,
      body: `An error occurred: ${error.message}`
    };
  }
};