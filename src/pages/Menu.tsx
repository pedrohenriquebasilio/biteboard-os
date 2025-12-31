import { useState, useEffect } from "react";
import { MenuItem } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/Loading";
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
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from "@/lib/api";

const categories = ["Pizzas", "Hambúrgueres", "Saladas", "Japonês", "Acompanhamentos", "Bebidas"];

export default function Menu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: "",
    description: "",
    priceReal: 0,
    priceCurrent: 0,
    category: "",
    image: "",
    available: true,
  });

  useEffect(() => {
    const fetchMenuItems = async () => {
      setIsLoading(true);
      const response = await getMenuItems();
      
      if (response.error) {
        toast({
          title: "Erro ao carregar menu",
          description: "Não foi possível conectar à API. Tente novamente mais tarde.",
          variant: "destructive",
        });
        setMenuItems([]);
      } else if (response.data) {
        setMenuItems(response.data as MenuItem[]);
      }
      setIsLoading(false);
    };

    fetchMenuItems();
  }, []);

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        priceReal: 0,
        priceCurrent: 0,
        category: "",
        image: "",
        available: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category || !formData.priceReal) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios (Nome, Categoria, Preço).",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      priceReal: formData.priceReal,
      category: formData.category,
      image: formData.image || undefined,
      available: formData.available ?? true,
    };

    if (editingItem) {
      const response = await updateMenuItem(editingItem.id, payload);
      
      if (response.error) {
        toast({
          title: "Não foi possível atualizar",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      setMenuItems(
        menuItems.map((item) =>
          item.id === editingItem.id ? { ...item, ...formData } : item
        )
      );
        toast({
          title: "Item atualizado!",
          description: "O item do menu foi atualizado com sucesso.",
        });
    } else {
      const response = await createMenuItem(payload);
      
      if (response.error) {
        toast({
          title: "Não foi possível criar",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      const newItem = response.data as MenuItem;
      setMenuItems([...menuItems, newItem]);
        toast({
          title: "Item criado!",
          description: "O novo item foi adicionado ao menu.",
        });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    const response = await deleteMenuItem(id);
    
    if (response.error) {
      toast({
        title: "Não foi possível remover",
        description: response.error,
        variant: "destructive",
      });
      return;
    }

    setMenuItems(menuItems.filter((item) => item.id !== id));
        toast({
          title: "Item removido",
          description: "O item foi removido do menu.",
        });
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const hasDiscount = (item: MenuItem) => {
    const priceCurrent = item.priceCurrent ?? 0;
    const priceReal = item.priceReal ?? 0;
    return priceCurrent < priceReal && priceReal > 0;
  };
  const discountPercent = (item: MenuItem) => {
    if (!hasDiscount(item)) return 0;
    const priceReal = item.priceReal ?? 0;
    const priceCurrent = item.priceCurrent ?? 0;
    return Math.round(((priceReal - priceCurrent) / priceReal) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Menu</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Editar Item" : "Novo Item"}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Atualize as informações do item do menu."
                  : "Adicione um novo item ao menu."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Pizza Margherita"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descrição detalhada do item..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceReal">Preço Real (€) *</Label>
                  <Input
                    id="priceReal"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="39.90"
                    value={formData.priceReal}
                    onChange={(e) =>
                      setFormData({ ...formData, priceReal: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">URL da Imagem</Label>
                <div className="flex gap-2">
                  <Input
                    id="image"
                    type="url"
                    placeholder="https://..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                  {formData.image && (
                    <a
                      href={formData.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center"
                    >
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="available">Disponível</Label>
                <Switch
                  id="available"
                  checked={formData.available ?? true}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, available: checked })
                  }
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : Object.keys(groupedItems).length > 0 ? (
        <div className="grid gap-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <Card key={category} className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col p-4 rounded-xl border border-border hover:bg-accent/50 transition-all duration-300 hover:shadow-lg hover:rounded-2xl hover:scale-[1.02]"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-medium text-sm">{item.name}</h3>
                          {!item.available && (
                            <span className="px-2 py-0.5 text-xs bg-destructive/10 text-destructive rounded-full whitespace-nowrap">
                              Indisponível
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                        <div>
                          {hasDiscount(item) ? (
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground line-through">
                                € {(item.priceReal ?? 0).toFixed(2)}
                              </span>
                              <span className="font-semibold text-primary">
                                € {(item.priceCurrent ?? 0).toFixed(2)}
                              </span>
                              <span className="text-xs text-green-600 font-medium">
                                -{discountPercent(item)}%
                              </span>
                            </div>
                          ) : (
                            <span className="font-semibold text-lg">
                              € {(item.priceReal ?? 0).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(item)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum item no menu. Clique em "Novo Item" para adicionar.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
