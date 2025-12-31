import { Order } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Clock, Phone } from "lucide-react";

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const createdAtDate =
    order.createdAt instanceof Date
      ? order.createdAt
      : new Date(order.createdAt as any);
  const createdAtMs =
    createdAtDate instanceof Date && !isNaN(createdAtDate.getTime())
      ? createdAtDate.getTime()
      : Date.now();
  const timeElapsed = Math.floor((Date.now() - createdAtMs) / 60000);

  return (
    <Card className="cursor-move hover:shadow-xl hover:scale-[1.02] transition-all duration-300 rounded-2xl h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{order.customerName}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 truncate">
              <Phone className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{order.customerPhone}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
            <Clock className="h-3 w-3" />
            <span>{timeElapsed} min</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span className="truncate">
                  {item.quantity}x {item.name}
                </span>
                {item.notes && (
                  <p className="text-xs text-muted-foreground truncate">
                    {item.notes}
                  </p>
                )}
              </div>
              <span className="text-muted-foreground flex-shrink-0">
                € {(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="pt-2 border-t border-border">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-primary">€ {order.total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
