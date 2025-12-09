import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CourseDetail from './pages/CourseDetail';
import { authService } from './services/auth';

const PrivateRoute = ({ children }) => {
    const user = authService.getUser();
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile-setup" element={<PrivateRoute><ProfileSetup /></PrivateRoute>} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/course/:courseId" element={<PrivateRoute><CourseDetail /></PrivateRoute>} />
            </Routes>
        </Router>
    );
}

export default App;
