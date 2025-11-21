
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ProductAddons } from './ProductAddons';
import { Product, ProductAddon } from '@/types';
import { Star, Plus, Minus, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProductAddons } from '@/hooks/useProductAddons';

interface ProductDetailDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (product: Product, quantity: number, selectedAddons: ProductAddon[], notes?: string) => void;
}

export function ProductDetailDialog({ 
  product, 
  open, 
  onOpenChange,
  onAddToCart 
}: ProductDetailDialogProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<ProductAddon[]>([]);
  // We'll use our custom hook here to fetch addons if they weren't provided
  const { addons: fetchedAddons, loading: addonsLoading } = useProductAddons(open && !product?.addons?.length ? product?.id : undefined);
  
  const productAddons = product?.addons || fetchedAddons;

  // Reset state when product changes or dialog closes
  useEffect(() => {
    if (open && product) {
      setQuantity(1);
      setNotes('');
      setSelectedAddons([]);
    }
  }, [open, product]);

  if (!product) {
    return null;
  }

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedAddons, notes);
    onOpenChange(false);
  };

  const handleAddonSelection = (addon: ProductAddon, selected: boolean, quantity: number = 1) => {
    if (selected) {
      const existingAddonIndex = selectedAddons.findIndex(a => a.id === addon.id);
      
      if (existingAddonIndex >= 0) {
        // Update existing addon
        const updatedAddons = [...selectedAddons];
        updatedAddons[existingAddonIndex] = {
          ...updatedAddons[existingAddonIndex],
          quantity,
          selected: true
        };
        setSelectedAddons(updatedAddons);
      } else {
        // Add new addon
        setSelectedAddons([...selectedAddons, { ...addon, quantity, selected: true }]);
      }
    } else {
      // Remove addon
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    }
  };

  const totalPrice = (
    product.price * quantity + 
    selectedAddons.reduce((sum, addon) => sum + addon.price * (addon.quantity || 1), 0)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="w-full h-48 rounded-md overflow-hidden bg-gray-100 mb-4 relative">
            <img
              src={product.imageUrl || '/placeholder.svg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.featured && (
              <Badge className="absolute top-4 left-4 bg-delivery-500 hover:bg-delivery-600">
                <Star className="h-3 w-3 mr-1 fill-current" /> Destaque
              </Badge>
            )}
          </div>
          <DialogTitle className="text-xl">{product.name}</DialogTitle>
          <p className="text-muted-foreground">{product.description}</p>
          
          <div className="text-lg font-bold text-delivery-700 mt-2">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(product.price)}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {addonsLoading ? (
            <div className="py-4 text-center text-muted-foreground">
              Carregando adicionais...
            </div>
          ) : productAddons && productAddons.length > 0 ? (
            <ProductAddons 
              addons={productAddons.map(addon => ({
                ...addon,
                selected: selectedAddons.some(a => a.id === addon.id),
                quantity: selectedAddons.find(a => a.id === addon.id)?.quantity || 0
              }))} 
              onSelect={handleAddonSelection} 
            />
          ) : null}

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Observações</h4>
            <Textarea
              placeholder="Ex: Sem cebola, molho à parte, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="font-medium">Quantidade</div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={quantity <= 1}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2 sm:space-y-2">
          <div className="w-full flex justify-between items-center">
            <span className="font-medium">Total</span>
            <span className="text-lg font-bold text-delivery-700">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(totalPrice)}
            </span>
          </div>
          
          <div className="flex w-full gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1">Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={handleAddToCart} 
              className={cn(
                "flex-1 gap-2 bg-delivery-500 hover:bg-delivery-600",
                !product.available && "opacity-50 cursor-not-allowed"
              )}
              disabled={!product.available}
            >
              <ShoppingCart className="h-4 w-4" />
              Adicionar ao pedido
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
