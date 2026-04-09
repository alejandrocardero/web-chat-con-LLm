import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/lib/authService';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function Login() {
  const navigate = useNavigate();
  const { checkAppState } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await authService.login(email, password);
      await checkAppState();
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] md:min-h-screen flex flex-col md:items-center justify-center bg-background px-4 py-6 overflow-y-auto">
      <div className="w-full max-w-md space-y-8 my-auto">
        {/* Logo & Title */}
        <div className="text-center space-y-3 md:space-y-4">
          <div className="mx-auto h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Bot className="h-7 w-7 md:h-8 md:w-8 text-primary" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Bienvenido de nuevo</h1>
          <p className="text-sm text-muted-foreground">Inicia sesión para continuar chateando</p>
        </div>

        {/* Login Form */}
        <div className="bg-card border border-border rounded-2xl p-4 md:p-6 space-y-4 md:space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="pl-10 bg-input border-border text-sm"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm text-foreground">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-input border-border text-sm"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-lg font-medium"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Iniciar sesión
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">¿No tienes cuenta?</span>
            </div>
          </div>

          {/* Register link */}
          <Link to="/register">
            <Button
              variant="outline"
              className="w-full border-border text-foreground hover:bg-secondary hover:text-foreground"
            >
              Crear una cuenta
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Nexus Chat — SLM powered by Hugging Face
        </p>
      </div>
    </div>
  );
}
