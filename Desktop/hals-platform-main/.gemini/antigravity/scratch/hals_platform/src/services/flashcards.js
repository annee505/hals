const FLASHCARD_KEY = 'hals_flashcards';

// Course-specific flashcard data
const courseFlashcards = {
    'course-1': {
        title: 'Python Programming Flashcards',
        cards: [
            { id: 'card-1', front: 'What is a variable in Python?', back: 'A variable is a named storage location that holds a value which can be changed during program execution.' },
            { id: 'card-2', front: 'What are the main data types in Python?', back: 'int (integer), float (decimal), str (string), bool (boolean), list, tuple, dict (dictionary), set' },
            { id: 'card-3', front: 'What is a function?', back: 'A reusable block of code that performs a specific task, defined using the def keyword.' },
            { id: 'card-4', front: 'Explain the difference between a list and a tuple.', back: 'Lists are mutable (can be changed) and use square brackets []. Tuples are immutable (cannot be changed) and use parentheses ().' },
            { id: 'card-5', front: 'What is OOP?', back: 'Object-Oriented Programming is a programming paradigm based on objects and classes, featuring encapsulation, inheritance, and polymorphism.' },
            { id: 'card-6', front: 'How do you handle exceptions in Python?', back: 'Using try-except blocks. Code that might raise an exception goes in try, and error handling goes in except.' },
            { id: 'card-7', front: 'What is a module?', back: 'A file containing Python code (functions, classes, variables) that can be imported and used in other Python programs.' },
            { id: 'card-8', front: 'Explain list comprehension.', back: 'A concise way to create lists using a single line: [expression for item in iterable if condition]' }
        ]
    },
    'course-2': {
        title: 'Web Development Flashcards',
        cards: [
            { id: 'card-1', front: 'What does HTML stand for?', back: 'HyperText Markup Language — the standard language for creating web pages.' },
            { id: 'card-2', front: 'What is the CSS box model?', back: 'Content → Padding → Border → Margin. Every HTML element is treated as a box with these four layers.' },
            { id: 'card-3', front: 'What is Flexbox?', back: 'A CSS layout module that provides an efficient way to align and distribute space among items in a container, even when their size is unknown.' },
            { id: 'card-4', front: 'What is semantic HTML?', back: 'Using HTML tags that convey meaning (like <header>, <nav>, <article>) rather than generic <div>s, improving accessibility and SEO.' },
            { id: 'card-5', front: 'What is the DOM?', back: 'Document Object Model — a tree-like representation of a web page that JavaScript can interact with to dynamically change content.' },
            { id: 'card-6', front: 'What is responsive design?', back: 'An approach where a website adapts its layout to different screen sizes using fluid grids, flexible images, and media queries.' }
        ]
    },
    'course-3': {
        title: 'React & Frontend Flashcards',
        cards: [
            { id: 'card-1', front: 'What is JSX?', back: 'A syntax extension for JavaScript that looks like HTML and is used in React to describe what the UI should look like.' },
            { id: 'card-2', front: 'What is the difference between state and props?', back: 'Props are read-only data passed from parent to child. State is mutable data managed within a component.' },
            { id: 'card-3', front: 'What is the Virtual DOM?', back: 'A lightweight copy of the actual DOM that React uses to determine the minimum number of updates needed, improving performance.' },
            { id: 'card-4', front: 'What does useEffect do?', back: 'A React Hook that lets you perform side effects (data fetching, subscriptions, DOM manipulation) in function components.' },
            { id: 'card-5', front: 'What is the Context API?', back: 'A React feature that allows you to share state across the component tree without passing props down manually at every level.' },
            { id: 'card-6', front: 'What is a custom hook?', back: 'A JavaScript function starting with "use" that lets you extract and reuse stateful logic between components.' }
        ]
    },
    'course-4': {
        title: 'Full-Stack JavaScript Flashcards',
        cards: [
            { id: 'card-1', front: 'What is Node.js?', back: 'A runtime environment that lets you run JavaScript on the server side, built on Chrome\'s V8 engine.' },
            { id: 'card-2', front: 'What is Express.js?', back: 'A minimal and flexible Node.js web framework that provides features for building web and mobile applications and APIs.' },
            { id: 'card-3', front: 'What is middleware in Express?', back: 'Functions that have access to request and response objects, and can modify them or end the request-response cycle.' },
            { id: 'card-4', front: 'What is MongoDB?', back: 'A NoSQL document database that stores data in flexible, JSON-like documents instead of traditional rows and columns.' },
            { id: 'card-5', front: 'What is JWT?', back: 'JSON Web Token — a compact, self-contained way to securely transmit information between parties as a JSON object, commonly used for authentication.' },
            { id: 'card-6', front: 'What does MERN stand for?', back: 'MongoDB, Express.js, React, Node.js — a full-stack JavaScript technology stack.' }
        ]
    },
    'course-5': {
        title: 'Data Science Flashcards',
        cards: [
            { id: 'card-1', front: 'What is a DataFrame in Pandas?', back: 'A 2D labeled data structure with columns of potentially different types, similar to a spreadsheet or SQL table.' },
            { id: 'card-2', front: 'What is NumPy used for?', back: 'A Python library for numerical computing that provides support for large multi-dimensional arrays and mathematical operations.' },
            { id: 'card-3', front: 'What is data cleaning?', back: 'The process of fixing or removing incorrect, corrupted, duplicate, or incomplete data within a dataset.' },
            { id: 'card-4', front: 'What is supervised learning?', back: 'A type of ML where the model is trained on labeled data — input-output pairs — to learn a mapping function.' },
            { id: 'card-5', front: 'What is the difference between classification and regression?', back: 'Classification predicts categories (spam/not spam). Regression predicts continuous values (price, temperature).' },
            { id: 'card-6', front: 'What is overfitting?', back: 'When a model learns the training data too well, including noise, and performs poorly on new, unseen data.' }
        ]
    },
    'course-6': {
        title: 'Mobile App Development Flashcards',
        cards: [
            { id: 'card-1', front: 'What is React Native?', back: 'A framework for building native mobile apps for iOS and Android using JavaScript and React.' },
            { id: 'card-2', front: 'What is the difference between View and div?', back: 'View is the React Native equivalent of div in web. It\'s a container that supports layout with Flexbox.' },
            { id: 'card-3', front: 'What is Stack Navigation?', back: 'A navigation pattern where screens are placed on top of each other like a stack of cards, with push/pop transitions.' },
            { id: 'card-4', front: 'How does styling work in React Native?', back: 'React Native uses JavaScript objects with StyleSheet.create() instead of CSS files. Flexbox is used for layout by default.' },
            { id: 'card-5', front: 'What is Expo?', back: 'A platform that simplifies React Native development with pre-built tools, eliminating the need for native build tools.' },
            { id: 'card-6', front: 'What are native modules?', back: 'Custom modules written in native code (Swift/Kotlin) that bridge JavaScript and platform-specific features.' }
        ]
    },
    'course-7': {
        title: 'Personal Finance Flashcards',
        cards: [
            { id: 'card-1', front: 'What is the 50/30/20 budget rule?', back: '50% of income for needs, 30% for wants, 20% for savings and debt repayment.' },
            { id: 'card-2', front: 'What is an emergency fund?', back: '3-6 months of living expenses saved for unexpected situations like job loss or medical emergencies.' },
            { id: 'card-3', front: 'Define compound interest.', back: 'Interest calculated on the initial principal plus accumulated interest from previous periods.' },
            { id: 'card-4', front: 'What is a budget?', back: 'A financial plan that tracks income and expenses to help manage money effectively.' },
            { id: 'card-5', front: 'Good debt vs bad debt?', back: 'Good debt: investments that increase value (education, home). Bad debt: depreciating assets or high-interest consumer debt.' },
            { id: 'card-6', front: 'What is net worth?', back: 'Total assets minus total liabilities (what you own minus what you owe).' }
        ]
    },
    'course-8': {
        title: 'Investment Fundamentals Flashcards',
        cards: [
            { id: 'card-1', front: 'What is an ETF?', back: 'Exchange-Traded Fund — a basket of securities that tracks an index and trades on a stock exchange like a single stock.' },
            { id: 'card-2', front: 'What is diversification?', back: 'Spreading investments across different asset classes to reduce risk. "Don\'t put all your eggs in one basket."' },
            { id: 'card-3', front: 'What is a P/E ratio?', back: 'Price-to-Earnings ratio — a stock\'s price divided by its earnings per share. Used to gauge whether a stock is over or undervalued.' },
            { id: 'card-4', front: 'What is dollar cost averaging?', back: 'Investing a fixed amount regularly regardless of market price, which averages out the purchase cost over time.' },
            { id: 'card-5', front: 'What is the difference between stocks and bonds?', back: 'Stocks represent ownership in a company. Bonds are loans you give to a company or government in exchange for interest payments.' },
            { id: 'card-6', front: 'What is a dividend?', back: 'A portion of a company\'s earnings paid to shareholders, usually quarterly, as a reward for holding the stock.' }
        ]
    },
    'course-9': {
        title: 'Cryptocurrency Flashcards',
        cards: [
            { id: 'card-1', front: 'What is a blockchain?', back: 'A decentralized, distributed ledger that records transactions across many computers so records cannot be altered retroactively.' },
            { id: 'card-2', front: 'What is a smart contract?', back: 'Self-executing code stored on a blockchain that automatically enforces the terms of an agreement when conditions are met.' },
            { id: 'card-3', front: 'What is DeFi?', back: 'Decentralized Finance — financial services built on blockchain that operate without traditional intermediaries like banks.' },
            { id: 'card-4', front: 'What is a crypto wallet?', back: 'A software or hardware tool that stores your private keys and allows you to send, receive, and manage cryptocurrency.' },
            { id: 'card-5', front: 'What is mining?', back: 'The process of validating transactions and adding new blocks to a blockchain by solving complex computational puzzles.' },
            { id: 'card-6', front: 'What is an NFT?', back: 'Non-Fungible Token — a unique digital asset on a blockchain that represents ownership of items like art, music, or collectibles.' }
        ]
    },
    'course-10': {
        title: 'Business Strategy Flashcards',
        cards: [
            { id: 'card-1', front: 'What is a SWOT analysis?', back: 'A framework for identifying Strengths, Weaknesses, Opportunities, and Threats to inform strategic decisions.' },
            { id: 'card-2', front: 'What is a value proposition?', back: 'A clear statement of the unique benefit a product or service delivers to its customers and why they should choose it.' },
            { id: 'card-3', front: 'What is market segmentation?', back: 'Dividing a broad market into distinct subgroups of consumers who have common needs, characteristics, or behaviors.' },
            { id: 'card-4', front: 'What is a business model canvas?', back: 'A strategic tool with nine blocks (value prop, customers, channels, revenue, etc.) that maps how a business creates and delivers value.' },
            { id: 'card-5', front: 'What is a competitive advantage?', back: 'A condition that allows a company to produce goods or services better or more cheaply than its rivals.' },
            { id: 'card-6', front: 'What is cash flow?', back: 'The net movement of money in and out of a business. Positive cash flow means more money coming in than going out.' }
        ]
    },
    'course-11': {
        title: 'Graphic Design Flashcards',
        cards: [
            { id: 'card-1', front: 'What is the rule of thirds?', back: 'A composition guideline that divides an image into a 3×3 grid; placing key elements along the lines or intersections creates more engaging designs.' },
            { id: 'card-2', front: 'What are complementary colors?', back: 'Colors opposite each other on the color wheel (e.g. blue & orange). They create high contrast and vibrant combinations.' },
            { id: 'card-3', front: 'What is kerning?', back: 'The adjustment of space between individual letter pairs in a typeface to improve visual balance and readability.' },
            { id: 'card-4', front: 'What is a vector graphic?', back: 'An image made of mathematical paths (points, lines, curves) that can be scaled infinitely without losing quality.' },
            { id: 'card-5', front: 'What is white space?', back: 'Empty space in a design that gives elements room to breathe, improving readability and visual hierarchy.' },
            { id: 'card-6', front: 'What is a design system?', back: 'A collection of reusable components, guidelines, and standards that ensure consistency across all design outputs.' }
        ]
    },
    'course-12': {
        title: 'UI/UX Design Flashcards',
        cards: [
            { id: 'card-1', front: 'What is the difference between UI and UX?', back: 'UI (User Interface) is how a product looks. UX (User Experience) is how it feels to use — the full journey a user takes.' },
            { id: 'card-2', front: 'What is a wireframe?', back: 'A low-fidelity visual blueprint of a page layout that shows structure and content placement without detailed design.' },
            { id: 'card-3', front: 'What is a user persona?', back: 'A fictional character representing a target user, created from research to guide design decisions around real user needs.' },
            { id: 'card-4', front: 'What is a user journey map?', back: 'A visualization of the process a user goes through to accomplish a goal, showing touchpoints, emotions, and pain points.' },
            { id: 'card-5', front: 'What is accessibility (a11y)?', back: 'Designing products usable by people with disabilities — including visual, auditory, motor, and cognitive impairments.' },
            { id: 'card-6', front: 'What is a micro-interaction?', back: 'A small, contained animation or response (like a button press effect) that give users feedback and make interfaces feel alive.' }
        ]
    },
    'course-13': {
        title: 'Digital Marketing Flashcards',
        cards: [
            { id: 'card-1', front: 'What is SEO?', back: 'Search Engine Optimization — the practice of improving a website to increase its visibility in search engine results.' },
            { id: 'card-2', front: 'What is a conversion rate?', back: 'The percentage of visitors who take a desired action (purchase, sign up, etc.) out of total visitors.' },
            { id: 'card-3', front: 'What is a marketing funnel?', back: 'The stages a customer goes through: Awareness → Interest → Consideration → Conversion → Retention.' },
            { id: 'card-4', front: 'What is CTR?', back: 'Click-Through Rate — the percentage of people who click on a link or ad after seeing it. Formula: clicks ÷ impressions × 100.' },
            { id: 'card-5', front: 'What is content marketing?', back: 'Creating and sharing valuable, relevant content to attract and retain a clearly defined audience and drive profitable actions.' },
            { id: 'card-6', front: 'What is A/B testing?', back: 'Comparing two versions of a webpage or element to see which one performs better based on a specific metric.' }
        ]
    },
    'course-14': {
        title: 'Content Writing Flashcards',
        cards: [
            { id: 'card-1', front: 'What is a call to action (CTA)?', back: 'A prompt that tells the reader what to do next — e.g. "Sign up now", "Learn more", "Buy today".' },
            { id: 'card-2', front: 'What is the inverted pyramid?', back: 'A writing structure where the most important info comes first, followed by supporting details, then background — common in journalism.' },
            { id: 'card-3', front: 'What is copywriting vs content writing?', back: 'Copywriting persuades (ads, sales pages). Content writing informs and educates (blogs, articles, guides).' },
            { id: 'card-4', front: 'What makes a good headline?', back: 'Clarity, urgency, and specificity. It should promise a benefit and make the reader curious enough to continue.' },
            { id: 'card-5', front: 'What is tone of voice?', back: 'The personality and emotion conveyed through writing. It should be consistent with the brand and appropriate for the audience.' },
            { id: 'card-6', front: 'What is SEO writing?', back: 'Writing content optimized with keywords, meta descriptions, and structure to rank higher in search engine results.' }
        ]
    },
    'course-15': {
        title: 'Productivity Flashcards',
        cards: [
            { id: 'card-1', front: 'What is the Eisenhower Matrix?', back: 'A prioritization tool with 4 quadrants: Urgent+Important (Do), Not Urgent+Important (Schedule), Urgent+Not Important (Delegate), Neither (Eliminate).' },
            { id: 'card-2', front: 'What is the Pomodoro Technique?', back: 'Work for 25 minutes, take a 5-minute break. After 4 pomodoros, take a longer 15-30 minute break.' },
            { id: 'card-3', front: 'What is time blocking?', back: 'Scheduling specific blocks of time on your calendar for specific tasks, rather than working from an open-ended to-do list.' },
            { id: 'card-4', front: 'What is deep work?', back: 'Focused, distraction-free concentration on cognitively demanding tasks that push your abilities and create new value.' },
            { id: 'card-5', front: 'What is Parkinson\'s Law?', back: '"Work expands to fill the time available for its completion." Setting shorter deadlines can increase productivity.' },
            { id: 'card-6', front: 'What is habit stacking?', back: 'Linking a new habit to an existing one: "After I [current habit], I will [new habit]."' }
        ]
    },
    'course-16': {
        title: 'Public Speaking Flashcards',
        cards: [
            { id: 'card-1', front: 'What is the rule of three in speaking?', back: 'People tend to remember things in groups of three. Structure points, arguments, or stories in triads for maximum impact.' },
            { id: 'card-2', front: 'How do you handle stage fright?', back: 'Preparation, deep breathing, positive visualization, focusing on the message rather than yourself, and starting with familiar material.' },
            { id: 'card-3', front: 'What is vocal variety?', back: 'Varying your pitch, pace, volume, and pauses to keep the audience engaged and emphasize key points.' },
            { id: 'card-4', front: 'What is the power of the pause?', back: 'Strategic silence before or after a key point creates emphasis, gives the audience time to absorb, and projects confidence.' },
            { id: 'card-5', front: 'What makes a strong opening?', back: 'A surprising fact, a question, a story, or a bold statement that hooks the audience in the first 30 seconds.' },
            { id: 'card-6', front: 'What is the "tell them" structure?', back: 'Tell them what you\'ll tell them (intro), tell them (body), tell them what you told them (conclusion).' }
        ]
    },
    'course-17': {
        title: 'Mindfulness & Meditation Flashcards',
        cards: [
            { id: 'card-1', front: 'What is mindfulness?', back: 'The practice of being fully present and aware of where you are and what you\'re doing, without being overly reactive.' },
            { id: 'card-2', front: 'What is a body scan meditation?', back: 'A practice where you mentally scan each part of your body from head to toe, noticing sensations and releasing tension.' },
            { id: 'card-3', front: 'What is the fight-or-flight response?', back: 'The body\'s automatic stress reaction that releases cortisol and adrenaline. Mindfulness helps regulate this response.' },
            { id: 'card-4', front: 'What is box breathing?', back: 'Breathe in for 4 counts, hold for 4 counts, breathe out for 4 counts, hold for 4 counts. Repeat to calm the nervous system.' },
            { id: 'card-5', front: 'What is the difference between meditation and mindfulness?', back: 'Meditation is a formal practice (sitting, breathing). Mindfulness is a quality of awareness you can bring to any activity.' },
            { id: 'card-6', front: 'What is emotional regulation?', back: 'The ability to observe and manage your emotional responses rather than reacting impulsively to triggers.' }
        ]
    },
    'course-18': {
        title: 'Career Development Flashcards',
        cards: [
            { id: 'card-1', front: 'What is a STAR interview response?', back: 'Situation, Task, Action, Result — a structured method for answering behavioral interview questions with concrete examples.' },
            { id: 'card-2', front: 'What is personal branding?', back: 'The practice of defining and promoting what you stand for professionally — your skills, values, and unique strengths.' },
            { id: 'card-3', front: 'What is the hidden job market?', back: 'Jobs that are filled through networking and referrals before being publicly advertised — estimated at 70-80% of all positions.' },
            { id: 'card-4', front: 'What is a skills gap analysis?', back: 'Comparing your current skills against those required for your target role to identify what you need to learn or improve.' },
            { id: 'card-5', front: 'What is networking?', back: 'Building and maintaining professional relationships that can lead to career opportunities, mentorship, and knowledge sharing.' },
            { id: 'card-6', front: 'What is the 80/20 rule for careers?', back: '80% of your results come from 20% of your efforts. Focus on high-impact activities that produce the greatest career returns.' }
        ]
    },
    'course-19': {
        title: 'Spanish Language Flashcards',
        cards: [
            { id: 'card-1', front: '¿Cómo te llamas?', back: 'What is your name? — Response: Me llamo [name].' },
            { id: 'card-2', front: 'What are the Spanish subject pronouns?', back: 'yo (I), tú (you), él/ella (he/she), nosotros (we), vosotros (you all), ellos/ellas (they)' },
            { id: 'card-3', front: 'How do you conjugate regular -ar verbs?', back: 'Drop -ar, add: -o, -as, -a, -amos, -áis, -an. Example: hablar → yo hablo, tú hablas, él habla...' },
            { id: 'card-4', front: '¿Dónde está el baño?', back: 'Where is the bathroom? — A key travel phrase for beginners.' },
            { id: 'card-5', front: 'What is the difference between ser and estar?', back: 'Ser = permanent traits (identity, origin). Estar = temporary states (location, emotion, condition).' },
            { id: 'card-6', front: 'How do you say "I would like" in Spanish?', back: 'Me gustaría — used for polite requests. Example: Me gustaría un café, por favor.' }
        ]
    },
    'course-20': {
        title: 'English Grammar Flashcards',
        cards: [
            { id: 'card-1', front: 'What is the difference between "their", "there", and "they\'re"?', back: 'Their = possessive (their car). There = place (over there). They\'re = they are (they\'re coming).' },
            { id: 'card-2', front: 'What is a dangling modifier?', back: 'A phrase that doesn\'t clearly modify the right word. Wrong: "Walking to school, the rain started." Right: "Walking to school, I got caught in the rain."' },
            { id: 'card-3', front: 'When do you use "who" vs "whom"?', back: 'Who = subject (Who is calling?). Whom = object (To whom did you speak?). Tip: if "him" fits, use "whom".' },
            { id: 'card-4', front: 'What is the Oxford comma?', back: 'A comma before "and" in a list of three or more: "red, white, and blue." It prevents ambiguity.' },
            { id: 'card-5', front: 'Affect vs Effect?', back: 'Affect is usually a verb (it affects me). Effect is usually a noun (the effect was positive).' },
            { id: 'card-6', front: 'What is active vs passive voice?', back: 'Active: subject does the action (The dog bit the man). Passive: subject receives the action (The man was bitten by the dog).' }
        ]
    },
    'course-21': {
        title: 'Fitness Fundamentals Flashcards',
        cards: [
            { id: 'card-1', front: 'What is progressive overload?', back: 'Gradually increasing weight, frequency, or reps over time to continually challenge muscles and promote growth.' },
            { id: 'card-2', front: 'What is HIIT?', back: 'High-Intensity Interval Training — alternating between short bursts of intense exercise and rest periods.' },
            { id: 'card-3', front: 'What are compound exercises?', back: 'Exercises that work multiple muscle groups at once (squats, deadlifts, bench press), as opposed to isolation exercises.' },
            { id: 'card-4', front: 'Why is rest important?', back: 'Muscles repair and grow during rest, not during exercise. Overtraining without rest leads to injury and fatigue.' },
            { id: 'card-5', front: 'What is BMR?', back: 'Basal Metabolic Rate — the number of calories your body burns at rest to maintain basic functions like breathing and circulation.' },
            { id: 'card-6', front: 'What is the difference between cardio and strength training?', back: 'Cardio improves heart/lung endurance (running, cycling). Strength training builds muscle and bone density (weights, resistance).' }
        ]
    },
    'course-22': {
        title: 'Nutrition & Healthy Eating Flashcards',
        cards: [
            { id: 'card-1', front: 'What are macronutrients?', back: 'The three main nutrient groups: Carbohydrates (energy), Proteins (muscle repair), and Fats (hormones, cell structure).' },
            { id: 'card-2', front: 'What is a caloric deficit?', back: 'Consuming fewer calories than your body burns, which is required for weight loss. Typically 500 cal/day deficit = 1 lb/week loss.' },
            { id: 'card-3', front: 'How much water should you drink daily?', back: 'Generally 8 cups (2 liters) as a baseline, but needs vary based on activity level, climate, and body size.' },
            { id: 'card-4', front: 'What is the difference between whole and processed foods?', back: 'Whole foods are unprocessed or minimally processed (fruits, vegetables). Processed foods have added sugar, salt, or preservatives.' },
            { id: 'card-5', front: 'What is fiber and why is it important?', back: 'An indigestible carbohydrate found in plants. It aids digestion, promotes fullness, and helps maintain stable blood sugar.' },
            { id: 'card-6', front: 'What are micronutrients?', back: 'Vitamins and minerals needed in small amounts but essential for health — like Vitamin D, iron, calcium, and zinc.' }
        ]
    },
    'course-23': {
        title: 'Machine Learning Flashcards',
        cards: [
            { id: 'card-1', front: 'What is gradient descent?', back: 'An optimization algorithm that iteratively adjusts model parameters by moving in the direction that minimizes the loss function.' },
            { id: 'card-2', front: 'What is a neural network?', back: 'A computing system inspired by the brain, made of layers of interconnected nodes (neurons) that can learn patterns from data.' },
            { id: 'card-3', front: 'What is the bias-variance tradeoff?', back: 'High bias = underfitting (too simple). High variance = overfitting (too complex). The goal is a balanced model.' },
            { id: 'card-4', front: 'What is a CNN?', back: 'Convolutional Neural Network — a type of deep learning model specialized for image recognition using convolutional filters.' },
            { id: 'card-5', front: 'What is K-Means clustering?', back: 'An unsupervised algorithm that groups data into K clusters by iteratively assigning points to the nearest centroid.' },
            { id: 'card-6', front: 'What is cross-validation?', back: 'A technique that splits data into K folds, training on K-1 and testing on 1, rotating through all folds to evaluate model performance.' }
        ]
    },
    'course-24': {
        title: 'Cloud Computing (AWS) Flashcards',
        cards: [
            { id: 'card-1', front: 'What is IaaS vs PaaS vs SaaS?', back: 'IaaS: infrastructure (EC2). PaaS: platform (Elastic Beanstalk). SaaS: software (Gmail). Each abstracts more of the stack.' },
            { id: 'card-2', front: 'What is an EC2 instance?', back: 'Elastic Compute Cloud — a virtual server in AWS where you can run applications, choose OS, CPU, RAM, and storage.' },
            { id: 'card-3', front: 'What is S3?', back: 'Simple Storage Service — object storage that can store and retrieve any amount of data (files, images, backups) via the web.' },
            { id: 'card-4', front: 'What is AWS Lambda?', back: 'A serverless compute service that runs your code in response to events without provisioning or managing servers.' },
            { id: 'card-5', front: 'What is a VPC?', back: 'Virtual Private Cloud — a logically isolated network within AWS where you define subnets, route tables, and security rules.' },
            { id: 'card-6', front: 'What is IAM?', back: 'Identity and Access Management — AWS service for controlling who can access what resources with fine-grained permissions.' }
        ]
    }
};

