import { Product, ProductAddon } from "@/types";

export interface AddonPriceDetail {
    addon: ProductAddon;
    isFree: boolean;
    originalPrice: number;
    finalPrice: number;
}

export interface PriceCalculationResult {
    totalItemPrice: number;
    basePrice: number;
    addonsTotal: number;
    addonsDetails: AddonPriceDetail[];
}

/**
 * Calculates the total price for an item (product + addons),
 * respecting the product's free accompaniments limit.
 * Returns a detailed breakdown of which addons are free.
 */
export function calculateItemPriceDetails(
    product: Product,
    quantity: number,
    selectedAddons: ProductAddon[] = []
): PriceCalculationResult {
    const basePrice = product.price;
    const limit = product.free_accompaniments_limit || 0;
    const addonsDetails: AddonPriceDetail[] = [];

    // Flatten logic to handle quantities
    // We need to track which specific "instance" of an addon is free
    // Example: Addon A (qty 2). Instance 1 might be free, Instance 2 paid.
    // To keep it simple for the UI/Database, we will calculate the 'effective' price
    // per addon line item. 
    // actually, for the database we calculate per line item.

    // Strategy:
    // 1. Expand all into a list of { addonId, price, originalIndex }
    // 2. Sort by price desc
    // 3. Mark first N as free
    // 4. Re-group by addon to determine effective unit price or split?
    // Splitting order lines is hard. 
    // Better Strategy: The database stores 'unit_price' and 'total_price'. 
    // If we have 2x "Banana" and 1 is free, 1 is paid. Total for "Banana" line is 2.00.
    // Unit price is 1.00 (avg). Or we can say unit_price 2.00, total 2.00? No, quantity is 2.
    // Let's use the average unit price approach for simplicity in the current schema.

    const expandedAddons: { addon: ProductAddon; price: number; isFree: boolean }[] = [];

    selectedAddons.forEach(addon => {
        const qty = addon.quantity || 1;
        for (let i = 0; i < qty; i++) {
            expandedAddons.push({ addon, price: addon.price, isFree: false });
        }
    });

    // Sort by price desc
    expandedAddons.sort((a, b) => b.price - a.price);

    // Mark free
    for (let i = 0; i < expandedAddons.length; i++) {
        if (limit > 0 && i < limit) {
            expandedAddons[i].isFree = true;
        }
    }

    // Calculate totals
    let addonsTotal = 0;

    // Re-group for details map
    const detailsMap = new Map<string, { totalPaid: number; count: number; originalAddon: ProductAddon }>();

    expandedAddons.forEach(item => {
        if (!item.isFree) {
            addonsTotal += item.price;
        }

        const current = detailsMap.get(item.addon.id) || { totalPaid: 0, count: 0, originalAddon: item.addon };
        current.count++;
        if (!item.isFree) {
            current.totalPaid += item.price;
        }
        detailsMap.set(item.addon.id, current);
    });

    // Convert map to result list
    detailsMap.forEach((value, key) => {
        addonsDetails.push({
            addon: value.originalAddon,
            isFree: value.totalPaid === 0, // completely free
            originalPrice: value.originalAddon.price,
            finalPrice: value.totalPaid // This is the total for this addon line (all quantities)
        });
    });

    return {
        basePrice,
        addonsTotal,
        totalItemPrice: (basePrice + addonsTotal) * quantity,
        addonsDetails
    };
}

/**
 * Wrapper for backward compatibility or simple use cases
 */
export function calculateItemPrice(
    product: Product,
    quantity: number,
    selectedAddons: ProductAddon[] = []
): number {
    return calculateItemPriceDetails(product, quantity, selectedAddons).totalItemPrice;
}
