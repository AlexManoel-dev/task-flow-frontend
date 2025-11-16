export interface User {
  id?: string
  fullName: string
  email: string
  password: string
  position: "admin" | "user"
  avatarUrl?: string
}

export interface Project {
  id: string
  name: string
  description: string
  category: string
  progress: number
  status: "active" | "completed" | "on-hold"
  ownerId: string
  memberIds: string[]
  createdAt: string
  dueDate?: string
}

export interface Task {
  id: string
  title: string
  description: string
  projectId: string
  assigneeId?: string
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  createdAt: string
  dueDate?: string
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: "1",
    fullName: "Admin User",
    email: "admin@taskflow.com",
    password: "admin123",
    position: "admin",
    avatarUrl: "/admin-avatar.png",
  },
  {
    id: "2",
    fullName: "João Silva",
    email: "joao@taskflow.com",
    password: "user123",
    position: "user",
    avatarUrl: "/male-avatar.png",
  },
  {
    id: "3",
    fullName: "Maria Santos",
    email: "maria@taskflow.com",
    password: "user123",
    position: "user",
    avatarUrl: "/diverse-female-avatar.png",
  },
  {
    id: "4",
    fullName: "Pedro Costa",
    email: "pedro@taskflow.com",
    password: "user123",
    position: "user",
    avatarUrl: "/male-avatar-2.png",
  },
]

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Complete redesign of company website with modern UI/UX",
    category: "Design",
    progress: 65,
    status: "active",
    ownerId: "2",
    memberIds: ["2", "3"],
    createdAt: "2025-01-15",
    dueDate: "2025-03-01",
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "Native mobile app for iOS and Android",
    category: "Development",
    progress: 40,
    status: "active",
    ownerId: "3",
    memberIds: ["3", "4"],
    createdAt: "2025-01-20",
    dueDate: "2025-04-15",
  },
  {
    id: "3",
    name: "Marketing Campaign",
    description: "Q1 2025 marketing campaign planning and execution",
    category: "Marketing",
    progress: 85,
    status: "active",
    ownerId: "2",
    memberIds: ["2", "3", "4"],
    createdAt: "2025-01-10",
    dueDate: "2025-02-28",
  },
  {
    id: "4",
    name: "Database Migration",
    description: "Migrate legacy database to new infrastructure",
    category: "Development",
    progress: 100,
    status: "completed",
    ownerId: "4",
    memberIds: ["4"],
    createdAt: "2024-12-01",
    dueDate: "2025-01-15",
  },
]

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Design homepage mockup",
    description: "Create high-fidelity mockup for new homepage",
    projectId: "1",
    assigneeId: "3",
    status: "completed",
    priority: "high",
    createdAt: "2025-01-15",
    dueDate: "2025-01-25",
  },
  {
    id: "2",
    title: "Implement responsive navigation",
    description: "Build mobile-responsive navigation component",
    projectId: "1",
    assigneeId: "2",
    status: "in-progress",
    priority: "high",
    createdAt: "2025-01-20",
    dueDate: "2025-02-05",
  },
  {
    id: "3",
    title: "Setup development environment",
    description: "Configure React Native development environment",
    projectId: "2",
    assigneeId: "4",
    status: "completed",
    priority: "high",
    createdAt: "2025-01-20",
    dueDate: "2025-01-25",
  },
  {
    id: "4",
    title: "Design app screens",
    description: "Create UI designs for all app screens",
    projectId: "2",
    assigneeId: "3",
    status: "in-progress",
    priority: "medium",
    createdAt: "2025-01-22",
    dueDate: "2025-02-10",
  },
  {
    id: "5",
    title: "Create social media content",
    description: "Design and schedule social media posts",
    projectId: "3",
    assigneeId: "2",
    status: "in-progress",
    priority: "medium",
    createdAt: "2025-01-10",
    dueDate: "2025-02-15",
  },
  {
    id: "6",
    title: "Launch email campaign",
    description: "Send out Q1 promotional emails",
    projectId: "3",
    assigneeId: "3",
    status: "todo",
    priority: "high",
    createdAt: "2025-01-15",
    dueDate: "2025-02-20",
  },
]

export const categories = ["Development", "Design", "Marketing", "Sales", "Support", "Operations", "Research"]
