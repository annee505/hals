// Course-specific lesson data mapped by course ID
const courseTopics = {
    'course-1': {
        modules: [
            {
                title: 'Python Basics', desc: 'Master the fundamental principles', lessons: [
                    { title: 'Introduction to Python', content: 'Learn the basics of Python programming, syntax, and structure.', duration: '45 min' },
                    { title: 'Variables and Data Types', content: 'Understand how to work with different data types in Python.', duration: '40 min' },
                    { title: 'Control Flow', content: 'Learn about if-else statements, loops, and conditional logic.', duration: '50 min' }
                ]
            },
            {
                title: 'Functions & OOP', desc: 'Apply concepts to real problems', lessons: [
                    { title: 'Functions and Modules', content: 'Create reusable code with functions and import modules.', duration: '65 min' },
                    { title: 'Object-Oriented Programming', content: 'Understand classes, objects, and OOP principles.', duration: '75 min' },
                    { title: 'File Handling', content: 'Read from and write to files in Python.', duration: '75 min' }
                ]
            },
            {
                title: 'Real-world Projects', desc: 'Build practical projects', lessons: [
                    { title: 'Web Scraping Project', content: 'Build a web scraper using BeautifulSoup and requests.', duration: '75 min' },
                    { title: 'Data Analysis with Pandas', content: 'Analyze datasets using the Pandas library.', duration: '80 min' },
                    { title: 'API Integration', content: 'Connect to external APIs and process JSON data.', duration: '70 min' }
                ]
            },
            {
                title: 'Advanced Python', desc: 'Master advanced techniques', lessons: [
                    { title: 'Algorithms and Optimization', content: 'Learn efficient algorithms and code optimization.', duration: '85 min' },
                    { title: 'Testing and Debugging', content: 'Write unit tests and debug complex issues.', duration: '80 min' },
                    { title: 'Final Capstone Project', content: 'Build a complete application using all concepts learned.', duration: '150 min' }
                ]
            }
        ]
    },
    'course-2': {
        modules: [
            {
                title: 'HTML Foundations', desc: 'Structure of the web', lessons: [
                    { title: 'HTML Document Structure', content: 'Learn about tags, elements, and page structure.', duration: '45 min' },
                    { title: 'Forms and Inputs', content: 'Build interactive forms for user data.', duration: '40 min' },
                    { title: 'Semantic HTML', content: 'Use meaningful tags for accessibility and SEO.', duration: '50 min' }
                ]
            },
            {
                title: 'CSS Styling', desc: 'Making pages beautiful', lessons: [
                    { title: 'Selectors and Properties', content: 'Target elements and apply styles.', duration: '65 min' },
                    { title: 'Flexbox Layout', content: 'Create flexible, responsive layouts.', duration: '75 min' },
                    { title: 'CSS Grid', content: 'Build complex grid-based designs.', duration: '75 min' }
                ]
            },
            {
                title: 'JavaScript Essentials', desc: 'Adding interactivity', lessons: [
                    { title: 'Variables and Functions', content: 'Core JavaScript concepts and syntax.', duration: '70 min' },
                    { title: 'DOM Manipulation', content: 'Interact with HTML elements dynamically.', duration: '80 min' },
                    { title: 'Event Handling', content: 'Respond to user actions and browser events.', duration: '75 min' }
                ]
            },
            {
                title: 'Full Website Project', desc: 'Build a complete website', lessons: [
                    { title: 'Responsive Design', content: 'Make your site work on all screen sizes.', duration: '80 min' },
                    { title: 'Deploying Your Site', content: 'Put your website live on the internet.', duration: '85 min' },
                    { title: 'Portfolio Project', content: 'Build your first complete website from scratch.', duration: '150 min' }
                ]
            }
        ]
    },
    'course-3': {
        modules: [
            {
                title: 'React Fundamentals', desc: 'Core React concepts', lessons: [
                    { title: 'JSX and Components', content: 'Write your first React components with JSX.', duration: '45 min' },
                    { title: 'Props and State', content: 'Pass data and manage component state.', duration: '42 min' },
                    { title: 'Event Handling in React', content: 'Handle user interactions in components.', duration: '50 min' }
                ]
            },
            {
                title: 'React Hooks', desc: 'Modern React patterns', lessons: [
                    { title: 'useState and useEffect', content: 'Master the essential React hooks.', duration: '70 min' },
                    { title: 'Custom Hooks', content: 'Create reusable logic with custom hooks.', duration: '75 min' },
                    { title: 'Context API', content: 'Manage global state without prop drilling.', duration: '70 min' }
                ]
            },
            {
                title: 'Routing & Data', desc: 'Navigation and API calls', lessons: [
                    { title: 'React Router', content: 'Add multi-page navigation to your app.', duration: '70 min' },
                    { title: 'Fetching Data', content: 'Connect your React app to APIs.', duration: '80 min' },
                    { title: 'Loading and Error States', content: 'Handle async data gracefully.', duration: '75 min' }
                ]
            },
            {
                title: 'Production React', desc: 'Build a polished app', lessons: [
                    { title: 'Performance Optimization', content: 'Memoization, lazy loading, and more.', duration: '85 min' },
                    { title: 'Testing React Apps', content: 'Write unit and integration tests.', duration: '80 min' },
                    { title: 'Full React Project', content: 'Build a complete interactive web application.', duration: '150 min' }
                ]
            }
        ]
    },
    'course-4': {
        modules: [
            {
                title: 'Node.js Backend', desc: 'Server-side JavaScript', lessons: [
                    { title: 'Node.js Basics', content: 'Set up a Node.js server from scratch.', duration: '48 min' },
                    { title: 'Express Framework', content: 'Build REST APIs with Express.js.', duration: '45 min' },
                    { title: 'Middleware & Routing', content: 'Organize your backend code effectively.', duration: '52 min' }
                ]
            },
            {
                title: 'MongoDB & Mongoose', desc: 'Database layer', lessons: [
                    { title: 'MongoDB Fundamentals', content: 'Store and query data with MongoDB.', duration: '68 min' },
                    { title: 'Mongoose Models', content: 'Define schemas and interact with your database.', duration: '72 min' },
                    { title: 'CRUD Operations', content: 'Create, read, update, and delete data.', duration: '75 min' }
                ]
            },
            {
                title: 'Authentication & Security', desc: 'Securing your app', lessons: [
                    { title: 'JWT Authentication', content: 'Implement token-based user authentication.', duration: '75 min' },
                    { title: 'Password Hashing', content: 'Securely store user passwords with bcrypt.', duration: '72 min' },
                    { title: 'Authorization & Roles', content: 'Control access based on user roles.', duration: '78 min' }
                ]
            },
            {
                title: 'Full-Stack Integration', desc: 'Connecting it all', lessons: [
                    { title: 'React + Express', content: 'Connect your frontend to your backend.', duration: '85 min' },
                    { title: 'Deployment with Heroku', content: 'Deploy your full-stack app to the cloud.', duration: '80 min' },
                    { title: 'MERN Capstone Project', content: 'Build a complete MERN stack application.', duration: '150 min' }
                ]
            }
        ]
    },
    'course-5': {
        modules: [
            {
                title: 'Data Fundamentals', desc: 'Working with data', lessons: [
                    { title: 'NumPy Arrays', content: 'Efficient numerical computing with NumPy.', duration: '48 min' },
                    { title: 'Pandas DataFrames', content: 'Load, clean, and manipulate datasets.', duration: '42 min' },
                    { title: 'Data Cleaning', content: 'Handle missing values and outliers.', duration: '50 min' }
                ]
            },
            {
                title: 'Data Visualization', desc: 'Telling stories with data', lessons: [
                    { title: 'Matplotlib Charts', content: 'Create static plots and charts.', duration: '65 min' },
                    { title: 'Seaborn Advanced Plots', content: 'Build beautiful statistical visualizations.', duration: '72 min' },
                    { title: 'Interactive Dashboards', content: 'Create interactive plots with Plotly.', duration: '78 min' }
                ]
            },
            {
                title: 'Machine Learning Intro', desc: 'Predictive modeling', lessons: [
                    { title: 'Scikit-Learn Basics', content: 'Train your first ML model.', duration: '72 min' },
                    { title: 'Classification Models', content: 'Predict categories with classifiers.', duration: '80 min' },
                    { title: 'Regression Models', content: 'Predict continuous values.', duration: '73 min' }
                ]
            },
            {
                title: 'Data Science Project', desc: 'End-to-end analysis', lessons: [
                    { title: 'Feature Engineering', content: 'Create meaningful features for models.', duration: '82 min' },
                    { title: 'Model Evaluation', content: 'Measure and improve model performance.', duration: '78 min' },
                    { title: 'Capstone Analysis', content: 'Complete a full data science project.', duration: '150 min' }
                ]
            }
        ]
    },
    'course-6': {
        modules: [
            {
                title: 'React Native Setup', desc: 'Getting started with mobile', lessons: [
                    { title: 'Environment Setup', content: 'Install and configure React Native.', duration: '45 min' },
                    { title: 'Core Components', content: 'Learn View, Text, Image, and ScrollView.', duration: '42 min' },
                    { title: 'Styling in React Native', content: 'Style mobile apps with StyleSheet.', duration: '50 min' }
                ]
            },
            {
                title: 'Navigation & State', desc: 'App structure', lessons: [
                    { title: 'Stack Navigation', content: 'Navigate between screens.', duration: '68 min' },
                    { title: 'Tab Navigation', content: 'Add bottom tab bars to your app.', duration: '72 min' },
                    { title: 'State Management', content: 'Manage app-wide state effectively.', duration: '75 min' }
                ]
            },
            {
                title: 'Device Features', desc: 'Using native capabilities', lessons: [
                    { title: 'Camera & Photos', content: 'Access the camera and photo library.', duration: '75 min' },
                    { title: 'Location Services', content: 'Use GPS and maps in your app.', duration: '78 min' },
                    { title: 'Push Notifications', content: 'Send notifications to users.', duration: '72 min' }
                ]
            },
            {
                title: 'Publishing', desc: 'Launch your app', lessons: [
                    { title: 'App Store Preparation', content: 'Prepare your app for iOS App Store.', duration: '80 min' },
                    { title: 'Google Play Submission', content: 'Submit your app to Google Play.', duration: '85 min' },
                    { title: 'Mobile App Capstone', content: 'Build and publish a complete mobile app.', duration: '150 min' }
                ]
            }
        ]
    },
    'course-7': {
        modules: [
            {
                title: 'Financial Foundations', desc: 'Money basics', lessons: [
                    { title: 'Money Mindset', content: 'Transform your relationship with money.', duration: '45 min' },
                    { title: 'Budgeting Basics', content: 'Create a personal budget that works.', duration: '48 min' },
                    { title: 'Tracking Expenses', content: 'Monitor where your money goes.', duration: '42 min' }
                ]
            },
            {
                title: 'Building Wealth', desc: 'Wealth strategies', lessons: [
                    { title: 'Debt Management', content: 'Strategies to eliminate debt efficiently.', duration: '68 min' },
                    { title: 'Emergency Fund', content: 'Build a safety net for financial security.', duration: '65 min' },
                    { title: 'Savings Goals', content: 'Set and achieve financial milestones.', duration: '72 min' }
                ]
            },
            {
                title: 'Practical Money', desc: 'Real-world money management', lessons: [
                    { title: 'Monthly Budget Review', content: 'Analyze and optimize your spending.', duration: '72 min' },
                    { title: 'Financial Decision Making', content: 'Make smart choices with your money.', duration: '78 min' },
                    { title: 'Investment Basics', content: 'Introduction to growing your wealth.', duration: '75 min' }
                ]
            },
            {
                title: 'Advanced Planning', desc: 'Long-term financial planning', lessons: [
                    { title: 'Retirement Planning', content: 'Secure your financial future.', duration: '80 min' },
                    { title: 'Tax Optimization', content: 'Minimize taxes legally and ethically.', duration: '85 min' },
                    { title: 'Wealth Building Plan', content: 'Create your personalized financial roadmap.', duration: '150 min' }
                ]
            }
        ]
    },
    'course-8': {
        modules: [
            {
                title: 'Investing Basics', desc: 'Understanding markets', lessons: [
                    { title: 'How Markets Work', content: 'Understand stock exchanges and trading.', duration: '45 min' },
                    { title: 'Types of Investments', content: 'Stocks, bonds, ETFs, and mutual funds.', duration: '48 min' },
                    { title: 'Risk vs Reward', content: 'Understand risk tolerance and returns.', duration: '42 min' }
                ]
            },
            {
                title: 'Stock Analysis', desc: 'Evaluating investments', lessons: [
                    { title: 'Fundamental Analysis', content: 'Read financial statements and reports.', duration: '72 min' },
                    { title: 'Technical Analysis', content: 'Use charts and patterns for decisions.', duration: '75 min' },
                    { title: 'Valuation Methods', content: 'Determine if a stock is overvalued.', duration: '68 min' }
                ]
            },
            {
                title: 'Portfolio Building', desc: 'Creating your portfolio', lessons: [
                    { title: 'Diversification', content: 'Spread risk across asset classes.', duration: '70 min' },
                    { title: 'Asset Allocation', content: 'Balance your portfolio by age and goals.', duration: '78 min' },
                    { title: 'Rebalancing Strategy', content: 'Keep your portfolio on track.', duration: '72 min' }
                ]
            },
            {
                title: 'Investment Strategy', desc: 'Long-term wealth', lessons: [
                    { title: 'Dollar Cost Averaging', content: 'Invest consistently over time.', duration: '80 min' },
                    { title: 'Dividend Investing', content: 'Build passive income streams.', duration: '85 min' },
                    { title: 'Investment Plan Capstone', content: 'Create your personal investment plan.', duration: '150 min' }
                ]
            }
        ]
    },
    'course-9': {
        modules: [
            {
                title: 'Blockchain Basics', desc: 'Understanding the technology', lessons: [
                    { title: 'What is Blockchain', content: 'Decentralized ledger technology explained.', duration: '45 min' },
                    { title: 'How Bitcoin Works', content: 'Mining, transactions, and consensus.', duration: '48 min' },
                    { title: 'Crypto Wallets', content: 'Store and secure your digital assets.', duration: '42 min' }
                ]
            },
            {
                title: 'Altcoins & Tokens', desc: 'Beyond Bitcoin', lessons: [
                    { title: 'Ethereum & Smart Contracts', content: 'Programmable blockchain applications.', duration: '70 min' },
                    { title: 'DeFi Explained', content: 'Decentralized finance ecosystem.', duration: '75 min' },
                    { title: 'NFTs and Digital Assets', content: 'Understanding non-fungible tokens.', duration: '70 min' }
                ]
            },
            {
                title: 'Trading Strategies', desc: 'Crypto trading', lessons: [
                    { title: 'Reading Crypto Charts', content: 'Analyze price movements and trends.', duration: '75 min' },
                    { title: 'Exchange Platforms', content: 'Choose and use crypto exchanges.', duration: '70 min' },
                    { title: 'Risk Management', content: 'Protect your crypto investments.', duration: '80 min' }
                ]
            },
            {
                title: 'Advanced Crypto', desc: 'Expert strategies', lessons: [
                    { title: 'Portfolio Diversification', content: 'Build a balanced crypto portfolio.', duration: '85 min' },
                    { title: 'Security Best Practices', content: 'Protect against hacks and scams.', duration: '80 min' },
                    { title: 'Crypto Investment Plan', content: 'Create your crypto strategy.', duration: '150 min' }
                ]
            }
        ]
    },
    'course-10': {
        modules: [
            {
                title: 'Business Foundations', desc: 'Core business concepts', lessons: [
                    { title: 'Business Models', content: 'Different ways businesses create value.', duration: '45 min' },
                    { title: 'Market Research', content: 'Understand your customers and competition.', duration: '48 min' },
                    { title: 'Value Proposition', content: 'Define what makes you unique.', duration: '42 min' }
                ]
            },
            {
                title: 'Strategy & Planning', desc: 'Strategic thinking', lessons: [
                    { title: 'SWOT Analysis', content: 'Identify strengths, weaknesses, opportunities, threats.', duration: '70 min' },
                    { title: 'Competitive Strategy', content: 'Position yourself in the market.', duration: '78 min' },
                    { title: 'Growth Strategies', content: 'Scale your business effectively.', duration: '72 min' }
                ]
            },
            {
                title: 'Operations & Finance', desc: 'Running the business', lessons: [
                    { title: 'Financial Statements', content: 'Read income statements and balance sheets.', duration: '75 min' },
                    { title: 'Cash Flow Management', content: 'Keep your business financially healthy.', duration: '78 min' },
                    { title: 'Pricing Strategies', content: 'Set prices that maximize profit.', duration: '72 min' }
                ]
            },
            {
                title: 'Leadership', desc: 'Leading your team', lessons: [
                    { title: 'Team Building', content: 'Hire and manage effective teams.', duration: '82 min' },
                    { title: 'Decision Making', content: 'Make smart business decisions under pressure.', duration: '78 min' },
                    { title: 'Business Plan Capstone', content: 'Create a comprehensive business plan.', duration: '150 min' }
                ]
            }
        ]
    },
    'course-11': {
        modules: [
            {
                title: 'Design Principles', desc: 'Visual fundamentals', lessons: [
                    { title: 'Color Theory', content: 'Understand color wheels, palettes, and harmony.', duration: '18 min' },
                    { title: 'Typography Basics', content: 'Choose and pair fonts effectively.', duration: '15 min' },
                    { title: 'Layout and Composition', content: 'Arrange elements for visual impact.', duration: '20 min' }
                ]
            },
            {
                title: 'Design Tools', desc: 'Mastering Figma', lessons: [
                    { title: 'Figma Interface', content: 'Navigate and use Figma effectively.', duration: '22 min' },
                    { title: 'Shapes and Vectors', content: 'Create custom graphics and icons.', duration: '25 min' },
                    { title: 'Components & Styles', content: 'Build reusable design systems.', duration: '20 min' }
                ]
            },
            {
                title: 'Branding', desc: 'Creating brand identity', lessons: [
                    { title: 'Logo Design', content: 'Design memorable logos from scratch.', duration: '30 min' },
                    { title: 'Brand Guidelines', content: 'Create consistent brand documentation.', duration: '20 min' },
                    { title: 'Social Media Graphics', content: 'Design posts, banners, and ads.', duration: '25 min' }
                ]
            },
            {
                title: 'Design Portfolio', desc: 'Showcasing your work', lessons: [
                    { title: 'Presentation Design', content: 'Create stunning presentations.', duration: '20 min' },
                    { title: 'Print vs Digital', content: 'Design for different mediums.', duration: '18 min' },
                    { title: 'Portfolio Project', content: 'Build your design portfolio.', duration: '45 min' }
                ]
            }
        ]
    },
    'course-12': {
        modules: [
            {
                title: 'UX Research', desc: 'Understanding users', lessons: [
                    { title: 'User Personas', content: 'Create detailed user profiles.', duration: '18 min' },
                    { title: 'User Journey Mapping', content: 'Map the complete user experience.', duration: '22 min' },
                    { title: 'Usability Testing', content: 'Test designs with real users.', duration: '20 min' }
                ]
            },
            {
                title: 'UI Design', desc: 'Interface design', lessons: [
                    { title: 'Wireframing', content: 'Sketch low-fidelity layout concepts.', duration: '20 min' },
                    { title: 'High-Fidelity Mockups', content: 'Create pixel-perfect designs.', duration: '25 min' },
                    { title: 'Design Systems', content: 'Build scalable component libraries.', duration: '28 min' }
                ]
            },
            {
                title: 'Interaction Design', desc: 'Motion and flow', lessons: [
                    { title: 'Micro-interactions', content: 'Design delightful small animations.', duration: '22 min' },
                    { title: 'Prototyping', content: 'Build interactive prototypes in Figma.', duration: '25 min' },
                    { title: 'Accessibility', content: 'Design for all users inclusively.', duration: '20 min' }
                ]
            },
            {
                title: 'UX Portfolio', desc: 'Professional showcase', lessons: [
                    { title: 'Case Study Writing', content: 'Document your design process.', duration: '25 min' },
                    { title: 'Design Critique', content: 'Give and receive design feedback.', duration: '18 min' },
                    { title: 'UI/UX Capstone', content: 'Design a complete app from research to prototype.', duration: '60 min' }
                ]
            }
        ]
    },
    'course-13': {
        modules: [
            {
                title: 'Marketing Foundations', desc: 'Core marketing concepts', lessons: [
                    { title: 'Marketing Funnel', content: 'Understand awareness, consideration, conversion.', duration: '45 min' },
                    { title: 'Target Audience', content: 'Identify and reach your ideal customer.', duration: '50 min' },
                    { title: 'Brand Messaging', content: 'Craft compelling brand stories.', duration: '45 min' }
                ]
            },
            {
                title: 'Social Media', desc: 'Social platform mastery', lessons: [
                    { title: 'Platform Strategy', content: 'Choose the right platforms for your brand.', duration: '60 min' },
                    { title: 'Content Calendar', content: 'Plan and schedule posts effectively.', duration: '70 min' },
                    { title: 'Engagement Tactics', content: 'Grow your following organically.', duration: '65 min' }
                ]
            },
            {
                title: 'SEO & Content', desc: 'Search and content marketing', lessons: [
                    { title: 'SEO Fundamentals', content: 'Optimize your site for search engines.', duration: '75 min' },
                    { title: 'Keyword Research', content: 'Find terms your audience searches for.', duration: '70 min' },
                    { title: 'Blog Strategy', content: 'Create content that drives traffic.', duration: '75 min' }
                ]
            },
            {
                title: 'Analytics & Ads', desc: 'Measuring and scaling', lessons: [
                    { title: 'Google Analytics', content: 'Track and understand your traffic.', duration: '85 min' },
                    { title: 'Paid Advertising', content: 'Run effective ad campaigns.', duration: '90 min' },
                    { title: 'Marketing Plan Capstone', content: 'Create a complete marketing strategy.', duration: '150 min' }
                ]
            }
        ]
    },
    'course-14': {
        modules: [
            {
                title: 'Writing Basics', desc: 'Foundation skills', lessons: [
                    { title: 'Finding Your Voice', content: 'Develop a unique writing style.', duration: '45 min' },
                    { title: 'Audience Analysis', content: 'Write for your target reader.', duration: '40 min' },
                    { title: 'Story Structure', content: 'Craft compelling narratives.', duration: '45 min' }
                ]
            },
            {
                title: 'Content Types', desc: 'Different writing formats', lessons: [
                    { title: 'Blog Writing', content: 'Write engaging blog posts that get shared.', duration: '65 min' },
                    { title: 'Email Copywriting', content: 'Write emails that get opened and clicked.', duration: '70 min' },
                    { title: 'Social Media Copy', content: 'Write short-form content that converts.', duration: '60 min' }
                ]
            },
            {
                title: 'Advanced Copywriting', desc: 'Persuasive writing', lessons: [
                    { title: 'Headlines That Hook', content: 'Write attention-grabbing headlines.', duration: '75 min' },
                    { title: 'Sales Pages', content: 'Write landing pages that convert.', duration: '80 min' },
                    { title: 'SEO Writing', content: 'Optimize content for search engines.', duration: '75 min' }
                ]
            },
            {
                title: 'Writing Career', desc: 'Professional writing', lessons: [
                    { title: 'Editing and Proofreading', content: 'Polish your content to perfection.', duration: '85 min' },
                    { title: 'Building a Portfolio', content: 'Showcase your best writing work.', duration: '80 min' },
                    { title: 'Content Strategy Capstone', content: 'Create a complete content plan.', duration: '150 min' }
                ]
            }
        ]
    },
    'course-15': {
        modules: [
            {
                title: 'Time Mastery', desc: 'Control your time', lessons: [
                    { title: 'Time Audit', content: 'Discover where your time actually goes.', duration: '40 min' },
                    { title: 'Priority Matrix', content: 'Use Eisenhower matrix for decisions.', duration: '45 min' },
                    { title: 'Time Blocking', content: 'Schedule your day for maximum output.', duration: '45 min' }
                ]
            },
            {
                title: 'Productivity Systems', desc: 'Proven frameworks', lessons: [
                    { title: 'Getting Things Done', content: 'Master the GTD methodology.', duration: '65 min' },
                    { title: 'Pomodoro Technique', content: 'Work in focused intervals.', duration: '60 min' },
                    { title: 'Deep Work', content: 'Achieve flow state consistently.', duration: '70 min' }
                ]
            },
            {
                title: 'Habit Building', desc: 'Lasting change', lessons: [
                    { title: 'Habit Stacking', content: 'Build new habits on existing ones.', duration: '75 min' },
                    { title: 'Eliminating Distractions', content: 'Create a focused environment.', duration: '70 min' },
                    { title: 'Morning Routines', content: 'Design a powerful morning ritual.', duration: '75 min' }
                ]
            },
            {
                title: 'Sustained Performance', desc: 'Long-term productivity', lessons: [
                    { title: 'Energy Management', content: 'Match tasks to energy levels.', duration: '85 min' },
                    { title: 'Weekly Reviews', content: 'Reflect and plan effectively.', duration: '80 min' },
                    { title: 'Productivity Plan Capstone', content: 'Design your personal system.', duration: '150 min' }
                ]
            }
        ]
    },
    'course-16': {
        modules: [
            {
                title: 'Speaking Foundations', desc: 'Building confidence', lessons: [
                    { title: 'Overcoming Stage Fright', content: 'Techniques to manage presentation anxiety.', duration: '45 min' },
                    { title: 'Voice and Delivery', content: 'Project your voice with power and clarity.', duration: '50 min' },
                    { title: 'Body Language', content: 'Use gestures and posture effectively.', duration: '45 min' }
                ]
            },
            {
                title: 'Speech Crafting', desc: 'Creating great content', lessons: [
                    { title: 'Structuring a Speech', content: 'Opening, body, and closing techniques.', duration: '70 min' },
                    { title: 'Storytelling in Speeches', content: 'Use stories to captivate your audience.', duration: '75 min' },
                    { title: 'Visual Aids', content: 'Use slides and props effectively.', duration: '70 min' }
                ]
            },
            {
                title: 'Advanced Techniques', desc: 'Professional speaking', lessons: [
                    { title: 'Impromptu Speaking', content: 'Speak confidently without preparation.', duration: '75 min' },
                    { title: 'Handling Q&A', content: 'Answer tough questions with grace.', duration: '70 min' },
                    { title: 'Persuasive Speaking', content: 'Influence and motivate your audience.', duration: '80 min' }
                ]
            },
            {
                title: 'Real-World Practice', desc: 'Apply your skills', lessons: [
                    { title: 'Business Presentations', content: 'Present in professional settings.', duration: '85 min' },
                    { title: 'Virtual Presentations', content: 'Excel in online speaking events.', duration: '80 min' },
                    { title: 'Speech Capstone', content: 'Prepare and deliver a full speech.', duration: '150 min' }
                ]
            }
        ]
    },
    'course-17': {
        modules: [
            {
                title: 'Mindfulness Basics', desc: 'Understanding mindfulness', lessons: [
                    { title: 'What is Mindfulness', content: 'The science behind mindful awareness.', duration: '40 min' },
                    { title: 'Breathing Techniques', content: 'Master calming breath exercises.', duration: '45 min' },
                    { title: 'Body Scan Practice', content: 'Release tension through body awareness.', duration: '50 min' }
                ]
            },
            {
                title: 'Meditation Practice', desc: 'Building a practice', lessons: [
                    { title: 'Guided Meditation', content: 'Follow along with guided sessions.', duration: '65 min' },
                    { title: 'Walking Meditation', content: 'Practice mindfulness in motion.', duration: '60 min' },
                    { title: 'Mindful Eating', content: 'Transform your relationship with food.', duration: '62 min' }
                ]
            },
            {
                title: 'Stress Management', desc: 'Handling life challenges', lessons: [
                    { title: 'Stress Response', content: 'Understand and manage your stress triggers.', duration: '70 min' },
                    { title: 'Emotional Regulation', content: 'Process difficult emotions mindfully.', duration: '75 min' },
                    { title: 'Mindful Communication', content: 'Improve relationships through presence.', duration: '70 min' }
                ]
            },
            {
                title: 'Daily Practice', desc: 'Sustaining your practice', lessons: [
                    { title: 'Creating a Routine', content: 'Build a sustainable daily practice.', duration: '85 min' },
                    { title: 'Mindful Work', content: 'Bring mindfulness to your workplace.', duration: '80 min' },
                    { title: 'Wellness Plan Capstone', content: 'Design your personal wellness program.', duration: '150 min' }
                ]
            }
        ]
    },
    'course-18': {
        modules: [
            {
                title: 'Career Assessment', desc: 'Know yourself', lessons: [
                    { title: 'Skills Inventory', content: 'Identify your strengths and gaps.', duration: '45 min' },
                    { title: 'Career Goals Setting', content: 'Define clear career objectives.', duration: '50 min' },
                    { title: 'Personal Branding', content: 'Build your professional reputation.', duration: '55 min' }
                ]
            },
            {
                title: 'Job Search Mastery', desc: 'Landing opportunities', lessons: [
                    { title: 'Resume Writing', content: 'Craft a resume that gets interviews.', duration: '75 min' },
                    { title: 'LinkedIn Optimization', content: 'Build a powerful online profile.', duration: '70 min' },
                    { title: 'Interview Skills', content: 'Ace any job interview with confidence.', duration: '80 min' }
                ]
            },
            {
                title: 'Workplace Skills', desc: 'Professional excellence', lessons: [
                    { title: 'Networking Strategy', content: 'Build meaningful professional connections.', duration: '75 min' },
                    { title: 'Negotiation Skills', content: 'Negotiate salary and promotions.', duration: '80 min' },
                    { title: 'Leadership Basics', content: 'Lead teams and projects effectively.', duration: '85 min' }
                ]
            },
            {
                title: 'Career Growth', desc: 'Long-term success', lessons: [
                    { title: 'Mentorship', content: 'Find and work with mentors.', duration: '70 min' },
                    { title: 'Work-Life Balance', content: 'Sustain performance without burnout.', duration: '75 min' },
                    { title: 'Career Plan Capstone', content: 'Create your 5-year career roadmap.', duration: '150 min' }
                ]
            }
        ]
    },
    'course-19': {
        modules: [
            {
                title: 'Spanish Basics', desc: 'First steps', lessons: [
                    { title: 'Greetings & Introductions', content: 'Say hello and introduce yourself.', duration: '45 min' },
                    { title: 'Numbers and Colors', content: 'Count and describe in Spanish.', duration: '40 min' },
                    { title: 'Common Phrases', content: 'Essential everyday expressions.', duration: '45 min' }
                ]
            },
            {
                title: 'Grammar Essentials', desc: 'Building blocks', lessons: [
                    { title: 'Present Tense Verbs', content: 'Conjugate regular verbs correctly.', duration: '75 min' },
                    { title: 'Nouns and Adjectives', content: 'Gender, number, and agreement.', duration: '70 min' },
                    { title: 'Asking Questions', content: 'Form questions naturally in Spanish.', duration: '75 min' }
                ]
            },
            {
                title: 'Conversational Spanish', desc: 'Real-world speaking', lessons: [
                    { title: 'At the Restaurant', content: 'Order food and drinks in Spanish.', duration: '72 min' },
                    { title: 'Shopping & Travel', content: 'Navigate stores and transportation.', duration: '78 min' },
                    { title: 'Daily Routines', content: 'Describe your day in Spanish.', duration: '70 min' }
                ]
            },
            {
                title: 'Cultural Fluency', desc: 'Beyond words', lessons: [
                    { title: 'Past Tense', content: 'Talk about past events and experiences.', duration: '85 min' },
                    { title: 'Spanish Culture', content: 'Understand customs and traditions.', duration: '80 min' },
                    { title: 'Conversation Capstone', content: 'Hold a complete Spanish conversation.', duration: '150 min' }
                ]
            }
        ]
    },
    'course-20': {
        modules: [
            {
                title: 'Grammar Foundations', desc: 'Building blocks', lessons: [
                    { title: 'Parts of Speech', content: 'Nouns, verbs, adjectives, and adverbs.', duration: '45 min' },
                    { title: 'Sentence Structure', content: 'Build clear and correct sentences.', duration: '48 min' },
                    { title: 'Punctuation Rules', content: 'Use commas, semicolons, and more.', duration: '42 min' }
                ]
            },
            {
                title: 'Writing Skills', desc: 'Effective writing', lessons: [
                    { title: 'Paragraph Structure', content: 'Write well-organized paragraphs.', duration: '70 min' },
                    { title: 'Essay Writing', content: 'Structure compelling essays.', duration: '78 min' },
                    { title: 'Formal vs Informal', content: 'Adapt your writing to the context.', duration: '72 min' }
                ]
            },
            {
                title: 'Common Mistakes', desc: 'Error correction', lessons: [
                    { title: 'Confusing Words', content: 'Their/there, affect/effect, and more.', duration: '75 min' },
                    { title: 'Tense Consistency', content: 'Maintain proper verb tenses.', duration: '70 min' },
                    { title: 'Subject-Verb Agreement', content: 'Ensure grammatical harmony.', duration: '75 min' }
                ]
            },
            {
                title: 'Advanced English', desc: 'Polish your skills', lessons: [
                    { title: 'Idiomatic Expressions', content: 'Use common English idioms naturally.', duration: '82 min' },
                    { title: 'Academic Writing', content: 'Write for scholarly contexts.', duration: '78 min' },
                    { title: 'Grammar Mastery Capstone', content: 'Demonstrate your English proficiency.', duration: '150 min' }
                ]
            }
        ]
    },
    'course-21': {
        modules: [
            {
                title: 'Getting Started', desc: 'Fitness basics', lessons: [
                    { title: 'Fitness Assessment', content: 'Evaluate your current fitness level.', duration: '45 min' },
                    { title: 'Exercise Form', content: 'Learn proper technique for safety.', duration: '50 min' },
                    { title: 'Warm-up and Cool-down', content: 'Prepare your body and recover properly.', duration: '45 min' }
                ]
            },
            {
                title: 'Strength Training', desc: 'Building muscle', lessons: [
                    { title: 'Upper Body Workouts', content: 'Chest, back, shoulders, and arms exercises.', duration: '75 min' },
                    { title: 'Lower Body Workouts', content: 'Legs, glutes, and core exercises.', duration: '72 min' },
                    { title: 'Full Body Routines', content: 'Efficient total-body workouts.', duration: '78 min' }
                ]
            },
            {
                title: 'Cardio & Endurance', desc: 'Heart health', lessons: [
                    { title: 'Cardio Basics', content: 'Running, cycling, and swimming techniques.', duration: '72 min' },
                    { title: 'HIIT Training', content: 'High-intensity interval workouts.', duration: '78 min' },
                    { title: 'Flexibility & Mobility', content: 'Stretching for better movement.', duration: '75 min' }
                ]
            },
            {
                title: 'Fitness Lifestyle', desc: 'Long-term fitness', lessons: [
                    { title: 'Recovery & Rest', content: 'Importance of rest days and sleep.', duration: '85 min' },
                    { title: 'Progress Tracking', content: 'Measure and celebrate improvements.', duration: '80 min' },
                    { title: 'Fitness Plan Capstone', content: 'Design your personalized program.', duration: '150 min' }
                ]
            }
        ]
    },
    'course-22': {
        modules: [
            {
                title: 'Nutrition Science', desc: 'Understanding food', lessons: [
                    { title: 'Macronutrients', content: 'Carbs, proteins, and fats explained.', duration: '45 min' },
                    { title: 'Micronutrients', content: 'Vitamins and minerals your body needs.', duration: '40 min' },
                    { title: 'Reading Food Labels', content: 'Decode nutrition information panels.', duration: '45 min' }
                ]
            },
            {
                title: 'Healthy Eating', desc: 'Practical nutrition', lessons: [
                    { title: 'Meal Planning', content: 'Plan balanced meals for the week.', duration: '75 min' },
                    { title: 'Healthy Cooking Methods', content: 'Cook nutritious and delicious meals.', duration: '70 min' },
                    { title: 'Smart Grocery Shopping', content: 'Shop for healthy food on a budget.', duration: '72 min' }
                ]
            },
            {
                title: 'Special Diets', desc: 'Dietary approaches', lessons: [
                    { title: 'Plant-Based Eating', content: 'Get nutrients from plant sources.', duration: '75 min' },
                    { title: 'Managing Portions', content: 'Control serving sizes naturally.', duration: '70 min' },
                    { title: 'Hydration', content: 'Understand your water and fluid needs.', duration: '72 min' }
                ]
            },
            {
                title: 'Nutrition Mastery', desc: 'Sustained healthy eating', lessons: [
                    { title: 'Emotional Eating', content: 'Break unhealthy food patterns.', duration: '85 min' },
                    { title: 'Supplements', content: 'When and what supplements to consider.', duration: '80 min' },
                    { title: 'Nutrition Plan Capstone', content: 'Create your personalized meal plan.', duration: '150 min' }
                ]
            }
        ]
    },
    'course-23': {
        modules: [
            {
                title: 'ML Foundations', desc: 'Mathematical basics', lessons: [
                    { title: 'Linear Algebra for ML', content: 'Vectors, matrices, and transformations.', duration: '50 min' },
                    { title: 'Probability & Statistics', content: 'Statistical foundations for ML.', duration: '55 min' },
                    { title: 'Gradient Descent', content: 'Understanding optimization algorithms.', duration: '52 min' }
                ]
            },
            {
                title: 'Supervised Learning', desc: 'Learn from labeled data', lessons: [
                    { title: 'Linear Regression', content: 'Predict continuous values from data.', duration: '85 min' },
                    { title: 'Decision Trees', content: 'Tree-based classification and regression.', duration: '80 min' },
                    { title: 'Neural Network Basics', content: 'Build your first neural network.', duration: '95 min' }
                ]
            },
            {
                title: 'Unsupervised Learning', desc: 'Finding hidden patterns', lessons: [
                    { title: 'K-Means Clustering', content: 'Group similar data points together.', duration: '85 min' },
                    { title: 'Dimensionality Reduction', content: 'PCA and feature selection techniques.', duration: '82 min' },
                    { title: 'Anomaly Detection', content: 'Identify unusual patterns in data.', duration: '88 min' }
                ]
            },
            {
                title: 'Deep Learning', desc: 'Advanced neural networks', lessons: [
                    { title: 'CNNs for Computer Vision', content: 'Image classification with deep learning.', duration: '95 min' },
                    { title: 'RNNs for Sequences', content: 'Process text and time series data.', duration: '90 min' },
                    { title: 'ML Project Capstone', content: 'Build and deploy a complete ML system.', duration: '160 min' }
                ]
            }
        ]
    },
    'course-24': {
        modules: [
            {
                title: 'Cloud Fundamentals', desc: 'Understanding AWS', lessons: [
                    { title: 'Cloud Computing Concepts', content: 'IaaS, PaaS, SaaS explained.', duration: '45 min' },
                    { title: 'AWS Console & CLI', content: 'Navigate the AWS interface.', duration: '50 min' },
                    { title: 'IAM & Security', content: 'Manage users and permissions.', duration: '55 min' }
                ]
            },
            {
                title: 'Compute & Storage', desc: 'Core services', lessons: [
                    { title: 'EC2 Instances', content: 'Launch and manage virtual servers.', duration: '75 min' },
                    { title: 'S3 Storage', content: 'Store and retrieve files in the cloud.', duration: '72 min' },
                    { title: 'Lambda Functions', content: 'Run serverless code on demand.', duration: '78 min' }
                ]
            },
            {
                title: 'Databases & Networking', desc: 'Data and connectivity', lessons: [
                    { title: 'RDS Databases', content: 'Set up managed SQL databases.', duration: '85 min' },
                    { title: 'DynamoDB', content: 'Build with NoSQL on AWS.', duration: '82 min' },
                    { title: 'VPC & Networking', content: 'Configure secure cloud networks.', duration: '88 min' }
                ]
            },
            {
                title: 'DevOps & Deployment', desc: 'CI/CD on AWS', lessons: [
                    { title: 'Docker on AWS', content: 'Containerize and deploy applications.', duration: '95 min' },
                    { title: 'CI/CD Pipelines', content: 'Automate code deployment.', duration: '90 min' },
                    { title: 'AWS Architecture Capstone', content: 'Design and deploy a scalable cloud app.', duration: '160 min' }
                ]
            }
        ]
    }
};

