class GitHubAPI {
    constructor(config) {
        this.config = config;
        this.baseUrl = 'https://api.github.com';
        this.installation_token = null;
    }

    async getInstallationToken() {
        try {
            const response = await fetch(`${this.baseUrl}/app/installations/${this.config.APP_ID}/access_tokens`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `Bearer ${this.config.CLIENT_ID}`
                }
            });
            const data = await response.json();
            return data.token;
        } catch (error) {
            console.error('Error getting installation token:', error);
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
            const currentProjects = await this.getFile(projectsPath);
            
            const newProject = {
                id: timestamp.toString(),
                name: projectData.title,
                creatorName: projectData.creatorName,
                creatorEmail: projectData.creatorEmail,
                githubLink: projectData.githubLink,
                description: projectData.description,
                uploadDate: new Date().toISOString(),
                image: `https://raw.githubusercontent.com/${this.config.OWNER}/${this.config.REPO_NAME}/main/${imagePath}`
            };

            const updatedProjects = {
                ...currentProjects,
                projects: [...currentProjects.projects, newProject]
            };

            await this.uploadFile(
                projectsPath,
                JSON.stringify(updatedProjects, null, 2),
                'Add new project'
            );

            return newProject;
        } catch (error) {
            console.error('Error uploading project:', error);
            throw error;
        }
    }

    async deleteProject(projectId) {
        try {
            // 1. Get current projects
            const projectsPath = 'events/2025-01-11/projects.json';
            const currentProjects = await this.getFile(projectsPath);
            
            // 2. Find project to delete
            const projectToDelete = currentProjects.projects.find(p => p.id === projectId);
            if (!projectToDelete) {
                throw new Error('Project not found');
            }

            // 3. Delete project image
            if (projectToDelete.image) {
                const imagePath = projectToDelete.image.split('/main/')[1];
                await this.deleteFile(imagePath, 'Delete project image');
            }

            // 4. Update projects.json
            const updatedProjects = {
                ...currentProjects,
                projects: currentProjects.projects.filter(p => p.id !== projectId)
            };

            await this.uploadFile(
                projectsPath,
                JSON.stringify(updatedProjects, null, 2),
                'Delete project'
            );

            return true;
        } catch (error) {
            console.error('Error deleting project:', error);
            throw error;
        }
    }

    async getFile(path) {
        const token = await this.getInstallationToken();
        const response = await fetch(`${this.baseUrl}/repos/${this.config.OWNER}/${this.config.REPO_NAME}/contents/${path}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        const data = await response.json();
        return JSON.parse(atob(data.content));
    }

    async uploadFile(path, content, message) {
        const token = await this.getInstallationToken();
        const response = await fetch(`${this.baseUrl}/repos/${this.config.OWNER}/${this.config.REPO_NAME}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                content: btoa(content)
            })
        });
        return await response.json();
    }

    async deleteFile(path, message) {
        const token = await this.getInstallationToken();
        const file = await this.getFile(path);
        
        await fetch(`${this.baseUrl}/repos/${this.config.OWNER}/${this.config.REPO_NAME}/contents/${path}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                sha: file.sha
            })
        });
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async uploadProject(projectData, imageFile) {
        try {
            console.log('Starting project upload...');
            
            // Log authentication attempt
            console.log('Getting installation token...');
            const token = await this.getInstallationToken();
            console.log('Token received:', token ? 'Yes' : 'No');
    
            // 1. Upload image
            console.log('Processing image...');
            const timestamp = new Date().getTime();
            const filename = `project_${timestamp}.png`;
            const imagePath = `events/2025-01-11/images/project-screenshots/${filename}`;
            
            // Convert image to base64
            console.log('Converting image to base64...');
            const imageBase64 = await this.fileToBase64(imageFile);
            
            // Upload image
            console.log('Uploading image...');
            const imageUploadResult = await this.uploadFile(imagePath, imageBase64, 'Upload project image');
            console.log('Image upload result:', imageUploadResult);
            
            // 2. Update projects.json
            console.log('Getting current projects.json...');
            const projectsPath = 'events/2025-01-11/projects.json';
            const currentProjects = await this.getFile(projectsPath);
            console.log('Current projects loaded:', currentProjects);
            
            const newProject = {
                id: timestamp.toString(),
                name: projectData.title,
                creatorName: projectData.creatorName,
                creatorEmail: projectData.creatorEmail,
                githubLink: projectData.githubLink,
                description: projectData.description,
                uploadDate: new Date().toISOString(),
                image: `https://raw.githubusercontent.com/${this.config.OWNER}/${this.config.REPO_NAME}/main/${imagePath}`
            };
    
            console.log('New project data:', newProject);
    
            const updatedProjects = {
                ...currentProjects,
                projects: [...(currentProjects.projects || []), newProject]
            };
    
            console.log('Updating projects.json...');
            const updateResult = await this.uploadFile(
                projectsPath,
                JSON.stringify(updatedProjects, null, 2),
                'Add new project'
            );
            console.log('Update result:', updateResult);
    
            return newProject;
        } catch (error) {
            console.error('Detailed upload error:', error);
            console.error('Error stack:', error.stack);
            throw error;
        }
    }
}

