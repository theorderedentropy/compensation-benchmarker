import React, { useState, useEffect, useRef } from 'react';
import { Send, Key, Sparkles, AlertCircle, Cpu, FileText } from 'lucide-react';
import type { Employee } from '../../types';

interface MarketResearchProps {
  employees: Employee[];
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export const MarketResearch: React.FC<MarketResearchProps> = ({ employees }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: "Hello! I am your CompPulse AI Assistant. I can help you research external compensation market rates, draft salary justification letters, or evaluate offer packages. Add your Gemini API Key at the top to enable real-time Web/AI intelligence, or test me with some prompt templates below!",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load API key from localstorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('comppulse_gemini_key');
    if (savedKey) {
      setApiKey(savedKey);
    } else {
      setShowKeyInput(true);
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('comppulse_gemini_key', apiKey.trim());
    setShowKeyInput(false);
    setError(null);
  };

  const handleClearKey = () => {
    localStorage.removeItem('comppulse_gemini_key');
    setApiKey('');
    setShowKeyInput(true);
  };

  const quickPrompts = [
    {
      label: "Justification Letter",
      prompt: `Write a formal compensation adjustment justification letter for promoting one of our L3 engineers to L4. We want to align them to our company's target market midpoint.`
    },
    {
      label: "Market Trends",
      prompt: "What is the typical base salary, equity, and bonus structure for an AI Engineering Specialist (L4 level) in San Francisco compared to London?"
    },
    {
      label: "Counter-offer Valuation",
      prompt: "An engineer candidate at L2 level has counter-offered asking for $115k base + $20k equity. The market midpoint for L2 is $95k. How should we structure our reply to align with internal equity?"
    }
  ];

  // Simple formatting helper for markdown-like bullets and line breaks
  const renderMessageContent = (text: string) => {
    return text.split('\n').map((paragraph, idx) => {
      let trimmed = paragraph.trim();
      
      // Bullets
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return <li key={idx} style={{ marginLeft: '1.25rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>{trimmed.substring(2)}</li>;
      }
      // Bold items
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (boldRegex.test(paragraph)) {
        const parts = paragraph.split(boldRegex);
        return (
          <p key={idx} style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i} style={{ color: 'var(--text-primary)' }}>{part}</strong> : part)}
          </p>
        );
      }

      return <p key={idx} style={{ marginBottom: '0.5rem', minHeight: trimmed === '' ? '0.5rem' : 'auto', color: 'var(--text-secondary)' }}>{paragraph}</p>;
    });
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newUserMessage: Message = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsSending(true);
    setError(null);

    const savedKey = localStorage.getItem('comppulse_gemini_key');

