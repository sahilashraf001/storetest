
import type { Product } from "./types";

// Conversion rate: 1 USD = 83 INR (approx)
export const mockProducts: Product[] = [
  {
    id: "prod_001",
    name: "Guardian Eye 4K Outdoor Cam",
    description: "Weatherproof 4K UHD security camera with night vision and AI motion detection. Ideal for outdoor surveillance.",
    price: 16599.17, // 199.99 * 83
    image: "https://placehold.co/600x400.png?text=Outdoor+Cam",
    "data-ai-hint": "security camera",
    category: "Outdoor Cameras",
    features: ["4K UHD Resolution", "Weatherproof IP67", "Night Vision (30m)", "AI Motion Detection", "Two-Way Audio"],
    stock: 15,
  },
  {
    id: "prod_002",
    name: "Indoor Sentinel 1080p Pan-Tilt",
    description: "Full HD 1080p indoor camera with 360° pan and tilt functionality. Keep an eye on your home from anywhere.",
    price: 6639.17, // 79.99 * 83
    image: "https://placehold.co/600x400.png?text=Indoor+Cam",
    "data-ai-hint": "cctv indoor",
    category: "Indoor Cameras",
    features: ["1080p Full HD", "Pan-Tilt-Zoom", "Night Vision (10m)", "Motion Tracking", "Privacy Mode"],
    stock: 25,
  },
  {
    id: "prod_003",
    name: "DoorGuardian Video Doorbell Pro",
    description: "Smart video doorbell with 2K resolution, person detection, and instant alerts to your phone.",
    price: 10789.17, // 129.99 * 83
    image: "https://placehold.co/600x400.png?text=Video+Doorbell",
    "data-ai-hint": "doorbell camera",
    category: "Video Doorbells",
    features: ["2K Resolution", "Person Detection", "Two-Way Talk", "Customizable Chimes", "Night Vision"],
    stock: 10,
  },
  {
    id: "prod_004",
    name: "SecureHome NVR System - 8 Channel",
    description: "Network Video Recorder system with 8 channels and 2TB storage. Supports up to 8 cameras for comprehensive coverage.",
    price: 29049.17, // 349.99 * 83
    image: "https://placehold.co/600x400.png?text=NVR+System",
    "data-ai-hint": "security system",
    category: "NVR Systems",
    features: ["8 Channel Support", "2TB HDD Included", "H.265+ Compression", "Remote Access", "Easy Setup"],
    stock: 8,
  },
  {
    id: "prod_005",
    name: "Stealth Mini Spy Cam",
    description: "Discreet mini spy camera for covert surveillance. Small size, long battery life.",
    price: 4149.17, // 49.99 * 83
    image: "https://placehold.co/600x400.png?text=Spy+Cam",
    "data-ai-hint": "hidden camera",
    category: "Specialty Cameras",
    features: ["1080p Recording", "Motion Activated", "Long Battery Life", "MicroSD Support"],
    stock: 30,
  },
  {
    id: "prod_006",
    name: "Solar Defender Wireless Cam",
    description: "100% wire-free outdoor camera powered by solar energy. Continuous surveillance without power concerns.",
    price: 20749.17, // 249.99 * 83
    image: "https://placehold.co/600x400.png?text=Solar+Cam",
    "data-ai-hint": "solar camera",
    category: "Outdoor Cameras",
    features: ["Solar Powered", "Wire-Free", "1080p HD", "PIR Motion Detection", "Weatherproof"],
    stock: 12,
  },
   {
    id: "prod_007",
    name: "Office Pro 360 Fisheye Cam",
    description: "Ceiling-mounted fisheye camera offering a 360-degree panoramic view, perfect for office spaces.",
    price: 13238.50, // 159.50 * 83
    image: "https://placehold.co/600x400.png?text=Fisheye+Cam",
    "data-ai-hint": "office camera",
    category: "Indoor Cameras",
    features: ["5MP Resolution", "360° View", "De-warping", "PoE Support", "Vandal Resistant"],
    stock: 18,
  },
  {
    id: "prod_008",
    name: "GateMaster License Plate Reader",
    description: "Specialized camera for capturing license plates, even in low light and high-speed conditions.",
    price: 41417.00, // 499.00 * 83
    image: "https://placehold.co/600x400.png?text=LPR+Cam",
    "data-ai-hint": "license plate",
    category: "Specialty Cameras",
    features: ["High-Speed Capture", "ANPR Software Compatible", "IR Illumination", "Weatherproof"],
    stock: 5,
  }
];

export function getProducts(): Product[] {
  return mockProducts;
}

export function getProductById(id: string): Product | undefined {
  return mockProducts.find((product) => product.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return mockProducts.filter(product => product.category === category);
}

export const getRelatedProducts = (currentProductId: string, category?: string, count = 3): Product[] => {
  let related = category ? mockProducts.filter(p => p.category === category && p.id !== currentProductId) : mockProducts.filter(p => p.id !== currentProductId);
  // Simple shuffle and take
  return related.sort(() => 0.5 - Math.random()).slice(0, count);
};
