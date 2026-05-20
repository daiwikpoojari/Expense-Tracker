import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import { X, Trash2, Search, Calendar, Download, Moon, Sun } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie } from 'recharts';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [formData, setFormData] = useState({ name: '', amount: '', type: 'expense' });
  
  const dateInputRef = useRef(null);
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '04 May';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { 
      ...formData, 
      amount: Number(formData.amount), 
      date: new Date().toISOString().split('T')[0] 
    };
    try {
      await axios.post(API_URL, payload);
      setIsModalOpen(false);
      setFormData({ name: '', amount: '', type: 'expense' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteItem = async (e, id) => {
    if (e) e.stopPropagation();
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const exportCSV = () => {
    const headers = "Date,Name,Type,Amount\n";
    const data = transactions.map(t => `${t.date || '2026-05-04'},${t.name},${t.type},${t.amount}`).join("\n");
    const blob = new Blob([headers + data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ExpenTrack_Report.csv';
    a.click();
  };

  const income = transactions.filter(t => t.type === 'income').reduce((a, b) => a + (Number(b.amount) || 0), 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((a, b) => a + (Number(b.amount) || 0), 0);
  const balance = income - expense;
  const expenseRatio = income > 0 ? Math.min((expense / income) * 100, 100) : 0;

  const filteredTransactions = transactions.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pieData = [
    { name: 'Inflow', value: income, color: '#10b981' },
    { name: 'Outflow', value: expense, color: '#f43f5e' }
  ];

  const getRatioColor = () => {
    if (expenseRatio > 80) return '#ef4444'; 
    if (expenseRatio > 40) return '#fb8c00'; 
    return '#6366f1'; 
  };

  const status = income === 0 ? { text: "NO DATA", color: "#9ca3af" } : 
                 expenseRatio <= 40 ? { text: "OPTIMAL", color: "#10b981" } : { text: "CRITICAL", color: "#ef4444" };

  return (
    <div className={`dashboard-wrapper ${darkMode ? 'dark-theme' : 'light-theme'}`} style={{ 
      minHeight: '100vh', 
      backgroundColor: darkMode ? '#0f172a' : '#f8fafc', 
      color: darkMode ? '#fff' : '#0f172a',
      paddingBottom: '40px'
    }}>
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
        <div>
          <h1 className="logo" style={{ margin: 0, fontSize: '1.6rem' }}>ExpenTrack</h1>
          <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.6 }}>Financial Dashboard</p>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
          </button>
          
          <div style={{ textAlign: 'right' }}>
            <div onClick={() => dateInputRef.current.showPicker()} style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
              <Calendar size={14} style={{ marginRight: '5px' }}/> {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
              <input type="date" ref={dateInputRef} style={{ visibility: 'hidden', width: 0, position: 'absolute' }} />
            </div>
            <button onClick={exportCSV} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}>
              <Download size={10}/> Download CSV
            </button>
          </div>
        </div>
      </header>

      <div className="bento-grid" style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        
        <div className="glass-card" style={{ position: 'relative', background: darkMode ? 'rgba(30,41,59,0.5)' : '#fff', padding: '30px', borderRadius: '24px' }}>
          <div style={{ position: 'absolute', top: '25px', right: '25px', padding: '5px 12px', borderRadius: '8px', border: `1px solid ${status.color}44`, fontSize: '0.65rem', color: status.color, fontWeight: 800 }}>
            {status.text}
          </div>
          <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>Total Liquidity</span>
          <h2 style={{ fontSize: '3rem', margin: '15px 0' }}>₹{balance.toLocaleString()}</h2>
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '8px' }}>
              <span>Expense Ratio</span>
              <span>{Math.round(expenseRatio)}%</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${expenseRatio}%`, height: '100%', background: getRatioColor(), transition: '0.6s ease' }}/>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '50px', marginTop: '25px' }}>
            <div><p style={{ color: '#10b981', fontSize: '0.8rem', margin: 0 }}>↑ Inflow</p><p style={{ fontWeight: 700, fontSize: '1.1rem' }}>₹{income.toLocaleString()}</p></div>
            <div><p style={{ color: '#f43f5e', fontSize: '0.8rem', margin: 0 }}>↓ Outflow</p><p style={{ fontWeight: 700, fontSize: '1.1rem' }}>₹{expense.toLocaleString()}</p></div>
          </div>
        </div>

        <div className="glass-card" style={{ background: darkMode ? 'rgba(30,41,59,0.5)' : '#fff', padding: '30px', borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Ledger</h3>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', padding: '4px 10px' }}>
              <Search size={14} style={{ opacity: 0.4 }}/>
              <input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ background: 'none', border: 'none', fontSize: '0.8rem', padding: '4px', color: 'inherit', outline: 'none' }}/>
            </div>
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto', overflowX: 'hidden', paddingRight: '12px', paddingTop: '10px' }} className="custom-scrollbar">
            {[...filteredTransactions].reverse().map(t => (
              <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>{formatDate(t.date)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: '10px' }}>
                  <span style={{ fontWeight: 800, color: t.type === 'income' ? '#10b981' : '#f43f5e' }}>₹{t.amount}</span>
                  <Trash2 size={14} onClick={(e) => deleteItem(e, t._id)} style={{ cursor: 'pointer', opacity: 0.3 }} />
                </div>
              </div>
            ))}
          </div>
          <button className="btn-add" style={{ width: '100%', marginTop: '20px', padding: '12px', borderRadius: '12px', border: 'none', background: '#6366f1', color: '#fff', fontWeight: 700, cursor: 'pointer' }} onClick={() => setIsModalOpen(true)}>New Entry</button>
        </div>

        <div className="glass-card" style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', gap: '30px', background: darkMode ? 'rgba(30,41,59,0.5)' : '#fff', padding: '30px', borderRadius: '24px', minHeight: '350px' }}>
          <div style={{ flex: '2 1 400px', height: '300px' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '15px', opacity: 0.4 }}>TRANSACTION OVERVIEW</p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={transactions} margin={{ top: 10, bottom: 20 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.05} />
                <XAxis dataKey="name" hide />
                <YAxis domain={[0, 'auto']} tick={{ fontSize: 10, fill: 'currentColor' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    background: darkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)', 
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ fontSize: '0.85rem', fontWeight: 600, color: darkMode ? '#fff' : '#0f172a' }}
                  labelStyle={{ fontWeight: 800, marginBottom: '5px', color: darkMode ? '#818cf8' : '#4f46e5' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                />
                <Bar dataKey="amount" radius={[10, 10, 0, 0]} barSize={40}>
                  {transactions.map((e, i) => (
                    <Cell 
                      key={i} 
                      fill={e.type === 'income' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}
                      stroke={e.type === 'income' ? '#10b981' : '#f43f5e'}
                      strokeWidth={2}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div style={{ flex: '1 1 200px', height: '300px', position: 'relative' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '15px', opacity: 0.4, textAlign: 'center' }}>DISTRIBUTION</p>
            <div style={{ position: 'absolute', top: '55%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
               <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{Math.round(expenseRatio)}%</span>
               <p style={{ fontSize: '0.6rem', opacity: 0.5, margin: 0 }}>RATIO</p>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={65} outerRadius={85} paddingAngle={10} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => <Cell key={index} fill={entry.color} fillOpacity={0.8} />)}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', background: darkMode ? '#1e293b' : '#fff' }}
                   itemStyle={{ color: darkMode ? '#fff' : '#0f172a' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: darkMode ? '#1e293b' : '#fff', padding: '35px', borderRadius: '24px', width: '360px' }}>
            <h3 style={{ marginTop: 0 }}>Add Entry</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input placeholder="Description" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'transparent', color: 'inherit' }} onChange={(e) => setFormData({ ...formData, name: e.target.value })}/>
              <input type="number" placeholder="Amount" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'transparent', color: 'inherit' }} onChange={(e) => setFormData({ ...formData, amount: e.target.value })}/>
              <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', background: 'transparent', color: 'inherit' }} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Save</button>
                <button type="button" style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: 'rgba(0,0,0,0.05)', cursor: 'pointer', color: 'inherit' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;