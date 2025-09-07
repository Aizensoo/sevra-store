const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// إعداد Gmail أو أي SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "servisbra13@gmail.com",   // ✨ بدون مسافات
    pass: "pvqxazjxgtbobllf"         // ✨ شيل كل الفراغات (الصق الباسوورد كما هو 16 خانة)
  }
});

app.post("/checkout", (req, res) => {
  const order = req.body;

  const mailOptions = {
    from: "servisbra13@gmail.com",   // ✨ لازم تحط نفس الإيميل هنا
    to: "servisbra13@gmail.com",     // أو أي إيميل تستقبل عليه الطلبات
    subject: "🛒 New Order Received",
    text: `
      Name: ${order.name}
      Email: ${order.email}
      Address: ${order.address}, ${order.city}
      Payment: ${order.payment}
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Error sending email:", error);
      res.status(500).json({ message: "Error sending order" });
    } else {
      console.log("✅ Order email sent:", info.response);
      res.json({ message: "Order placed successfully and sent to email!" });
    }
  });
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
const axios = require("axios");

// راوت لجلب المنتجات مع عمولة
app.get("/products", async (req, res) => {
  try {
    const response = await axios.get("https://api-sg.aliexpress.com/some-endpoint", {
      params: {
        app_key: process.env.ALIEXPRESS_KEY, // حط المفتاح في env
        keyword: req.query.keyword || "shoes",
        page_size: 10
      }
    });

    // تعديل البيانات قبل الإرسال
    const products = response.data.items.map(item => {
      const originalPrice = parseFloat(item.price);
      const finalPrice = (originalPrice * 1.2).toFixed(2); // +20% عمولة

      return {
        id: item.product_id,
        name: item.product_title,
        image: item.product_main_image_url,
        originalPrice,
        finalPrice,
        link: item.product_url
      };
    });

    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});
