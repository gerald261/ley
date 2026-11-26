import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  peso,
  Vehicle,
  VEHICLES,
} from '../data/vehicles';

interface ChatMessage {
  id: number;
  role: 'user' | 'bot';
  text?: string;
  vehicles?: Vehicle[];
  intro?: string;
  action?: 'promo' | 'testdrive';
  contact?: boolean;
  listItems?: Vehicle[];
}

interface VehicleAssistantProps {
  onInquireVehicle: (id: string) => void;
  onScrollTo: (sectionId: string) => void;
}

const QUICK_QUESTIONS = [
  'Cheapest EV?',
  'Most premium model?',
  "What's included free?",
  'Models under ₱30,000 monthly',
  'Book a test drive',
  'Contact Jhon',
];

function findMatches(text: string): Vehicle[] {
  const sorted = [...VEHICLES].sort((a, b) => b.name.length - a.name.length);
  const found: Vehicle[] = [];
  sorted.forEach((v) => {
    const key = v.name.toLowerCase();
    if (text.includes(key) || text.includes(v.id)) {
      if (!found.includes(v)) found.push(v);
    }
  });
  return found;
}

function parseBudgetNumber(text: string): number | null {
  const m = text.match(/(\d[\d,]{2,})/);
  if (!m) return null;
  return parseInt(m[1].replace(/,/g, ''), 10);
}

