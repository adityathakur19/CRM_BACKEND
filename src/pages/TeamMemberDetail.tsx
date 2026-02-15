import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Mail, Phone, Shield, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { teamApi, rolesApi } from '@/services/api';
import { toast } from 'sonner';
import type { User, Role } from '@/types';

export function TeamMemberDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [member, setMember] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    roleId: '',
    status: 'active',
  });

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [memberRes, rolesRes] = await Promise.all([
        teamApi.getMember(id!),
        rolesApi.getRoles(),
      ]);
      
      const memberData = memberRes.data.data;
      setMember(memberData);
      setRoles(rolesRes.data.data || []);
      
      // Populate form
      setFormData({
        firstName: memberData.firstName,
        lastName: memberData.lastName,
        email: memberData.email,
        phone: memberData.phone || '',
        roleId: memberData.roleId._id || memberData.roleId,
        status: memberData.status,
      });
    } catch (error) {
      toast.error('Failed to load team member');
      navigate('/team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await teamApi.updateMember(id!, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        roleId: formData.roleId,
        status: formData.status,
      });
      
      toast.success('Team member updated successfully');
      setIsEditing(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to update team member');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      suspended: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
    };
    return <Badge className={variants[status] || ''}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Team member not found</p>
          <Button onClick={() => navigate('/team')}>Back to Team</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/team')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Team Member Details</h1>
            <p className="text-gray-500 mt-1">View and manage team member information</p>
          </div>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => {
                setIsEditing(false);
                // Reset form to original values
                setFormData({
                  firstName: member.firstName,
                  lastName: member.lastName,
                  email: member.email,
                  phone: member.phone || '',
                  roleId: member.roleId._id || member.roleId,
                  status: member.status,
                });
              }}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Edit Member
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                  {member.firstName[0]}{member.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold">{member.firstName} {member.lastName}</h2>
              <p className="text-gray-500 mb-4">{member.email}</p>
              {getStatusBadge(member.status)}
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-gray-500">Role</p>
                  <p className="font-medium">
                    {typeof member.roleId === 'object' ? member.roleId.name : 'N/A'}
                  </p>
                </div>
              </div>
              
              {member.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium">{member.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-gray-500">Joined</p>
                  <p className="font-medium">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {member.lastLoginAt && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Last Login</p>
                    <p className="font-medium">
                      {new Date(member.lastLoginAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Member Information</CardTitle>
            <CardDescription>
              {isEditing ? 'Edit member details' : 'View member details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  {isEditing ? (
                    <Input 
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium p-2 bg-gray-50 rounded">{member.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  {isEditing ? (
                    <Input 
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-medium p-2 bg-gray-50 rounded">{member.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-medium">{member.email}</p>
                </div>
                <p className="text-xs text-gray-500">Email cannot be changed here</p>
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                {isEditing ? (
                  <Input 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 234 567 890"
                  />
                ) : (
                  <p className="text-sm font-medium p-2 bg-gray-50 rounded">
                    {member.phone || 'Not provided'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                {isEditing ? (
                  <Select value={formData.roleId} onValueChange={(value) => setFormData({ ...formData, roleId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role._id} value={role._id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-medium p-2 bg-gray-50 rounded">
                    {typeof member.roleId === 'object' ? member.roleId.name : 'N/A'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                {isEditing ? (
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2 bg-gray-50 rounded">
                    {getStatusBadge(member.status)}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Email Verified</p>
              <p className="font-medium">{member.isEmailVerified ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone Verified</p>
              <p className="font-medium">{member.isPhoneVerified ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">2FA Enabled</p>
              <p className="font-medium">{member.twoFactorEnabled ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Login Attempts</p>
              <p className="font-medium">{member.loginAttempts}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}