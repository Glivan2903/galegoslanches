import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShoppingCart,
  Search,
  Clock,
  MapPin,
  Star,
  ChevronRight,
} from "lucide-react";
import { ProductList } from "@/components/home/ProductList";
import { RestaurantHeader } from "@/components/home/RestaurantHeader";
import { CategoryFilter } from "@/components/home/CategoryFilter";
import { FloatingCart } from "@/components/home/FloatingCart";
import { ActiveOrderBanner } from "@/components/home/ActiveOrderBanner";
import { Product, ProductAddon } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Interface para horários de funcionamento
interface BusinessHour {
  id: string;
  day_of_week: string;
  open_time: string;
  close_time: string;
  is_closed: boolean;
  updated_at?: string;
}

// Interface para restaurant
interface Restaurant {
  id: string;
  name: string;
  address: string | null;
  banner_url: string | null;
  logo_url: string | null;
  open_time: string | null;
  close_time: string | null;
  delivery_fee: number | null;
  description: string | null;
  phone: string | null;
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<
    {
      product: Product;
      quantity: number;
      selectedAddons?: ProductAddon[];
      notes?: string;
    }[]
  >([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [isLoadingBusinessHours, setIsLoadingBusinessHours] = useState(false);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  // Store Closed Logic State
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [nextOpenTime, setNextOpenTime] = useState("");
  const [isClosedModalOpen, setIsClosedModalOpen] = useState(false);

  // Função para formatar horário
  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    try {
      const [hours, minutes] = timeString.split(":");
      return `${hours}h${minutes !== "00" ? minutes : ""}`;
    } catch (e) {
      return timeString;
    }
  };

  // Função para obter horário do dia atual
  const getTodayBusinessHours = () => {
    if (!businessHours || businessHours.length === 0) {
      return "Horário não disponível";
    }

    // Obter dia da semana atual em português
    const daysInPortuguese = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ];

    // Configurar a data para o timezone de São Paulo (UTC-3)
    const today = new Date();
    const dayOfWeek = daysInPortuguese[today.getDay()];

    // Formatar a data no padrão brasileiro (dia/mês/ano)
    const formattedDate = format(today, "dd/MM/yyyy", { locale: ptBR });

    // Encontrar o registro para hoje
    const todayBusinessHour = businessHours.find(
      (hour) => hour.day_of_week === dayOfWeek
    );

    if (!todayBusinessHour) {
      return `Hoje dia ${formattedDate}, ${dayOfWeek} - Horário não disponível`;
    }

    if (todayBusinessHour.is_closed) {
      return `Hoje dia ${formattedDate}, ${dayOfWeek} estamos fechados`;
    }

    return `Hoje dia ${formattedDate}, ${dayOfWeek} estamos abertos das ${formatTime(
      todayBusinessHour.open_time
    )} às ${formatTime(todayBusinessHour.close_time)}`;
  };

  // Efeito para carregar horários de funcionamento
  useEffect(() => {
    const fetchBusinessHours = async () => {
      setIsLoadingBusinessHours(true);

      try {
        const { data, error } = await supabase
          .from("business_hours")
          .select("*")
          .order("id");

        if (error) {
          throw error;
        }

        if (data) {
          setBusinessHours(data);
        }
      } catch (error) {
        console.error("Erro ao carregar horários de funcionamento:", error);
        toast.error("Erro ao carregar horários de funcionamento");
      } finally {
        setIsLoadingBusinessHours(false);
      }
    };

    fetchBusinessHours();
  }, []);

  // Function to check if store is open
  const checkStoreStatus = () => {
    if (!businessHours || businessHours.length === 0) return;

    const daysInPortuguese = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ];

