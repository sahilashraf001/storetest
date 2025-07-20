
export const APP_NAME = "PRINCE SOLUTIONS";

export const ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (id: string) : string => `/products/${id}`,
  CART: "/cart",
  CHECKOUT: "/checkout",
  WISHLIST: "/wishlist",
  LOGIN: "/login",
  SIGNUP: "/signup",
  PROFILE: "/profile",
  ORDERS: "/orders",
  ADMIN: "/admin",
  ADMIN_LOGIN: "/admin/login", // New route for admin login
  ADMIN_ORDERS: "/admin/orders",
};
