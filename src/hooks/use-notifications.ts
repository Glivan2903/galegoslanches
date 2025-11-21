import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Carregar pedidos pendentes do Supabase
    const loadPendingOrders = async () => {
      console.log('Loading pending orders for notifications...');
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        console.error('Error loading pending orders:', error);
        return;
      }

      if (orders) {
        console.log('Found pending orders:', orders.length);
        const orderNotifications = orders.map(orderToNotification);
        setNotifications(orderNotifications);
      }
    };

    loadPendingOrders();
    
    // Recarregar notificações a cada 30 segundos como fallback
    const interval = setInterval(loadPendingOrders, 30000);

    // Inscrever para mudanças nos pedidos
    const subscription = supabase
      .channel("orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const newOrder = payload.new as any;
          console.log('New order received:', newOrder);
          if (newOrder.status === "pending") {
            const notification = orderToNotification(newOrder);
            setNotifications((prev) => [notification, ...prev]);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const updatedOrder = payload.new as any;
          const oldOrder = payload.old as any;
          console.log('Order updated:', { old: oldOrder, new: updatedOrder });
          
          setNotifications((prev) => {
            // Se o pedido não está mais pendente, remover da lista
            if (updatedOrder.status !== "pending") {
              console.log('Removing notification for order:', updatedOrder.id, 'status changed from', oldOrder?.status, 'to', updatedOrder.status);
              const filtered = prev.filter((notification) => notification.id !== updatedOrder.id);
              console.log('Notifications after removal:', filtered.length);
              return filtered;
            }
            
            // Se ainda está pendente, atualizar a notificação
            const existingIndex = prev.findIndex((notification) => notification.id === updatedOrder.id);
            if (existingIndex >= 0) {
              const updatedNotifications = [...prev];
              updatedNotifications[existingIndex] = orderToNotification(updatedOrder);
              return updatedNotifications;
            }
            
            // Se não existia antes e agora está pendente, adicionar
            return [orderToNotification(updatedOrder), ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);

  const markAsRead = (notificationId: string) => {
    // Remover da lista de notificações ativas
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

  const orderToNotification = (order: Order): Notification => {
    return {
      id: order.id,
      title: "Novo pedido recebido",
      description: `Pedido #${order.number} - Cliente: ${order.customer_name}`,
      time: new Date(order.created_at).toLocaleString(),
    };
  };

  return {
    notifications,
    unreadCount: notifications.length,
    markAsRead,
  };
}
