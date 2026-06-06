import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Brain, BookOpen, FileText, Zap, GraduationCap, Layout } from "lucide-react";
import { Progress } from "./ui/progress";

export function Dashboard() {
  const studyStats = {
    hoursThisWeek: 12.5,
    filesUploaded: 8,
    flashcardsCreated: 45,
    quizzesCompleted: 6,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">BIGGUY</h1>
            </div>
            <nav className="flex gap-2">
              <Button variant="ghost" asChild>
                <Link to="/">Dashboard</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/library">Biblioteca</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/profile">Perfil</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Bienvenido de vuelta
          </h2>
          <p className="text-slate-600">
            Tu progreso esta semana
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Horas de Estudio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {studyStats.hoursThisWeek}h
              </div>
              <Progress value={62} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Archivos Subidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {studyStats.filesUploaded}
              </div>
              <Progress value={80} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Tarjetas Creadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {studyStats.flashcardsCreated}
              </div>
              <Progress value={45} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Quizzes Completados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {studyStats.quizzesCompleted}
              </div>
              <Progress value={60} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Tools Grid */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            Herramientas de Estudio
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to="/focus">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Zap className="h-6 w-6 text-purple-600" />
                    </div>
                    <CardTitle>Modo Enfoque</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Bloquea notificaciones y distracciones para estudiar sin interrupciones
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link to="/library">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle>Biblioteca</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Guarda y organiza tus materiales de estudio en un solo lugar
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link to="/ai-tools">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Brain className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle>Resúmenes IA</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Resume automáticamente tus archivos con inteligencia artificial
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link to="/flashcards">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Layout className="h-6 w-6 text-orange-600" />
                    </div>
                    <CardTitle>Tarjetas de Memoria</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Crea y estudia con tarjetas de memorización generadas automáticamente
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link to="/quiz">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <FileText className="h-6 w-6 text-pink-600" />
                    </div>
                    <CardTitle>Generador de Quiz</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Genera quizzes personalizados basados en tus materiales
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link to="/evaluations">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <GraduationCap className="h-6 w-6 text-yellow-600" />
                    </div>
                    <CardTitle>Evaluaciones</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Prepara evaluaciones completas para medir tu progreso
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
