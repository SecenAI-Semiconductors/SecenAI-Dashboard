import { useState, useEffect, useMemo } from 'react';
import './CropInsuranceManagement.css';
import { InsuranceTable } from './InsuranceTable';
import { AdminInsuranceDrawer } from './AdminInsuranceDrawer';
import { ReviewActionModal } from './ReviewActionModal';

export function CropInsuranceManagement() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [cropFilter, setCropFilter] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');

  const [selectedApp, setSelectedApp] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [actionModal, setActionModal] = useState({ isOpen: false, type: null }); // type: 'approve', 'reject', 'review'

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/insurance`);
      if (!res.ok) throw new Error('Failed to fetch insurance applications');
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Compute unique values for filters
  const cropOptions = useMemo(() => [...new Set(applications.map(a => a.cropName))].filter(Boolean).sort(), [applications]);
  const stateOptions = useMemo(() => [...new Set(applications.map(a => a.state))].filter(Boolean).sort(), [applications]);
  const districtOptions = useMemo(() => [...new Set(applications.map(a => a.district))].filter(Boolean).sort(), [applications]);

  // Derived filtered data
  const filteredApps = useMemo(() => {
    return applications.filter(app => {
      const matchSearch = 
        app.farmerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.cropName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.state?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = statusFilter === 'All' || app.status === statusFilter;
      const matchCrop = cropFilter === 'All' || app.cropName === cropFilter;
      const matchState = stateFilter === 'All' || app.state === stateFilter;
      const matchDistrict = districtFilter === 'All' || app.district === districtFilter;

      return matchSearch && matchStatus && matchCrop && matchState && matchDistrict;
    });
  }, [applications, searchQuery, statusFilter, cropFilter, stateFilter, districtFilter]);

  // Derived metrics
  const metrics = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter(a => a.status === 'Pending').length,
      reviewRequired: applications.filter(a => a.status === 'Review Required').length,
      approved: applications.filter(a => a.status === 'Approved').length,
      rejected: applications.filter(a => a.status === 'Rejected').length,
      resubmitted: applications.filter(a => a.status === 'Resubmitted').length,
    };
  }, [applications]);

  // Actions
  const handleView = (app) => {
    setSelectedApp(app);
    setIsDrawerOpen(true);
  };

  const handleActionClick = (app, type) => {
    setSelectedApp(app);
    setActionModal({ isOpen: true, type });
  };

  const submitAction = async (type, remarks) => {
    if (!selectedApp) return;
    
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/api/insurance/${selectedApp._id}/${type}`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminRemarks: remarks })
      });

      if (!res.ok) throw new Error('Action failed');
      
      // Refresh data
      await fetchApplications();
      setActionModal({ isOpen: false, type: null });
      if (isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="dashboard-view" id="cim-dashboard">
      <section className="dashboard-content">
        <div className="cim-header">
          <div className="cim-header-left">
            <h1>Crop Insurance Management</h1>
            <p>Review, approve, and manage farmer insurance applications.</p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="cim-metrics-grid">
          <div className="cim-metric-card">
            <span className="cim-metric-title">Total Applications</span>
            <span className="cim-metric-value">{metrics.total}</span>
          </div>
          <div className="cim-metric-card pending">
            <span className="cim-metric-title">Pending</span>
            <span className="cim-metric-value">{metrics.pending + metrics.resubmitted}</span>
          </div>
          <div className="cim-metric-card review">
            <span className="cim-metric-title">Review Required</span>
            <span className="cim-metric-value">{metrics.reviewRequired}</span>
          </div>
          <div className="cim-metric-card approved">
            <span className="cim-metric-title">Approved</span>
            <span className="cim-metric-value">{metrics.approved}</span>
          </div>
          <div className="cim-metric-card rejected">
            <span className="cim-metric-title">Rejected</span>
            <span className="cim-metric-value">{metrics.rejected}</span>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="cim-filters-section">
          <div className="cim-search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input 
              type="text" 
              className="cim-search-input" 
              placeholder="Search by ID, Farmer, Crop, Location..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="cim-filters">
            <select className="cim-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Review Required">Review Required</option>
              <option value="Resubmitted">Resubmitted</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select className="cim-filter-select" value={cropFilter} onChange={e => setCropFilter(e.target.value)}>
              <option value="All">All Crops</option>
              {cropOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select className="cim-filter-select" value={stateFilter} onChange={e => setStateFilter(e.target.value)}>
              <option value="All">All States</option>
              {stateOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select className="cim-filter-select" value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}>
              <option value="All">All Districts</option>
              {districtOptions.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="cim-loading">Loading applications...</div>
        ) : error ? (
          <div className="cim-error">{error}</div>
        ) : (
          <InsuranceTable 
            applications={filteredApps} 
            onView={handleView}
            onReview={handleActionClick}
          />
        )}
      </section>

      {/* Drawer */}
      <AdminInsuranceDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        application={selectedApp}
        onAction={handleActionClick}
      />

      {/* Action Modal */}
      {actionModal.isOpen && (
        <ReviewActionModal 
          type={actionModal.type}
          onClose={() => setActionModal({ isOpen: false, type: null })}
          onSubmit={(remarks) => submitAction(actionModal.type, remarks)}
        />
      )}
    </div>
  );
}
