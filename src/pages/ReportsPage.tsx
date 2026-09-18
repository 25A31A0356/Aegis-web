import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { ReportStepIndicator } from '../components/reports/ReportStepIndicator';
import { HazardTypeSelector } from '../components/reports/HazardTypeSelector';
import { LocationPickerMap } from '../components/reports/LocationPickerMap';
import { MediaCaptureUploader } from '../components/reports/MediaCaptureUploader';
import { DescriptionAndSeverity } from '../components/reports/DescriptionAndSeverity';
import { ReportSuccessReceipt } from '../components/reports/ReportSuccessReceipt';
import { RecentCitizenReportsList } from '../components/reports/RecentCitizenReportsList';
import { ReportService } from '../services/reportService';
import { CitizenReport, ReportHazardType, ReportMediaItem, ReportSeverity } from '../types/report';
import { useLocation } from '../context/LocationContext';
import { Send, Loader2, AlertCircle, Sparkles } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { weather, userCoordinates } = useLocation();

  // Wizard State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submittedReport, setSubmittedReport] = useState<CitizenReport | null>(null);

  // Form State
  const [hazardType, setHazardType] = useState<ReportHazardType | ''>('flood');
  const [hazardLabel, setHazardLabel] = useState<string>('Urban Flooding');
  const [location, setLocation] = useState({
    lat: userCoordinates ? userCoordinates[0] : weather.coordinates[0],
    lng: userCoordinates ? userCoordinates[1] : weather.coordinates[1],
    address: `${weather.cityName} Metropolitan Corridor, ${weather.stateName}`,
    city: weather.cityName,
    state: weather.stateName,
  });
  const [mediaList, setMediaList] = useState<ReportMediaItem[]>([]);
  const [description, setDescription] = useState<string>('');
  const [severity, setSeverity] = useState<ReportSeverity>('high');
  const [peopleAffected, setPeopleAffected] = useState<string>('5-20');
  const [isRoadBlocked, setIsRoadBlocked] = useState<boolean | 'partial'>(true);
  const [isImmediateDanger, setIsImmediateDanger] = useState<boolean>(false);
  const [reporterName, setReporterName] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);

  // Handlers
  const handleSelectHazard = (hType: ReportHazardType, label: string) => {
    setHazardType(hType);
    setHazardLabel(label);
    setValidationError(null);
  };

  const handleAddMedia = (item: ReportMediaItem) => {
    setMediaList((prev) => [...prev, item]);
  };

  const handleRemoveMedia = (id: string) => {
    setMediaList((prev) => prev.filter((m) => m.id !== id));
  };

  const validateForm = (): boolean => {
    if (!hazardType) {
      setValidationError('Please select a hazard category.');
      setCurrentStep(1);
      return false;
    }
    if (!location.address || !location.lat || !location.lng) {
      setValidationError('Please verify the incident location.');
      setCurrentStep(2);
      return false;
    }
    if (!description || description.trim().length < 10) {
      setValidationError('Please provide at least 10 characters describing the observed incident.');
      setCurrentStep(4);
      return false;
    }
    if (!severity) {
      setValidationError('Please select a severity level.');
      setCurrentStep(4);
      return false;
    }
    return true;
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await ReportService.submitReport({
        hazardType: hazardType as ReportHazardType,
        hazardLabel,
        location,
        media: mediaList,
        description,
        severity,
        optionalDetails: {
          peopleAffectedEstimate: peopleAffected,
          isRoadBlocked,
          isImmediateDanger,
        },
        reporter: {
          name: isAnonymous ? undefined : reporterName,
          isAnonymous,
        },
      });

      setSubmittedReport(result);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedReport(null);
    setCurrentStep(1);
    setDescription('');
    setMediaList([]);
    setValidationError(null);
  };

  return (
    <div className="max-w-[1720px] mx-auto space-y-6 font-sans select-none pb-8">
      {/* 1. Page Header */}
      <PageHeader
        title="Report an Incident"
        subtitle="Help authorities understand what is happening around you."
        badge="CITIZEN INTEL"
        badgeVariant="cyan"
      />

      {/* If report is submitted, show receipt */}
      {submittedReport ? (
        <ReportSuccessReceipt
          report={submittedReport}
          onFileAnother={handleResetForm}
        />
      ) : (
        <form onSubmit={handleSubmitReport} className="space-y-6">
          {/* Step Flow Indicator */}
          <ReportStepIndicator
            currentStep={currentStep}
            onStepClick={(step) => setCurrentStep(step)}
          />

          {/* Validation Error Banner */}
          {validationError && (
            <div className="p-4 rounded-2xl bg-[#FEF1F3] border border-[#FDC8D1] text-[#E94B68] text-xs font-bold flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{validationError}</span>
              </div>
              <button
                type="button"
                onClick={() => setValidationError(null)}
                className="text-[#E94B68] underline text-xs"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Step 1: Hazard Type Selection */}
          <HazardTypeSelector
            selectedHazard={hazardType}
            onSelectHazard={handleSelectHazard}
          />

          {/* Step 2: Location Picker with Interactive Map */}
          <LocationPickerMap
            location={location}
            onChangeLocation={setLocation}
          />

          {/* Step 3: Media Upload & Camera Capture */}
          <MediaCaptureUploader
            mediaList={mediaList}
            onAddMedia={handleAddMedia}
            onRemoveMedia={handleRemoveMedia}
          />

          {/* Step 4: Description & Severity */}
          <DescriptionAndSeverity
            description={description}
            onChangeDescription={setDescription}
            severity={severity}
            onChangeSeverity={setSeverity}
            peopleAffected={peopleAffected}
            onChangePeopleAffected={setPeopleAffected}
            isRoadBlocked={isRoadBlocked}
            onChangeRoadBlocked={setIsRoadBlocked}
            isImmediateDanger={isImmediateDanger}
            onChangeImmediateDanger={setIsImmediateDanger}
            reporterName={reporterName}
            onChangeReporterName={setReporterName}
            isAnonymous={isAnonymous}
            onChangeIsAnonymous={setIsAnonymous}
          />

          {/* Submit Action Bar */}
          <div className="bg-white rounded-[24px] border border-[#DCEBED] p-5 sm:p-6 shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-[#18364A] font-sans">
                Ready to submit emergency report?
              </h4>
              <p className="text-xs text-[#708696] mt-0.5">
                Your report will be reviewed by district civil defense dispatchers immediately.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[#075B8A] hover:bg-[#0B6E9E] disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-[#075B8A]/25 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#18C3D0]" />
                  <span>Submitting & Dispatching Report...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-[#18C3D0]" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Community Submitted Reports Feed */}
      <RecentCitizenReportsList />
    </div>
  );
};
