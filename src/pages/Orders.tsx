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
import { Order, MenuItem } from "@/lib/types";
import { OrderCard } from "@/components/Orders/OrderCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/Loading";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { getOrders, createOrder, updateOrderStatus, deleteOrder, getMenuItems } from "@/lib/api";

type OrderStatus = "NEW" | "PREPARING" | "READY" | "DELIVERED";

interface OrderItem {
  menuItemId: string;
  quantity: number;
  notes?: string;
}

const statusColumns: { id: OrderStatus; title: string; color: string }[] = [
  { id: "NEW", title: "Novos", color: "border-blue-500" },
  { id: "PREPARING", title: "Em Preparo", color: "border-yellow-500" },
  { id: "READY", title: "Prontos", color: "border-green-500" },
  { id: "DELIVERED", title: "Entregues", color: "border-gray-500" },
];

function SortableOrderCard({ order, onDelete }: { order: Order; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: order.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group">
      <OrderCard order={order} />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(order.id)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
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
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [pendingMove, setPendingMove] = useState<{
    orderId: string;
    newStatus: OrderStatus;
    order: Order;
  } | null>(null);
  const [isMovingOrder, setIsMovingOrder] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState({
    customerName: "",
    customerPhone: "",
    items: [] as OrderItem[],
  });
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  useEffect(() => {
    fetchOrders();
    fetchMenuItems();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    const response = await getOrders();
    
    if (response.error) {
      toast({
        title: "Erro ao carregar pedidos",
        description: response.error,
        variant: "destructive",
      });
      setOrders([]);
    } else if (response.data) {
      setOrders(response.data as Order[]);
    }
    setIsLoading(false);
  };

  const fetchMenuItems = async () => {
    const response = await getMenuItems();
    
    if (response.error) {
      console.error("Erro ao carregar itens do menu:", response.error);
    } else if (response.data) {
      setMenuItems((response.data as MenuItem[]).filter(item => item.available));
    }
  };

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

    setIsMovingOrder(true);
    const { orderId, newStatus, order } = pendingMove;

    const response = await updateOrderStatus(orderId, newStatus);
    
    if (response.error) {
      toast({
        title: "Não foi possível atualizar",
        description: response.error,
        variant: "destructive",
      });
      setIsMovingOrder(false);
      setPendingMove(null);
      return;
    }

    const updatedOrders = orders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    setOrders(updatedOrders);

    toast({
      title: "Status atualizado!",
      description: `Pedido de ${order.customerName} movido para ${statusColumns.find((s) => s.id === newStatus)?.title}.`,
    });

    setIsMovingOrder(false);
    setPendingMove(null);
  };

  const cancelMove = () => {
    setPendingMove(null);
  };

  const handleAddItem = () => {
    if (!selectedItemId || selectedQuantity < 1) {
      toast({
        title: "Erro",
        description: "Selecione um item e defina a quantidade.",
        variant: "destructive",
      });
      return;
    }

    setNewOrderForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { menuItemId: selectedItemId, quantity: selectedQuantity },
      ]
    }));

    setSelectedItemId("");
    setSelectedQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setNewOrderForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleCreateOrder = async () => {
    if (!newOrderForm.customerName || !newOrderForm.customerPhone || newOrderForm.items.length === 0) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const response = await createOrder({
      customerName: newOrderForm.customerName,
      customerPhone: newOrderForm.customerPhone,
      items: newOrderForm.items,
    });

    if (response.error) {
      toast({
        title: "Não foi possível criar pedido",
        description: response.error,
        variant: "destructive",
      });
      return;
    }

    const newOrder = response.data as Order;
    setOrders([newOrder, ...orders]);
    
    setNewOrderForm({
      customerName: "",
      customerPhone: "",
      items: [],
    });
    setIsCreateDialogOpen(false);

    toast({
      title: "Pedido criado!",
      description: `Pedido de ${newOrder.customerName} foi criado com sucesso.`,
    });
  };

  const handleDeleteOrder = async (orderId: string) => {
    const response = await deleteOrder(orderId);
    
    if (response.error) {
      toast({
        title: "Não foi possível remover",
        description: response.error,
        variant: "destructive",
      });
      return;
    }

    setOrders(orders.filter(o => o.id !== orderId));
    toast({
      title: "Pedido removido",
      description: "O pedido foi removido do sistema.",
    });
  };

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter((order) => order.status === status);
  };

  const getItemName = (menuItemId: string) => {
    return menuItems.find(item => item.id === menuItemId)?.name || "Item desconhecido";
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-4">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h1 className="text-2xl font-bold">Gerenciar Pedidos</h1>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Pedido
                  </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Pedido</DialogTitle>
                <DialogDescription>
                  Adicione um novo pedido ao sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Nome do Cliente *</Label>
                  <Input
                    id="customerName"
                    placeholder="Ex: João Silva"
                    value={newOrderForm.customerName}
                    onChange={(e) => setNewOrderForm({...newOrderForm, customerName: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Telefone do Cliente *</Label>
                  <Input
                    id="customerPhone"
                    placeholder="Ex: 31988887777"
                    value={newOrderForm.customerPhone}
                    onChange={(e) => setNewOrderForm({...newOrderForm, customerPhone: e.target.value})}
                  />
                </div>

                <div className="space-y-3 border-t pt-4">
                  <Label className="text-base font-semibold">Itens do Pedido *</Label>
                  
                  {newOrderForm.items.length > 0 && (
                    <div className="space-y-2">
                      {newOrderForm.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded border border-border bg-accent/50">
                          <span className="text-sm">
                            {item.quantity}x {getItemName(item.menuItemId)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2 p-3 rounded border border-dashed border-border bg-muted/30">
                    <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um item" />
                      </SelectTrigger>
                      <SelectContent>
                        {menuItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} - € {item.priceCurrent.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={selectedQuantity}
                        onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                        placeholder="Qtd"
                        className="flex-1"
                      />
                      <Button onClick={handleAddItem} variant="outline" className="flex-1">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateOrder}>Criar Pedido</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

            <p className="text-sm text-muted-foreground">
              Arraste os pedidos entre as colunas para atualizar o status
            </p>

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
                          <SortableOrderCard 
                            key={order.id} 
                            order={order}
                        onDelete={handleDeleteOrder}
                          />
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
          </>
        )}
      </div>

      <DragOverlay>
        {activeOrder ? <OrderCard order={activeOrder} /> : null}
      </DragOverlay>

      <AlertDialog open={!!pendingMove} onOpenChange={(open) => !open && !isMovingOrder && cancelMove()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar mudança de status</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente confirmar o pedido para "{statusColumns.find((s) => s.id === pendingMove?.newStatus)?.title}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelMove} disabled={isMovingOrder}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmMove} 
              disabled={isMovingOrder}
              className="gap-2"
            >
              {isMovingOrder && (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isMovingOrder ? 'Confirmando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DndContext>
  );
}
