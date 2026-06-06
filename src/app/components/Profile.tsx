import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  ArrowLeft,
  Camera,
  Save,
  Target,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  Clock,
  GraduationCap,
  User,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '../../contexts/UserContext';
import { profileAPI, supabase, Goal } from '../../utils/api';

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

export function Profile() {
  const { user, userId, setUser } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    career: user?.career || '',
    age: user?.age?.toString() || '',
    university: user?.university || '',
    weeklyStudyHours: user?.weeklyStudyHours?.toString() || '',
  });

  const [goals, setGoals] = useState<Goal[]>(user?.goals || []);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetDate: '',
  });

  // Load profile photo with signed URL
  useEffect(() => {
    const loadPhotoUrl = async () => {
      if (user?.profilePhotoUrl) {
        try {
          const { data } = await supabase.storage
            .from('make-ddf400a0-study-files')
            .createSignedUrl(user.profilePhotoUrl, 3600); // 1 hour expiry

          if (data?.signedUrl) {
            setPhotoUrl(data.signedUrl);
          }
        } catch (error) {
          console.error('Error loading photo:', error);
        }
      }
    };

    loadPhotoUrl();
  }, [user?.profilePhotoUrl]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    setIsUploadingPhoto(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/profile.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('make-ddf400a0-study-files')
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Error al subir imagen: ${uploadError.message}`);
      }

      // Store just the file path, we'll generate signed URLs when needed
      const updatedProfile = await profileAPI.save({
        ...user,
        userId,
        profilePhotoUrl: fileName, // Store path instead of full URL
      });

      setUser(updatedProfile);

      // Generate and set signed URL for immediate display
      const { data: signedData } = await supabase.storage
        .from('make-ddf400a0-study-files')
        .createSignedUrl(fileName, 3600);

      if (signedData?.signedUrl) {
        setPhotoUrl(signedData.signedUrl);
      }

      toast.success('Foto de perfil actualizada');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Error al subir la foto');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.career) {
      toast.error('La carrera es obligatoria');
      return;
    }

    setIsSaving(true);

    try {
      const updatedProfile = await profileAPI.save({
        ...user,
        userId,
        career: formData.career,
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: formData.age ? parseInt(formData.age) : undefined,
        university: formData.university,
        weeklyStudyHours: formData.weeklyStudyHours ? parseInt(formData.weeklyStudyHours) : undefined,
        goals,
        preferences: user?.preferences || {},
      });

      setUser(updatedProfile);
      setIsEditing(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error al guardar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.targetDate) {
      toast.error('El título y la fecha son obligatorios');
      return;
    }

    const goal: Goal = {
      id: `goal_${Date.now()}`,
      title: newGoal.title,
      description: newGoal.description,
      targetDate: newGoal.targetDate,
      completed: false,
      progress: 0,
    };

    setGoals([...goals, goal]);
    setNewGoal({ title: '', description: '', targetDate: '' });
    setShowAddGoal(false);
    toast.success('Meta agregada');
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter((g) => g.id !== goalId));
    toast.success('Meta eliminada');
  };

  const handleToggleGoalComplete = (goalId: string) => {
    setGoals(
      goals.map((g) =>
        g.id === goalId ? { ...g, completed: !g.completed, progress: g.completed ? 0 : 100 } : g
      )
    );
  };

  const handleUpdateGoalProgress = (goalId: string, progress: number) => {
    setGoals(goals.map((g) => (g.id === goalId ? { ...g, progress } : g)));
  };

  const getInitials = () => {
    const first = formData.firstName?.[0] || user?.firstName?.[0] || '';
    const last = formData.lastName?.[0] || user?.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <p className="text-slate-600">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Volver</span>
              </Link>
            </Button>
            <div className="flex-1 text-center">
              <h1 className="text-base font-bold text-slate-900">Mi Perfil</h1>
            </div>
            <div className="w-16 sm:w-auto">
              {!isEditing ? (
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  Editar
                </Button>
              ) : (
                <Button size="sm" onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Guardar</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Hero Profile Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 shadow-xl">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]" />
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-indigo-300/20 blur-2xl" />

          <div className="relative px-6 py-8 sm:px-10 sm:py-10 flex flex-col sm:flex-row items-center gap-6">
            {/* Highlighted Avatar */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-blue-300/50 blur-xl scale-110" />
              <div className="relative rounded-full p-1 bg-gradient-to-br from-white via-blue-100 to-blue-300 shadow-2xl ring-4 ring-white/40">
                <Avatar className="h-28 w-28 sm:h-36 sm:w-36 ring-2 ring-blue-500">
                  <AvatarImage src={photoUrl} alt={formData.firstName} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
                    {getInitials() === 'U' ? <User className="h-12 w-12" /> : getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <Button
                size="sm"
                className="absolute bottom-1 right-1 rounded-full h-9 w-9 p-0 bg-white hover:bg-blue-50 text-blue-600 shadow-lg ring-2 ring-blue-500"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
              >
                {isUploadingPhoto ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            {/* Hero Info */}
            <div className="flex-1 text-center sm:text-left text-white">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {formData.firstName || user?.firstName ? `${formData.firstName} ${formData.lastName}` : '¡Hola, estudiante!'}
              </h2>
              {formData.career && (
                <p className="mt-1 text-blue-100 flex items-center justify-center sm:justify-start gap-2">
                  <GraduationCap className="h-4 w-4" />
                  {formData.career}
                  {formData.university && <span className="opacity-80">· {formData.university}</span>}
                </p>
              )}
              <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
                {formData.weeklyStudyHours && (
                  <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-0">
                    <Clock className="h-3 w-3 mr-1" />
                    {formData.weeklyStudyHours} h/semana
                  </Badge>
                )}
                <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border-0">
                  <Target className="h-3 w-3 mr-1" />
                  {goals.filter((g) => g.completed).length}/{goals.length} metas
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Photo and Basic Info */}
        <Card className="border-blue-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Información Personal
            </CardTitle>
            <CardDescription>Tu foto y datos básicos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Basic Info */}
              <div className="flex-1 w-full space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Juan"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Pérez"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Edad</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      disabled={!isEditing}
                      placeholder="25"
                      min="16"
                      max="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weeklyHours">Horas/semana</Label>
                    <Input
                      id="weeklyHours"
                      type="number"
                      value={formData.weeklyStudyHours}
                      onChange={(e) =>
                        setFormData({ ...formData, weeklyStudyHours: e.target.value })
                      }
                      disabled={!isEditing}
                      placeholder="15"
                      min="1"
                      max="168"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Info */}
        <Card className="border-blue-100 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Información Académica
            </CardTitle>
            <CardDescription>Tu carrera y universidad</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="career">Carrera *</Label>
              <Select
                value={formData.career}
                onValueChange={(value) => setFormData({ ...formData, career: value })}
                disabled={!isEditing}
              >
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="university">Universidad</Label>
              <Input
                id="university"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                disabled={!isEditing}
                placeholder="Universidad Nacional Autónoma"
              />
            </div>
          </CardContent>
        </Card>

        {/* Goals */}
        <Card className="border-blue-100 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Mis Metas
                </CardTitle>
                <CardDescription>Objetivos de aprendizaje y fechas límite</CardDescription>
              </div>
              <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Nueva</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nueva Meta</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="goalTitle">Título *</Label>
                      <Input
                        id="goalTitle"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                        placeholder="Ej: Dominar anatomía cardiovascular"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goalDescription">Descripción</Label>
                      <Textarea
                        id="goalDescription"
                        value={newGoal.description}
                        onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                        placeholder="Detalles de tu meta..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goalDate">Fecha límite *</Label>
                      <Input
                        id="goalDate"
                        type="date"
                        value={newGoal.targetDate}
                        onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <Button onClick={handleAddGoal} className="w-full">
                      Agregar Meta
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 mb-3">No tienes metas definidas</p>
                <p className="text-sm text-slate-500 mb-4">
                  Define objetivos claros para medir tu progreso
                </p>
                <Button size="sm" variant="outline" onClick={() => setShowAddGoal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primera meta
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => {
                  const daysLeft = Math.ceil(
                    (new Date(goal.targetDate).getTime() - new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  const isOverdue = daysLeft < 0;

                  return (
                    <div
                      key={goal.id}
                      className={`border rounded-lg p-4 ${
                        goal.completed ? 'bg-green-50 border-green-200' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4
                              className={`font-semibold ${
                                goal.completed ? 'text-green-900 line-through' : 'text-slate-900'
                              }`}
                            >
                              {goal.title}
                            </h4>
                            {goal.completed && (
                              <Badge variant="default" className="text-xs">
                                Completada
                              </Badge>
                            )}
                          </div>
                          {goal.description && (
                            <p className="text-sm text-slate-600 mb-2">{goal.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(goal.targetDate).toLocaleDateString('es')}
                            </span>
                            {!goal.completed && (
                              <span
                                className={`flex items-center gap-1 ${
                                  isOverdue ? 'text-red-600' : ''
                                }`}
                              >
                                <Clock className="h-3 w-3" />
                                {isOverdue
                                  ? `${Math.abs(daysLeft)} días atrasada`
                                  : `${daysLeft} días restantes`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant={goal.completed ? 'outline' : 'default'}
                            onClick={() => handleToggleGoalComplete(goal.id)}
                            className="h-8 w-8 p-0"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {!goal.completed && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">Progreso</span>
                            <span className="font-medium">{goal.progress}%</span>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={goal.progress}
                            onChange={(e) =>
                              handleUpdateGoalProgress(goal.id, parseInt(e.target.value))
                            }
                            className="w-full h-2 accent-blue-600"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base">Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-900">
                  {goals.filter((g) => g.completed).length}
                </p>
                <p className="text-xs text-blue-700">Metas completadas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{goals.length}</p>
                <p className="text-xs text-blue-700">Metas totales</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">
                  {formData.weeklyStudyHours || 0}h
                </p>
                <p className="text-xs text-blue-700">Horas/semana</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{formData.career}</p>
                <p className="text-xs text-blue-700">Carrera</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
