// lib/menuStore.ts
export interface MenuData {
  restaurantName: string
  translations: Record<string,string>
}
export const menuStore = new Map<string,MenuData>()
