import { useRef, useState } from "react";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Send, TrendingUp, BarChart3, AlertCircle } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: string;
}

interface Suggestion {
  id: string;
  question: string;
  icon: string;
  category: string;
}

const SUGGESTIONS: Suggestion[] = [
  {
    id: "1",
    question: "Si nous recrutons un joueur à 2M DT, quel sera le budget restant?",
    icon: "👤",
    category: "Recrutement",
  },
  {
    id: "2",
    question: "Quel sponsor rapporte le plus cet mois?",
    icon: "🤝",
    category: "Sponsors",
  },
  {
    id: "3",
    question: "Prévoir les dépenses des 6 prochains mois",
    icon: "📊",
    category: "Prévisions",
  },
  {
    id: "4",
    question: "Quelle est la catégorie de dépense la plus importante?",
    icon: "💰",
    category: "Analyse",
  },
  {
    id: "5",
    question: "Comparaison: budget réel vs budget prévu",
    icon: "📈",
    category: "Analyse",
  },
  {
    id: "6",
    question: "Recommandations pour optimiser les dépenses",
    icon: "⚡",
    category: "Optimisation",
  },
];

const IA_STATS = [
  { label: "Analyses réalisées", value: "24", icon: BarChart3, color: "#3B82F6" },
  { label: "Questions suggérées", value: "6", icon: TrendingUp, color: "#10B981" },
  { label: "Réponses générées", value: "18", icon: AlertCircle, color: "#F59E0B" },
];

