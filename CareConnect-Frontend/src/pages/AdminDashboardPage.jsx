import React, { useState, useEffect } from 'react';
import adminService from '../services/adminService';
import { 
  Users, UserCheck, Calendar, DollarSign, ShieldAlert, 
  CheckCircle, XCircle, Search, Filter, RefreshCw, AlertCircle 
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [auditLogs, setAuditLogs] = useState({ content: [], totalPages: 0, number: 0 });
  
  const [activeTab, setActiveTab] = useState('doctors'); // doctors, users, appointments, audit
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Audit Log Filters
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [auditRoleFilter, setAuditRoleFilter] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditPage, setAuditPage] = useState(0);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const statsRes = await adminService.getStats();
      if (statsRes && statsRes.data) setStats(statsRes.data);

      const doctorsRes = await adminService.getAllDoctors();
      if (doctorsRes && doctorsRes.data) setDoctors(doctorsRes.data);

      const patientsRes = await adminService.getAllPatients();
      if (patientsRes && patientsRes.data) setPatients(patientsRes.data);

      const apptsRes = await adminService.getAllAppointments();
      if (apptsRes && apptsRes.data) setAppointments(apptsRes.data);

      await fetchAuditLogs(0);
    } catch (err) {
      console.error('Failed to load admin dashboard', err);
      setError(err.response?.data?.message || 'Access Denied: Admin authorization required.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async (page = 0) => {
    try {
      const logsRes = await adminService.getAuditLogs({
        actionType: auditActionFilter || undefined,
        userRole: auditRoleFilter || undefined,
        search: auditSearch || undefined,
        page,
        size: 15
      });
      if (logsRes && logsRes.data) {
        setAuditLogs(logsRes.data);
        setAuditPage(page);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleVerifyDoctor = async (doctorId, currentStatus) => {
    try {
      setActionLoading(true);
      await adminService.verifyDoctor(doctorId, !currentStatus);
      setDoctors((prev) =>
        prev.map((d) => (d.id === doctorId ? { ...d, isVerified: !currentStatus } : d))
      );
      // Refresh stats
      const statsRes = await adminService.getStats();
      if (statsRes && statsRes.data) setStats(statsRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update doctor verification status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      setActionLoading(true);
      await adminService.toggleUserStatus(userId, !currentStatus);
      setPatients((prev) =>
        prev.map((p) => (p.id === userId ? { ...p, isActive: !currentStatus } : p))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user active status');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-12 bg-slate-50 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-teal-700 font-semibold">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading Admin Console...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-28 pb-12 bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block bg-teal-600 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-teal-700 transition-colors"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-slate-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Platform metrics, doctor verifications, user control, and security audit logs.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center space-x-2 bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-100 transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Patients</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalPatients}</h3>
            </div>
            <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Doctors</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalDoctors}</h3>
              {stats.pendingVerifications > 0 && (
                <span className="inline-block text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1">
                  {stats.pendingVerifications} pending verification
                </span>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Appointments</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.totalAppointments}</h3>
              <p className="text-xs text-slate-500 mt-1">{stats.completedAppointments} completed</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Platform Revenue</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">₹{stats.totalRevenue ? stats.totalRevenue.toLocaleString() : 0}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-2 sm:gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('doctors')}
          className={`pb-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'doctors'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Doctor Verifications ({doctors.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'users'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          User Management ({patients.length})
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'appointments'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Global Appointments ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'audit'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Security Audit Logs
        </button>
      </div>

      {/* Tab 1: Doctors */}
      {activeTab === 'doctors' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-400 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Doctor</th>
                  <th className="px-6 py-4">Specialization</th>
                  <th className="px-6 py-4">City</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center space-x-3">
                        <img
                          src={doc.profilePictureUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=100&q=80'}
                          alt={doc.name}
                          className="w-9 h-9 rounded-full object-cover border"
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=100&q=80'; }}
                        />
                        <div>
                          <div className="font-bold text-slate-900">{doc.name}</div>
                          <div className="text-xs text-slate-400">{doc.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{doc.specialization || 'General'}</td>
                    <td className="px-6 py-4">{doc.city || 'N/A'}</td>
                    <td className="px-6 py-4">
                      {doc.isVerified ? (
                        <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Pending Approval</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleVerifyDoctor(doc.id, doc.isVerified)}
                        disabled={actionLoading}
                        className={`text-xs font-semibold px-4 py-1.5 rounded-xl transition-all shadow-sm ${
                          doc.isVerified
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {doc.isVerified ? 'Revoke Approval' : 'Approve Doctor'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-400 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Patient Name</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patients.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{usr.name}</td>
                    <td className="px-6 py-4">
                      <div className="text-xs">{usr.email}</div>
                      <div className="text-xs text-slate-400">{usr.mobileNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {usr.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {usr.isActive ? (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(usr.id, usr.isActive)}
                        disabled={actionLoading}
                        className={`text-xs font-semibold px-4 py-1.5 rounded-xl transition-all shadow-sm ${
                          usr.isActive
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {usr.isActive ? 'Deactivate Account' : 'Activate Account'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Appointments */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-400 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Booking ID</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Doctor</th>
                  <th className="px-6 py-4">Date & Slot</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-teal-700">{appt.bookingId}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{appt.patientName}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{appt.doctorName}</td>
                    <td className="px-6 py-4 text-xs">
                      <div>{appt.appointmentDate}</div>
                      <div className="text-slate-400">{appt.timeSlot}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase ${
                          appt.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : appt.status === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">₹{appt.amountPaid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit logs..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <select
              value={auditActionFilter}
              onChange={(e) => setAuditActionFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="">All Action Types</option>
              <option value="USER_LOGIN">USER_LOGIN</option>
              <option value="USER_REGISTER">USER_REGISTER</option>
              <option value="DOCTOR_VERIFICATION">DOCTOR_VERIFICATION</option>
              <option value="APPOINTMENT_BOOKED">APPOINTMENT_BOOKED</option>
              <option value="APPOINTMENT_STATUS_UPDATE">APPOINTMENT_STATUS_UPDATE</option>
              <option value="PRESCRIPTION_CREATED">PRESCRIPTION_CREATED</option>
              <option value="PRESCRIPTION_DOWNLOADED">PRESCRIPTION_DOWNLOADED</option>
              <option value="MEDICAL_HISTORY_ACCESS">MEDICAL_HISTORY_ACCESS</option>
              <option value="UNAUTHORIZED_ACCESS">UNAUTHORIZED_ACCESS</option>
            </select>
            <select
              value={auditRoleFilter}
              onChange={(e) => setAuditRoleFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="">All Roles</option>
              <option value="ROLE_ADMIN">ROLE_ADMIN</option>
              <option value="ROLE_DOCTOR">ROLE_DOCTOR</option>
              <option value="ROLE_PATIENT">ROLE_PATIENT</option>
            </select>
            <button
              onClick={() => fetchAuditLogs(0)}
              className="bg-teal-600 text-white font-semibold px-5 py-2 rounded-xl text-sm hover:bg-teal-700 transition-all shadow-sm"
            >
              Filter
            </button>
          </div>

          {/* Audit Logs Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 font-semibold text-slate-400 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.content.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-400">
                      No audit logs match criteria
                    </td>
                  </tr>
                ) : (
                  auditLogs.content.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-400">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}
                      </td>
                      <td className="px-4 py-3 font-mono font-medium">{log.userId}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {log.userRole}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-semibold text-[10px] px-2 py-0.5 rounded border ${
                            log.actionType === 'UNAUTHORIZED_ACCESS'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-teal-50 text-teal-800 border-teal-200'
                          }`}
                        >
                          {log.actionType}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {log.entityType} ({log.entityId})
                      </td>
                      <td className="px-4 py-3">{log.description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {auditLogs.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-slate-500">
                Page {auditLogs.number + 1} of {auditLogs.totalPages}
              </span>
              <div className="flex space-x-2">
                <button
                  disabled={auditLogs.number === 0}
                  onClick={() => fetchAuditLogs(auditLogs.number - 1)}
                  className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-semibold disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={auditLogs.number + 1 >= auditLogs.totalPages}
                  onClick={() => fetchAuditLogs(auditLogs.number + 1)}
                  className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-semibold disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
