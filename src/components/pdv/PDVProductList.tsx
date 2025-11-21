
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ProductDetailDialog } from '@/components/home/ProductDetailDialog';

interface PDVProductListProps {
  onAddToCart: (product: Product, quantity?: number, selectedAddons?: any[], notes?: string) => void;
}

export function PDVProductList({ onAddToCart }: PDVProductListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          categories:category_id (name)
        `);

      if (productsError) throw productsError;

      const { data: addonsData, error: addonsError } = await supabase.rpc('get_product_addons');
      const productAddons = addonsError ? [] : (addonsData || []);

      const { data: relationsData, error: relationsError } = await supabase.rpc('get_product_addon_relations');
      const addonRelations = relationsError ? [] : (relationsData || []);

      return (productsData || []).map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        imageUrl: product.image_url,
        category: product.categories?.name || 'Sem categoria',
        available: product.available,
        featured: product.featured || false,
        createdAt: new Date(product.created_at),
        addons: (addonRelations || [])
          .filter(relation => relation.product_id === product.id)
          .map(relation => {
            const addon = productAddons.find(a => a.id === relation.addon_id);
            return addon ? {
              id: addon.id,
              name: addon.name,
              description: addon.description,
              price: addon.price,
              available: addon.available,
              isGlobal: addon.is_global,
              maxOptions: addon.max_options
            } : null;
          })
          .filter(Boolean)
      } as Product));
    },
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const handleProductClick = (product: Product) => {
    if (product.addons && product.addons.length > 0) {
      setSelectedProduct(product);
      setDialogOpen(true);
    } else {
      onAddToCart(product);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar produtos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden cursor-pointer group"
              onClick={() => handleProductClick(product)}
            >
              <div className="aspect-square relative overflow-hidden bg-muted">
                <img
                  src={product.imageUrl || '/placeholder.svg'}
                  alt={product.name}
                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                />
                {product.addons && product.addons.length > 0 && (
                  <Badge className="absolute top-2 right-2 bg-primary">
                    +Adicionais
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium line-clamp-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {product.description}
                </p>
                <p className="text-lg font-bold text-primary mt-2">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(product.price)}
                </p>
              </div>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground py-8">
            Nenhum produto encontrado
          </p>
        )}
      </div>

      <ProductDetailDialog
        product={selectedProduct}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAddToCart={(product, quantity, selectedAddons, notes) => {
          onAddToCart(product, quantity, selectedAddons, notes);
          setDialogOpen(false);
        }}
      />
    </div>
  );
}
