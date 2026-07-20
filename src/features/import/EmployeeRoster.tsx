import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import type { Employee } from '../../types';

interface EmployeeRosterProps {
  employees: Employee[];
}

type SortField = 'id' | 'name' | 'title' | 'jobFamily' | 'level' | 'baseSalary' | 'gender';
type SortOrder = 'asc' | 'desc';

export const EmployeeRoster: React.FC<EmployeeRosterProps> = ({ employees }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Extract unique families and levels for filtering
  const families = useMemo(() => {
    const list = new Set(employees.map(e => e.jobFamily));
    return ['All', ...Array.from(list).sort()];
  }, [employees]);

  const levels = useMemo(() => {
    const list = new Set(employees.map(e => e.level));
    return ['All', ...Array.from(list).sort()];
  }, [employees]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const filteredAndSortedEmployees = useMemo(() => {
    let result = [...employees];

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.name.toLowerCase().includes(q) || 
        e.id.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q)
      );
    }

    // Filter by job family
    if (selectedFamily !== 'All') {
      result = result.filter(e => e.jobFamily === selectedFamily);
    }

    // Filter by level
    if (selectedLevel !== 'All') {
      result = result.filter(e => e.level === selectedLevel);
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        // Numeric sort
        const numA = valA as number;
        const numB = valB as number;
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      }
    });

    return result;
  }, [employees, searchQuery, selectedFamily, selectedLevel, sortField, sortOrder]);

  return (
    <div className="fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Employee Compensation Records</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Showing {filteredAndSortedEmployees.length} of {employees.length} employee profiles
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by ID, name, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem', width: '100%', minHeight: '42px' }}
            />
          </div>

          {/* Job Family Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="form-input"
              style={{ width: '100%', minHeight: '42px', backgroundColor: 'var(--bg-main)', cursor: 'pointer' }}
            >
              <option value="All">All Job Families</option>
              {families.filter(f => f !== 'All').map(family => (
                <option key={family} value={family}>{family}</option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="form-input"
              style={{ width: '100%', minHeight: '42px', backgroundColor: 'var(--bg-main)', cursor: 'pointer' }}
            >
              <option value="All">All Levels</option>
              {levels.filter(l => l !== 'All').map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      {filteredAndSortedEmployees.length > 0 ? (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('id')}>
                  ID <ArrowUpDown size={12} style={{ marginLeft: '4px', opacity: sortField === 'id' ? 1 : 0.4 }} />
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                  Name <ArrowUpDown size={12} style={{ marginLeft: '4px', opacity: sortField === 'name' ? 1 : 0.4 }} />
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('title')}>
                  Job Title <ArrowUpDown size={12} style={{ marginLeft: '4px', opacity: sortField === 'title' ? 1 : 0.4 }} />
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('jobFamily')}>
                  Job Family <ArrowUpDown size={12} style={{ marginLeft: '4px', opacity: sortField === 'jobFamily' ? 1 : 0.4 }} />
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('level')}>
                  Level <ArrowUpDown size={12} style={{ marginLeft: '4px', opacity: sortField === 'level' ? 1 : 0.4 }} />
                </th>
                <th style={{ cursor: 'pointer', textAlign: 'right' }} onClick={() => handleSort('baseSalary')}>
                  Base Salary <ArrowUpDown size={12} style={{ marginLeft: '4px', opacity: sortField === 'baseSalary' ? 1 : 0.4 }} />
                </th>
                <th style={{ textAlign: 'right' }}>Equity</th>
                <th style={{ textAlign: 'right' }}>Target Bonus</th>
                <th style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => handleSort('gender')}>
                  Gender <ArrowUpDown size={12} style={{ marginLeft: '4px', opacity: sortField === 'gender' ? 1 : 0.4 }} />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedEmployees.map((e) => (
                <tr key={e.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{e.id}</td>
                  <td style={{ fontWeight: 600 }}>{e.name}</td>
                  <td>{e.title}</td>
                  <td>
                    <span style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)'
                    }}>
                      {e.jobFamily}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{e.level}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {formatCurrency(e.baseSalary)}
                  </td>
                  <td style={{ textAlign: 'right', color: e.equity > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {e.equity > 0 ? formatCurrency(e.equity) : '—'}
                  </td>
                  <td style={{ textAlign: 'right', color: e.bonus > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {e.bonus > 0 ? formatCurrency(e.bonus) : '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-color)',
                      padding: '0.15rem 0.4rem',
                      borderRadius: '4px',
                      color: 'var(--text-secondary)'
                    }}>
                      {e.gender}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', border: '1px solid var(--border-color)' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No employee records matched your active filters.</p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedFamily('All'); setSelectedLevel('All'); }}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', marginTop: '0.5rem' }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
