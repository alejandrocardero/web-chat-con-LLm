import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/lib/authService';
import { useAuth } from '@/lib/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

function PasswordStrength({ password }) {
  const checks = {
    length: password.length >= 6,
    number: /\d/.test(password),
    upper: /[A-Z]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  const strength = score <= 1 ? 'weak' : score <= 2 ? 'fair' : score <= 3 ? 'good' : 'strong';
  const colors = { weak: 'bg-red-400', fair: 'bg-yellow-400', good: 'bg-blue-400', strong: 'bg-green-400' };
  const labels = { weak: 'Débil', fair: 'Regular', good: 'Buena', strong: 'Fuerte' };

  return (
    <div className="space-y-2 mt-2">
      {/* Progress bars */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= score ? colors[strength] : 'bg-muted'}`}
          />
        ))}
      </div>
      {/* Strength label */}
      <p className="text-xs text-muted-foreground">
        Seguridad: <span className="text-foreground font-medium">{labels[strength]}</span>
      </p>
      {/* Simple checklist */}
      <div className="space-y-0.5 text-xs text-muted-foreground">
        <p className={checks.length ? 'text-green-400' : ''}>
          {checks.length ? '✓' : '○'} Mínimo 6 caracteres
        </p>
        <p className={checks.number ? 'text-green-400' : ''}>
          {checks.number ? '✓' : '○'} Al menos un número
        </p>
        <p className={checks.upper ? 'text-green-400' : ''}>
          {checks.upper ? '✓' : '○'} Al menos una mayúscula
        </p>
        <p className={checks.special ? 'text-green-400' : ''}>
          {checks.special ? '✓' : '○'} Al menos un símbolo
        </p>
      </div>
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">Crear una cuenta</h1>
          <p className="text-sm text-muted-foreground">Regístrate para comenzar a chatear con SLMs</p>
        </div>

        {/* Register Form */}
        <div className="bg-card border border-border rounded-2xl p-4 md:p-6 space-y-4 md:space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm text-foreground">Nombre</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="pl-10 bg-input border-border text-sm"
                  autoComplete="name"
                />
              </div>
            </div>

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
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && <PasswordStrength password={password} />}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="text-sm text-foreground">Confirmar contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-input border-border text-sm"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-400 mt-1">✗ Las contraseñas no coinciden</p>
              )}
              {confirmPassword && password === confirmPassword && confirmPassword.length > 0 && (
                <p className="text-xs text-green-400 mt-1">✓ Las contraseñas coinciden</p>
              )}
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
              className="w-full border-border text-foreground hover:bg-secondary hover:text-foreground"
            >
              Iniciar sesión
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
