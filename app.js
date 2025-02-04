document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('gridContainer');
    const modal = document.getElementById('jsonModal');
    const jsonDisplay = document.getElementById('jsonDisplay');
    const viewJsonBtn = document.getElementById('viewJson');
    const closeModalBtn = document.getElementById('closeModal');
    const loadJsonBtn = document.getElementById('loadJson');
    const jsonFileInput = document.getElementById('jsonFileInput');
    const clearAllBtn = document.getElementById('clearAll');

    // Store negotiations data
    let negotiations = [];

    // Error logging function
    async function logError(error, context = '') {
        const timestamp = new Date().toISOString();
        const errorLog = `[${timestamp}] [ERROR] ${context}\n${error.stack || error}\n---\n`;
        
        console.error(errorLog);
        
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
            console.error('Failed to log error:', e);
        }
    }

    // Helper function to create strategy section
    function createStrategySection(strategy) {
        const template = document.getElementById('strategyTemplate');
        const clone = template.content.cloneNode(true);
        
        // Fill in strategy details
        const approachValue = clone.querySelector('.approach-value');
        approachValue.textContent = strategy.overallApproach;
        
        const objectivesList = clone.querySelector('.objectives-list');
        strategy.longTermObjectives.forEach(obj => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${obj.objective}</strong> (${obj.importance}) - ${obj.timeframe}`;
            objectivesList.appendChild(li);
        });
        
        const relationshipOutcome = clone.querySelector('.relationship-outcome');
        relationshipOutcome.textContent = `Desired Outcome: ${strategy.relationshipGoals.desiredOutcome}`;
        
        const futureInteractions = clone.querySelector('.future-interactions');
        if (strategy.relationshipGoals.futureInteractions) {
            futureInteractions.textContent = `Future Interactions: ${strategy.relationshipGoals.futureInteractions}`;
        }
        
        return clone;
    }
    
    // Helper function to create tactics section
    function createTacticsSection(tactics) {
        const template = document.getElementById('tacticsTemplate');
        const clone = template.content.cloneNode(true);
        
        // Opening Approach
        const initialOffer = clone.querySelector('.initial-offer');
        initialOffer.textContent = `Initial Offer: ${tactics.openingApproach.initialOffer}`;
        
        const anchoringStrategy = clone.querySelector('.anchoring-strategy');
        anchoringStrategy.textContent = `Anchoring: ${tactics.openingApproach.anchoringStrategy}`;
        
        // Concession Plan
        const sequenceList = clone.querySelector('.sequence-list');
        tactics.concessionPlan.sequence.forEach(stage => {
            const div = document.createElement('div');
            div.className = 'concession-stage';
            div.innerHTML = `
                <h5>${stage.stage}</h5>
                <p><strong>Possible Concessions:</strong></p>
                <ul>${stage.possibleConcessions.map(c => `<li>${c}</li>`).join('')}</ul>
                <p><strong>Trigger Conditions:</strong></p>
                <ul>${stage.triggerConditions.map(t => `<li>${t}</li>`).join('')}</ul>
            `;
            sequenceList.appendChild(div);
        });
        
        const pacing = clone.querySelector('.pacing');
        pacing.textContent = `Pacing Strategy: ${tactics.concessionPlan.pacing}`;
        
        // Persuasion Techniques
        const techniquesList = clone.querySelector('.techniques-list');
        tactics.persuasionTechniques.forEach(tech => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${tech.technique}</strong>
                <p>${tech.applicationContext}</p>
                ${tech.fallbackOptions ? 
                    `<p><em>Fallback Options:</em> ${tech.fallbackOptions.join(', ')}</p>` : 
                    ''}
            `;
            techniquesList.appendChild(li);
        });
        
        // Information Gathering
        const questionsList = clone.querySelector('.questions-list');
        tactics.informationGathering.keyQuestions.forEach(q => {
            const li = document.createElement('li');
            li.textContent = q;
            questionsList.appendChild(li);
        });
        
        const observationList = clone.querySelector('.observation-list');
        tactics.informationGathering.observationFocus.forEach(o => {
            const li = document.createElement('li');
            li.textContent = o;
            observationList.appendChild(li);
        });
        
        // Deadlock Breakers
        const breakersList = clone.querySelector('.breakers-list');
        tactics.deadlockBreakers.forEach(breaker => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${breaker.approach}</strong>
                <p>Conditions: ${breaker.conditions}</p>
                <p>Risks: ${breaker.risks}</p>
            `;
            breakersList.appendChild(li);
        });
        
        return clone;
    }

    function updateGrid() {
        gridContainer.innerHTML = '';
        negotiations.forEach((negotiation, index) => {
            const { topic, parties } = negotiation;

            // Create topic header
            const topicHeader = document.createElement('div');
            topicHeader.className = 'negotiation-topic';
            topicHeader.style.gridColumn = '1 / span 2';
            topicHeader.textContent = topic.title;
            gridContainer.appendChild(topicHeader);

            // Create description
            const description = document.createElement('div');
            description.className = 'negotiation-description';
            description.style.gridColumn = '1 / span 2';
            description.textContent = topic.description;
            gridContainer.appendChild(description);

            // Create cards for both parties
            parties.forEach(party => {
                const card = document.createElement('div');
                card.className = 'negotiation-card';

                // Party name and role
                const nameDiv = document.createElement('div');
                nameDiv.className = 'party-name';
                nameDiv.textContent = party.name;

                const roleDiv = document.createElement('div');
                roleDiv.className = 'party-role';
                roleDiv.textContent = party.role;

                // Interests section
                const interestsSection = document.createElement('div');
                interestsSection.className = 'section-container';
                const interestsTitle = document.createElement('div');
                interestsTitle.className = 'section-title';
                interestsTitle.textContent = 'INTERESTS';
                const interestsList = document.createElement('ul');
                interestsList.className = 'interests-list';
                party.interests.forEach(interest => {
                    const li = document.createElement('li');
                    li.textContent = interest;
                    interestsList.appendChild(li);
                });

                // Constraints section
                const constraintsSection = document.createElement('div');
                constraintsSection.className = 'section-container';
                const constraintsTitle = document.createElement('div');
                constraintsTitle.className = 'section-title';
                constraintsTitle.textContent = 'CONSTRAINTS';
                const constraintsList = document.createElement('ul');
                constraintsList.className = 'constraints-list';
                party.constraints.forEach(constraint => {
                    const li = document.createElement('li');
                    li.textContent = constraint;
                    constraintsList.appendChild(li);
                });

                // Negotiable points section
                const pointsSection = document.createElement('div');
                pointsSection.className = 'negotiable-points';
                const pointsTitle = document.createElement('div');
                pointsTitle.className = 'section-title';
                pointsTitle.textContent = 'CURRENT POSITIONS';

                const pointsList = document.createElement('ul');
                pointsList.className = 'section-list';
                negotiation.negotiablePoints.forEach(point => {
                    const li = document.createElement('li');
                    li.className = 'section-item';
                    const position = party.id === 'party1' ? point.currentPosition.party1Position : point.currentPosition.party2Position;
                    li.textContent = `${point.topic}: ${position}`;
                    pointsList.appendChild(li);
                });

                // Walkaway conditions section
                const walkawaySection = document.createElement('div');
                walkawaySection.className = 'walkaway-conditions';
                const walkawayTitle = document.createElement('div');
                walkawayTitle.className = 'section-title';
                walkawayTitle.textContent = 'WALKAWAY CONDITIONS';

                const walkawayList = document.createElement('ul');
                walkawayList.className = 'section-list';
                const conditions = party.id === 'party1' ? negotiation.walkawayConditions.party1Conditions : negotiation.walkawayConditions.party2Conditions;
                conditions.forEach(condition => {
                    const li = document.createElement('li');
                    li.className = 'section-item';
                    li.textContent = condition.condition;
                    walkawayList.appendChild(li);
                });

                // Assemble the card
                card.appendChild(nameDiv);
                card.appendChild(roleDiv);
                
                interestsSection.appendChild(interestsTitle);
                interestsSection.appendChild(interestsList);
                card.appendChild(interestsSection);

                constraintsSection.appendChild(constraintsTitle);
                constraintsSection.appendChild(constraintsList);
                card.appendChild(constraintsSection);

                pointsSection.appendChild(pointsTitle);
                pointsSection.appendChild(pointsList);
                card.appendChild(pointsSection);

                walkawaySection.appendChild(walkawayTitle);
                walkawaySection.appendChild(walkawayList);
                card.appendChild(walkawaySection);

                // Add strategy section if available
                if (negotiation.strategies) {
                    const strategySection = createStrategySection(negotiation.strategies);
                    card.appendChild(strategySection);
                }

                // Add tactics section if available
                if (negotiation.tactics) {
                    const tacticsSection = createTacticsSection(negotiation.tactics);
                    card.appendChild(tacticsSection);
                }

                gridContainer.appendChild(card);
            });
        });
    }

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
                if (!Array.isArray(jsonData.scenarios)) {
                    throw new Error('Invalid JSON format. File must contain a "scenarios" array.');
                }

                negotiations = jsonData.scenarios;
                updateGrid();

                // Reset file input
                e.target.value = '';
                
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.className = 'success-message';
                successMsg.textContent = 'Negotiation data loaded successfully!';
                gridContainer.insertAdjacentElement('beforebegin', successMsg);

                setTimeout(() => {
                    successMsg.remove();
                }, 3000);

            } catch (error) {
                logError(error, 'Error loading JSON file');
                alert('Error reading JSON file: ' + error.message);
            }
        };
        reader.readAsText(file);
    });

    // Initialize collapsible sections
    function initializeCollapsible() {
        document.querySelectorAll('.collapsible .section-header').forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const button = header.querySelector('.toggle-btn i');
                
                // Toggle content visibility
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                    button.classList.remove('fa-chevron-up');
                    button.classList.add('fa-chevron-down');
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";
                    button.classList.remove('fa-chevron-down');
                    button.classList.add('fa-chevron-up');
                }
            });
        });
    }

    // Modal functionality
    viewJsonBtn.addEventListener('click', () => {
        const formattedJson = JSON.stringify(negotiations, null, 2);
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

    // Initialize collapsible sections after loading JSON
    const originalUpdateGrid = updateGrid;
    updateGrid = function() {
        originalUpdateGrid.apply(this, arguments);
        initializeCollapsible();
    };

    // Clear All functionality
    clearAllBtn.addEventListener('click', () => {
        if (negotiations.length === 0) {
            alert('No negotiations to clear.');
            return;
        }

        if (confirm('Are you sure you want to clear all negotiations? This action cannot be undone.')) {
            negotiations = [];
            updateGrid();

            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.textContent = 'All negotiations have been cleared successfully!';
            gridContainer.insertAdjacentElement('beforebegin', successMsg);

            setTimeout(() => {
                successMsg.remove();
            }, 3000);
        }
    });
});
