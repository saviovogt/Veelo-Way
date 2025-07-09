import { Zap } from 'lucide-react';
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="flex items-center space-x-2 mb-8">
        <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center">
          <Zap className="h-7 w-7 text-black" />
        </div>
        <div>
          <span className="text-2xl font-bold text-yellow-500">VeeloWay</span>
          <p className="text-sm text-gray-500">Gestão de Patinetes</p>
        </div>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;