// Helper to build the full content structure from compact format
const buildContent = (data) => ({
    modules: data.modules.map((mod, i) => ({
        id: `mod-${i + 1}`,
        title: mod.title,
        description: mod.desc,
        lessons: mod.lessons.map((lesson, j) => ({
            id: `lesson-${i * 3 + j + 1}`,
            title: lesson.title,
            content: lesson.content,
            duration: lesson.duration,
            videoUrl: null
        }))
    }))
});

// Build the exported courseContent object
export const courseContent = {};
Object.keys(courseTopics).forEach(id => {
    courseContent[id] = buildContent(courseTopics[id]);
});

const PROGRESS_KEY = 'hals_course_progress';

export const courseContentService = {
    getCourseContent: (courseId) => {
        if (courseContent[courseId]) {
            return courseContent[courseId];
        }

        // Should not happen now since all 24 courses are defined,
        // but kept as a safety fallback
        return buildContent({
            modules: [
                {
                    title: 'Fundamentals', desc: 'Core concepts and theory', lessons: [
                        { title: 'Getting Started', content: 'Introduction to the course topic.', duration: '15 min' },
                        { title: 'Basic Principles', content: 'Understanding the key principles.', duration: '20 min' },
                        { title: 'Tools and Setup', content: 'Setting up your environment.', duration: '15 min' }
                    ]
                },
                {
                    title: 'Practical Application', desc: 'Applying what you learned', lessons: [
                        { title: 'First Project', content: 'Building your first project.', duration: '30 min' },
                        { title: 'Common Patterns', content: 'Recognizing common patterns.', duration: '25 min' }
                    ]
                },
                {
                    title: 'Advanced Topics', desc: 'Taking it to the next level', lessons: [
                        { title: 'Optimization', content: 'Making things faster and better.', duration: '35 min' },
                        { title: 'Best Practices', content: 'Industry standard practices.', duration: '20 min' }
                    ]
                },
                {
                    title: 'Mastery', desc: 'Final assessment', lessons: [
                        { title: 'Capstone Project', content: 'Final comprehensive project.', duration: '60 min' }
                    ]
                }
            ]
        });
    },

    getProgress: (userId, courseId) => {
        const saved = localStorage.getItem(PROGRESS_KEY);
        const allProgress = saved ? JSON.parse(saved) : {};
        return allProgress[`${userId}-${courseId}`] || { completedLessons: [] };
    },

    markLessonComplete: (userId, courseId, lessonId) => {
        const saved = localStorage.getItem(PROGRESS_KEY);
        const allProgress = saved ? JSON.parse(saved) : {};
        const key = `${userId}-${courseId}`;

        if (!allProgress[key]) {
            allProgress[key] = { completedLessons: [] };
        }

        if (allProgress[key].completedLessons.includes(lessonId)) {
            allProgress[key].completedLessons = allProgress[key].completedLessons.filter(id => id !== lessonId);
        } else {
            allProgress[key].completedLessons.push(lessonId);
        }

        localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
        return allProgress[key];
    },

    getProgressPercentage: (userId, courseId) => {
        const content = courseContent[courseId];
        if (!content) return 0;

        const totalLessons = content.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
        const progress = courseContentService.getProgress(userId, courseId);
        const completed = progress.completedLessons.length;

        return Math.round((completed / totalLessons) * 100);
    }
};
