const MacLineApi = (() => {
  const API_BASE_URL = "";
  const DEMO_DELAY = 260;

  const demoProducts = [
    {
      id: 1,
      name: "iPhone 15 Pro",
      category: "iPhone",
      line: "Apple A17 Pro, 256 ГБ",
      price: 129990,
      oldPrice: 139990,
      rating: 4.9,
      popular: 98,
      isNew: true,
      inStock: true,
      sale: true,
      art: "phone",
      specs: ["титановый корпус и USB-C", "камера 48 Мп, запись ProRes"],
      tags: ["Новинка", "В наличии"]
    },
    {
      id: 2,
      name: "iPhone 15",
      category: "iPhone",
      line: "128 ГБ, Blue",
      price: 87990,
      oldPrice: 94990,
      rating: 4.8,
      popular: 94,
      isNew: false,
      inStock: true,
      sale: true,
      art: "phone",
      specs: ["Dynamic Island", "камера 48 Мп"],
      tags: ["Скидка", "В наличии"]
    },
    {
      id: 3,
      name: "MacBook Air 13 M3",
      category: "Mac",
      line: "8-ядерный CPU, 16 ГБ, 512 ГБ",
      price: 154990,
      oldPrice: null,
      rating: 4.8,
      popular: 92,
      isNew: true,
      inStock: true,
      sale: false,
      art: "laptop",
      specs: ["до 18 часов работы", "тонкий корпус 1,24 кг"],
      tags: ["M3", "Хит"]
    },
    {
      id: 4,
      name: "MacBook Pro 14 M3 Pro",
      category: "Mac",
      line: "18 ГБ, 512 ГБ, Space Black",
      price: 239990,
      oldPrice: null,
      rating: 4.9,
      popular: 89,
      isNew: true,
      inStock: true,
      sale: false,
      art: "laptop",
      specs: ["Liquid Retina XDR", "для монтажа, кода и 3D"],
      tags: ["Pro", "В наличии"]
    },
    {
      id: 5,
      name: "iPad Pro 11 M4",
      category: "iPad",
      line: "Ultra Retina XDR, 256 ГБ",
      price: 119990,
      oldPrice: null,
      rating: 4.7,
      popular: 86,
      isNew: true,
      inStock: true,
      sale: false,
      art: "tablet",
      specs: ["чип M4 для графики и монтажа", "поддержка Apple Pencil Pro"],
      tags: ["M4", "Pro"]
    },
    {
      id: 6,
      name: "iPad Air 11 M2",
      category: "iPad",
      line: "128 ГБ, Wi-Fi, Purple",
      price: 69990,
      oldPrice: null,
      rating: 4.6,
      popular: 79,
      isNew: true,
      inStock: true,
      sale: false,
      art: "tablet",
      specs: ["легкий корпус", "совместим с Magic Keyboard"],
      tags: ["M2", "Новинка"]
    },
    {
      id: 7,
      name: "Apple Watch Series 9",
      category: "Watch",
      line: "45 мм, GPS, Midnight",
      price: 41990,
      oldPrice: 48990,
      rating: 4.6,
      popular: 81,
      isNew: false,
      inStock: true,
      sale: true,
      art: "watch",
      specs: ["яркий Always-On дисплей", "датчики здоровья и тренировок"],
      tags: ["Скидка", "GPS"]
    },
    {
      id: 8,
      name: "Apple Watch Ultra 2",
      category: "Watch",
      line: "49 мм, Titanium, Ocean Band",
      price: 89990,
      oldPrice: null,
      rating: 4.8,
      popular: 74,
      isNew: false,
      inStock: false,
      sale: false,
      art: "watch",
      specs: ["корпус из титана", "до 36 часов работы"],
      tags: ["Под заказ", "Ultra"]
    },
    {
      id: 9,
      name: "AirPods Pro 2",
      category: "Audio",
      line: "USB-C, MagSafe Case",
      price: 27990,
      oldPrice: 32990,
      rating: 4.8,
      popular: 88,
      isNew: false,
      inStock: true,
      sale: true,
      art: "audio",
      specs: ["активное шумоподавление", "адаптивный режим прозрачности"],
      tags: ["Скидка", "ANC"]
    },
    {
      id: 10,
      name: "AirPods Max",
      category: "Audio",
      line: "Space Gray",
      price: 64990,
      oldPrice: null,
      rating: 4.7,
      popular: 69,
      isNew: false,
      inStock: true,
      sale: false,
      art: "audio",
      specs: ["объемное звучание", "до 20 часов прослушивания"],
      tags: ["Hi-Fi", "В наличии"]
    },
    {
      id: 11,
      name: "Mac Studio M2 Max",
      category: "Mac",
      line: "32 ГБ, 1 ТБ SSD",
      price: 249990,
      oldPrice: null,
      rating: 4.9,
      popular: 75,
      isNew: false,
      inStock: false,
      sale: false,
      art: "desktop",
      specs: ["производительность для 3D и видео", "компактный алюминиевый корпус"],
      tags: ["Под заказ", "Pro"]
    },
    {
      id: 12,
      name: "Magic Keyboard",
      category: "Accessories",
      line: "USB-C, Touch ID, RU",
      price: 19990,
      oldPrice: null,
      rating: 4.5,
      popular: 64,
      isNew: false,
      inStock: true,
      sale: false,
      art: "accessory",
      specs: ["беспроводное подключение", "сканер Touch ID"],
      tags: ["Аксессуар", "В наличии"]
    }
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function delay(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  async function request(path, options = {}) {
    if (!API_BASE_URL) return null;

    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  async function getProducts() {
    const response = await request("/products");
    if (response) return response;

    await delay(DEMO_DELAY);
    return clone(demoProducts);
  }

  async function createOrder(order) {
    const response = await request("/orders", {
      method: "POST",
      body: JSON.stringify(order)
    });

    if (response) return response;

    await delay(DEMO_DELAY);

    const orderNumber = `ML-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const savedOrder = {
      ...clone(order),
      orderNumber,
      status: "new",
      createdAt: new Date().toISOString()
    };

    try {
      const raw = localStorage.getItem("maclineDemoOrders");
      const orders = raw ? JSON.parse(raw) : [];
      orders.unshift(savedOrder);
      localStorage.setItem("maclineDemoOrders", JSON.stringify(orders.slice(0, 30)));
    } catch {
      // Демо-заявка все равно считается принятой, даже если браузер запретил localStorage.
    }

    return {
      orderNumber,
      status: "new"
    };
  }

  return {
    getProducts,
    createOrder
  };
})();

window.MacLineApi = MacLineApi;
