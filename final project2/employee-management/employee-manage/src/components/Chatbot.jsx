import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAdminStats, getEmployee, getAttendanceSummary, getEmployeeLeaves, getEmployees } from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';

const BOT_RESPONSES = {
  admin: {
    greet: async () => {
      const s = await getAdminStats();
      return `👋 Hi Admin! Here's a quick summary:\n• ${s.totalEmployees} employees\n• ₹${s.totalPayroll.toLocaleString()} monthly payroll\n• ${s.presentToday} present today\n• ${s.pendingLeaves} pending leaves`;
    },
    employees: async () => {
      const emps = await getEmployees();
      return `👥 You have **${emps.length} employees**:\n${emps.map(e => `• ${e.name} — ${e.role}`).join('\n')}`;
    },
    payroll: async () => {
      const s = await getAdminStats();
      return `💰 Total monthly payroll: **₹${s.totalPayroll.toLocaleString()}**\nAverage salary: ₹${Math.round(s.totalPayroll / s.totalEmployees).toLocaleString()}`;
    },
    attendance: async () => {
      const s = await getAdminStats();
      return `📅 Today's attendance:\n• Present: ${s.presentToday} employees\n• Absent: ${s.totalEmployees - s.presentToday} employees`;
    },
    leaves: async () => {
      const s = await getAdminStats();
      return `🏖️ Leave requests: **${s.pendingLeaves} pending** approvals\nGo to Leave Requests to review them.`;
    },
  },
  employee: {
    greet: async (user) => {
      const emp = await getEmployee(user.id);
      return `👋 Hi ${emp?.name?.split(' ')[0] || 'there'}! How can I help you today?`;
    },
    salary: async (user) => {
      const emp = await getEmployee(user.id);
      return `💰 Your current salary:\n• Gross: ₹${emp?.salary?.toLocaleString()}\n• Net (approx): ₹${Math.round(emp?.salary * 0.88).toLocaleString()}`;
    },
    attendance: async (user) => {
      const s = await getAttendanceSummary(user.id);
      const pct = Math.round((s.present / s.total) * 100) || 0;
      return `📅 Your attendance:\n• Present: ${s.present} days\n• Absent: ${s.absent} days\n• Rate: ${pct}%`;
    },
    leaves: async (user) => {
      const leaves = await getEmployeeLeaves(user.id);
      const approved = leaves.filter(l => l.status === 'Approved').length;
      const pending = leaves.filter(l => l.status === 'Pending').length;
      return `🏖️ Leave summary:\n• Approved: ${approved}\n• Pending: ${pending}\n• Total: ${leaves.length}`;
    },
    profile: async (user) => {
      const emp = await getEmployee(user.id);
      return `👤 Your profile:\n• Name: ${emp?.name}\n• Role: ${emp?.role}\n• Department: ${emp?.department}`;
    },
  },
};

const getResponse = async (msg, role, user) => {
  const m = msg.toLowerCase();
  const r = BOT_RESPONSES[role] || BOT_RESPONSES.employee;
  if (m.match(/hi|hello|hey|help/)) return await r.greet(user);
  if (m.match(/salary|pay|wage/)) return role === 'admin' ? await r.payroll(user) : await r.salary(user);
  if (m.match(/attendance|present|absent/)) return await r.attendance(user);
  if (m.match(/leave|holiday|vacation/)) return await r.leaves(user);
  if (m.match(/employee|staff|team/)) return role === 'admin' ? await r.employees(user) : await r.profile(user);
  if (m.match(/profile|info|who/)) return role === 'admin' ? '👤 Go to Employees to view profiles.' : await r.profile(user);
  return `🤖 I can help with: attendance, salary, leaves, and employees. What would you like to know?`;
};

export default function Chatbot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0 && user) {
      addBotMsg('👋 Hi! I\'m your HR assistant. Ask me about attendance, salary, leaves, or employees!');
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const addBotMsg = (text) => {
    setMessages(prev => [...prev, { from: 'bot', text, id: Date.now() }]);
  };

  const send = async () => {
    const msg = input.trim();
    if (!msg) return;
    setMessages(prev => [...prev, { from: 'user', text: msg, id: Date.now() }]);
    setInput('');
    setTyping(true);
    await new Promise(r => setTimeout(r, 700));
    const reply = await getResponse(msg, user?.role, user);
    setTyping(false);
    addBotMsg(reply);
  };

  const quickReplies = user?.role === 'admin'
    ? ['📊 Payroll Summary', '📅 Attendance Today', '🏖️ Pending Leaves', '👥 All Employees']
    : ['📅 My Attendance', '💰 My Salary', '🏖️ My Leaves', '👤 My Profile'];

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="chatbot-window"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div className="chatbot-header">
              <div className="chatbot-avatar">🤖</div>
              <div>
                <div className="chatbot-name">HR Assistant</div>
                <div className="chatbot-status">● Always Online</div>
              </div>
              <button className="chatbot-close" onClick={() => setOpen(false)}><X size={15} /></button>
            </div>

            <div className="chatbot-messages">
              {messages.map(m => (
                <div key={m.id} className={`chat-msg ${m.from}`}>
                  {m.from === 'bot' && <div className="chat-bot-avatar">AI</div>}
                  <div className="chat-bubble" style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                </div>
              ))}
              {typing && (
                <div className="chat-msg bot">
                  <div className="chat-bot-avatar">AI</div>
                  <div className="chat-bubble">
                    <span style={{ display: 'flex', gap: 4 }}>
                      {[0,1,2].map(i => (
                        <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', animation: `bounce .8s ${i * .15}s infinite alternate`, display: 'inline-block' }} />
                      ))}
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="chatbot-quick-btns">
              {quickReplies.map(q => (
                <button key={q} className="quick-btn" onClick={() => { setInput(q); }}>{q}</button>
              ))}
            </div>

            <div className="chatbot-input-row">
              <input
                className="chatbot-input"
                placeholder="Ask me anything..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
              />
              <button className="chatbot-send" onClick={send}><Send size={15} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="chatbot-fab no-print"
        onClick={() => setOpen(v => !v)}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.08 }}
      >
        {open ? <X size={22} /> : <Bot size={22} />}
      </motion.button>

      <style>{`@keyframes bounce { from { transform:translateY(0) } to { transform:translateY(-5px) } }`}</style>
    </>
  );
}
