
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { UserRole, Student, ScheduleRequest, AuthState } from './types';
import { MOCK_INITIAL_STUDENTS } from './constants';
import Login from './pages/Login';
import RegistrarDashboard from './pages/RegistrarDashboard';
import PrepDashboard from './pages/PrepDashboard';
import StudentPortal from './pages/StudentPortal';
import { Layout } from './components/Layout';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem('pyp_auth');
    return saved ? JSON.parse(saved) : { role: null };
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('pyp_students');
    return saved ? JSON.parse(saved) : MOCK_INITIAL_STUDENTS;
  });

  const [requests, setRequests] = useState<ScheduleRequest[]>(() => {
    const saved = localStorage.getItem('pyp_requests');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('pyp_auth', JSON.stringify(auth));
  }, [auth]);

  useEffect(() => {
    localStorage.setItem('pyp_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('pyp_requests', JSON.stringify(requests));
  }, [requests]);

  const handleLogout = () => {
    setAuth({ role: null });
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={(role, id) => setAuth({ role, studentId: id })} />} />
        
        <Route element={<Layout role={auth.role} onLogout={handleLogout} />}>
          <Route 
            path="/registrar" 
            element={auth.role === UserRole.REGISTRAR ? 
              <RegistrarDashboard students={students} setStudents={setStudents} requests={requests} setRequests={setRequests} /> : 
              <Navigate to="/login" />} 
          />
          <Route 
            path="/prep" 
            element={auth.role === UserRole.PREP_DEPT ? 
              <PrepDashboard students={students} setStudents={setStudents} requests={requests} setRequests={setRequests} /> : 
              <Navigate to="/login" />} 
          />
          <Route 
            path="/student" 
            element={auth.role === UserRole.STUDENT ? 
              <StudentPortal student={students.find(s => s.id === auth.studentId)} /> : 
              <Navigate to="/login" />} 
          />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
