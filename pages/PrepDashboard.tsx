
import React, { useState } from 'react';
import { Student, AcademicLevel, RegistrationStatus, ScheduleRequest } from '../types';
import { FileUp, Send, CheckCircle2, History, Info, LayoutList, MessageSquarePlus, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface PrepDashboardProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  requests: ScheduleRequest[];
  setRequests: React.Dispatch<React.SetStateAction<ScheduleRequest[]>>;
}

const PrepDashboard: React.FC<PrepDashboardProps> = ({ students, setStudents, requests, setRequests }) => {
  const [activeTab, setActiveTab] = useState<'placement' | 'adjustments'>('placement');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [requestType, setRequestType] = useState<'Section Change' | 'English Shift' | 'Special Needs'>('Section Change');
  const [requestDetails, setRequestDetails] = useState('');

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
            const isPromoted = eng.toLowerCase() === 'promoted' && math.toLowerCase() === 'promoted';
            const level = isPromoted ? AcademicLevel.FRESHMAN : AcademicLevel.PREP;

            const existingIndex = updatedStudents.findIndex(s => s.id === rowId);

            if (existingIndex !== -1) {
              updatedStudents[existingIndex] = {
                ...updatedStudents[existingIndex],
                englishPlacement: eng,
                mathPlacement: math,
                academicLevel: level,
                updatedAt: new Date().toISOString()
              };
              updateCount++;
            } else {
              // Create new record if ID doesn't exist (Backup behavior)
              updatedStudents.push({
                id: rowId,
                name: String(row.Name || row.name || 'External Record'),
                gender: 'Male',
                admittedMajor: 'Not Provided',
                term: '241',
                englishPlacement: eng,
                mathPlacement: math,
                academicLevel: level,
                status: RegistrationStatus.UNDER_PROCESS,
                updatedAt: new Date().toISOString()
              });
              newCount++;
            }
          });

          alert(`Placement update complete: ${updateCount} students updated, ${newCount} new records created.`);
          return updatedStudents;
        });

      } catch (err) {
        console.error(err);
        alert("Error parsing file. Ensure columns include ID, English, and Math.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadPlacementTemplate = () => {
    const templateData = [
      { ID: '20241001', English: 'Promoted', Math: 'MATH001' },
      { ID: '20241002', English: 'ENGL001', Math: 'Promoted' }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Placements");
    XLSX.writeFile(wb, "Student_Placement_Template.xlsx");
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) {
      alert("Student ID not found.");
      return;
    }

    const newRequest: ScheduleRequest = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: student.id,
      studentName: student.name,
      requestType,
      details: requestDetails,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    setRequests(prev => [newRequest, ...prev]);
    setRequestDetails('');
    setSelectedStudentId('');
    alert("Schedule adjustment request sent to Registrar.");
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-4 hover:border-sky-300 transition-colors bg-slate-50/30 group">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-slate-400 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                  <FileUp size={32} className="group-hover:text-sky-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Drop Placement Excel here</p>
                  <p className="text-sm text-slate-400">Match by ID to update status</p>
                </div>
                <label className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl cursor-pointer hover:bg-slate-800 transition-all font-medium shadow-lg shadow-slate-200">
                  Import Test Results
                  <input type="file" className="hidden" onChange={handlePlacementUpload} accept=".xlsx, .xls, .csv" />
                </label>
              </div>

              <div className="bg-sky-50 rounded-2xl p-6 flex flex-col justify-center border border-sky-100">
                 <div className="flex gap-3 mb-4">
                    <Info className="text-sky-600 flex-shrink-0" size={24} />
                    <h4 className="font-bold text-sky-900">Department Workflow</h4>
                 </div>
                 <p className="text-sm text-sky-800 leading-relaxed mb-4">
                   Once you upload placements, the data is synced across the portal:
                 </p>
                 <ul className="space-y-3">
                   <li className="flex items-center gap-2 text-sm text-sky-900 font-semibold bg-white p-2 rounded-lg border border-sky-100 shadow-sm">
                     <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                     Matched students update their Level & Placement
                   </li>
                   <li className="flex items-center gap-2 text-sm text-sky-900 font-semibold bg-white p-2 rounded-lg border border-sky-100 shadow-sm">
                     <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                     Registrar sees updates in their Master List
                   </li>
                 </ul>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><History size={24} /></div>
                  <h2 className="text-xl font-bold text-slate-900">Live Status Monitor</h2>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  REAL-TIME SYNC
                </div>
             </div>

             <div className="overflow-x-auto rounded-xl border border-slate-100">
               <table className="w-full text-left">
                 <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                   <tr>
                     <th className="px-6 py-4">Student</th>
                     <th className="px-6 py-4">Current Placement</th>
                     <th className="px-6 py-4">Academic Level</th>
                     <th className="px-6 py-4 text-center">Registration Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {students.map(s => (
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
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Request Form */}
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
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Target Student</label>
                  <select 
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-medium text-slate-700"
                  >
                    <option value="">Select Student ID</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.id} - {s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Request Type</label>
                  <div className="flex flex-col gap-2">
                    {(['Section Change', 'English Shift', 'Special Needs'] as const).map(type => (
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

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Specific Details</label>
                  <textarea
                    value={requestDetails}
                    onChange={(e) => setRequestDetails(e.target.value)}
                    placeholder="Provide justification and specific course/section codes..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all h-32 resize-none text-slate-900 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!selectedStudentId || !requestDetails}
                  className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Send to Registrar
                </button>
              </form>
            </div>
          </div>

          {/* Request History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><LayoutList size={24} /></div>
                    <h2 className="text-xl font-bold text-slate-900">Recent History</h2>
                  </div>
               </div>

               <div className="space-y-4">
                 {requests.length === 0 ? (
                   <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                      <LayoutList size={40} className="mx-auto mb-4 opacity-20" />
                      <p className="font-medium">No adjustment requests submitted yet</p>
                   </div>
                 ) : (
                   requests.map((request) => (
                     <div key={request.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:bg-white hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                           <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                request.status === 'Processed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {request.status === 'Processed' ? 'FINISHED' : 'PENDING REGISTRAR'}
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
                        
                        {request.status === 'Processed' && (
                          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600">
                             <CheckCircle2 size={16} />
                             Registrar has completed this adjustment
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
