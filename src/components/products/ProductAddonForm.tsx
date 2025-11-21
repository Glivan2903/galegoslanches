
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProductAddon } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface ProductAddonFormProps {
  addon?: ProductAddon;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

const addonSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  description: z.string().optional(),
  price: z.number().min(0, 'O preço deve ser maior ou igual a zero'),
  available: z.boolean().default(true),
  is_global: z.boolean().default(false),
  max_options: z.number().optional().nullable()
});

type AddonFormValues = z.infer<typeof addonSchema>;

export function ProductAddonForm({ addon, open, onOpenChange, onSave }: ProductAddonFormProps) {
  const isEditing = !!addon;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<AddonFormValues>({
    resolver: zodResolver(addonSchema),
    defaultValues: {
      name: addon?.name || '',
      description: addon?.description || '',
      price: addon?.price || 0,
      available: addon?.available ?? true,
      is_global: addon?.isGlobal ?? false,
      max_options: addon?.maxOptions || null,
    }
  });
  
  useEffect(() => {
    if (addon) {
      form.reset({
        name: addon.name,
        description: addon.description || '',
        price: addon.price,
        available: addon.available,
        is_global: addon.isGlobal || false,
        max_options: addon.maxOptions || null,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        price: 0,
        available: true,
        is_global: false,
        max_options: null,
      });
    }
  }, [addon, form]);
  
  const onSubmit = async (data: AddonFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (isEditing && addon) {
        const { error } = await supabase
          .from('product_addons')
          .update({
            name: data.name,
            description: data.description,
            price: data.price,
            available: data.available,
            is_global: data.is_global,
            max_options: data.max_options,
            updated_at: new Date().toISOString() // Convert Date to ISO string
          })
          .eq('id', addon.id);
          
        if (error) throw error;
        
        toast({
          title: "Adicional atualizado",
          description: "O adicional foi atualizado com sucesso."
        });
      } else {
        const { error } = await supabase
          .from('product_addons')
          .insert({
            name: data.name,
            description: data.description,
            price: data.price,
            available: data.available,
            is_global: data.is_global,
            max_options: data.max_options
            // No need to specify created_at as it's handled by database defaults
          });
          
        if (error) throw error;
        
        toast({
          title: "Adicional criado",
          description: "O adicional foi criado com sucesso."
        });
      }
      
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Adicional' : 'Novo Adicional'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Extra queijo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Descrição do adicional" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço (R$)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      min="0" 
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                      value={field.value} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="max_options"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Máximo de opções (deixe em branco para ilimitado)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      step="1"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)} 
                      value={field.value === null ? '' : field.value} 
                      placeholder="Ex: 3" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center justify-between space-x-2">
              <FormField
                control={form.control}
                name="available"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Disponível</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="is_global"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Global (disponível para todos os produtos)</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? 'Salvando...' 
                  : isEditing 
                    ? 'Salvar Alterações' 
                    : 'Criar Adicional'
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
