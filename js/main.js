document.addEventListener('DOMContentLoaded', () => {
    // Event dropdown functionality
    const eventSelector = document.querySelector('.event-selector');
    const eventDropdown = document.querySelector('.event-dropdown');

    eventSelector.addEventListener('click', () => {
        eventDropdown.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!eventSelector.contains(e.target)) {
            eventDropdown.classList.remove('active');
        }
    });

    // Load latest event information
    loadLatestEvent();
});

async function loadLatestEvent() {
    try {
        const response = await fetch('events/2025-01-11/projects.json');
        const eventData = await response.json();
        
        const eventInfo = document.querySelector('.event-info');
        eventInfo.innerHTML = `
            <h3>${eventData.eventName}</h3>
            <p>${eventData.description}</p>
            <div class="project-grid">
                ${eventData.projects.map(project => `
                    <div class="project-card">
                        <h4>${project.name}</h4>
                        <p>${project.description}</p>
                        <a href="${project.githubLink}" target="_blank">View on GitHub</a>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error loading event data:', error);
    }
}