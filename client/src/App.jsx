import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Zap, X, Trash2, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', amount: '', type: 'expense' });

  const API_URL = 'http://localhost:5001/api/transactions';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(API_URL);
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      amount: Number(formData.amount),
      type: formData.type
    };

    try {
      const res = await axios.post(API_URL, payload);
      if (res.status === 200 || res.status === 201) {
        setIsModalOpen(false);
        setFormData({ name: '', amount: '', type: 'expense' });
        fetchData();
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((a, b) => a + (Number(b.amount) || 0), 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((a, b) => a + (Number(b.amount) || 0), 0);

  const balance = income - expense;

  const getExpenseStatus = () => {
    if (income === 0) return { text: "NO DATA", color: "#9ca3af" };
    const ratio = (expense / income) * 100;
    if (ratio <= 30) return { text: "OPTIMAL", color: "#10b981" };
    if (ratio <= 60) return { text: "STABLE", color: "#fbbf24" };  
    return { text: "CRITICAL", color: "#ef4444" };                
  };

  const status = getExpenseStatus();

  return (
    <div className="dashboard-wrapper">
      <header className="app-header">
        <div>
          <h1 className="logo">ExpenTrack</h1>
          <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', margin: '5px 0 0 0'}}>Financial Fitness</p>
        </div>
        <div className="glass-card" style={{
          padding: '8px 16px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '10px',
          border: `1px solid ${status.color}33`, background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)'
        }}>
          <div style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: status.color, boxShadow: `0 0 8px ${status.color}`}} />
          <span style={{fontSize: '0.7rem', fontWeight: 800, color: '#fff', letterSpacing: '1px'}}>
            STATUS: {status.text}
          </span>
        </div>
      </header>

      <div className="bento-grid">
        <div className="glass-card hero-card">
          <span className="balance-label">Total Liquidity</span>
          <h2 className="balance-amount">₹{balance.toLocaleString()}</h2>
          <div style={{display: 'flex', gap: '40px', marginTop: '20px'}}>
            <div>
              <p className="item-cat" style={{color: 'var(--success)'}}>↑ Inflow</p>
              <p style={{fontWeight: 700, fontSize: '1.2rem'}}>₹{income.toLocaleString()}</p>
            </div>
            <div>
              <p className="item-cat" style={{color: 'var(--danger)'}}>↓ Outflow</p>
              <p style={{fontWeight: 700, fontSize: '1.2rem'}}>₹{expense.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="glass-card history-card">
          <h3 style={{marginTop: 0, fontSize: '1.1rem'}}>Ledger</h3>
          <div style={{marginTop: '20px', maxHeight: '200px', overflowY: 'auto'}} className="custom-scrollbar">
            {[...transactions].reverse().map(t => (
              <div key={t._id} className="list-item">
                <div>
                  <div className="item-name">{t.name}</div>
                  <div className="item-cat">{t.date}</div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <div style={{fontWeight: 800, color: t.type === 'income' ? 'var(--success)' : 'var(--danger)'}}>
                    {t.type === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString()}
                  </div>
                  <Trash2 size={14} onClick={() => deleteItem(t._id)} style={{cursor: 'pointer', opacity: 0.5}} />
                </div>
              </div>
            ))}
          </div>
          <button className="btn-add" style={{width: '100%', marginTop: '20px'}} onClick={() => setIsModalOpen(true)}>
            New Entry
          </button>
        </div>

        <div className="glass-card chart-card" style={{height: '380px', padding: '24px', boxSizing: 'border-box'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <p style={{fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '1px'}}>TRANSACTION OVERVIEW</p>
            <BarChart3 size={16} style={{color: '#475569'}}/>
          </div>
           <ResponsiveContainer width="100%" height="85%">
            <BarChart data={transactions} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" hide />
              <YAxis 
                tick={{fill: '#64748b', fontSize: 10}} 
                axisLine={false} 
                tickLine={false}
                domain={[0, 'dataMax + 1000']}
              />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }}
                itemStyle={{ color: '#f8fafc', fontSize: '0.8rem', fontWeight: 600 }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Amount']}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={45}>
                {transactions.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.type === 'income' ? '#10b981' : '#f43f5e'} 
                    fillOpacity={0.9} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
              <h3 style={{margin: 0}}>New Transaction</h3>
              <X onClick={() => setIsModalOpen(false)} style={{cursor: 'pointer'}} />
            </div>
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <input className="modal-input" placeholder="Description" value={formData.name} required onChange={(e) => setFormData({...formData, name: e.target.value})} />
              <input className="modal-input" type="number" placeholder="Amount (₹)" value={formData.amount} required onChange={(e) => setFormData({...formData, amount: e.target.value})} />
              <select className="modal-input" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <button type="submit" className="btn-add" style={{marginTop: '10px'}}>Save Transaction</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;