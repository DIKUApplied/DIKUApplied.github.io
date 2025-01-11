class GitHubAPI {
    constructor(token) {
        this.token = token;
        this.baseUrl = 'https://api.github.com';
        this.owner = 'DIKUApplied';
        this.repo = 'dikuapplied.github.io';
    }

    async uploadFile(path, content, message) {
        try {
            // First check if file exists
            let existingFile = null;
            try {
                const response = await fetch(`${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`, {
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                if (response.ok) {
                    existingFile = await response.json();
                }
            } catch (error) {
                console.log('File does not exist yet');
            }

            // Prepare the request body
            const body = {
                message: message,
                content: btoa(unescape(encodeURIComponent(content)))
            };

            // If file exists, include its SHA
            if (existingFile && existingFile.sha) {
                body.sha = existingFile.sha;
            }

            // Upload/update the file
            const response = await fetch(`${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    async uploadProject(projectData, imageFile) {
        try {
            // 1. Upload image
            const timestamp = new Date().getTime();
            const filename = `project_${timestamp}.png`;
            const imagePath = `events/2025-01-11/images/project-screenshots/${filename}`;
            
            // Convert image to base64
            const imageBase64 = await this.fileToBase64(imageFile);
            
            // Upload image
            await this.uploadFile(imagePath, imageBase64, 'Upload project image');
            
            // 2. Update projects.json
            const projectsPath = 'events/2025-01-11/projects.json';
            
            // Get current projects or create new array if doesn't exist
            let currentProjects = { projects: [] };
            try {
                const response = await fetch(`${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${projectsPath}`, {
                    headers: {
                        'Authorization': `token ${this.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    currentProjects = JSON.parse(decodeURIComponent(escape(atob(data.content))));
                }
            } catch (error) {
                console.log('Creating new projects.json');
            }
            
            const newProject = {
                id: timestamp.toString(),
                name: projectData.title,
                creatorName: projectData.creatorName,
                creatorEmail: projectData.creatorEmail,
                githubLink: projectData.githubLink,
                description: projectData.description,
                uploadDate: new Date().toISOString(),
                image: `https://raw.githubusercontent.com/${this.owner}/${this.repo}/main/${imagePath}`
            };

            currentProjects.projects.push(newProject);
            
            // Upload updated projects.json
            await this.uploadFile(
                projectsPath,
                JSON.stringify(currentProjects, null, 2),
                'Add new project'
            );

            return newProject;
        } catch (error) {
            console.error('Error uploading project:', error);
            throw error;
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}