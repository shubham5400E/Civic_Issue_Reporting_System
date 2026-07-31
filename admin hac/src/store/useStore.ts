import { create } from 'zustand';

export type Priority = 'low' | 'medium' | 'high';
export type Status = 'pending' | 'in-process' | 'completed';
export type Category = 'road' | 'water' | 'electricity' | 'sanitation' | 'lighting' | 'traffic';
export type UserRole = 'admin' | 'employee';

export interface Reporter {
  name: string;
  email: string;
  phone?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  location: string;
  reporter: Reporter;
  images: string[];
  createdAt: string;
  updatedAt: string;
  proofImages?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Employee {
  id: string;
  name: string;
  department: 'roads' | 'sanitation' | 'water' | 'electricity';
  employeeId: string;
  password: string;
  isActive: boolean;
  assignedIssues: string[];
  completedIssues: string[];
  createdAt: string;
}

interface AppState {
  currentUser: User | null;
  issues: Issue[];
  filteredIssues: Issue[];
  employees: Employee[];
  isAuthenticated: boolean;
  
  // Auth actions
  authenticate: (email: string, password: string) => boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  
  // Issue actions
  updateIssueStatus: (id: string, status: Status, proofImages?: string[]) => void;
  deleteIssue: (id: string) => void;
  addProofImages: (issueId: string, images: string[]) => void;
  
  // Employee actions
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt' | 'assignedIssues' | 'completedIssues'>) => void;
  getEmployeeStats: (employeeId: string) => { pending: number; inProcess: number; completed: number; };
  
