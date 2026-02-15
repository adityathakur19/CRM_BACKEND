import { useEffect, useState } from 'react';
import { 
  Shield, Plus, Edit, Trash2, Save, ChevronDown, ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { rolesApi } from '@/services/api';
import { toast } from 'sonner';
import type { Role, Permission } from '@/types';

const RESOURCES = [
  { id: 'dashboard', name: 'Dashboard', description: 'View dashboard and statistics' },
  { id: 'leads', name: 'Leads', description: 'Manage leads and contacts' },
  { id: 'contacts', name: 'Contacts', description: 'Manage contact information' },
  { id: 'deals', name: 'Deals', description: 'Manage sales deals' },
  { id: 'tasks', name: 'Tasks', description: 'Create and assign tasks' },
  { id: 'calendar', name: 'Calendar', description: 'Schedule and view appointments' },
  { id: 'communications', name: 'Communications', description: 'Send messages and emails' },
  { id: 'templates', name: 'Templates', description: 'Manage message templates' },
  { id: 'reports', name: 'Reports', description: 'View analytics and reports' },
  { id: 'analytics', name: 'Analytics', description: 'View business analytics' },
  { id: 'invoices', name: 'Invoices', description: 'Create and manage invoices' },
  { id: 'payments', name: 'Payments', description: 'Process and track payments' },
  { id: 'users', name: 'Users', description: 'Manage team members' },
  { id: 'roles', name: 'Roles', description: 'Manage user roles' },
  { id: 'settings', name: 'Settings', description: 'Configure business settings' },
  { id: 'integrations', name: 'Integrations', description: 'Manage third-party integrations' },
  { id: 'business', name: 'Business', description: 'Manage business information' },
];

const ACTIONS = ['create', 'read', 'update', 'delete', 'manage'] as const;

export function UserPermissions() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [expandedRoles, setExpandedRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as Permission[],
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const response = await rolesApi.getRoles();
      setRoles(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load roles');
      console.error('Fetch roles error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRole.name) {
      toast.error('Role name is required');
      return;
    }

    if (newRole.name.length < 2) {
      toast.error('Role name must be at least 2 characters');
      return;
    }

    try {
      await rolesApi.createRole(newRole);
      setShowCreateDialog(false);
      setNewRole({ name: '', description: '', permissions: [] });
      fetchRoles();
      toast.success('Role created successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create role');
      console.error('Create role error:', error);
    }
  };

  const handleUpdateRole = async (role: Role) => {
    if (!role) return;

    try {
      await rolesApi.updateRole(role._id, role);
      setEditingRole(null);
      fetchRoles();
      toast.success('Role updated successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update role');
      console.error('Update role error:', error);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role? Users with this role will need to be reassigned.')) return;
    try {
      await rolesApi.deleteRole(roleId);
      fetchRoles();
      toast.success('Role deleted');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete role');
      console.error('Delete role error:', error);
    }
  };

  const togglePermission = (role: Role, resource: string, action: string) => {
    const permissions = [...role.permissions];
    const existingIndex = permissions.findIndex(p => p.resource === resource);

    if (existingIndex >= 0) {
      const actions = permissions[existingIndex].actions;
      if (actions.includes(action as any)) {
        permissions[existingIndex].actions = actions.filter(a => a !== action);
        if (permissions[existingIndex].actions.length === 0) {
          permissions.splice(existingIndex, 1);
        }
      } else {
        permissions[existingIndex].actions.push(action as any);
      }
    } else {
      permissions.push({ resource, actions: [action as any] });
    }

    return { ...role, permissions };
  };

  const toggleNewRolePermission = (resource: string, action: string) => {
    const permissions = [...newRole.permissions];
    const existingIndex = permissions.findIndex(p => p.resource === resource);

    if (existingIndex >= 0) {
      const actions = permissions[existingIndex].actions;
      if (actions.includes(action as any)) {
        permissions[existingIndex].actions = actions.filter(a => a !== action);
        if (permissions[existingIndex].actions.length === 0) {
          permissions.splice(existingIndex, 1);
        }
      } else {
        permissions[existingIndex].actions.push(action as any);
      }
    } else {
      permissions.push({ resource, actions: [action as any] });
    }

    setNewRole({ ...newRole, permissions });
  };

  const hasPermission = (role: Role, resource: string, action: string) => {
    const permission = role.permissions.find(p => p.resource === resource);
    return permission?.actions.includes(action as any) || false;
  };

  const hasNewRolePermission = (resource: string, action: string) => {
    const permission = newRole.permissions.find(p => p.resource === resource);
    return permission?.actions.includes(action as any) || false;
  };

  const toggleExpand = (roleId: string) => {
    setExpandedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const getPermissionSummary = (role: Role) => {
    const totalPermissions = role.permissions.reduce((acc, p) => acc + p.actions.length, 0);
    return `${totalPermissions} permission${totalPermissions !== 1 ? 's' : ''}`;
  };

  const isSystemRole = (roleName: string) => {
    return ['Owner', 'Manager', 'Agent', 'Staff'].includes(roleName);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Permissions</h1>
          <p className="text-gray-500 mt-1">Manage roles and access control</p>
        </div>
        <Button 
          onClick={() => {
            console.log('Create Role button clicked');
            setShowCreateDialog(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">System Roles</p>
              <p className="text-sm text-blue-700 mt-1">
                The system comes with default roles: <strong>Owner</strong> (full access), 
                <strong> Manager</strong> (team and lead management), <strong>Agent</strong> (leads and communications), 
                and <strong>Staff</strong> (limited access). 
                Create custom roles with specific permissions below.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {roles.map((role) => {
          const isExpanded = expandedRoles.includes(role._id);
          
          return (
            <Card key={role._id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        {isSystemRole(role.name) && (
                          <Badge variant="secondary" className="text-xs">System</Badge>
                        )}
                      </div>
                      <CardDescription>{role.description || getPermissionSummary(role)}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{getPermissionSummary(role)}</Badge>
                    {!isSystemRole(role.name) && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setEditingRole(role)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteRole(role._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => toggleExpand(role._id)}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Hide
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Show
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {isExpanded && (
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-3 font-medium min-w-[200px]">Resource</th>
                            <th className="text-center p-3 font-medium">Create</th>
                            <th className="text-center p-3 font-medium">Read</th>
                            <th className="text-center p-3 font-medium">Update</th>
                            <th className="text-center p-3 font-medium">Delete</th>
                            <th className="text-center p-3 font-medium">Manage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {RESOURCES.map((resource) => (
                            <tr key={resource.id} className="border-t">
                              <td className="p-3">
                                <p className="font-medium">{resource.name}</p>
                                <p className="text-sm text-gray-500">{resource.description}</p>
                              </td>
                              {ACTIONS.map((action) => (
                                <td key={action} className="text-center p-3">
                                  <div className="flex justify-center">
                                    <Checkbox 
                                      checked={hasPermission(role, resource.id, action)}
                                      disabled={isSystemRole(role.name)}
                                      onCheckedChange={() => {
                                        if (!isSystemRole(role.name)) {
                                          const updatedRole = togglePermission(role, resource.id, action);
                                          setRoles(roles.map(r => r._id === role._id ? updatedRole : r));
                                        }
                                      }}
                                    />
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {!isSystemRole(role.name) && (
                    <div className="flex justify-end mt-4">
                      <Button onClick={() => handleUpdateRole(role)}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
        {roles.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No roles created yet</p>
              <Button 
                className="mt-4" 
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Role
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Role Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role Name *</Label>
                <Input 
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="e.g., Sales Supervisor"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Brief description of this role"
                />
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Permissions</h3>
              <p className="text-sm text-gray-500 mb-4">
                Select which resources this role can access and what actions they can perform.
              </p>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-medium min-w-[200px]">Resource</th>
                        <th className="text-center p-3 font-medium">Create</th>
                        <th className="text-center p-3 font-medium">Read</th>
                        <th className="text-center p-3 font-medium">Update</th>
                        <th className="text-center p-3 font-medium">Delete</th>
                        <th className="text-center p-3 font-medium">Manage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RESOURCES.map((resource) => (
                        <tr key={resource.id} className="border-t">
                          <td className="p-3">
                            <p className="font-medium">{resource.name}</p>
                            <p className="text-sm text-gray-500">{resource.description}</p>
                          </td>
                          {ACTIONS.map((action) => (
                            <td key={action} className="text-center p-3">
                              <div className="flex justify-center">
                                <Checkbox 
                                  checked={hasNewRolePermission(resource.id, action)}
                                  onCheckedChange={() => toggleNewRolePermission(resource.id, action)}
                                />
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewRole({ name: '', description: '', permissions: [] });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateRole}>
                <Plus className="mr-2 h-4 w-4" />
                Create Role
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingRole} onOpenChange={() => setEditingRole(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role - {editingRole?.name}</DialogTitle>
          </DialogHeader>
          {editingRole && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role Name</Label>
                  <Input 
                    value={editingRole.name}
                    onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input 
                    value={editingRole.description || ''}
                    onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 font-medium min-w-[200px]">Resource</th>
                        <th className="text-center p-3 font-medium">Create</th>
                        <th className="text-center p-3 font-medium">Read</th>
                        <th className="text-center p-3 font-medium">Update</th>
                        <th className="text-center p-3 font-medium">Delete</th>
                        <th className="text-center p-3 font-medium">Manage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RESOURCES.map((resource) => (
                        <tr key={resource.id} className="border-t">
                          <td className="p-3">
                            <p className="font-medium">{resource.name}</p>
                            <p className="text-sm text-gray-500">{resource.description}</p>
                          </td>
                          {ACTIONS.map((action) => (
                            <td key={action} className="text-center p-3">
                              <div className="flex justify-center">
                                <Checkbox 
                                  checked={hasPermission(editingRole, resource.id, action)}
                                  onCheckedChange={() => {
                                    setEditingRole(togglePermission(editingRole, resource.id, action));
                                  }}
                                />
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setEditingRole(null)}
                >
                  Cancel
                </Button>
                <Button onClick={() => handleUpdateRole(editingRole)}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}