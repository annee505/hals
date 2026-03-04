const DB_KEY = 'hals_database';

// Initialize database structure
const initDB = () => {
    const db = localStorage.getItem(DB_KEY);
    if (!db) {
        const initialDB = {
            users: [],
            courses: [
                // Programming & Tech
                { id: 'course-1', title: 'Python Programming Fundamentals', description: 'Master the basics of Python programming from scratch', difficulty: 'Beginner', duration: '4 weeks', enrolled: 127, rating: 4.9, image: 'coding', tags: ['Programming', 'Python'] },
                { id: 'course-2', title: 'Web Development Bootcamp', description: 'Build modern websites with HTML, CSS, and JavaScript', difficulty: 'Beginner', duration: '4 weeks', enrolled: 203, rating: 4.8, image: 'web', tags: ['Web Dev', 'HTML', 'CSS', 'JavaScript'] },
                { id: 'course-3', title: 'React & Modern Frontend', description: 'Master React and build interactive user interfaces', difficulty: 'Intermediate', duration: '4 weeks', enrolled: 156, rating: 4.7, image: 'web', tags: ['React', 'Frontend', 'JavaScript'] },
                { id: 'course-4', title: 'Full-Stack JavaScript', description: 'Complete MERN stack development course', difficulty: 'Advanced', duration: '4 weeks', enrolled: 89, rating: 4.9, image: 'coding', tags: ['Full-Stack', 'MERN', 'Node.js'] },
                { id: 'course-5', title: 'Data Science with Python', description: 'Analyze data and build ML models with Python', difficulty: 'Intermediate', duration: '4 weeks', enrolled: 142, rating: 4.8, image: 'coding', tags: ['Data Science', 'Python', 'ML'] },
                { id: 'course-6', title: 'Mobile App Development', description: 'Build iOS and Android apps with React Native', difficulty: 'Intermediate', duration: '4 weeks', enrolled: 98, rating: 4.6, image: 'coding', tags: ['Mobile', 'React Native', 'Apps'] },

                // Business & Finance
                { id: 'course-7', title: 'Personal Finance Mastery', description: 'Learn to manage your money like a pro', difficulty: 'Beginner', duration: '4 weeks', enrolled: 312, rating: 4.9, image: 'finance', tags: ['Finance', 'Budgeting', 'Money'] },
                { id: 'course-8', title: 'Investment Fundamentals', description: 'Start building wealth through smart investing', difficulty: 'Beginner', duration: '4 weeks', enrolled: 245, rating: 4.7, image: 'finance', tags: ['Investing', 'Stocks', 'Finance'] },
                { id: 'course-9', title: 'Cryptocurrency Essentials', description: 'Understand blockchain and crypto investing', difficulty: 'Intermediate', duration: '4 weeks', enrolled: 178, rating: 4.5, image: 'finance', tags: ['Crypto', 'Blockchain', 'Investing'] },
                { id: 'course-10', title: 'Business Strategy 101', description: 'Learn core business principles and strategy', difficulty: 'Beginner', duration: '4 weeks', enrolled: 167, rating: 4.8, image: 'finance', tags: ['Business', 'Strategy', 'Management'] },

                // Creative & Design
                { id: 'course-11', title: 'Graphic Design Fundamentals', description: 'Master design principles and tools like Figma', difficulty: 'Beginner', duration: '4 weeks', enrolled: 189, rating: 4.8, image: 'web', tags: ['Design', 'Graphics', 'Figma'] },
                { id: 'course-12', title: 'UI/UX Design Mastery', description: 'Create beautiful and user-friendly interfaces', difficulty: 'Intermediate', duration: '4 weeks', enrolled: 134, rating: 4.9, image: 'web', tags: ['UI/UX', 'Design', 'Prototyping'] },
                { id: 'course-13', title: 'Digital Marketing 101', description: 'Grow your brand with modern marketing strategies', difficulty: 'Beginner', duration: '4 weeks', enrolled: 221, rating: 4.6, image: 'finance', tags: ['Marketing', 'Social Media', 'SEO'] },
                { id: 'course-14', title: 'Content Creation & Writing', description: 'Write compelling content that converts', difficulty: 'Beginner', duration: '4 weeks', enrolled: 156, rating: 4.7, image: 'web', tags: ['Writing', 'Content', 'Copywriting'] },

                // Personal Development
                { id: 'course-15', title: 'Productivity & Time Management', description: 'Master your time and boost productivity', difficulty: 'Beginner', duration: '4 weeks', enrolled: 401, rating: 4.8, image: 'finance', tags: ['Productivity', 'Time Management', 'Habits'] },
                { id: 'course-16', title: 'Public Speaking Confidence', description: 'Become a confident and compelling speaker', difficulty: 'Beginner', duration: '4 weeks', enrolled: 198, rating: 4.7, image: 'web', tags: ['Speaking', 'Communication', 'Confidence'] },
                { id: 'course-17', title: 'Mindfulness & Meditation', description: 'Reduce stress and improve mental clarity', difficulty: 'Beginner', duration: '4 weeks', enrolled: 267, rating: 4.9, image: 'finance', tags: ['Mindfulness', 'Meditation', 'Wellness'] },
                { id: 'course-18', title: 'Career Development Accelerator', description: 'Advance your career with proven strategies', difficulty: 'Intermediate', duration: '4 weeks', enrolled: 187, rating: 4.8, image: 'finance', tags: ['Career', 'Professional Growth', 'Leadership'] },

                // Languages & Communication
                { id: 'course-19', title: 'Spanish for Beginners', description: 'Start speaking Spanish from day one', difficulty: 'Beginner', duration: '4 weeks', enrolled: 289, rating: 4.7, image: 'web', tags: ['Spanish', 'Language', 'Speaking'] },
                { id: 'course-20', title: 'English Grammar Mastery', description: 'Perfect your English writing and speaking', difficulty: 'Beginner', duration: '4 weeks', enrolled: 234, rating: 4.6, image: 'web', tags: ['English', 'Grammar', 'Writing'] },

                // Health & Fitness
                { id: 'course-21', title: 'Fitness Fundamentals', description: 'Build strength and improve overall fitness', difficulty: 'Beginner', duration: '4 weeks', enrolled: 312, rating: 4.8, image: 'finance', tags: ['Fitness', 'Health', 'Exercise'] },
                { id: 'course-22', title: 'Nutrition & Healthy Eating', description: 'Learn to fuel your body for optimal health', difficulty: 'Beginner', duration: '4 weeks', enrolled: 278, rating: 4.7, image: 'finance', tags: ['Nutrition', 'Health', 'Diet'] },

                // Advanced Tech
                { id: 'course-23', title: 'Machine Learning Fundamentals', description: 'Build intelligent systems with ML algorithms', difficulty: 'Advanced', duration: '4 weeks', enrolled: 67, rating: 4.9, image: 'coding', tags: ['ML', 'AI', 'Python'] },
                { id: 'course-24', title: 'Cloud Computing with AWS', description: 'Deploy scalable applications on AWS', difficulty: 'Intermediate', duration: '4 weeks', enrolled: 102, rating: 4.7, image: 'coding', tags: ['AWS', 'Cloud', 'DevOps'] }
            ],
            enrollments: []
        };
        localStorage.setItem(DB_KEY, JSON.stringify(initialDB));
        return initialDB;
    }
    return JSON.parse(db);
};