export const flashcardDecks = courseFlashcards;

export const flashcardService = {
    getDeck: (courseId) => {
        if (courseFlashcards[courseId]) {
            return courseFlashcards[courseId];
        }

        // This fallback should rarely be needed now
        return {
            title: 'Course Concepts',
            cards: [
                { id: 'gen-1', front: 'What is the main goal of this topic?', back: 'To understand the core principles and apply them effectively.' },
                { id: 'gen-2', front: 'Why is this important?', back: 'It provides a foundation for advanced skills and real-world problem solving.' },
                { id: 'gen-3', front: 'Key Terminology', back: 'Review the glossary terms introduced in Module 1.' },
                { id: 'gen-4', front: 'Practical Application', back: 'Think of a real-world scenario where you would use this concept.' }
            ]
        };
    },

    getProgress: (userId, courseId) => {
        const saved = localStorage.getItem(FLASHCARD_KEY);
        const allProgress = saved ? JSON.parse(saved) : {};
        return allProgress[`${userId}-${courseId}`] || { masteredCards: [], studyingCards: [] };
    },

    markCardMastered: (userId, courseId, cardId) => {
        const saved = localStorage.getItem(FLASHCARD_KEY);
        const allProgress = saved ? JSON.parse(saved) : {};
        const key = `${userId}-${courseId}`;

        if (!allProgress[key]) {
            allProgress[key] = { masteredCards: [], studyingCards: [] };
        }

        if (!allProgress[key].masteredCards.includes(cardId)) {
            allProgress[key].masteredCards.push(cardId);
            // Remove from studying if present
            allProgress[key].studyingCards = allProgress[key].studyingCards.filter(id => id !== cardId);
        }

        localStorage.setItem(FLASHCARD_KEY, JSON.stringify(allProgress));
        return allProgress[key];
    },

    markCardStudying: (userId, courseId, cardId) => {
        const saved = localStorage.getItem(FLASHCARD_KEY);
        const allProgress = saved ? JSON.parse(saved) : {};
        const key = `${userId}-${courseId}`;

        if (!allProgress[key]) {
            allProgress[key] = { masteredCards: [], studyingCards: [] };
        }

        if (!allProgress[key].studyingCards.includes(cardId) && !allProgress[key].masteredCards.includes(cardId)) {
            allProgress[key].studyingCards.push(cardId);
        }

        localStorage.setItem(FLASHCARD_KEY, JSON.stringify(allProgress));
        return allProgress[key];
    }
};
