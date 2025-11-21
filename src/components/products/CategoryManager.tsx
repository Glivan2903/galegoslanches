
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Plus, ArrowUp, ArrowDown } from 'lucide-react';

interface CategoryManagerProps {
  open: boolean;
  onClose: () => void;
  onCategoriesUpdated: () => void;
  categories: any[];
}

export function CategoryManager({ open, onClose, onCategoriesUpdated, categories }: CategoryManagerProps) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    display_order: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name || '',
        description: editingCategory.description || '',
        image_url: editingCategory.image_url || '',
        display_order: editingCategory.display_order || 0
      });
    } else {
      // For new category, set display_order to next available number
      const maxOrder = categories.reduce((max, cat) => 
        cat.display_order > max ? cat.display_order : max, 0);
      
      setFormData({
        name: '',
        description: '',
        image_url: '',
        display_order: maxOrder + 1
      });
    }
  }, [editingCategory, categories]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(formData)
          .eq('id', editingCategory.id);
          
        if (error) throw error;
        
        toast({
          title: "Categoria atualizada",
          description: "A categoria foi atualizada com sucesso."
        });
      } else {
        const { error } = await supabase
          .from('categories')
          .insert(formData);
          
        if (error) throw error;
        
        toast({
          title: "Categoria criada",
          description: "A categoria foi criada com sucesso."
        });
      }
      
      onCategoriesUpdated();
      setShowForm(false);
      setEditingCategory(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };
  
  const handleDeleteCategory = async (categoryId) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.")) {
      return;
    }
    
    try {
      // Check if category has products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', categoryId);
        
      if (productsError) throw productsError;
      
      if (products.length > 0) {
        toast({
          variant: "destructive",
          title: "Não é possível excluir",
          description: "Esta categoria possui produtos associados. Remova os produtos primeiro."
        });
        return;
      }
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
        
      if (error) throw error;
      
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso."
      });
      
      onCategoriesUpdated();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message
      });
    }
  };
  
  const handleMoveCategory = async (categoryId, direction) => {
    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
    if (categoryIndex === -1) return;
    
    const currentCategory = categories[categoryIndex];
    
    if (direction === 'up' && categoryIndex > 0) {
      const prevCategory = categories[categoryIndex - 1];
      
      try {
        await supabase
          .from('categories')
          .update({ display_order: prevCategory.display_order })
          .eq('id', currentCategory.id);
          
        await supabase
          .from('categories')
          .update({ display_order: currentCategory.display_order })
          .eq('id', prevCategory.id);
          
        onCategoriesUpdated();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: error.message
        });
      }
    } else if (direction === 'down' && categoryIndex < categories.length - 1) {
      const nextCategory = categories[categoryIndex + 1];
      
      try {
        await supabase
          .from('categories')
          .update({ display_order: nextCategory.display_order })
          .eq('id', currentCategory.id);
          
        await supabase
          .from('categories')
          .update({ display_order: currentCategory.display_order })
          .eq('id', nextCategory.id);
          
        onCategoriesUpdated();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: error.message
        });
      }
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
        </DialogHeader>
        
        {!showForm ? (
          <>
            <div className="flex justify-end mb-4">
              <Button onClick={() => {
                setEditingCategory(null);
                setShowForm(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveCategory(category.id, 'up')}
                          disabled={categories.indexOf(category) === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveCategory(category.id, 'down')}
                          disabled={categories.indexOf(category) === categories.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        {category.display_order}
                      </div>
                    </TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {category.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Nenhuma categoria encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            <DialogFooter>
              <Button onClick={onClose}>Fechar</Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image_url">URL da Imagem</Label>
              <Input
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="display_order">Ordem de Exibição</Label>
              <Input
                id="display_order"
                name="display_order"
                type="number"
                value={formData.display_order}
                onChange={handleChange}
                required
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowForm(false);
                  setEditingCategory(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? 'Salvando...' 
                  : editingCategory 
                    ? 'Salvar Alterações' 
                    : 'Criar Categoria'
                }
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
