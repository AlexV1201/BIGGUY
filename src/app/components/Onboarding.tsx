import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { GraduationCap } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { profileAPI } from '../../utils/api';
import { toast } from 'sonner';

const CAREERS = [
  'Medicina',
  'Derecho',
  'Ingeniería',
  'Psicología',
  'Administración',
  'Contabilidad',
  'Arquitectura',
  'Enfermería',
  'Odontología',
  'Farmacia',
  'Veterinaria',
  'Educación',
  'Biología',
  'Química',
  'Física',
  'Matemáticas',
  'Ciencias de la Computación',
  'Diseño Gráfico',
  'Comunicación',
  'Marketing',
  'Economía',
  'Otro',
];

export function Onboarding() {
  const navigate = useNavigate();
  const { userId, setUser } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    career: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.career) {
      toast.error('Por favor selecciona tu carrera');
      return;
    }

    setIsSubmitting(true);

    try {
      const profile = await profileAPI.save({
        userId,
        career: formData.career,
        firstName: formData.firstName,
        lastName: formData.lastName,
        preferences: {},
      });

      setUser(profile);
      toast.success('¡Perfil configurado correctamente!');
      navigate('/');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error al guardar perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <GraduationCap className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Bienvenido a BIGGUY</CardTitle>
          <CardDescription className="text-base">
            Tu asistente de estudio personalizado con IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre (opcional)</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Juan"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido (opcional)</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Pérez"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="career">Carrera *</Label>
              <Select value={formData.career} onValueChange={(value) => setFormData({ ...formData, career: value })}>
                <SelectTrigger id="career">
                  <SelectValue placeholder="Selecciona tu carrera" />
                </SelectTrigger>
                <SelectContent>
                  {CAREERS.map((career) => (
                    <SelectItem key={career} value={career}>
                      {career}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Tu biblioteca y herramientas se personalizarán según tu carrera
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Configurando...' : 'Comenzar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
