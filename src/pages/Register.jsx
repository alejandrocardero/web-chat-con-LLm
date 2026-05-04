import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Loader2, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/lib/authService';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

function PasswordStrength({ password }) {
  if (!password) return null;
  
  const checks = {
    length: password.length >= 6,
    number: /\d/.test(password),
    upper: /[A-Z]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  const strength = score <= 1 ? 'weak' : score <= 2 ? 'fair' : 'good';
  const colors = { weak: 'bg-red-400', fair: 'bg-yellow-400', good: 'bg-green-400' };
  const labels = { weak: 'Débil', fair: 'Regular', good: 'Buena' };

  return (
    <div className="space-y-1 mt-1">
      <div className="flex gap-1">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= score ? colors[strength] : 'bg-muted'}`} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Seguridad: <span className="text-foreground">{labels[strength]}</span>
      </p>
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { checkAppState } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await authService.register(email, password, name);
      console.log('[Register] Success, redirecting to:', window.location.origin);
      // Direct redirect to home using absolute URL
      window.location.href = window.location.origin + '/';
    } catch (err) {
      console.error('[Register] Error:', err);
      setError(err.message || 'Error al registrar');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] md:min-h-screen flex flex-col md:items-center justify-center bg-background px-3 py-4 md:px-4 md:py-6 overflow-y-auto">
      <div className="w-full max-w-md space-y-6 md:space-y-8 my-auto">
        {/* Logo & Title */}
        <div className="text-center space-y-2 md:space-y-4">
          <div className="mx-auto h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Bot className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          </div>
          <h1 className="text-lg md:text-2xl font-bold text-foreground tracking-tight">Crear una cuenta</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Regístrate para comenzar a chatear</p>
        </div>

        {/* Register Form */}
        <div className="bg-card border border-border rounded-2xl p-3 md:p-6 space-y-3 md:space-y-5">
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs md:text-sm text-foreground">Nombre</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="bg-input border-border text-sm"
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs md:text-sm text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="bg-input border-border text-sm"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs md:text-sm text-foreground">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="bg-input border-border text-sm pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && <PasswordStrength password={password} />}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <Label htmlFor="confirm" className="text-xs md:text-sm text-foreground">Confirmar</Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className="bg-input border-border text-sm pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground p-1"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-400 mt-1">✗ Las contraseñas no coinciden</p>
              )}
              {confirmPassword && password === confirmPassword && confirmPassword.length > 0 && (
                <p className="text-xs text-green-400 mt-1">✓ Coinciden</p>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="text-xs md:text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-2 py-1.5 md:px-3 md:py-2">
                {error}
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-lg font-medium text-sm md:text-base"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Crear cuenta
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">¿Ya tienes cuenta?</span>
            </div>
          </div>

          {/* Login link */}
          <Link to="/login">
            <Button
              variant="outline"
              className="w-full border-border text-foreground hover:bg-secondary hover:text-foreground text-sm"
            >
              Iniciar sesión
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Nexus Chat — Powered by Hugging Face
        </p>
      </div>
    </div>
  );
}