    const now = new Date();
    const currentDay = daysInPortuguese[now.getDay()];
    const currentHours = now.getHours().toString().padStart(2, '0');
    const currentMinutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHours}:${currentMinutes}`;

    const todayHour = businessHours.find(h => h.day_of_week === currentDay);

    let isOpen = false;
    let nextOpen = "";

    if (todayHour) {
      if (!todayHour.is_closed) {
        if (currentTime >= todayHour.open_time && currentTime <= todayHour.close_time) {
          isOpen = true;
        } else {
          if (currentTime < todayHour.open_time) {
            nextOpen = `Hoje às ${formatTime(todayHour.open_time)}`;
          } else {
            nextOpen = "Amanhã"
          }
        }
      }
    }

    setIsStoreOpen(isOpen);
    if (!isOpen) {
      if (!nextOpen) {
        let nextDayIndex = (now.getDay() + 1) % 7;
        let found = false;
        for (let i = 0; i < 7; i++) {
          const dayName = daysInPortuguese[nextDayIndex];
          const hour = businessHours.find(h => h.day_of_week === dayName);
          if (hour && !hour.is_closed) {
            nextOpen = `${dayName} às ${formatTime(hour.open_time)}`;
            found = true;
            break;
          }
          nextDayIndex = (nextDayIndex + 1) % 7;
        }
        if (!found) nextOpen = "Em breve";
      }
      setNextOpenTime(nextOpen);
    }
  };

  // Check status when business hours load using useEffect and interval
  useEffect(() => {
    if (businessHours.length > 0) {
      checkStoreStatus();
      const interval = setInterval(checkStoreStatus, 60000);
      return () => clearInterval(interval);
    }
  }, [businessHours]);

  // Show modal initially if closed
  useEffect(() => {
    if (businessHours.length > 0 && !isStoreOpen) {
      setIsClosedModalOpen(true);
    }
  }, [isStoreOpen, businessHours]);

  // Efeito para carregar informações do restaurante
  useEffect(() => {
    async function fetchRestaurantInfo() {
      try {
        const { data, error } = await supabase
          .from("restaurants")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        setRestaurant(data);
      } catch (err) {
        console.error("Error fetching restaurant info:", err);
        toast.error("Erro ao carregar informações do restaurante");
      }
    }

    fetchRestaurantInfo();
  }, [toast]);

  useEffect(() => {
    if (!fetchAttempted) {
      const fetchProducts = async () => {
        try {
          setLoading(true);
          setFetchAttempted(true);

          const { data: productsData, error: productsError } =
            await supabase.from("products").select(`
              *,
              categories:category_id (name)
            `);

          if (productsError) throw productsError;

          const { data: addonsData, error: addonsError } = await supabase.rpc(
            "get_product_addons"
          );
          const productAddons = addonsError ? [] : addonsData || [];

          const { data: relationsData, error: relationsError } =
            await supabase.rpc("get_product_addon_relations");
          const addonRelations = relationsError ? [] : relationsData || [];

          const formattedProducts = (productsData || []).map((product) => {
            const productAddonIds = (addonRelations || [])
              .filter((relation) => relation.product_id === product.id)
              .map((relation) => relation.addon_id);

            const productAddonsForThisProduct = (productAddons || [])
              .filter((addon) => productAddonIds.includes(addon.id))
              .map((addon) => ({
                id: addon.id,
                name: addon.name,
                description: addon.description,
                price: addon.price,
                available: addon.available,
                isGlobal: addon.is_global,
                maxOptions: addon.max_options,
              }));

            return {
              id: product.id,
              name: product.name,
              description: product.description,
              price: product.price,
              imageUrl: product.image_url,
              category: product.categories?.name || "Sem categoria",
              available: product.available,
              featured: product.featured,
              createdAt: new Date(product.created_at),
              addons: productAddonsForThisProduct,
            };
          });

          setProducts(formattedProducts);

          const uniqueCategories = [
            ...new Set(formattedProducts.map((product) => product.category)),
          ];
          setCategories(uniqueCategories);

          setError(false);
        } catch (error) {
          console.error("Error fetching products:", error);
          setError(true);
          toast.error("Erro ao carregar produtos.");
        } finally {
          setLoading(false);
        }
      };

      fetchProducts();
    }
  }, [toast, fetchAttempted]);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (
    product: Product,
    quantity = 1,
    selectedAddons?: ProductAddon[],
    notes?: string
  ) => {
    // Store closed check
    if (!isStoreOpen) {
      setIsClosedModalOpen(true);
      return;
    }

    const isQuickAdd =
      product.addons && product.addons.length > 0 && !selectedAddons;

    if (isQuickAdd) {
      setCartItems((prevItems) => {
        const existingItemIndex = prevItems.findIndex(
          (item) =>
            item.product.id === product.id &&
            (!item.selectedAddons || item.selectedAddons.length === 0)
        );

        if (existingItemIndex >= 0) {
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + 1,
          };
          return updatedItems;
        } else {
          return [...prevItems, { product, quantity: 1 }];
        }
      });
    } else {
      setCartItems((prevItems) => {
        const existingItemIndex = prevItems.findIndex((item) => {
          if (item.product.id !== product.id) return false;

          if (item.notes !== notes) return false;

          if (
            (!item.selectedAddons && selectedAddons) ||
            (item.selectedAddons && !selectedAddons)
          )
            return false;

          if (!item.selectedAddons && !selectedAddons) return true;

          if (item.selectedAddons && selectedAddons) {
            if (item.selectedAddons.length !== selectedAddons.length)
              return false;

            return item.selectedAddons.every((itemAddon) => {
              const matchingAddon = selectedAddons.find(
                (a) => a.id === itemAddon.id
              );
              return (
                matchingAddon && matchingAddon.quantity === itemAddon.quantity
              );
            });
          }

          return false;
        });

        if (existingItemIndex >= 0) {
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity,
          };
          return updatedItems;
        } else {
          return [
            ...prevItems,
            {
              product,
              quantity,
              selectedAddons,
              notes,
            },
          ];
        }
      });
    }

    toast.success(`${product.name} foi adicionado ao seu pedido`);
  };

  const handleRemoveFromCart = (productId: string, itemIndex: number) => {
    setCartItems((prevItems) => {
      const targetItem = prevItems[itemIndex];

      if (targetItem.quantity > 1) {
        return prevItems.map((item, idx) =>
          idx === itemIndex ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        return prevItems.filter((_, idx) => idx !== itemIndex);
      }
    });
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = cartItems.reduce((sum, item) => {
    let itemTotal = item.product.price * item.quantity;

    if (item.selectedAddons && item.selectedAddons.length > 0) {
      const addonsTotal = item.selectedAddons.reduce(
        (addonSum, addon) => addonSum + addon.price * (addon.quantity || 1),
        0
      );
      itemTotal += addonsTotal * item.quantity;
    }

    return sum + itemTotal;
  }, 0);

  // Handler para rastrear quando o carrinho é aberto ou fechado
  const handleCartToggle = (isOpen: boolean) => {
    setCartOpen(isOpen);
  };

  return (
    <div
      className={`flex flex-col min-h-screen bg-gray-50 ${cartOpen ? "overflow-hidden h-screen" : ""
        }`}
    >
      <RestaurantHeader />

      <div className="flex flex-col flex-1">
        <div className="flex-1 p-4">
          <div className="max-w-5xl mx-auto">
            <ActiveOrderBanner />

            <div className="mb-6">
              <Tabs defaultValue="menu">
                <TabsList className="w-full">
                  <TabsTrigger value="menu" className="flex-1">
                    Menu
                  </TabsTrigger>
                  {/* <TabsTrigger value="reviews" className="flex-1">
                    Avaliações
                  </TabsTrigger> */}
                  <TabsTrigger value="info" className="flex-1">
                    Informações
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="menu" className="pt-4">
                  <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar produtos..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                  />

                  <ProductList
                    products={filteredProducts}
                    onAddToCart={handleAddToCart}
                    isLoading={loading}
                    isError={error}
                  />
                </TabsContent>
                <TabsContent value="reviews">
                  <div className="py-8 text-center">
                    <h3 className="text-lg font-medium mb-2">
                      Avaliações dos clientes
                    </h3>
                    <div className="flex justify-center items-center gap-2 mb-4">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <Star className="h-5 w-5 text-gray-300" />
                      {/* <span className="text-lg font-bold ml-2">4.2</span> */}
                    </div>
                    <p className="text-muted-foreground">
                      Baseado em 120 avaliações
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="info">
                  <div className="py-6">
                    <h3 className="text-lg font-medium mb-4">
                      Informações do restaurante
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-delivery-500 mt-0.5" />
                        <div>
                          <p className="text-muted-foreground">
                            {restaurant?.address || "Endereço não disponível"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-delivery-500 mt-0.5" />
                        <div>
                          <p className="text-muted-foreground">
                            {getTodayBusinessHours()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Modal Store Closed */}
        <Dialog open={isClosedModalOpen} onOpenChange={setIsClosedModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Estamos fechados no momento</DialogTitle>
              <DialogDescription>
                Infelizmente não estamos aceitando pedidos agora.
                <br />
                Abriremos novamente: <strong>{nextOpenTime}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end">
              <Button onClick={() => setIsClosedModalOpen(false)}>Entendi</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <FloatingCart
        cartItems={cartItems}
        onAddItem={handleAddToCart}
        onRemoveItem={handleRemoveFromCart}
        totalItems={totalItems}
        totalPrice={totalPrice}
        onOpenChange={handleCartToggle}
        isStoreOpen={isStoreOpen}
      />
    </div>
  );
}
