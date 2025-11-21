import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProductAddon } from "@/types";
import { Check, Info, Loader, Upload, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { fileToBase64, validateImageFile } from "@/utils/image-utils";

interface Category {
  id: string;
  name: string;
  display_order?: number;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category_id?: string;
  available: boolean;
  featured: boolean;
}

interface ProductFormProps {
  product: Product | null;
  categories: Category[];
  onClose: (shouldRefetch?: boolean) => void;
}

export function ProductForm({
  product,
  categories,
  onClose,
}: ProductFormProps) {
  const isEditing = !!product;
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    image_url: "",
    category_id: "",
    available: true,
    featured: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableAddons, setAvailableAddons] = useState<ProductAddon[]>([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [isLoadingAddons, setIsLoadingAddons] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch all available addons once when the component mounts
  useEffect(() => {
    const fetchAddons = async () => {
      setIsLoadingAddons(true);
      try {
        const { data, error } = await supabase.rpc("get_product_addons");

        if (error) throw error;

        const formattedAddons = (data || []).map((addon) => ({
          id: addon.id,
          name: addon.name,
          description: addon.description || undefined,
          price: addon.price,
          available: addon.available,
          isGlobal: addon.is_global,
          maxOptions: addon.max_options,
        }));

        setAvailableAddons(formattedAddons);
      } catch (error) {
        console.error("Error fetching addons:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar adicionais",
          description: "Não foi possível carregar a lista de adicionais.",
        });
      } finally {
        setIsLoadingAddons(false);
      }
    };

    fetchAddons();
  }, []); // Empty dependency array ensures this only runs once

  // Fetch selected addons for this product if editing
  useEffect(() => {
    const fetchProductAddons = async () => {
      if (!isEditing || !product.id) return;

      try {
        const { data, error } = await supabase
          .from("product_addon_relations")
          .select("addon_id")
          .eq("product_id", product.id);

        if (error) throw error;

        const addonIds = (data || []).map((relation) => relation.addon_id);
        setSelectedAddonIds(addonIds);
      } catch (error) {
        console.error("Error fetching product addons:", error);
      }
    };

    fetchProductAddons();
  }, [isEditing, product?.id]); // Only run when editing status or product ID changes

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        image_url: product.image_url || "",
        category_id: product.category_id || "",
        available: product.available !== undefined ? product.available : true,
        featured: product.featured || false,
      });
    }
  }, [product]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddonToggle = (addonId: string) => {
    setSelectedAddonIds((prev) => {
      if (prev.includes(addonId)) {
        return prev.filter((id) => id !== addonId);
      } else {
        return [...prev, addonId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const productData = {
      ...formData,
      price: parseFloat(formData.price.toString()),
    };

    try {
      let productId = product?.id;

      if (isEditing) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(productData)
          .select("id")
          .single();

        if (error) throw error;
        productId = data.id;
      }

      // Update product addons if we have a valid productId
      if (productId) {
        // First, delete existing relations
        const { error: deleteError } = await supabase
          .from("product_addon_relations")
          .delete()
          .eq("product_id", productId);

        if (deleteError) throw deleteError;

        // Then insert new relations if any addons are selected
        if (selectedAddonIds.length > 0) {
          const addonRelations = selectedAddonIds.map((addonId) => ({
            product_id: productId,
            addon_id: addonId,
          }));

          const { error: insertError } = await supabase
            .from("product_addon_relations")
            .insert(addonRelations);

          if (insertError) throw insertError;
        }
      }

      toast({
        title: isEditing ? "Produto atualizado" : "Produto criado",
        description: isEditing
          ? "O produto foi atualizado com sucesso."
          : "O produto foi criado com sucesso.",
      });

      onClose(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler para upload de arquivo
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);

    try {
      // Validar arquivo
      const error = validateImageFile(file, 2); // 2MB max
      if (error) {
        toast({
          variant: "destructive",
          title: "Erro no upload",
          description: error,
        });
        return;
      }

      // Converter para base64
      const base64 = await fileToBase64(file);
      setFormData((prev) => ({ ...prev, image_url: base64 }));

      toast({
        title: "Upload concluído",
        description: "Imagem carregada com sucesso",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: "Não foi possível processar o arquivo",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handler para abrir a imagem em nova aba
  const handleOpenInNewTab = (url: string) => {
    if (!url) return;

    // Se for uma URL base64, criar um blob e gerar uma URL temporária
    if (url.startsWith("data:")) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>Visualização da Imagem</title>
              <style>
                body {
                  margin: 0;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  background: #f1f1f1;
                }
                img {
                  max-width: 100%;
                  max-height: 100vh;
                  object-fit: contain;
                }
              </style>
            </head>
            <body>
              <img src="${url}" alt="Preview" />
            </body>
          </html>
        `);
      }
    } else {
      // Se for uma URL normal, abrir em nova aba
      window.open(url, "_blank");
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
        </DialogHeader>

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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  handleSelectChange("category_id", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Imagem do Produto</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              <div>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  id="product-image-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                    e.target.value = ""; // Reset input
                  }}
                  disabled={isUploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() =>
                    document.getElementById("product-image-upload")?.click()
                  }
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Recomendado: 800x600 pixels, formatos JPG, PNG ou WebP
            </p>

            {formData.image_url && (
              <div className="mt-2">
                <div className="relative overflow-hidden rounded-md border">
                  <img
                    src={formData.image_url}
                    alt="Preview do Produto"
                    className="aspect-video w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWltYWdlLW9mZiI+PHBhdGggZD0iTTIuMiAyLjJMOCAxNWwyLTIgNC0xIDggMTAiLz48cGF0aCBkPSJNMTQuOTUgOC02LjExIDYuMTEiLz48Y2lyY2xlIGN4PSI4IiBjeT0iOCIgcj0iMiIvPjxwYXRoIGQ9Ik0yMS45NSAyMS45IDEzIDE1bC0zLjA3IDIuOTkiLz48cGF0aCBkPSJNMiAyLjJMMjEuOCAyMiIvPjwvc3ZnPg==";
                      target.classList.add("p-8", "opacity-30");
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => handleOpenInNewTab(formData.image_url)}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="available"
                name="available"
                checked={formData.available}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, available: checked }))
                }
              />
              <Label htmlFor="available">Disponível</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                name="featured"
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, featured: checked }))
                }
              />
              <Label htmlFor="featured">Destacado</Label>
            </div>
          </div>

          <div className="border rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Adicionais disponíveis</h3>
              {isLoadingAddons && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Carregando...
                </div>
              )}
            </div>

            {isLoadingAddons ? (
              <div className="py-8 text-center">
                <Loader className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Carregando adicionais...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                {availableAddons.length > 0 ? (
                  availableAddons.map((addon) => (
                    <div
                      key={addon.id}
                      className={cn(
                        "flex items-start space-x-2 p-3 border rounded-md",
                        selectedAddonIds.includes(addon.id)
                          ? "border-delivery-500 bg-delivery-50"
                          : "border-gray-200",
                        !addon.available && "opacity-60"
                      )}
                    >
                      <Checkbox
                        id={`addon-${addon.id}`}
                        checked={selectedAddonIds.includes(addon.id)}
                        onCheckedChange={() => handleAddonToggle(addon.id)}
                        disabled={!addon.available}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`addon-${addon.id}`}
                          className="flex items-center gap-2 font-medium cursor-pointer"
                        >
                          {addon.name}
                          {selectedAddonIds.includes(addon.id) && (
                            <Check className="h-4 w-4 text-delivery-500" />
                          )}
                          {addon.isGlobal && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                              Global
                            </span>
                          )}
                        </label>
                        {addon.description && (
                          <p className="text-sm text-muted-foreground">
                            {addon.description}
                          </p>
                        )}
                        <p className="text-sm font-medium text-delivery-700">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(addon.price)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-4 border rounded-md bg-gray-50">
                    <p className="text-muted-foreground">
                      Nenhum adicional disponível.
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedAddonIds.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Info className="h-4 w-4 text-blue-500" />
                <span className="text-muted-foreground">
                  {selectedAddonIds.length}{" "}
                  {selectedAddonIds.length === 1
                    ? "adicional selecionado"
                    : "adicionais selecionados"}
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Salvando..."
                : isEditing
                ? "Salvar Alterações"
                : "Criar Produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
