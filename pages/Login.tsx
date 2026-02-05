
import React, { useState } from 'react';
import { UserRole } from '../types';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCog, User } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole, studentId?: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');

  const handleRoleSelect = (role: UserRole) => {
    if (role === UserRole.STUDENT) {
      if (!studentId) {
        alert('Please enter a Student ID (e.g., 20231001)');
        return;
      }
      onLogin(role, studentId);
      navigate('/student');
    } else {
      onLogin(role);
      navigate(role === UserRole.REGISTRAR ? '/registrar' : '/prep');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-200">
            <span className="text-2xl font-bold text-white">PYP</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Registration Management</h1>
          <p className="text-slate-500 mt-2">Centralized portal for students and staff</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200 p-8 space-y-6">
          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelect(UserRole.REGISTRAR)}
              className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-sky-500 hover:bg-sky-50 transition-all group"
            >
              <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white text-sky-600 transition-colors">
                <ShieldCheck />
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900">Registrar Office</div>
                <div className="text-sm text-slate-500">Upload data, track progress</div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect(UserRole.PREP_DEPT)}
              className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all group"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white text-amber-600 transition-colors">
                <UserCog />
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900">Prep Department</div>
                <div className="text-sm text-slate-500">Upload placement results</div>
              </div>
            </button>
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-400">Student Access</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Student ID</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="20231001"
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
              />
            </div>
            <button
              onClick={() => handleRoleSelect(UserRole.STUDENT)}
              className="w-full flex items-center justify-center gap-2 p-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-semibold"
            >
              <User size={20} />
              View My Status
            </button>
          </div>
        </div>
        
        <p className="text-center text-xs text-slate-400 mt-8">
          Protected by KFUPM Authentication System • v1.0.2
        </p>
      </div>
    </div>
  );
};

export default Login;
