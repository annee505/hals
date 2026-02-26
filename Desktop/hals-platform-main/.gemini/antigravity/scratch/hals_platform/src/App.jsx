import React, { useState, useEffect } from 'react';
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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session before rendering routes
        // This prevents the "flash" of the login page on refresh
        const checkSession = () => {
            authService.getUser(); // warm up the session check
            setIsLoading(false);
        };
        checkSession();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">Loading HALS...</p>
                </div>
            </div>
        );
    }

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
