export type RequirementStatus = 'New' | 'Pending' | 'In Review' | 'Approved' | 'Revised';

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  role: string;
}

export interface Component {
  id: string;
  name: string;
  parentId?: string;
  children?: Component[];
}

export interface Link {
  id: string;
  requirementId: string;
  targetType: string;
  targetId: string;
  linkType?: string;
}

export interface Requirement {
  id: string;
  title: string;
  description?: string;
  status: RequirementStatus;
  componentId?: string;
  component?: Component;
  ownerId?: string;
  owner?: User;
  tags?: Tag[];
  links?: Link[];
  createdAt: string;
  updatedAt: string;
  code?: string; // Unique identifier like UN-1, SR-1 etc.
}

export interface KanbanColumn {
  id: string;
  title: string;
  items: Requirement[];
}

export interface KanbanBoard {
  columns: KanbanColumn[];
}

// Mock data generator for testing
export const generateMockData = (): KanbanBoard => {
  // Mock users
  const users: User[] = [
    { id: 'user1', name: 'Alice Johnson', role: 'Requirements Manager', avatar: 'https://ui-avatars.com/api/?name=AJ&background=0D8ABC&color=fff' },
    { id: 'user2', name: 'Bob Smith', role: 'Design Engineer', avatar: 'https://ui-avatars.com/api/?name=BS&background=FFA500&color=fff' },
    { id: 'user3', name: 'Charlie Brown', role: 'Project Lead', avatar: 'https://ui-avatars.com/api/?name=CB&background=32CD32&color=fff' },
    { id: 'user4', name: 'Diana Lee', role: 'QA Specialist', avatar: 'https://ui-avatars.com/api/?name=DL&background=800080&color=fff' },
  ];

  // Mock components
  const components: Component[] = [
    { id: 'comp1', name: 'System Requirements', children: [] },
    { id: 'comp2', name: 'Battery', parentId: 'comp1', children: [
      { id: 'comp2-1', name: 'Alkaline', parentId: 'comp2', children: [] },
      { id: 'comp2-2', name: 'Coin Cell', parentId: 'comp2', children: [] },
    ]},
    { id: 'comp3', name: 'Electrode', parentId: 'comp1', children: [] },
    { id: 'comp4', name: 'Labeling', parentId: 'comp1', children: [] },
  ];

  // Mock tags
  const tags: Tag[] = [
    { id: 'tag1', name: 'Safety', color: 'red' },
    { id: 'tag2', name: 'Compliance', color: 'blue' },
    { id: 'tag3', name: 'Performance', color: 'green' },
    { id: 'tag4', name: 'User Experience', color: 'purple' },
  ];

  // Generate requirements with proper distribution across statuses
  const requirements: Requirement[] = [
    // User Needs column
    {
      id: 'req1',
      title: 'System shall conform to all standards required for sale in USA',
      description: 'Eget felis eget nunc lobortis mattis aliquam.',
      status: 'New',
      componentId: 'comp4',
      component: components.find(c => c.id === 'comp4'),
      ownerId: 'user1',
      owner: users.find(u => u.id === 'user1'),
      tags: [tags[1]], // Compliance
      links: [{ id: 'link1', requirementId: 'req1', targetType: 'test', targetId: 'test1', linkType: 'verification' }],
      createdAt: '2023-04-15T10:30:00Z',
      updatedAt: '2023-04-15T10:30:00Z',
      code: 'UN-1'
    },
    {
      id: 'req2',
      title: 'System shall conform to all standards required for sale in USA',
      description: 'Eget felis eget nunc lobortis mattis aliquam.',
      status: 'Revised',
      componentId: 'comp4',
      component: components.find(c => c.id === 'comp4'),
      ownerId: 'user1',
      owner: users.find(u => u.id === 'user1'),
      tags: [tags[1]], // Compliance
      links: [{ id: 'link2', requirementId: 'req2', targetType: 'test', targetId: 'test2', linkType: 'verification' }],
      createdAt: '2023-04-10T08:20:00Z',
      updatedAt: '2023-04-16T14:45:00Z',
      code: 'UN-1'
    },
    
    // Design Inputs column
    {
      id: 'req3',
      title: 'System shall conform to IEC 60601-1',
      description: 'Ultricies mi quis hendrerit dolor magna eget.',
      status: 'In Review',
      componentId: 'comp1',
      component: components.find(c => c.id === 'comp1'),
      ownerId: 'user2',
      owner: users.find(u => u.id === 'user2'),
      tags: [tags[1], tags[0]], // Compliance, Safety
      links: [{ id: 'link3', requirementId: 'req3', targetType: 'test', targetId: 'test3', linkType: 'verification' }],
      createdAt: '2023-04-12T09:15:00Z',
      updatedAt: '2023-04-18T11:20:00Z',
      code: 'SR-1'
    },
    {
      id: 'req4',
      title: 'System shall conform to UN 38.3',
      description: 'Tortor condimentum lacinia quis vel eros donec.',
      status: 'Approved',
      componentId: 'comp1',
      component: components.find(c => c.id === 'comp1'),
      ownerId: 'user2',
      owner: users.find(u => u.id === 'user2'),
      tags: [tags[1], tags[0]], // Compliance, Safety
      links: [{ id: 'link4', requirementId: 'req4', targetType: 'test', targetId: 'test4', linkType: 'verification' }],
      createdAt: '2023-04-08T14:30:00Z',
      updatedAt: '2023-04-19T15:40:00Z',
      code: 'SR-2'
    },
    {
      id: 'req5',
      title: 'System shall use an IEC 62133 Certified Battery',
      description: 'Lectus quam id leo in vitae turpis. Velit sed ullamcorper morbi tincidunt ornare massa eget.',
      status: 'In Review',
      componentId: 'comp2',
      component: components.find(c => c.id === 'comp2'),
      ownerId: 'user2',
      owner: users.find(u => u.id === 'user2'),
      tags: [tags[0]], // Safety
      links: [{ id: 'link5', requirementId: 'req5', targetType: 'test', targetId: 'test5', linkType: 'verification' }],
      createdAt: '2023-04-11T10:45:00Z',
      updatedAt: '2023-04-17T13:25:00Z',
      code: 'DN-1'
    },
    
    // Design Output column
    {
      id: 'req6',
      title: 'System shall have a Type BF part per IEC 60601',
      description: 'Tortor condimentum lacinia quis vel eros donec.',
      status: 'Approved',
      componentId: 'comp3',
      component: components.find(c => c.id === 'comp3'),
      ownerId: 'user2',
      owner: users.find(u => u.id === 'user2'),
      tags: [tags[0], tags[2]], // Safety, Performance
      links: [{ id: 'link6', requirementId: 'req6', targetType: 'test', targetId: 'test6', linkType: 'verification' }],
      createdAt: '2023-04-05T11:20:00Z',
      updatedAt: '2023-04-20T16:30:00Z',
      code: 'DO-1'
    },
    {
      id: 'req7',
      title: 'User shall be able to navigate with minimal training',
      description: 'System shall have proper functional UI controls and be intuitive (note: anticipated 1-2 min training time)',
      status: 'Pending',
      componentId: 'comp3',
      component: components.find(c => c.id === 'comp3'),
      ownerId: 'user3',
      owner: users.find(u => u.id === 'user3'),
      tags: [tags[3]], // User Experience
      links: [{ id: 'link7', requirementId: 'req7', targetType: 'test', targetId: 'test7', linkType: 'verification' }],
      createdAt: '2023-04-14T13:10:00Z',
      updatedAt: '2023-04-14T13:10:00Z',
      code: 'DO-2'
    },
    {
      id: 'req8',
      title: 'System shall have at least 1 hour of functional use when received by user (note: anticipated shelf-life is 1 year)',
      description: 'Lectus quam id leo in vitae turpis. Velit sed ullamcorper morbi tincidunt ornare massa eget.',
      status: 'Pending',
      componentId: 'comp2-2',
      component: components.find(c => c.id === 'comp2-2'),
      ownerId: 'user3',
      owner: users.find(u => u.id === 'user3'),
      tags: [tags[2]], // Performance
      links: [{ id: 'link8', requirementId: 'req8', targetType: 'test', targetId: 'test8', linkType: 'verification' }],
      createdAt: '2023-04-13T15:50:00Z',
      updatedAt: '2023-04-13T15:50:00Z',
      code: 'UN-2'
    },
    {
      id: 'req9',
      title: 'System shall have a use time of at least 1 hour after 365 days of standby',
      description: 'Eget felis eget nunc lobortis mattis aliquam.',
      status: 'In Review',
      componentId: 'comp2-2',
      component: components.find(c => c.id === 'comp2-2'),
      ownerId: 'user2',
      owner: users.find(u => u.id === 'user2'),
      tags: [tags[2]], // Performance
      links: [{ id: 'link9', requirementId: 'req9', targetType: 'test', targetId: 'test9', linkType: 'verification' }],
      createdAt: '2023-04-09T12:40:00Z',
      updatedAt: '2023-04-16T09:35:00Z',
      code: 'SR-3'
    },
  ];

  // Group requirements by status
  const userNeeds = requirements.filter(req => ['New', 'Revised'].includes(req.status));
  const designInputs = requirements.filter(req => ['In Review', 'Approved'].includes(req.status) && 
                                         ['SR-1', 'SR-2', 'SR-3'].includes(req.code || ''));
  const designOutputs = requirements.filter(req => ['Pending', 'Approved'].includes(req.status) && 
                                         ['DO-1', 'DO-2', 'UN-2', 'DN-1'].includes(req.code || ''));

  // Create columns
  const columns: KanbanColumn[] = [
    {
      id: 'user-needs',
      title: 'User Needs',
      items: userNeeds
    },
    {
      id: 'design-inputs',
      title: 'Design Inputs',
      items: designInputs
    },
    {
      id: 'design-outputs',
      title: 'Design Outputs',
      items: designOutputs
    }
  ];

  return { columns };
}; 