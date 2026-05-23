const MacLineApi = (() => {
  const defaultConfig = {
    apiBaseUrl: "",
    orderTransport: "demo",
    telegram: {
      botToken: "",
      chatId: ""
    },
    email: {
      endpoint: "",
      to: "demo@macline.store"
    }
  };

  const userConfig = window.MacLineConfig || {};
  const config = {
    ...defaultConfig,
    ...userConfig,
    telegram: {
      ...defaultConfig.telegram,
      ...(userConfig.telegram || {})
    },
    email: {
      ...defaultConfig.email,
      ...(userConfig.email || {})
    }
  };

  const API_BASE_URL = config.apiBaseUrl;
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
    image: {
      src: "https://www.apple.com/newsroom/images/2023/09/apple-unveils-iphone-15-pro-and-iphone-15-pro-max/article/Apple-iPhone-15-Pro-lineup-color-lineup-230912_big.jpg.large.jpg",
      alt: "iPhone 15 Pro в нескольких цветах"
    },
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
    image: {
      src: "https://www.apple.com/newsroom/images/2023/09/apple-debuts-iphone-15-and-iphone-15-plus/article/Apple-iPhone-15-lineup-color-lineup-230912_big.jpg.large.jpg",
      alt: "iPhone 15 в цветовой линейке"
    },
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
    image: {
      src: "https://www.apple.com/newsroom/images/2024/03/apple-unveils-the-new-13-and-15-inch-macbook-air-with-the-powerful-m3-chip/article/Apple-MacBook-Air-2-up-hero-240304_big.jpg.large.jpg",
      alt: "MacBook Air с чипом M3"
    },
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
    image: {
      src: "https://www.apple.com/newsroom/images/2023/10/apple-unveils-new-macbook-pro-featuring-m3-chips/article/Apple-MacBook-Pro-2up-231030_Full-Bleed-Image.jpg.large.jpg",
      alt: "MacBook Pro в цвете Space Black"
    },
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
    image: {
      src: "https://www.apple.com/newsroom/images/2024/05/apple-unveils-stunning-new-ipad-pro-with-m4-chip-and-apple-pencil-pro/article/Apple-iPad-Pro-hero-240507_big.jpg.large.jpg",
      alt: "iPad Pro с чипом M4"
    },
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
    image: {
      src: "https://www.apple.com/newsroom/images/2024/05/apple-unveils-the-redesigned-11-inch-and-all-new-13-inch-ipad-air-with-m2/article/Apple-iPad-Air-hero-240507_big.jpg.large.jpg",
      alt: "iPad Air с чипом M2"
    },
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
    image: {
      src: "https://www.apple.com/newsroom/images/2023/09/apple-introduces-the-advanced-new-apple-watch-series-9/article/Apple-Watch-S9-midnight-aluminum-Sport-Loop-midnight-230912_inline.jpg.large.jpg",
      alt: "Apple Watch Series 9 в цвете Midnight"
    },
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
    image: {
      src: "https://www.apple.com/newsroom/images/2023/09/apple-unveils-apple-watch-ultra-2/article/Apple-Watch-Ultra-2-hero-230912_Full-Bleed-Image.jpg.large.jpg",
      alt: "Apple Watch Ultra 2"
    },
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
    image: {
      src: "https://www.apple.com/newsroom/images/2023/09/apple-debuts-iphone-15-and-iphone-15-plus/article/Apple-iPhone-15-lineup-AirPods-Pro-2nd-generation-USB-C-connection-230912_big.jpg.large.jpg",
      alt: "AirPods Pro с зарядным футляром"
    },
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
    image: {
      src: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/airpods-max-select-202409-midnight?fmt=png-alpha&hei=500&wid=500",
      alt: "AirPods Max в цвете Midnight"
    },
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
    image: {
      src: "https://www.apple.com/newsroom/images/2025/03/apple-unveils-new-mac-studio-the-most-powerful-mac-ever/article/Apple-Mac-Studio-front-250305_big.jpg.large.jpg",
      alt: "Mac Studio"
    },
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
    image: {
      src: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MXK73?fmt=png-alpha&hei=500&wid=700",
      alt: "Magic Keyboard с Touch ID"
    },
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

    saveDemoOrder(savedOrder);

    const delivery = await deliverOrder(savedOrder);

    return {
      orderNumber,
      status: "new",
      delivery
    };
  }

  function saveDemoOrder(order) {
    try {
      const raw = localStorage.getItem("maclineDemoOrders");
      const orders = raw ? JSON.parse(raw) : [];
      orders.unshift(order);
      localStorage.setItem("maclineDemoOrders", JSON.stringify(orders.slice(0, 30)));
    } catch {
      // Демо-заявка все равно считается принятой, даже если браузер запретил localStorage.
    }
  }

  async function deliverOrder(order) {
    if (config.orderTransport === "telegram") {
      await sendTelegramOrder(order);
      return "telegram";
    }

    if (config.orderTransport === "email") {
      await sendEmailOrder(order);
      return config.email.endpoint ? "email" : "email-draft";
    }

    return "demo";
  }

  async function sendTelegramOrder(order) {
    const { botToken, chatId } = config.telegram;

    if (!botToken || !chatId) {
      throw new Error("Telegram settings are empty");
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatTelegramOrder(order),
        parse_mode: "HTML"
      })
    });

    if (!response.ok) {
      throw new Error(`Telegram error: ${response.status}`);
    }
  }

  async function sendEmailOrder(order) {
    if (config.email.endpoint) {
      const response = await fetch(config.email.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          subject: `Заявка ${order.orderNumber} с сайта MacLine`,
          message: formatPlainOrder(order),
          order
        })
      });

      if (!response.ok) {
        throw new Error(`Email endpoint error: ${response.status}`);
      }

      return;
    }

    if (!config.email.to) {
      throw new Error("Email settings are empty");
    }

    const subject = encodeURIComponent(`Заявка ${order.orderNumber} с сайта MacLine`);
    const body = encodeURIComponent(formatPlainOrder(order));
    window.location.href = `mailto:${config.email.to}?subject=${subject}&body=${body}`;
  }

  function formatTelegramOrder(order) {
    return [
      `<b>Новая заявка ${escapeTelegramHtml(order.orderNumber)}</b>`,
      "",
      `<b>Клиент:</b> ${escapeTelegramHtml(order.customer.name)}`,
      `<b>Телефон:</b> ${escapeTelegramHtml(order.customer.phone)}`,
      `<b>Email:</b> ${escapeTelegramHtml(order.customer.email || "не указан")}`,
      `<b>Связь:</b> ${escapeTelegramHtml(mapContact(order.customer.preferredContact))}`,
      `<b>Получение:</b> ${escapeTelegramHtml(mapDelivery(order.delivery.method))}`,
      `<b>Адрес/комментарий:</b> ${escapeTelegramHtml(order.delivery.address)}`,
      "",
      "<b>Состав заказа:</b>",
      ...order.items.map((item) => `- ${escapeTelegramHtml(item.name)} x ${item.quantity} = ${escapeTelegramHtml(formatPrice(item.price * item.quantity))}`),
      "",
      `<b>Итого:</b> ${escapeTelegramHtml(formatPrice(order.total))}`
    ].join("\n");
  }

  function formatPlainOrder(order) {
    return [
      `Новая заявка ${order.orderNumber}`,
      "",
      `Клиент: ${order.customer.name}`,
      `Телефон: ${order.customer.phone}`,
      `Email: ${order.customer.email || "не указан"}`,
      `Связь: ${mapContact(order.customer.preferredContact)}`,
      `Получение: ${mapDelivery(order.delivery.method)}`,
      `Адрес/комментарий: ${order.delivery.address}`,
      "",
      "Состав заказа:",
      ...order.items.map((item) => `- ${item.name} x ${item.quantity} = ${formatPrice(item.price * item.quantity)}`),
      "",
      `Итого: ${formatPrice(order.total)}`
    ].join("\n");
  }

  function formatPrice(value) {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0
    }).format(value);
  }

  function mapContact(value) {
    return {
      phone: "позвонить",
      telegram: "написать в Telegram",
      whatsapp: "написать в WhatsApp",
      email: "написать на email"
    }[value] || value;
  }

  function mapDelivery(value) {
    return {
      courier: "курьерская доставка",
      pickup: "самовывоз из магазина"
    }[value] || value;
  }

  function escapeTelegramHtml(value) {
    return String(value).replace(/[&<>]/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;"
    })[char]);
  }

  return {
    getProducts,
    createOrder
  };
})();

window.MacLineApi = MacLineApi;
