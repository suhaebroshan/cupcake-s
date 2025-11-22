
import { Project, User } from '../types';

// Simulates a real database delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockDatabase {
  private getStorage<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setStorage<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  async getUser(email: string): Promise<User | null> {
    await delay(300);
    const users = this.getStorage<User>('cupcake_users');
    return users.find(u => u.email === email) || null;
  }

  async createUser(user: User): Promise<User> {
    await delay(300);
    const users = this.getStorage<User>('cupcake_users');
    users.push(user);
    this.setStorage('cupcake_users', users);
    return user;
  }

  async updateUser(user: User): Promise<User> {
     await delay(200);
     const users = this.getStorage<User>('cupcake_users');
     const index = users.findIndex(u => u.id === user.id);
     if (index !== -1) {
         users[index] = user;
         this.setStorage('cupcake_users', users);
     }
     return user;
  }

  async getProjects(userId: string): Promise<Project[]> {
    await delay(300); // Simulate network
    const projects = this.getStorage<Project>('cupcake_projects');
    // In a real DB we filter by User ID, for this mock we just return all stored in local
    return projects.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
  }

  async getProjectById(id: string): Promise<Project | null> {
      await delay(100);
      const projects = this.getStorage<Project>('cupcake_projects');
      return projects.find(p => p.id === id) || null;
  }

  async createProject(project: Project): Promise<Project> {
    await delay(400);
    const projects = this.getStorage<Project>('cupcake_projects');
    projects.unshift(project);
    this.setStorage('cupcake_projects', projects);
    return project;
  }

  async updateProject(project: Project): Promise<Project> {
    // Faster delay for updates to feel snappy
    const projects = this.getStorage<Project>('cupcake_projects');
    const index = projects.findIndex(p => p.id === project.id);
    if (index !== -1) {
      projects[index] = project;
      this.setStorage('cupcake_projects', projects);
    }
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await delay(300);
    let projects = this.getStorage<Project>('cupcake_projects');
    projects = projects.filter(p => p.id !== id);
    this.setStorage('cupcake_projects', projects);
  }
}

export const db = new MockDatabase();
