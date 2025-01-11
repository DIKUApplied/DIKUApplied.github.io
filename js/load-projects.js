async function loadProjects(containerSelector, projectsPath) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    try {
        const response = await fetch(projectsPath);
        const data = await response.json();

        if (!data.projects || !data.projects.length) {
            container.innerHTML = '<p class="no-projects">No projects uploaded yet.</p>';
            return;
        }

        const projectsHTML = data.projects.map(project => `
            <div class="project-card">
                ${project.image ? `<img src="${project.image}" alt="${project.name}" loading="lazy">` : ''}
                <h4>${project.name}</h4>
                <div class="creator-info">by ${project.creatorName}</div>
                <p>${project.description}</p>
                <a href="${project.githubLink}" target="_blank" class="github-link">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                    </svg>
                    View on GitHub
                </a>
            </div>
        `).join('');

        container.innerHTML = projectsHTML;
    } catch (error) {
        console.error('Error loading projects:', error);
        container.innerHTML = '<p class="error">Error loading projects. Please try again later.</p>';
    }
}

let isAdminMode = false;

function renderProjects(data, container) {
    const projectsHTML = data.projects.map(project => `
        <div class="project-card" data-project-id="${project.id}">
            ${project.image ? `<img src="${project.image}" alt="${project.name}">` : ''}
            <h4>${project.name}</h4>
            <p class="creator-info">by ${project.creatorName}</p>
            <p>${project.description}</p>
            <a href="${project.githubLink}" class="github-link">View on GitHub</a>
            ${isAdminMode ? `
                <button class="delete-button" onclick="deleteProject('${project.id}')">
                    Delete Project
                </button>
            ` : ''}
        </div>
    `).join('');

    container.innerHTML = projectsHTML;
}

// Add click handler for admin button
document.getElementById('adminButton').addEventListener('click', () => {
    const password = prompt('Enter admin password:');
    if (password === 'firstdikuapplied') { // Using the same password
        isAdminMode = !isAdminMode;
        document.getElementById('adminButton').classList.toggle('active');
        // Refresh the project display
        loadProjects();
    } else {
        alert('Incorrect password');
    }
});