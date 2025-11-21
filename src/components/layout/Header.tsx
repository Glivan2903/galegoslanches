import React from "react";
import { Bell, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/use-notifications";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  // Log para debug das notificações
  React.useEffect(() => {
    console.log('Header notifications updated:', { count: notifications.length, unreadCount });
  }, [notifications, unreadCount]);

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 md:px-6">
        <h1 className="text-lg font-semibold md:text-xl">{title}</h1>
        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <DropdownMenuItem disabled>
                  Nenhuma notificação
                </DropdownMenuItem>
              ) : (
                <>
                  {notifications.map((notification) => (
                    <div key={notification.id}>
                      <DropdownMenuItem
                        className="flex items-start gap-2 cursor-pointer"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {notification.title}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {notification.description}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {notification.time}
                          </div>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </div>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
