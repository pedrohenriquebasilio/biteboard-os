import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Order } from "@/lib/types";
import { OrderCard } from "@/components/Orders/OrderCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import { getOrders, updateOrderStatus } from "@/lib/api";

type OrderStatus = "new" | "preparing" | "ready" | "delivered";

const statusColumns: { id: OrderStatus; title: string; color: string }[] = [
  { id: "new", title: "Novos", color: "border-blue-500" },
  { id: "preparing", title: "Em Preparo", color: "border-yellow-500" },
  { id: "ready", title: "Prontos", color: "border-green-500" },
  { id: "delivered", title: "Entregues", color: "border-gray-500" },
];

function SortableOrderCard({ order }: { order: Order }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: order.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <OrderCard order={order} />
    </div>
  );
}

function DroppableColumn({ 
  column, 
  children 
}: { 
  column: { id: OrderStatus; title: string; color: string };
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <Card ref={setNodeRef} className={`border-t-4 ${column.color}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          {column.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [pendingMove, setPendingMove] = useState<{
    orderId: string;
    newStatus: OrderStatus;
    order: Order;
  } | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const response = await getOrders();
      
      if (response.error) {
        toast({
          title: "Erro ao carregar pedidos",
          description: "Não foi possível conectar à API. Tente novamente mais tarde.",
          variant: "destructive",
        });
        setOrders([]);
      } else if (response.data) {
        setOrders(response.data as Order[]);
      }
    };

    fetchOrders();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const order = orders.find((o) => o.id === event.active.id);
    setActiveOrder(order || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveOrder(null);

    if (!over) return;

    const orderId = active.id as string;
    
    let newStatus: OrderStatus | null = null;
    
    if (statusColumns.some(col => col.id === over.id)) {
      newStatus = over.id as OrderStatus;
    } else {
      const targetOrder = orders.find((o) => o.id === over.id);
      if (targetOrder) {
        newStatus = targetOrder.status;
      }
    }

    if (!newStatus) return;

    const order = orders.find((o) => o.id === orderId);
    if (!order || order.status === newStatus) return;

    setPendingMove({ orderId, newStatus, order });
  };

  const confirmMove = async () => {
    if (!pendingMove) return;

    const { orderId, newStatus, order } = pendingMove;

    const response = await updateOrderStatus(orderId, newStatus);
    
    if (response.error) {
      toast({
        title: "Não foi possível atualizar",
        description: "API não disponível. Tente novamente mais tarde.",
        variant: "destructive",
      });
      setPendingMove(null);
      return;
    }

    const updatedOrders = orders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date() } : o
    );
    setOrders(updatedOrders);

    toast({
      title: "Status atualizado!",
      description: `Pedido de ${order.customerName} movido para ${statusColumns.find((s) => s.id === newStatus)?.title}.`,
    });

    setPendingMove(null);
  };

  const cancelMove = () => {
    setPendingMove(null);
  };

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter((order) => order.status === status);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Gerenciar Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            Arraste os pedidos entre as colunas para atualizar o status
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusColumns.map((column) => {
            const columnOrders = getOrdersByStatus(column.id);
            return (
              <DroppableColumn key={column.id} column={column}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-normal text-muted-foreground">
                    {columnOrders.length} {columnOrders.length === 1 ? 'pedido' : 'pedidos'}
                  </span>
                </div>
                <SortableContext
                  items={columnOrders.map((o) => o.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3 min-h-[400px]">
                    {columnOrders.map((order) => (
                      <SortableOrderCard key={order.id} order={order} />
                    ))}
                    {columnOrders.length === 0 && (
                      <div className="flex items-center justify-center h-40 text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg">
                        Nenhum pedido
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DroppableColumn>
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {activeOrder ? <OrderCard order={activeOrder} /> : null}
      </DragOverlay>

      <AlertDialog open={!!pendingMove} onOpenChange={(open) => !open && cancelMove()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar mudança de status</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente confirmar o pedido para "{statusColumns.find((s) => s.id === pendingMove?.newStatus)?.title}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelMove}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMove}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DndContext>
  );
}