export function FinanceAIPage() {
  const initialTimestamp = new Date().toLocaleTimeString();
  const messageCounter = useRef(1);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: "Bonjour! 👋 Je suis l'Assistant IA Finance de FC Carthage. Je peux vous aider à:\n\n✅ Analyser les données financières\n✅ Prédire les tendances budgétaires\n✅ Répondre à vos questions financières\n✅ Fournir des recommandations\n\nPosez-moi une question sur le budget, les dépenses, les sponsors ou les prévisions!",
      timestamp: initialTimestamp,
    },
  ]);

  const [input, setInput] = useState("");

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const exportReport = () => {
    const reportHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Rapport IA</title></head><body><h1>Rapport IA - ${new Date().toLocaleString()}</h1>${messages.map(m => `<div style="margin-bottom:12px;"><strong>${m.type === 'user' ? 'Question' : 'Réponse'}</strong><div>${m.content.replace(/\n/g,'<br/>')}</div><div style="color:#666;font-size:12px;">${m.timestamp}</div></div>`).join('')}<script>setTimeout(()=>window.print(),300);</script></body></html>`;
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(reportHtml);
      w.document.close();
      w.focus();
    }
  };

  const handleSendMessage = (message?: string) => {
    const text = message || input;
    if (!text.trim()) return;

    const id = messageCounter.current;
    const userMessage: Message = {
      id: `user-${id}`,
      type: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setTimeout(() => {
      const aiResponse: Message = {
        id: `ai-${id}`,
        type: "ai",
        content: generateAIResponse(text),
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 800);

    messageCounter.current = messageCounter.current + 1;
    setInput("");
  };

  const generateAIResponse = (question: string): string => {
    const q = question.toLowerCase();

    if (q.includes("recrut") && q.includes("2m")) {
      return `D'après notre analyse financière:\n\n📊 Situation Actuelle:\n• Budget Total: 12.5M DT\n• Budget Utilisé: 8.3M DT\n• Budget Restant: 4.2M DT\n\n✅ Si vous recruitez un joueur à 2M DT:\n• Nouveau Budget Restant: 2.2M DT (52%)\n• Impact: Réduction de 47.6%\n\n⚠️ Recommandation:\nCette dépense reste acceptable. Vous auriez encore un buffer de 2.2M DT pour:\n- Imprévus (500K)\n- Autres transferts (1.5M)\n- Opérations courantes\n\n💡 Conseil: Vérifier les alternatives moins coûteuses pour optimiser le budget.`;
    }

    if (q.includes("sponsor") && q.includes("rapporte")) {
      return `🏆 Analyse des Sponsors - Juin 2026:\n\n1️⃣ Nike: 450K DT (35%)\n   └─ Contrat: 2 ans (actif)\n   └─ Trend: ↑ +12%\n\n2️⃣ Emirates: 350K DT (27%)\n   └─ Contrat: 3 ans (actif)\n   └─ Trend: Stable\n\n3️⃣ Ooredoo: 280K DT (22%)\n   └─ Contrat: 1 an (expire bientôt)\n   └─ Trend: À renouveler\n\n4️⃣ STEG: 200K DT (16%)\n   └─ Contrat: 2 ans (actif)\n   └─ Trend: ↑ +5%\n\n💰 Total Sponsors: 1.28M DT/an\n\n🎯 Action: Préparer renouvellement Ooredoo (30 jours).`;
    }

    if (q.includes("dépense") && q.includes("6")) {
      return `📈 Prévision des Dépenses - 6 Prochains Mois:\n\nJuillet: 650K DT\nAoût: 700K DT\nSeptembre: 720K DT\nOctobre: 750K DT\nNovembre: 800K DT\nDécembre: 900K DT\n\n📊 Total Prévisionnel: 4.52M DT\n\nRépartition Estimée:\n• Salaires: 2.70M DT (60%)\n• Infrastructure: 900K DT (20%)\n• Transferts: 600K DT (13%)\n• Divers: 320K DT (7%)\n\n⚠️ Augmentation Décembre (fêtes):\nBudget supplémentaire recommandé: 200K DT`;
    }

    if (q.includes("catégorie") && q.includes("dépense")) {
      return `💼 Analyse par Catégorie de Dépense:\n\n🥇 Infrastructure: 250K DT (36%)\n   └─ Rénovation vestiaires en cours\n\n🥈 Transport: 14.7K DT (2%)\n   └─ Déplacements match\n\n🥉 Équipements: 57K DT (8%)\n   └─ Maillots, ballons\n\n🏥 Médical: 35K DT (5%)\n   └─ Équipement kiné\n\n🏨 Hébergement: 125K DT (18%)\n   └─ Stage été\n\n📦 Autres: 300K DT (31%)\n\n💡 Opportunité: Réduire Hébergement de 15% = Économies 18K DT`;
    }

    if (q.includes("optimis")) {
      return `⚡ Recommandations d'Optimisation Budgétaire:\n\n1. 🔄 Renégocier contrats fournisseurs\n   └─ Impact potentiel: +50K DT/mois\n\n2. 🏨 Négocier tarifs hébergement stage\n   └─ Impact potentiel: +30K DT/mois\n\n3. 🚗 Optimiser trajets transport\n   └─ Impact potentiel: +5K DT/mois\n\n4. ⚽ Acheter équipement en vrac\n   └─ Impact potentiel: +10K DT/mois\n\n5. 🤝 Diversifier revenus sponsors\n   └─ Impact potentiel: +200K DT/an\n\n💰 Économies Totales Estimées: 85K DT/mois\n📊 Augmentation Annualisée: 1.02M DT\n\n✅ Priorité: Négociation sponsors + hébergement`;
    }

    // Default response
    return `Je suis en train d'analyser votre question...\n\n📊 Pour "${question}":\n\n✅ Analyse en cours basée sur:\n• Données financières historiques\n• Prévisions budgétaires\n• Performances actuelles\n\nVoici les données pertinentes pour cette période.\n\n💡 Conseil: Consultez les rapports détaillés pour plus d'informations.`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            🤖 Finance IA Assistant
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Assistant intelligent pour vos questions financières (PFE Bonus 🚀)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={exportReport}>Exporter Rapport IA</Button>
        </div>
      </div>

      {/* Chat Area */}
      <GlassCard raised className="flex flex-col p-6" style={{ height: "500px" }}>
        {/* Messages */}
        <div className="mb-4 flex-1 space-y-4 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-xs rounded-lg px-4 py-3 lg:max-w-md"
                style={{
                  background: msg.type === "user" ? "var(--accent)" : "var(--surface-panel)",
                  color: msg.type === "user" ? "white" : "var(--text-primary)",
                }}
              >
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                <p className="mt-1 text-xs opacity-70">{msg.timestamp}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2 border-t pt-4" style={{ borderColor: "var(--surface-panel-border)" }}>
          <input
            type="text"
            placeholder="Posez une question sur la finance..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-accent"
            style={{ borderColor: "var(--surface-panel-border)" }}
          />
          <Button onClick={() => handleSendMessage()} size="sm">
            <Send size={16} />
          </Button>
        </div>
      </GlassCard>

      {/* Suggestions */}
      <div>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          💡 Questions Suggérées
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {SUGGESTIONS.map((suggestion) => (
            <GlassCard
              key={suggestion.id}
              className="cursor-pointer p-4 transition-all hover:border-accent"
              style={{ borderColor: "var(--surface-panel-border)" }}
              onClick={() => handleSendMessage(suggestion.question)}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{suggestion.icon}</span>
                <div className="flex-1">
                  <p className="text-xs font-medium" style={{ color: "var(--accent)" }}>
                    {suggestion.category}
                  </p>
                  <p className="mt-1 text-sm" style={{ color: "var(--text-primary)" }}>
                    {suggestion.question}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Statistiques IA */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {IA_STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <GlassCard raised className="p-4" key={stat.label}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                    {stat.value}
                  </p>
                </div>
                <Icon size={22} style={{ color: stat.color }} />
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Historique des analyses */}
      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Historique des analyses
        </h2>
        <div className="space-y-3">
          {messages.filter((msg) => msg.type === "user").slice(-10).reverse().map((msg) => {
            const aiReply = messages.find((m) => m.id === `ai-${msg.id.split('-')[1]}`);
            const isExpanded = expandedId === msg.id;
            return (
              <div
                key={msg.id}
                className="rounded-[var(--radius-odin-md)] border px-4 py-3"
                style={{ borderColor: "var(--surface-panel-border)" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {msg.content}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                      {msg.timestamp}
                    </p>
                  </div>
                  <div className="text-right">
                    <button className="text-xs font-medium" style={{ color: "var(--accent)" }} onClick={() => setExpandedId(isExpanded ? null : msg.id)}>
                      {isExpanded ? 'Fermer' : 'Voir réponse'}
                    </button>
                  </div>
                </div>

                {isExpanded && aiReply && (
                  <div className="mt-3 rounded bg-[var(--surface-panel)] p-3">
                    <p className="whitespace-pre-wrap text-sm" style={{ color: "var(--text-primary)" }}>{aiReply.content}</p>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{aiReply.timestamp}</p>
                  </div>
                )}
              </div>
            );
          })}

          {messages.filter((msg) => msg.type === "user").length === 0 && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Aucune analyse utilisateur récente.
            </p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
