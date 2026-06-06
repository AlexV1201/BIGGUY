import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { ArrowLeft, BellOff, Clock, Play, Pause, RotateCcw } from "lucide-react";
import { Progress } from "./ui/progress";

export function FocusMode() {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [notificationsBlocked, setNotificationsBlocked] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      // Play a notification sound or show alert
      alert("¡Tiempo de descanso! Has completado tu sesión de estudio.");
    }

    return () => clearInterval(interval);
  }, [isActive, time]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    setIsActive(true);
    if (notificationsBlocked) {
      // Request notification permission and block
      if ("Notification" in window) {
        Notification.requestPermission();
      }
    }
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setTime(initialTime);
  };

  const setPresetTime = (minutes: number) => {
    const seconds = minutes * 60;
    setTime(seconds);
    setInitialTime(seconds);
    setIsActive(false);
  };

  const progress = ((initialTime - time) / initialTime) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Modo Enfoque
            </h1>
            <p className="text-slate-600">
              Elimina distracciones y maximiza tu productividad
            </p>
          </div>

          {/* Timer Card */}
          <Card className="mb-6 shadow-xl">
            <CardHeader>
              <CardTitle className="text-center">Temporizador Pomodoro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="relative w-64 h-64 mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="128"
                      cy="128"
                      r="120"
                      stroke="#e2e8f0"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="128"
                      cy="128"
                      r="120"
                      stroke="#6366f1"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 120}`}
                      strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl font-bold text-slate-900">
                      {formatTime(time)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mb-6">
                  {!isActive ? (
                    <Button onClick={handleStart} size="lg" className="gap-2">
                      <Play className="h-5 w-5" />
                      Iniciar
                    </Button>
                  ) : (
                    <Button onClick={handlePause} size="lg" className="gap-2" variant="secondary">
                      <Pause className="h-5 w-5" />
                      Pausar
                    </Button>
                  )}
                  <Button onClick={handleReset} size="lg" variant="outline" className="gap-2">
                    <RotateCcw className="h-5 w-5" />
                    Reiniciar
                  </Button>
                </div>

                <div className="w-full border-t pt-4">
                  <p className="text-sm text-slate-600 mb-3">Presets de Tiempo</p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    <Button
                      onClick={() => setPresetTime(15)}
                      variant={initialTime === 15 * 60 ? "default" : "outline"}
                      size="sm"
                    >
                      15 min
                    </Button>
                    <Button
                      onClick={() => setPresetTime(25)}
                      variant={initialTime === 25 * 60 ? "default" : "outline"}
                      size="sm"
                    >
                      25 min
                    </Button>
                    <Button
                      onClick={() => setPresetTime(45)}
                      variant={initialTime === 45 * 60 ? "default" : "outline"}
                      size="sm"
                    >
                      45 min
                    </Button>
                    <Button
                      onClick={() => setPresetTime(60)}
                      variant={initialTime === 60 * 60 ? "default" : "outline"}
                      size="sm"
                    >
                      60 min
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellOff className="h-5 w-5" />
                Configuración de Bloqueo
              </CardTitle>
              <CardDescription>
                Personaliza tu experiencia de estudio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Bloquear Notificaciones</Label>
                  <p className="text-sm text-slate-500">
                    Silencia todas las notificaciones durante el modo enfoque
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsBlocked}
                  onCheckedChange={setNotificationsBlocked}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ambient">Sonido Ambiental</Label>
                  <p className="text-sm text-slate-500">
                    Reproduce sonidos relajantes de fondo
                  </p>
                </div>
                <Switch id="ambient" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="break-reminder">Recordatorio de Descanso</Label>
                  <p className="text-sm text-slate-500">
                    Recibe recordatorios para tomar descansos regulares
                  </p>
                </div>
                <Switch id="break-reminder" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 mb-1">
                  Técnica Pomodoro
                </p>
                <p className="text-sm text-blue-700">
                  Estudia por 25 minutos, luego descansa 5 minutos. Después de 4 ciclos, toma un descanso más largo de 15-30 minutos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
