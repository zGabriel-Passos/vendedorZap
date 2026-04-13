export const PRODUCTS: Record<string, any> = {
  iphone: {
    id: 'iphone',
    name: 'iPhone 15 Pro',
    price: 6000,
    category: 'smartphones',
    description: 'Smartphone Apple iPhone 15 Pro com 128GB',
    imageUrl: '/products/iphone.jpg',
    variations: {
      '128GB': { price: 6000, stock: 10 },
      '256GB': { price: 7000, stock: 5 },
      '512GB': { price: 8000, stock: 3 }
    }
  },
  macbook: {
    id: 'macbook',
    name: 'MacBook Pro 14"',
    price: 12000,
    category: 'laptops',
    description: 'Notebook Apple MacBook Pro 14" M3 Pro',
    imageUrl: '/products/macbook.jpg',
    variations: {
      '512GB': { price: 12000, stock: 8 },
      '1TB': { price: 14000, stock: 5 },
      '2TB': { price: 16000, stock: 3 }
    }
  },
  airpods: {
    id: 'airpods',
    name: 'AirPods Pro 2ª Geração',
    price: 800,
    category: 'accessories',
    description: 'Fone de ouvido sem fio Apple AirPods Pro 2ª Geração',
    imageUrl: '/products/airpods.jpg',
    variations: {
      'USB-C': { price: 800, stock: 15 },
      'Lightning': { price: 750, stock: 10 }
    }
  },
  charger: {
    id: 'charger',
    name: 'Carregador USB-C 20W',
    price: 150,
    category: 'accessories',
    description: 'Carregador rápido USB-C 20W para iPhone',
    imageUrl: '/products/charger.jpg',
    variations: {
      'branco': { price: 150, stock: 20 },
      'preto': { price: 150, stock: 15 }
    }
  },
  case: {
    id: 'case',
    name: 'Capa Protetora para iPhone',
    price: 100,
    category: 'accessories',
    description: 'Capa de silicone para iPhone 15 Pro',
    imageUrl: '/products/case.jpg',
    variations: {
      'transparente': { price: 100, stock: 25 },
      'preto': { price: 100, stock: 20 },
      'azul': { price: 100, stock: 15 }
    }
  }
};

export function getProductById(id: string) {
  return PRODUCTS[id as keyof typeof PRODUCTS] || null;
}

export function getAllProducts() {
  return Object.values(PRODUCTS);
}

export function searchProducts(query: string) {
  const lowerQuery = query.toLowerCase();
  return Object.values(PRODUCTS).filter(product =>
    product.name.toLowerCase().includes(lowerQuery) ||
    product.category.toLowerCase().includes(lowerQuery) ||
    product.description?.toLowerCase().includes(lowerQuery)
  );
}