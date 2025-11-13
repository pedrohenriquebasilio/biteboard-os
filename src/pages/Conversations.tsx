import { useState, useEffect } from "react";
import { Conversation, Message } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Phone } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getConversations, getConversationMessages, sendMessage } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function Conversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchConversations = async () => {
      const response = await getConversations('active');
      
      if (response.error) {
        toast({
          title: "Erro ao carregar conversas",
          description: "Não foi possível conectar à API. Tente novamente mais tarde.",
          variant: "destructive",
        });
        setConversations([]);
      } else if (response.data) {
        setConversations(response.data as Conversation[]);
      }
    };

    fetchConversations();
  }, []);

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    
    const response = await getConversationMessages(conversation.customerPhone);
    
    if (response.error) {
      toast({
        title: "Erro ao carregar mensagens",
        description: "Não foi possível conectar à API. Tente novamente mais tarde.",
        variant: "destructive",
      });
      setMessages([]);
    } else if (response.data) {
      setMessages(response.data as Message[]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const response = await sendMessage(selectedConversation.customerPhone, newMessage);
    
    if (response.error) {
      toast({
        title: "Não foi possível enviar mensagem",
        description: "API não disponível. Tente novamente mais tarde.",
        variant: "destructive",
      });
      return;
    }

    const message: Message = (response.data as Message) || {
      id: Date.now().toString(),
      conversationId: selectedConversation.id,
      text: newMessage,
      sender: "restaurant",
      timestamp: new Date(),
      status: "sent",
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-8rem)]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Conversas Ativas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-1 p-4">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg transition-colors",
                    selectedConversation?.id === conversation.id
                      ? "bg-primary/10 border-2 border-primary"
                      : "hover:bg-accent border-2 border-transparent"
                  )}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium">{conversation.customerName}</p>
                    {conversation.unreadCount > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    <Phone className="h-3 w-3" />
                    <span>{conversation.customerPhone}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {conversation.lastMessage}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTime(conversation.lastMessageTime)}
                  </p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="lg:col-span-2">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b border-border">
              <div>
                <CardTitle>{selectedConversation.customerName}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedConversation.customerPhone}
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex flex-col h-[calc(100vh-16rem)]">
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.sender === "restaurant" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-lg px-4 py-2",
                          message.sender === "restaurant"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        )}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p
                          className={cn(
                            "text-xs mt-1",
                            message.sender === "restaurant"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          )}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              Selecione uma conversa para visualizar as mensagens
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
