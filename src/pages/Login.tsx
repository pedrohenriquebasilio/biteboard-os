import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { login } from "@/lib/api";
import { LoginResponse } from "@/lib/types";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔷 [Login] Form submitted');
    console.log('🔷 [Login] Email:', email);
    
    if (!email || !password) {
      console.log('🔴 [Login] Validation failed: missing fields');
      toast({
        title: "Erro no login",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('🔷 [Login] Starting login request...');

    const response = await login(email, password);
    
    console.log('🔷 [Login] Response received:', response);
    
    if (response.error) {
      console.error('🔴 [Login] Error:', response.error);
      toast({
        title: "Erro no login",
        description: response.error,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (response.data) {
      const data = response.data as LoginResponse;
      console.log('🟢 [Login] Success! Token:', data.accessToken?.substring(0, 20) + '...');
      console.log('🟢 [Login] Restaurant:', data.restaurant);
      
      localStorage.setItem("auth_token", data.accessToken);
      localStorage.setItem("tenant_id", data.restaurant.id);
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard...",
      });
      
      console.log('🟢 [Login] Navigating to dashboard...');
      navigate("/dashboard");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md rounded-2xl shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <UtensilsCrossed className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-unbounded">Takeaway</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
