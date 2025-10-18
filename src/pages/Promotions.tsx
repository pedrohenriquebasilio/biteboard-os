import { useState } from "react";
import { mockPromotions, Promotion } from "@/lib/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState<Partial<Promotion>>({
    name: "",
    description: "",
    discount: 0,
    discountType: "percentage",
    validFrom: new Date(),
    validUntil: new Date(),
    active: true,
  });

  const handleOpenDialog = (promotion?: Promotion) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setFormData(promotion);
    } else {
      setEditingPromotion(null);
      setFormData({
        name: "",
        description: "",
        discount: 0,
        discountType: "percentage",
        validFrom: new Date(),
        validUntil: new Date(),
        active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.discount) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (editingPromotion) {
      setPromotions(
        promotions.map((promo) =>
          promo.id === editingPromotion.id ? { ...promo, ...formData } : promo
        )
      );
      toast({
        title: "Promoção atualizada!",
        description: "A promoção foi atualizada com sucesso.",
      });
    } else {
      const newPromotion: Promotion = {
        id: Date.now().toString(),
        ...formData as Promotion,
      };
      setPromotions([...promotions, newPromotion]);
      toast({
        title: "Promoção criada!",
        description: "A nova promoção foi adicionada.",
      });
    }

    setIsDialogOpen(false);

    // TODO: API call
  };

  const handleToggle = (id: string) => {
    setPromotions(
      promotions.map((promo) =>
        promo.id === id ? { ...promo, active: !promo.active } : promo
      )
    );

    const promo = promotions.find((p) => p.id === id);
    toast({
      title: promo?.active ? "Promoção desativada" : "Promoção ativada",
      description: promo?.active
        ? "A promoção foi congelada e não será mais oferecida."
        : "A promoção foi ativada e está disponível.",
    });

    // TODO: API call
  };

  const handleDelete = (id: string) => {
    setPromotions(promotions.filter((promo) => promo.id !== id));
    toast({
      title: "Promoção removida",
      description: "A promoção foi removida do sistema.",
    });

    // TODO: API call
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR").format(date);
  };

  const isExpired = (date: Date) => {
    return date < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Promoções</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Promoção
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPromotion ? "Editar Promoção" : "Nova Promoção"}
              </DialogTitle>
              <DialogDescription>
                {editingPromotion
                  ? "Atualize as informações da promoção."
                  : "Crie uma nova promoção para seus clientes."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount">Desconto *</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountType">Tipo</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value: "percentage" | "fixed") =>
                      setFormData({ ...formData, discountType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                      <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Válido de</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={
                      formData.validFrom
                        ? new Date(formData.validFrom).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, validFrom: new Date(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Válido até</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={
                      formData.validUntil
                        ? new Date(formData.validUntil).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, validUntil: new Date(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Ativa</Label>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {promotions.map((promotion) => {
          const expired = isExpired(promotion.validUntil);
          return (
            <Card key={promotion.id} className={expired ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{promotion.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {promotion.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(promotion)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(promotion.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    {promotion.discountType === "percentage"
                      ? `${promotion.discount}%`
                      : `R$ ${promotion.discount.toFixed(2)}`}
                  </span>
                  <Switch
                    checked={promotion.active}
                    onCheckedChange={() => handleToggle(promotion.id)}
                    disabled={expired}
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(promotion.validFrom)} até {formatDate(promotion.validUntil)}
                  </span>
                </div>
                <div className="flex gap-2">
                  {promotion.active && !expired && (
                    <span className="px-2 py-1 text-xs bg-green-500/10 text-green-600 border border-green-500/20 rounded-full">
                      Ativa
                    </span>
                  )}
                  {!promotion.active && (
                    <span className="px-2 py-1 text-xs bg-gray-500/10 text-gray-600 border border-gray-500/20 rounded-full">
                      Congelada
                    </span>
                  )}
                  {expired && (
                    <span className="px-2 py-1 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-full">
                      Expirada
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
