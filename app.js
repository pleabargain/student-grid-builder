document.addEventListener('DOMContentLoaded', () => {
    const studentForm = document.getElementById('studentForm');
    const studentNameInput = document.getElementById('studentName');
    const gridContainer = document.getElementById('gridContainer');
    const modal = document.getElementById('jsonModal');
    const jsonDisplay = document.getElementById('jsonDisplay');
    const viewJsonBtn = document.getElementById('viewJson');
    const closeModalBtn = document.getElementById('closeModal');
    const loadJsonBtn = document.getElementById('loadJson');
    const jsonFileInput = document.getElementById('jsonFileInput');

    // Track used words in the session
    let usedVerbs = new Set();
    let usedAdjectives = new Set();
    
    const adjectives = [
        'creative', 'intelligent', 'curious', 'diligent', 'ambitious',
        'thoughtful', 'innovative', 'focused', 'dedicated', 'resourceful',
        'analytical', 'enthusiastic', 'organized', 'persistent', 'adaptable',
        'collaborative', 'confident', 'dynamic', 'efficient', 'flexible',
        'insightful', 'logical', 'motivated', 'observant', 'proactive',
        'reliable', 'strategic', 'systematic', 'versatile', 'visionary',
        'articulate', 'balanced', 'competent', 'determined', 'empathetic',
        'forward-thinking', 'genuine', 'harmonious', 'imaginative', 'judicious',
        'creative', 'intelligent', 'curious', 'diligent', 'ambitious',
    'thoughtful', 'innovative', 'focused', 'dedicated', 'resourceful',
    'analytical', 'enthusiastic', 'organized', 'persistent', 'adaptable',
    'collaborative', 'confident', 'dynamic', 'efficient', 'flexible',
    'insightful', 'logical', 'motivated', 'observant', 'proactive',
    'reliable', 'strategic', 'systematic', 'versatile', 'visionary',
    'articulate', 'balanced', 'competent', 'determined', 'empathetic',
    'forward-thinking', 'genuine', 'harmonious', 'imaginative', 'judicious',
    'knowledgeable', 'methodical', 'nurturing', 'optimistic', 'passionate',
    'quick-thinking', 'resilient', 'skillful', 'thorough', 'understanding',
    'valuable', 'wise', 'zealous', 'authentic', 'brilliant',
    'capable', 'diplomatic', 'energetic', 'faithful', 'graceful',
    'helpful', 'independent', 'judicial', 'kind', 'learned',
    'mindful', 'noble', 'objective', 'practical', 'qualified',
    'respectful', 'sincere', 'talented', 'unifying', 'vigilant',
    'wholehearted', 'expert', 'youthful', 'zestful', 'ambitious',
    'astute', 'broadminded', 'conscientious', 'decisive', 'enterprising',
    'fair-minded', 'growth-oriented', 'honorable', 'innovative', 'judicious',
    'keen', 'leading-edge', 'masterful', 'notable', 'open-minded',
    'perceptive', 'quality-driven', 'results-oriented', 'successful', 'trustworthy',
    'accomplished', 'adept', 'agile', 'assertive', 'attentive',
    'bold', 'candid', 'committed', 'communicative', 'constructive',
    'courageous', 'credible', 'cultivated', 'dependable', 'detail-oriented',
    'disciplined', 'dutiful', 'effective', 'eloquent', 'ethical',
    'exceptional', 'exemplary', 'experienced', 'far-sighted', 'forthright',
    'goal-oriented', 'grounded', 'guiding', 'hardworking', 'humble',
    'idealistic', 'influential', 'inspiring', 'intellectual', 'intuitive',
    'inventive', 'invested', 'leadership-oriented', 'learned', 'mature',
    'measured', 'mentoring', 'meticulous', 'multifaceted', 'patient',
    'persevering', 'persuasive', 'pioneering', 'precise', 'principled',
    'professional', 'proficient', 'progressive', 'punctual', 'purposeful',
    'rational', 'receptive', 'reflective', 'resolute', 'responsible',
    'sagacious', 'scholarly', 'self-aware', 'service-oriented', 'sharp',
    'steadfast', 'team-oriented', 'tenacious', 'transformative', 'transparent',
    'unbiased', 'upstanding', 'value-driven', 'well-rounded', 'willing',
        'knowledgeable', 'methodical', 'nurturing', 'optimistic', 'passionate',
        'quick-thinking', 'resilient', 'skillful', 'thorough', 'understanding',
        'valuable', 'wise', 'zealous', 'authentic', 'brilliant',
        'capable', 'diplomatic', 'energetic', 'faithful', 'graceful',
        'helpful', 'independent', 'judicial', 'kind', 'learned',
        'mindful', 'noble', 'objective', 'practical', 'qualified',
        'respectful', 'sincere', 'talented', 'unifying', 'vigilant',
        'wholehearted', 'expert', 'youthful', 'zestful', 'ambitious',
        'astute', 'broadminded', 'conscientious', 'decisive', 'enterprising',
        'fair-minded', 'growth-oriented', 'honorable', 'innovative', 'judicious',
        'keen', 'leading-edge', 'masterful', 'notable', 'open-minded',
        'perceptive', 'quality-driven', 'results-oriented', 'successful', 'trustworthy'
    ];

    const verbs = [
        'running', 'jumping', 'dancing', 'singing', 'reading',
        'writing', 'coding', 'drawing', 'painting', 'studying',
        'thinking', 'creating', 'building', 'designing', 'exploring',
        'swimming', 'skating', 'cycling', 'jogging', 'hiking',
        'running', 'jumping', 'dancing', 'singing', 'reading',
'writing', 'coding', 'drawing', 'painting', 'studying',
'thinking', 'creating', 'building', 'designing', 'exploring',
'swimming', 'skating', 'cycling', 'jogging', 'hiking',
'climbing', 'cooking', 'baking', 'brewing', 'crafting',
'teaching', 'learning', 'playing', 'practicing', 'performing',
'sculpting', 'knitting', 'sewing', 'weaving', 'carving',
'planning', 'organizing', 'analyzing', 'researching', 'testing',
'exercising', 'stretching', 'meditating', 'breathing', 'relaxing',
'filming', 'editing', 'recording', 'mixing', 'producing',
'gardening', 'planting', 'growing', 'nurturing', 'harvesting',
'typing', 'clicking', 'scrolling', 'browsing', 'searching',
'sketching', 'doodling', 'coloring', 'shading', 'illustrating',
'programming', 'debugging', 'testing', 'deploying', 'maintaining',
'writing', 'drafting', 'editing', 'revising', 'publishing',
'composing', 'arranging', 'conducting', 'practicing', 'performing',
'photographing', 'capturing', 'processing', 'printing', 'sharing',
'brainstorming', 'ideating', 'conceptualizing', 'planning', 'executing',
'measuring', 'calculating', 'computing', 'solving', 'proving',
'presenting', 'speaking', 'teaching', 'explaining', 'demonstrating',
'archiving', 'cataloging', 'organizing', 'sorting', 'filing',
'innovating', 'inventing', 'discovering', 'experimenting', 'testing',
'directing', 'managing', 'leading', 'coordinating', 'facilitating',
        'climbing', 'cooking', 'baking', 'brewing', 'crafting',
        'teaching', 'learning', 'playing', 'practicing', 'performing', 
        'sculpting', 'knitting', 'sewing', 'weaving', 'carving',
        'planning', 'organizing', 'analyzing', 'researching', 'testing',
        'exercising', 'stretching', 'meditating', 'breathing', 'relaxing',
        'filming', 'editing', 'recording', 'mixing', 'producing',
        'gardening', 'planting', 'growing', 'nurturing', 'harvesting',
        'typing', 'clicking', 'scrolling', 'browsing', 'searching',
        'sketching', 'doodling', 'coloring', 'shading', 'illustrating',
        'programming', 'debugging', 'testing', 'deploying', 'maintaining',
    ];

    // Load existing students from localStorage
    let students = JSON.parse(localStorage.getItem('students') || '[]');
    
    // Initialize used words tracking with existing students' words
    students.forEach(student => {
        if (student.verbs) {
            student.verbs.forEach(verb => usedVerbs.add(verb));
        }
        if (student.adjectives) {
            student.adjectives.forEach(adj => usedAdjectives.add(adj));
        }
    });
    
    updateGrid();

    // Get unique random items from an array, avoiding previously used words
    function getRandomItems(array, usedWords, count = 5) {
        const available = array.filter(word => !usedWords.has(word));
        
        // If we don't have enough unique words, reset the tracking
        if (available.length < count) {
            usedWords.clear();
            return getRandomItems(array, usedWords, count);
        }
        
        const selected = available.sort(() => 0.5 - Math.random()).slice(0, count);
        selected.forEach(word => usedWords.add(word));
        return selected;
    }

    // Get unique random verbs
    function getRandomVerbs() {
        return getRandomItems(verbs, usedVerbs);
    }

    // Get unique random adjectives
    function getRandomAdjectives() {
        return getRandomItems(adjectives, usedAdjectives);
    }

    studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = studentNameInput.value.trim();
        if (name) {
            students.push({
                name,
                verbs: getRandomVerbs(),
                adjectives: getRandomAdjectives()
            });
            localStorage.setItem('students', JSON.stringify(students));
            updateGrid();
            studentNameInput.value = '';
        }
    });

    function updateGrid() {
        gridContainer.innerHTML = '';
        students.forEach((student, index) => {
            const card = document.createElement('div');
            card.className = 'student-card';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.addEventListener('click', () => deleteStudent(index, card));
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'student-name';
            nameDiv.textContent = student.name || student; // Handle legacy data format
            
            // Create verbs section
            const verbTitle = document.createElement('div');
            verbTitle.className = 'section-title';
            verbTitle.textContent = 'VERBS';
            
            const verbList = document.createElement('ul');
            verbList.className = 'section-list verb-list';
            
            // Handle both new and legacy data formats
            if (student.verbs) {
                student.verbs.forEach(verb => {
                    const li = document.createElement('li');
                    li.className = 'section-item';
                    const link = document.createElement('a');
                    link.href = `https://www.google.com/search?q=${encodeURIComponent(verb)}`;
                    link.target = '_blank';
                    link.textContent = verb;
                    li.appendChild(link);
                    verbList.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.className = 'section-item';
                li.textContent = student.verb || verbs[Math.floor(Math.random() * verbs.length)];
                verbList.appendChild(li);
            }

            // Create adjectives section
            const adjectiveTitle = document.createElement('div');
            adjectiveTitle.className = 'section-title';
            adjectiveTitle.textContent = 'ADJECTIVES';
            
            const adjectiveList = document.createElement('ul');
            adjectiveList.className = 'section-list adjective-list';

            // Create new sections
            const createSection = (title, items, emoji) => {
                const container = document.createElement('div');
                const sectionTitle = document.createElement('div');
                sectionTitle.className = 'section-title';
                sectionTitle.innerHTML = `${emoji} ${title}`;
                
                const list = document.createElement('ul');
                list.className = 'section-list';
                
                // Select and display one random item from the category
                if (items.length > 0) {
                    const randomItem = items[Math.floor(Math.random() * items.length)];
                    const li = document.createElement('li');
                    li.className = 'section-item';
                    li.innerHTML = `<span class="emoji-large">${randomItem.emoji}</span> ${randomItem.text}`;
                    list.appendChild(li);
                }
                
                container.appendChild(sectionTitle);
                container.appendChild(list);
                return container;
            };

            // Add new sections
            if (student.categories) {
                if (student.categories.character) {
                    card.appendChild(createSection('CHARACTER', student.categories.character, '👤'));
                }
                if (student.categories.business) {
                    card.appendChild(createSection('BUSINESS', student.categories.business, '💼'));
                }
                if (student.categories.psychology) {
                    card.appendChild(createSection('PSYCHOLOGY', student.categories.psychology, '🧠'));
                }
                if (student.categories.desires) {
                    card.appendChild(createSection('DESIRES', student.categories.desires, '💫'));
                }
            }
            
            if (student.adjectives) {
                student.adjectives.forEach(adjective => {
                    const li = document.createElement('li');
                    li.className = 'section-item';
                    const link = document.createElement('a');
                    link.href = `https://www.google.com/search?q=${encodeURIComponent(adjective)}`;
                    link.target = '_blank';
                    link.textContent = adjective;
                    li.appendChild(link);
                    adjectiveList.appendChild(li);
                });
            }
            
            card.appendChild(deleteBtn);
            card.appendChild(nameDiv);
            card.appendChild(verbTitle);
            card.appendChild(verbList);
            card.appendChild(adjectiveTitle);
            card.appendChild(adjectiveList);
            gridContainer.appendChild(card);
        });
    }

    function deleteStudent(index, card) {
        // Add fade-out effect
        card.style.opacity = '0';
        
        // Wait for animation to complete before removing
        setTimeout(() => {
            students.splice(index, 1);
            localStorage.setItem('students', JSON.stringify(students));
            
            // If all students are deleted, reset the used words tracking
            if (students.length === 0) {
                usedVerbs.clear();
                usedAdjectives.clear();
            }
            
            updateGrid();
        }, 300);
    }

    // Modal functionality
    viewJsonBtn.addEventListener('click', () => {
        const formattedJson = JSON.stringify(students, null, 2);
        jsonDisplay.textContent = formattedJson;
        modal.style.display = 'block';
    });

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // JSON file loading functionality
    loadJsonBtn.addEventListener('click', () => {
        jsonFileInput.click();
    });

    jsonFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const jsonData = JSON.parse(event.target.result);
                
                // Validate JSON structure
                if (!Array.isArray(jsonData.students)) {
                    alert('Invalid JSON format. File must contain a "students" array.');
                    return;
                }

                // Validate and process each student
                const validStudents = jsonData.students.filter(student => {
                    if (!student.name) return false;
                    
                    // If verbs/adjectives aren't provided, generate them
                    if (!Array.isArray(student.verbs) || student.verbs.length !== 5) {
                        student.verbs = getRandomVerbs();
                    }
                    if (!Array.isArray(student.adjectives) || student.adjectives.length !== 5) {
                        student.adjectives = getRandomAdjectives();
                    }
                    
                    return true;
                });

                if (validStudents.length === 0) {
                    alert('No valid student data found in the file.');
                    return;
                }

                // Add new students to existing ones
                students = [...students, ...validStudents];
                localStorage.setItem('students', JSON.stringify(students));
                
                // Track words from loaded students
                validStudents.forEach(student => {
                    student.verbs.forEach(verb => usedVerbs.add(verb));
                    student.adjectives.forEach(adj => usedAdjectives.add(adj));
                });
                
                updateGrid();

                // Reset file input
                e.target.value = '';
                
                alert(`Successfully added ${validStudents.length} student(s).`);
            } catch (error) {
                alert('Error reading JSON file: ' + error.message);
            }
        };
        reader.readAsText(file);
    });
});