    if (savedKey) {
      // 1. Run live call to Gemini API!
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${savedKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `You are a compensation consulting assistant inside CompPulse, a dashboard for comp analysis. Underneath is a summary of the user's current employee counts to give you context on their organization: 
                  Organization Size: ${employees.length} employees.
                  Job Families: ${Array.from(new Set(employees.map(e => e.jobFamily))).join(', ')}.
                  
                  Answer the user's inquiry regarding compensation benchmarks, equity policies, market trends, or writing comp letters. Keep the response professional, detailed, and format it nicely with bullets and bold headers where appropriate. 
                  
                  User Inquiry: ${textToSend}`
                }]
              }]
            })
          }
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `HTTP ${response.status} from Gemini API`);
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I was unable to formulate a response.";

        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: responseText,
          timestamp: new Date()
        }]);

      } catch (err: any) {
        setError(`Failed to reach Gemini: ${err.message}`);
        // Fallback to mock behavior so it doesn't break
        setTimeout(() => {
          setMessages(prev => [...prev, {
            sender: 'assistant',
            text: `⚠️ [API Key Error Fallback] I encountered an error communicating with Gemini. Please make sure your key is active and has correct permissions.\n\nHere is a mock comp recommendation:\n\n* **Market Base ranges for SF**: L1: $65k - $78k, L2: $88k - $105k, L3: $120k - $145k, L4: $160k - $190k.\n* **Equity Targets**: L3 Software Engineers generally target 0.15% - 0.25% equity grants at Series B/C stages.\n* **Internal Parity Check**: Ensure that any pay adjustments do not increase demographic pay gaps in Engineering beyond your 5% tolerance threshold.`,
            timestamp: new Date()
          }]);
        }, 1000);
      } finally {
        setIsSending(false);
      }
    } else {
      // 2. Fallback Mocked Responses (Product Builder / Showcase mode)
      setTimeout(() => {
        let responseText = "";
        const lower = textToSend.toLowerCase();

        if (lower.includes('justification') || lower.includes('letter')) {
          responseText = `**Compensation Adjustment Justification Letter**\n\n**To:** Compensation Review Committee\n**Date:** ${new Date().toLocaleDateString()}\n**Subject:** Out-of-Cycle Salary Adjustment for L3 Promotion\n\n**Executive Summary**\nThis letter requests approval for a salary adjustment to align the base salary of our newly promoted L4 Engineer with the company's approved market posture. \n\n**Justification Factors:**\n* **Market Posture Alignment:** The current L3 average salary within our organization is $135,000. For L4, the external market 50th percentile is $175,000. \n* **Internal Equity Auditing:** Promoting without adjustments would drop this employee's Compa-Ratio to 77%, violating our core compensation philosophy of a minimum 80% Compa-Ratio. \n* **Retention Risk:** Internal logs identify L3 engineers at this range as high flight risk if compensation is not aligned during promotion cycles.\n\n**Recommendation:**\nWe recommend adjusting their base salary from $138,000 to **$178,000**, representing a 28% promotion bump and positioning them at a 1.01 Compa-Ratio relative to the market L4 midpoint.`;
        } else if (lower.includes('trends') || lower.includes('sf') || lower.includes('san francisco')) {
          responseText = `**Market Trends: AI Specialists (SF vs London)**\n\nBased on Q2 2026 market intelligence models, here is the compensation comparison for an **AI Engineering Specialist (L4 level)**:\n\n**San Francisco Bay Area:**\n* **Base Salary (50th percentile):** $195,000 - $225,000\n* **Equity (Annual Grant Value):** $85,000 - $110,000\n* **Performance Bonus:** 15% - 20% target\n* **Context:** Extreme competition for LLM/RLHF expertise. Premium premiums exist for candidates from Tier-1 labs.\n\n**London Metro Area:**\n* **Base Salary (50th percentile):** £110,000 - £130,000 ($140,000 - $165,000 USD)\n* **Equity (Annual Grant Value):** $40,000 - $65,000 USD\n* **Performance Bonus:** 10% - 15% target\n* **Context:** Growing talent pool, but base compensation averages 30% below SF Bay Area due to market differences.\n\n*Note: Connect a live Gemini API key to query active web sources for live, real-time comp data changes.*`;
        } else {
          responseText = `**Compensation Evaluation Framework**\n\nFor L2 software engineering counter-offers:\n\n* **Market Benchmark:** The L2 market range spans $75,000 (25th percentile) to $102,000 (75th percentile) with a midpoint (50th) of **$90,000**.\n* **Requested Offer ($115k):** Earning $115k puts the candidate at a **1.27 Compa-Ratio**, which exceeds our maximum philosophy threshold of 120%.\n* **Internal Equity Impact:** Our internal ledger averages $98,300 for current L2 staff. Granting $115k would place the candidate as the highest paid L2, creating compaction issues with L3 engineers.\n\n**Recommendation:**\nOffer a base salary of **$100,000** (positioned at the 75th percentile) and increase the sign-on bonus or equity grant by **$15,000** to satisfy their financial target without causing long-term base salary compaction in the roster.`;
        }

        setMessages(prev => [...prev, {
          sender: 'assistant',
          text: responseText,
          timestamp: new Date()
        }]);
        setIsSending(false);
      }, 1200);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputText);
    }
  };

  return (
    <div className="fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--header-height))' }}>
      
      {/* API Key configuration banner */}
      <div className="glass-card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Key size={18} style={{ color: apiKey ? 'var(--color-success)' : 'var(--color-primary)' }} />
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block' }}>
                {apiKey ? 'Gemini API Key Loaded' : 'Gemini AI Integration'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {apiKey ? 'API is running in live mode client-side.' : 'Add your Gemini API key to fetch real-time market data directly.'}
              </span>
            </div>
          </div>

          <button 
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
          >
            {apiKey ? 'Change Key' : 'Configure Key'}
          </button>
        </div>

        {showKeyInput && (
          <form onSubmit={handleSaveKey} style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            <input
              type="password"
              placeholder="Paste your Gemini API Key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="form-input"
              style={{ flex: 1, minHeight: '38px', fontSize: '0.85rem' }}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.35rem 1rem', fontSize: '0.85rem' }}>
              Save
            </button>
            {apiKey && (
              <button type="button" onClick={handleClearKey} className="btn btn-secondary" style={{ padding: '0.35rem 1rem', fontSize: '0.85rem', color: 'var(--color-danger)' }}>
                Clear Key
              </button>
            )}
          </form>
        )}
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'var(--color-danger-glow)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1rem',
          color: 'var(--color-danger)',
          fontSize: '0.8rem'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Chat Area */}
      <div className="glass-card" style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        border: '1px solid var(--border-color)',
        padding: 0,
        overflow: 'hidden',
        marginBottom: '1.5rem'
      }}>
        {/* Messages Feed */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{ 
                fontSize: '0.7rem', 
                color: 'var(--text-muted)', 
                marginBottom: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                marginRight: msg.sender === 'user' ? '0.5rem' : '0',
                marginLeft: msg.sender === 'assistant' ? '0.5rem' : '0'
              }}>
                {msg.sender === 'assistant' && <Sparkles size={10} style={{ color: 'var(--color-primary)' }} />}
                {msg.sender === 'user' ? 'You' : 'CompPulse Consultant'}
              </div>

              <div style={{
                backgroundColor: msg.sender === 'user' ? 'var(--color-primary)' : 'var(--bg-surface-elevated)',
                color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                padding: '1rem 1.25rem',
                borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                lineHeight: '1.5',
                fontSize: '0.9rem',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {msg.sender === 'user' ? msg.text : renderMessageContent(msg.text)}
              </div>
            </div>
          ))}

          {isSending && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', alignSelf: 'flex-start', marginLeft: '0.5rem' }}>
              <Cpu size={14} className="spin" style={{ animation: 'spin 2s linear infinite' }} />
              CompPulse Consultant is thinking...
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompts Panel */}
        <div style={{ 
          borderTop: '1px solid var(--border-color)', 
          padding: '0.75rem 1rem', 
          backgroundColor: 'rgba(255,255,255,0.01)',
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', marginRight: '0.25rem' }}>
            Quick Actions:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isSending}
              onClick={() => handleSend(qp.prompt)}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderRadius: '20px', border: '1px dashed var(--border-color)' }}
            >
              <FileText size={12} />
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ borderTop: '1px solid var(--border-color)', padding: '1rem', display: 'flex', gap: '0.75rem', backgroundColor: 'var(--bg-surface)' }}>
          <input
            type="text"
            placeholder="Ask a compensation question..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isSending}
            className="form-input"
            style={{ flex: 1, minHeight: '44px' }}
          />
          <button
            onClick={() => handleSend(inputText)}
            disabled={isSending || !inputText.trim()}
            className="btn btn-primary"
            style={{ width: '44px', height: '44px', padding: 0 }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1.5s linear infinite;
        }
      `}</style>

    </div>
  );
};
