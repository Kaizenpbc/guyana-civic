import React from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const LogoutButton: React.FC = () => {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Clear all cached data
      queryClient.clear();
      
      // Redirect to login page
      setLocation('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if logout fails
      setLocation('/login');
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleLogout}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
};

export default LogoutButton;
