import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Loader, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '¡Hola! Soy tu asistente de IA especializado en trading de commodities. Puedo ayudarte con análisis de mercado, cálculos de liquidaciones, interpretación de ensayos, gestión de contratos y cualquier consulta sobre el sistema. ¿En qué puedo asistirte hoy?',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simular respuesta de ChatGPT - En producción, aquí iría la llamada real a la API
      const response = await simulateGPTResponse(inputMessage);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Lo siento, ha ocurrido un error al procesar tu consulta. Por favor, intenta nuevamente.',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateGPTResponse = async (message: string): Promise<string> => {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerMessage = message.toLowerCase();

    // Respuestas contextuales para commodities
    if (lowerMessage.includes('cobre') || lowerMessage.includes('copper')) {
      return `Sobre el cobre: El cobre es uno de los metales más importantes en el trading de commodities. Actualmente, los precios están influenciados por la demanda de infraestructura y vehículos eléctricos. Para contratos de concentrado de cobre, es importante considerar:

• **Leyes típicas**: 20-35% Cu
• **Elementos pagables**: Cu, Au, Ag
• **Penalizables**: As, Sb, Bi, Hg
• **Fórmulas de precio**: Generalmente LME Cu M+1 menos deducciones de tratamiento

¿Te gustaría información específica sobre algún aspecto del trading de cobre?`;
    }

    if (lowerMessage.includes('liquidación') || lowerMessage.includes('settlement')) {
      return `Para las liquidaciones de concentrados, el proceso típico incluye:

**Liquidación Provisional:**
• Basada en pesos y leyes del vendedor
• Pago del 85-90% del valor estimado
• Plazo: 30-45 días después del embarque

**Liquidación Final:**
• Basada en pesos y leyes finales (comprador o árbitro)
• Ajuste de diferencias vs. provisional
• Plazo: 90-120 días después del embarque

**Elementos clave:**
• Deducciones por tratamiento y refinación
• Escaladores por impurezas
• Ajustes por humedad y mermas

¿Necesitas ayuda con algún cálculo específico?`;
    }

    if (lowerMessage.includes('ensayo') || lowerMessage.includes('assay')) {
      return `Los ensayos son fundamentales en el trading de concentrados:

**Tipos de ensayos:**
• **Ensayo del vendedor**: Base para liquidación provisional
• **Ensayo del comprador**: Para liquidación final
• **Ensayo árbitro**: En caso de disputas (diferencia >5%)

**Elementos típicos analizados:**
• **Pagables**: Cu, Au, Ag, Pb, Zn
• **Penalizables**: As, Sb, Bi, Hg, Cd, F, Cl
• **Otros**: S, SiO2, Al2O3, Fe, humedad

**Laboratorios reconocidos:**
• SGS, ALS, Alex Stewart, Bureau Veritas

¿Tienes alguna consulta específica sobre interpretación de resultados?`;
    }

    if (lowerMessage.includes('contrato') || lowerMessage.includes('contract')) {
      return `Para la gestión de contratos de commodities, considera estos elementos clave:

**Términos comerciales:**
• Cantidad y tolerancia (±5-10%)
• Especificaciones de calidad (min/max por elemento)
• Período de entrega
• Incoterms (CIF, FOB, etc.)

**Pricing:**
• Fijo: Precio determinado al momento del contrato
• Fórmula: Basado en cotizaciones (LME, COMEX, etc.)
• Período de cotización (M, M+1, M+2)

**Documentación requerida:**
• Certificado de peso y análisis
• Bill of Lading
• Certificado de origen
• Factura comercial

¿Necesitas ayuda con algún aspecto específico de tu contrato?`;
    }

    if (lowerMessage.includes('precio') || lowerMessage.includes('price') || lowerMessage.includes('mercado')) {
      return `Análisis de mercado para commodities:

**Factores que afectan precios:**
• Oferta y demanda global
• Inventarios en bolsas (LME, COMEX)
• Situación geopolítica
• Costos de energía y transporte
• Políticas gubernamentales

**Herramientas de análisis:**
• Gráficos de precios históricos
• Curvas de futuros (contango/backwardation)
• Ratios de tratamiento (TC/RC)
• Primas/descuentos regionales

**Gestión de riesgo:**
• Coberturas con futuros
• Opciones para protección
• Diversificación de contrapartes

¿Te interesa información sobre algún metal específico o estrategia de cobertura?`;
    }

    // Respuesta genérica
    return `Entiendo tu consulta sobre "${message}". Como asistente especializado en trading de commodities, puedo ayudarte con:

• **Análisis de mercado** y tendencias de precios
• **Cálculos de liquidaciones** y valoraciones
• **Interpretación de ensayos** y especificaciones técnicas
• **Gestión de contratos** y términos comerciales
• **Logística y transporte** de materiales
• **Gestión de riesgo** y coberturas
• **Uso del sistema** Commodity Trade Core

¿Podrías ser más específico sobre qué aspecto te interesa? Así podré brindarte información más detallada y útil.`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const quickPrompts = [
    "¿Cómo calcular una liquidación de concentrado de cobre?",
    "Explícame los elementos pagables y penalizables",
    "¿Cuáles son las tendencias actuales del mercado?",
    "¿Cómo interpretar un certificado de análisis?",
    "Ayúdame con los términos de un contrato FOB"
  ];

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <MessageCircle className="w-7 h-7 mr-3 text-blue-600" />
            Asistente IA para Commodities
          </h1>
          <p className="text-gray-600 mt-1">Consulta especializada en trading y gestión de commodities</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">En línea</span>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Consultas frecuentes:</p>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(prompt)}
              className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-3xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                </div>
                <div className={`rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className={`text-xs ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    {message.role === 'assistant' && (
                      <div className="flex items-center space-x-1 ml-4">
                        <button
                          onClick={() => copyMessage(message.content)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copiar mensaje"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Útil"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="No útil"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <Loader className="w-4 h-4 animate-spin text-gray-500" />
                    <span className="text-gray-500">Analizando tu consulta...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu consulta sobre commodities, contratos, análisis de mercado..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '120px' }}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Presiona Enter para enviar, Shift+Enter para nueva línea
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;