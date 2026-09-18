import React, { useState } from 'react';
import {
  Flame,
  CloudRain,
  Mountain,
  AlertOctagon,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Radio,
  FileImage,
} from 'lucide-react';
import { CitizenReport } from '../../types/report';
import { ReportService } from '../../services/reportService';

interface RecentCitizenReportsListProps {
  onSelectReport?: (report: CitizenReport) => void;
}

export const RecentCitizenReportsList: React.FC<RecentCitizenReportsListProps> = ({
  onSelectReport,
}) => {
  const [reports] = useState<CitizenReport[]>(() => ReportService.getAllReports());
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending_review'>('all');

  const filtered = reports.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const getStatusBadge = (status: CitizenReport['status']) => {
    switch (status) {
      case 'verified':
        return 'bg-[#EFFCF6] text-[#1E8A63] border-[#B7F1DC]';
      case 'dispatched':
        return 'bg-[#EDFAFC] text-[#075B8A] border-[#AEEBF0]';
      case 'pending_review':
      default:
        return 'bg-[#FFFBF0] text-[#B78809] border-[#FDE8A4]';
    }
  };

  const formatStatusLabel = (status: CitizenReport['status']) => {
    switch (status) {
      case 'verified':
        return 'Verified by Ops';
      case 'dispatched':
        return 'Rescue Dispatched';
      case 'pending_review':
      default:
        return 'Pending Review';
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-[#DCEBED] p-5 sm:p-6 shadow-card space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#DCEBED] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#18C3D0] animate-pulse" />
            <h3 className="text-sm font-bold text-[#18364A] font-sans">
              Recent Citizen Field Reports ({reports.length})
            </h3>
          </div>
          <p className="text-xs text-[#708696] mt-0.5">
            Real-time multi-hazard bulletins filed by citizens across India.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-[#075B8A] text-white'
                : 'bg-[#F4F8FA] text-[#708696] hover:bg-[#EEF5F8]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending_review')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
              filter === 'pending_review'
                ? 'bg-[#075B8A] text-white'
                : 'bg-[#F4F8FA] text-[#708696] hover:bg-[#EEF5F8]'
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
              filter === 'verified'
                ? 'bg-[#075B8A] text-white'
                : 'bg-[#F4F8FA] text-[#708696] hover:bg-[#EEF5F8]'
            }`}
          >
            Verified
          </button>
        </div>
      </div>

      {/* Reports Grid / Stack */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map((report) => (
          <div
            key={report.id}
            onClick={() => onSelectReport && onSelectReport(report)}
            className="group p-4 rounded-2xl bg-[#F4F8FA] hover:bg-[#EEF5F8] border border-[#DCEBED] hover:border-[#18C3D0] transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Top Row: Report ID & Status */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DCEBED]">
                <span className="text-[10px] font-mono font-bold text-[#075B8A]">
                  {report.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${getStatusBadge(
                    report.status
                  )}`}
                >
                  {formatStatusLabel(report.status)}
                </span>
              </div>

              {/* Hazard & Description */}
              <h4 className="text-xs font-bold text-[#18364A] group-hover:text-[#075B8A] transition-colors line-clamp-1">
                {report.hazardLabel || report.hazardType}
              </h4>
              <p className="text-xs text-[#708696] leading-relaxed line-clamp-2 mt-1">
                {report.description}
              </p>
            </div>

            {/* Bottom Row: Location & Timestamp */}
            <div className="pt-2 mt-3 border-t border-[#DCEBED] flex items-center justify-between text-[10px] text-[#708696] font-mono">
              <span className="truncate max-w-[140px] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#E94B68] shrink-0" />
                {report.location.city}, {report.location.state}
              </span>
              <span>{report.timestamp.split(',')[0]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
