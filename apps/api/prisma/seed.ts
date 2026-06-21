import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding initial products into database...');

  // Clean existing products to avoid duplicates during multiple seeds
  await prisma.product.deleteMany({});

  const initialProducts = [
    // --- TELÉFONOS ---
    {
      id: 's26-ultra',
      title: 'Samsung Galaxy S26 Ultra',
      description: 'El teléfono insignia más potente con cámara de 200MP y procesador de última generación.',
      price: 1449.00,
      image: '/s26-ultra.png',
      badge: 'Disponible',
      category: 'Teléfonos',
      stock: 15,
    },
    {
      id: 'iphone-15-pro',
      title: 'iPhone 15 Pro Max',
      description: 'Chasis de titanio, chip A17 Pro, y el sistema de cámara zoom 5x más potente de Apple.',
      price: 1199.00,
      image: '/vercel.svg',
      badge: 'Popular',
      category: 'Teléfonos',
      stock: 12,
    },
    {
      id: 'pixel-9-pro',
      title: 'Google Pixel 9 Pro',
      description: 'La mejor experiencia de Android con inteligencia artificial avanzada de Gemini integrada.',
      price: 999.00,
      image: '/vercel.svg',
      badge: 'Nuevo',
      category: 'Teléfonos',
      stock: 10,
    },

    // --- TABLETS ---
    {
      id: 'ipad-pro-m4',
      title: 'iPad Pro M4',
      description: 'Ultrafino con pantalla OLED en tándem y el revolucionario procesador Apple M4.',
      price: 1099.00,
      image: '/ipad-pro-m4.png',
      badge: 'Top',
      category: 'Tablets',
      stock: 7,
    },
    {
      id: 'galaxy-tab-s9',
      title: 'Samsung Galaxy Tab S9',
      description: 'Pantalla AMOLED 120Hz, resistencia al agua IP68 y S-Pen incluido en la caja.',
      price: 799.00,
      image: '/galaxy-tab-s9.png',
      badge: 'Disponible',
      category: 'Tablets',
      stock: 14,
    },
    {
      id: 'xiaomi-pad-6',
      title: 'Xiaomi Pad 6',
      description: 'Excelente relación calidad-precio con pantalla WQHD+ de 144Hz y procesador potente.',
      price: 349.00,
      image: '/xiaomi-pad-6.png',
      badge: 'Oferta',
      category: 'Tablets',
      stock: 20,
    },

    // --- TELEVISORES ---
    {
      id: 'lg-oled-c4',
      title: 'LG OLED C4 65"',
      description: 'La referencia en calidad de imagen con negros perfectos, brillo mejorado y HDMI 2.1.',
      price: 1699.00,
      image: '/lg-oled-c4.png',
      badge: 'Premium',
      category: 'Televisores',
      stock: 5,
    },
    {
      id: 'samsung-qn90d',
      title: 'Samsung QN90D QLED',
      description: 'Mini LED inteligente con brillo deslumbrante y excelente control de reflejos.',
      price: 1399.00,
      image: '/samsung-qn90d.png',
      badge: 'Popular',
      category: 'Televisores',
      stock: 6,
    },

    // --- OTROS ---
    {
      id: 'switch-oled',
      title: 'Nintendo Switch OLED',
      description: 'Pantalla OLED vibrante de 7 pulgadas, base con puerto LAN y almacenamiento expandido.',
      price: 529.00,
      image: '/switch-oled.png',
      badge: 'Oferta',
      category: 'Zona Gamer',
      stock: 25,
    },
    {
      id: 'echo-max',
      title: 'Amazon Echo Dot Max',
      description: 'El altavoz inteligente más popular con sonido de alta definición y asistente virtual Alexa.',
      price: 139.00,
      image: '/echo-max.png',
      badge: 'Nuevo',
      category: 'Gadgets',
      stock: 50,
    },
    {
      id: 'vacuum-e5',
      title: 'Robot Vacuum E5',
      description: 'Limpieza autónoma eficiente con sensor inteligente de navegación y gran potencia de succión.',
      price: 139.00,
      image: '/vacuum-e5.png',
      badge: 'Top',
      category: 'Hogar',
      stock: 8,
    },
  ];

  for (const product of initialProducts) {
    const created = await prisma.product.create({
      data: product,
    });
    console.log(`Created product: ${created.title} (ID: ${created.id})`);
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