  // Filter actions
  filterIssues: (category?: Category, priority?: Priority, search?: string) => void;
  resetFilters: () => void;
}

// Mock data
const MOCK_ISSUES: Issue[] = [
  {
    id: "I001",
    title: "Broken Street Light on Oak Avenue",
    description: "Street light has been out for 3 weeks, creating safety concerns for pedestrians during evening hours.",
    category: "lighting",
    priority: "high",
    status: "pending",
    location: "Oak Avenue & 5th Street",
    reporter: {
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "555-0123"
    },
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      "https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5?w=400"
    ],
    createdAt: "2024-01-15T08:30:00Z",
    updatedAt: "2024-01-15T08:30:00Z"
  },
  {
    id: "I002",
    title: "Water Main Leak on Pine Street",
    description: "Large water leak causing flooding on the sidewalk and potential damage to nearby properties.",
    category: "water",
    priority: "high",
    status: "in-process",
    location: "Pine Street between 2nd & 3rd Ave",
    reporter: {
      name: "Michael Chen",
      email: "michael.chen@email.com"
    },
    images: [
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400",
      "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400",
      "https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?w=400"
    ],
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-16T10:15:00Z"
  },
  {
    id: "I003",
    title: "Pothole on Main Street",
    description: "Deep pothole causing vehicle damage and creating hazardous driving conditions.",
    category: "road",
    priority: "medium",
    status: "completed",
    location: "Main Street near City Hall",
    reporter: {
      name: "Jennifer Williams",
      email: "j.williams@email.com"
    },
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
    ],
    createdAt: "2024-01-10T09:45:00Z",
    updatedAt: "2024-01-18T16:30:00Z",
    proofImages: [
      "https://images.unsplash.com/photo-1581092795442-8c9fa0b05c4e?w=400"
    ]
  },
  {
    id: "I004",
    title: "Overflowing Trash Bins in Central Park",
    description: "Multiple trash bins overflowing, attracting pests and creating unsanitary conditions.",
    category: "sanitation",
    priority: "medium",
    status: "pending",
    location: "Central Park - Main Entrance",
    reporter: {
      name: "David Rodriguez",
      email: "david.rodriguez@email.com"
    },
    images: [
      "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=400",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
    ],
    createdAt: "2024-01-16T11:00:00Z",
    updatedAt: "2024-01-16T11:00:00Z"
  },
  {
    id: "I005",
    title: "Power Outage in Residential Area",
    description: "Power outage affecting 20+ households for over 6 hours.",
    category: "electricity",
    priority: "high",
    status: "in-process",
    location: "Elm Street Residential District",
    reporter: {
      name: "Lisa Anderson",
      email: "lisa.anderson@email.com"
    },
    images: [
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400"
    ],
    createdAt: "2024-01-17T07:15:00Z",
    updatedAt: "2024-01-17T12:45:00Z"
  },
  {
    id: "I006",
    title: "Broken Traffic Signal",
    description: "Traffic light stuck on red, causing major intersection delays during rush hour.",
    category: "traffic",
    priority: "high",
    status: "pending",
    location: "Broadway & 1st Avenue",
    reporter: {
      name: "Robert Kim",
      email: "robert.kim@email.com"
    },
    images: [
      "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=400",
      "https://images.unsplash.com/photo-1594736797933-d0ac1d0d6b12?w=400"
    ],
    createdAt: "2024-01-17T08:30:00Z",
    updatedAt: "2024-01-17T08:30:00Z"
  },
  {
    id: "I007",
    title: "Sidewalk Crack Creating Trip Hazard",
    description: "Large crack in sidewalk near school creating safety hazard for children and elderly.",
    category: "road",
    priority: "medium",
    status: "pending",
    location: "School Street by Elementary School",
    reporter: {
      name: "Amanda Thompson",
      email: "amanda.thompson@email.com"
    },
    images: [
      "https://images.unsplash.com/photo-1554034483-04fda0d3507b?w=400"
    ],
    createdAt: "2024-01-12T13:20:00Z",
    updatedAt: "2024-01-12T13:20:00Z"
  },
  {
    id: "I008",
    title: "Sewer Backup in Commercial District",
    description: "Sewer backup causing unpleasant odors and potential health hazards for businesses.",
    category: "sanitation",
    priority: "high",
    status: "in-process",
    location: "Commerce Street Business District",
    reporter: {
      name: "James Wilson",
      email: "james.wilson@email.com"
    },
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400"
    ],
    createdAt: "2024-01-13T16:45:00Z",
    updatedAt: "2024-01-15T09:30:00Z"
  },
  {
    id: "I009",
    title: "Damaged Park Bench",
    description: "Park bench broken and potentially dangerous, needs replacement or repair.",
    category: "sanitation",
    priority: "low",
    status: "completed",
    location: "Riverside Park - East Side",
    reporter: {
      name: "Maria Garcia",
      email: "maria.garcia@email.com"
    },
    images: [
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400"
    ],
    createdAt: "2024-01-08T10:15:00Z",
    updatedAt: "2024-01-14T14:20:00Z",
    proofImages: [
      "https://images.unsplash.com/photo-1581092795442-8c9fa0b05c4e?w=400"
    ]
  },
  {
    id: "I010",
    title: "Electrical Box Sparking",
    description: "Electrical utility box showing sparks and making unusual sounds - safety concern.",
    category: "electricity",
    priority: "high",
    status: "pending",
    location: "Industrial Avenue & 7th Street",
    reporter: {
      name: "Kevin Park",
      email: "kevin.park@email.com"
    },
    images: [
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400"
    ],
    createdAt: "2024-01-18T09:00:00Z",
    updatedAt: "2024-01-18T09:00:00Z"
  },
  {
    id: "I011",
    title: "Missing Street Sign",
    description: "Stop sign missing at busy intersection, creating safety hazard for drivers and pedestrians.",
    category: "traffic",
    priority: "high",
    status: "in-process",
    location: "Maple Ave & Oak Street",
    reporter: {
      name: "Nancy Davis",
      email: "nancy.davis@email.com"
    },
    images: [
      "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=400"
    ],
    createdAt: "2024-01-16T15:30:00Z",
    updatedAt: "2024-01-17T11:45:00Z"
  },
  {
    id: "I012",
    title: "Broken Water Fountain",
    description: "Public water fountain not working, depriving park visitors of fresh water access.",
    category: "water",
    priority: "low",
    status: "pending",
    location: "Memorial Park - Center Plaza",
    reporter: {
      name: "Steven Lee",
      email: "steven.lee@email.com"
    },
    images: [
      "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400"
    ],
    createdAt: "2024-01-11T12:00:00Z",
    updatedAt: "2024-01-11T12:00:00Z"
  },
  {
    id: "I013",
    title: "Graffiti on Public Building",
    description: "Extensive graffiti on city library exterior wall, affecting community aesthetics.",
    category: "sanitation",
    priority: "low",
    status: "completed",
    location: "Public Library - North Wall",
    reporter: {
      name: "Rachel Green",
      email: "rachel.green@email.com"
    },
    images: [
      "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=400"
    ],
    createdAt: "2024-01-09T14:30:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    proofImages: [
      "https://images.unsplash.com/photo-1581092795442-8c9fa0b05c4e?w=400"
    ]
  },
  {
    id: "I014",
    title: "Flooding Due to Blocked Storm Drain",
    description: "Storm drain clogged with debris causing street flooding during rain.",
    category: "water",
    priority: "medium",
    status: "in-process",
    location: "Harbor Street & Pier Avenue",
    reporter: {
      name: "Thomas Brown",
      email: "thomas.brown@email.com"
    },
    images: [
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400",
      "https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?w=400"
    ],
    createdAt: "2024-01-14T18:45:00Z",
    updatedAt: "2024-01-16T08:20:00Z"
  },
  {
    id: "I015",
    title: "Damaged Road Markings",
    description: "Faded and damaged lane markings creating confusion for drivers.",
    category: "road",
    priority: "medium",
    status: "pending",
    location: "Highway 101 - Mile Marker 15",
    reporter: {
      name: "Catherine White",
      email: "catherine.white@email.com"
    },
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
    ],
    createdAt: "2024-01-13T11:15:00Z",
    updatedAt: "2024-01-13T11:15:00Z"
  },
  {
    id: "I016",
    title: "Faulty Street Light Timer",
    description: "Street lights turning on/off at incorrect times, staying on during day.",
    category: "lighting",
    priority: "low",
    status: "completed",
    location: "Sunset Boulevard",
    reporter: {
      name: "Daniel Miller",
      email: "daniel.miller@email.com"
    },
    images: [
      "https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5?w=400"
    ],
    createdAt: "2024-01-07T20:30:00Z",
    updatedAt: "2024-01-12T09:45:00Z",
    proofImages: [
      "https://images.unsplash.com/photo-1581092795442-8c9fa0b05c4e?w=400"
    ]
  },
  {
    id: "I017",
    title: "Loose Manhole Cover",
    description: "Manhole cover loose and making loud noises when vehicles pass over.",
    category: "road",
    priority: "medium",
    status: "pending",
    location: "Center Street & 4th Avenue",
    reporter: {
      name: "Patricia Taylor",
      email: "patricia.taylor@email.com"
    },
    images: [
      "https://images.unsplash.com/photo-1554034483-04fda0d3507b?w=400"
    ],
    createdAt: "2024-01-15T07:45:00Z",
    updatedAt: "2024-01-15T07:45:00Z"
  },
  {
    id: "I018",
    title: "Burnt Out Traffic Light Bulb",
    description: "One bulb in traffic light not working, reducing visibility for drivers.",
    category: "traffic",
    priority: "medium",
    status: "in-process",
    location: "Union Street & Park Avenue",
    reporter: {
      name: "Christopher Moore",
      email: "christopher.moore@email.com"
    },
    images: [
      "https://images.unsplash.com/photo-1594736797933-d0ac1d0d6b12?w=400"
    ],
    createdAt: "2024-01-16T19:20:00Z",
    updatedAt: "2024-01-17T14:15:00Z"
  },
  {
    id: "I019",
    title: "Clogged Public Restroom",
    description: "Public restroom in park out of order, affecting park visitors.",
    category: "sanitation",
    priority: "medium",
    status: "pending",
    location: "Westside Park - Restroom Facility",
    reporter: {
      name: "Barbara Jones",
      email: "barbara.jones@email.com"
    },
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
    ],
    createdAt: "2024-01-17T13:10:00Z",
    updatedAt: "2024-01-17T13:10:00Z"
  },
  {
    id: "I020",
    title: "Damaged Streetlight Pole",
    description: "Streetlight pole damaged by vehicle, leaning dangerously and may fall.",
    category: "lighting",
    priority: "high",
    status: "pending",
    location: "Victory Road & Spring Street",
    reporter: {
      name: "William Clark",
      email: "william.clark@email.com"
    },
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
      "https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5?w=400"
    ],
    createdAt: "2024-01-18T06:30:00Z",
    updatedAt: "2024-01-18T06:30:00Z"
  }
];

