import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages for performance
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ProfileSetup = React.lazy(() => import('./pages/ProfileSetup'));
const CourseDetail = React.lazy(() => import('./pages/CourseDetail'));
const LessonPage = React.lazy(() => import('./pages/LessonPage'));
const Profile = React.lazy(() => import('./pages/Profile'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Loading component
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
);

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <PageLoader />;
    }

    return user ? children : <Navigate to="/login" />;
};

const App = () => {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Router>
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/profile-setup" element={<PrivateRoute><ProfileSetup /></PrivateRoute>} />
                            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                            <Route path="/course/:courseId" element={<PrivateRoute><CourseDetail /></PrivateRoute>} />
                            <Route path="/course/:courseId/lesson/:lessonId" element={<PrivateRoute><LessonPage /></PrivateRoute>} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </Suspense>
                </Router>
            </AuthProvider>
        </ErrorBoundary>
    );
};

export default App;