export function VehicleAssistant({
  onInquireVehicle,
  onScrollTo,
}: VehicleAssistantProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const nextId = useRef(1);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: nextId.current++,
          role: 'bot',
          text: "Hi! Ask me about any VinFast model's price, down payment, or monthly rate — or tap a quick question below.",
        },
      ]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, open]);

  function buildBotReply(raw: string): ChatMessage {
    const text = raw.toLowerCase();
    const id = nextId.current++;

    if (/^(hi|hello|hey|good (morning|afternoon|evening))/.test(text.trim())) {
      return {
        id,
        role: 'bot',
        text: "Hi! Ask me about any VinFast model's price, down payment, or monthly rate — or try one of the quick questions below.",
      };
    }

    const matches = findMatches(text);
    if (matches.length >= 2) {
      return {
        id,
        role: 'bot',
        intro: "Here's a side-by-side:",
        vehicles: matches.slice(0, 4),
      };
    }
    if (matches.length === 1) {
      return {
        id,
        role: 'bot',
        vehicles: [matches[0]],
      };
    }

    if (
      /cheap|lowest|most affordable|least expensive|entry.level|starter/.test(
        text
      )
    ) {
      const v = [...VEHICLES].sort((a, b) => a.dp - b.dp)[0];
      return {
        id,
        role: 'bot',
        intro: `Our most affordable model is ${v.name}, with the lowest all-in down payment.`,
        vehicles: [v],
      };
    }

    if (
      /expensive|priciest|flagship|top.of.the.line|premium|luxury|biggest/.test(
        text
      )
    ) {
      const v = [...VEHICLES].sort((a, b) => b.srp - a.srp)[0];
      return {
        id,
        role: 'bot',
        intro: `Our flagship model is ${v.name}, the highest SRP in the lineup.`,
        vehicles: [v],
      };
    }

    if (/free|inclusion|promo|paylite/.test(text)) {
      return {
        id,
        role: 'bot',
        text: 'The Low DP Paylite Promo includes, free: Insurance, 3 years LTO registration, Chattel Mortgage fee, 1-year battery subscription, EWD / tire repair kit / tow hook, and a charger.',
        action: 'promo',
      };
    }

    if (/test drive|try (the|a) car|book a drive/.test(text)) {
      return {
        id,
        role: 'bot',
        text: "You can request a test drive — it's a request, not an instant booking, so our team confirms the date and time with you after.",
        action: 'testdrive',
      };
    }

    if (/contact|email|phone|number|facebook|reach|call/.test(text)) {
      return {
        id,
        role: 'bot',
        contact: true,
      };
    }

    if (/how many|all (the )?(models|vehicles|cars)|list|lineup/.test(text)) {
      const sorted = [...VEHICLES].sort((a, b) => a.dp - b.dp);
      return {
        id,
        role: 'bot',
        intro: `We carry ${VEHICLES.length} VinFast models, from lowest to highest down payment:`,
        listItems: sorted,
      };
    }

    const budget = parseBudgetNumber(text);
    if (budget && /budget|month|afford|dp|down ?payment/.test(text)) {
      const isMonthly = !/down ?payment|\bdp\b/.test(text);
      const field = isMonthly ? 'monthly' : 'dp';
      const fits = VEHICLES.filter((v) => v[field] <= budget).sort(
        (a, b) => a[field] - b[field]
      );
      if (fits.length === 0) {
        const lowest = [...VEHICLES].sort((a, b) => a[field] - b[field])[0];
        return {
          id,
          role: 'bot',
          text: `No model currently fits a ${peso(budget)} ${
            isMonthly ? 'monthly budget' : 'down payment'
          }. Our lowest option is ${lowest.name}.`,
        };
      }
      return {
        id,
        role: 'bot',
        intro: `${fits.length} model(s) fit a ${peso(budget)} ${
          isMonthly ? 'monthly budget' : 'down payment'
        }:`,
        vehicles: fits.slice(0, 4),
      };
    }

    return {
      id,
      role: 'bot',
      text: 'I can answer questions about any of our 11 VinFast models — try asking about a specific model (e.g. "VF3 Base price"), "cheapest EV", "what\'s free", or "models under ₱30,000 monthly".',
    };
  }

  function sendQuery(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = {
      id: nextId.current++,
      role: 'user',
      text: trimmed,
    };
    const botMsg = buildBotReply(trimmed);
    setMessages((prev) => [...prev, userMsg, botMsg]);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendQuery(input);
    setInput('');
  }

  return (
    <>
      <button
        type="button"
        className="chat-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label="Ask about our vehicles"
      >
        💬
      </button>

      {open && (
        <div className="chat-panel" role="dialog" aria-label="Vehicle Assistant">
          <div className="chat-head">
            <div>
              <strong>Vehicle Assistant</strong>
              <div className="chat-sub">
                Answers pulled straight from our price list — not AI guesses
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="chat-body" ref={bodyRef}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`msg-bubble ${
                  m.role === 'user' ? 'msg-user' : 'msg-bot'
                }`}
              >
                {m.intro && <p className="m-0 mb-1.5">{m.intro}</p>}
                {m.text && <p className="m-0">{m.text}</p>}

                {m.vehicles &&
                  m.vehicles.map((v, idx) => (
                    <div
                      key={v.id}
                      className={idx > 0 ? 'mt-2.5 pt-2 border-t border-slate-200' : ''}
                    >
                      <strong>{v.name}</strong>
                      <br />
                      <span>
                        SRP {peso(v.srp)} · All-in DP {peso(v.dp)} · Monthly{' '}
                        {peso(v.monthly)} (5 yrs)
                      </span>
                      <br />
                      <button
                        type="button"
                        className="mini-btn"
                        onClick={() => {
                          onInquireVehicle(v.id);
                          setOpen(false);
                        }}
                      >
                        Inquire about {v.name}
                      </button>
                    </div>
                  ))}

                {m.listItems && (
                  <div className="mt-1">
                    {m.listItems.map((v) => (
                      <div key={v.id}>
                        • {v.name} — DP {peso(v.dp)}
                      </div>
                    ))}
                  </div>
                )}

                {m.action === 'promo' && (
                  <button
                    type="button"
                    className="mini-btn"
                    onClick={() => {
                      onScrollTo('promo');
                      setOpen(false);
                    }}
                  >
                    See Low DP Offers
                  </button>
                )}

                {m.action === 'testdrive' && (
                  <button
                    type="button"
                    className="mini-btn"
                    onClick={() => {
                      onScrollTo('testdrive');
                      setOpen(false);
                    }}
                  >
                    Book a Test Drive
                  </button>
                )}

                {m.contact && (
                  <div>
                    You can reach Sale Ambassador Jhon Lee Pama at:
                    <br />
                    ✉️{' '}
                    <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                    <br />
                    📞 <a href="tel:+639605809638">{CONTACT_PHONE}</a>
                    <br />
                    or via the Facebook button on this page.
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="chat-quick">
            {QUICK_QUESTIONS.map((q) => (
              <button key={q} type="button" onClick={() => sendQuery(q)}>
                {q}
              </button>
            ))}
          </div>

          <form className="chat-form" onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about any VinFast model..."
              autoComplete="off"
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </>
  );
}
