import { db } from "./index";
import {
    users,
    categories,
    suppliers,
    products,
    stockMutations,
    purchaseOrders,
    purchaseOrderItems,
    salesOrders,
    salesOrderItems,
} from "./schema";
import { sql } from "drizzle-orm";

export async function seed() {
    console.log("🌱 Memulai proses seeding data dummy noirERP...");

    // 1. Bersihkan data lama dengan urutan cascade aman
    console.log("🧹 Membersihkan tabel yang ada...");
    await db.execute(sql`TRUNCATE TABLE sales_order_items CASCADE`);
    await db.execute(sql`TRUNCATE TABLE sales_orders CASCADE`);
    await db.execute(sql`TRUNCATE TABLE purchase_order_items CASCADE`);
    await db.execute(sql`TRUNCATE TABLE purchase_orders CASCADE`);
    await db.execute(sql`TRUNCATE TABLE stock_mutations CASCADE`);
    await db.execute(sql`TRUNCATE TABLE products CASCADE`);
    await db.execute(sql`TRUNCATE TABLE suppliers CASCADE`);
    await db.execute(sql`TRUNCATE TABLE categories CASCADE`);
    await db.execute(sql`TRUNCATE TABLE users CASCADE`);

    // 2. Seeding Users
    console.log("👤 Seeding Pengguna (Users)...");
    const dummyPasswordHash = "$2b$10$v0sKj3E45m7M8VjF4N6p4.Y7j7j2k9e9f8g7h6j5k4l3m2n1o0p9q";

    const [adminUser, staffUser, salesUser, managerUser] = await db
        .insert(users)
        .values([
            {
                name: "Admin noirERP",
                email: "admin@noirerp.dev",
                passwordHash: dummyPasswordHash,
                role: "admin",
            },
            {
                name: "Staff Gudang & Logistik",
                email: "inventory@noirerp.dev",
                passwordHash: dummyPasswordHash,
                role: "staff",
            },
            {
                name: "Sales Representative",
                email: "sales@noirerp.dev",
                passwordHash: dummyPasswordHash,
                role: "staff",
            },
            {
                name: "Operational Manager",
                email: "manager@noirerp.dev",
                passwordHash: dummyPasswordHash,
                role: "admin",
            },
        ])
        .returning();

    // 3. Seeding Kategori
    console.log("🏷️  Seeding Kategori (Categories)...");
    const insertedCategories = await db
        .insert(categories)
        .values([
            {
                name: "Pakaian & Mode",
                description: "Koleksi pakaian kasual, outerwear, dan streetwear monokrom premium noirERP",
            },
            {
                name: "Sepatu & Alas Kaki",
                description: "Sneakers minimalis, loafers kulit, dan boots tahan cuaca",
            },
            {
                name: "Aksesoris & Tas",
                description: "Tas selempang kedap air, dompet kulit saffiano, dan kacamata polarized",
            },
            {
                name: "Elektronik & Audio",
                description: "Headphone wireless ANC, mechanical keyboard, dan charging pad ergonomis",
            },
            {
                name: "Gaya Hidup & Rumah",
                description: "Tumbler isolasi termal, diffuser aromaterapi, dan aksesoris meja minimalis",
            },
        ])
        .returning();

    const catMap = {
        fashion: insertedCategories[0].id,
        footwear: insertedCategories[1].id,
        accessories: insertedCategories[2].id,
        electronics: insertedCategories[3].id,
        lifestyle: insertedCategories[4].id,
    };

    // 4. Seeding Suppliers
    console.log("🏢 Seeding Supplier...");
    const insertedSuppliers = await db
        .insert(suppliers)
        .values([
            {
                name: "PT Sinar Tekstil Prima",
                contactPerson: "Budi Gunawan",
                phone: "0812-3456-7890",
                email: "supply@sinartekstil.co.id",
                address: "Kawasan Industri Cimahi Selatan Kav. 45, Bandung",
            },
            {
                name: "CV Artisan Kulit Garut",
                contactPerson: "Dedi Mulyadi",
                phone: "0813-8877-6655",
                email: "order@artisankulit.id",
                address: "Sentra Kerajinan Kulit Sukaregang No. 88, Garut",
            },
            {
                name: "PT Logistik Periferal Nusantara",
                contactPerson: "Hendra Wijaya",
                phone: "0821-4567-8901",
                email: "b2b@periferalnusantara.co.id",
                address: "Kawasan Industri Pulo Gadung Blok C-4, Jakarta Timur",
            },
            {
                name: "CV Footwear Indo Lestari",
                contactPerson: "Maya Sastro",
                phone: "0857-1122-3344",
                email: "sales@footwearindolestari.com",
                address: "Jl. Terusan Kopo No. 112, Bandung",
            },
            {
                name: "PT Gaya Hidup Modern",
                contactPerson: "Reza Pahlevi",
                phone: "0818-9900-1122",
                email: "partner@gayahidupmodern.id",
                address: "Gedung Graha Niaga Lt. 8, Sudirman, Jakarta Selatan",
            },
        ])
        .returning();

    // 5. Seeding Produk (Kombinasi Normal, Stok Rendah, dan Stok Habis)
    console.log("📦 Seeding Produk...");
    const productsData = [
        // Fashion
        {
            categoryId: catMap.fashion,
            sku: "NOIR-TSH-001",
            name: "Oversized Heavyweight T-Shirt Obsidian",
            description: "Kaos katun 24s comb premium dengan potongan dropped shoulder bernuansa noir.",
            purchasePrice: "85000",
            sellingPrice: "169000",
            stock: 45,
            minStock: 10,
        },
        {
            categoryId: catMap.fashion,
            sku: "NOIR-JKT-002",
            name: "Technical Bomber Jacket Waterproof",
            description: "Jaket bomber anti air dengan insulasi termal ringan dan resleting kedap cuaca.",
            purchasePrice: "240000",
            sellingPrice: "489000",
            stock: 14,
            minStock: 5,
        },
        {
            categoryId: catMap.fashion,
            sku: "NOIR-HD-003",
            name: "French Terry Pullover Hoodie Charcoal",
            description: "Hoodie hangat bertekstur lembut dengan saku kangguru tersembunyi.",
            purchasePrice: "165000",
            sellingPrice: "349000",
            stock: 3, // LOW STOCK
            minStock: 8,
        },
        {
            categoryId: catMap.fashion,
            sku: "NOIR-PNT-004",
            name: "Pleated Wide Leg Trouser Dark Grey",
            description: "Celana bahan lipit gaya kontemporer dengan siluet rileks.",
            purchasePrice: "140000",
            sellingPrice: "299000",
            stock: 0, // OUT OF STOCK
            minStock: 5,
        },
        // Footwear
        {
            categoryId: catMap.footwear,
            sku: "NOIR-SNK-001",
            name: "Minimalist Leather Low-Top Sneaker White",
            description: "Sneaker siluet minimalis berbahan kulit calfskin asli dengan sol karet vulcanized.",
            purchasePrice: "320000",
            sellingPrice: "699000",
            stock: 26,
            minStock: 6,
        },
        {
            categoryId: catMap.footwear,
            sku: "NOIR-LFR-002",
            name: "Classic Penny Loafer Polished Black",
            description: "Sepatu loafer formal bertekstur kilau elegan dengan insole bantalan empuk.",
            purchasePrice: "420000",
            sellingPrice: "890000",
            stock: 2, // LOW STOCK
            minStock: 5,
        },
        {
            categoryId: catMap.footwear,
            sku: "NOIR-BTS-003",
            name: "Chelsea Boots Suede Deep Espresso",
            description: "Boots tanpa tali dengan panel elastis samping dan sol cengkram tinggi.",
            purchasePrice: "460000",
            sellingPrice: "975000",
            stock: 11,
            minStock: 4,
        },
        // Accessories
        {
            categoryId: catMap.accessories,
            sku: "NOIR-BAG-001",
            name: "Tactical Crossbody Bag Matte Black",
            description: "Tas selempang multifungsi dengan buckle magnetik Fidlock dan kompartemen tersembunyi.",
            purchasePrice: "110000",
            sellingPrice: "249000",
            stock: 32,
            minStock: 8,
        },
        {
            categoryId: catMap.accessories,
            sku: "NOIR-WLT-002",
            name: "Slim Bifold Card Wallet RFID Obsidian",
            description: "Dompet ramping berteknologi proteksi RFID dengan slot kartu berkapasitas 8 kartu.",
            purchasePrice: "75000",
            sellingPrice: "179000",
            stock: 3, // LOW STOCK
            minStock: 6,
        },
        {
            categoryId: catMap.accessories,
            sku: "NOIR-BLT-003",
            name: "Automatic Buckle Full-Grain Leather Belt",
            description: "Ikat pinggang sistem geser otomatis tanpa lubang berbahan kulit sapi asli.",
            purchasePrice: "65000",
            sellingPrice: "149000",
            stock: 0, // OUT OF STOCK
            minStock: 5,
        },
        {
            categoryId: catMap.accessories,
            sku: "NOIR-GLS-004",
            name: "Square Frame Sunglasses Polarized Black",
            description: "Kacamata hitam berdesain geometris dengan lensa UV400 polarized anti silau.",
            purchasePrice: "95000",
            sellingPrice: "219000",
            stock: 20,
            minStock: 5,
        },
        // Electronics
        {
            categoryId: catMap.electronics,
            sku: "NOIR-ANC-001",
            name: "Wireless ANC Over-Ear Headphones Midnight",
            description: "Headphone Bluetooth peredam bising aktif hingga 40dB dengan daya baterai 35 jam.",
            purchasePrice: "480000",
            sellingPrice: "989000",
            stock: 15,
            minStock: 4,
        },
        {
            categoryId: catMap.electronics,
            sku: "NOIR-KBD-002",
            name: "Compact 75% Wireless Mechanical Keyboard",
            description: "Keyboard mekanikal hot-swappable dengan switch linear tactile dan keycaps PBT.",
            purchasePrice: "520000",
            sellingPrice: "1099000",
            stock: 8,
            minStock: 3,
        },
        {
            categoryId: catMap.electronics,
            sku: "NOIR-CHG-003",
            name: "MagSafe 3-in-1 Foldable Fast Wireless Charger",
            description: "Stasiun pengisi daya nirkabel magnetik 15W untuk ponsel, smartwatch, dan earbuds.",
            purchasePrice: "185000",
            sellingPrice: "399000",
            stock: 19,
            minStock: 5,
        },
        // Lifestyle
        {
            categoryId: catMap.lifestyle,
            sku: "NOIR-TMB-001",
            name: "Insulated Double-Wall Stainless Tumbler 650ml",
            description: "Botol minum vakum penahan suhu panas 12 jam dan dingin 24 jam bebas BPA.",
            purchasePrice: "60000",
            sellingPrice: "139000",
            stock: 50,
            minStock: 10,
        },
        {
            categoryId: catMap.lifestyle,
            sku: "NOIR-DIF-002",
            name: "Ultrasonic Ceramic Aroma Diffuser Stone",
            description: "Diffuser kabut halus berbalut keramik matte dengan lampu ambient hangat.",
            purchasePrice: "135000",
            sellingPrice: "289000",
            stock: 16,
            minStock: 5,
        },
    ];

    const insertedProducts = await db.insert(products).values(productsData).returning();

    // 6. Seeding Stock Mutations (INITIAL dan Operasional)
    console.log("📊 Seeding Mutasi Stok (Stock Mutations)...");
    const mutationsData = [];

    for (const prod of insertedProducts) {
        // Mutasi awal untuk produk yang ada stok
        if (prod.stock > 0) {
            mutationsData.push({
                productId: prod.id,
                type: "INITIAL" as const,
                quantity: prod.stock,
                previousStock: 0,
                currentStock: prod.stock,
                reference: "INIT-SEED",
                notes: `Stok awal produk ${prod.name}`,
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            });
        }
    }

    // Tambah beberapa mutasi operasional (IN, OUT, ADJUSTMENT)
    const pTshirt = insertedProducts.find((p) => p.sku === "NOIR-TSH-001")!;
    const pHoodie = insertedProducts.find((p) => p.sku === "NOIR-HD-003")!;
    const pLoafer = insertedProducts.find((p) => p.sku === "NOIR-LFR-002")!;
    const pTrouser = insertedProducts.find((p) => p.sku === "NOIR-PNT-004")!;

    mutationsData.push(
        {
            productId: pTshirt.id,
            type: "IN" as const,
            quantity: 20,
            previousStock: 25,
            currentStock: 45,
            reference: "PO-20261005-0001",
            notes: "Restock kiriman dari PT Sinar Tekstil Prima",
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
        {
            productId: pHoodie.id,
            type: "OUT" as const,
            quantity: 5,
            previousStock: 8,
            currentStock: 3,
            reference: "SO-20261014-0003",
            notes: "Pemenuhan pesanan penjualan retail",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
            productId: pLoafer.id,
            type: "OUT" as const,
            quantity: 3,
            previousStock: 5,
            currentStock: 2,
            reference: "SO-20261015-0002",
            notes: "Penjualan offline store noir Flagship",
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
            productId: pTrouser.id,
            type: "ADJUSTMENT" as const,
            quantity: -4,
            previousStock: 4,
            currentStock: 0,
            reference: "ADJ-202610-01",
            notes: "Koreksi audit fisik stock opname: barang habis terjual di event offline",
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        }
    );

    await db.insert(stockMutations).values(mutationsData);

    // 7. Seeding Purchase Orders & Items
    console.log("🛒 Seeding Pembelian (Purchase Orders)...");
    const now = new Date();

    const po1Date = new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000);
    const po2Date = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const po3Date = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
    const po4Date = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const po5Date = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

    const [po1] = await db
        .insert(purchaseOrders)
        .values({
            orderNumber: "PO-20261005-0001",
            supplierId: insertedSuppliers[0].id,
            status: "RECEIVED",
            notes: "Pengadaan batch garmen bahan combed & fleece",
            totalAmount: "4500000.00",
            receivedAt: po1Date,
            createdAt: po1Date,
        })
        .returning();

    await db.insert(purchaseOrderItems).values([
        {
            purchaseOrderId: po1.id,
            productId: insertedProducts[0].id, // T-Shirt
            quantity: 30,
            unitPrice: "85000.00",
            subtotal: "2550000.00",
            createdAt: po1Date,
        },
        {
            purchaseOrderId: po1.id,
            productId: insertedProducts[1].id, // Bomber
            quantity: 8,
            unitPrice: "240000.00",
            subtotal: "1920000.00",
            createdAt: po1Date,
        },
    ]);

    const [po2] = await db
        .insert(purchaseOrders)
        .values({
            orderNumber: "PO-20261009-0002",
            supplierId: insertedSuppliers[3].id,
            status: "RECEIVED",
            notes: "Restock sneakers dan footwear kuartal 4",
            totalAmount: "7360000.00",
            receivedAt: po2Date,
            createdAt: po2Date,
        })
        .returning();

    await db.insert(purchaseOrderItems).values([
        {
            purchaseOrderId: po2.id,
            productId: insertedProducts[4].id, // Sneaker
            quantity: 15,
            unitPrice: "320000.00",
            subtotal: "4800000.00",
            createdAt: po2Date,
        },
        {
            purchaseOrderId: po2.id,
            productId: insertedProducts[5].id, // Loafer
            quantity: 6,
            unitPrice: "420000.00",
            subtotal: "2520000.00",
            createdAt: po2Date,
        },
    ]);

    const [po3] = await db
        .insert(purchaseOrders)
        .values({
            orderNumber: "PO-20261012-0003",
            supplierId: insertedSuppliers[2].id,
            status: "RECEIVED",
            notes: "Restock headphone peredam bising & keyboard",
            totalAmount: "6440000.00",
            receivedAt: po3Date,
            createdAt: po3Date,
        })
        .returning();

    await db.insert(purchaseOrderItems).values([
        {
            purchaseOrderId: po3.id,
            productId: insertedProducts[11].id, // Headphones
            quantity: 8,
            unitPrice: "480000.00",
            subtotal: "3840000.00",
            createdAt: po3Date,
        },
        {
            purchaseOrderId: po3.id,
            productId: insertedProducts[12].id, // Keyboard
            quantity: 5,
            unitPrice: "520000.00",
            subtotal: "2600000.00",
            createdAt: po3Date,
        },
    ]);

    const [po4] = await db
        .insert(purchaseOrders)
        .values({
            orderNumber: "PO-20261014-0004",
            supplierId: insertedSuppliers[1].id,
            status: "DRAFT",
            notes: "Pesanan bahan kulit dompet dan tas dalam konfirmasi pabrik",
            totalAmount: "3100000.00",
            createdAt: po4Date,
        })
        .returning();

    await db.insert(purchaseOrderItems).values([
        {
            purchaseOrderId: po4.id,
            productId: insertedProducts[7].id, // Bag
            quantity: 15,
            unitPrice: "110000.00",
            subtotal: "1650000.00",
            createdAt: po4Date,
        },
        {
            purchaseOrderId: po4.id,
            productId: insertedProducts[8].id, // Wallet
            quantity: 20,
            unitPrice: "75000.00",
            subtotal: "1500000.00",
            createdAt: po4Date,
        },
    ]);

    const [po5] = await db
        .insert(purchaseOrders)
        .values({
            orderNumber: "PO-20261015-0005",
            supplierId: insertedSuppliers[4].id,
            status: "DRAFT",
            notes: "Pesanan tumbler stainless termal untuk merchandise akhir tahun",
            totalAmount: "1800000.00",
            createdAt: po5Date,
        })
        .returning();

    await db.insert(purchaseOrderItems).values([
        {
            purchaseOrderId: po5.id,
            productId: insertedProducts[14].id, // Tumbler
            quantity: 30,
            unitPrice: "60000.00",
            subtotal: "1800000.00",
            createdAt: po5Date,
        },
    ]);

    // 8. Seeding Sales Orders & Items (Mencakup 7 hari terakhir agar Chart & Analytics terisi sempurna)
    console.log("💰 Seeding Penjualan (Sales Orders)...");

    const salesConfigs = [
        {
            daysAgo: 6,
            customer: "PT Artha Ventura Digital",
            status: "COMPLETED" as const,
            items: [
                { prod: insertedProducts[11], qty: 2, price: 989000 },
                { prod: insertedProducts[12], qty: 1, price: 1099000 },
            ],
            notes: "Pembelian perlengkapan developer kit",
        },
        {
            daysAgo: 5,
            customer: "Denny Pratama",
            status: "COMPLETED" as const,
            items: [
                { prod: insertedProducts[0], qty: 3, price: 169000 },
                { prod: insertedProducts[1], qty: 1, price: 489000 },
            ],
            notes: "Order via web store noir",
        },
        {
            daysAgo: 4,
            customer: "Siti Rahmawati",
            status: "COMPLETED" as const,
            items: [
                { prod: insertedProducts[4], qty: 1, price: 699000 },
                { prod: insertedProducts[7], qty: 1, price: 249000 },
            ],
            notes: "Pengiriman kilat sameday",
        },
        {
            daysAgo: 4,
            customer: "Kurniawan Putra",
            status: "COMPLETED" as const,
            items: [
                { prod: insertedProducts[14], qty: 4, price: 139000 },
                { prod: insertedProducts[8], qty: 2, price: 179000 },
            ],
            notes: "Corporate gift souvenir",
        },
        {
            daysAgo: 3,
            customer: "Amanda Putri",
            status: "COMPLETED" as const,
            items: [
                { prod: insertedProducts[6], qty: 1, price: 975000 },
                { prod: insertedProducts[10], qty: 1, price: 219000 },
            ],
            notes: "Pembelian offline noir Flagship Store",
        },
        {
            daysAgo: 2,
            customer: "Budi Santoso",
            status: "COMPLETED" as const,
            items: [
                { prod: insertedProducts[0], qty: 2, price: 169000 },
                { prod: insertedProducts[13], qty: 1, price: 399000 },
            ],
            notes: "Customer reguler tier Gold",
        },
        {
            daysAgo: 2,
            customer: "CV Sinergi Media Kreasi",
            status: "COMPLETED" as const,
            items: [
                { prod: insertedProducts[11], qty: 3, price: 989000 },
                { prod: insertedProducts[12], qty: 2, price: 1099000 },
            ],
            notes: "Pengadaan headset podcast tim produksi",
        },
        {
            daysAgo: 1,
            customer: "Citra Kirana",
            status: "COMPLETED" as const,
            items: [
                { prod: insertedProducts[5], qty: 1, price: 890000 },
                { prod: insertedProducts[7], qty: 2, price: 249000 },
            ],
            notes: "Kado ulang tahun spesial",
        },
        {
            daysAgo: 0,
            customer: "Fajar Nugraha",
            status: "COMPLETED" as const,
            items: [
                { prod: insertedProducts[0], qty: 4, price: 169000 },
                { prod: insertedProducts[14], qty: 2, price: 139000 },
                { prod: insertedProducts[10], qty: 1, price: 219000 },
            ],
            notes: "Transaksi penjualan kasir hari ini",
        },
        // Draft / Active Orders
        {
            daysAgo: 0,
            customer: "Rizky Ramadhan",
            status: "DRAFT" as const,
            items: [
                { prod: insertedProducts[1], qty: 1, price: 489000 },
                { prod: insertedProducts[6], qty: 1, price: 975000 },
            ],
            notes: "Menunggu konfirmasi pembayaran via Virtual Account",
        },
        {
            daysAgo: 1,
            customer: "Maya Angelica",
            status: "DRAFT" as const,
            items: [
                { prod: insertedProducts[15], qty: 2, price: 289000 },
            ],
            notes: "Draft invoice B2B",
        },
        {
            daysAgo: 5,
            customer: "Anton Kusuma",
            status: "CANCELLED" as const,
            items: [
                { prod: insertedProducts[4], qty: 1, price: 699000 },
            ],
            notes: "Dibatalkan: Pembeli salah memilih ukuran sepatu",
        },
    ];

    let soCounter = 1;
    for (const sc of salesConfigs) {
        const orderDate = new Date(now.getTime() - sc.daysAgo * 24 * 60 * 60 * 1000);
        const yyyymmdd = orderDate.toISOString().slice(0, 10).replace(/-/g, "");
        const orderNumber = `SO-${yyyymmdd}-${String(soCounter).padStart(4, "0")}`;
        soCounter++;

        let total = 0;
        const lineItems = sc.items.map((i) => {
            const sub = i.qty * i.price;
            total += sub;
            return {
                productId: i.prod.id,
                quantity: i.qty,
                unitPrice: i.price.toFixed(2),
                subtotal: sub.toFixed(2),
                createdAt: orderDate,
            };
        });

        const [so] = await db
            .insert(salesOrders)
            .values({
                orderNumber,
                customerName: sc.customer,
                status: sc.status,
                notes: sc.notes,
                totalAmount: total.toFixed(2),
                completedAt: sc.status === "COMPLETED" ? orderDate : null,
                createdAt: orderDate,
                updatedAt: orderDate,
            })
            .returning();

        for (const item of lineItems) {
            await db.insert(salesOrderItems).values({
                ...item,
                salesOrderId: so.id,
            });
        }
    }

    console.log("✅ Seeding selesai! Seluruh dummy data noirERP siap untuk preview & deployment.");
}

// Eksekusi jika dijalankan langsung via CLI
if (import.meta.main) {
    seed()
        .then(() => {
            console.log("🎉 Database seeding berhasil diselesaikan!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Terjadi kesalahan saat seeding:", error);
            process.exit(1);
        });
}
