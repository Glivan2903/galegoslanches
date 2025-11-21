
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, AlertCircle } from 'lucide-react';
import { ProductAddonForm } from './ProductAddonForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProductAddon } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ProductAddonList() {
  const [addons, setAddons] = useState<ProductAddon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddon, setEditingAddon] = useState<ProductAddon | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addonToDelete, setAddonToDelete] = useState<ProductAddon | null>(null);
  const { toast } = useToast();

  const fetchAddons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_addons')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      const formattedAddons: ProductAddon[] = (data || []).map(addon => ({
        id: addon.id,
        name: addon.name,
        description: addon.description || undefined,
        price: addon.price,
        available: addon.available,
        isGlobal: addon.is_global,
        maxOptions: addon.max_options,
      }));
      
      setAddons(formattedAddons);
    } catch (error) {
      console.error('Error fetching addons:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar adicionais",
        description: "Não foi possível carregar a lista de adicionais."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddons();
  }, []);

  const handleEdit = (addon: ProductAddon) => {
    setEditingAddon(addon);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!addonToDelete) return;
    
    try {
      // First check if this addon is used in any products
      const { data: relations, error: checkError } = await supabase
        .from('product_addon_relations')
        .select('id')
        .eq('addon_id', addonToDelete.id);
      
      if (checkError) throw checkError;
      
      if (relations && relations.length > 0) {
        toast({
          variant: "destructive",
          title: "Não é possível excluir",
          description: "Este adicional está sendo usado em produtos. Remova-o dos produtos primeiro."
        });
        setDeleteDialogOpen(false);
        setAddonToDelete(null);
        return;
      }
      
      const { error } = await supabase
        .from('product_addons')
        .delete()
        .eq('id', addonToDelete.id);
      
      if (error) throw error;
      
      toast({
        title: "Adicional excluído",
        description: "O adicional foi excluído com sucesso."
      });
      
      fetchAddons();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: error.message
      });
    } finally {
      setDeleteDialogOpen(false);
      setAddonToDelete(null);
    }
  };

  const confirmDelete = (addon: ProductAddon) => {
    setAddonToDelete(addon);
    setDeleteDialogOpen(true);
  };

  const handleFormSave = () => {
    fetchAddons();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Adicionais</h2>
        <Button onClick={() => { setEditingAddon(undefined); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Adicional
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Carregando adicionais...</p>
        </div>
      ) : addons.length === 0 ? (
        <div className="text-center py-12 border rounded-md bg-gray-50">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium">Nenhum adicional encontrado</h3>
          <p className="mt-1 text-muted-foreground">
            Clique em "Novo Adicional" para começar a adicionar opções.
          </p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addons.map((addon) => (
                <TableRow key={addon.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {addon.name}
                    {addon.isGlobal && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Global
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(addon.price)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={addon.available ? "default" : "secondary"}
                      className={addon.available ? "bg-green-500" : "bg-gray-200 text-gray-700"}
                    >
                      {addon.available ? 'Disponível' : 'Indisponível'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(addon)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => confirmDelete(addon)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ProductAddonForm
        addon={editingAddon}
        open={showForm}
        onOpenChange={setShowForm}
        onSave={handleFormSave}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o adicional "{addonToDelete?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