// Mock employees data
const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'emp_001',
    name: 'Jane Smith',
    department: 'roads',
    employeeId: 'EMP001',
    password: 'password123',
    isActive: true,
    assignedIssues: ['I001', 'I003', 'I007'],
    completedIssues: ['I003'],
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'emp_002',
    name: 'Mike Johnson',
    department: 'water',
    employeeId: 'EMP002',
    password: 'password123',
    isActive: true,
    assignedIssues: ['I002', 'I014'],
    completedIssues: [],
    createdAt: '2024-01-01T00:00:00Z'
  },
];

export const useStore = create<AppState>((set, get) => ({
  currentUser: null,
  issues: MOCK_ISSUES,
  filteredIssues: MOCK_ISSUES,
  employees: MOCK_EMPLOYEES,
  isAuthenticated: false,

  authenticate: (email: string, password: string) => {
    // Mock authentication - accept any email/password
    set({ isAuthenticated: true });
    return true;
  },

  login: (role: UserRole) => {
    const mockUser: User = {
      id: role === 'admin' ? 'admin_001' : 'emp_001',
      name: role === 'admin' ? 'John Admin' : 'Jane Employee',
      email: role === 'admin' ? 'admin@city.gov' : 'employee@city.gov',
      role
    };
    set({ currentUser: mockUser });
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false });
  },

  updateIssueStatus: (id: string, status: Status, proofImages?: string[]) => {
    const { issues } = get();
    const updatedIssues = issues.map(issue => 
      issue.id === id 
        ? { 
            ...issue, 
            status, 
            updatedAt: new Date().toISOString(),
            ...(proofImages && { proofImages })
          }
        : issue
    );
    set({ 
      issues: updatedIssues,
      filteredIssues: updatedIssues 
    });
  },

  deleteIssue: (id: string) => {
    const { issues } = get();
    const updatedIssues = issues.filter(issue => issue.id !== id);
    set({ 
      issues: updatedIssues,
      filteredIssues: updatedIssues 
    });
  },

  addProofImages: (issueId: string, images: string[]) => {
    const { issues } = get();
    const updatedIssues = issues.map(issue =>
      issue.id === issueId
        ? { ...issue, proofImages: [...(issue.proofImages || []), ...images] }
        : issue
    );
    set({
      issues: updatedIssues,
      filteredIssues: updatedIssues
    });
  },

  addEmployee: (employeeData) => {
    const { employees } = get();
    const newEmployee: Employee = {
      ...employeeData,
      id: `emp_${Date.now()}`,
      createdAt: new Date().toISOString(),
      assignedIssues: [],
      completedIssues: [],
      isActive: true
    };
    set({ employees: [...employees, newEmployee] });
  },

  getEmployeeStats: (employeeId: string) => {
    const { employees, issues } = get();
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return { pending: 0, inProcess: 0, completed: 0 };

    const assignedIssues = issues.filter(issue => employee.assignedIssues.includes(issue.id));
    return {
      pending: assignedIssues.filter(issue => issue.status === 'pending').length,
      inProcess: assignedIssues.filter(issue => issue.status === 'in-process').length,
      completed: assignedIssues.filter(issue => issue.status === 'completed').length,
    };
  },

  filterIssues: (category?: Category | 'all', priority?: Priority | 'all', search?: string) => {
    const { issues } = get();
    let filtered = [...issues];

    if (category && category !== 'all') {
      filtered = filtered.filter(issue => issue.category === category);
    }

    if (priority && priority !== 'all') {
      filtered = filtered.filter(issue => issue.priority === priority);
    }

    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(issue => 
        issue.id.toLowerCase().includes(searchLower) ||
        issue.title.toLowerCase().includes(searchLower) ||
        issue.description.toLowerCase().includes(searchLower) ||
        issue.location.toLowerCase().includes(searchLower)
      );
    }

    set({ filteredIssues: filtered });
  },

  resetFilters: () => {
    const { issues } = get();
    set({ filteredIssues: issues });
  }
}));