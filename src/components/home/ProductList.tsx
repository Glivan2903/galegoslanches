import React, { useState } from "react";
import { Product, ProductAddon } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductDetailDialog } from "./ProductDetailDialog";
import { Plus, Star, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductListProps {
  products: Product[];
  onAddToCart: (
    product: Product,
    quantity?: number,
    selectedAddons?: ProductAddon[],
    notes?: string
  ) => void;
  isLoading?: boolean;
  isError?: boolean;
}

export function ProductList({
  products,
  onAddToCart,
  isLoading = false,
  isError = false,
}: ProductListProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="overflow-hidden border">
            <div className="flex h-full">
              <div className="flex-1 p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-6 w-1/3 mt-2" />
                <Skeleton className="h-8 w-full mt-2" />
              </div>
              <div className="relative flex-shrink-0 w-24 md:w-32">
                <Skeleton
                  className="w-full h-full absolute inset-0"
                  style={{ aspectRatio: "1/1" }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Erro ao carregar produtos. Tente novamente.</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum produto encontrado.</p>
      </div>
    );
  }

  const handleOpenProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleSimpleAddToCart = (product: Product) => {
    if (product.available) {
      onAddToCart(product);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <Card
            key={product.id}
            className="overflow-hidden border hover:shadow-md transition-shadow"
          >
            <div className="flex h-full">
              <div className="flex-1 p-4">
                <h3 className="font-bold text-lg mb-1 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {product.description}
                </p>
                <div className="text-lg font-bold text-delivery-700 mt-auto">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(product.price)}
                </div>

                <div className="flex gap-2 mt-2">
                  {product.addons && product.addons.length > 0 ? (
                    <>
                      <Button
                        className={cn(
                          "gap-2 flex-1 bg-delivery-500 hover:bg-delivery-600",
                          !product.available && "opacity-50 cursor-not-allowed"
                        )}
                        size="sm"
                        onClick={() =>
                          product.available && handleOpenProductDetails(product)
                        }
                        disabled={!product.available}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        Opções
                      </Button>
                      <Button
                        className={cn(
                          "gap-2 w-auto",
                          !product.available && "opacity-50 cursor-not-allowed"
                        )}
                        size="sm"
                        onClick={() => handleSimpleAddToCart(product)}
                        disabled={!product.available}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      className={cn(
                        "gap-2 w-full md:w-auto",
                        !product.available && "opacity-50 cursor-not-allowed"
                      )}
                      size="sm"
                      onClick={() => handleSimpleAddToCart(product)}
                      disabled={!product.available}
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar
                    </Button>
                  )}
                </div>
              </div>

              <div className="relative flex-shrink-0 w-24 md:w-32">
                <img
                  src={product.imageUrl || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover absolute inset-0"
                  style={{ aspectRatio: "1/1" }}
                />
                {product.featured && (
                  <Badge className="absolute top-1 right-1 bg-delivery-500 hover:bg-delivery-600">
                    <Star className="h-3 w-3 mr-1 fill-current" /> Destaque
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <ProductDetailDialog
        product={selectedProduct}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddToCart={onAddToCart}
      />
    </>
  );
}
