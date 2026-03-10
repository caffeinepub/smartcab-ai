import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, BellOff, Check } from "lucide-react";
import { useState } from "react";
import {
  useGetNotifications,
  useMarkNotificationsRead,
} from "../hooks/useQueries";

export default function NotificationsDropdown() {
  const { data: notifications = [] } = useGetNotifications();
  const markRead = useMarkNotificationsRead();
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpen = (val: boolean) => {
    setOpen(val);
    if (val && unreadCount > 0) {
      markRead.mutate();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button
          data-ocid="notifications.open_modal_button"
          variant="ghost"
          size="icon"
          className="relative rounded-xl w-10 h-10"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs rounded-full"
              style={{
                background: "oklch(0.60 0.23 240)",
                color: "white",
                fontSize: "10px",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        data-ocid="notifications.popover"
        align="end"
        className="w-80 p-0 rounded-2xl border-border"
        style={{
          background: "oklch(var(--popover))",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {unreadCount} new
            </span>
          )}
        </div>
        <ScrollArea className="max-h-72">
          {notifications.length === 0 ? (
            <div
              data-ocid="notifications.empty_state"
              className="flex flex-col items-center justify-center py-10 gap-3"
            >
              <BellOff className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="py-1">
              {notifications.map((n, i) => (
                <div
                  key={n.message.slice(0, 40) + String(i)}
                  data-ocid={`notifications.item.${i + 1}`}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{
                      background: n.read
                        ? "oklch(var(--muted-foreground))"
                        : "oklch(0.60 0.23 240)",
                    }}
                  />
                  <p className="text-sm text-foreground leading-relaxed">
                    {n.message}
                  </p>
                  {n.read && (
                    <Check className="w-3 h-3 text-muted-foreground ml-auto flex-shrink-0 mt-0.5" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
