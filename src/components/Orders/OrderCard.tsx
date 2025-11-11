import { Order } from "@/lib/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Clock, Phone } from "lucide-react";

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const timeElapsed = Math.floor((Date.now() - order.createdAt.getTime()) / 60000);

  return (
    <Card className="cursor-move hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{order.customerName}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Phone className="h-3 w-3" />
              <span>{order.customerPhone}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{timeElapsed} min</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span className="text-muted-foreground">
                R$ {(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="pt-2 border-t border-border">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-primary">R$ {order.total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
