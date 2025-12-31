import { useState, useEffect } from "react";
import { Promotion, MenuItem } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2, TrendingDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  getPromotions, 
  getMenuItems, 
  createPromotion, 
  updatePromotion, 
  deletePromotion 
} from "@/lib/api";

export default function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [deletePromoId, setDeletePromoId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Promotion>>({
    menuItemId: "",
    priceCurrent: 0,
    validFrom: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchPromotions();
    fetchMenuItems();
  }, []);

  const fetchPromotions = async () => {
    setIsLoading(true);
    const response = await getPromotions();
    
    if (response.error) {
      toast({
        title: "Erro ao carregar promoções",
        description: response.error,
        variant: "destructive",
      });
      setPromotions([]);
    } else if (response.data) {
      setPromotions(response.data as Promotion[]);
    }
    setIsLoading(false);
  };

  const fetchMenuItems = async () => {
    const response = await getMenuItems();
    
    if (response.error) {
      toast({
        title: "Erro ao carregar itens",
        description: response.error,
        variant: "destructive",
      });
      setMenuItems([]);
    } else if (response.data) {
      setMenuItems(response.data as MenuItem[]);
    }
  };

  const handleOpenDialog = (promotion?: Promotion) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setFormData({
        menuItemId: promotion.menuItemId,
        priceCurrent: promotion.priceCurrent,
        validFrom: promotion.validFrom.split("T")[0],
        validUntil: promotion.validUntil.split("T")[0],
      });
    } else {
      setEditingPromotion(null);
      setFormData({
        menuItemId: "",
        priceCurrent: 0,
        validFrom: new Date().toISOString().split("T")[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      });
    }
    setIsDialogOpen(true);
  };

  const getSelectedItem = () => {
    return menuItems.find(item => item.id === formData.menuItemId);
  };

  const validateForm = () => {
    if (!formData.menuItemId) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um item do menu.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.priceCurrent || formData.priceCurrent <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, defina um preço de promoção válido.",
        variant: "destructive",
      });
      return false;
    }

    const selectedItem = getSelectedItem();
    if (selectedItem && formData.priceCurrent >= selectedItem.priceReal) {
      toast({
        title: "Erro",
        description: `O preço de promoção (€ ${formData.priceCurrent.toFixed(2)}) deve ser menor que o preço real (€ ${selectedItem.priceReal.toFixed(2)}).`,
        variant: "destructive",
      });
      return false;
    }

    if (!formData.validFrom || !formData.validUntil) {
      toast({
        title: "Erro",
        description: "Por favor, defina as datas de validade.",
        variant: "destructive",
      });
      return false;
    }

    if (new Date(formData.validFrom) >= new Date(formData.validUntil)) {
      toast({
        title: "Erro",
        description: "A data de início deve ser anterior à data de fim.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const payload = {
      menuItemId: formData.menuItemId!,
      priceCurrent: formData.priceCurrent!,
      validFrom: new Date(formData.validFrom!).toISOString(),
      validUntil: new Date(formData.validUntil!).toISOString(),
    };

    if (editingPromotion) {
      const response = await updatePromotion(editingPromotion.id, {
        priceCurrent: payload.priceCurrent,
        validFrom: payload.validFrom,
        validUntil: payload.validUntil,
      });
      
      if (response.error) {
        toast({
          title: "Não foi possível atualizar",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      setPromotions(
        promotions.map((promo) =>
          promo.id === editingPromotion.id 
            ? { ...promo, ...formData } as Promotion
            : promo
        )
      );
      toast({
        title: "Promoção atualizada!",
        description: "A promoção foi atualizada com sucesso.",
      });
    } else {
      const response = await createPromotion(payload);
      
      if (response.error) {
        toast({
          title: "Não foi possível criar",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      const newPromotion = response.data as Promotion;
      setPromotions([...promotions, newPromotion]);
      toast({
        title: "Promoção criada!",
        description: "A nova promoção foi adicionada ao sistema.",
      });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deletePromoId) return;

    const response = await deletePromotion(deletePromoId);
    
    if (response.error) {
      toast({
        title: "Não foi possível remover",
        description: response.error,
        variant: "destructive",
      });
      setDeletePromoId(null);
      return;
    }

    setPromotions(promotions.filter((promo) => promo.id !== deletePromoId));
    toast({
      title: "Promoção removida",
      description: "A promoção foi removida do sistema e o preço foi restaurado.",
    });
    setDeletePromoId(null);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("pt-BR").format(new Date(dateString));
  };

  const isPromotionActive = (promotion: Promotion) => {
    const now = new Date();
    const start = new Date(promotion.validFrom);
    const end = new Date(promotion.validUntil);
    return now >= start && now <= end;
  };

  const getDiscount = (item: MenuItem | undefined) => {
    if (!item) return 0;
    return ((item.priceReal - formData.priceCurrent!) / item.priceReal) * 100;
  };

  const availableItems = menuItems.filter(item => {
    const hasActivePromo = promotions.some(p => p.menuItemId === item.id && isPromotionActive(p));
    return !hasActivePromo;
  });

  return (
    <div className="space-y-6">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Promoções</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Promoção
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingPromotion ? "Editar Promoção" : "Nova Promoção"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPromotion
                      ? "Atualize os detalhes da promoção."
                      : "Crie uma nova promoção aplicando um desconto a um item do menu."}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="menuItem">Item do Menu *</Label>
                    <Select
                  value={formData.menuItemId || ""}
                  onValueChange={(value) => setFormData({ ...formData, menuItemId: value })}
                  disabled={!!editingPromotion}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um item" />
                  </SelectTrigger>
                  <SelectContent>
                    {(editingPromotion ? menuItems : availableItems).map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} - € {item.priceReal.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {getSelectedItem() && (
                <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{getSelectedItem()?.name}</p>
                    <p className="text-muted-foreground">
                      Preço Real: <span className="font-semibold">€ {getSelectedItem()?.priceReal.toFixed(2)}</span>
                    </p>
                    {formData.priceCurrent && formData.priceCurrent < (getSelectedItem()?.priceReal || 0) && (
                      <>
                        <p className="text-muted-foreground">
                          Preço com Desconto: <span className="font-semibold text-primary">€ {formData.priceCurrent.toFixed(2)}</span>
                        </p>
                        <p className="text-green-600 font-semibold flex items-center gap-1">
                          <TrendingDown className="h-4 w-4" />
                          Desconto: {getDiscount(getSelectedItem()).toFixed(1)}%
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="priceCurrent">Preço com Desconto (€) *</Label>
                <Input
                  id="priceCurrent"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="29.90"
                  value={formData.priceCurrent}
                  onChange={(e) =>
                    setFormData({ ...formData, priceCurrent: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Válido de *</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={formData.validFrom || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, validFrom: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Válido até *</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, validUntil: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingPromotion ? "Atualizar" : "Criar"} Promoção
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {promotions.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promotion) => {
            const item = menuItems.find(i => i.id === promotion.menuItemId);
            const isActive = isPromotionActive(promotion);
            const discount = item ? ((item.priceReal - promotion.priceCurrent) / item.priceReal) * 100 : 0;

            return (
              <Card 
                key={promotion.id} 
                className={`overflow-hidden transition-all ${!isActive ? "opacity-60" : ""}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{item?.name || "Item desconhecido"}</CardTitle>
                      {!isActive && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(promotion.validUntil) < new Date() ? "Expirada" : "Não iniciada"}
                        </p>
                      )}
                    </div>
                    {isActive && (
                      <div className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold flex-shrink-0">
                        Ativa
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-muted-foreground">Preço original</span>
                      <span className="text-sm line-through text-muted-foreground">
                        € {item?.priceReal.toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-muted-foreground">Preço promocional</span>
                      <span className="font-semibold text-lg text-primary">
                        € {promotion.priceCurrent.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-center font-bold text-green-700 text-lg">
                      -{discount.toFixed(1)}%
                    </p>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>De:</span>
                      <span className="font-medium">{formatDate(promotion.validFrom)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Até:</span>
                      <span className="font-medium">{formatDate(promotion.validUntil)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(promotion)}
                      className="flex-1"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletePromoId(promotion.id)}
                      className="flex-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhuma promoção ativa. Clique em "Nova Promoção" para começar.
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deletePromoId} onOpenChange={(open) => !open && setDeletePromoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Promoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover essa promoção? O preço do item será restaurado para o valor original.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletePromoId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        </>
      )}
    </div>
  );
}
