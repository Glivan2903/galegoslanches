import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Package2 } from "lucide-react";

interface OrderConfirmationProps {
  orderNumber: string;
  estimatedTime?: string;
  onSendToWhatsApp?: () => void;
  onTrackOrder?: () => void;
  onClose: () => void;
  pixKey?: string | null;
  paymentMethodName?: string;
}

export function OrderConfirmation({
  orderNumber,
  estimatedTime = "30-45 minutos",
  onSendToWhatsApp,
  onTrackOrder,
  onClose,
  pixKey,
  paymentMethodName,
}: OrderConfirmationProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyPix = () => {
    if (pixKey) {
      navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full py-8 px-4">
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold mb-2">Seu pedido foi confirmado!</h2>
        <div className="bg-green-50 rounded-lg p-6 mb-4">
          <h3 className="text-lg font-medium mb-1">Número do Pedido:</h3>
          <p className="text-3xl md:text-4xl font-bold text-green-600 mb-1">
            {orderNumber}
          </p>
        </div>
      </div>

      <div className="w-full max-w-md space-y-4">
        <div className="border rounded-md p-4 border-dashed border-gray-300 text-center">
          <p className="text-gray-600">
            Obrigado pelo seu pedido! Você receberá atualizações sobre o status
            do seu pedido.
          </p>
        </div>

        {pixKey && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="text-center">
              <h4 className="font-semibold text-gray-900">Pagamento via PIX</h4>
              <p className="text-sm text-gray-500 mb-2">
                Use a chave abaixo para realizar o pagamento:
              </p>
            </div>

            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white border border-gray-200 rounded px-3 py-2 text-sm font-mono break-all">
                {pixKey}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPix}
                className={copied ? "text-green-600 border-green-600" : ""}
              >
                {copied ? "Copiado!" : "Copiar"}
              </Button>
            </div>

            <div className="text-xs text-center text-gray-500">
              Após realizar o pagamento, envie o comprovante pelo WhatsApp.
            </div>
          </div>
        )}

        <div className="space-y-3">
          {onSendToWhatsApp && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={onSendToWhatsApp}
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Enviar pedido no WhatsApp
            </Button>
          )}

          {onTrackOrder && (
            <Button
              className="w-full bg-delivery-500 hover:bg-delivery-600"
              onClick={onTrackOrder}
            >
              <Package2 className="mr-2 h-5 w-5" />
              Acompanhar Pedido
            </Button>
          )}

          <Button variant="outline" className="w-full" onClick={onClose}>
            Fazer novo pedido
          </Button>
        </div>
      </div>
    </div>
  );
}
