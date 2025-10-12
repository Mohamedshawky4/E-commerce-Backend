import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";
import Category from "./models/Category.js";

dotenv.config();

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear old data
    await Product.deleteMany({});
    await Category.deleteMany({});

    // Create categories
    const categories = await Category.insertMany([
      { name: "Shoes", slug: "shoes" },
      { name: "Clothing", slug: "clothing" },
      { name: "Electronics", slug: "electronics" },
    ]);

    const products = [
      // 🥾 SHOES
      {
        name: "Nike Air Zoom Pegasus 40",
        slug: "nike-air-zoom-pegasus-40",
        description: "Comfortable running shoes with responsive cushioning for everyday runs.",
        brand: "Nike",
        price: 120,
        discountPercent: 10,
        categories: [categories[0]._id],
        stock: 15,
        variants: [
          { size: "M", color: "Black", stock: 5 },
          { size: "L", color: "White", stock: 10 },
        ],
        averageRating: 4.6,
        images: ["https://static.nike.com/a/images/t_default/1b28e7b0-5b68-4d40-8a7d-9cf3e91b39c1/air-zoom-pegasus-40.jpg"],
      },
      {
        name: "Adidas Ultraboost 23",
        slug: "adidas-ultraboost-23",
        description: "High-performance running shoes offering maximum energy return and comfort.",
        brand: "Adidas",
        price: 180,
        discountPercent: 15,
        categories: [categories[0]._id],
        stock: 12,
        variants: [
          { size: "M", color: "Blue", stock: 6 },
          { size: "L", color: "Black", stock: 6 },
        ],
        averageRating: 4.8,
        images: ["https://assets.adidas.com/images/w_600,f_auto,q_auto/2e1a073d4c9c4ebfbd23af5900eea4d8_9366/Ultraboost_23_Shoes_Blue_IE8007_01_standard.jpg"],
      },
      {
        name: "Puma RS-X Efekt Energy",
        slug: "puma-rs-x-efekt-energy",
        description: "Bold and chunky sneakers with retro design and modern comfort.",
        brand: "Puma",
        price: 110,
        discountPercent: 20,
        categories: [categories[0]._id],
        stock: 10,
        variants: [
          { size: "M", color: "Gray", stock: 4 },
          { size: "L", color: "Red", stock: 6 },
        ],
        averageRating: 4.3,
        images: ["https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_600,h_600/global/390777/03/sv01/fnd/PNA/fmt/png"],
      },
      {
        name: "New Balance 574 Core",
        slug: "new-balance-574-core",
        description: "Classic silhouette that combines everyday comfort with timeless style.",
        brand: "New Balance",
        price: 85,
        discountPercent: 5,
        categories: [categories[0]._id],
        stock: 18,
        variants: [
          { size: "M", color: "Gray", stock: 9 },
          { size: "L", color: "Navy", stock: 9 },
        ],
        averageRating: 4.5,
        images: ["https://nb.scene7.com/is/image/NB/ml574evg_nb_02_i?$pdpflexf2$&wid=440&hei=440"],
      },

      // 👕 CLOTHING
      {
        name: "Levi's 501 Original Jeans",
        slug: "levis-501-original-jeans",
        description: "The iconic straight-fit jeans that started it all. Durable and stylish.",
        brand: "Levi's",
        price: 70,
        discountPercent: 0,
        categories: [categories[1]._id],
        stock: 20,
        variants: [
          { size: "32", color: "Blue", stock: 10 },
          { size: "34", color: "Black", stock: 10 },
        ],
        averageRating: 4.4,
        images: ["https://lsco.scene7.com/is/image/lsco/005010114-front-pdp"],
      },
      {
        name: "H&M Cotton T-Shirt",
        slug: "hm-cotton-tshirt",
        description: "Soft cotton t-shirt with a regular fit — a wardrobe essential.",
        brand: "H&M",
        price: 15,
        discountPercent: 10,
        categories: [categories[1]._id],
        stock: 50,
        variants: [
          { size: "M", color: "White", stock: 25 },
          { size: "L", color: "Black", stock: 25 },
        ],
        averageRating: 4.1,
        images: ["https://lp2.hm.com/hmgoepprod?set=source[/74/67/7467e36b8b09eec4eebcfe3d2f9e22f7d7b7cde1.jpg],origin[dam],category[men_tshirtstanks_basicstees],type[LOOKBOOK],res[m],hmver[1]&call=url[file:/product/main]"],
      },
      {
        name: "Zara Oversized Hoodie",
        slug: "zara-oversized-hoodie",
        description: "Oversized hoodie made from soft fleece fabric with front pocket.",
        brand: "Zara",
        price: 45,
        discountPercent: 25,
        categories: [categories[1]._id],
        stock: 30,
        variants: [
          { size: "M", color: "Gray", stock: 15 },
          { size: "L", color: "Beige", stock: 15 },
        ],
        averageRating: 4.7,
        images: ["https://static.zara.net/photos///2023/I/0/2/p/0768/403/707/2/w/850/0768403707_1_1_1.jpg?ts=1686905156603"],
      },
      {
        name: "Uniqlo Ultra Light Down Jacket",
        slug: "uniqlo-ultra-light-down-jacket",
        description: "Compact, lightweight down jacket ideal for layering or travel.",
        brand: "Uniqlo",
        price: 60,
        discountPercent: 15,
        categories: [categories[1]._id],
        stock: 25,
        variants: [
          { size: "M", color: "Navy", stock: 10 },
          { size: "L", color: "Olive", stock: 15 },
        ],
        averageRating: 4.6,
        images: ["https://image.uniqlo.com/UQ/ST3/ca/imagesgoods/453127/item/ca/goods_07_453127.jpg?width=750"],
      },

      // ⚡ ELECTRONICS
      {
        name: "Apple AirPods Pro 2",
        slug: "apple-airpods-pro-2",
        description: "Noise-cancelling wireless earbuds with immersive sound and transparency mode.",
        brand: "Apple",
        price: 249,
        discountPercent: 5,
        categories: [categories[2]._id],
        stock: 8,
        variants: [{ color: "White", stock: 8 }],
        averageRating: 4.9,
        images: ["https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=532&hei=582&fmt=png-alpha&.v=1660803972361"],
      },
      {
        name: "Sony WH-1000XM5 Headphones",
        slug: "sony-wh-1000xm5-headphones",
        description: "Industry-leading noise cancellation and premium sound quality.",
        brand: "Sony",
        price: 399,
        discountPercent: 10,
        categories: [categories[2]._id],
        stock: 10,
        variants: [{ color: "Black", stock: 10 }],
        averageRating: 4.8,
        images: ["https://m.media-amazon.com/images/I/51SKmu2G5QL._AC_SL1500_.jpg"],
      },
      {
        name: "Samsung Galaxy S24 Ultra",
        slug: "samsung-galaxy-s24-ultra",
        description: "Flagship smartphone with exceptional camera and performance.",
        brand: "Samsung",
        price: 1199,
        discountPercent: 8,
        categories: [categories[2]._id],
        stock: 6,
        variants: [{ color: "Titanium Gray", stock: 6 }],
        averageRating: 4.9,
        images: ["https://images.samsung.com/is/image/samsung/p6pim/levant/sm-s928bzahmea/gallery/levant-galaxy-s24-ultra-sm-s928-480861-sm-s928bzahmea-538556269?$650_519_PNG$"],
      },
      {
        name: "Dell XPS 13 Plus Laptop",
        slug: "dell-xps-13-plus",
        description: "Premium ultrabook with edge-to-edge keyboard and OLED display.",
        brand: "Dell",
        price: 1499,
        discountPercent: 12,
        categories: [categories[2]._id],
        stock: 5,
        variants: [{ color: "Platinum", stock: 5 }],
        averageRating: 4.7,
        images: ["https://i.dell.com/sites/csimages/Video_Imagery/all/xps-13-plus-9320-laptop.png"],
      },
    ];

    await Product.insertMany(products);
    console.log("✅ 12 Products seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    process.exit(1);
  }
};

seedProducts();
