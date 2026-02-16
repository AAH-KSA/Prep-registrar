
import React, { useState, useMemo } from 'react';
import { Student, AcademicLevel, RegistrationStatus, ScheduleRequest, ActivityLog } from '../types';
import { FileUp, Send, CheckCircle2, History, Info, LayoutList, MessageSquarePlus, Download, Search, Hash, Book, RotateCcw } from 'lucide-react';
import * as XLSX from 'xlsx';

interface PrepDashboardProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  requests: ScheduleRequest[];
  setRequests: React.Dispatch<React.SetStateAction<ScheduleRequest[]>>;
  addLog: (type: ActivityLog['type'], description: string, actor: string, studentId?: string, studentName?: string) => void;
}

const COURSE_LIST = [
  'ENGL001', 'ENGL002', 'ENGL003', 'ENGL004', 'ENGL005', 
  'MATH001', 'MATH002', 'MATH012', 
  'PYP 001', 'PYP 002', 
  'Modular Courses', 
  'PE 001', 'PE 002'
];

const PrepDashboard: React.FC<PrepDashboardProps> = ({ students, setStudents, requests, setRequests, addLog }) => {
  const [activeTab, setActiveTab] = useState<'placement' | 'adjustments'>('placement');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [requestType, setRequestType] = useState<'Section Change' | 'English Shift'>('Section Change');
  const [requestDetails, setRequestDetails] = useState('');
  
  const [sectionNumber, setSectionNumber] = useState('');
  const [courseName, setCourseName] = useState('');

  const [statusSearch, setStatusSearch] = useState('');
  const [requestSearch, setRequestSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');

  const selectedStudent = useMemo(() => 
    students.find(s => s.id === selectedStudentId), 
    [students, selectedStudentId]
  );

  const isPrepSectionChange = selectedStudent?.academicLevel === AcademicLevel.PREP && requestType === 'Section Change';

  const handlePlacementUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        setStudents(prev => {
          const updatedStudents = [...prev];
          let updateCount = 0;
          let newCount = 0;

          data.forEach((row: any) => {
            const rowId = String(row.ID || row.id || '');
            if (!rowId) return;

            const eng = String(row.English || row.english || 'ENGL001');
            const math = String(row.Math || row.math || 'MATH001');
            
            const engSec = row['English Section'] || row.english_section ? String(row['English Section'] || row.english_section) : undefined;
            const mathSec = row['Math Section'] || row.math_section ? String(row['Math Section'] || row.math_section) : undefined;
            
            const isPromoted = eng.toLowerCase() === 'promoted' && math.toLowerCase() === 'promoted';
            const level = isPromoted ? AcademicLevel.FRESHMAN : AcademicLevel.PREP;

            const existingIndex = updatedStudents.findIndex(s => s.id === rowId);

            const detailString = `English: ${eng} (Sec: ${engSec || 'N/A'}) | Math: ${math} (Sec: ${mathSec || 'N/A'})`;

            if (existingIndex !== -1) {
              updatedStudents[existingIndex] = {
                ...updatedStudents[existingIndex],
                englishPlacement: eng,
                mathPlacement: math,
                academicLevel: level,
                englishSection: engSec || updatedStudents[existingIndex].englishSection,
                mathSection: mathSec || updatedStudents[existingIndex].mathSection,
                status: RegistrationStatus.UNDER_PROCESS,
                updatedAt: new Date().toISOString()
              };
              updateCount++;
              addLog('Placement', `Updated Data: ${detailString}. Status reset to Under Process.`, 'Prep Dept', rowId, updatedStudents[existingIndex].name);
            } else {
              const newName = String(row.Name || row.name || 'External Record');
              updatedStudents.push({
                id: rowId,
                name: newName,
                gender: 'Male',
                admittedMajor: 'Not Provided',
                term: '241',
                englishPlacement: eng,
                mathPlacement: math,
                academicLevel: level,
                englishSection: engSec,
                mathSection: mathSec,
                status: RegistrationStatus.UNDER_PROCESS,
                updatedAt: new Date().toISOString()
              });
              newCount++;
              addLog('Placement', `New Record: ${detailString}. Status: Under Process.`, 'Prep Dept', rowId, newName);
            }
          });

          alert(`Placement update complete: ${updateCount} students updated, ${newCount} new records created. All updated records reset to Under Process.`);
          return updatedStudents;
        });

      } catch (err) {
        console.error(err);
        alert("Error parsing file. Ensure columns include ID, English, Math, 'English Section', and 'Math Section'.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadPlacementTemplate = () => {
    const templateData = [
      { ID: '20241001', English: 'Promoted', Math: 'MATH001', 'English Section': '45', 'Math Section': '55' },
      { ID: '20241002', English: 'ENGL001', Math: 'Promoted', 'English Section': '10', 'Math Section': '20' }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Placements");
    XLSX.writeFile(wb, "Student_Placement_Template.xlsx");
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert("Student ID not found.");
      return;
    }

    let finalDetails = requestDetails;
    if (isPrepSectionChange) {
      finalDetails = `[COURSE: ${courseName} | NEW SECTION: ${sectionNumber}]${requestDetails ? ' - ' + requestDetails : ''}`;
    }

    const newRequest: ScheduleRequest = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      requestType,
      details: finalDetails || 'No justification provided.',
      courseName: isPrepSectionChange ? courseName : undefined,
      sectionNumber: isPrepSectionChange ? sectionNumber : undefined,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    setRequests(prev => [newRequest, ...prev]);
    addLog('Adjustment', `Submitted ${requestType}: ${finalDetails || 'Request sent.'}`, 'Prep Dept', selectedStudent.id, selectedStudent.name);
    
    setRequestDetails('');
    setSectionNumber('');
    setCourseName('');
    setSelectedStudentId('');
    setRequestSearch('');
    alert("Schedule adjustment request sent to Registrar.");
  };

  const filteredStatusStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(statusSearch.toLowerCase()) || 
      s.id.toLowerCase().includes(statusSearch.toLowerCase())
    );
  }, [students, statusSearch]);

  const filteredRequestStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(requestSearch.toLowerCase()) || 
      s.id.toLowerCase().includes(requestSearch.toLowerCase())
    );
  }, [students, requestSearch]);

  const filteredHistory = useMemo(() => {
    const search = historySearch.toLowerCase();
    return requests.filter(r => 
      r.studentName.toLowerCase().includes(search) ||
      r.studentId.toLowerCase().includes(search) ||
      r.requestType.toLowerCase().includes(search) ||
      r.details.toLowerCase().includes(search)
    );
  }, [requests, historySearch]);

  const isSubmitDisabled = !selectedStudentId || (isPrepSectionChange && (!sectionNumber || !courseName));

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('placement')}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all border-b-2 ${
            activeTab === 'placement' ? 'border-sky-600 text-sky-600 bg-sky-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileUp size={18} />
          Placement Control
        </button>
        <button 
          onClick={() => setActiveTab('adjustments')}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all border-b-2 ${
            activeTab === 'adjustments' ? 'border-sky-600 text-sky-600 bg-sky-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <MessageSquarePlus size={18} />
          Schedule Adjustments
        </button>
      </div>

      {activeTab === 'placement' ? (
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-100 text-sky-600 rounded-lg"><FileUp size={24} /></div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Placement Processing</h2>
                  <p className="text-sm text-slate-500">Update existing students with test results</p>
                </div>
              </div>
              <button 
                onClick={downloadPlacementTemplate}
                className="flex items-center gap-2 text-xs font-bold text-sky-600 bg-sky-50 px-3 py-2 rounded-lg hover:bg-sky-100 transition-colors"
              >
                <Download size={14} />
                Download Placement Template
              </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-4 hover:border-sky-300 transition-colors bg-slate-50/30 group">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-slate-400 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                  <FileUp size={32} className="group-hover:text-sky-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Drop Placement Excel here</p>
                  <p className="text-sm text-slate-400">Include 'English Section' and 'Math Section' columns</p>
                </div>
                <label className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl cursor-pointer hover:bg-slate-800 transition-all font-medium shadow-lg shadow-slate-200">
                  Import Test Results
                  <input type="file" className="hidden" onChange={handlePlacementUpload} accept=".xlsx, .xls, .csv" />
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><History size={24} /></div>
                  <h2 className="text-xl font-bold text-slate-900">Live Status Monitor</h2>
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search student by Name or ID..."
                    value={statusSearch}
                    onChange={(e) => setStatusSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all text-sm font-medium text-slate-400"
                  />
                </div>
             </div>

             <div className="overflow-x-auto rounded-xl border border-slate-100">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                   <tr>
                     <th className="px-6 py-4">Student</th>
                     <th className="px-6 py-4">Placement</th>
                     <th className="px-6 py-4">Section Number</th>
                     <th className="px-6 py-4">Academic Level</th>
                     <th className="px-6 py-4 text-center">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {filteredStatusStudents.length === 0 ? (
                     <tr>
                       <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                         No students found matching your search.
                       </td>
                     </tr>
                   ) : (
                     filteredStatusStudents.map(s => (
                       <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{s.name}</div>
                            <div className="text-xs text-slate-400 font-mono font-bold uppercase">{s.id}</div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex gap-2">
                               <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] border border-slate-200 font-bold text-slate-600">E: {s.englishPlacement}</span>
                               <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] border border-slate-200 font-bold text-slate-600">M: {s.mathPlacement}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                           <span className="text-sm font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                             E:{s.englishSection || '-'} M:{s.mathSection || '-'}
                           </span>
                         </td>
                         <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${s.academicLevel === 'Prep' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {s.academicLevel}
                           </span>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${s.status === RegistrationStatus.REGISTERED ? 'text-emerald-600' : 'text-amber-600'}`}>
                               {s.status === RegistrationStatus.REGISTERED ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>}
                               {s.status}
                            </span>
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Send size={24} /></div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">New Request</h2>
                  <p className="text-sm text-slate-500">Submit adjustment to Registrar</p>
                </div>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">Target Student</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="Type name or ID to filter..."
                      value={requestSearch}
                      onChange={(e) => setRequestSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-t-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all text-xs font-medium text-slate-400"
                    />
                  </div>
                  <select 
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full p-3 bg-white border border-t-0 border-slate-200 rounded-b-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-medium text-slate-700 text-sm"
                    size={5}
                  >
                    <option value="" disabled className="text-slate-400">Select from results...</option>
                    {filteredRequestStudents.length === 0 ? (
                      <option disabled>No students found</option>
                    ) : (
                      filteredRequestStudents.map(s => (
                        <option key={s.id} value={s.id}>{s.id} - {s.name}</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Request Type</label>
                  <div className="flex flex-col gap-2">
                    {(['Section Change', 'English Shift'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setRequestType(type)}
                        className={`p-3 text-sm font-bold rounded-xl border text-left transition-all ${
                          requestType === type 
                            ? 'bg-sky-600 border-sky-600 text-white shadow-md shadow-sky-100' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {isPrepSectionChange && (
                  <div className="space-y-4 p-4 bg-sky-50 rounded-xl border border-sky-100 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-sky-700 font-bold text-xs uppercase mb-1">
                      <Info size={14} />
                      Prep Details Required
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-black text-sky-600 uppercase mb-1">Course Name</label>
                        <div className="relative">
                          <Book className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" size={14} />
                          <select
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-sky-200 rounded-lg text-sm font-semibold text-slate-500 focus:ring-2 focus:ring-sky-400 outline-none"
                          >
                            <option value="">Select Course...</option>
                            {COURSE_LIST.map(course => (
                              <option key={course} value={course}>{course}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-sky-600 uppercase mb-1">Target Section</label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" size={14} />
                          <input
                            type="text"
                            placeholder="e.g. 104"
                            value={sectionNumber}
                            onChange={(e) => setSectionNumber(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-sky-200 rounded-lg text-sm font-semibold text-slate-500 focus:ring-2 focus:ring-sky-400 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Specific Justification <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <textarea
                    value={requestDetails}
                    onChange={(e) => setRequestDetails(e.target.value)}
                    placeholder="Provide additional details or reasons..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all h-24 resize-none text-slate-400 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Send to Registrar
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
               <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><LayoutList size={24} /></div>
                    <h2 className="text-xl font-bold text-slate-900">Recent History</h2>
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="Search history..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all text-sm font-medium text-slate-400"
                    />
                  </div>
               </div>

               <div className="space-y-4">
                 {filteredHistory.length === 0 ? (
                   <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                      <LayoutList size={40} className="mx-auto mb-4 opacity-20" />
                      <p className="font-medium">
                        {historySearch ? 'No adjustment requests match your search' : 'No adjustment requests submitted yet'}
                      </p>
                   </div>
                 ) : (
                   filteredHistory.map((request) => (
                     <div key={request.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:bg-white hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                           <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                request.status === 'Registered' ? 'bg-emerald-100 text-emerald-700' : 
                                request.status === 'Needs Revision' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-200 text-slate-600'
                              }`}>
                                {request.status === 'Registered' ? 'REGISTERED' : 
                                 request.status === 'Needs Revision' ? 'REVISION NEEDED' : 
                                 'PENDING REGISTRAR'}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">
                                #{request.id}
                              </span>
                           </div>
                           <span className="text-xs font-medium text-slate-400">
                             {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>
                        
                        <div className="mb-3">
                          <h4 className="font-black text-slate-900">{request.studentName} <span className="text-slate-400 text-sm font-normal">({request.studentId})</span></h4>
                          <span className="text-[11px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 inline-block mt-1">
                            {request.requestType}
                          </span>
                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed bg-white/50 p-3 rounded-xl border border-slate-100 italic">
                          "{request.details}"
                        </p>
                        
                        {request.status === 'Registered' && (
                          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600">
                             <CheckCircle2 size={16} />
                             Registrar has officially registered this adjustment
                          </div>
                        )}

                        {request.status === 'Needs Revision' && (
                          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-600">
                             <RotateCcw size={16} />
                             Registrar requested a revision. Please review and update details.
                          </div>
                        )}
                     </div>
                   ))
                 )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrepDashboard;
