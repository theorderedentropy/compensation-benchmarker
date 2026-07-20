import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, Download, FileText, AlertCircle, Play } from 'lucide-react';
import type { Employee } from '../../types';
import { generateSampleEmployees, exportToCSV } from '../../utils/sampleData';

interface CSVImporterProps {
  onDataImported: (employees: Employee[], fileName: string) => void;
  onLoadSampleData: () => void;
}

export const CSVImporter: React.FC<CSVImporterProps> = ({ 
  onDataImported, 
  onLoadSampleData 
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const validateAndProcessData = (results: Papa.ParseResult<any>, fileName: string) => {
    const rawData = results.data;
    if (!rawData || rawData.length === 0) {
      setError("The CSV file seems to be empty.");
      return;
    }

    // Inspect headers
    const firstRow = rawData[0];
    const requiredKeys = ['id', 'name', 'title', 'jobFamily', 'level', 'baseSalary'];
    const missingKeys = requiredKeys.filter(key => 
      !Object.keys(firstRow).some(header => header.toLowerCase().replace(/[^a-z0-9]/g, '') === key.toLowerCase())
    );

    if (missingKeys.length > 0) {
      setError(`Missing required columns: ${missingKeys.join(', ')}. Check that headers are spelled correctly.`);
      return;
    }

    // Map rows to Employee objects
    const employees: Employee[] = [];
    const normalizedHeaders = Object.keys(firstRow).reduce((acc: { [key: string]: string }, header) => {
      const cleanHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
      acc[cleanHeader] = header;
      return acc;
    }, {});

    try {
      rawData.forEach((row: any, index: number) => {
        // Skip empty rows
        if (!row[normalizedHeaders['id']] && !row[normalizedHeaders['name']]) return;

        const baseSalary = parseFloat(String(row[normalizedHeaders['basesalary']]).replace(/[^0-9.]/g, ''));
        if (isNaN(baseSalary)) {
          throw new Error(`Row ${index + 2}: Base salary must be a valid number.`);
        }

        const equityVal = row[normalizedHeaders['equity']];
        const bonusVal = row[normalizedHeaders['bonus']];
        const tenureVal = row[normalizedHeaders['tenuremonths']];

        employees.push({
          id: String(row[normalizedHeaders['id']] || `EMP${index + 1}`).trim(),
          name: String(row[normalizedHeaders['name']] || 'Unknown').trim(),
          title: String(row[normalizedHeaders['title']] || 'Staff Member').trim(),
          jobFamily: String(row[normalizedHeaders['jobfamily']] || 'Other').trim(),
          level: String(row[normalizedHeaders['level']] || 'L1').trim().toUpperCase(),
          baseSalary: baseSalary,
          equity: equityVal ? parseFloat(String(equityVal).replace(/[^0-9.]/g, '')) || 0 : 0,
          bonus: bonusVal ? parseFloat(String(bonusVal).replace(/[^0-9.]/g, '')) || 0 : 0,
          gender: String(row[normalizedHeaders['gender']] || 'Undisclosed').trim(),
          tenureMonths: tenureVal ? parseInt(String(tenureVal).replace(/[^0-9]/g, '')) || 0 : 0,
        });
      });

      setError(null);
      onDataImported(employees, fileName);
    } catch (e: any) {
      setError(e.message || "An error occurred while validating the CSV data rows.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      parseFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      parseFile(file);
    }
  };

  const parseFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError("Please upload a .csv file. Other file types are not supported.");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        validateAndProcessData(results, file.name);
      },
      error: () => {
        setError("Failed to parse the file. Verify that it is a properly structured CSV.");
      }
    });
  };

  const triggerFileBrowser = () => {
    fileInputRef.current?.click();
  };

  const handleDownloadTemplate = () => {
    const sampleEmployees = generateSampleEmployees();
    const csvContent = exportToCSV(sampleEmployees);
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "comppulse_employee_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '3rem auto', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.75rem', marginBottom: '0.5rem' }}>
          Upload Compensation Data
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Import your organization's compensation ledger to audit pay ranges, analyze outliers, and model market benchmarks.
        </p>
      </div>

      <div className="glass-card" style={{ padding: '2rem', border: '1px solid var(--border-color)' }}>
        <input 
          ref={fileInputRef}
          type="file" 
          accept=".csv" 
          onChange={handleFileChange} 
          style={{ display: 'none' }}
        />

        <div 
          className={`dropzone ${isDragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileBrowser}
        >
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            padding: '1.25rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-primary)',
            marginBottom: '0.5rem'
          }}>
            <Upload size={32} className="dropzone-icon" />
          </div>
          <div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
              Drag and drop your employee ledger CSV
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              or click here to search local files
            </p>
          </div>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            backgroundColor: 'var(--color-danger-glow)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginTop: '1.5rem',
            color: 'var(--color-danger)',
            fontSize: '0.85rem',
            textAlign: 'left'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <div>
              <strong style={{ display: 'block', marginBottom: '0.2rem' }}>Import failed</strong>
              {error}
            </div>
          </div>
        )}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '1rem', 
          marginTop: '2rem', 
          borderTop: '1px solid var(--border-color)', 
          paddingTop: '1.5rem' 
        }}>
          <button 
            type="button"
            onClick={handleDownloadTemplate}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '0.65rem' }}
          >
            <Download size={16} />
            Download Template
          </button>
          
          <button 
            type="button"
            onClick={onLoadSampleData}
            className="btn btn-primary"
            style={{ 
              fontSize: '0.85rem', 
              padding: '0.65rem',
              background: 'linear-gradient(135deg, var(--color-primary), #4f46e5)'
            }}
          >
            <Play size={16} />
            Load Sample Data
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '1.5rem', padding: '1.25rem 1.5rem', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={16} style={{ color: 'var(--color-primary)' }} />
          Required Column Headers
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Your file must contain a header row. Ensure that headers match these names (order does not matter):
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {['id', 'name', 'title', 'jobFamily', 'level', 'baseSalary'].map(field => (
            <span key={field} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)'
            }}>
              {field}
            </span>
          ))}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
          Optional fields: <code style={{ fontSize: '0.7rem' }}>equity</code>, <code style={{ fontSize: '0.7rem' }}>bonus</code>, <code style={{ fontSize: '0.7rem' }}>gender</code> (for parity audits), <code style={{ fontSize: '0.7rem' }}>tenureMonths</code>.
        </p>
      </div>
    </div>
  );
};
