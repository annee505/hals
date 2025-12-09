import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CourseDetail from './pages/CourseDetail';
import LessonPage from './pages/LessonPage';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    // While loading, the AuthProvider handles the spinner, 
    // but we double check here to prevent premature redirects
    if (loading) return null;

    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <ErrorBoundary>
                <Router>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/profile-setup" element={<PrivateRoute><ProfileSetup /></PrivateRoute>} />
                        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                        <Route path="/course/:courseId" element={<PrivateRoute><CourseDetail /></PrivateRoute>} />
                        <Route path="/course/:courseId/lesson/:lessonId" element={<PrivateRoute><LessonPage /></PrivateRoute>} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Router>
            </ErrorBoundary>
        </AuthProvider>
    );
}

export default App;