export const database = {
    // User operations
    createUser: (email, password, profile) => {
        const db = initDB();

        // Check if user exists
        if (db.users.find(u => u.email === email)) {
            throw new Error('User already exists');
        }

        const user = {
            id: `user-${Date.now()}`,
            email,
            password, // In real app, this would be hashed
            profile: {
                name: profile.name || email.split('@')[0],
                hobbies: profile.hobbies || '',
                learningStyle: profile.learningStyle || 'visual',
                goal: profile.goal || ''
            },
            createdAt: new Date().toISOString()
        };

        db.users.push(user);
        localStorage.setItem(DB_KEY, JSON.stringify(db));
        return user;
    },

    findUserByEmail: (email) => {
        const db = initDB();
        return db.users.find(u => u.email === email);
    },

    authenticateUser: (email, password) => {
        const user = database.findUserByEmail(email);
        if (!user || user.password !== password) {
            throw new Error('Invalid credentials');
        }
        return user;
    },

    updateUserProfile: (userId, profileData) => {
        const db = initDB();
        const userIndex = db.users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            throw new Error('User not found');
        }

        db.users[userIndex].profile = { ...db.users[userIndex].profile, ...profileData };
        localStorage.setItem(DB_KEY, JSON.stringify(db));
        return db.users[userIndex];
    },

    // Course operations
    getAllCourses: () => {
        const db = initDB();
        return db.courses;
    },

    getCourseById: (courseId) => {
        const db = initDB();
        return db.courses.find(c => c.id === courseId);
    },

    getRecommendedCourses: (userProfile) => {
        const courses = database.getAllCourses();
        // Simple recommendation: match tags with user goal
        if (!userProfile || !userProfile.goal) return courses.slice(0, 6);

        const goal = userProfile.goal.toLowerCase();
        const recommended = courses.filter(c =>
            c.tags.some(tag => goal.includes(tag.toLowerCase())) ||
            c.title.toLowerCase().includes(goal) ||
            c.description.toLowerCase().includes(goal)
        );

        return recommended.length > 0 ? recommended.slice(0, 6) : courses.slice(0, 6);
    },

    // Enrollment operations
    enrollInCourse: (userId, courseId) => {
        const db = initDB();

        // Check if already enrolled
        if (db.enrollments.find(e => e.userId === userId && e.courseId === courseId)) {
            throw new Error('Already enrolled');
        }

        const enrollment = {
            id: `enrollment-${Date.now()}`,
            userId,
            courseId,
            progress: 0,
            enrolledAt: new Date().toISOString()
        };

        db.enrollments.push(enrollment);

        // Increment enrolled count
        const courseIndex = db.courses.findIndex(c => c.id === courseId);
        if (courseIndex !== -1) {
            db.courses[courseIndex].enrolled += 1;
        }

        localStorage.setItem(DB_KEY, JSON.stringify(db));
        return enrollment;
    },

    getUserEnrollments: (userId) => {
        const db = initDB();
        const userEnrollments = db.enrollments.filter(e => e.userId === userId);

        // Join with course data
        return userEnrollments.map(enrollment => ({
            ...enrollment,
            course: db.courses.find(c => c.id === enrollment.courseId)
        }));
    },

    updateEnrollmentProgress: (userId, courseId, progressPercent) => {
        const db = initDB();
        const enrollment = db.enrollments.find(e => e.userId === userId && e.courseId === courseId);
        if (enrollment) {
            enrollment.progress = progressPercent;
            localStorage.setItem(DB_KEY, JSON.stringify(db));
        }
        return enrollment;
    }
};

// Initialize on load
initDB();
