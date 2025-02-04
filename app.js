document.addEventListener('DOMContentLoaded', () => {
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Update active states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(tabId + 'Tab').classList.add('active');
        });
    });

    const studentForm = document.getElementById('studentForm');
    const studentNameInput = document.getElementById('studentName');
    const gridContainer = document.getElementById('gridContainer');
    const modal = document.getElementById('jsonModal');
    const jsonDisplay = document.getElementById('jsonDisplay');
    const viewJsonBtn = document.getElementById('viewJson');
    const closeModalBtn = document.getElementById('closeModal');
    const loadJsonBtn = document.getElementById('loadJson');
    const jsonFileInput = document.getElementById('jsonFileInput');
    const clearAllBtn = document.getElementById('clearAll');

    // Track used words in the session
    let usedVerbs = new Set();
    let usedAdjectives = new Set();
    
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

    // Error logging function
    async function logError(error, context = '') {
        const timestamp = new Date().toISOString();
        const errorLog = `[${timestamp}] [ERROR] ${context}\n${error.stack || error}\n---\n`;
        
        console.error(errorLog);
        
        // Append to error.log file
        try {
            const response = await fetch('/log-error', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: errorLog
            });
            
            if (!response.ok) {
                console.error('Failed to log error to server');
            }
        } catch (e) {
            // If server is not running, write to error.log directly
            const fs = require('fs');
            fs.appendFileSync('error.log', errorLog + '\n');
        }
    }

    // Parse comma-separated input with emoji
    function parseCommaInput(input) {
        return input.split(',').map(item => {
            const trimmed = item.trim();
            // Extract emoji and text
            const match = trimmed.match(/^(.*?)(\s*[^\w\s]+)$/);
            if (match) {
                return {
                    text: match[1].trim(),
                    emoji: match[2].trim()
                };
            }
            // If no emoji found, return text only
            return {
                text: trimmed,
                emoji: '📌' // Default emoji
            };
        }).filter(item => item.text); // Remove empty entries
    }

    studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        try {
            const name = studentNameInput.value.trim();
            if (!name) {
                throw new Error('Name is required');
            }

            const newStudent = {
                name,
                verbs: getRandomVerbs(),
                adjectives: getRandomAdjectives(),
                categories: {
                    desires: parseCommaInput(document.getElementById('desires').value),
                    psychology: parseCommaInput(document.getElementById('psychology').value),
                    business: parseCommaInput(document.getElementById('business').value),
                    character: parseCommaInput(document.getElementById('character').value)
                }
            };

            students.push(newStudent);
            localStorage.setItem('students', JSON.stringify(students));
            updateGrid();

            // Reset form
            studentForm.reset();

            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.textContent = 'Student added successfully!';
            studentForm.insertBefore(successMsg, studentForm.firstChild);

            // Remove success message after 3 seconds
            setTimeout(() => {
                successMsg.remove();
            }, 3000);

        } catch (error) {
            logError(error, 'Error adding student');
            
            // Show error message to user
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = error.message || 'Error adding student';
            studentForm.insertBefore(errorMsg, studentForm.firstChild);

            // Remove error message after 5 seconds
            setTimeout(() => {
                errorMsg.remove();
            }, 5000);
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
            nameDiv.textContent = student.name || student;
            
            // Create new sections
            const createSection = (title, items, emoji) => {
                const container = document.createElement('div');
                container.className = 'section-container';
                
                const sectionTitle = document.createElement('div');
                sectionTitle.className = 'section-title';
                sectionTitle.innerHTML = `${emoji} ${title}`;
                
                const list = document.createElement('ul');
                list.className = 'section-list';
                
                // Select and display one random item from the category
                if (items && items.length > 0) {
                    const randomItem = items[Math.floor(Math.random() * items.length)];
                    const li = document.createElement('li');
                    li.className = 'section-item';
                    li.innerHTML = `<span class="emoji-large">${randomItem.emoji}</span> ${randomItem.text}`;
                    list.appendChild(li);
                }
                
                const divider = document.createElement('div');
                divider.className = 'section-divider';
                
                container.appendChild(sectionTitle);
                container.appendChild(list);
                container.appendChild(divider);
                return container;
            };

            // Add sections in correct order
            card.appendChild(deleteBtn);
            card.appendChild(nameDiv);
            
            if (student.categories) {
                const sections = [
                    { name: 'CHARACTER', data: student.categories.character, emoji: '👤' },
                    { name: 'BUSINESS', data: student.categories.business, emoji: '💼' },
                    { name: 'PSYCHOLOGY', data: student.categories.psychology, emoji: '🧠' },
                    { name: 'DESIRES', data: student.categories.desires, emoji: '💫' }
                ];

                sections.forEach(section => {
                    if (section.data) {
                        card.appendChild(createSection(section.name, section.data, section.emoji));
                    }
                });
            }

            // Create verbs section
            const verbContainer = document.createElement('div');
            verbContainer.className = 'section-container';
            
            const verbTitle = document.createElement('div');
            verbTitle.className = 'section-title';
            verbTitle.textContent = 'VERBS';
            
            const verbList = document.createElement('ul');
            verbList.className = 'section-list verb-list';
            
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
            }

            const verbDivider = document.createElement('div');
            verbDivider.className = 'section-divider';
            
            verbContainer.appendChild(verbTitle);
            verbContainer.appendChild(verbList);
            verbContainer.appendChild(verbDivider);
            card.appendChild(verbContainer);

            // Create adjectives section
            const adjectiveContainer = document.createElement('div');
            adjectiveContainer.className = 'section-container';
            
            const adjectiveTitle = document.createElement('div');
            adjectiveTitle.className = 'section-title';
            adjectiveTitle.textContent = 'ADJECTIVES';
            
            const adjectiveList = document.createElement('ul');
            adjectiveList.className = 'section-list adjective-list';

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

            const adjectiveDivider = document.createElement('div');
            adjectiveDivider.className = 'section-divider';
            
            adjectiveContainer.appendChild(adjectiveTitle);
            adjectiveContainer.appendChild(adjectiveList);
            adjectiveContainer.appendChild(adjectiveDivider);
            card.appendChild(adjectiveContainer);

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

    // Clear All functionality
    clearAllBtn.addEventListener('click', () => {
        if (students.length === 0) {
            alert('No students to clear.');
            return;
        }

        if (confirm('Are you sure you want to clear all students? This action cannot be undone.')) {
            // Clear all data
            students = [];
            localStorage.setItem('students', JSON.stringify(students));
            usedVerbs.clear();
            usedAdjectives.clear();
            
            // Update the grid
            updateGrid();

            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.textContent = 'All students have been cleared successfully!';
            gridContainer.insertAdjacentElement('beforebegin', successMsg);

            // Remove success message after 3 seconds
            setTimeout(() => {
                successMsg.remove();
            }, 3000);
        }
    });
});

// Adjectives and verbs arrays
const adjectives = [
    'creative', 'intelligent', 'curious', 'diligent', 'ambitious',
    'thoughtful', 'innovative', 'focused', 'dedicated', 'resourceful',
    'analytical', 'enthusiastic', 'organized', 'persistent', 'adaptable',
    'collaborative', 'confident', 'dynamic', 'efficient', 'flexible'
];

const verbs = [
    'running', 'jumping', 'dancing', 'singing', 'reading',
    'writing', 'coding', 'drawing', 'painting', 'studying',
    'thinking', 'creating', 'building', 'designing', 'exploring',
    'swimming', 'skating', 'cycling', 'jogging', 'hiking'
];
